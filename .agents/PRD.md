# Livora PRD: MVP with privacy built in

| | |
|---|---|
| **Version** | 1.1 (2026-11-09) |
| **Status** | MVP frontend built on sample data (v0.1.0). Backend not started. |
| **Owner** | Founder |
| **Sources** | *FUNTASTIK 4 Concept Note (PSC XI)*; the *DormMate* COSC 203 paper (privacy lessons, UI patterns); the privacy grilling session with the founder (2026-11-08) |
| **Related docs** | [README](../README.md) · [Architecture](../docs/ARCHITECTURE.md) · [Privacy](../docs/PRIVACY.md) · [Scoring](../docs/SCORING.md) · [Design](../docs/DESIGN.md) · [Demo + QA](../docs/DEMO.md) · [Decisions](../docs/DECISIONS.md) · [Glossary](../docs/GLOSSARY.md) |

**Changelog of this PRD:** 1.0 (2026-11-08) scope and privacy rules from the grilling session. 1.1 (2026-11-09) UI/UX direction from DormMate, requirements with acceptance criteria, success measures, risks.

## 1. Summary

Livora helps university students in the Philippines find a compatible dormmate and a room that fits them both. It replaces DormMate's photo-first, swipe-style discovery with an **explained compatibility report** and **step-by-step disclosure**: you see how well you'd live together before you see who someone is.

**MVP goal:** the full student loop (verify → Living Profile → Living Simulation → explained matches → mutual accept → chat → room inquiry → address revealed), a minimal owner view and a safety review queue, all on sample data, with the privacy rules enforced on the server.

## 2. Problem

- **Roommate conflict is common and predictable.** Sleep schedules, tidiness, noise, guests and bills cause most problems, yet students usually pick roommates by friendship, convenience or a photo.
- **Existing tools overshare.** Dating-style roommate apps lead with photos, exact ages and contact details. For students moving to a new city, that is a safety risk.
- **Rooms and roommates are chosen separately.** A great roommate is no help if the room fits neither person's budget or needs.

## 3. Goals and non-goals

**Goals (MVP)**
1. A student can go from sign-up to an accepted room inquiry with a compatible match, in one session, on sample data.
2. Every score is explained in plain language, and no raw answer is ever shown to someone else.
3. Nothing that could locate a student is shared before both sides agree.
4. The owner and reviewer sides work well enough to demo the full loop.

