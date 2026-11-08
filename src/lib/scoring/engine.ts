import { CATEGORY_IDS, type Amenity, type CategoryExplanation, type CategoryId, type FrictionPoint, type LivingProfile } from "@/lib/types";
import { CATEGORY_BY_ID } from "./categories";
import { SCENARIOS } from "./scenarios";

/** Logged with every score so any report can be explained later. */
export const SCORING_VERSION = "rules-v1.0";

/** A gap of this size or more on the 0..4 scale is a friction point. */
export const FRICTION_GAP = 2;
/** Points removed per dealbreaker conflict. Never rejects anyone. */
export const DEALBREAKER_PENALTY = 15;

export const LIVING_FIT_WEIGHTS = { roommate: 0.6, housing: 0.4 } as const;

export interface ScoringInput {
  profile: LivingProfile;
  dealbreakers: CategoryId[];
  simulation: Record<string, number>;
}

export interface RoommateFitResult {
  version: string;
  score: number;
  categories: CategoryExplanation[];
  frictionPoints: FrictionPoint[];
  hasDealbreakerConflict: boolean;
}

/**
 * The value used for scoring: the self-reported answer, averaged with what the
 * student's Living Simulation answers show for that category.
 */
export function effectiveValues(input: ScoringInput): Record<CategoryId, number> {
  const out = {} as Record<CategoryId, number>;
  for (const id of CATEGORY_IDS) {
    const signals = SCENARIOS.filter((s) => s.category === id && input.simulation[s.id] !== undefined).map(
      (s) => s.options[input.simulation[s.id]]?.value,
    ).filter((v): v is number => typeof v === "number");
    const self = input.profile[id].value;
    out[id] = signals.length === 0 ? self : (self + signals.reduce((a, b) => a + b, 0) / signals.length) / 2;
  }
  return out;
}

function reasonFor(alignment: number, bothCareA: number, bothCareB: number): string {
  const care = bothCareA + bothCareB >= 5 ? " It matters a lot to both of you." : "";
  if (alignment >= 0.85) return "You're closely aligned." + care;
  if (alignment >= 0.6) return "Small differences you can talk through." + care;
  return "A real difference worth discussing before moving in." + care;
}

export function roommateFit(a: ScoringInput, b: ScoringInput): RoommateFitResult {
  const va = effectiveValues(a);
  const vb = effectiveValues(b);
  let weighted = 0;
  let totalWeight = 0;
  const categories: CategoryExplanation[] = [];
  const frictionPoints: FrictionPoint[] = [];
  let conflicts = 0;

  for (const id of CATEGORY_IDS) {
    const gap = Math.abs(va[id] - vb[id]);
    const alignment = 1 - gap / 4;
    const weight = a.profile[id].importance + b.profile[id].importance;
    weighted += alignment * weight;
    totalWeight += weight;
    categories.push({
      id,
      label: CATEGORY_BY_ID[id].label,
      score: Math.round(alignment * 100),
      reason: reasonFor(alignment, a.profile[id].importance, b.profile[id].importance),
    });
    if (gap >= FRICTION_GAP) {
      const dealbreaker = a.dealbreakers.includes(id) || b.dealbreakers.includes(id);
      if (dealbreaker) conflicts++;
      frictionPoints.push({ category: id, text: CATEGORY_BY_ID[id].friction, dealbreaker });
    }
  }

  const base = (weighted / totalWeight) * 100;
  const score = Math.max(0, Math.round(base - conflicts * DEALBREAKER_PENALTY));
  frictionPoints.sort((x, y) => Number(y.dealbreaker) - Number(x.dealbreaker));
  return { version: SCORING_VERSION, score, categories, frictionPoints, hasDealbreakerConflict: conflicts > 0 };
}

export interface HousingNeeds {
  budgetMin: number;
  budgetMax: number;
  mustHaves: Amenity[];
}

/** 0..100: how well a room meets budget (60%) and must-haves (40%). */
export function housingFit(needs: HousingNeeds, rent: number, amenities: Amenity[]): number {
  let budget: number;
  if (rent <= needs.budgetMax) budget = 1;
  else budget = Math.max(0, 1 - (rent - needs.budgetMax) / Math.max(needs.budgetMax * 0.5, 1));
  const met = needs.mustHaves.length === 0 ? 1 : needs.mustHaves.filter((m) => amenities.includes(m)).length / needs.mustHaves.length;
  return Math.round((budget * 0.6 + met * 0.4) * 100);
}

/** For a pair, the stricter (lower) housing fit of the two governs. */
export function livingFit(roommate: number, housing: number): number {
  return Math.round(LIVING_FIT_WEIGHTS.roommate * roommate + LIVING_FIT_WEIGHTS.housing * housing);
}
