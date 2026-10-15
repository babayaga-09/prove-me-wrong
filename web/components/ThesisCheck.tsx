"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ChevronDown, Loader2, Pencil } from "lucide-react";
import { CLAIM_LABEL, classify, confidence, fmtDate, judge, rupees, type ClaimType, type Verdict } from "@/lib/engine";
import { DEMO_TAPES, TRACK_LIMIT } from "@/lib/demo";
import type { Scoreboard, Stock, UniverseRow } from "@/lib/types";
import { Lean, Mark, Stamp, VERDICT_TONE, VERDICT_WORD } from "./Marks";
import { Signals } from "./Signals";
import { useStock } from "./StockContext";

type Phase = "edit" | "testing" | "done";
const STEP_MS = 520;
// Lowercase the first letter only, so proper nouns (Nifty) keep their capital.
const sentenceCase = (s: string) => s[0].toLowerCase() + s.slice(1);
const CONF_TEXT = { measured: "measured from price data", tested: "from a backtested model", weak: "from a weak model", untested: "needs company filings to test" } as const;
const PLACEHOLDERS = ["Your first reason, e.g. “Margins recover as deposit costs ease.”", "A second reason you hold this view…", "And a third…"];

export function ThesisCheck({ universe, board, initial }: { universe: UniverseRow[]; board: Scoreboard; initial: Stock }) {
  const [stock, setStock] = useState<Stock>(initial);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [lines, setLines] = useState<string[]>([...DEMO_TAPES[0].tracks]);
  const [overrides, setOverrides] = useState<(ClaimType | null)[]>([null, null, null]);
  const [phase, setPhase] = useState<Phase>("edit");
  const [revealed, setRevealed] = useState(0);
  const [tab, setTab] = useState<"thesis" | "wrong">("thesis");
  const [selected, setSelected] = useState(0);
  const { sym, setSym, setName } = useStock();

  const claims = lines.map((t, i) => overrides[i] ?? classify(t));
  const verdicts: Verdict[] = useMemo(() => claims.map((c) => judge(c, stock, board)), [claims.join(), stock, board]); // eslint-disable-line react-hooks/exhaustive-deps
  const filled = lines.filter((t) => t.trim()).length;

  function pickStock(next: string, nextLines?: string[]) {
    setPhase("edit");
    setRevealed(0);
    if (nextLines) {
      setLines(nextLines);
      setOverrides([null, null, null]);
    }
    setSym(next);
  }

  // The rail's search and this page's picker both set the shared symbol; load its data here.
  useEffect(() => {
    if (sym === stock.sym) return;
    let live = true;
    setLoading(true);
    setLoadError(null);
    setPhase("edit");
    setRevealed(0);
    fetch(`/data/stocks/${encodeURIComponent(sym)}.json`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((s: Stock) => { if (live) setStock(s); })
      .catch(() => { if (live) setLoadError("Couldn't load that stock's data. Check your connection and choose it again."); })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [sym, stock.sym]);

  useEffect(() => setName(stock.name), [stock.name, setName]);

  // Deep link: /thesis?s=INFY opens that stock (home-page stock cards use this).
  useEffect(() => {
    const s = new URLSearchParams(window.location.search).get("s");
    if (!s || !universe.some((u) => u.sym === s)) return;
    // Arriving for a specific stock: its example if we have one, otherwise a blank thesis, never another stock's view.
    setLines([...(DEMO_TAPES.find((d) => d.sym === s)?.tracks ?? ["", "", ""])]);
    setOverrides([null, null, null]);
    setSym(s);
  }, [universe, setSym]);

  function test() {
    if (!filled) return;
    setTab("thesis");
    setSelected(0);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setRevealed(3);
      setPhase("done");
      return;
    }
    setRevealed(0);
    setPhase("testing");
  }

  // The statement resolves line by line, top to bottom.
  useEffect(() => {
    if (phase !== "testing") return;
    if (revealed >= 3) {
      setPhase("done");
      return;
    }
    const t = setTimeout(() => {
      setRevealed((r) => r + 1);
      setSelected(revealed);
    }, revealed === 0 ? 250 : STEP_MS);
    return () => clearTimeout(t);
  }, [phase, revealed]);

  const editLine = (i: number, v: string) => {
    setLines((t) => t.map((x, j) => (j === i ? v.slice(0, TRACK_LIMIT) : x)));
    if (phase !== "edit") setPhase("edit");
  };

  const sel = verdicts[selected];
  const shown = phase !== "edit" && selected < revealed;
  const sectors = useMemo(() => {
    const m = new Map<string, UniverseRow[]>();
    universe.forEach((u) => m.set(u.sector, [...(m.get(u.sector) ?? []), u]));
    return [...m.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [universe]);

  return (
    <div className="mx-auto max-w-[1200px] px-5 pt-10 md:px-8 md:pt-12">
      <header className="flex flex-wrap items-end gap-x-6 gap-y-5">
        <div className="min-w-0 basis-full md:basis-auto md:flex-1">
          <h1 className="font-bold tracking-tight text-[32px] leading-tight text-fg md:text-[40px]">{stock.name}</h1>
          <p className="mt-1.5 text-[14px] text-fg-2">
            {stock.sector} · <span className="text-fg">{rupees(stock.last_close)}</span> · close of {fmtDate(stock.as_of)}
          </p>
        </div>

        <label className="block min-w-0 flex-1 md:flex-none">
          <span className="mb-1.5 block text-[13px] text-fg-2">Stock</span>
          <span className="relative block">
            <select
              value={sym}
              onChange={(e) => pickStock(e.target.value)}
              className="h-11 w-full cursor-pointer appearance-none rounded-xl border border-line-strong bg-card pl-3 pr-9 text-[15px] text-fg transition-colors hover:border-fg-3 md:w-64"
            >
              {sectors.map(([sector, rows]) => (
                <optgroup key={sector} label={sector}>
                  {rows.map((u) => <option key={u.sym} value={u.sym}>{u.name}</option>)}
                </optgroup>
              ))}
            </select>
            <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-fg-2" aria-hidden />
          </span>
        </label>

        <button
          type="button"
          onClick={test}
          disabled={!filled || loading || phase === "testing"}
          className="inline-flex h-11 shrink-0 cursor-pointer items-center gap-2 rounded-xl bg-primary px-5 text-[15px] font-medium text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-primary/50"
        >
          {phase === "testing" || loading ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <ArrowRight size={16} aria-hidden />}
          {phase === "testing" ? "Testing…" : phase === "done" ? "Test again" : "Test my thesis"}
        </button>
      </header>

      <p className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[14px]">
        <span className="text-fg-2">Try an example:</span>
        {DEMO_TAPES.map((d) => (
          <button
            key={d.sym}
            type="button"
            onClick={() => pickStock(d.sym, [...d.tracks])}
            className="cursor-pointer text-fg underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-primary"
          >
            {d.title} <span className="text-fg-2">({universe.find((u) => u.sym === d.sym)?.name ?? d.sym})</span>
          </button>
        ))}
      </p>
      {loadError && <p role="alert" className="mt-3 text-[14px] text-against">{loadError}</p>}

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section aria-label="Your thesis" className="min-w-0">
          <div role="tablist" aria-label="View" className="flex gap-6 border-b border-line">
            {([["thesis", "Your thesis"], ["wrong", "What would prove me wrong"]] as const).map(([id, label]) => (
              <button
                key={id}
                role="tab"
                aria-selected={tab === id}
                onClick={() => setTab(id)}
                className={`-mb-px cursor-pointer border-b-2 pb-2.5 text-[14px] font-medium transition-colors ${tab === id ? "border-primary text-fg" : "border-transparent text-fg-2 hover:text-fg"}`}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === "thesis" ? (
            <>
              <div className="hidden grid-cols-[32px_minmax(0,1fr)_170px_128px] gap-x-5 border-b border-line py-2.5 text-[12px] text-fg-3 sm:grid">
                <span>#</span><span>Your sentence</span><span>Lean</span><span className="text-right">Verdict</span>
              </div>
              <ol>
                {lines.map((t, i) => {
                  const v = verdicts[i];
                  const done = phase !== "edit" && i < revealed;
                  const conf = confidence(claims[i], board);
                  return (
                    <li
                      key={i}
                      onClick={() => phase !== "edit" && setSelected(i)}
                      className={`grid grid-cols-[32px_minmax(0,1fr)] gap-x-5 gap-y-3 border-b border-line px-1 py-5 transition-colors sm:grid-cols-[32px_minmax(0,1fr)_170px_128px] ${phase !== "edit" ? "cursor-pointer hover:bg-surface" : ""} ${selected === i && phase !== "edit" ? "bg-primary-soft/50 hover:bg-primary-soft/50" : ""}`}
                    >
                      <span className="pt-0.5 text-[14px] text-fg-3">{i + 1}</span>
                      <div className="min-w-0">
                        {phase === "edit" ? (
                          <>
                            <label htmlFor={`line-${i}`} className="sr-only">Sentence {i + 1}</label>
                            <textarea
                              id={`line-${i}`}
                              value={t}
                              rows={1}
                              maxLength={TRACK_LIMIT}
                              placeholder={PLACEHOLDERS[i]}
                              onChange={(e) => editLine(i, e.target.value)}
                              className="block w-full resize-none overflow-hidden rounded-md border border-transparent bg-transparent px-2 py-1 -mx-2 text-[16px] leading-[26px] text-fg [field-sizing:content] placeholder:text-fg-3 hover:border-line focus:border-line-strong focus:bg-card focus:outline-none"
                            />
                            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 text-[12px] text-fg-2">
                              <label className="inline-flex items-center gap-1.5 whitespace-nowrap">
                                Tested as
                                <span className="relative">
                                  <select
                                    value={claims[i]}
                                    onChange={(e) => setOverrides((o) => o.map((x, j) => (j === i ? (e.target.value as ClaimType) : x)))}
                                    className="cursor-pointer appearance-none bg-transparent pr-4 text-[12px] font-medium text-fg underline decoration-line-strong underline-offset-4 hover:decoration-primary"
                                  >
                                    {Object.entries(CLAIM_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                                  </select>
                                  <ChevronDown size={12} className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2" aria-hidden />
                                </span>
                              </label>
                              <span className="text-fg-3">{t.length}/{TRACK_LIMIT}</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <p className={`text-[16px] leading-[26px] ${done && v.kind === "undermined" ? "struck text-fg-2" : "text-fg"}`}>{t || <span className="text-fg-3">(empty)</span>}</p>
                            {done && v.restated && (
                              <p className="resolve mt-1.5 text-[14px] leading-[22px] text-against">
                                <span className="font-semibold">Evidence says: </span>{v.restated}
                              </p>
                            )}
                            <p className="mt-1.5 text-[12px] text-fg-2">
                              Tested as {sentenceCase(CLAIM_LABEL[claims[i]])}
                              {done && <> · {CONF_TEXT[conf]}</>}
                            </p>
                          </>
                        )}
                      </div>
                      <div className="col-start-2 max-sm:order-last sm:col-start-3 sm:pt-1.5">
                        {done ? <Lean kind={v.kind} confidence={conf} animate={phase === "testing"} /> : <span className="hidden text-[13px] text-fg-3 sm:inline">—</span>}
                      </div>
                      <div className="col-start-2 sm:col-start-4 sm:justify-self-end">
                        {done ? <Stamp kind={v.kind} animate={phase === "testing"} /> : <span className="hidden text-[13px] text-fg-3 sm:inline">Not tested</span>}
                      </div>
                    </li>
                  );
                })}
              </ol>
              {phase === "done" && (
                <div className="double-rule mt-0.5 flex flex-wrap items-center gap-x-6 gap-y-2 px-1 py-4">
                  <span className="text-[13px] font-medium text-fg">Net position</span>
                  <Tally verdicts={verdicts} />
                  <button type="button" onClick={() => setPhase("edit")} className="ml-auto inline-flex cursor-pointer items-center gap-1.5 text-[14px] text-fg underline decoration-line-strong underline-offset-4 hover:decoration-primary">
                    <Pencil size={14} aria-hidden /> Edit sentences
                  </button>
                </div>
              )}
            </>
          ) : (
            <ol>
              {lines.map((t, i) => (
                <li key={i} className="grid grid-cols-[32px_minmax(0,1fr)] gap-x-5 border-b border-line px-1 py-5">
                  <span className="pt-0.5 text-[14px] text-fg-3">{i + 1}</span>
                  <div>
                    <p className="text-[13px] text-fg-2">If you believe “{t.trim() || "…"}”</p>
                    <p className="mt-1.5 text-[16px] leading-[26px] text-fg"><span className="font-semibold">You&apos;re wrong if: </span>{verdicts[i].tripwire}</p>
                  </div>
                </li>
              ))}
              <li className="px-1 py-4 text-[13px] text-fg-2">Check these when the next results come out. If one trips, rewrite that sentence.</li>
            </ol>
          )}
        </section>

        <aside aria-label={shown ? `Evidence for sentence ${selected + 1}` : "How verdicts work"} aria-live="polite" className="self-start rounded-2xl border border-line bg-surface p-6">
          {shown ? (
            <div>
              <h2 className={`flex items-center gap-2 text-[20px] font-semibold ${VERDICT_TONE[sel.kind]}`}>
                <Mark kind={sel.kind} size={20} /> {VERDICT_WORD[sel.kind]}
                <span className="text-[14px] font-normal text-fg-3">· sentence {selected + 1}</span>
              </h2>
              <p className="mt-2 text-[15px] leading-relaxed text-fg">{sel.why}</p>
              {sel.evidence.length > 0 && (
                <dl className="mt-5 border-t border-line">
                  {sel.evidence.map((e) => (
                    <div key={e.label} className="flex items-baseline justify-between gap-4 border-b border-line py-2.5">
                      <dt className="text-[13px] text-fg-2">{e.label}</dt>
                      <dd className="text-right text-[14px] font-medium text-fg">{e.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
              <dl className="mt-5 space-y-3 text-[13px] leading-relaxed">
                <div><dt className="text-fg-3">Source</dt><dd className="text-fg">{sel.source}</dd></div>
                <div>
                  <dt className="text-fg-3">Source&apos;s track record</dt>
                  <dd className="text-fg">{sel.record} <Link href="/scoreboard" className="whitespace-nowrap text-primary-ink underline decoration-line-strong underline-offset-4 hover:decoration-primary">See the scoreboard</Link></dd>
                </div>
              </dl>
            </div>
          ) : (
            <div className="text-[14px] leading-relaxed text-fg">
              <h2 className="text-[17px] font-semibold">How verdicts work</h2>
              <p className="mt-2">{phase === "testing" ? "Checking each sentence against the data…" : "Write your view as three short sentences, then test it. Each one gets a verdict, a lean and the evidence behind it."}</p>
              <ul className="mt-5 space-y-3">
                {(["supported", "undermined", "no_signal"] as const).map((k) => (
                  <li key={k} className="flex items-start gap-3">
                    <Stamp kind={k} />
                    <span className="pt-0.5 text-[13px] text-fg-2">
                      {k === "supported" ? "The evidence agrees." : k === "undermined" ? "The evidence disagrees; you see what it says instead." : "Nothing we measure can settle it, and we say so."}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <p className="mt-6 border-t border-line pt-4 text-[12px] text-fg-3">Analysis only, not investment advice. Nothing here says buy or sell.</p>
        </aside>
      </div>

      <Signals stock={stock} board={board} />
    </div>
  );
}

function Tally({ verdicts }: { verdicts: Verdict[] }) {
  const n = (k: Verdict["kind"]) => verdicts.filter((v) => v.kind === k).length;
  return (
    <p className="flex flex-wrap gap-x-4 gap-y-1 text-[14px]">
      <span className="whitespace-nowrap text-for">{n("supported")} supported</span>
      <span className="whitespace-nowrap text-against">{n("undermined")} undermined</span>
      <span className="whitespace-nowrap text-fg-2">{n("no_signal")} open</span>
    </p>
  );
}
