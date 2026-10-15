// Turns one thesis sentence + one stock's signals into a verdict. Pure functions, no React.
import type { Scoreboard, Stock } from "./types";

export type ClaimType =
  | "direction_up" | "direction_down"
  | "vol_low" | "vol_high"
  | "trend_up" | "trend_down"
  | "outperform" | "underperform"
  | "regime_calm" | "regime_stress"
  | "fundamental";

export const CLAIM_LABEL: Record<ClaimType, string> = {
  direction_up: "Price rises over the next month",
  direction_down: "Price falls over the next month",
  vol_low: "Stays steady (low volatility)",
  vol_high: "Gets bumpy (high volatility)",
  trend_up: "Is in an uptrend",
  trend_down: "Is in a downtrend",
  outperform: "Is beating the Nifty",
  underperform: "Is lagging the Nifty",
  regime_calm: "Market backdrop is calm",
  regime_stress: "Market backdrop is stressed",
  fundamental: "Business fundamentals",
};

// ponytail: keyword heuristic; the user can override it per track, and an LLM classifier can replace it once a key exists.
const RULES: [ClaimType, RegExp][] = [
  ["vol_low", /\b(stable|steady|defensive|low[- ]?vol|less volatile|calm stock|safe)\b/i],
  ["vol_high", /\b(volatile|volatility|bumpy|swing|whipsaw|risky)\b/i],
  ["underperform", /\b(underperform|lag(s|ging)?|trail(s|ing)?) (the )?(nifty|index|market)/i],
  ["outperform", /\b(outperform|beat(s|ing)?|ahead of) (the )?(nifty|index|market)/i],
  ["regime_stress", /\b(market|backdrop|macro)\b.*\b(stress|panic|fear|correction|crash|bear)/i],
  ["regime_calm", /\b(market|backdrop|macro)\b.*\b(calm|supportive|benign|risk[- ]on|bull)/i],
  ["fundamental", /\b(margin|nim|earnings|profit|revenue|sales|growth|valuation|p\/?e|cheap|expensive|deposit|loan|credit|asset quality|npa|management|guidance|order ?book|debt|dividend|capex|market share|demand)\b/i],
  ["trend_down", /\b(downtrend|falling|weak(ness)?|sell-?off|breaking down|losing momentum)\b/i],
  ["trend_up", /\b(uptrend|momentum|rally|rallying|strong run|breaking out|trending up)\b/i],
  ["direction_down", /\b(fall|drop|decline|go down|downside|lower)\b/i],
  ["direction_up", /\b(rise|go up|upside|higher|re-?rate|gain)\b/i],
];

export function classify(sentence: string): ClaimType {
  return RULES.find(([, re]) => re.test(sentence))?.[0] ?? "fundamental";
}

export type VerdictKind = "supported" | "undermined" | "no_signal";

export type Verdict = {
  kind: VerdictKind;
  why: string;            // one plain sentence
  restated?: string;      // what the evidence says instead (undermined only)
  evidence: { label: string; value: string }[];
  source: string;         // which model / data
  record: string;         // that source's track record, in words
  tripwire: string;       // Side B: what would make this sentence wrong
};

const pct = (x: number, d = 1) => `${x >= 0 ? "+" : "−"}${Math.abs(x * 100).toFixed(d)}%`;
const share = (x: number) => `${Math.round(x * 100)}%`;
const gap = (x: number) => `${Math.abs(x * 100).toFixed(1)}%`; // a distance: never signed, the words carry the direction
export const rupees = (x: number) => "₹" + x.toLocaleString("en-IN", { maximumFractionDigits: x < 100 ? 2 : 0 });

function model(board: Scoreboard, id: string) {
  const m = board.models.find((m) => m.id === id);
  if (!m) throw new Error(`scoreboard missing ${id}`);
  return m;
}

