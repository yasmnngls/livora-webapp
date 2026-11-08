import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/mock/store";
import type { Owner, Student } from "@/lib/types";

// DEMO SESSION ONLY. The cookie holds a plain role and id so the prototype can
// switch between sample accounts. Real auth (verified school email, Supabase
// sessions) replaces this before any real student data is stored.
const COOKIE = "livora_demo_session";

export type Session =
  | { role: "student"; student: Student }
  | { role: "owner"; owner: Owner }
  | { role: "admin" }
  | null;

export const getSession = cache(async (): Promise<Session> => {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;
  const [role, id] = raw.split(":");
  const s = db();
  if (role === "student") {
    const student = s.students.find((x) => x.id === id);
    return student ? { role, student } : null;
  }
  if (role === "owner") {
    const owner = s.owners.find((x) => x.id === id);
    return owner ? { role, owner } : null;
  }
  if (role === "admin") return { role };
  return null;
});

export async function requireStudent(): Promise<Student> {
  const s = await getSession();
  if (s?.role !== "student") redirect("/");
  return s.student;
}

export async function requireOwner(): Promise<Owner> {
  const s = await getSession();
  if (s?.role !== "owner") redirect("/");
  return s.owner;
}

export async function requireAdmin(): Promise<void> {
  const s = await getSession();
  if (s?.role !== "admin") redirect("/");
}

/** Only call from a Server Action or Route Handler. */
export async function setSession(value: `student:${string}` | `owner:${string}` | "admin") {
  (await cookies()).set(COOKIE, value, { httpOnly: true, sameSite: "lax", path: "/" });
}

export async function clearSession() {
  (await cookies()).delete(COOKIE);
}
