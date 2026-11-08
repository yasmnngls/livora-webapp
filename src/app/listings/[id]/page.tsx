import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStudent } from "@/lib/dal/session";
import { getListing } from "@/lib/dal/listings";
import { AMENITY_LABELS, Notice, ScoreBadge, peso } from "@/components/ui";
import { ReportBlockMenu } from "@/components/ReportBlockMenu";
import { InquiryForm } from "./InquiryForm";

const POLICY = { women: "Women only", men: "Men only", mixed: "Any gender" } as const;

export default async function ListingPage({ params }: PageProps<"/listings/[id]">) {
  const me = await requireStudent();
  const { id } = await params;
  const l = getListing(me, id);
  if (!l) notFound();

  return (
    <div className="space-y-4">
      <Link href="/listings" className="text-sm text-muted hover:text-text">
        ← All rooms
      </Link>
      <section className="card space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold">{l.title}</h1>
            <p className="text-sm text-muted">{l.area}</p>
          </div>
          <ScoreBadge score={l.livingFit?.score ?? l.housingFit} label={l.livingFit ? "living fit" : "room fit"} />
        </div>
        <dl className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-muted">Rent</dt>
            <dd className="font-semibold">{peso(l.monthlyRent)}/mo</dd>
          </div>
          <div>
            <dt className="text-muted">Open slots</dt>
            <dd className="font-semibold">{l.openSlots}</dd>
          </div>
          <div>
            <dt className="text-muted">For</dt>
            <dd className="font-semibold">{POLICY[l.genderPolicy]}</dd>
          </div>
          <div>
            <dt className="text-muted">Room fit for you</dt>
            <dd className="font-semibold">{l.housingFit}</dd>
          </div>
        </dl>
        <div className="flex flex-wrap gap-1">
          {l.verified && <span className="chip bg-brand-soft text-brand">Verified listing</span>}
          {l.amenities.map((a) => (
            <span key={a} className="chip">
              {AMENITY_LABELS[a]}
            </span>
          ))}
        </div>
        {l.livingFit && (
          <p className="text-xs text-muted">
            Living Fit {l.livingFit.score} with {l.livingFit.withFirstName} = 60% your roommate fit + 40% the lower of your two room fits.
          </p>
        )}
      </section>

      <section className="card space-y-3">
        <h2 className="font-semibold">Address</h2>
        {l.address ? (
          <Notice tone="ok">
            <span className="font-semibold">{l.address}</span>
            <br />
            The owner accepted your inquiry. Visit in daylight and bring a friend. Don&apos;t pay a deposit before seeing the room.
          </Notice>
        ) : (
          <p className="text-sm text-muted">Hidden until the owner accepts your inquiry. The owner sees only your first name, school cluster, move-in month and group size.</p>
        )}
        {l.myInquiry ? (
          l.myInquiry.status === "pending" ? (
            <Notice>Inquiry sent for {l.myInquiry.moveInMonth}, group of {l.myInquiry.groupSize}. Waiting for the owner.</Notice>
          ) : l.myInquiry.status === "declined" ? (
            <Notice tone="warn">The owner declined this inquiry.</Notice>
          ) : null
        ) : (
          <InquiryForm listingId={l.id} maxGroup={l.openSlots} />
        )}
      </section>

      <div className="flex justify-end">
        <ReportBlockMenu target={{ kind: "listing", id: l.id }} name="this listing" />
      </div>
    </div>
  );
}