export function judge(claim: ClaimType, s: Stock, board: Scoreboard): Verdict {
  const name = s.name;
  const [p10, p50, p90] = s.range.price;
  const [q10, q50, q90] = s.range.q;
  const rr = model(board, "return_range");
  const ma200Price = s.last_close / Math.exp(s.trend.ma200);

  switch (claim) {
    case "direction_up":
    case "direction_down": {
      const up = claim === "direction_up";
      const evidence = [
        { label: "Likely range, 20 trading days", value: `${rupees(p10)} – ${rupees(p90)}` },
        { label: "Middle of range", value: `${rupees(p50)} (${pct(q50)})` },
      ];
      const record = `Direction calls hit ${share(rr.direction_hit!)} of the time, against ${share(rr.always_up_hit!)} for simply assuming "up".`;
      const source = s.range.source === "model" ? "Return-range model (LightGBM)" : "Baseline range (model lost to it)";
      const tripwire = up ? `A close below ${rupees(p10)} within a month. We expect that about 1 time in 10.` : `A close above ${rupees(p90)} within a month. We expect that about 1 time in 10.`;
      if (up ? q10 > 0 : q90 < 0)
        return { kind: "supported", why: `Even the low end of the range is ${up ? "above" : "below"} today's price.`, evidence, source, record, tripwire };
      if (up ? q90 < 0 : q10 > 0)
        return { kind: "undermined", why: `Even the ${up ? "high" : "low"} end of the range is ${up ? "below" : "above"} today's price.`,
          restated: `${name} is more likely to ${up ? "drift lower" : "drift higher"}: ${rupees(p10)} – ${rupees(p90)} over the next month.`, evidence, source, record, tripwire };
      return { kind: "no_signal", why: "The range spans both up and down, and our direction calls are not reliably better than a coin. We won't pretend otherwise.", evidence, source, record, tripwire };
    }

    case "vol_low":
    case "vol_high": {
      const low = claim === "vol_low";
      const vm = model(board, "volatility");
      const used = vm.contenders!.find((c) => c.id === s.vol.used)!;
      const rank = s.vol.pct_rank;
      const evidence = [
        { label: "Forecast volatility (annualised)", value: share(s.vol.annualised) },
        { label: "Vs its own history", value: `calmer than ${share(1 - rank)} of days` },
      ];
      const source = `Volatility forecast: ${used.name}`;
      const record = used.id === "baseline" ? "Neither model beat the simple baseline, so the baseline is used." : `${used.name} cut forecast error by ${share(used.skill)} against the naive baseline (out-of-sample).`;
      const tripwire = low ? "Forecast volatility climbing above its 60th percentile." : "Forecast volatility falling below its 40th percentile.";
      const calm = rank < 0.4, wild = rank > 0.6;
      if (low ? calm : wild) return { kind: "supported", why: `Forecast volatility sits at the ${ordinal(rank)} percentile of its own history.`, evidence, source, record, tripwire };
      if (low ? wild : calm) return { kind: "undermined", why: `Forecast volatility sits at the ${ordinal(rank)} percentile of its own history.`,
        restated: `${name} is expected to be ${low ? "bumpier" : "calmer"} than usual over the next month (${share(s.vol.annualised)} annualised).`, evidence, source, record, tripwire };
      return { kind: "no_signal", why: `Volatility is ordinary for ${name} (${ordinal(rank)} percentile), so this cuts neither way.`, evidence, source, record, tripwire };
    }

    case "trend_up":
    case "trend_down": {
      const up = claim === "trend_up";
      const evidence = [
        { label: "Last 3 months", value: pct(s.trend.r60) },
        { label: "Vs 200-day average", value: `${pct(s.trend.ma200)} (avg ${rupees(ma200Price)})` },
      ];
      const source = "Price history (fact, not a forecast)";
      const record = "Measured directly from closing prices; no model involved.";
      const tripwire = up ? `A close below the 200-day average, ${rupees(ma200Price)}.` : `A close above the 200-day average, ${rupees(ma200Price)}.`;
      const isUp = s.trend.r60 > 0 && s.trend.ma200 > 0, isDown = s.trend.r60 < 0 && s.trend.ma200 < 0;
      if (up ? isUp : isDown) return { kind: "supported", why: `${up ? "Up" : "Down"} on both counts: the 3-month move and the 200-day average agree.`, evidence, source, record, tripwire };
      if (up ? isDown : isUp) return { kind: "undermined", why: "Both the 3-month move and the 200-day average point the other way.",
        restated: `${name} is in a${up ? " downtrend" : "n uptrend"}: ${pct(s.trend.r60)} over 3 months, ${up ? "below" : "above"} its 200-day average.`, evidence, source, record, tripwire };
      return { kind: "no_signal", why: "The 3-month move and the 200-day average disagree, so there's no clean trend either way.", evidence, source, record, tripwire };
    }

    case "outperform":
    case "underperform": {
      const out = claim === "outperform";
      const rel = s.trend.rel_r20;
      const evidence = [{ label: "Vs Nifty 50, last 20 trading days", value: pct(rel) }];
      const source = "Price history vs Nifty 50 (fact)";
      const record = "Measured directly; no model involved.";
      const tripwire = out ? "Falling behind the Nifty over the next 20 trading days." : "Pulling ahead of the Nifty over the next 20 trading days.";
      if (Math.abs(rel) < 0.02) return { kind: "no_signal", why: "It's moving roughly in line with the index (within 2%).", evidence, source, record, tripwire };
      if ((rel > 0) === out) return { kind: "supported", why: `${out ? "Ahead of" : "Behind"} the Nifty by ${gap(rel)} over the last month.`, evidence, source, record, tripwire };
      return { kind: "undermined", why: `It's actually ${out ? "behind" : "ahead of"} the Nifty.`,
        restated: `${name} is ${rel > 0 ? "ahead of" : "behind"} the Nifty by ${gap(rel)} over the last month.`, evidence, source, record, tripwire };
    }

    case "regime_calm":
    case "regime_stress": {
      const calm = claim === "regime_calm";
      const rm = model(board, "regime");
      const evidence = [{ label: "Regime today", value: `${s.regime.label} since ${fmtDate(s.regime.since)}` }];
      const source = "Market-regime model (HMM)";
      const record = rm.informative
        ? `Out-of-sample, "Stressed" days were followed by ${rm.stressed_vs_calm_vol!.toFixed(1)}× the volatility of "Calm" days.`
        : "Out-of-sample, the regimes did not clearly separate future volatility, so treat this lightly.";
      const tripwire = calm ? "The regime flipping to Stressed." : "The regime settling into Calm.";
      const label = s.regime.label;
      if (label === "Choppy") return { kind: "no_signal", why: "The market is in between: Choppy, neither calm nor stressed.", evidence, source, record, tripwire };
      if ((label === "Calm") === calm) return { kind: "supported", why: `The market regime is ${label}.`, evidence, source, record, tripwire };
      return { kind: "undermined", why: `The market regime is ${label}.`, restated: `The market backdrop is ${label.toLowerCase()}, not ${calm ? "calm" : "stressed"}.`, evidence, source, record, tripwire };
    }

    case "fundamental":
      return {
        kind: "no_signal",
        why: "This is a claim about the business. Price models can't test it; it needs the filings and the earnings-call transcript.",
        evidence: [],
        source: "Researcher + Earnings Reviewer agents",
        record: "Agents aren't connected in this build, so nothing is invented here.",
        tripwire: "Write down the number that would prove this wrong (a margin, a growth rate) and check it next quarter.",
      };
  }
}

// How much to lean on a verdict, from its source's own record: measured fact > tested model > weak model > untested.
export function confidence(claim: ClaimType, board: Scoreboard): "measured" | "tested" | "weak" | "untested" {
  if (claim.startsWith("trend") || claim.endsWith("perform")) return "measured";
  if (claim.startsWith("vol")) return model(board, "volatility").contenders!.some((c) => c.skill > 0.1) ? "tested" : "weak";
  if (claim.startsWith("regime")) return model(board, "regime").informative ? "tested" : "weak";
  if (claim.startsWith("direction")) {
    const rr = model(board, "return_range");
    return rr.direction_hit! > rr.always_up_hit! ? "tested" : "weak";
  }
  return "untested";
}

function ordinal(x: number) {
  const n = Math.round(x * 100);
  const s = n % 100 >= 11 && n % 100 <= 13 ? "th" : ["th", "st", "nd", "rd"][n % 10] ?? "th";
  return `${n}${s}`;
}

export function fmtDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
