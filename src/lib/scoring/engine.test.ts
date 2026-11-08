import { describe, expect, it } from "vitest";
import { CATEGORY_IDS, type Importance, type LivingProfile } from "@/lib/types";
import { DEALBREAKER_PENALTY, housingFit, livingFit, roommateFit, type ScoringInput } from "./engine";

function profile(value: number, importance: Importance = 2): LivingProfile {
  return Object.fromEntries(CATEGORY_IDS.map((id) => [id, { value, importance }])) as LivingProfile;
}
const person = (p: LivingProfile, dealbreakers: ScoringInput["dealbreakers"] = [], simulation = {}): ScoringInput => ({
  profile: p,
  dealbreakers,
  simulation,
});

describe("roommateFit", () => {
  it("scores identical answers 100 with no friction", () => {
    const r = roommateFit(person(profile(2)), person(profile(2)));
    expect(r.score).toBe(100);
    expect(r.frictionPoints).toEqual([]);
    expect(r.categories).toHaveLength(9);
  });

  it("is symmetric", () => {
    const a = profile(1);
    a.sleep = { value: 4, importance: 3 };
    const b = profile(3);
    expect(roommateFit(person(a), person(b)).score).toBe(roommateFit(person(b), person(a)).score);
  });

  it("names friction points without revealing either answer", () => {
    const a = profile(2);
    a.sleep = { value: 0, importance: 2 };
    const b = profile(2);
    b.sleep = { value: 4, importance: 2 };
    const r = roommateFit(person(a), person(b));
    expect(r.frictionPoints).toEqual([{ category: "sleep", text: "You keep different sleep schedules.", dealbreaker: false }]);
    expect(r.frictionPoints[0].text).not.toMatch(/10pm|2am/);
  });

  it("reduces the score for a dealbreaker conflict and flags it, but never rejects", () => {
    const a = profile(2);
    a.cleanliness = { value: 4, importance: 3 };
    const b = profile(2);
    b.cleanliness = { value: 0, importance: 3 };
    const plain = roommateFit(person(a), person(b));
    const withDealbreaker = roommateFit(person(a, ["cleanliness"]), person(b));
    expect(withDealbreaker.score).toBe(plain.score - DEALBREAKER_PENALTY);
    expect(withDealbreaker.hasDealbreakerConflict).toBe(true);
    expect(withDealbreaker.frictionPoints[0].dealbreaker).toBe(true);
  });

  it("weights categories by how much both people care", () => {
    const a = profile(2, 1);
    const b = profile(2, 1);
    b.noise = { value: 4, importance: 1 };
    const low = roommateFit(person(a), person(b)).score;
    a.noise = { value: 2, importance: 3 };
    b.noise = { value: 4, importance: 3 };
    const high = roommateFit(person(a), person(b)).score;
    expect(high).toBeLessThan(low);
  });

  it("blends Living Simulation behaviour into the self-reported value", () => {
    const a = profile(2);
    const b = profile(2);
    // b says privacy 2 but answers the guest scenario with "It's fine" (0) -> effective 1
    const r = roommateFit(person(a), person(b, [], { "overnight-guest": 0 }));
    expect(r.categories.find((c) => c.id === "privacy")!.score).toBe(75);
  });
});

describe("housingFit and livingFit", () => {
  const needs = { budgetMin: 4000, budgetMax: 6000, mustHaves: ["wifi", "aircon"] as const };
  it("is 100 within budget with all must-haves", () => {
    expect(housingFit({ ...needs, mustHaves: [...needs.mustHaves] }, 5500, ["wifi", "aircon", "laundry"])).toBe(100);
  });
  it("drops when over budget or missing must-haves", () => {
    expect(housingFit({ ...needs, mustHaves: [...needs.mustHaves] }, 7500, ["wifi"])).toBe(50);
  });
  it("combines 60/40", () => {
    expect(livingFit(80, 50)).toBe(68);
  });
});
