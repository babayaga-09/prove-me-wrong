# Prove Me Wrong

Write your view on a Nifty 50 stock in three sentences. Press Play. Each sentence is marked **supported**, **undermined** (with a restated version) or **no signal**, using the one signal that can actually test it. Side B lists what would prove each sentence wrong.

The difference from a normal stock app: every model is backtested on years it never saw, against a simple baseline, and the **scoreboard** shows the result, including the losses. Direction calls lost to "assume it goes up", so the app never makes them.

## What's inside

| Layer | Tech | Out-of-sample result (2019–2026) |
|---|---|---|
| 20-day return range | LightGBM quantile regression | Barely beats its baseline (+1% pinball skill); its 80% range covers 75% |
| Direction | Middle of the range | Loses to "always up" (55% vs 57%), so it's disabled |
| 20-day volatility | GARCH(1,1) vs LSTM (PyTorch) | GARCH +28%, LSTM +25% vs trailing vol |
| Market regime | 3-state Gaussian HMM, forward-filtered | Stressed days were followed by 1.9× the volatility of Calm days |
| Concall language drift | FinBERT (planned) | Not built; shown as such |

The numbers come from `web/public/data/scoreboard.json`, which the pipeline writes. None are typed by hand.

## Run it

```bash
python -m venv .venv
.venv/Scripts/python -m pip install yfinance pandas numpy scikit-learn lightgbm arch hmmlearn
.venv/Scripts/python -m pip install torch --index-url https://download.pytorch.org/whl/cpu
.venv/Scripts/python pipeline/build.py --refresh   # ~7 min on CPU; writes web/public/data/
cd web && npm install && npm run dev
```

Logic check: `cd web && node --experimental-strip-types lib/engine.check.ts`

## Layout

- `pipeline/build.py`: fetch, features, walk-forward backtests, live forecasts, JSON output
- `web/lib/engine.ts`: sentence → claim type → verdict, restatement and tripwire
- `web/components/ThesisCheck.tsx`: the tape deck (Side A / Side B, Play, liner notes)
- `web/app/scoreboard`: every model's track record

Analysis only, not investment advice. The app does not say buy, sell or hold.
