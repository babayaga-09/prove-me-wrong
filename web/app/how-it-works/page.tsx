import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "How it works · Prove Me Wrong" };

const STEPS = [
  { t: "Prices in", d: "Daily closes for the Nifty 50 and the index since 2014, pulled from Yahoo Finance by a Python pipeline. End of day, not live." },
  { t: "Models trained", d: "LightGBM quantile regression for the 20-day return range. GARCH(1,1) and an LSTM (PyTorch) competing on 20-day volatility. A 3-state hidden Markov model for the market regime." },
  { t: "Every model put on trial", d: "Walk-forward by calendar year: train on everything before, test on a year it never saw, and leave a 25-day gap so no answer leaks in. Each model is scored against a baseline a spreadsheet could compute." },
  { t: "Losers benched", d: "If a model doesn't beat its baseline, the app uses the baseline instead and the scoreboard says why. Direction calls lost, so the app never makes them." },
  { t: "Your thesis tested", d: "Each sentence is matched to the kind of claim it makes (a trend, volatility, the market backdrop, a business fundamental) and checked against the signal that can actually test it." },
  { t: "Tripwires written", d: "For every sentence, the specific thing that would prove it wrong: a price, a percentile, a regime change. That's the part worth rereading next quarter." },
];

export default function HowItWorks() {
  return (
    <div className="mx-auto max-w-[1200px] px-5 pt-10 md:px-8 md:pt-12"><div className="max-w-[880px]">
      <h1 className="font-bold tracking-tight text-[34px] md:text-[44px]">How it works</h1>
      <p className="mt-3 max-w-[62ch] text-[17px] text-fg">
        Stock apps tell you what a stock did. This one tests what <em>you</em> think, and shows exactly how often its own models are wrong.
      </p>

      <ol className="mt-8 overflow-hidden rounded-2xl border border-line bg-card">
        {STEPS.map((s, i) => (
          <li key={s.t} className="border-b border-line px-5 py-4 last:border-b-0">
            <div>
              <h2 className="text-[16px] font-semibold"><span className="text-fg-3">{i + 1}.</span> {s.t}</h2>
              <p className="mt-1 max-w-[68ch] text-[15px] leading-[26px] text-fg">{s.d}</p>
            </div>
          </li>
        ))}
      </ol>

      <section aria-labelledby="next-h" className="mt-12">
        <h2 id="next-h" className="font-bold tracking-tight border-b border-line-strong pb-2 text-[28px]">In progress</h2>
        <ul className="mt-4 space-y-3 text-[15px] text-fg">
          <li><span className="mr-1 font-semibold">Three agents:</span>a Researcher (sourced news and filings), a Model Builder (a formula-driven Excel valuation) and an Earnings Reviewer that reads each concall against your thesis. Each one cites a source and date for every claim, or says &ldquo;could not verify&rdquo;.</li>
          <li><span className="mr-1 font-semibold">Call language drift:</span>FinBERT on BSE concall transcripts, joining the evidence only after a backtest.</li>
        </ul>
      </section>

      <p className="mt-12 border-t border-line pt-4 text-[13px] text-fg-3">
        Analysis only, never investment advice. The app does not say buy, sell or hold, and does not give price targets. Built as a portfolio project by Aryan.
      </p>
      <p className="mt-6"><Link href="/thesis" className="inline-flex h-11 items-center rounded-xl bg-primary px-5 text-[15px] font-semibold text-white transition-colors hover:bg-primary-hover">Test a thesis</Link></p>
    </div></div>
  );
}
