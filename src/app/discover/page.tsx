import Link from "next/link";
import { requireStudent } from "@/lib/dal/session";
import { discoverDeck } from "@/lib/dal/matching";
import { Notice, SampleDataBadge } from "@/components/ui";
import { DiscoverDeck } from "./DiscoverDeck";

export default async function DiscoverPage() {
  const me = await requireStudent();
  const deck = discoverDeck(me);
  const simulationDone = Object.keys(me.simulation).length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-extrabold tracking-tight">Discover</h1>
        <SampleDataBadge />
      </div>
      {!me.consent.matching ? (
        <Notice tone="warn">
          Matching is off, so nobody can see you and you can&apos;t see anyone. Turn it on in{" "}
          <Link className="font-semibold underline" href="/settings">
            Privacy
          </Link>
          .
        </Notice>
      ) : (
        <>
          {!simulationDone && (
            <Notice>
              Take the{" "}
              <Link className="font-semibold underline" href="/simulation">
                Living Simulation
              </Link>{" "}
              so scores reflect what you&apos;d actually do.
            </Notice>
          )}
          <DiscoverDeck initial={deck} />
        </>
      )}
    </div>
  );
}
