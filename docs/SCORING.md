# Scoring: how compatibility is calculated

**Engine version:** `rules-v1.0` (`SCORING_VERSION` in `src/lib/scoring/engine.ts`). **Tests:** `src/lib/scoring/engine.test.ts`.

Livora's scores are **decision support, not a verdict**. The engine never hides, filters out or rejects anyone because of a score. It ranks, explains, and warns.

## 1. Three scores

| Score | Question it answers | Range | Shown where |
|---|---|---|---|
| **Roommate Fit** | How well would these two people live together? | 0–100 | Discover cards, Matches, score explanation |
| **Housing Fit** | How well does this room suit this student's budget and must-haves? | 0–100 | Rooms |
| **Living Fit** | How well would this pair do in this room? | 0–100 | Rooms, when you have a mutual match |

## 2. Inputs

Each student answers the **Living Profile**: 9 categories, each on a 0–4 scale, plus an importance:

| Category | Question | 0 → 4 |
|---|---|---|
| Sleep | When do you usually sleep on school nights? | Before 10pm → After 2am |
| Cleanliness | How tidy do you keep shared spaces? | Relaxed → Spotless always |
| Noise | How much noise are you comfortable with at home? | Near silence → Loud is fine |
| Social | How social do you want home to be? | Private retreat → Always social |
| Study | Where and how do you study? | Never at home → Always at home, needs silence |
| Food | How do you handle food and cooking? | Never cook → Cook daily, happy to share |
| Temperature | What room temperature do you prefer? | Very cold aircon → No aircon or fan |
| Privacy | How much personal space do you need? | Share everything → Strict personal space |
| Responsibilities | How should chores and bills be handled? | Whoever has time → Strict schedule and split |

All five scale labels per category are in `src/lib/scoring/categories.ts`, which is the source of truth.

- **Importance:** 1 = nice to have, 2 = matters, 3 = very important.
- **Dealbreakers:** up to 3 categories where a big difference really matters.
- **Living Simulation:** 8 scenarios, each tied to one category. Each answer option carries a 0–4 value for that category.

| Scenario id | Category | Source |
|---|---|---|
| `overnight-guest` | Privacy | Concept note |
| `unpaid-bill` | Responsibilities | Concept note |
| `exam-week` | Noise | Draft |
| `dishes` | Cleanliness | Draft |
| `late-night` | Sleep | Draft |
| `aircon` | Temperature | Draft |
| `weekend-hangout` | Social | Draft |
| `shared-food` | Food | Draft |

