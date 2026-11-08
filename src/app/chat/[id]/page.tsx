import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStudent } from "@/lib/dal/session";
import { getThread } from "@/lib/dal/chat";
import { ReportBlockMenu } from "@/components/ReportBlockMenu";
import { ChatComposer } from "./ChatComposer";

export default async function ChatPage({ params }: PageProps<"/chat/[id]">) {
  const me = await requireStudent();
  const { id } = await params;
  const t = getThread(me, id);
  if (!t) notFound();

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <Link href="/chat" className="text-sm text-muted hover:text-text">
            ← Chats
          </Link>
          <h1 className="truncate text-xl font-bold">{t.other.firstName}</h1>
        </div>
        <ReportBlockMenu target={{ kind: "student", id: t.other.id }} name={t.other.firstName} />
      </div>

      <aside className="rounded-xl border border-warn/40 bg-warn-soft px-3 py-2.5 text-sm">
        <p className="font-semibold">Stay safe</p>
        <ul className="mt-1 list-disc space-y-0.5 pl-5 text-xs">
          <li>Meet in a public place first, and tell a friend where you&apos;re going.</li>
          <li>Never send money, ID photos or deposits before seeing the room.</li>
          <li>
            {t.contactUnlocked
              ? "You can now share contact details. Only share them if you're comfortable."
              : `Phone numbers, emails, links and social handles unlock after ${t.messagesUntilUnlock} more messages.`}
          </li>
        </ul>
      </aside>

      <ol className="card flex min-h-48 flex-col gap-2" aria-label="Messages">
        {t.messages.length === 0 && <li className="m-auto text-sm text-muted">Say hi. Comparing house rules is a good start.</li>}
        {t.messages.map((m) => (
          <li key={m.id} className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${m.mine ? "self-end bg-brand text-brand-ink" : "self-start bg-surface-2"}`}>
            <p className="whitespace-pre-wrap break-words">{m.body}</p>
          </li>
        ))}
      </ol>

      <ChatComposer otherId={t.other.id} />
    </div>
  );
}
