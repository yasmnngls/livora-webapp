import Link from "next/link";
import { requireStudent } from "@/lib/dal/session";
import { listListings } from "@/lib/dal/listings";
import { AMENITY_LABELS, PageTitle, SampleDataBadge, ScoreBadge, peso } from "@/components/ui";

export default async function ListingsPage() {
  const me = await requireStudent();
  const listings = listListings(me);
  const anyLivingFit = listings.some((l) => l.livingFit);

  return (
    <>
      <PageTitle
        title="Rooms"
        sub={anyLivingFit ? "Ranked by Living Fit: 60% how well you and your match fit, 40% how well the room fits you both." : "Ranked by how well each room meets your budget and must-haves."}
        aside={<SampleDataBadge />}
      />
      <ul className="space-y-3">
        {listings.map((l) => (
          <li key={l.id}>
            <Link href={`/listings/${l.id}`} className="card flex gap-3 hover:border-brand">
              <div className="min-w-0 flex-1 space-y-1">
                <p className="font-semibold">{l.title}</p>
                <p className="text-sm text-muted">
                  {l.area} · {peso(l.monthlyRent)}/mo · {l.openSlots} open
                </p>
                <div className="flex flex-wrap gap-1">
                  {l.verified && <span className="chip bg-brand-soft text-brand">Verified listing</span>}
                  {l.amenities.slice(0, 3).map((a) => (
                    <span key={a} className="chip">
                      {AMENITY_LABELS[a]}
                    </span>
                  ))}
                </div>
                {l.livingFit && <p className="text-xs text-muted">Living Fit with {l.livingFit.withFirstName}</p>}
              </div>
              <ScoreBadge score={l.livingFit?.score ?? l.housingFit} label={l.livingFit ? "living fit" : "room fit"} />
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-xs text-muted">Exact addresses are hidden until the owner accepts your inquiry.</p>
    </>
  );
}
