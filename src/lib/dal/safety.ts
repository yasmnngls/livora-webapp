import "server-only";
import { db, nextId } from "@/lib/mock/store";
import type { Report, ReportReason, ReportTarget, Student } from "@/lib/types";
import { withdrawInterest } from "./matching";

export const REPORT_REASONS: Record<ReportReason, string> = {
  harassment: "Harassment or threats",
  fake_profile: "Fake profile or impersonation",
  unsafe_listing: "Unsafe or misleading listing",
  scam: "Asked for money or ID",
  other: "Something else",
};
export const REVIEW_HOURS = 48;

/** Silent block: both people disappear from each other's matches and chat. */
export function blockStudent(viewer: Student, otherId: string): boolean {
  const s = db();
  if (otherId === viewer.id || !s.students.some((x) => x.id === otherId)) return false;
  if (!s.blocks.some((b) => b.blockerId === viewer.id && b.blockedId === otherId)) {
    s.blocks.push({ blockerId: viewer.id, blockedId: otherId });
  }
  withdrawInterest(viewer, otherId);
  return true;
}

export function createReport(viewer: Student, target: ReportTarget, reason: ReportReason, details: string): string | null {
  const s = db();
  if (!(reason in REPORT_REASONS)) return "Pick a reason.";
  const exists = target.kind === "student" ? s.students.some((x) => x.id === target.id) : s.listings.some((x) => x.id === target.id);
  if (!exists || (target.kind === "student" && target.id === viewer.id)) return "Nothing to report here.";
  s.reports.push({
    id: nextId("r"),
    reporterId: viewer.id,
    target,
    reason,
    details: details.trim().slice(0, 1000),
    createdAt: new Date().toISOString(),
    status: "open",
  });
  return null;
}

// ---------- Admin ----------

export interface AdminReportView {
  id: string;
  targetKind: ReportTarget["kind"];
  targetId: string;
  targetLabel: string;
  reason: string;
  details: string;
  createdAt: string;
  dueAt: string;
  status: Report["status"];
  targetSuspended: boolean;
}

export function adminReports(): AdminReportView[] {
  const s = db();
  return s.reports
    .map((r) => {
      const label =
        r.target.kind === "student"
          ? `Student ${s.students.find((x) => x.id === r.target.id)?.firstName ?? "(deleted)"} · ${r.target.id}`
          : `Listing "${s.listings.find((x) => x.id === r.target.id)?.title ?? "(removed)"}"`;
      return {
        id: r.id,
        targetKind: r.target.kind,
        targetId: r.target.id,
        targetLabel: label,
        reason: REPORT_REASONS[r.reason],
        details: r.details,
        createdAt: r.createdAt,
        dueAt: new Date(new Date(r.createdAt).getTime() + REVIEW_HOURS * 3600_000).toISOString(),
        status: r.status,
        targetSuspended: s.suspendedIds.has(r.target.id),
      };
    })
    .sort((a, b) => Number(a.status !== "open") - Number(b.status !== "open") || a.createdAt.localeCompare(b.createdAt));
}

export function resolveReport(id: string, outcome: "dismissed" | "actioned"): boolean {
  const s = db();
  const r = s.reports.find((x) => x.id === id);
  if (!r) return false;
  r.status = outcome;
  // "Actioned" suspends the profile or listing: it disappears from every view.
  if (outcome === "actioned") s.suspendedIds.add(r.target.id);
  return true;
}

export function pendingListings() {
  return db().listings.filter((l) => !l.verified).map((l) => ({ id: l.id, title: l.title, area: l.area, monthlyRent: l.monthlyRent }));
}

export function verifyListing(id: string): boolean {
  const l = db().listings.find((x) => x.id === id);
  if (!l) return false;
  l.verified = true;
  return true;
}
