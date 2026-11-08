import { requireStudent } from "@/lib/dal/session";
import { SCENARIOS } from "@/lib/scoring/scenarios";
import { PageTitle } from "@/components/ui";
import { SimulationForm } from "./SimulationForm";

export default async function SimulationPage() {
  const me = await requireStudent();
  return (
    <>
      <PageTitle
        title="Living Simulation"
        sub="Eight everyday situations. Pick what you'd actually do. Your answers are private and only adjust your scores."
      />
      <SimulationForm scenarios={SCENARIOS} initial={me.simulation} />
    </>
  );
}
