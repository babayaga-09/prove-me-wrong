"""Prove Me Wrong: offline pipeline.

fetch prices -> features -> walk-forward backtests (each model vs a naive baseline) -> live forecasts -> JSON for the site.
Run:  .venv/Scripts/python pipeline/build.py [--refresh]
"""
import json
import sys
import time
import warnings
from datetime import date
from pathlib import Path

import lightgbm as lgb
import numpy as np
import pandas as pd
import torch
import yfinance as yf
from arch import arch_model
from hmmlearn.hmm import GaussianHMM
from scipy.special import logsumexp

from universe import INDEX, NIFTY50

warnings.filterwarnings("ignore")
ROOT = Path(__file__).resolve().parent.parent
CACHE = ROOT / "pipeline" / "cache"
OUT = ROOT / "web" / "public" / "data"
H = 20                      # forecast horizon (trading days ~ 1 month)
QS = (0.1, 0.5, 0.9)
L = 60                      # LSTM lookback
SEED = 7
FIRST_TEST_YEAR = 2019
FEATS = ["r5", "r20", "r60", "vol20", "vol60", "ma200", "idx_r20", "idx_vol20", "rel_r20", "vol_ratio"]
BCOLS = [f"b_q{q}" for q in QS]
REGIMES = ["Calm", "Choppy", "Stressed"]


def log(*a):
    print(time.strftime("%H:%M:%S"), *a, flush=True)


# ---------- data ----------
def fetch(refresh):
    f = CACHE / "close.pkl"
    if f.exists() and not refresh:
        return pd.read_pickle(f)
    syms = [s + ".NS" for s in NIFTY50] + [INDEX]
    close = yf.download(syms, start="2014-01-01", auto_adjust=True, progress=False)["Close"]
    close.columns = [c.removesuffix(".NS") for c in close.columns]
    close = close[close[INDEX].notna()]
    CACHE.mkdir(parents=True, exist_ok=True)
    close.to_pickle(f)
    return close


def fwd_vol(r):
    """std of r[t+1 .. t+H], aligned to t."""
    return r[::-1].rolling(H).std()[::-1].shift(-1)


def features(close, syms):
    lr = np.log(close).diff()
    idx = lr[INDEX]
    frames = []
    for s in syms:
        c, r = close[s], lr[s]
        f = pd.DataFrame({
            "r5": r.rolling(5).sum(), "r20": r.rolling(20).sum(), "r60": r.rolling(60).sum(),
            "vol20": r.rolling(20).std(), "vol60": r.rolling(60).std(),
            "ma200": np.log(c / c.rolling(200).mean()),
            "idx_r20": idx.rolling(20).sum(), "idx_vol20": idx.rolling(20).std(),
        })
        f["rel_r20"] = f.r20 - f.idx_r20
        f["vol_ratio"] = f.vol20 / f.vol60
        for q, col in zip(QS, BCOLS):   # baseline: the stock's own trailing ~2y distribution of 20d returns
            f[col] = f.r20.rolling(500, min_periods=250).quantile(q)
        f["y_ret"] = np.log(c.shift(-H) / c)
        f["y_vol"] = fwd_vol(r)
        f["sym"] = s
        frames.append(f)
    return pd.concat(frames).rename_axis("date").reset_index()


def folds(df, last_year):
    """Expanding-window walk-forward by calendar year, purged so no training target overlaps the test year."""
    for y in range(FIRST_TEST_YEAR, last_year + 1):
        start = pd.Timestamp(y, 1, 1)
        train_end = start - pd.tseries.offsets.BDay(H + 5)
        yield y, start, train_end, df[df.date < train_end], df[(df.date >= start) & (df.date < pd.Timestamp(y + 1, 1, 1))]


def wmean(rows, key):
    n = np.array([r["n"] for r in rows], float)
    v = np.array([r[key] for r in rows], float)
    return float((n * v).sum() / n.sum())


# ---------- model 1: 20-day return range (LightGBM quantile) ----------
def pinball(y, q, tau):
    d = y - q
    return float(np.mean(np.maximum(tau * d, (tau - 1) * d)))


