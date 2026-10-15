"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Menu, Moon, Search, Sun, X } from "lucide-react";
import universe from "@/public/data/universe.json";
import { useStock } from "./StockContext";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/thesis", label: "Test a thesis" },
  { href: "/scoreboard", label: "Scoreboard" },
  { href: "/how-it-works", label: "How it works" },
];

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 text-fg" aria-label="Prove Me Wrong, home">
      <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden>
        <rect width="28" height="28" rx="8" fill="var(--primary)" />
        {/* The Lean: a balance line, evidence leaning one way, a marker at the net. */}
        <path d="M14 8.5v11" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" opacity=".55" />
        <path d="M14 14h7" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" />
        <path d="M7 14h7" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" opacity=".35" />
        <circle cx="21" cy="14" r="2.6" fill="#fff" />
      </svg>
      <span className="text-[17px] font-bold tracking-tight">Prove Me Wrong</span>
    </Link>
  );
}

export function Navbar() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-6 px-5 md:px-8">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {NAV.map(({ href, label }) => {
            const on = href === "/" ? path === "/" : path.startsWith(href);
            return (
              <Link key={href} href={href} aria-current={on ? "page" : undefined}
                className={`rounded-lg px-3 py-2 text-[15px] font-medium transition-colors ${on ? "text-primary-ink" : "text-fg-2 hover:bg-surface hover:text-fg"}`}>
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-1.5">
          <StockSearch />
          <ThemeToggle />
          <Link href="/thesis" className="ml-2 hidden h-10 items-center rounded-xl bg-primary px-4 text-[15px] font-semibold text-white transition-colors hover:bg-primary-hover sm:inline-flex">
            Test your thesis
          </Link>
          <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label="Menu"
            className="grid size-10 cursor-pointer place-items-center rounded-lg text-fg-2 hover:bg-surface md:hidden">
            {open ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
          </button>
        </div>
      </div>
      {open && (
        <nav aria-label="Mobile" className="border-t border-line px-5 py-3 md:hidden">
          {NAV.map(({ href, label }) => (
            <Link key={href} href={href} className={`block rounded-lg px-3 py-2.5 text-[16px] font-medium ${path === href ? "text-primary-ink" : "text-fg"}`}>{label}</Link>
          ))}
        </nav>
      )}
    </header>
  );
}

function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => setDark(document.documentElement.dataset.theme === "dark"), []);
  const flip = () => {
    const next = dark ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch {}
    setDark(!dark);
  };
  return (
    <button type="button" onClick={flip} aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      className="grid size-10 cursor-pointer place-items-center rounded-lg text-fg-2 transition-colors hover:bg-surface hover:text-fg">
      {dark ? <Sun size={19} aria-hidden /> : <Moon size={19} aria-hidden />}
    </button>
  );
}

// Nifty 50 typeahead in a native popover: type a name or ticker, Enter opens it in the tester.
function StockSearch() {
  const { setSym } = useStock();
  const router = useRouter();
  const path = usePathname();
  const [q, setQ] = useState("");
  const pop = useRef<HTMLDivElement>(null);
  const hits = useMemo(() => {
    const t = q.trim().toLowerCase();
    return (t ? universe.stocks.filter((s) => s.name.toLowerCase().includes(t) || s.sym.toLowerCase().includes(t)) : universe.stocks).slice(0, 8);
  }, [q]);

  const choose = (sym: string) => {
    setSym(sym);
    setQ("");
    pop.current?.hidePopover();
    if (path !== "/thesis") router.push("/thesis");
  };

  return (
    <>
      <button type="button" popoverTarget="stock-search" aria-label="Search Nifty 50 stocks"
        className="flex h-10 cursor-pointer items-center gap-2 rounded-lg border-line text-fg-2 transition-colors hover:bg-surface hover:text-fg max-lg:w-10 max-lg:justify-center lg:w-56 lg:border lg:px-3 lg:text-[14px]">
        <Search size={18} aria-hidden />
        <span className="max-lg:sr-only">Search Nifty 50…</span>
      </button>
      <div id="stock-search" ref={pop} popover="auto"
        className="fixed inset-x-0 top-20 mx-auto m-0 w-[min(440px,calc(100vw-32px))] overflow-hidden rounded-2xl border border-line bg-card p-0 text-fg shadow-card">
        <label className="flex items-center gap-3 border-b border-line px-4 py-3.5">
          <Search size={18} className="text-fg-3" aria-hidden />
          <span className="sr-only">Search Nifty 50 stocks</span>
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && hits[0]) choose(hits[0].sym); }}
            placeholder="Search by name or ticker" className="w-full bg-transparent text-[16px] placeholder:text-fg-3 focus:outline-none" />
        </label>
        <ul className="max-h-[340px] overflow-y-auto p-2">
          {hits.map((s) => (
            <li key={s.sym}>
              <button type="button" onClick={() => choose(s.sym)} className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-surface">
                <span className="min-w-0">
                  <span className="block truncate text-[15px] font-medium">{s.name}</span>
                  <span className="text-[12px] text-fg-3">{s.sym} · {s.sector}</span>
                </span>
                <span className="text-[14px] text-fg-2">₹{Math.round(s.last_close).toLocaleString("en-IN")}</span>
              </button>
            </li>
          ))}
          {!hits.length && <li className="px-3 py-3 text-[14px] text-fg-3">No Nifty 50 stock matches “{q}”.</li>}
        </ul>
      </div>
    </>
  );
}