**Non-goals (MVP)**
- Real authentication, real verification or persistent storage.
- Payments, contracts or booking.
- Group matching (3+), check-ins, agreements, swaps ([Later phases](#later-phases)).
- Native mobile apps (the PWA covers the pilot).
- Machine-learned scoring.

## 4. Principles

1. **Physical safety first.** Nothing that locates a student (address, contact details, unblurred photo) is shared without both sides agreeing.
2. **Collect only what matching needs.** Every field has a stated purpose; anything without one is dropped.
3. **Explain, never judge.** Scores support a decision; they are never a verdict on a person. The engine never rejects anyone automatically.
4. **Raw answers stay private.** Others see scores and plain-language friction points, never answers.
5. **Consent is granular and reversible.** One required toggle; everything else is opt-in and editable.

## 5. Users

| User | Need | MVP surface |
|---|---|---|
| **Students (18+)** in one Metro Manila school cluster (pilot: U-Belt, Sampaloc) | A roommate they can live with and a room they can afford, without exposing themselves | Onboarding, Simulation, Discover, Matches, Chat, Rooms, Privacy |
| **Dorm owners** with verified listings | Qualified inquiries, without needing student profiles | Owner inquiries, new listing |
| **Livora safety reviewers** | Act on reports within 48 hours | Review queue |

## 6. MVP scope

### In scope ✅
- ✅ **Onboarding:** first name, school email + code (mock), year of birth + 18+ confirmation (under-18 blocked), gender (room matching only), roommate gender preference, budget, must-haves. 18 one-question screens.
- ✅ **Living Profile:** 9 categories (sleep, cleanliness, noise, social, study, food, temperature, privacy, responsibilities), importance 1–3, up to 3 dealbreakers.
- ✅ **House rules** instead of personal labels: smoking, drinking at home, overnight guests.
- ✅ **Granular consent:** matching (required); photo to matches, check-ins for scoring, university reports (all off by default). Editable in Privacy.
- ✅ **Living Simulation:** 8 scenarios; answers are averaged with the self-reported values.
- ✅ **Discover:** report-first swipe deck; private pass; "It's a match!" dialog.
- ✅ **Matches:** first name, age band, score, friction points, **blurred photo**. The detail page explains each category. A mutual accept unlocks the full photo and chat.
- ✅ **Chat:** text only, between mutual matches. Safety banner. Phone numbers, emails, links and social handles are blocked for the first 20 messages.
- ✅ **Rooms:** verified listings only, ranked by Living Fit (with a mutual match) or Housing Fit. The address is hidden until the owner accepts the inquiry.
- ✅ **Report + Block** on every profile, chat and listing. Block is silent and mutual. Reports promise review within 48h.
- ✅ **Owner view:** inquiries showing only first name, school cluster, move-in month and group size; accept/decline; new listings start unverified.
- ✅ **Admin review queue:** reports with a 48h countdown, dismiss or suspend; verify new listings.
- ✅ **Privacy page:** what others see, download my data (JSON), delete my account.
- ✅ Mobile-first PWA (manifest + icons).

### Later phases
❌ = not built yet. The founder wants all of these; they are kept on record, not dropped.

- ❌ **Group matching:** groups of 3+; the lowest pairwise score governs.
- ❌ **Roommate Agreement:** a house-rule draft built from a fixed clause library (any LLM use limited to that library), editable and exportable.
- ❌ **30/90-day check-ins:** outcome labels; retrain the weights after ~300 labels, and only if the result is better on held-out data; fairness checks before each model update.
- ❌ **Room / slot swaps** mid-semester.
- ❌ **Real backend:** Supabase Postgres with row-level security, real auth and real school-email verification.
- ❌ **ID verification fallback** (an ambassador check) where schools have no email. **Never store ID images**, only "verified on date by method".
- ❌ **Photo upload**, with server-side blurring (new accounts currently have no photo; sample students use generated illustrations).
- ❌ **Profile editing** after onboarding (consent is editable today; the Living Profile is not).
- ❌ Owner verification flow; owner Pro tier (compatibility-matched leads).
- ❌ Anonymized university reports (groups of 10+ only).
- ❌ Data retention schedule, NPC registration, privacy impact assessment.
- ❌ **Legal check:** whether age and education count as *sensitive personal information* under RA 10173 Sec. 3(l). If they do, rely on explicit consent and reword any "no sensitive data" claims.

## 7. Requirements and acceptance criteria

Each requirement is met in v0.1.0 unless marked otherwise. The manual checks are in [DEMO.md §3](../docs/DEMO.md#3-manual-qa-checklist).

| ID | Requirement | Acceptance criteria |
|---|---|---|
| **R-01** | Only adults can sign up | Birth year under 18, or no 18+ confirmation → refused on the server with "Livora is for students 18 and older" |
| **R-02** | School-email verification (mock) | Only pilot domains are accepted; the code must match; one account per email |
| **R-03** | Complete Living Profile | All 9 categories answered with an importance; ≤ 3 dealbreakers; validated on the server |
| **R-04** | Consent defaults | Matching is required; the three optional consents start off; all are editable in Privacy |
| **R-05** | Visibility | Students see only others in the same cluster, both consenting to matching, with no block either way, neither suspended, and compatible room preferences |
| **R-06** | Disclosure on cards | Cards show only first name, age band, cluster, score, friction points and a blurred photo; the page source has no raw answers, email, birth year or budget |
| **R-07** | Photo gating | Before a mutual accept the photo route serves the blurred file; after, the full file; 404 when not visible or without photo consent; `no-store` caching |
| **R-08** | Explained scores | The detail page shows a score and a reason for every category, plus the engine version |
| **R-09** | Dealbreakers don't filter | A dealbreaker conflict lowers the score by 15 and shows a warning; the candidate stays visible |
| **R-10** | Private pass | Passing is never shown to the other person; "Review passed students" restores the deck |
| **R-11** | Mutual match | When both are interested: match dialog, full photo, chat opens |
| **R-12** | Chat safety | Mutual matches only; banner visible; contact details refused for the first 20 messages; messages ≤ 1,000 characters |
| **R-13** | Rooms | Only verified listings allowed by the gender policy; ranked by Living Fit / Housing Fit |
| **R-14** | Address release | The address is absent from the page source until the owner accepts that student's inquiry |
| **R-15** | Owner minimisation | The owner's inquiry view has exactly first name, cluster, move-in month and group size |
| **R-16** | Report | Available on every profile, chat and listing; the reason is required; the copy promises review within 48 hours; the report appears in the queue |
| **R-17** | Block | Silent; both people disappear from each other's Discover, Matches and Chat |
| **R-18** | Review queue | Shows the 48h countdown; dismiss or suspend; suspended items disappear everywhere; new listings can be verified |
| **R-19** | Data rights | JSON export of your own data; deletion removes your profile and links (reports about you are kept) |
| **R-20** | Sample data honesty | "Sample data" is labelled on every seeded screen; no claims of real verification, real users or compliance |
| **R-21** | Phone-first and accessible | No horizontal scroll at 360/390/1440 px; light and dark mode; reduced motion respected; swiping never required (buttons) |

## 8. Privacy and safety rules (enforced in code)

| Rule | Where |
|---|---|
| A server-only data access layer returns view models; raw answers never reach the browser | `src/lib/dal/*` (`server-only`) |
| Full photo only after a mutual accept; the blurred file is a separate pre-rendered image | `src/app/api/photo/[id]/route.ts`, `private/photos/` |
| Visibility: same cluster, both consented to matching, not blocked, not suspended, compatible room gender preference | `canSee()` in `src/lib/dal/matching.ts` |
| Age gate 18+; age shown as a band | `src/lib/safety/index.ts` |
| Contact details blocked in early chat | `findContactDetail()` + `sendMessage()` |
| Address only after the owner accepts | `toView()` in `src/lib/dal/listings.ts` |
| Owner sees four student fields only | `ownerInquiries()` |
| Dealbreakers lower the score (−15 each) and show a warning; nobody is filtered out by score | `src/lib/scoring/engine.ts` |
| Every score is logged with the engine version | `scoreLog` in the mock store |
| Deletion removes the student and their links; reports about them are kept | `deleteStudent()` |

The full data inventory, disclosure stages and known gaps are in [docs/PRIVACY.md](../docs/PRIVACY.md).

## 9. Scoring v1 (`rules-v1.0`)

- Per category: alignment = 1 − |a − b| / 4 on a 0–4 scale. Weight = importance(a) + importance(b).
- Effective value = the average of the self-report and the Living Simulation signals for that category.
- RoommateFit = weighted mean × 100, minus 15 per dealbreaker conflict (a gap ≥ 2 in a category either person marked).
- HousingFit = 60% budget fit + 40% must-haves met. For a pair, the lower HousingFit governs.
- **LivingFit = 0.6 × RoommateFit + 0.4 × HousingFit** (the 60/40 split is a pilot assumption).

Formulas, worked examples and the change process are in [docs/SCORING.md](../docs/SCORING.md).

## 10. UI/UX direction (referenced from DormMate, 2026-11-09)

DormMate's layout patterns, adapted to Livora's privacy rules:

- **Brand:** warm coral (`--brand: #e5484d`) on a light UI, rounded cards, pill buttons. Dark mode follows the device. Wordmark: a roof line over two windows + "livora".
- **Bottom tab bar:** Discover · Matches · Chat · Rooms · Privacy; the active tab sits in a filled circle.
- **Discover card deck:** one candidate at a time, with Pass / Interested and swipe. Unlike DormMate, the card leads with the **score, friction points and category bars**; the photo is a small blurred avatar, with no surname, exact age or location. Passing is private.
- **"It's a match!" dialog** when interest is mutual → Start chat / Keep discovering.
- **Onboarding, one question per screen:** progress bar ("8 of 18"), large pill options, a Next button pinned to the bottom.
- **Matches:** grid of matched students + a "waiting on them" list. **Chat:** an avatar row of matches above the conversation list.
- **Illustrated empty states** on Discover, Matches and Chat.
- **Motion** follows Emil Kowalski's design-engineering principles: `scale(0.97)` press feedback, custom ease-out curves, under 300 ms, velocity-based swipe, `@starting-style` dialogs, a fade-only deck with reduced motion.

Tokens, components and the full motion spec are in [docs/DESIGN.md](../docs/DESIGN.md).

## 11. Success measures (pilot)

The MVP has no real users, so there are no results yet. Targets will be set with the founder before the pilot. The **TBD** values must not be presented as results.

| Measure | Why | Target |
|---|---|---|
| Onboarding completion (start → Discover) | Is 18 screens too long? | TBD |
| Living Simulation completion | Do people take the extra step? | TBD |
| Students with ≥ 1 mutual match within 7 days | Does matching work in one cluster? | TBD |
| Matches that lead to an inquiry | Does Living Fit connect roommates to rooms? | TBD |
| Reports reviewed within 48 h | Can we keep the safety promise? | 100% (a promise, not a measured result) |
| 30/90-day "still living together, happy" rate | Do the scores predict anything? (later phase) | TBD |
| Students who say the score explanation was useful | Does "explain, never judge" land? | TBD |

## 12. Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Too few students per cluster for useful matches | High in the pilot | High | Launch in one cluster (U-Belt); seed through school orgs |
| Scores feel like a judgement on a person | Medium | High | "Decision support" framing; explanations; no filtering by score |
| Contact guard bypassed (digits spelled out) | High | Medium | Treat it as a speed bump; Report; reviewer action |
| Owners want more student data | Medium | Medium | Fixed four-field view; a Pro tier later, built on compatibility, not data |
| Legal classification of age/education under RA 10173 | Unknown | High | Legal check before launch; explicit consent |
| The demo is mistaken for a real product | Medium | Medium | "Sample data" labels; a Limitations section; honest demo script |
| Weights are wrong for real students | High | Medium | Version every score; retrain only on held-out improvement |

## 13. Stack

Next.js 16 (App Router, Server Actions, Turbopack), React 19, TypeScript, Tailwind v4, Vitest. A mock in-memory store shaped like the future Postgres schema. A demo session cookie for switching between sample roles (not real auth). Details in [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md).

## 14. Open questions

- The six Living Simulation scenarios beyond the two named in the concept note are drafts. Review the wording.
- The category scale labels and the friction threshold (gap ≥ 2) are first guesses; tune them with pilot data.
- The contact-sharing threshold (20 messages) is a guess.
- The pilot success targets in §11 need to be set.
- Should the house-rule notes ("you have different house rules on smoking") be shown before a mutual match, or only after?
