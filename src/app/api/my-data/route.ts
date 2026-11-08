import { getSession } from "@/lib/dal/session";
import { exportMyData } from "@/lib/dal/account";

export async function GET() {
  const session = await getSession();
  if (session?.role !== "student") return new Response("Not found", { status: 404 });
  return new Response(JSON.stringify(exportMyData(session.student), null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": 'attachment; filename="livora-my-data.json"',
      "Cache-Control": "private, no-store",
    },
  });
}
