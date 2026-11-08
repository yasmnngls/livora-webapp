"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createStudent, deleteStudent, saveSimulation, updateConsent, type OnboardingInput } from "@/lib/dal/account";
import { sendMessage } from "@/lib/dal/chat";
import { createInquiry, createListing, decideInquiry } from "@/lib/dal/listings";
import { clearPasses, discoverDeck, expressInterest, passCandidate, withdrawInterest } from "@/lib/dal/matching";
import { blockStudent, createReport, resolveReport, verifyListing } from "@/lib/dal/safety";
import { clearSession, requireAdmin, requireOwner, requireStudent, setSession } from "@/lib/dal/session";
import { db, resetStore } from "@/lib/mock/store";
import { seedStudents } from "@/lib/mock/seed";
import { AMENITIES, type Amenity, type Listing, type ReportReason, type ReportTarget } from "@/lib/types";

// Every action re-checks the session and validates its input on the server.

export type ActionResult = { error: string } | { ok: true };

// ---------- Demo sessions ----------

export async function demoLogin(as: "student" | "owner" | "admin") {
  if (as === "student") {
    // The sample student may have been deleted from the Privacy page; bring her back.
    const s = db();
    if (!s.students.some((x) => x.id === "s1")) s.students.push(seedStudents().find((x) => x.id === "s1")!);
    await setSession("student:s1");
  } else if (as === "owner") await setSession("owner:o1");
  else await setSession("admin");
  redirect(as === "student" ? "/discover" : as === "owner" ? "/owner" : "/admin");
}

export async function logout() {
  await clearSession();
  redirect("/");
}

export async function resetDemo() {
  resetStore();
  await clearSession();
  redirect("/");
}

// ---------- Onboarding ----------

export async function completeOnboarding(input: OnboardingInput): Promise<ActionResult> {
  const r = createStudent(input);
  if ("error" in r) return r;
  await setSession(`student:${r.student.id}`);
  redirect("/simulation");
}

export async function submitSimulation(answers: Record<string, number>): Promise<ActionResult> {
  const me = await requireStudent();
  const err = saveSimulation(me, answers);
  if (err) return { error: err };
  revalidatePath("/discover");
  redirect("/discover");
}

// ---------- Matching ----------

export async function setInterest(candidateId: string, interested: boolean): Promise<{ mutual: boolean }> {
  const me = await requireStudent();
  let mutual = false;
  if (interested) mutual = expressInterest(me, candidateId)?.mutual ?? false;
  else withdrawInterest(me, candidateId);
  revalidatePath("/matches");
  revalidatePath(`/matches/${candidateId}`);
  return { mutual };
}

export async function pass(candidateId: string) {
  const me = await requireStudent();
  passCandidate(me, candidateId);
}

/** Clears private passes and returns the fresh deck (view models only). */
export async function restartDiscover() {
  const me = await requireStudent();
  clearPasses(me);
  return discoverDeck(me);
}

// ---------- Safety ----------

export async function block(studentId: string) {
  const me = await requireStudent();
  blockStudent(me, studentId);
  revalidatePath("/matches");
  redirect("/matches?blocked=1");
}

export async function report(target: ReportTarget, reason: ReportReason, details: string): Promise<ActionResult> {
  const me = await requireStudent();
  const err = createReport(me, target, reason, String(details ?? ""));
  return err ? { error: err } : { ok: true };
}

// ---------- Chat ----------

export async function chat(otherId: string, body: string): Promise<ActionResult> {
  const me = await requireStudent();
  const err = sendMessage(me, otherId, String(body ?? ""));
  if (err) return { error: err };
  revalidatePath(`/chat/${otherId}`);
  return { ok: true };
}

// ---------- Listings ----------

export async function inquire(listingId: string, moveInMonth: string, groupSize: number): Promise<ActionResult> {
  const me = await requireStudent();
  const err = createInquiry(me, listingId, String(moveInMonth), Number(groupSize));
  if (err) return { error: err };
  revalidatePath(`/listings/${listingId}`);
  return { ok: true };
}

// ---------- Settings ----------

export async function saveConsent(formData: FormData) {
  const me = await requireStudent();
  updateConsent(me, {
    matching: formData.get("matching") === "on",
    photoToMatches: formData.get("photoToMatches") === "on",
    checkinsForScoring: formData.get("checkinsForScoring") === "on",
    universityReports: formData.get("universityReports") === "on",
  });
  revalidatePath("/settings");
  redirect("/settings?saved=1");
}

export async function deleteAccount(formData: FormData) {
  const me = await requireStudent();
  if (formData.get("confirm") !== "DELETE") redirect("/settings?confirm=1");
  deleteStudent(me);
  await clearSession();
  redirect("/?deleted=1");
}

// ---------- Owner ----------

export async function ownerDecide(inquiryId: string, decision: "accepted" | "declined") {
  const owner = await requireOwner();
  decideInquiry(owner, inquiryId, decision === "accepted" ? "accepted" : "declined");
  revalidatePath("/owner");
}

export async function ownerCreateListing(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const owner = await requireOwner();
  const title = String(formData.get("title") ?? "").trim();
  const area = String(formData.get("area") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const monthlyRent = Math.round(Number(formData.get("monthlyRent")));
  const openSlots = Math.round(Number(formData.get("openSlots")));
  const genderPolicy = String(formData.get("genderPolicy")) as Listing["genderPolicy"];
  const amenities = formData.getAll("amenities").map(String).filter((a): a is Amenity => (AMENITIES as readonly string[]).includes(a));
  if (title.length < 5 || title.length > 80) return { error: "Title must be 5 to 80 characters." };
  if (area.length < 3 || area.length > 80) return { error: "Describe the area in 3 to 80 characters (no street address)." };
  if (address.length < 5) return { error: "Enter the full address. Students only see it after you accept their inquiry." };
  if (!(monthlyRent >= 1000 && monthlyRent <= 50000)) return { error: "Rent must be between ₱1,000 and ₱50,000." };
  if (!(openSlots >= 1 && openSlots <= 10)) return { error: "Open slots must be 1 to 10." };
  if (!["women", "men", "mixed"].includes(genderPolicy)) return { error: "Pick who the room is for." };
  createListing(owner, { title, area, address, monthlyRent, openSlots, genderPolicy, amenities });
  revalidatePath("/owner");
  redirect("/owner?created=1");
}

// ---------- Admin ----------

export async function adminResolve(reportId: string, outcome: "dismissed" | "actioned") {
  await requireAdmin();
  resolveReport(reportId, outcome === "actioned" ? "actioned" : "dismissed");
  revalidatePath("/admin");
}

export async function adminVerifyListing(listingId: string) {
  await requireAdmin();
  verifyListing(listingId);
  revalidatePath("/admin");
}

