import Link from "next/link";
import type { Scoreboard, Stock } from "@/lib/types";
import { fmtDate } from "@/lib/engine";
import { RangeChart } from "./RangeChart";

const share = (x: number) => `${Math.round(x * 100)}%`;
const signed = (x: number) => `${x >= 0 ? "+" : "−"}${Math.abs(x * 100).toFixed(1)}%`;

// The signals behind every verdict, as one statement table: signal | reading | the model's own record.
export function Signals({ stock, board }: { stock: Stock; board: Scoreboard }) {
  const [rr, vm, rg, cd] = board.models;
  const vols = vm.contenders!;

  return (
    <section aria-labelledby="signals-h" className="mt-16">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line-strong pb-3">
        <h2 id="signals-h" className="font-bold tracking-tight text-[24px]">Signals</h2>
        <p className="text-[13px] text-fg-2">
          {stock.name} · close of {fmtDate(stock.as_of)} · <Link href="/scoreboard" className="text-primary-ink underline decoration-line-strong underline-offset-4 hover:decoration-primary">how each was tested</Link>
        </p>
      </div>
      <div className="hidden grid-cols-[200px_minmax(0,1fr)_260px] gap-x-8 border-b border-line py-2.5 text-[12px] text-fg-3 lg:grid">
        <span>Signal</span><span>Reading</span><span>Model&apos;s track record</span>
      </div>
      <ol>
        <Row title="Return range" sub="Next 20 trading days" record={
          rr.beats_baseline
            ? `Beat its baseline by ${share(rr.skill!)}. Its 10–90% range caught ${share(rr.coverage!)} of outcomes (target 80%).`
            : "Lost to its baseline, so the baseline range is shown instead."
        }>
          <div className="max-w-[460px]">
            <RangeChart stock={stock} />
            <p className="mt-1 text-[12px] text-fg-2">Shaded: where 8 in 10 outcomes should land. Dashed: the middle.</p>
          </div>
        </Row>

        <Row title="Volatility" sub="Forecast, annualised" record={`Error cut vs the naive baseline, out-of-sample: ${vols.filter((c) => c.id !== "baseline").map((c) => `${c.name} ${signed(c.skill)}`).join(", ")}. The best one is used.`}>
          <dl className="max-w-[340px] text-[14px]">
            {vols.map((c) => {
              const v = stock.vol[c.id as "lstm" | "garch" | "baseline"];
              const used = stock.vol.used === c.id;
              return (
                <div key={c.id} className="flex justify-between gap-6 py-1">
                  <dt className={used ? "font-medium text-fg" : "text-fg-2"}>
                    {c.name}{used && <span className="ml-2 rounded-full bg-surface px-2 py-0.5 text-[11px] font-medium text-fg ring-1 ring-inset ring-line-strong">Used</span>}
                  </dt>
                  <dd className={used ? "font-medium text-fg" : "text-fg-2"}>{v == null ? "n/a" : share(v * Math.sqrt(252))}</dd>
                </div>
              );
            })}
          </dl>
          <p className="mt-2 text-[14px] text-fg">Calmer than {share(1 - stock.vol.pct_rank)} of {stock.name}&apos;s own history.</p>
        </Row>

        <Row title="Market regime" sub="Nifty 50, today" record={
          rg.informative
            ? `Out-of-sample, Stressed days were followed by ${rg.stressed_vs_calm_vol!.toFixed(1)}× the volatility of Calm days.`
            : "Regimes did not clearly separate future volatility out-of-sample."
        }>
          <p className="flex flex-wrap items-baseline gap-x-3">
            <span className={`font-bold tracking-tight text-[26px] text-fg`}>{stock.regime.label}</span>
            <span className="text-[13px] text-fg-2">since {fmtDate(stock.regime.since)}</span>
          </p>
          <ol className="mt-3 flex max-w-[340px] items-center gap-2 text-[13px]" aria-label="Regime scale, current marked">
            {(["Calm", "Choppy", "Stressed"] as const).map((r, i) => (
              <li key={r} aria-current={r === stock.regime.label ? "true" : undefined} className="flex items-center gap-2">
                {i > 0 && <span aria-hidden className="h-px w-6 bg-line-strong" />}
                <span className={`inline-flex items-center gap-1.5 ${r === stock.regime.label ? "font-semibold text-fg" : "text-fg-3"}`}>
                  <span aria-hidden className={`size-2 rounded-full ${r === stock.regime.label ? "bg-fg" : "border border-line-strong"}`} />{r}
                </span>
              </li>
            ))}
          </ol>
        </Row>

        <Row title="Call language drift" sub="Earnings-call tone, quarter on quarter" record={cd.note!} muted>
          <p className="text-[15px] font-medium text-fg-2">Not built yet</p>
          <p className="mt-1 max-w-[56ch] text-[14px] text-fg-2">FinBERT will score how much more hedged each concall is than the last. It joins only after it has been backtested like the others.</p>
        </Row>
      </ol>
    </section>
  );
}

function Row({ title, sub, record, muted, children }: { title: string; sub: string; record: string; muted?: boolean; children: React.ReactNode }) {
  return (
    <li className="grid gap-x-8 gap-y-3 border-b border-line py-6 lg:grid-cols-[200px_minmax(0,1fr)_260px]">
      <div>
        <h3 className={`text-[15px] font-semibold ${muted ? "text-fg-2" : "text-fg"}`}>{title}</h3>
        <p className="text-[13px] text-fg-2">{sub}</p>
      </div>
      <div className="min-w-0">{children}</div>
      <p className="text-[13px] leading-relaxed text-fg-2"><span className="text-fg lg:hidden">Track record: </span>{record}</p>
    </li>
  );
}
