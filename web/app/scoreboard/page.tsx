import type { Metadata } from "next";
import Link from "next/link";
import board from "@/public/data/scoreboard.json";
import type { Model, Scoreboard } from "@/lib/types";
import { fmtDate } from "@/lib/engine";
import { Stamp } from "@/components/Marks";

export const metadata: Metadata = { title: "Scoreboard · Prove Me Wrong" };

const B = board as Scoreboard;
const share = (x: number) => `${(x * 100).toFixed(1)}%`;
const signed = (x: number) => `${x >= 0 ? "+" : "−"}${Math.abs(x * 100).toFixed(1)}%`;

export default function ScoreboardPage() {
  const [rr, vm, rg, cd] = B.models;
  const vols = vm.contenders!;
  const best = [...vols].sort((a, b) => b.skill - a.skill)[0];
  const lstm = vols.find((c) => c.id === "lstm")!;
  const marginal = rr.skill! < 0.03;

  return (
    <div className="mx-auto max-w-[1200px] px-5 pt-10 md:px-8 md:pt-12">
      <header className="border-b border-line-strong pb-6">
        <h1 className="font-bold tracking-tight text-[34px] md:text-[44px]">The scoreboard</h1>
        <p className="mt-3 max-w-[64ch] text-[17px] text-fg">
          Every model behind a verdict was tested on years it never saw, against a simple baseline anyone could compute.
          When a model loses, this page says so and the app stops using it.
        </p>
        <p className="mt-3 max-w-[72ch] text-[13px] text-fg-2">{B.method} Test years {B.first_test_year}–{B.as_of.slice(0, 4)}, Nifty 50 stocks, data to {fmtDate(B.as_of)}.</p>
      </header>

      {/* The honest summary first: one line per model. */}
      <section aria-labelledby="sum-h" className="mt-8 overflow-hidden rounded-2xl border border-line bg-card">
        <h2 id="sum-h" className="font-bold tracking-tight border-b border-line-strong px-5 py-3 text-[24px]">Summary</h2>
        <ol>
          <SummaryRow kind={marginal ? "no_signal" : "supported"} label={marginal ? "Marginal" : "Beats baseline"}
            text={`Return range: ${signed(rr.skill!)} better than the baseline, but its 80% range only caught ${share(rr.coverage!)} of outcomes.`} />
          <SummaryRow kind="undermined" label="Loses"
            text={`Up-or-down calls: right ${share(rr.direction_hit!)} of the time. Just assuming "up" was right ${share(rr.always_up_hit!)}. So the app never makes direction calls.`} />
          <SummaryRow kind="supported" label="Beats baseline"
            text={`Volatility: ${best.name} cuts forecast error by ${share(best.skill)}. The LSTM (deep learning) manages ${share(lstm.skill)}, ${lstm.id === best.id ? "the best of the lot" : "good, but the 1986 model still wins"}.`} />
          <SummaryRow kind={rg.informative ? "supported" : "no_signal"} label={rg.informative ? "Informative" : "Weak"}
            text={`Market regime: days called "Stressed" were followed by ${rg.stressed_vs_calm_vol!.toFixed(1)}× the volatility of "Calm" days.`} />
          <SummaryRow kind="no_signal" label="Not built" text={`${cd.name}: ${cd.note}`} />
        </ol>
      </section>

      <ModelSection m={rr} verdict={marginal ? { kind: "no_signal", label: "Marginal" } : { kind: "supported", label: "Beats baseline" }}>
        <div className="grid gap-8 md:grid-cols-2">
          <Table rows={[
            ["Pinball loss skill vs baseline", signed(rr.skill!), "—"],
            ["10–90% range caught the outcome", share(rr.coverage!), share(rr.baseline_coverage!)],
            ["Direction right", share(rr.direction_hit!), `${share(rr.always_up_hit!)} (always "up")`],
          ]} head={["Measure", "Model", "Baseline"]} />
          <Calibration points={rr.calibration!} />
        </div>
        <YearBars title="Skill by test year" rows={rr.by_year!.map((r) => ({ year: r.year, v: r.skill }))} />
      </ModelSection>

      <ModelSection m={vm} verdict={{ kind: "supported", label: "Beats baseline" }}>
        <Table head={["Contender", "QLIKE loss", "Skill vs baseline"]} rows={vols.map((c) => [c.name, c.loss.toFixed(3), c.id === "baseline" ? "—" : signed(c.skill)])} />
        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <YearBars title="LSTM skill by year" rows={vm.by_year!.map((r) => ({ year: r.year, v: r.lstm }))} />
          <YearBars title="GARCH skill by year" rows={vm.by_year!.map((r) => ({ year: r.year, v: r.garch }))} />
        </div>
      </ModelSection>

      <ModelSection m={rg} verdict={rg.informative ? { kind: "supported", label: "Informative" } : { kind: "no_signal", label: "Weak" }}>
        <Table head={["Regime called", "Days (test years)", "Next 20 days: volatility", "Next 20 days: Nifty return"]}
          rows={rg.regimes!.map((r) => [r.regime, r.days.toLocaleString("en-IN"), share(r.fwd_vol_ann), signed(r.fwd_ret)])} />
        <p className="mt-3 max-w-[70ch] text-[13px] text-fg-2">The regime separates future <em>volatility</em> cleanly. It does not reliably separate future <em>returns</em>, so the app uses it only for claims about the market backdrop.</p>
      </ModelSection>

      <ModelSection m={cd} muted verdict={{ kind: "no_signal", label: "Not built" }}>
        <p className="max-w-[70ch] text-[15px] text-fg-3">{cd.note} The plan: scrape BSE concall PDFs, score each call with FinBERT, measure how far its language drifts from the previous quarter, then test whether drift predicts the next quarter&apos;s surprise.</p>
      </ModelSection>

      <div className="mt-14 flex flex-wrap items-center gap-4">
        <p className="text-[16px] text-fg">Want to see what these models say about your view?</p>
        <Link href="/thesis" className="inline-flex h-11 items-center rounded-xl bg-primary px-5 text-[15px] font-semibold text-white transition-colors hover:bg-primary-hover">Test a thesis</Link>
      </div>
    </div>
  );
}