def fit_quantiles(tr):
    tr = tr.dropna(subset=FEATS + ["y_ret"])
    return {q: lgb.LGBMRegressor(objective="quantile", alpha=q, n_estimators=300, learning_rate=0.03, num_leaves=15,
                                 min_child_samples=200, subsample=0.8, subsample_freq=1, colsample_bytree=0.8,
                                 random_state=SEED, verbose=-1).fit(tr[FEATS], tr.y_ret) for q in QS}


def predict_quantiles(m, X):
    P = np.column_stack([m[q].predict(X) for q in QS])
    P.sort(axis=1)  # forbid crossing quantiles
    return P


def eval_returns(df, last_year):
    rows = []
    for y, _, _, tr, te in folds(df, last_year):
        te = te.dropna(subset=FEATS + BCOLS + ["y_ret"])
        if len(te) < 500:
            continue
        P, B, yv = predict_quantiles(fit_quantiles(tr), te[FEATS]), te[BCOLS].to_numpy(), te.y_ret.to_numpy()
        rows.append(dict(
            year=y, n=len(te),
            model_loss=np.mean([pinball(yv, P[:, i], q) for i, q in enumerate(QS)]),
            base_loss=np.mean([pinball(yv, B[:, i], q) for i, q in enumerate(QS)]),
            model_cov=float(np.mean((yv >= P[:, 0]) & (yv <= P[:, 2]))),
            base_cov=float(np.mean((yv >= B[:, 0]) & (yv <= B[:, 2]))),
            model_dir=float(np.mean(np.sign(P[:, 1]) == np.sign(yv))),
            base_dir=float(np.mean(yv > 0)),   # "it always goes up"
            **{f"model_below_{i}": float(np.mean(yv < P[:, i])) for i in range(3)},
            **{f"base_below_{i}": float(np.mean(yv < B[:, i])) for i in range(3)},
        ))
        log(f"  returns {y}: skill {1 - rows[-1]['model_loss'] / rows[-1]['base_loss']:+.3f}  cov {rows[-1]['model_cov']:.2f}")
    return rows


# ---------- model 2: 20-day volatility (GARCH vs LSTM vs trailing vol) ----------
def garch_forecasts(lr, s, train_end, start=None):
    r = lr[s].dropna() * 100
    if (r.index < train_end).sum() < 500:
        return pd.Series(dtype=float)
    res = arch_model(r, vol="GARCH", p=1, q=1, dist="normal").fit(disp="off", last_obs=train_end)
    fc = res.forecast(horizon=H, start=start or r.index[-1], reindex=False).variance
    return np.sqrt(fc.mean(axis=1)) / 100


class VolLSTM(torch.nn.Module):
    def __init__(self):
        super().__init__()
        self.lstm = torch.nn.LSTM(3, 32, batch_first=True)
        self.head = torch.nn.Linear(32, 1)
        self.register_buffer("mu", torch.zeros(()))

    def forward(self, x):
        o, _ = self.lstm(x)
        return self.head(o[:, -1]).squeeze(-1) + self.mu


def sequences(close, syms):
    """(N, L, 3) windows of [r, |r|, index r] ending at each date, plus log forward vol targets."""
    lr = np.log(close).diff()
    idx = lr[INDEX].fillna(0)
    X, Y, D, S = [], [], [], []
    for s in syms:
        r = lr[s].dropna()
        if len(r) < L + H:
            continue
        a = np.column_stack([r, r.abs(), idx.reindex(r.index)]).astype(np.float32) * 50
        ends = np.arange(L - 1, len(a))
        X.append(np.lib.stride_tricks.sliding_window_view(a, (L, 3))[:, 0])
        Y.append(np.log(fwd_vol(r).to_numpy()[ends]))
        D.append(r.index[ends].to_numpy())
        S += [s] * len(ends)
    return np.concatenate(X), np.concatenate(Y).astype(np.float32), pd.DatetimeIndex(np.concatenate(D)), np.array(S)


