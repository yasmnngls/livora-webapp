/** Livora wordmark: a roof line over two windows, then the name. */
export function Logo({ size = 22 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-brand" aria-label="Livora">
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M3 11.2 12 4l9 7.2" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5.5 10v9.5h13V10" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" />
        <circle cx="9.6" cy="14.2" r="1.6" fill="currentColor" />
        <circle cx="14.4" cy="14.2" r="1.6" fill="currentColor" />
      </svg>
      <span className="text-xl font-extrabold tracking-tight" style={{ fontSize: size * 0.95 }}>
        livora
      </span>
    </span>
  );
}
