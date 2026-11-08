import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStudent } from "@/lib/dal/session";
import { getCandidate } from "@/lib/dal/matching";
import { Avatar, Friction, Notice, ScoreBadge } from "@/components/ui";
import { ReportBlockMenu } from "@/components/ReportBlockMenu";
import { InterestButton } from "./InterestButton";

export default async function CandidatePage({ params }: PageProps<"/matches/[id]">) {
  const me = await requireStudent();
  const { id } = await params;
  const c = getCandidate(me, id);
  if (!c) notFound();

  return (
    <div className="space-y-4">
      <Link href="/matches" className="text-sm text-muted hover:text-text">
        ← All matches
      </Link>

      <section className="card flex flex-wrap items-center gap-4">
        <Avatar url={c.photoUrl} name={c.firstName} size={88} />
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold">{c.firstName}</h1>
          <p className="text-sm text-muted">
            {c.ageBand} · {c.schoolCluster} · Verified student
          </p>
          {!c.mutual && c.photoUrl && <p className="mt-1 text-xs text-muted">Photo stays blurred until you both accept.</p>}
        </div>
        <ScoreBadge score={c.score} label="roommate fit" />
      </section>

      {c.hasDealbreakerConflict && (
        <Notice tone="danger">One of you marked a category where you differ as a dealbreaker. It lowered the score. Talk it through before deciding.</Notice>
      )}

      <section className="card space-y-2">
        <h2 className="font-semibold">Friction points</h2>
        <Friction points={c.frictionPoints} />
        {c.houseRuleNotes.map((n) => (
          <p key={n} className="text-sm text-muted">
            • {n}
          </p>
        ))}
      </section>

      <section className="card">
        <h2 className="mb-3 font-semibold">Why this score</h2>
        <ul className="space-y-3">
          {c.categories.map((cat) => (
            <li key={cat.id}>
              <div className="flex items-baseline justify-between gap-2 text-sm">
                <span className="font-medium">{cat.label}</span>
                <span className="text-muted">{cat.score}</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-2" aria-hidden>
                <div className="h-full rounded-full bg-brand" style={{ width: `${cat.score}%` }} />
              </div>
              <p className="mt-1 text-xs text-muted">{cat.reason}</p>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-muted">
          Engine {c.scoringVersion}. You see how you compare, never {c.firstName}&apos;s answers, and {c.firstName} never sees yours.
        </p>
      </section>

      <section className="card space-y-3">
        {c.mutual ? (
          <>
            <Notice tone="ok">You both accepted. Photos are unblurred and chat is open.</Notice>
            <div className="flex flex-wrap gap-2">
              <Link href={`/chat/${c.id}`} className="btn-primary">
                Message {c.firstName}
              </Link>
              <Link href="/listings" className="btn-secondary">
                Find rooms together
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-muted">
              {c.iAmInterested
                ? `Waiting for ${c.firstName}. If they accept too, you'll both see each other's photo and can chat.`
                : `Accepting tells ${c.firstName} you're interested. Nothing else is shared until they accept too.`}
            </p>
            <InterestButton id={c.id} interested={c.iAmInterested} />
          </>
        )}
      </section>

      <div className="flex justify-end">
        <ReportBlockMenu target={{ kind: "student", id: c.id }} name={c.firstName} />
      </div>
    </div>
  );
}
