"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { pass, restartDiscover, setInterest } from "@/app/actions";
import { Avatar, EmptyState, Friction } from "@/components/ui";
import type { CandidateDetailView } from "@/lib/types";

const SWIPE_DISTANCE = 110; // px
const SWIPE_VELOCITY = 0.11; // px/ms — a quick flick is enough
const EXIT_MS = 220;

type Exit = { id: string; dir: -1 | 1 } | null;

export function DiscoverDeck({ initial }: { initial: CandidateDetailView[] }) {
  const [cards, setCards] = useState(initial);
  const [exit, setExit] = useState<Exit>(null);
  const [match, setMatch] = useState<{ id: string; name: string } | null>(null);
  const [, start] = useTransition();
  const reduced = useReducedMotion();
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (match) dialog.current?.showModal();
  }, [match]);

  const top = cards[0];

  function decide(dir: -1 | 1) {
    if (!top || exit) return;
    const card = top;
    setExit({ id: card.id, dir });
    start(async () => {
      if (dir === 1) {
        const r = await setInterest(card.id, true);
        if (r.mutual) setMatch({ id: card.id, name: card.firstName });
      } else {
        await pass(card.id);
      }
    });
    window.setTimeout(
      () => {
        setCards((c) => c.filter((x) => x.id !== card.id));
        setExit(null);
      },
      reduced ? 120 : EXIT_MS,
    );
  }

  return (
    <>
      {!top ? (
        <EmptyState
          art="search"
          title="You've seen everyone for now"
          body="New verified students in your cluster will show up here. You can look at the ones you passed on again."
        >
          <button
            type="button"
            className="btn-primary"
            onClick={() =>
              start(async () => {
                setCards(await restartDiscover());
              })
            }
          >
            Review passed students
          </button>
          <Link href="/matches" className="btn-secondary">
            Go to matches
          </Link>
        </EmptyState>
      ) : (
        <div className="space-y-5">
          <div className="relative mx-auto h-[min(34rem,calc(100dvh-15rem))] min-h-[27rem] w-full max-w-md">
            {cards
              .slice(0, 3)
              .map((c, i) => (
                <DeckCard
                  key={c.id}
                  card={c}
                  depth={i - (exit && cards[0].id === exit.id ? 1 : 0)}
                  exitDir={exit?.id === c.id ? exit.dir : 0}
                  reduced={reduced}
                  onDecide={decide}
                />
              ))
              .reverse()}
          </div>

          <div className="flex items-center justify-center gap-4">
            <button type="button" className="btn-secondary min-w-32" onClick={() => decide(-1)} disabled={!!exit} aria-label={`Pass on ${top.firstName}`}>
              <span aria-hidden>✕</span> Pass
            </button>
            <button type="button" className="btn-primary min-w-32" onClick={() => decide(1)} disabled={!!exit} aria-label={`Interested in ${top.firstName}`}>
              <span aria-hidden>♥</span> Interested
            </button>
          </div>
          <p className="text-center text-xs text-muted">Passing is private. Interested only tells {top.firstName} if they say yes too.</p>
        </div>
      )}
      <MatchDialog ref={dialog} match={match} onClose={() => setMatch(null)} />
    </>
  );
}

