"use client";

import { useTransition } from "react";
import { setInterest } from "@/app/actions";

export function InterestButton({ id, interested }: { id: string; interested: boolean }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      className={interested ? "btn-secondary" : "btn-primary"}
      disabled={pending}
      onClick={() => start(async () => {
        await setInterest(id, !interested);
      })}
    >
      {pending ? "Saving…" : interested ? "Withdraw interest" : "Accept as possible roommate"}
    </button>
  );
}
