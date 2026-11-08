"use client";

import { useActionState } from "react";
import { ownerCreateListing } from "@/app/actions";
import { AMENITY_LABELS } from "@/components/ui";
import { AMENITIES } from "@/lib/types";

export function NewListingForm() {
  const [state, action, pending] = useActionState(ownerCreateListing, null);
  return (
    <form action={action} className="card space-y-4">
      <div>
        <label className="label" htmlFor="title">
          Title
        </label>
        <input id="title" name="title" className="field" required minLength={5} maxLength={80} />
      </div>
      <div>
        <label className="label" htmlFor="area">
          Area shown to students
        </label>
        <input id="area" name="area" className="field" required placeholder="Sampaloc, near Dapitan" maxLength={80} />
      </div>
      <div>
        <label className="label" htmlFor="address">
          Full address (private)
        </label>
        <input id="address" name="address" className="field" required />
        <p className="mt-1 text-xs text-muted">Only shared with a student after you accept their inquiry.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="rent">
            Rent (₱/month)
          </label>
          <input id="rent" name="monthlyRent" className="field" inputMode="numeric" required />
        </div>
        <div>
          <label className="label" htmlFor="slots">
            Open slots
          </label>
          <input id="slots" name="openSlots" className="field" inputMode="numeric" defaultValue={1} required />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="policy">
          For
        </label>
        <select id="policy" name="genderPolicy" className="field" defaultValue="mixed">
          <option value="women">Women only</option>
          <option value="men">Men only</option>
          <option value="mixed">Any gender</option>
        </select>
      </div>
      <fieldset>
        <legend className="label">Amenities</legend>
        <div className="flex flex-wrap gap-3">
          {AMENITIES.map((a) => (
            <label key={a} className="flex items-center gap-1.5 text-sm">
              <input type="checkbox" name="amenities" value={a} />
              {AMENITY_LABELS[a]}
            </label>
          ))}
        </div>
      </fieldset>
      {state && "error" in state && <p className="text-sm text-danger">{state.error}</p>}
      <button className="btn-primary" disabled={pending}>
        {pending ? "Submitting…" : "Submit for verification"}
      </button>
    </form>
  );
}