function DeckCard({
  card,
  depth,
  exitDir,
  reduced,
  onDecide,
}: {
  card: CandidateDetailView;
  depth: number;
  exitDir: -1 | 0 | 1;
  reduced: boolean;
  onDecide: (dir: -1 | 1) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; t: number; id: number } | null>(null);
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const isTop = depth === 0;

  function onPointerDown(e: React.PointerEvent) {
    if (!isTop || drag.current || (e.target as HTMLElement).closest("a,button")) return; // ignore extra fingers and links
    drag.current = { x: e.clientX, t: performance.now(), id: e.pointerId };
    ref.current?.setPointerCapture(e.pointerId);
    setDragging(true);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!drag.current || e.pointerId !== drag.current.id) return;
    setDx(e.clientX - drag.current.x);
  }
  function onPointerUp(e: React.PointerEvent) {
    if (!drag.current || e.pointerId !== drag.current.id) return;
    const elapsed = Math.max(1, performance.now() - drag.current.t);
    const distance = e.clientX - drag.current.x;
    drag.current = null;
    setDragging(false);
    if (Math.abs(distance) >= SWIPE_DISTANCE || Math.abs(distance) / elapsed > SWIPE_VELOCITY) {
      onDecide(distance > 0 ? 1 : -1);
    } else {
      setDx(0);
    }
  }

  let transform: string;
  let opacity = 1;
  if (exitDir !== 0) {
    transform = reduced ? "none" : `translateX(${exitDir * 120}%) rotate(${exitDir * 10}deg)`;
    opacity = 0;
  } else if (isTop) {
    transform = reduced ? "none" : `translateX(${dx}px) rotate(${dx / 22}deg)`;
  } else {
    // Cards waiting behind: slightly smaller and lower, never scale(0).
    transform = `translateY(${Math.min(depth, 2) * 10}px) scale(${1 - Math.min(depth, 2) * 0.04})`;
    opacity = depth > 1 ? 0 : 1;
  }

  const hint = dragging ? Math.max(-1, Math.min(1, dx / SWIPE_DISTANCE)) : 0;

  return (
    <div
      ref={ref}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      aria-hidden={!isTop}
      className="card absolute inset-0 flex select-none flex-col gap-4 overflow-hidden p-5"
      style={{
        transform,
        opacity,
        touchAction: "pan-y",
        cursor: isTop ? (dragging ? "grabbing" : "grab") : "default",
        transformOrigin: "50% 100%",
        transition: dragging ? "none" : `transform ${EXIT_MS}ms var(--ease-out), opacity ${exitDir ? EXIT_MS : 200}ms var(--ease-out)`,
        pointerEvents: isTop ? "auto" : "none",
      }}
    >
      {/* Swipe direction hints */}
      <span
        className="pointer-events-none absolute left-5 top-5 rounded-full border-2 border-ok px-3 py-1 text-sm font-bold text-ok"
        style={{ opacity: Math.max(0, hint), transform: `rotate(-8deg)` }}
      >
        INTERESTED
      </span>
      <span
        className="pointer-events-none absolute right-5 top-5 rounded-full border-2 border-muted px-3 py-1 text-sm font-bold text-muted"
        style={{ opacity: Math.max(0, -hint), transform: `rotate(8deg)` }}
      >
        PASS
      </span>

      <div className="flex items-center gap-3">
        <Avatar url={card.photoUrl} name={card.firstName} size={56} />
        <div className="min-w-0">
          <p className="truncate text-xl font-bold">{card.firstName}</p>
          <p className="text-sm text-muted">{card.ageBand} · Verified student</p>
        </div>
      </div>

      <div className="flex items-end gap-2">
        <span className="text-6xl font-extrabold leading-none tracking-tight text-brand">{card.score}</span>
        <span className="pb-1.5 text-sm font-semibold text-muted">roommate fit</span>
      </div>

      {card.hasDealbreakerConflict && (
        <p className="rounded-2xl bg-danger-soft px-3 py-2 text-xs font-medium text-danger">A dealbreaker differs. It lowered the score.</p>
      )}

      <Friction points={card.frictionPoints} limit={2} />

      <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5">
        {card.categories.map((cat) => (
          <li key={cat.id} className="min-w-0">
            <div className="flex justify-between text-[11px] font-medium text-muted">
              <span className="truncate">{cat.label}</span>
              <span>{cat.score}</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-2" aria-hidden>
              <div className="h-full rounded-full bg-brand" style={{ width: `${cat.score}%` }} />
            </div>
          </li>
        ))}
      </ul>

      <Link
        href={`/matches/${card.id}`}
        className="pressable mt-auto self-center rounded-full px-4 py-2 text-sm font-semibold text-brand"
        tabIndex={isTop ? 0 : -1}
      >
        See why this score ›
      </Link>
    </div>
  );
}

function MatchDialog({ ref, match, onClose }: { ref: React.Ref<HTMLDialogElement>; match: { id: string; name: string } | null; onClose: () => void }) {
  return (
    <dialog ref={ref} onClose={onClose} className="sheet m-auto w-[min(22rem,calc(100vw-2rem))] rounded-3xl bg-surface p-6 text-center text-text">
      {match && (
        <div className="space-y-4">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-brand-soft text-3xl" aria-hidden>
            🏠
          </div>
          <h2 className="text-2xl font-extrabold">It&apos;s a match!</h2>
          <p className="text-sm text-muted">You and {match.name} both want to room together. Photos are unblurred and chat is open.</p>
          <div className="flex flex-col gap-2">
            <Link href={`/chat/${match.id}`} className="btn-primary">
              Start chat
            </Link>
            <form method="dialog">
              <button className="btn-secondary w-full">Keep discovering</button>
            </form>
          </div>
        </div>
      )}
    </dialog>
  );
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}
