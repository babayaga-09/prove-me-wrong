import Link from "next/link";
import { ArrowRight, ChevronDown, TrendingDown, TrendingUp } from "lucide-react";
import { HeroCard } from "@/components/HeroCard";
import { Lean, Stamp } from "@/components/Marks";
import { DEMO_TAPES } from "@/lib/demo";
import { judge, rupees } from "@/lib/engine";
import type { Scoreboard, Stock } from "@/lib/types";
import universe from "@/public/data/universe.json";
import board from "@/public/data/scoreboard.json";
import hdfc from "@/public/data/stocks/HDFCBANK.json";

const B = board as Scoreboard;
const share = (x: number) => `${Math.round(x * 100)}%`;
const DATA_START_YEAR = 2014; // pipeline/build.py fetches prices from 2014-01-01

const HDFC_TREND = judge("trend_up", hdfc as unknown as Stock, B);

const COMPARE = [
  ["Starts from", "The stock's price", "Your own view"],
  ["Predictions", "Targets and “buy” calls", "Ranges, never tips"],
  ["Model accuracy", "Rarely shown", "Published, losses included"],
  ["When the data can't tell", "Guesses anyway", "Says “open” and why"],
];

const FAQ = [
  ["Is this investment advice?", "No. Prove Me Wrong analyses; it never tells you to buy, sell or hold, and gives no price targets. It is not registered with SEBI as a research analyst or adviser."],
  ["Where does the data come from?", "Daily closing prices for the Nifty 50 and the index, updated end of day. Every model is re-tested on years it never saw before its numbers appear here."],
  ["Why do some sentences come back “open”?", "Some claims, like “margins will recover”, need company filings and earnings calls that the price models can't read. Rather than guess, we say the question is open."],
  ["Is it free?", "Yes. No sign-up, no account. It's a portfolio project built to show honest machine learning."],
];

