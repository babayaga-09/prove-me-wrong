import Link from "next/link";
import universe from "@/public/data/universe.json";
import { fmtDate } from "@/lib/engine";
import { Logo } from "./Navbar";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-surface">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-5 py-12 md:grid-cols-[1.4fr_1fr_1fr] md:px-8">
        <div>
          <Logo />
          <p className="mt-4 max-w-[42ch] text-[14px] text-fg-2">Test your view on a Nifty 50 stock against real data, and see how often our own models are wrong.</p>
          <p className="mt-3 text-[13px] text-fg-3">NSE end-of-day data to {fmtDate(universe.as_of)}.</p>
        </div>
        <nav aria-label="Product">
          <h2 className="text-[14px] font-semibold text-fg">Product</h2>
          <ul className="mt-3 space-y-2 text-[14px]">
            <li><Link href="/thesis" className="text-fg-2 hover:text-primary-ink">Test a thesis</Link></li>
            <li><Link href="/scoreboard" className="text-fg-2 hover:text-primary-ink">Scoreboard</Link></li>
            <li><Link href="/how-it-works" className="text-fg-2 hover:text-primary-ink">How it works</Link></li>
          </ul>
        </nav>
        <div>
          <h2 className="text-[14px] font-semibold text-fg">About</h2>
          <p className="mt-3 text-[14px] text-fg-2">A portfolio project by Aryan: Python ML pipeline, walk-forward backtests and a Next.js front end.</p>
        </div>
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-[1200px] px-5 py-5 text-[12px] leading-relaxed text-fg-3 md:px-8">
          Prove Me Wrong is an analysis tool, not investment advice. It never says buy, sell or hold and gives no price targets. It is not registered with SEBI as a research analyst or investment adviser. Past model accuracy does not guarantee future accuracy.
        </p>
      </div>
    </footer>
  );
}
