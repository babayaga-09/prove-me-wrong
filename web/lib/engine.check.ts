// Run: node --experimental-strip-types lib/engine.check.ts
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { classify, judge } from "./engine.ts";

const board = JSON.parse(readFileSync(new URL("../public/data/scoreboard.json", import.meta.url), "utf8"));
const base = JSON.parse(readFileSync(new URL("../public/data/stocks/HDFCBANK.json", import.meta.url), "utf8"));
const at = (trend: object, extra: object = {}) => ({ ...base, trend: { ...base.trend, ...trend }, ...extra });

assert.equal(classify("Margins recover as deposit costs ease"), "fundamental");
assert.equal(classify("It's a steady, defensive holding"), "vol_low");
assert.equal(classify("The stock is in an uptrend"), "trend_up");
assert.equal(classify("Reliance is beating the Nifty"), "outperform");
assert.equal(classify("The market backdrop is calm and supportive"), "regime_calm");

assert.equal(judge("trend_up", at({ r60: 0.1, ma200: 0.05 }), board).kind, "supported");
assert.equal(judge("trend_up", at({ r60: -0.1, ma200: -0.05 }), board).kind, "undermined");
assert.equal(judge("trend_up", at({ r60: 0.1, ma200: -0.05 }), board).kind, "no_signal");
assert.ok(judge("trend_up", at({ r60: -0.1, ma200: -0.05 }), board).restated);
assert.equal(judge("outperform", at({ rel_r20: 0.005 }), board).kind, "no_signal");
assert.equal(judge("underperform", at({ rel_r20: -0.05 }), board).kind, "supported");
assert.equal(judge("vol_low", at({}, { vol: { ...base.vol, pct_rank: 0.2 } }), board).kind, "supported");
assert.equal(judge("vol_low", at({}, { vol: { ...base.vol, pct_rank: 0.8 } }), board).kind, "undermined");
// A range that straddles zero must never be read as a direction call.
assert.equal(judge("direction_up", at({}, { range: { ...base.range, q: [-0.05, 0.01, 0.06] } }), board).kind, "no_signal");
assert.equal(judge("fundamental", base, board).kind, "no_signal");
// A gap is a distance: the words say the direction, so no sign may contradict them.
const ahead = judge("underperform", at({ rel_r20: 0.029 }), board);
assert.equal(ahead.kind, "undermined");
assert.ok(!/[+−-]\d/.test(ahead.restated!), ahead.restated);
assert.match(ahead.restated!, /ahead of the Nifty by 2\.9%/);
assert.equal(classify("Reliance has been beating the Nifty over the last month."), "outperform");
console.log("engine checks passed");