function SummaryRow({ kind, label, text }: { kind: "supported" | "undermined" | "no_signal"; label: string; text: string }) {
  return (
    <li className="flex flex-col gap-2 border-b border-line px-5 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <p className="text-[15px] leading-[26px] text-fg">{text}</p>
      <span className="shrink-0"><Stamp kind={kind} label={label} animate={false} /></span>
    </li>
  );
}

type Verdict = { kind: "supported" | "undermined" | "no_signal"; label: string };

function ModelSection({ m, muted, verdict, children }: { m: Model; muted?: boolean; verdict: Verdict; children: React.ReactNode }) {
  return (
    <section aria-labelledby={`m-${m.id}`} className="mt-14">
      <div className="border-b border-line-strong pb-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <h2 id={`m-${m.id}`} className={`text-[30px] font-bold tracking-tight ${muted ? "text-fg-2" : ""}`}>{m.name}</h2>
          <Stamp kind={verdict.kind} label={verdict.label} />
        </div>
        <dl className="mt-2 grid gap-x-8 gap-y-1 text-[13px] sm:grid-cols-[auto_minmax(0,1fr)]">
          <dt className="text-fg-3">Model</dt><dd className="text-fg">{m.algo}</dd>
          <dt className="text-fg-3">Baseline</dt><dd className="text-fg">{m.baseline === "-" ? "None yet" : m.baseline}</dd>
          <dt className="text-fg-3">Scored by</dt><dd className="text-fg">{m.metric === "-" ? "None yet" : m.metric}</dd>
        </dl>
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Table({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[14px]">
        <thead>
          <tr className="border-b border-line-strong text-left">
            {head.map((h, i) => <th key={h} scope="col" className={`py-2 pr-4 text-[12px] text-fg-3 ${i ? "text-right" : ""}`}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r[0]} className="border-b border-line">
              {r.map((c, i) => i === 0
                ? <th key={i} scope="row" className="py-2.5 pr-4 text-left font-normal text-fg">{c}</th>
                : <td key={i} className="py-2.5 pr-4 text-right text-fg">{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Nominal quantile vs how often outcomes actually fell below it. On the diagonal = honest.
function Calibration({ points }: { points: { nominal: number; model: number; baseline: number }[] }) {
  const S = 280, p = 30, sc = (v: number) => p + v * (S - 2 * p);
  return (
    <figure>
      <svg viewBox={`0 0 ${S} ${S}`} className="w-full max-w-[340px]" role="img" aria-label={`Calibration: ${points.map((q) => `${q.nominal * 100}th percentile, outcomes fell below ${Math.round(q.model * 100)}% of the time for the model and ${Math.round(q.baseline * 100)}% for the baseline`).join("; ")}.`}>
        <rect x={p} y={p} width={S - 2 * p} height={S - 2 * p} fill="none" stroke="var(--line)" />
        <line x1={sc(0)} y1={S - sc(0)} x2={sc(1)} y2={S - sc(1)} stroke="var(--line-strong)" strokeDasharray="3 3" />
        {points.map((q) => (
          <g key={q.nominal}>
            <rect x={sc(q.nominal) + 3} y={S - sc(q.baseline) - 4.5} width="9" height="9" fill="none" stroke="var(--fg-3)" strokeWidth="1.5" />
            <circle cx={sc(q.nominal) - 6} cy={S - sc(q.model)} r="5" fill="var(--fg)" />
          </g>
        ))}
        {[0.1, 0.5, 0.9].map((t) => <text key={t} x={sc(t)} y={S - 8} textAnchor="middle" fontSize="10" fill="var(--fg-3)">{t * 100}th</text>)}
      </svg>
      <figcaption className="mt-2 text-[12px] text-fg-2">
        <svg width="10" height="10" viewBox="0 0 10 10" className="mr-1 inline align-baseline" aria-hidden><circle cx="5" cy="5" r="4.5" fill="var(--fg)" /></svg>model · <svg width="10" height="10" viewBox="0 0 10 10" className="mr-1 inline align-baseline" aria-hidden><rect x="1" y="1" width="8" height="8" fill="none" stroke="var(--fg-3)" strokeWidth="1.5" /></svg>baseline (drawn side by side at each percentile). On the dashed line means the quantiles are honest: the 10th percentile should be undercut 10% of the time.
      </figcaption>
    </figure>
  );
}

function YearBars({ title, rows }: { title: string; rows: { year: number; v: number }[] }) {
  const max = Math.max(0.05, ...rows.map((r) => Math.abs(r.v)));
  return (
    <figure className="mt-8">
      <figcaption className="mb-3 text-[12px] text-fg-3">{title} (right of the line = beats baseline)</figcaption>
      <ul className="space-y-1.5">
        {rows.map((r) => (
          <li key={r.year} className="grid grid-cols-[44px_minmax(0,1fr)_64px] items-center gap-3 text-[13px]">
            <span className="text-fg-2">{r.year}</span>
            <span className="relative h-3">
              <span className="absolute inset-y-[-3px] left-1/2 border-l border-line-strong" />
              <span className={`absolute top-0 h-full ${r.v >= 0 ? "left-1/2 bg-fg-2" : "right-1/2 bg-against"}`} style={{ width: `${(Math.abs(r.v) / max) * 50}%` }} />
            </span>
            <span className={`text-right ${r.v >= 0 ? "text-fg" : "text-against"}`}>{signed(r.v)}</span>
          </li>
        ))}
      </ul>
    </figure>
  );
}
