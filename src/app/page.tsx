import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/dal/session";
import { Notice, SampleDataBadge } from "@/components/ui";
import { demoLogin, resetDemo } from "./actions";

const PROMISES = [
  ["🔒", "Only what matching needs", "No zodiac, MBTI, phone number or surname. Others see an age band, not your age."],
  ["🫥", "Revealed step by step", "Score first. Photos stay blurred and chat stays closed until you both say yes."],
  ["🚩", "Report and block everywhere", "On every profile, chat and listing. Reports are reviewed within 48 hours."],
] as const;

export default async function Home({ searchParams }: PageProps<"/">) {
  const session = await getSession();
  const { deleted } = await searchParams;
  if (session?.role === "student") redirect("/discover");
  if (session?.role === "owner") redirect("/owner");
  if (session?.role === "admin") redirect("/admin");

  return (
    <div className="space-y-8">
      {deleted && <Notice tone="ok">Your account and everything tied to it has been deleted.</Notice>}

      <section className="flex flex-col items-center gap-4 pt-8 text-center">
        <SampleDataBadge />
        <h1 className="max-w-md text-4xl font-extrabold tracking-tight">
          Find your perfect <span className="text-brand">dormmate</span>.
        </h1>
        <p className="max-w-sm text-muted">See how well you&apos;d live together before you share anything personal. Then find a room that fits you both.</p>
        <div className="mt-2 flex w-full max-w-xs flex-col gap-2.5">
          <Link href="/onboarding" className="btn-primary">
            Create my profile
          </Link>
          <form action={demoLogin.bind(null, "student")}>
            <button className="btn-secondary w-full">Try as sample student</button>
          </form>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        {PROMISES.map(([icon, t, d]) => (
          <div key={t} className="card">
            <span className="text-2xl" aria-hidden>
              {icon}
            </span>
            <h2 className="mt-2 font-bold">{t}</h2>
            <p className="mt-1 text-sm text-muted">{d}</p>
          </div>
        ))}
      </section>

      <section className="card space-y-3">
        <h2 className="font-bold">Prototype views</h2>
        <p className="text-sm text-muted">Demo logins for reviewing the other sides. Not real accounts; data resets when the server restarts.</p>
        <div className="flex flex-wrap gap-2">
          <form action={demoLogin.bind(null, "owner")}>
            <button className="btn-secondary">Dorm owner view</button>
          </form>
          <form action={demoLogin.bind(null, "admin")}>
            <button className="btn-secondary">Safety review queue</button>
          </form>
          <form action={resetDemo}>
            <button className="btn-secondary">Reset sample data</button>
          </form>
        </div>
      </section>

      <p className="text-center text-xs text-muted">Prototype running on sample data. Scores are decision support, not a verdict on anyone.</p>
    </div>
  );
}
