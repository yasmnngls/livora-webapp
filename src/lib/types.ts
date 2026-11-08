// Domain types. Private types (Student, raw answers) must only be used inside
// src/lib/dal and src/lib/mock. Screens receive the *View types instead.

export const CATEGORY_IDS = [
  "sleep",
  "cleanliness",
  "noise",
  "social",
  "study",
  "food",
  "temperature",
  "privacy",
  "responsibilities",
] as const;
export type CategoryId = (typeof CATEGORY_IDS)[number];

/** 1 = nice to have, 2 = matters, 3 = very important */
export type Importance = 1 | 2 | 3;

/** One category answer on a 0..4 scale (meaning defined per category). */
export interface CategoryAnswer {
  value: number;
  importance: Importance;
}

export type LivingProfile = Record<CategoryId, CategoryAnswer>;

export type Gender = "woman" | "man" | "nonbinary";
export type RoomGenderPreference = "same" | "any";

export interface HouseRules {
  smokingInside: "never" | "outside_ok" | "ok";
  drinkingAtHome: "never" | "occasionally" | "ok";
  overnightGuests: "never" | "with_notice" | "ok";
}

export interface Consent {
  /** Required to be matched at all. */
  matching: boolean;
  /** Show my (blurred, then full after accept) photo to matches. */
  photoToMatches: boolean;
  /** Use my 30/90-day check-ins to improve scoring (later phase). */
  checkinsForScoring: boolean;
  /** Include me in anonymized university reports (groups of 10+ only). */
  universityReports: boolean;
}

export const AMENITIES = [
  "wifi",
  "aircon",
  "own_bathroom",
  "study_area",
  "laundry",
  "near_campus",
] as const;
export type Amenity = (typeof AMENITIES)[number];

/** Private record. Never send to the client as-is. */
export interface Student {
  id: string;
  firstName: string;
  /** Kept private; never shown to other users. */
  schoolEmail: string;
  verifiedAt: string;
  verifiedMethod: "school_email";
  yearOfBirth: number;
  gender: Gender;
  roomPreference: RoomGenderPreference;
  schoolCluster: string;
  profile: LivingProfile;
  dealbreakers: CategoryId[];
  houseRules: HouseRules;
  /** Answer index per scenario id. Private to the student. */
  simulation: Record<string, number>;
  budgetMin: number;
  budgetMax: number;
  mustHaves: Amenity[];
  consent: Consent;
  /** File name stem in private/photos (served only by /api/photo/[id]), or null for no photo. */
  photo: string | null;
  createdAt: string;
  isSample: boolean;
}

export interface Owner {
  id: string;
  firstName: string;
  verifiedAt: string;
}

export interface Listing {
  id: string;
  ownerId: string;
  title: string;
  /** Public, coarse location (district / near campus). */
  area: string;
  /** Private until an inquiry is accepted. */
  address: string;
  monthlyRent: number;
  openSlots: number;
  genderPolicy: "women" | "men" | "mixed";
  amenities: Amenity[];
  verified: boolean;
  isSample: boolean;
}

export type InquiryStatus = "pending" | "accepted" | "declined";

export interface Inquiry {
  id: string;
  listingId: string;
  studentId: string;
  moveInMonth: string; // YYYY-MM
  groupSize: number;
  status: InquiryStatus;
  createdAt: string;
}

/** A one-way "interested" signal. Mutual when both directions exist. */
export interface Interest {
  fromId: string;
  toId: string;
}

export interface Block {
  blockerId: string;
  blockedId: string;
}

export type ReportReason = "harassment" | "fake_profile" | "unsafe_listing" | "scam" | "other";
export type ReportTarget = { kind: "student"; id: string } | { kind: "listing"; id: string };

export interface Report {
  id: string;
  reporterId: string;
  target: ReportTarget;
  reason: ReportReason;
  details: string;
  createdAt: string;
  status: "open" | "dismissed" | "actioned";
}

export interface Message {
  id: string;
  threadId: string; // sorted pair "a:b"
  fromId: string;
  body: string;
  sentAt: string;
}

// ---------- View models (safe to send to the client) ----------

export interface CategoryExplanation {
  id: CategoryId;
  label: string;
  /** 0..100 */
  score: number;
  reason: string;
}

export interface FrictionPoint {
  category: CategoryId;
  text: string;
  dealbreaker: boolean;
}

export interface CandidateView {
  id: string;
  firstName: string;
  ageBand: string;
  schoolCluster: string;
  score: number;
  frictionPoints: FrictionPoint[];
  hasDealbreakerConflict: boolean;
  /** Always a URL to the photo route; the server decides blurred vs full. */
  photoUrl: string | null;
  iAmInterested: boolean;
  mutual: boolean;
}

export interface CandidateDetailView extends CandidateView {
  categories: CategoryExplanation[];
  houseRuleNotes: string[];
  scoringVersion: string;
}

export interface ListingView {
  id: string;
  title: string;
  area: string;
  monthlyRent: number;
  openSlots: number;
  genderPolicy: Listing["genderPolicy"];
  amenities: Amenity[];
  verified: boolean;
  housingFit: number;
  livingFit: { score: number; withFirstName: string } | null;
  /** Only present once the student's inquiry is accepted. */
  address: string | null;
  myInquiry: { status: InquiryStatus; moveInMonth: string; groupSize: number } | null;
}

/** Exactly what an owner may see about a student. Nothing else. */
export interface OwnerInquiryView {
  id: string;
  listingTitle: string;
  firstName: string;
  schoolCluster: string;
  moveInMonth: string;
  groupSize: number;
  status: InquiryStatus;
}
