import "server-only";
import { db, nextId } from "@/lib/mock/store";
import { CONTACT_UNLOCK_MESSAGES, findContactDetail } from "@/lib/safety";
import type { Student } from "@/lib/types";
import { canSee, isMutual } from "./matching";

export const MAX_MESSAGE_LENGTH = 1000;

const threadId = (a: string, b: string) => [a, b].sort().join(":");

export interface ThreadView {
  other: { id: string; firstName: string };
  messages: { id: string; mine: boolean; body: string; sentAt: string }[];
  contactUnlocked: boolean;
  messagesUntilUnlock: number;
}

function partner(viewer: Student, otherId: string): Student | null {
  const other = db().students.find((s) => s.id === otherId);
  return other && canSee(viewer, other) && isMutual(viewer.id, other.id) ? other : null;
}

export function getThread(viewer: Student, otherId: string): ThreadView | null {
  const other = partner(viewer, otherId);
  if (!other) return null;
  const tid = threadId(viewer.id, other.id);
  const msgs = db().messages.filter((m) => m.threadId === tid);
  return {
    other: { id: other.id, firstName: other.firstName },
    messages: msgs.map((m) => ({ id: m.id, mine: m.fromId === viewer.id, body: m.body, sentAt: m.sentAt })),
    contactUnlocked: msgs.length >= CONTACT_UNLOCK_MESSAGES,
    messagesUntilUnlock: Math.max(0, CONTACT_UNLOCK_MESSAGES - msgs.length),
  };
}

/** Returns an error message for the sender, or null when sent. */
export function sendMessage(viewer: Student, otherId: string, raw: string): string | null {
  const other = partner(viewer, otherId);
  if (!other) return "You can only message mutual matches.";
  const body = raw.trim();
  if (!body) return "Write a message first.";
  if (body.length > MAX_MESSAGE_LENGTH) return `Keep messages under ${MAX_MESSAGE_LENGTH} characters.`;
  const s = db();
  const tid = threadId(viewer.id, other.id);
  const count = s.messages.filter((m) => m.threadId === tid).length;
  if (count < CONTACT_UNLOCK_MESSAGES) {
    const kind = findContactDetail(body);
    if (kind) {
      return `For your safety, a ${kind} can't be shared until you've exchanged ${CONTACT_UNLOCK_MESSAGES} messages. Keep chatting in Livora for now.`;
    }
  }
  const now = new Date().toISOString();
  s.messages.push({ id: nextId("m"), threadId: tid, fromId: viewer.id, body, sentAt: now });
  // Mock: a sample student replies once so the flow can be tried end to end.
  if (other.isSample && !s.messages.some((m) => m.threadId === tid && m.fromId === other.id)) {
    s.messages.push({
      id: nextId("m"),
      threadId: tid,
      fromId: other.id,
      body: `Hi! I'm ${other.firstName} (sample reply). Want to compare house rules before we look at rooms?`,
      sentAt: now,
    });
  }
  return null;
}