def train_lstm(X, Y, epochs=4):
    torch.manual_seed(SEED)
    ok = np.isfinite(Y)
    Xt, Yt = torch.from_numpy(np.ascontiguousarray(X[ok][::2])), torch.from_numpy(Y[ok][::2])  # every 2nd day: halves CPU time, neighbours overlap anyway
    m = VolLSTM()
    m.mu.fill_(Yt.mean())
    opt = torch.optim.Adam(m.parameters(), 1e-3)
    for _ in range(epochs):
        perm = torch.randperm(len(Xt))
        for b in range(0, len(perm), 1024):
            i = perm[b:b + 1024]
            opt.zero_grad()
            loss = ((m(Xt[i]) - Yt[i]) ** 2).mean()
            loss.backward()
            opt.step()
    return m


@torch.no_grad()
def predict_lstm(m, X):
    return np.concatenate([np.exp(m(torch.from_numpy(np.ascontiguousarray(X[b:b + 4096]))).numpy())
                           for b in range(0, len(X), 4096)])


def qlike(y, f):
    ratio = (y / f) ** 2
    return float(np.mean(ratio - np.log(ratio) - 1))


def eval_vol(df, close, syms, seq, last_year):
    lr = np.log(close).diff()
    X, Y, D, S = seq
    rows = []
    for y, start, train_end, _, te in folds(df, last_year):
        te = te.dropna(subset=["vol20", "y_vol"]).set_index(["sym", "date"])
        te = te[te.y_vol > 0]
        g = {s: garch_forecasts(lr, s, train_end, start) for s in syms}
        te["garch"] = [g[s].get(d, np.nan) for s, d in te.index]
        tr_mask, te_mask = D < train_end, (D >= start) & (D < pd.Timestamp(y + 1, 1, 1))
        lstm = train_lstm(X[tr_mask], Y[tr_mask])
        te["lstm"] = pd.Series(predict_lstm(lstm, X[te_mask]), index=pd.MultiIndex.from_arrays([S[te_mask], D[te_mask]]))
        te = te.dropna(subset=["garch", "lstm"])
        yv = te.y_vol.to_numpy()
        rows.append(dict(year=y, n=len(te), base=qlike(yv, te.vol20.to_numpy()), garch=qlike(yv, te.garch.to_numpy()),
                         lstm=qlike(yv, te.lstm.to_numpy())))
        log(f"  vol {y}: qlike base {rows[-1]['base']:.3f} garch {rows[-1]['garch']:.3f} lstm {rows[-1]['lstm']:.3f}")
    return rows


# ---------- model 3: market regime (Gaussian HMM on Nifty) ----------
def regime_inputs(close):
    r = np.log(close[INDEX]).diff()
    X = pd.DataFrame({"r": r * 100, "v": r.rolling(20).std() * 100}).dropna()
    return X, fwd_vol(r), np.log(close[INDEX].shift(-H) / close[INDEX])


def fit_hmm(X):
    m = GaussianHMM(3, covariance_type="full", n_iter=200, random_state=SEED).fit(X)
    order = np.argsort(m.means_[:, 1])          # sort states by volatility -> Calm, Choppy, Stressed
    return m, {int(k): REGIMES[i] for i, k in enumerate(order)}


def filtered_states(m, X):
    """Forward-filtered state at each t using only data up to t (Viterbi would peek ahead)."""
    logB, logA = m._compute_log_likelihood(X), np.log(m.transmat_)
    a = np.empty_like(logB)
    a[0] = np.log(m.startprob_) + logB[0]
    for t in range(1, len(X)):
        a[t] = logsumexp(a[t - 1][:, None] + logA, axis=0) + logB[t]
    return a.argmax(1)


def eval_regime(close, last_year):
    X, fv, fr = regime_inputs(close)
    rows = []
    for y in range(FIRST_TEST_YEAR, last_year + 1):
        start, train_end = pd.Timestamp(y, 1, 1), pd.Timestamp(y, 1, 1) - pd.tseries.offsets.BDay(H + 5)
        m, names = fit_hmm(X[X.index < train_end].to_numpy())
        st = pd.Series(filtered_states(m, X.to_numpy()), index=X.index).map(names)
        sel = (st.index >= start) & (st.index < pd.Timestamp(y + 1, 1, 1))
        t = pd.DataFrame({"regime": st[sel], "fv": fv.reindex(st.index)[sel], "fr": fr.reindex(st.index)[sel]}).dropna()
        for name, g in t.groupby("regime"):
            rows.append(dict(year=y, regime=name, n=len(g), fwd_vol=float(g.fv.mean()), fwd_ret=float(g.fr.mean())))
    agg = pd.DataFrame(rows)
    out = []
    for name in REGIMES:
        g = agg[agg.regime == name]
        if len(g):
            n = g.n.sum()
            out.append(dict(regime=name, days=int(n), fwd_vol_ann=float((g.fwd_vol * g.n).sum() / n * np.sqrt(252)),
                            fwd_ret=float((g.fwd_ret * g.n).sum() / n)))
    return out


