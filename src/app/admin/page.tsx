import { requireAdmin } from "@/lib/dal/session";
import { adminReports, pendingListings } from "@/lib/dal/safety";
import { PageTitle, SampleDataBadge, peso } from "@/components/ui";
import { adminResolve, adminVerifyListing } from "@/app/actions";

function due(dueAt: string) {
  const hours = Math.round((new Date(dueAt).getTime() - Date.now()) / 3600_000);
  return hours >= 0 ? `${hours}h left of 48h` : `Overdue by ${-hours}h`;
}

export default async function AdminPage() {
  await requireAdmin();
  const reports = adminReports();
  const listings = pendingListings();
  const open = reports.filter((r) => r.status === "open");

  return (
    <div className="space-y-6">
      <PageTitle title="Safety review" sub={`${open.length} open report${open.length === 1 ? "" : "s"}. Every report gets a decision within 48 hours.`} aside={<SampleDataBadge />} />

      <section className="space-y-3">
        {reports.length === 0 && <div className="card text-sm text-muted">No reports. File one from the sample student view to see it here.</div>}
        {reports.map((r) => (
          <div key={r.id} className="card space-y-2 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold">{r.reason}</p>
              <span className={`chip ${r.status === "open" ? "bg-warn-soft text-warn" : ""}`}>{r.status === "open" ? due(r.dueAt) : r.status}</span>
            </div>
            <p className="text-muted">
              About: {r.targetLabel}
              {r.targetSuspended && " · suspended"}
            </p>
            {r.details && <p className="whitespace-pre-wrap rounded-xl bg-surface-2 p-2">{r.details}</p>}
            <p className="text-xs text-muted">Reporter identity is hidden from the reported person.</p>
            {r.status === "open" && (
              <div className="flex flex-wrap gap-2">
                <form action={adminResolve.bind(null, r.id, "dismissed")}>
                  <button className="btn-secondary">Dismiss</button>
                </form>
                <form action={adminResolve.bind(null, r.id, "actioned")}>
                  <button className="btn-danger">Suspend {r.targetKind === "student" ? "profile" : "listing"}</button>
                </form>
              </div>
            )}
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Listings waiting for verification</h2>
        {listings.length === 0 && <div className="card text-sm text-muted">None.</div>}
        {listings.map((l) => (
          <div key={l.id} className="card flex flex-wrap items-center justify-between gap-2 text-sm">
            <span>
              <span className="font-semibold">{l.title}</span> · {l.area} · {peso(l.monthlyRent)}
            </span>
            <form action={adminVerifyListing.bind(null, l.id)}>
              <button className="btn-primary">Mark verified</button>
            </form>
          </div>
        ))}
      </section>
    </div>
  );
}
