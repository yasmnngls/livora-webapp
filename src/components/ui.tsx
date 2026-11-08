import type { ReactNode } from "react";
import type { FrictionPoint } from "@/lib/types";

export function SampleDataBadge() {
  return (
    <span className="chip shrink-0 border border-warn/30 bg-warn-soft text-warn" title="This prototype runs on invented sample data">
      Sample data
    </span>
  );
}

export function PageTitle({ title, sub, aside }: { title: string; sub?: ReactNode; aside?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
        {sub && <p className="mt-1 text-sm text-muted">{sub}</p>}
      </div>
      {aside}
    </div>
  );
}

export function ScoreBadge({ score, label = "fit" }: { score: number; label?: string }) {
  const tone = score >= 75 ? "bg-brand text-brand-ink" : score >= 55 ? "bg-brand-soft text-brand" : "bg-surface-2 text-muted";
  return (
    <span className={`inline-flex shrink-0 flex-col items-center self-start rounded-2xl px-3 py-1.5 ${tone}`}>
      <span className="text-xl font-extrabold leading-none">{score}</span>
      <span className="text-[10px] font-semibold uppercase tracking-wide">{label}</span>
    </span>
  );
}

export function Friction({ points, limit }: { points: FrictionPoint[]; limit?: number }) {
  if (points.length === 0) return <p className="text-sm font-medium text-ok">✓ No major friction points</p>;
  const shown = limit ? points.slice(0, limit) : points;
  return (
    <ul className="space-y-1 text-sm">
      {shown.map((f) => (
        <li key={f.category} className={f.dealbreaker ? "font-semibold text-danger" : "text-muted"}>
          {f.dealbreaker ? "⚠ " : "• "}
          {f.text}
        </li>
      ))}
      {limit && points.length > limit && <li className="text-xs text-muted">+{points.length - limit} more</li>}
    </ul>
  );
}

export function Notice({ tone = "info", children }: { tone?: "info" | "warn" | "ok" | "danger"; children: ReactNode }) {
  const cls = {
    info: "bg-surface-2 text-text",
    warn: "bg-warn-soft text-text",
    ok: "bg-ok-soft text-text",
    danger: "bg-danger-soft text-text",
  }[tone];
  return <div className={`rounded-2xl px-4 py-3 text-sm ${cls}`}>{children}</div>;
}

export function Avatar({ url, name, size = 56, ring = false }: { url: string | null; name: string; size?: number; ring?: boolean }) {
  const ringCls = ring ? "ring-2 ring-brand ring-offset-2 ring-offset-surface" : "";
  if (!url) {
    return (
      <span
        className={`flex shrink-0 items-center justify-center rounded-full bg-brand-soft font-bold text-brand ${ringCls}`}
        style={{ width: size, height: size, fontSize: size * 0.4 }}
        aria-label={`${name} has no photo`}
      >
        {name.slice(0, 1)}
      </span>
    );
  }
  // Plain <img>: the photo route decides blurred vs full per viewer and must not be cached by an optimizer.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={`Photo of ${name}`} width={size} height={size} className={`shrink-0 rounded-full object-cover ${ringCls}`} style={{ width: size, height: size }} />;
}

const ART = {
  search: (
    <>
      <circle cx="54" cy="52" r="26" fill="var(--brand-soft)" stroke="var(--brand)" strokeWidth="5" />
      <path d="m74 72 18 18" stroke="var(--brand)" strokeWidth="8" strokeLinecap="round" />
      <path d="M42 50a12 12 0 0 1 12-12" stroke="var(--brand)" strokeWidth="4" strokeLinecap="round" fill="none" />
    </>
  ),
  heart: (
    <>
      <rect x="18" y="26" width="84" height="64" rx="18" fill="var(--brand-soft)" />
      <path d="M60 78s-20-11-20-25a11 11 0 0 1 20-6 11 11 0 0 1 20 6c0 14-20 25-20 25Z" fill="var(--brand)" />
    </>
  ),
  chat: (
    <>
      <path d="M18 28h60v38H40l-14 12V66h-8V28Z" fill="var(--brand-soft)" stroke="var(--brand)" strokeWidth="4" strokeLinejoin="round" />
      <path d="M58 48h44v30h-8v10l-12-10H58V48Z" fill="var(--surface)" stroke="var(--brand)" strokeWidth="4" strokeLinejoin="round" />
      <circle cx="36" cy="47" r="3.5" fill="var(--brand)" />
      <circle cx="48" cy="47" r="3.5" fill="var(--brand)" />
    </>
  ),
  home: (
    <>
      <path d="M20 58 60 24l40 34" stroke="var(--brand)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M30 52v42h60V52" fill="var(--brand-soft)" stroke="var(--brand)" strokeWidth="5" strokeLinejoin="round" />
      <rect x="52" y="70" width="16" height="24" rx="3" fill="var(--brand)" />
    </>
  ),
};

/** Friendly empty state with a small illustration (DormMate-style). */
export function EmptyState({ art, title, body, children }: { art: keyof typeof ART; title: string; body: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-4 py-10 text-center">
      <svg width="120" height="110" viewBox="0 0 120 110" fill="none" aria-hidden>
        {ART[art]}
      </svg>
      <h2 className="mt-3 text-lg font-bold">{title}</h2>
      <p className="mt-1 max-w-xs text-sm text-muted">{body}</p>
      {children && <div className="mt-5 flex flex-wrap justify-center gap-2">{children}</div>}
    </div>
  );
}

export const AMENITY_LABELS: Record<string, string> = {
  wifi: "Wi-Fi",
  aircon: "Aircon",
  own_bathroom: "Own bathroom",
  study_area: "Study area",
  laundry: "Laundry",
  near_campus: "Near campus",
};

export const peso = (n: number) => `₱${n.toLocaleString("en-PH")}`;
