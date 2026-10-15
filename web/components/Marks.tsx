import { Check, Minus, X } from "lucide-react";
import type { VerdictKind } from "@/lib/engine";

export const VERDICT_WORD: Record<VerdictKind, string> = {
  supported: "Supported",
  undermined: "Undermined",
  no_signal: "Open",
};

const STYLE: Record<VerdictKind, { chip: string; text: string; icon: typeof Check }> = {
  supported: { chip: "bg-for-wash text-for", text: "text-for", icon: Check },
  undermined: { chip: "bg-against-wash text-against", text: "text-against", icon: X },
  no_signal: { chip: "bg-open-wash text-fg-2", text: "text-fg-2", icon: Minus },
};

export const VERDICT_TONE: Record<VerdictKind, string> = {
  supported: STYLE.supported.text,
  undermined: STYLE.undermined.text,
  no_signal: STYLE.no_signal.text,
};

export function Mark({ kind, size = 16 }: { kind: VerdictKind; size?: number }) {
  const Icon = STYLE[kind].icon;
  return <Icon size={size} strokeWidth={2.25} aria-hidden />;
}

// Verdict chip: icon + word, never colour alone.
export function Stamp({ kind, label, animate = false }: { kind: VerdictKind; label?: string; animate?: boolean }) {
  return (
    <span className={`${animate ? "resolve" : ""} ${STYLE[kind].chip} inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[13px] font-medium`}>
      <Mark kind={kind} size={14} />
      {label ?? VERDICT_WORD[kind]}
    </span>
  );
}

const WEIGHT = { measured: 1, tested: 0.72, weak: 0.38, untested: 0 } as const;

// The Lean: a diverging balance bar. Against grows left, For grows right, length = confidence; a tick marks the net.
export function Lean({ kind, confidence, animate = false }: { kind: VerdictKind; confidence: keyof typeof WEIGHT; animate?: boolean }) {
  const w = kind === "no_signal" ? 0 : WEIGHT[confidence] * 50;
  const right = kind === "supported";
  const net = kind === "no_signal" ? 50 : right ? 50 + w : 50 - w;
  const label = kind === "no_signal" ? "No lean" : `Leans ${right ? "for" : "against"}, ${confidence} evidence`;
  return (
    <div className="w-full min-w-[120px]" role="img" aria-label={label}>
      <div className="relative h-2 rounded-full bg-surface ring-1 ring-inset ring-line">
        <span aria-hidden className="absolute inset-y-[-3px] left-1/2 w-px bg-line-strong" />
        {w > 0 && (
          <span
            aria-hidden
            className={`${animate ? "grow" : ""} absolute inset-y-0 rounded-full ${right ? "bg-for" : "bg-against"}`}
            style={{ left: right ? "50%" : `${50 - w}%`, width: `${w}%`, transformOrigin: right ? "left" : "right" }}
          />
        )}
        <span aria-hidden className="absolute top-1/2 h-3.5 w-[3px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-fg" style={{ left: `${net}%` }} />
      </div>
      <div className="mt-1 flex justify-between text-[11px] text-fg-3"><span>Against</span><span>For</span></div>
    </div>
  );
}
