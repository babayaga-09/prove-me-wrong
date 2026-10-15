"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { classify, judge, rupees, fmtDate } from "@/lib/engine";
import type { Scoreboard, Stock } from "@/lib/types";
import { Stamp } from "./Marks";

// The hero demonstrates the product: a real thesis, judged by the real engine on real data, verdicts resolving in turn.
export function HeroCard({ stock, board, lines }: { stock: Stock; board: Scoreboard; lines: readonly string[] }) {
  const verdicts = lines.map((t) => judge(classify(t), stock, board));
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setShown(lines.length);
    const timers = lines.map((_, i) => setTimeout(() => setShown(i + 1), 700 + i * 650));
    return () => timers.forEach(clearTimeout);
  }, [lines]);

  return (
    <div className="rounded-2xl border border-line bg-card p-5 shadow-card sm:p-6">
      <div className="flex items-start justify-between gap-4 border-b border-line pb-4">
        <div>
          <p className="text-[17px] font-bold tracking-tight">{stock.name}</p>
          <p className="text-[13px] text-fg-3">{stock.sector} · close of {fmtDate(stock.as_of)}</p>
        </div>
        <p className="text-[17px] font-semibold">{rupees(stock.last_close)}</p>
      </div>
      <p className="mt-4 text-[13px] font-medium text-fg-2">Example thesis</p>
      <ol className="mt-2 space-y-3">
        {lines.map((t, i) => (
          <li key={i} className="flex flex-col gap-2 rounded-xl bg-surface p-3.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <p className={`text-[14px] leading-snug ${i < shown && verdicts[i].kind === "undermined" ? "struck text-fg-2" : "text-fg"}`}>{t}</p>
            <span className="min-h-[28px] shrink-0">
              {i < shown ? <Stamp kind={verdicts[i].kind} animate /> : <span className="inline-block h-[28px] w-[104px] animate-pulse rounded-full bg-line" aria-hidden />}
            </span>
          </li>
        ))}
      </ol>
      <Link href="/thesis" className="mt-4 inline-flex items-center gap-1.5 text-[14px] font-semibold text-primary-ink hover:underline">
        See why each one got its verdict <ArrowRight size={15} aria-hidden />
      </Link>
    </div>
  );
}
