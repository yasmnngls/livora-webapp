import Link from "next/link";
import { requireStudent } from "@/lib/dal/session";
import { listCandidates } from "@/lib/dal/matching";
import { Avatar, EmptyState, Notice, PageTitle, SampleDataBadge, ScoreBadge } from "@/components/ui";
import type { CandidateView } from "@/lib/types";

function MatchTile({ c }: { c: CandidateView }) {
  return (
    <Link href={`/matches/${c.id}`} className="card pressable flex flex-col items-center gap-2 p-4 text-center">
      <div className="relative">
        <Avatar url={c.photoUrl} name={c.firstName} size={72} ring={c.mutual} />
        <span className="absolute -bottom-1 -right-2 rounded-full bg-brand px-2 py-0.5 text-[11px] font-bold text-brand-ink">{c.score}</span>
      </div>
      <p className="font-bold">{c.firstName}</p>
      <p className="text-xs text-muted">{c.ageBand}</p>
    </Link>
  );
}

export default async function MatchesPage({ searchParams }: PageProps<"/matches">) {
  const me = await requireStudent();
  const { blocked } = await searchParams;
  const all = listCandidates(me);
  const mutual = all.filter((c) => c.mutual);
  const waiting = all.filter((c) => c.iAmInterested && !c.mutual);

  return (
    <>
      <PageTitle title="Matches" sub="People you both accepted, and people you're waiting on." aside={<SampleDataBadge />} />
      {blocked && (
        <div className="mb-4">
          <Notice tone="ok">Blocked. You won&apos;t see each other anymore.</Notice>
        </div>
      )}

      {mutual.length === 0 && waiting.length === 0 ? (
        <EmptyState art="heart" title="No matches yet" body="Say you're interested in someone on Discover. When they say yes too, they'll show up here.">
          <Link href="/discover" className="btn-primary">
            Start discovering
          </Link>
        </EmptyState>
      ) : (
        <div className="space-y-6">
          {mutual.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted">Matched · {mutual.length}</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {mutual.map((c) => (
                  <MatchTile key={c.id} c={c} />
                ))}
              </div>
            </section>
          )}
          {waiting.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted">Waiting on them · {waiting.length}</h2>
              <ul className="space-y-2">
                {waiting.map((c) => (
                  <li key={c.id}>
                    <Link href={`/matches/${c.id}`} className="card pressable flex items-center gap-3 p-3">
                      <Avatar url={c.photoUrl} name={c.firstName} size={44} />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{c.firstName}</p>
                        <p className="text-xs text-muted">Photo stays blurred until they accept</p>
                      </div>
                      <ScoreBadge score={c.score} />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </>
  );
}
