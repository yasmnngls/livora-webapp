import { requireOwner } from "@/lib/dal/session";
import { PageTitle } from "@/components/ui";
import { NewListingForm } from "./NewListingForm";

export default async function NewListingPage() {
  await requireOwner();
  return (
    <>
      <PageTitle title="New listing" sub="Students see the area, not the address, until you accept their inquiry." />
      <NewListingForm />
    </>
  );
}
