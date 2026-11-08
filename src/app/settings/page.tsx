import { requireStudent } from "@/lib/dal/session";
import { Notice, PageTitle } from "@/components/ui";
import { deleteAccount, saveConsent } from "@/app/actions";

const TOGGLES = [
  ["matching", "Use my answers to find matches", "Off hides you from everyone and pauses your matches."],
  ["photoToMatches", "Show my photo to matches", "Blurred until you both accept."],
  ["checkinsForScoring", "Use my 30 and 90-day check-ins to improve scoring", "Never shown to your roommate or owner."],
  ["universityReports", "Include me in anonymized university reports", "Groups of 10 or more only."],
] as const;

export default async function SettingsPage({ searchParams }: PageProps<"/settings">) {
  const me = await requireStudent();
  const { saved, confirm } = await searchParams;

  return (
    <div className="space-y-5">
      <PageTitle title="Privacy" sub="What Livora may do with your data. Change it anytime." />
      {saved && <Notice tone="ok">Saved.</Notice>}

      <form action={saveConsent} className="card space-y-4">
        {TOGGLES.map(([key, label, help]) => (
          <label key={key} className="flex items-start gap-3">
            <input type="checkbox" name={key} defaultChecked={me.consent[key]} className="mt-1 size-4" />
            <span>
              <span className="block text-sm font-medium">{label}</span>
              <span className="block text-xs text-muted">{help}</span>
            </span>
          </label>
        ))}
        <button className="btn-primary">Save choices</button>
      </form>

      <section className="card space-y-2">
        <h2 className="font-semibold">What others see about you</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
          <li>Students in {me.schoolCluster}: your first name, age band, score and friction points. Your photo (if on) is blurred until you both accept.</li>
          <li>Dorm owners, only when you inquire: first name, school cluster, move-in month and group size.</li>
          <li>Nobody sees your answers, simulation choices, budget, school email or year of birth.</li>
        </ul>
      </section>

      <section className="card space-y-3">
        <h2 className="font-semibold">Your data</h2>
        <a href="/api/my-data" className="btn-secondary">
          Download my data (JSON)
        </a>
        <form action={deleteAccount} className="space-y-2 border-t border-line pt-3">
          <p className="text-sm">
            Delete your account, answers, matches and messages. Reports other students filed about safety are kept so they can still be reviewed.
          </p>
          {confirm && <p className="text-sm text-danger">Type DELETE to confirm.</p>}
          <label className="label" htmlFor="confirm">
            Type DELETE to confirm
          </label>
          <input id="confirm" name="confirm" className="field" autoComplete="off" />
          <button className="btn-danger">Delete my account</button>
        </form>
      </section>
    </div>
  );
}
