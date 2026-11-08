import Link from "next/link";
import { requireStudent } from "@/lib/dal/session";
import { mutualMatches } from "@/lib/dal/matching";
import { getThread } from "@/lib/dal/chat";
import { Avatar, EmptyState, PageTitle } from "@/components/ui";

export default async function ChatListPage() {
  const me = await requireStudent();
  const matches = mutualMatches(me).map((m) => ({
    id: m.id,
    firstName: m.firstName,
    photoUrl: m.photo && m.consent.photoToMatches ? `/api/photo/${m.id}` : null,
    last: getThread(me, m.id)?.messages.at(-1) ?? null,
  }));
  const conversations = matches.filter((m) => m.last).sort((a, b) => b.last!.sentAt.localeCompare(a.last!.sentAt));

  if (matches.length === 0) {
    return (
      <>
        <PageTitle title="Chat" />
        <EmptyState art="chat" title="No conversations yet" body="Chat opens when you and another student both accept each other.">
          <Link href="/discover" className="btn-primary">
            Find a match
          </Link>
        </EmptyState>
      </>
    );
  }

  return (
    <>
      <PageTitle title="Chat" sub="Only students you've both accepted can message each other." />
      <section className="mb-6">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted">Your matches</h2>
        <ul className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-1">
          {matches.map((m) => (
            <li key={m.id} className="shrink-0">
              <Link href={`/chat/${m.id}`} className="pressable flex w-16 flex-col items-center gap-1.5 rounded-2xl">
                <Avatar url={m.photoUrl} name={m.firstName} size={60} ring={!m.last} />
                <span className="w-full truncate text-center text-xs font-medium">{m.firstName}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted">Conversations</h2>
        {conversations.length === 0 ? (
          <p className="text-sm text-muted">Tap a match above to say hi.</p>
        ) : (
          <ul className="space-y-2">
            {conversations.map((m) => (
              <li key={m.id}>
                <Link href={`/chat/${m.id}`} className="card pressable flex items-center gap-3 p-3">
                  <Avatar url={m.photoUrl} name={m.firstName} size={48} />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{m.firstName}</p>
                    <p className="truncate text-sm text-muted">
                      {m.last!.mine ? "You: " : ""}
                      {m.last!.body}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
