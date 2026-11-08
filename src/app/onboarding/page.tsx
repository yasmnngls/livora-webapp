import { redirect } from "next/navigation";
import { getSession } from "@/lib/dal/session";
import { SCHOOL_DOMAINS } from "@/lib/mock/seed";
import { DEMO_VERIFICATION_CODE } from "@/lib/dal/account";
import { OnboardingForm } from "./OnboardingForm";

export default async function OnboardingPage() {
  if (await getSession()) redirect("/");
  return <OnboardingForm domains={Object.keys(SCHOOL_DOMAINS)} demoCode={DEMO_VERIFICATION_CODE} />;
}
