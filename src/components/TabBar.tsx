"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type Tab = { href: string; label: string; icon: keyof typeof ICONS };

const ICONS = {
  discover: <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm3.5 5.5-2 5-5 2 2-5 5-2Z" />,
  heart: <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />,
  chat: <path d="M5 5h14v10H9l-4 4V5Z" />,
  home: <path d="M4 11 12 4l8 7v9h-5v-5H9v5H4v-9Z" />,
  shield: <path d="M12 3 5 6v5c0 4.5 3 8.3 7 10 4-1.7 7-5.5 7-10V6l-7-3Z" />,
  inbox: <path d="M4 5h16v14H4V5Zm0 9h4l1.5 2h5L16 14h4" />,
  plus: <path d="M12 5v14M5 12h14" />,
  flag: <path d="M6 21V4m0 0h10l-2 4 2 4H6" />,
};

/** Bottom tab bar (DormMate-style): the active tab sits in a filled circle. */
export function TabBar({ tabs }: { tabs: Tab[] }) {
  const path = usePathname();
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface/95 backdrop-blur"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-md justify-around px-2">
        {tabs.map((t) => {
          const active = path === t.href || path.startsWith(t.href + "/");
          return (
            <li key={t.href} className="flex-1">
              <Link
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={`pressable flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${active ? "text-brand" : "text-muted"}`}
              >
                <span className={`flex size-9 items-center justify-center rounded-full transition-colors duration-150 ${active ? "bg-brand text-brand-ink" : ""}`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    {ICONS[t.icon]}
                  </svg>
                </span>
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