The six draft scenarios still need a wording review ([PRD open questions](../.agents/PRD.md#14-open-questions)).

## 3. Roommate Fit

For two students A and B:

**Step 1. Effective value per category.** If the student answered simulation scenarios for that category, average the scenario values, then average that with the self-reported value:

```
effective = self                                   (no simulation answer)
effective = (self + mean(scenario values)) / 2     (with simulation answers)
```

What people *say* and what they *would do* each count for half.

**Step 2. Alignment per category.**

```
gap       = |effective_A − effective_B|        (0..4)
alignment = 1 − gap / 4                        (0..1)
weight    = importance_A + importance_B        (2..6)
```

A category that matters to both people counts up to three times as much as one neither cares about.

**Step 3. Weighted mean.**

```
base = Σ(alignment × weight) / Σ(weight) × 100
```

**Step 4. Dealbreaker penalty.** A **friction point** is any category with `gap ≥ 2` (`FRICTION_GAP`). If either person marked that category as a dealbreaker, it is a **dealbreaker conflict**:

```
score = max(0, round(base − 15 × conflicts))   (DEALBREAKER_PENALTY = 15)
```

The candidate is still shown, with the warning "A dealbreaker differs. It lowered the score."

**Step 5. Explanation.** Each category gets a 0–100 score and a reason:

| Alignment | Reason |
|---|---|
| ≥ 0.85 | "You're closely aligned." |
| ≥ 0.60 | "Small differences you can talk through." |
| < 0.60 | "A real difference worth discussing before moving in." |

When the two importances add up to 5 or more, the reason gets " It matters a lot to both of you." Friction points use a neutral sentence per category ("You keep different sleep schedules."). These sentences never reveal either person's answer.

## 4. Housing Fit

```
budget     = 1                                         if rent ≤ budgetMax
           = max(0, 1 − (rent − budgetMax) / (0.5 × budgetMax))   otherwise
mustHaves  = met / wanted     (1 if nothing is wanted)
HousingFit = round((0.6 × budget + 0.4 × mustHaves) × 100)
```

Budget fit falls to zero when the rent is 50% over your maximum. `budgetMin` is not used in scoring: a cheaper room is never penalised.

## 5. Living Fit

```
pairHousing = min(HousingFit_A, HousingFit_B)    the stricter person governs
LivingFit   = round(0.6 × RoommateFit + 0.4 × pairHousing)
```

On Rooms, each listing shows the best Living Fit across your mutual matches who are allowed in that listing (its gender policy). Listings are ranked by that, or by Housing Fit when you have no match. The 60/40 split is a **pilot assumption**, not a measured result.

## 6. Worked examples (sample data)

These numbers come from running the engine on the seed students. Re-run the engine after any scoring change and update them.

### Maya × Bea = 96

Maya answered two scenarios, both with value 4: `overnight-guest` (Privacy, self 3) and `unpaid-bill` (Responsibilities, self 3). Her effective values for those two categories are (3 + 4) / 2 = **3.5**.

| Category | Maya | Bea | Gap | Alignment | Weight (M + B) | Category score |
|---|---|---|---|---|---|---|
| Sleep | 1 | 1 | 0 | 1.000 | 3 + 3 = 6 | 100 |
| Cleanliness | 3 | 3 | 0 | 1.000 | 3 + 2 = 5 | 100 |
| Noise | 1 | 1 | 0 | 1.000 | 2 + 3 = 5 | 100 |
| Social | 2 | 1 | 1 | 0.750 | 1 + 1 = 2 | 75 |
| Study | 3 | 3 | 0 | 1.000 | 3 + 3 = 6 | 100 |
| Food | 2 | 2 | 0 | 1.000 | 1 + 1 = 2 | 100 |
| Temperature | 1 | 1 | 0 | 1.000 | 2 + 1 = 3 | 100 |
| Privacy | 3.5 | 3 | 0.5 | 0.875 | 2 + 2 = 4 | 88 |
| Responsibilities | 3.5 | 3 | 0.5 | 0.875 | 3 + 2 = 5 | 88 |

Σ(alignment × weight) = 36.375, Σ weight = 38, base = 95.7. No gap reaches 2, so there are no friction points or penalties. **Score: 96.**

### Maya × Ella = 5

Ella sleeps after 2am, is relaxed about tidiness and likes noise. Most gaps are 3 or more:

- base = 11.875 / 34 × 100 = **34.9**
- Friction points: Sleep, Cleanliness, Noise, Study, Temperature, Privacy, Responsibilities
- Dealbreaker conflicts: **Sleep** (Ella's dealbreaker) and **Cleanliness** (Maya's) → −30
- **Score: 5**, with the dealbreaker warning. Ella **is still shown** to Maya, last in her deck.

### Housing and Living Fit

Maya: budget up to ₱6,000; must-haves Wi-Fi and aircon. A ₱6,500 room with Wi-Fi only:

- budget = 1 − 500 / 3,000 = 0.833
- must-haves = 1 / 2 = 0.5
- **Housing Fit** = (0.6 × 0.833 + 0.4 × 0.5) × 100 = **70**
- With Bea (Roommate Fit 96) and a pair Housing Fit of 50: **Living Fit** = 0.6 × 96 + 0.4 × 50 = **78**

## 7. Explainability and logging

- Every Roommate Fit calculated through the DAL is logged with the pair, score, engine version and timestamp (`scoreLog`), so a score in a report can be explained later.
- The detail page (`/matches/[id]`) shows the engine version next to the explanation.
- Raw values never leave the server. The browser receives category scores, reasons and friction text only.

## 8. Changing the engine

1. Change `engine.ts`, `categories.ts` or `scenarios.ts`.
2. **Bump `SCORING_VERSION`** (e.g. `rules-v1.1`) for any change that can move a score.
3. Update or add tests in `engine.test.ts`. They cover identical profiles scoring 100, symmetry, friction text not revealing answers, the dealbreaker penalty never rejecting anyone, importance weighting, the simulation blend, Housing Fit and the 60/40 Living Fit split.
4. Re-run the worked examples above and update this document.
5. Log the decision in [DECISIONS.md](DECISIONS.md).

## 9. Roadmap (later phases)

- **Learned weights:** after about 300 labelled 30/90-day check-in outcomes, retrain the weights, and adopt them **only** if they beat `rules-v1` on held-out data. Run fairness checks before every model update. Only students with `checkinsForScoring` consent are used.
- **Group matching:** for groups of 3+, the lowest pairwise Roommate Fit governs.
- **Tuning:** the friction threshold (gap ≥ 2), the penalty (15) and the 60/40 split are first guesses to be tuned with pilot data.
