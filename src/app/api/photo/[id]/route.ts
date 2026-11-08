import { readFile } from "node:fs/promises";
import path from "node:path";
import { getSession } from "@/lib/dal/session";
import { canSee, isMutual } from "@/lib/dal/matching";
import { db } from "@/lib/mock/store";

// The only way to get a student photo. Before a mutual accept the server sends
// a separately rendered blurred file, so the full image never reaches the browser.
export async function GET(_req: Request, ctx: RouteContext<"/api/photo/[id]">) {
  const { id } = await ctx.params;
  const session = await getSession();
  if (session?.role !== "student") return new Response("Not found", { status: 404 });
  const viewer = session.student;
  const target = db().students.find((s) => s.id === id);
  if (!target?.photo) return new Response("Not found", { status: 404 });

  let variant: "full" | "blurred";
  if (target.id === viewer.id) variant = "full";
  else if (!canSee(viewer, target) || !target.consent.photoToMatches) return new Response("Not found", { status: 404 });
  else variant = isMutual(viewer.id, target.id) ? "full" : "blurred";

  const file = path.join(process.cwd(), "private", "photos", `${target.photo}${variant === "blurred" ? "-blurred" : ""}.png`);
  const bytes = await readFile(file);
  return new Response(bytes, {
    headers: {
      "Content-Type": "image/png",
      // Private and per-viewer: never cache in shared caches, and re-check on each view.
      "Cache-Control": "private, no-store",
    },
  });
}
