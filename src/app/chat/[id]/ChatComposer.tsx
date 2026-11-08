"use client";

import { useState, useTransition } from "react";
import { chat } from "@/app/actions";

export function ChatComposer({ otherId }: { otherId: string }) {
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <form
      className="space-y-2"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const r = await chat(otherId, body);
          if ("error" in r) setError(r.error);
          else {
            setError(null);
            setBody("");
          }
        });
      }}
    >
      {error && (
        <p role="alert" className="rounded-xl border border-danger/40 bg-danger-soft px-3 py-2 text-sm">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <label htmlFor="msg" className="sr-only">
          Message
        </label>
        <input id="msg" className="field" maxLength={1000} autoComplete="off" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write a message" />
        <button className="btn-primary shrink-0" disabled={pending || !body.trim()}>
          Send
        </button>
      </div>
    </form>
  );
}
