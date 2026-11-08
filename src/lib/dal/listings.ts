import "server-only";
import { db, nextId } from "@/lib/mock/store";
import { housingFit, livingFit } from "@/lib/scoring/engine";
import type { Amenity, Listing, ListingView, Owner, OwnerInquiryView, Student } from "@/lib/types";
import { mutualMatches, score } from "./matching";

function policyAllows(listing: Listing, student: Student): boolean {
  if (listing.genderPolicy === "mixed") return true;
  return (listing.genderPolicy === "women" && student.gender === "woman") || (listing.genderPolicy === "men" && student.gender === "man");
}

function toView(student: Student, l: Listing): ListingView {
  const s = db();
  const hf = housingFit(student, l.monthlyRent, l.amenities);
  // Best Living Fit with a mutual match, if any. The pair's lower housing fit governs.
  let best: ListingView["livingFit"] = null;
  for (const m of mutualMatches(student)) {
    if (!policyAllows(l, m)) continue;
    const pairHousing = Math.min(hf, housingFit(m, l.monthlyRent, l.amenities));
    const lf = livingFit(score(student, m).score, pairHousing);
    if (!best || lf > best.score) best = { score: lf, withFirstName: m.firstName };
  }
  const inquiry = s.inquiries.find((i) => i.listingId === l.id && i.studentId === student.id);
  return {
    id: l.id,
    title: l.title,
    area: l.area,
    monthlyRent: l.monthlyRent,
    openSlots: l.openSlots,
    genderPolicy: l.genderPolicy,
    amenities: l.amenities,
    verified: l.verified,
    housingFit: hf,
    livingFit: best,
    // The address is only released once the owner accepts this student's inquiry.
    address: inquiry?.status === "accepted" ? l.address : null,
    myInquiry: inquiry ? { status: inquiry.status, moveInMonth: inquiry.moveInMonth, groupSize: inquiry.groupSize } : null,
  };
}

function visibleTo(student: Student, l: Listing): boolean {
  const s = db();
  return l.verified && !s.suspendedIds.has(l.id) && policyAllows(l, student);
}

export function listListings(student: Student): ListingView[] {
  return db()
    .listings.filter((l) => visibleTo(student, l))
    .map((l) => toView(student, l))
    .sort((a, b) => (b.livingFit?.score ?? b.housingFit) - (a.livingFit?.score ?? a.housingFit));
}

export function getListing(student: Student, id: string): ListingView | null {
  const l = db().listings.find((x) => x.id === id);
  return l && visibleTo(student, l) ? toView(student, l) : null;
}

export function createInquiry(student: Student, listingId: string, moveInMonth: string, groupSize: number): string | null {
  const s = db();
  const l = s.listings.find((x) => x.id === listingId);
  if (!l || !visibleTo(student, l)) return "Listing not found.";
  if (!/^\d{4}-\d{2}$/.test(moveInMonth)) return "Pick a move-in month.";
  if (!Number.isInteger(groupSize) || groupSize < 1 || groupSize > l.openSlots) return `Group size must be 1 to ${l.openSlots}.`;
  if (s.inquiries.some((i) => i.listingId === listingId && i.studentId === student.id)) return "You already asked about this room.";
  s.inquiries.push({ id: nextId("q"), listingId, studentId: student.id, moveInMonth, groupSize, status: "pending", createdAt: new Date().toISOString() });
  return null;
}

// ---------- Owner side ----------

export function ownerListings(owner: Owner): Listing[] {
  return db().listings.filter((l) => l.ownerId === owner.id);
}

/** Owners see exactly these fields about a student. Never answers, scores or contact details. */
export function ownerInquiries(owner: Owner): OwnerInquiryView[] {
  const s = db();
  const mine = new Map(ownerListings(owner).map((l) => [l.id, l]));
  return s.inquiries
    .filter((i) => mine.has(i.listingId))
    .flatMap((i) => {
      const st = s.students.find((x) => x.id === i.studentId);
      if (!st) return [];
      return [{
        id: i.id,
        listingTitle: mine.get(i.listingId)!.title,
        firstName: st.firstName,
        schoolCluster: st.schoolCluster,
        moveInMonth: i.moveInMonth,
        groupSize: i.groupSize,
        status: i.status,
      }];
    })
    .reverse();
}

export function decideInquiry(owner: Owner, inquiryId: string, decision: "accepted" | "declined"): boolean {
  const s = db();
  const q = s.inquiries.find((i) => i.id === inquiryId);
  if (!q || q.status !== "pending") return false;
  const l = s.listings.find((x) => x.id === q.listingId);
  if (!l || l.ownerId !== owner.id) return false;
  q.status = decision;
  return true;
}

export interface NewListingInput {
  title: string;
  area: string;
  address: string;
  monthlyRent: number;
  openSlots: number;
  genderPolicy: Listing["genderPolicy"];
  amenities: Amenity[];
}

/** New listings start unverified and stay hidden from students until an admin verifies them. */
export function createListing(owner: Owner, input: NewListingInput): string {
  const id = nextId("l");
  db().listings.push({ id, ownerId: owner.id, ...input, verified: false, isSample: false });
  return id;
}
