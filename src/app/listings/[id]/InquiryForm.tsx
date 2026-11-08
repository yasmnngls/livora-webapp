"use client";

import { useState, useTransition } from "react";
import { inquire } from "@/app/actions";

export function InquiryForm({ listingId, maxGroup }: { listingId: string; maxGroup: number }) {
  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 2 > 12 ? 1 : now.getMonth() + 2).padStart(2, "0")}`;
  const [month, setMonth] = useState(defaultMonth);
  const [group, setGroup] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const r = await inquire(listingId, month, group);
          setError("error" in r ? r.error : null);
        });
      }}
    >
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="month">
            Move-in month
          </label>
          <input id="month" type="month" className="field" value={month} onChange={(e) => setMonth(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="group">
            Group size
          </label>
          <select id="group" className="field" value={group} onChange={(e) => setGroup(Number(e.target.value))}>
            {Array.from({ length: maxGroup }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      <button className="btn-primary" disabled={pending}>
        {pending ? "Sending…" : "Send inquiry"}
      </button>
    </form>
  );
}
