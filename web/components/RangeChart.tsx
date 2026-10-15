import type { Stock } from "@/lib/types";
import { rupees } from "@/lib/engine";

// Last ~6 months of closes, then the next 20 trading days as a shaded range (10th–90th percentile).
export function RangeChart({ stock }: { stock: Stock }) {
  const hist = stock.history.slice(-126);
  const ahead = 20;
  const [p10, p50, p90] = stock.range.price;
  const W = 420, H = 150, padR = 64, padY = 10;
  const xs = (i: number) => (i / (hist.length - 1 + ahead)) * (W - padR);
  const lo = Math.min(p10, ...hist.map((h) => h[1]));
  const hi = Math.max(p90, ...hist.map((h) => h[1]));
  const ys = (v: number) => padY + (1 - (v - lo) / (hi - lo)) * (H - 2 * padY);
  const line = hist.map((h, i) => `${i ? "L" : "M"}${xs(i).toFixed(1)},${ys(h[1]).toFixed(1)}`).join("");
  const x0 = xs(hist.length - 1), x1 = xs(hist.length - 1 + ahead), y0 = ys(stock.last_close);
  const label = `Price over the last ${hist.length} trading days, ending at ${rupees(stock.last_close)}. Likely range in 20 trading days: ${rupees(p10)} to ${rupees(p90)}.`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={label}>
      <path d={`M${x0},${y0}L${x1},${ys(p90)}L${x1},${ys(p10)}Z`} fill="var(--surface)" stroke="var(--fg-3)" strokeWidth="1" />
      <line x1={x0} y1={y0} x2={x1} y2={ys(p50)} stroke="var(--fg-2)" strokeWidth="1.5" strokeDasharray="4 3" />
      <line x1={x0} y1={padY} x2={x0} y2={H - padY} stroke="var(--line-strong)" strokeDasharray="2 3" />
      <path d={line} fill="none" stroke="var(--fg)" strokeWidth="1.6" strokeLinejoin="round" />
      {[p90, p50, p10].map((p, i) => (
        <text key={i} x={x1 + 6} y={ys(p) + 4} fontSize="11" fill={i === 1 ? "var(--fg)" : "var(--fg-2)"}>{rupees(p)}</text>
      ))}
      <text x={x0 - 4} y={H - 2} textAnchor="end" fontSize="10" fill="var(--fg-3)">today</text>
    </svg>
  );
}
