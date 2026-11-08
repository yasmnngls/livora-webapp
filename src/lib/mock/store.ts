import "server-only";
import type { Block, Inquiry, Interest, Listing, Message, Owner, Report, Student } from "@/lib/types";
import { seedListings, seedOwners, seedStudents } from "./seed";

// In-memory mock backend. Same shape a Postgres schema will have later.
// Resets when the server restarts. Lives on globalThis so dev reloads keep it.
export interface Store {
  students: Student[];
  owners: Owner[];
  listings: Listing[];
  inquiries: Inquiry[];
  interests: Interest[];
  /** Private "not now" choices from Discover. Never shown to the other person. */
  passes: Interest[];
  blocks: Block[];
  reports: Report[];
  messages: Message[];
  suspendedIds: Set<string>;
  /** Every score computed, with its engine version (concept note: explainability). */
  scoreLog: { a: string; b: string; score: number; version: string; at: string }[];
  seq: number;
}

function fresh(): Store {
  const students = seedStudents();
  // Sample students who are already interested in the sample student Maya (s1).
  const interests: Interest[] = [
    { fromId: "s2", toId: "s1" },
    { fromId: "s4", toId: "s1" },
  ];
  return {
    students,
    owners: seedOwners(),
    listings: seedListings(),
    inquiries: [],
    interests,
    passes: [],
    blocks: [],
    reports: [],
    messages: [],
    suspendedIds: new Set(),
    scoreLog: [],
    seq: 1,
  };
}

const g = globalThis as unknown as { __livoraStore?: Store };

export function db(): Store {
  if (!g.__livoraStore) g.__livoraStore = fresh();
  // Stores created by an older build during dev may lack newer fields.
  g.__livoraStore.passes ??= [];
  return g.__livoraStore;
}

export function nextId(prefix: string): string {
  const s = db();
  return `${prefix}${Date.now().toString(36)}${(s.seq++).toString(36)}`;
}

export function resetStore() {
  g.__livoraStore = fresh();
}
