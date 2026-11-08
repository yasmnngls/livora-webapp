import "server-only";
import { SCHOOL_DOMAINS } from "@/lib/mock/seed";
import { db, nextId } from "@/lib/mock/store";
import { passesAgeGate } from "@/lib/safety";
import { SCENARIOS } from "@/lib/scoring/scenarios";
import {
  AMENITIES,
  CATEGORY_IDS,
  type Amenity,
  type CategoryId,
  type Consent,
  type Gender,
  type HouseRules,
  type LivingProfile,
  type RoomGenderPreference,
  type Student,
} from "@/lib/types";

export const DEMO_VERIFICATION_CODE = "123456";

export function clusterForEmail(email: string): string | null {
  const domain = email.trim().toLowerCase().split("@")[1];
  return domain ? SCHOOL_DOMAINS[domain] ?? null : null;
}

export interface OnboardingInput {
  firstName: string;
  schoolEmail: string;
  code: string;
  yearOfBirth: number;
  confirmed18: boolean;
  gender: Gender;
  roomPreference: RoomGenderPreference;
  profile: LivingProfile;
  dealbreakers: CategoryId[];
  houseRules: HouseRules;
  budgetMin: number;
  budgetMax: number;
  mustHaves: Amenity[];
  consent: Consent;
}

const oneOf = <T extends string>(v: unknown, list: readonly T[]): v is T => typeof v === "string" && (list as readonly string[]).includes(v);

/** Validates everything server-side. Returns the new student or an error. */
export function createStudent(input: OnboardingInput): { student: Student } | { error: string } {
  const firstName = String(input.firstName ?? "").trim();
  if (!/^[\p{L}][\p{L} .'-]{0,29}$/u.test(firstName)) return { error: "Enter your first name only (letters, up to 30)." };
  const email = String(input.schoolEmail ?? "").trim().toLowerCase();
  const cluster = clusterForEmail(email);
  if (!cluster) return { error: "Use a school email from a pilot school." };
  if (input.code !== DEMO_VERIFICATION_CODE) return { error: "That verification code is wrong." };
  if (db().students.some((s) => s.schoolEmail === email)) return { error: "That school email already has an account." };
  if (!passesAgeGate(Number(input.yearOfBirth), input.confirmed18 === true)) return { error: "Livora is for students 18 and older." };
  if (!oneOf(input.gender, ["woman", "man", "nonbinary"] as const)) return { error: "Pick a gender." };
  if (!oneOf(input.roomPreference, ["same", "any"] as const)) return { error: "Pick a room preference." };
  for (const id of CATEGORY_IDS) {
    const a = input.profile?.[id];
    if (!a || !Number.isInteger(a.value) || a.value < 0 || a.value > 4 || ![1, 2, 3].includes(a.importance)) {
      return { error: "Answer every Living Profile question." };
    }
  }
  const dealbreakers = [...new Set(input.dealbreakers ?? [])].filter((d) => oneOf(d, CATEGORY_IDS));
  if (dealbreakers.length > 3) return { error: "Pick up to three dealbreakers." };
  const hr = input.houseRules;
  if (
    !hr ||
    !oneOf(hr.smokingInside, ["never", "outside_ok", "ok"] as const) ||
    !oneOf(hr.drinkingAtHome, ["never", "occasionally", "ok"] as const) ||
    !oneOf(hr.overnightGuests, ["never", "with_notice", "ok"] as const)
  ) {
    return { error: "Set your house rules." };
  }
  const budgetMin = Math.round(Number(input.budgetMin));
  const budgetMax = Math.round(Number(input.budgetMax));
  if (!(budgetMin >= 1000 && budgetMax >= budgetMin && budgetMax <= 50000)) return { error: "Enter a budget between ₱1,000 and ₱50,000." };
  if (input.consent?.matching !== true) return { error: "Matching needs your consent to use your answers." };

  const now = new Date().toISOString();
  const student: Student = {
    id: nextId("u"),
    firstName,
    schoolEmail: email,
    verifiedAt: now,
    verifiedMethod: "school_email",
    yearOfBirth: Number(input.yearOfBirth),
    gender: input.gender,
    roomPreference: input.roomPreference,
    schoolCluster: cluster,
    profile: Object.fromEntries(CATEGORY_IDS.map((id) => [id, { value: input.profile[id].value, importance: input.profile[id].importance }])) as LivingProfile,
    dealbreakers,
    houseRules: { smokingInside: hr.smokingInside, drinkingAtHome: hr.drinkingAtHome, overnightGuests: hr.overnightGuests },
    simulation: {},
    budgetMin,
    budgetMax,
    mustHaves: [...new Set(input.mustHaves ?? [])].filter((m) => oneOf(m, AMENITIES)),
    consent: {
      matching: true,
      photoToMatches: input.consent.photoToMatches === true,
      checkinsForScoring: input.consent.checkinsForScoring === true,
      universityReports: input.consent.universityReports === true,
    },
    // Photo upload is a later phase; new accounts have no photo.
    photo: null,
    createdAt: now,
    isSample: false,
  };
  db().students.push(student);
  return { student };
}

export function saveSimulation(student: Student, answers: Record<string, number>): string | null {
  const clean: Record<string, number> = {};
  for (const sc of SCENARIOS) {
    const v = answers[sc.id];
    if (!Number.isInteger(v) || v < 0 || v >= sc.options.length) return "Answer all eight scenarios.";
    clean[sc.id] = v;
  }
  student.simulation = clean;
  return null;
}

export function updateConsent(student: Student, consent: Omit<Consent, "matching"> & { matching: boolean }) {
  student.consent = {
    matching: consent.matching === true,
    photoToMatches: consent.photoToMatches === true,
    checkinsForScoring: consent.checkinsForScoring === true,
    universityReports: consent.universityReports === true,
  };
}

/** Everything Livora holds about the student (RA 10173 right to access). */
export function exportMyData(student: Student) {
  const s = db();
  return {
    exportedAt: new Date().toISOString(),
    note: "Prototype export. Sample data only.",
    profile: student,
    interestsSent: s.interests.filter((i) => i.fromId === student.id).map((i) => i.toId),
    blocked: s.blocks.filter((b) => b.blockerId === student.id).map((b) => b.blockedId),
    inquiries: s.inquiries.filter((i) => i.studentId === student.id),
    reportsFiled: s.reports.filter((r) => r.reporterId === student.id).map(({ id, target, reason, createdAt, status }) => ({ id, target, reason, createdAt, status })),
    messagesSent: s.messages.filter((m) => m.fromId === student.id).map(({ body, sentAt }) => ({ body, sentAt })),
  };
}

/**
 * Deletes the student and everything tied to them. Reports *about* this
 * student are kept, since they protect other users; reports they filed stay
 * but no longer name them.
 */
export function deleteStudent(student: Student) {
  const s = db();
  const id = student.id;
  s.students = s.students.filter((x) => x.id !== id);
  s.interests = s.interests.filter((i) => i.fromId !== id && i.toId !== id);
  s.passes = s.passes.filter((i) => i.fromId !== id && i.toId !== id);
  s.blocks = s.blocks.filter((b) => b.blockerId !== id && b.blockedId !== id);
  s.inquiries = s.inquiries.filter((q) => q.studentId !== id);
  s.messages = s.messages.filter((m) => !m.threadId.split(":").includes(id));
  s.scoreLog = s.scoreLog.filter((l) => l.a !== id && l.b !== id);
  for (const r of s.reports) if (r.reporterId === id) r.reporterId = "deleted";
}