export default function Home() {
  const [rr, vm, rg] = B.models;
  const best = [...vm.contenders!].sort((a, b) => b.skill - a.skill)[0];
  const asOfYear = Number(B.as_of.slice(0, 4));
  const movers = [...universe.stocks].sort((a, b) => Math.abs(b.r20) - Math.abs(a.r20)).slice(0, 8);

  return (
    <>
      {/* Hero: say what it is, then show it working. */}
      <section className="mx-auto grid max-w-[1200px] items-center gap-12 px-5 pb-16 pt-14 md:px-8 lg:grid-cols-[1.05fr_1fr] lg:pt-20">
        <div>
          <h1 className="max-w-[16ch] text-[40px] font-extrabold leading-[1.08] tracking-tight text-fg md:text-[56px]">
            Think you&apos;re right about a stock? Let&apos;s check.
          </h1>
          <p className="mt-5 max-w-[52ch] text-[18px] leading-relaxed text-fg-2">
            Write your view on any Nifty 50 stock in three sentences. We test each one against real market data, tell you which parts hold up, and show exactly how often our own models are wrong.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/thesis" className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-6 text-[16px] font-semibold text-white transition-colors hover:bg-primary-hover">
              Test your thesis <ArrowRight size={18} aria-hidden />
            </Link>
            <Link href="/scoreboard" className="inline-flex h-12 items-center rounded-xl border border-line-strong px-6 text-[16px] font-semibold text-fg transition-colors hover:bg-surface">
              See our track record
            </Link>
          </div>
          <p className="mt-5 text-[14px] text-fg-3">Free · No sign-up · Never tells you to buy or sell</p>
        </div>
        <HeroCard stock={hdfc as unknown as Stock} board={B} lines={DEMO_TAPES[0].tracks} />
      </section>

      {/* Facts, all read from the data. */}
      <section aria-label="At a glance" className="border-y border-line bg-surface">
        <dl className="mx-auto grid max-w-[1200px] grid-cols-2 gap-6 px-5 py-8 md:grid-cols-4 md:px-8">
          {[
            [`${universe.stocks.length} stocks`, "the full Nifty 50"],
            [`${asOfYear - DATA_START_YEAR}+ years`, "of daily prices"],
            [`${B.models.filter((m) => m.status !== "not_built").length} models`, "each tested against a simple baseline"],
            [`${asOfYear - B.first_test_year + 1} years`, "of out-of-sample testing"],
          ].map(([v, l]) => (
            <div key={l}>
              <dt className="sr-only">{l}</dt>
              <dd><span className="block text-[28px] font-bold tracking-tight text-fg">{v}</span><span className="text-[14px] text-fg-2">{l}</span></dd>
            </div>
          ))}
        </dl>
      </section>

      {/* How it works */}
      <section aria-labelledby="how-h" className="mx-auto max-w-[1200px] px-5 py-20 md:px-8">
        <h2 id="how-h" className="text-[32px] font-bold tracking-tight md:text-[40px]">How it works</h2>
        <p className="mt-3 max-w-[56ch] text-[17px] text-fg-2">Three steps, about thirty seconds.</p>
        <ol className="mt-10 grid overflow-hidden rounded-2xl border border-line bg-card md:grid-cols-3 md:divide-x md:divide-line max-md:divide-y max-md:divide-line">
          <li className="p-6">
            <h3 className="text-[19px] font-bold tracking-tight"><span className="text-fg-3">1.</span> Write your view</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-fg-2">Pick a Nifty 50 stock and give three short reasons. Plain English is fine.</p>
            <p className="mt-5 rounded-xl border border-line-strong bg-bg px-3.5 py-3 text-[14px] text-fg">{DEMO_TAPES[0].tracks[2]}</p>
          </li>
          <li className="p-6">
            <h3 className="text-[19px] font-bold tracking-tight"><span className="text-fg-3">2.</span> We test each sentence</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-fg-2">Each one is checked against the data that can actually test it, and leans for or against.</p>
            <div className="mt-5 rounded-xl bg-surface p-3.5">
              <div className="flex items-center justify-between gap-3"><span className="text-[13px] text-fg-2">Price trend</span><Stamp kind={HDFC_TREND.kind} /></div>
              <div className="mt-3"><Lean kind={HDFC_TREND.kind} confidence="measured" /></div>
            </div>
          </li>
          <li className="p-6">
            <h3 className="text-[19px] font-bold tracking-tight"><span className="text-fg-3">3.</span> Know what would prove you wrong</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-fg-2">For every sentence you get the exact thing to watch, so you know when to rethink.</p>
            <p className="mt-5 rounded-xl bg-surface px-3.5 py-3 text-[14px] text-fg"><span className="font-semibold">You&apos;re wrong if: </span>{HDFC_TREND.tripwire}</p>
          </li>
        </ol>
      </section>

      {/* Why it's different */}
      <section aria-labelledby="diff-h" className="bg-surface py-20">
        <div className="mx-auto grid max-w-[1200px] gap-10 px-5 md:px-8 lg:grid-cols-[1fr_1.3fr] lg:items-center">
          <div>
            <h2 id="diff-h" className="text-[32px] font-bold tracking-tight md:text-[40px]">Other apps show you a stock. We test your view of it.</h2>
            <p className="mt-4 max-w-[48ch] text-[17px] text-fg-2">Most stock apps tell you what a price did and leave the thinking to you. Prove Me Wrong starts with what you believe and checks it, sentence by sentence.</p>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-line bg-card">
            <table className="w-full text-left text-[15px]">
              <thead>
                <tr className="border-b border-line text-[13px] text-fg-3">
                  <th scope="col" className="px-5 py-3.5 font-medium"><span className="sr-only">Feature</span></th>
                  <th scope="col" className="px-5 py-3.5 font-medium">Typical stock app</th>
                  <th scope="col" className="px-5 py-3.5 font-semibold text-fg">Prove Me Wrong</th>
                </tr>
              </thead>
              <tbody>
                {COMPARE.map(([f, a, b]) => (
                  <tr key={f} className="border-b border-line last:border-b-0">
                    <th scope="row" className="px-5 py-4 font-medium text-fg">{f}</th>
                    <td className="px-5 py-4 text-fg-2">{a}</td>
                    <td className="px-5 py-4 font-semibold text-fg">{b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Honest track record, losses included */}
      <section aria-labelledby="record-h" className="mx-auto max-w-[1200px] px-5 py-20 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="record-h" className="text-[32px] font-bold tracking-tight md:text-[40px]">We publish our own report card</h2>
            <p className="mt-3 max-w-[60ch] text-[17px] text-fg-2">Every model was tested on years it never saw, against a simple rule anyone could use. Here&apos;s how they did, including where they lost.</p>
          </div>
          <Link href="/scoreboard" className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-primary-ink hover:underline">Full scoreboard <ArrowRight size={16} aria-hidden /></Link>
        </div>
        <ul className="mt-10 divide-y divide-line rounded-2xl border border-line bg-card">
          <Record kind="undermined" label="Lost" title="Calling up or down" text={`Right ${share(rr.direction_hit!)} of the time, vs ${share(rr.always_up_hit!)} for just assuming “up”. So we never make these calls.`} />
          <Record kind="supported" label="Works" title="Forecasting how bumpy a stock will be" text={`${best.name} cuts forecast error by ${share(best.skill)} versus the simple rule.`} />
          <Record kind={rg.informative ? "supported" : "no_signal"} label={rg.informative ? "Works" : "Weak"} title="Reading the market mood" text={`“Stressed” days were followed by ${rg.stressed_vs_calm_vol!.toFixed(1)}× the swings of “Calm” days.`} />
          <Record kind="no_signal" label="Marginal" title="Likely price range" text={`Only ${share(rr.skill!)} better than the simple rule, and its 80% range caught ${share(rr.coverage!)} of outcomes.`} />
        </ul>
      </section>

      {/* Try a stock */}
      <section aria-labelledby="stocks-h" className="bg-surface py-20">
        <div className="mx-auto max-w-[1200px] px-5 md:px-8">
          <h2 id="stocks-h" className="text-[32px] font-bold tracking-tight md:text-[40px]">Biggest movers this month</h2>
          <p className="mt-3 text-[17px] text-fg-2">Have a view on one of these? Test it.</p>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {movers.map((s) => (
              <li key={s.sym}>
                <Link href={`/thesis?s=${encodeURIComponent(s.sym)}`} className="block rounded-2xl border border-line bg-card p-5 transition-shadow hover:shadow-card">
                  <p className="truncate text-[16px] font-semibold text-fg">{s.name}</p>
                  <p className="text-[13px] text-fg-3">{s.sector}</p>
                  <div className="mt-4 flex items-baseline justify-between">
                    <span className="text-[17px] font-semibold">{rupees(s.last_close)}</span>
                    <span className="inline-flex items-center gap-1 text-[14px] font-semibold text-fg">
                      {s.r20 >= 0 ? <TrendingUp size={15} aria-label="Up" /> : <TrendingDown size={15} aria-label="Down" />}
                      {s.r20 >= 0 ? "+" : "−"}{Math.abs((Math.exp(s.r20) - 1) * 100).toFixed(1)}% <span className="font-normal text-fg-3">1M</span>
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section aria-labelledby="faq-h" className="mx-auto max-w-[1200px] px-5 py-20 md:px-8">
        <h2 id="faq-h" className="text-[32px] font-bold tracking-tight md:text-[40px]">Questions</h2>
        <div className="mt-8 max-w-[820px] divide-y divide-line border-y border-line">
          {FAQ.map(([q, a]) => (
            <details key={q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[17px] font-semibold text-fg">
                {q}
                <ChevronDown size={20} className="shrink-0 text-fg-3 transition-transform group-open:rotate-180" aria-hidden />
              </summary>
              <p className="mt-3 text-[16px] leading-relaxed text-fg-2">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Closing call to action */}
      <section className="mx-auto max-w-[1200px] px-5 md:px-8">
        <div className="flex flex-col items-start justify-between gap-6 rounded-2xl bg-primary px-8 py-12 text-white md:flex-row md:items-center md:px-12">
          <div>
            <h2 className="text-[28px] font-bold tracking-tight md:text-[34px]">Got a view on a stock?</h2>
            <p className="mt-2 text-[17px] text-white">Find out which parts of it the data agrees with, in about thirty seconds.</p>
          </div>
          <Link href="/thesis" className="inline-flex h-12 shrink-0 items-center gap-2 rounded-xl bg-white px-6 text-[16px] font-semibold text-primary transition-colors hover:bg-white/90">
            Test your thesis <ArrowRight size={18} aria-hidden />
          </Link>
        </div>
      </section>
    </>
  );
}

function Record({ kind, label, title, text }: { kind: "supported" | "undermined" | "no_signal"; label: string; title: string; text: string }) {
  return (
    <li className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:gap-6 md:px-6">
      <span className="sm:w-[110px]"><Stamp kind={kind} label={label} /></span>
      <div>
        <p className="text-[16px] font-semibold text-fg">{title}</p>
        <p className="text-[15px] text-fg-2">{text}</p>
      </div>
    </li>
  );
}
