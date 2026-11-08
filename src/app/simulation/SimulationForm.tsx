"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { submitSimulation } from "@/app/actions";
import type { Scenario } from "@/lib/scoring/scenarios";

export function SimulationForm({ scenarios, initial }: { scenarios: Scenario[]; initial: Record<string, number> }) {
  const [answers, setAnswers] = useState<Record<string, number>>(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const done = scenarios.filter((s) => answers[s.id] !== undefined).length;

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (done < scenarios.length) return setError(`Answer all ${scenarios.length} scenarios (${done} done).`);
        setError(null);
        start(async () => {
          const r = await submitSimulation(answers);
          if (r && "error" in r) setError(r.error);
        });
      }}
    >
      {scenarios.map((s, i) => (
        <fieldset key={s.id} className="card space-y-2">
          <legend className="sr-only">Scenario {i + 1}</legend>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand">
            {i + 1} of {scenarios.length}
          </p>
          <p className="font-medium">{s.prompt}</p>
          <div className="grid gap-2">
            {s.options.map((o, idx) => (
              <label key={idx} className="option">
                <input type="radio" className="sr-only" name={s.id} checked={answers[s.id] === idx} onChange={() => setAnswers((a) => ({ ...a, [s.id]: idx }))} />
                {o.text}
              </label>
            ))}
          </div>
        </fieldset>
      ))}
      {error && (
        <p role="alert" className="text-sm font-medium text-danger">
          {error}
        </p>
      )}
      <div className="flex justify-between gap-2 pt-2">
        <Link href="/discover" className="btn-secondary">
          Skip for now
        </Link>
        <button className="btn-primary" disabled={pending}>
          {pending ? "Saving…" : `Save (${done}/${scenarios.length})`}
        </button>
      </div>
    </form>
  );
}
