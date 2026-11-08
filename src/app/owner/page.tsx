import Link from "next/link";
import { requireOwner } from "@/lib/dal/session";
import { ownerInquiries, ownerListings } from "@/lib/dal/listings";
import { Notice, PageTitle, SampleDataBadge, peso } from "@/components/ui";
import { ownerDecide } from "@/app/actions";

export default async function OwnerPage({ searchParams }: PageProps<"/owner">) {
  const owner = await requireOwner();
  const { created } = await searchParams;
  const inquiries = ownerInquiries(owner);
  const listings = ownerListings(owner);

  return (
    <div className="space-y-6">
      <PageTitle title="Inquiries" sub="Students who asked about your rooms. Accepting shares the address with that student." aside={<SampleDataBadge />} />
      {created && <Notice tone="ok">Listing submitted. It stays hidden from students until Livora verifies it.</Notice>}

      <section className="space-y-3">
        {inquiries.length === 0 ? (
          <div className="card text-sm text-muted">No inquiries yet. Try sending one from the sample student view.</div>
        ) : (
          inquiries.map((q) => (
            <div key={q.id} className="card flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0 text-sm">
                <p className="font-semibold">
                  {q.firstName} · {q.schoolCluster}
                </p>
                <p className="text-muted">
                  {q.listingTitle} · move in {q.moveInMonth} · group of {q.groupSize}
                </p>
              </div>
              {q.status === "pending" ? (
                <div className="flex gap-2">
                  <form action={ownerDecide.bind(null, q.id, "declined")}>
                    <button className="btn-secondary">Decline</button>
                  </form>
                  <form action={ownerDecide.bind(null, q.id, "accepted")}>
                    <button className="btn-primary">Accept</button>
                  </form>
                </div>
              ) : (
                <span className={`chip ${q.status === "accepted" ? "bg-brand-soft text-brand" : ""}`}>{q.status === "accepted" ? "Accepted, address shared" : "Declined"}</span>
              )}
            </div>
          ))
        )}
        <p className="text-xs text-muted">Owners never see students&apos; profiles, answers, scores or contact details.</p>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-bold">Your listings</h2>
          <Link href="/owner/new" className="btn-secondary">
            New listing
          </Link>
        </div>
        {listings.map((l) => (
          <div key={l.id} className="card text-sm">
            <p className="font-semibold">{l.title}</p>
            <p className="text-muted">
              {l.area} · {peso(l.monthlyRent)}/mo · {l.openSlots} open · {l.verified ? "Verified" : "Pending verification"}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}