# ---------- assemble ----------
def scoreboard(ret_rows, vol_rows, regime_rows, as_of):
    ret_skill = 1 - wmean(ret_rows, "model_loss") / wmean(ret_rows, "base_loss")
    vol = {k: wmean(vol_rows, k) for k in ("base", "garch", "lstm")}
    calm = next((r for r in regime_rows if r["regime"] == "Calm"), None)
    stressed = next((r for r in regime_rows if r["regime"] == "Stressed"), None)
    regime_ratio = stressed["fwd_vol_ann"] / calm["fwd_vol_ann"] if calm and stressed else None
    return {
        "as_of": as_of, "horizon_days": H, "first_test_year": FIRST_TEST_YEAR,
        "method": "Expanding-window walk-forward by calendar year. Training data stops 25 trading days before each test year so no target overlaps it. Every number below is out-of-sample.",
        "models": [
            {
                "id": "return_range", "name": "20-day return range", "algo": "LightGBM quantile regression (10th / 50th / 90th pct)",
                "baseline": "The stock's own trailing 2-year spread of 20-day returns",
                "metric": "Pinball loss (lower is better); skill = 1 - model/baseline",
                "skill": ret_skill, "beats_baseline": ret_skill > 0,
                "coverage": wmean(ret_rows, "model_cov"), "baseline_coverage": wmean(ret_rows, "base_cov"), "target_coverage": 0.8,
                "direction_hit": wmean(ret_rows, "model_dir"), "always_up_hit": wmean(ret_rows, "base_dir"),
                "calibration": [{"nominal": q, "model": wmean(ret_rows, f"model_below_{i}"), "baseline": wmean(ret_rows, f"base_below_{i}")} for i, q in enumerate(QS)],
                "by_year": [{"year": r["year"], "n": r["n"], "skill": 1 - r["model_loss"] / r["base_loss"], "coverage": r["model_cov"]} for r in ret_rows],
            },
            {
                "id": "volatility", "name": "20-day volatility", "algo": "LSTM (deep learning) vs GARCH(1,1)",
                "baseline": "Last 20 days' volatility carried forward",
                "metric": "QLIKE loss (lower is better); skill = 1 - model/baseline",
                "contenders": [
                    {"id": "lstm", "name": "LSTM", "loss": vol["lstm"], "skill": 1 - vol["lstm"] / vol["base"]},
                    {"id": "garch", "name": "GARCH(1,1)", "loss": vol["garch"], "skill": 1 - vol["garch"] / vol["base"]},
                    {"id": "baseline", "name": "Trailing 20-day vol", "loss": vol["base"], "skill": 0.0},
                ],
                "by_year": [{"year": r["year"], "n": r["n"], "lstm": 1 - r["lstm"] / r["base"], "garch": 1 - r["garch"] / r["base"]} for r in vol_rows],
            },
            {
                "id": "regime", "name": "Market regime", "algo": "3-state Gaussian HMM on Nifty 50 returns and volatility, forward-filtered",
                "baseline": "No regime: every day treated alike",
                "metric": "Does the regime called today separate the NEXT 20 days? (out-of-sample)",
                "stressed_vs_calm_vol": regime_ratio, "informative": bool(regime_ratio and regime_ratio > 1.2),
                "regimes": regime_rows,
            },
            {
                "id": "call_drift", "name": "Earnings-call language drift", "algo": "FinBERT + embedding drift between consecutive concalls",
                "baseline": "None yet", "metric": "None yet", "status": "not_built",
                "note": "Needs a scraped transcript archive first. No numbers are shown until it has been backtested like the others.",
            },
        ],
    }


