"use client";

import { useRef, useState, useTransition } from "react";
import { block, report } from "@/app/actions";
import type { ReportReason, ReportTarget } from "@/lib/types";

const REASONS: { value: ReportReason; label: string }[] = [
  { value: "harassment", label: "Harassment or threats" },
  { value: "fake_profile", label: "Fake profile or impersonation" },
  { value: "unsafe_listing", label: "Unsafe or misleading listing" },
  { value: "scam", label: "Asked for money or ID" },
  { value: "other", label: "Something else" },
];

/** Report (and, for students, Block) menu shown on every profile, chat and listing. */
export function ReportBlockMenu({ target, name }: { target: ReportTarget; name: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [mode, setMode] = useState<"report" | "block">("report");
  const [reason, setReason] = useState<ReportReason>(target.kind === "listing" ? "unsafe_listing" : "harassment");
  const [details, setDetails] = useState("");
  const [state, setState] = useState<"idle" | "sent" | string>("idle");
  const [pending, start] = useTransition();

  const open = (m: "report" | "block") => {
    setMode(m);
    setState("idle");
    dialog.current?.showModal();
  };

  return (
    <>
      <div className="flex gap-2">
        <button type="button" onClick={() => open("report")} className="btn-secondary min-h-9 px-4 text-xs">
          Report
        </button>
        {target.kind === "student" && (
          <button type="button" onClick={() => open("block")} className="btn-secondary min-h-9 px-4 text-xs">
            Block
          </button>
        )}
      </div>

      <dialog ref={dialog} className="sheet m-auto w-[min(26rem,calc(100vw-2rem))] rounded-3xl bg-surface p-6 text-text">
        {mode === "block" ? (
          <div className="space-y-4">
            <h2 className="text-lg font-bold">Block {name}?</h2>
            <p className="text-sm text-muted">
              You&apos;ll disappear from each other&apos;s matches and chat right away. {name} won&apos;t be told. You can still report them too.
            </p>
            <div className="flex justify-end gap-2">
              <button type="button" className="btn-secondary" onClick={() => dialog.current?.close()}>
                Cancel
              </button>
              <button type="button" className="btn-danger" disabled={pending} onClick={() => target.kind === "student" && start(() => block(target.id))}>
                Block
              </button>
            </div>
          </div>
        ) : state === "sent" ? (
          <div className="space-y-4">
            <h2 className="text-lg font-bold">Report sent</h2>
            <p className="text-sm text-muted">
              Thank you. We review reports within 48 hours. {name} won&apos;t know who reported them.
              {target.kind === "student" && " If you feel unsafe, you can also block them now."}
            </p>
            <div className="flex justify-end gap-2">
              {target.kind === "student" && (
                <button type="button" className="btn-secondary" onClick={() => setMode("block")}>
                  Block {name}
                </button>
              )}
              <button type="button" className="btn-primary" onClick={() => dialog.current?.close()}>
                Done
              </button>
            </div>
          </div>
        ) : (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              start(async () => {
                const r = await report(target, reason, details);
                setState("error" in r ? r.error : "sent");
              });
            }}
          >
            <h2 className="text-lg font-bold">Report {name}</h2>
            <fieldset className="space-y-2">
              <legend className="label">What happened?</legend>
              {REASONS.map((r) => (
                <label key={r.value} className="flex items-center gap-2 text-sm">
                  <input type="radio" name="reason" value={r.value} checked={reason === r.value} onChange={() => setReason(r.value)} />
                  {r.label}
                </label>
              ))}
            </fieldset>
            <div>
              <label className="label" htmlFor="report-details">
                Details (optional)
              </label>
              <textarea id="report-details" className="field" rows={3} maxLength={1000} value={details} onChange={(e) => setDetails(e.target.value)} />
            </div>
            {state !== "idle" && <p className="text-sm text-danger">{state}</p>}
            <p className="text-xs text-muted">In danger right now? Call 911 first.</p>
            <div className="flex justify-end gap-2">
              <button type="button" className="btn-secondary" onClick={() => dialog.current?.close()}>
                Cancel
              </button>
              <button className="btn-primary" disabled={pending}>
                Send report
              </button>
            </div>
          </form>
        )}
      </dialog>
    </>
  );
}
