import "server-only";
import { db } from "@/lib/mock/store";
import { ageBand } from "@/lib/safety";
import { roommateFit, SCORING_VERSION, type RoommateFitResult } from "@/lib/scoring/engine";
import type { CandidateDetailView, CandidateView, HouseRules, Student } from "@/lib/types";

// Visibility and scoring rules for student-to-student views.
// Callers get view models only; raw answers never leave this module.

export function isBlockedEitherWay(a: string, b: string): boolean {
  return db().blocks.some((x) => (x.blockerId === a && x.blockedId === b) || (x.blockerId === b && x.blockedId === a));
}

function roomsCompatible(a: Student, b: Student): boolean {
  if (a.roomPreference === "same" || b.roomPreference === "same") return a.gender === b.gender;
  return true;
}

/** Can `viewer` see `other` at all? Same cluster, both opted in, nobody blocked, nobody suspended. */
export function canSee(viewer: Student, other: Student): boolean {
  const s = db();
  return (
    viewer.id !== other.id &&
    viewer.consent.matching &&
    other.consent.matching &&
    viewer.schoolCluster === other.schoolCluster &&
    !s.suspendedIds.has(viewer.id) &&
    !s.suspendedIds.has(other.id) &&
    !isBlockedEitherWay(viewer.id, other.id) &&
    roomsCompatible(viewer, other)
  );
}

export function isInterested(fromId: string, toId: string): boolean {
  return db().interests.some((i) => i.fromId === fromId && i.toId === toId);
}

export function isMutual(a: string, b: string): boolean {
  return isInterested(a, b) && isInterested(b, a) && !isBlockedEitherWay(a, b);
}

export function score(a: Student, b: Student): RoommateFitResult {
  const r = roommateFit(a, b);
  const log = db().scoreLog;
  log.push({ a: a.id, b: b.id, score: r.score, version: r.version, at: new Date().toISOString() });
  if (log.length > 1000) log.splice(0, log.length - 1000);
  return r;
}

function toView(viewer: Student, other: Student, r: RoommateFitResult): CandidateView {
  return {
    id: other.id,
    firstName: other.firstName,
    ageBand: ageBand(other.yearOfBirth),
    schoolCluster: other.schoolCluster,
    score: r.score,
    frictionPoints: r.frictionPoints,
    hasDealbreakerConflict: r.hasDealbreakerConflict,
    photoUrl: other.photo && other.consent.photoToMatches ? `/api/photo/${other.id}` : null,
    iAmInterested: isInterested(viewer.id, other.id),
    mutual: isMutual(viewer.id, other.id),
  };
}

export function listCandidates(viewer: Student): CandidateView[] {
  return db()
    .students.filter((o) => canSee(viewer, o))
    .map((o) => toView(viewer, o, score(viewer, o)))
    .sort((x, y) => y.score - x.score);
}

const RULE_LABELS: Record<keyof HouseRules, string> = {
  smokingInside: "smoking",
  drinkingAtHome: "drinking at home",
  overnightGuests: "overnight guests",
};

export function getCandidate(viewer: Student, id: string): CandidateDetailView | null {
  const other = db().students.find((s) => s.id === id);
  if (!other || !canSee(viewer, other)) return null;
  const r = score(viewer, other);
  const houseRuleNotes = (Object.keys(RULE_LABELS) as (keyof HouseRules)[])
    .filter((k) => viewer.houseRules[k] !== other.houseRules[k])
    .map((k) => `You have different house rules on ${RULE_LABELS[k]}.`);
  return { ...toView(viewer, other, r), categories: r.categories, houseRuleNotes, scoringVersion: SCORING_VERSION };
}

/** Sample students reply "interested" back when the fit is 60 or more (mock behaviour). */
const MOCK_AUTO_ACCEPT = 60;

/** Returns whether the pair is now a mutual match, or null if the candidate isn't visible. */
export function expressInterest(viewer: Student, id: string): { mutual: boolean } | null {
  const s = db();
  const other = s.students.find((x) => x.id === id);
  if (!other || !canSee(viewer, other)) return null;
  s.passes = s.passes.filter((p) => !(p.fromId === viewer.id && p.toId === id));
  if (!isInterested(viewer.id, id)) s.interests.push({ fromId: viewer.id, toId: id });
  if (other.isSample && !isInterested(id, viewer.id) && roommateFit(viewer, other).score >= MOCK_AUTO_ACCEPT) {
    s.interests.push({ fromId: id, toId: viewer.id });
  }
  return { mutual: isMutual(viewer.id, id) };
}

export function isPassed(fromId: string, toId: string): boolean {
  return db().passes.some((p) => p.fromId === fromId && p.toId === toId);
}

/** "Not now" from Discover. Private: the other person is never told. */
export function passCandidate(viewer: Student, id: string) {
  const s = db();
  if (!isPassed(viewer.id, id)) s.passes.push({ fromId: viewer.id, toId: id });
}

export function clearPasses(viewer: Student) {
  const s = db();
  s.passes = s.passes.filter((p) => p.fromId !== viewer.id);
}

/** Discover deck: visible candidates the viewer hasn't acted on yet, best fit first. */
export function discoverDeck(viewer: Student): CandidateDetailView[] {
  return db()
    .students.filter((o) => canSee(viewer, o) && !isInterested(viewer.id, o.id) && !isPassed(viewer.id, o.id))
    .map((o) => getCandidate(viewer, o.id))
    .filter((c): c is CandidateDetailView => c !== null)
    .sort((a, b) => b.score - a.score);
}

export function withdrawInterest(viewer: Student, id: string) {
  const s = db();
  s.interests = s.interests.filter((i) => !(i.fromId === viewer.id && i.toId === id));
}

/** Students the viewer has a mutual match with and can still see. */
export function mutualMatches(viewer: Student): Student[] {
  return db().students.filter((o) => canSee(viewer, o) && isMutual(viewer.id, o.id));
}