def live(df, close, syms, seq, board):
    """Refit on everything known and forecast from the latest date. Each stock gets the WINNING model's view."""
    as_of = df.date.max()
    train_end = as_of - pd.tseries.offsets.BDay(H + 5)
    qm = fit_quantiles(df[df.date < train_end])
    latest = df[df.date == as_of].set_index("sym")
    rr = board["models"][0]
    use_model = rr["beats_baseline"]
    P = predict_quantiles(qm, latest[FEATS].fillna(0)) if use_model else latest[BCOLS].to_numpy()

    vol_board = board["models"][1]["contenders"]
    best_vol = max(vol_board, key=lambda c: c["skill"])["id"]
    lr = np.log(close).diff()
    X, Y, D, S = seq
    lstm = train_lstm(X[D < train_end], Y[D < train_end])
    last = {s: i for i, s in enumerate(S)}   # last window per stock
    lstm_now = {s: float(v) for s, v in zip(last, predict_lstm(lstm, X[list(last.values())]))}

    rX, _, _ = regime_inputs(close)
    hm, names = fit_hmm(rX.to_numpy())
    st = pd.Series(filtered_states(hm, rX.to_numpy()), index=rX.index).map(names)
    changes = st[st != st.shift()]
    regime = {"label": st.iloc[-1], "since": changes.index[-1].strftime("%Y-%m-%d")}

    OUT.joinpath("stocks").mkdir(parents=True, exist_ok=True)
    universe = []
    for i, s in enumerate(latest.index):
        row = latest.loc[s]
        c = float(close[s].dropna().iloc[-1])
        g = garch_forecasts(lr, s, train_end)
        vols = {"baseline": float(row.vol20), "garch": float(g.iloc[-1]) if len(g) else None, "lstm": lstm_now.get(s)}
        used = best_vol if vols.get(best_vol) else "baseline"
        hist_vol = df[df.sym == s].vol20.dropna()
        hist = close[s].dropna().iloc[-260:]
        name, sector = NIFTY50[s]
        stock = {
            "sym": s, "name": name, "sector": sector, "as_of": as_of.strftime("%Y-%m-%d"), "last_close": c,
            "history": [[d.strftime("%Y-%m-%d"), round(float(v), 2)] for d, v in hist.items()],
            "range": {"source": "model" if use_model else "baseline", "q": [float(x) for x in P[i]],
                      "price": [round(c * float(np.exp(x)), 2) for x in P[i]]},
            "vol": {**vols, "used": used, "annualised": vols[used] * np.sqrt(252),
                    "pct_rank": float((hist_vol < vols[used]).mean())},
            "trend": {"r20": float(row.r20), "r60": float(row.r60), "rel_r20": float(row.rel_r20), "ma200": float(row.ma200)},
            "regime": regime,
        }
        OUT.joinpath("stocks", f"{s}.json").write_text(json.dumps(stock, separators=(",", ":")))
        universe.append({"sym": s, "name": name, "sector": sector, "last_close": c, "r20": float(row.r20)})
    return universe


def main():
    t0 = time.time()
    close = fetch("--refresh" in sys.argv)
    syms = [s for s in NIFTY50 if s in close and close[s].notna().sum() > 400]
    log(f"{len(syms)} stocks, {close.index[0].date()} -> {close.index[-1].date()}")
    df = features(close, syms)
    last_year = date.today().year
    log("return range backtest")
    ret_rows = eval_returns(df, last_year)
    log("volatility backtest")
    seq = sequences(close, syms)
    vol_rows = eval_vol(df, close, syms, seq, last_year)
    log("regime backtest")
    regime_rows = eval_regime(close, last_year)
    board = scoreboard(ret_rows, vol_rows, regime_rows, close.index[-1].strftime("%Y-%m-%d"))
    log("live forecasts")
    universe = live(df, close, syms, seq, board)
    OUT.mkdir(parents=True, exist_ok=True)
    OUT.joinpath("scoreboard.json").write_text(json.dumps(board, indent=1))
    OUT.joinpath("universe.json").write_text(json.dumps({"as_of": board["as_of"], "stocks": universe}, indent=1))
    log(f"done in {time.time() - t0:.0f}s")


if __name__ == "__main__":
    main()
