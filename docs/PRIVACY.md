# Privacy and safety design

What Livora collects, why, who can see it, and how the code enforces that. This is an engineering document, not a privacy notice for users.

**Applies to:** v0.1.0 (prototype, sample data only). **Owner:** founder. **Review:** whenever a field, consent or disclosure rule changes.

> **Honesty note.** This prototype has had no legal review and makes no claim of compliance with the Data Privacy Act of 2012 (RA 10173). The rules below are design commitments that the code enforces today. The gaps in [§6](#6-known-gaps) must be closed before any real student data is stored.

## 1. Principles

1. **Physical safety first.** Nothing that could locate a student (address, contact details, unblurred photo) is shared without both sides agreeing.
2. **Collect only what matching needs.** Every field below has a stated purpose. A field without one isn't collected.
3. **Raw answers stay private.** Others see scores and plain-language friction points, never the answers behind them.
4. **Consent is granular and reversible.** One consent is required (matching); the others are opt-in, off by default, and can be changed at any time.
5. **Explain, never judge.** A score supports a decision. It never hides or rejects a person on its own.

## 2. Lessons from DormMate

Livora replaces an earlier class prototype, DormMate (COSC 203). Each of its privacy problems maps to a Livora rule:

| DormMate | Risk | Livora |
|---|---|---|
| Photo-first swipe cards | Choosing people by looks; a photo plus a school can identify someone | The card leads with the score and friction points; the photo stays blurred until a mutual match |
| Exact age and birthdate | Identification; contact with minors | Year of birth kept privately; others see an age band; signing up requires being 18+ |
| Phone number on the profile | Contact before any trust | No phone number collected; contact details blocked in chat for the first 20 messages |
| Surname, MBTI, zodiac, free-text bio | Over-collection, identification, stereotyping | First name only; none of these are collected |
| Score endpoints with no authentication | Anyone could fetch scores and profiles | Server-only DAL; every action re-checks the session and `canSee()` |
| A 17-year-old in the seed data | Minors on the platform | Every sample student is 18+; the age gate is unit-tested |

## 3. Data inventory

Every field Livora stores about a student (`Student` in `src/lib/types.ts`):

| Field | Why we need it | Who can see it | Enforced in |
|---|---|---|---|
| First name | Address people in matches and chat | Visible students, mutual matches, owners you inquire with | `toView()`, `ownerInquiries()` |
| School email | Verify enrolment; derive the school cluster | **Only you** (and your data export) | Never put in a view model |
| Verified at / method | Record *that* you were verified, never an ID image | Only you | — |
| Year of birth | Age gate | Only you. Others see an **age band** (18–20, 21–23, 24–26, 27+) | `ageBand()` |
| Gender | Rooms are often single-gender; same-gender matching | Not shown. Used only by `roomsCompatible()` and the listing gender policy | `canSee()`, `policyAllows()` |
| Room gender preference (`same` / `any`) | Respect who you want to share with | Not shown | `roomsCompatible()` |
| School cluster | Match people who can live near the same campus | Visible students, owners | `toView()`, `ownerInquiries()` |
| Living Profile (9 values + importance) | Compatibility scoring | **Only you.** Others see per-category scores and friction text. | `roommateFit()` returns alignment only |
| Dealbreakers (≤ 3) | Warn when a key difference exists | Only you. Others see that "a dealbreaker differs". | `FrictionPoint.dealbreaker` |
| House rules (smoking, drinking, guests) | Agree on house rules before moving in (not personal labels) | Not shown. Visible students see *which* rules differ ("different house rules on smoking"), never your setting | `houseRuleNotes` in `getCandidate()` |
| Living Simulation answers | Make scores reflect what you'd actually do | Only you | `effectiveValues()` |
| Budget min/max | Housing Fit | Only you | `housingFit()` returns a score only |
| Must-have amenities | Housing Fit | Only you | `housingFit()` |
| Consent flags | Respect your choices | Only you | `updateConsent()` |
| Photo | Recognise your roommate after you've both agreed | Visible students: **blurred**. Mutual matches: full. Only if `photoToMatches` is on. | `/api/photo/[id]` |

**Activity records:**

| Record | Visible to | Note |
|---|---|---|
| Interest (you → them) | Them, **only once it is mutual** | One-sided interest is never revealed |
| Pass | Nobody | Private "not now"; can be undone with "Review passed students" |
| Block | Nobody (silent) | Hides both people from each other in matches and chat |
| Report | Safety reviewers | The reporter's identity isn't shown to the person reported |
| Message | The two people in the thread | Mutual matches only |
| Inquiry | The listing's owner, as 4 fields | First name, cluster, move-in month, group size |
| Score log | Not shown in the UI | Pair, score, engine version and time, kept so any score can be explained later (capped at 1,000 entries in the mock) |

**Never collected:** surname, phone number, social handles, full birthdate, home address, ID images, religion, ethnicity, health, sexual orientation, political views, MBTI, zodiac, free-text bio.

## 4. Disclosure stages

```
 Visible (same cluster, both opted in, no block, compatible rooms)
   first name · age band · cluster · score · friction points · blurred photo
   (score page: per-category scores, which house rules differ)
        │  both tap "Interested"
        ▼
 Mutual match
   + full photo (if they consented) · + text chat
        │  20 messages exchanged in the thread
        ▼
 Contact sharing allowed
   phone numbers, emails, links and social handles can be sent in chat
        │  (separately) owner accepts the student's inquiry
        ▼
 Address released
   listing address shown to that student only
```

**Reversing:** blocking hides both people from each other immediately and withdraws your interest. Turning matching off hides you from everyone. Turning `photoToMatches` off makes the photo route return 404, even for existing matches.

## 5. Safety features

| Feature | Behaviour | Code |
|---|---|---|
| Age gate | Year of birth gives 18+ **and** an 18+ confirmation is checked; otherwise sign-up is refused. Both are validated on the server. | `passesAgeGate()` |
| Contact-detail guard | Messages are checked for PH mobile numbers, long digit runs, emails, URLs/domains, `@handles` and named apps (FB, IG, Telegram, Viber, WhatsApp, TikTok) until 20 messages have been exchanged | `findContactDetail()`, `sendMessage()` |
| Chat safety banner | Reminds students to meet in public and keep chatting in Livora | `chat/[id]/page.tsx` |
| Report | On every profile, chat and listing. The reason is required, details are optional (≤ 1,000 characters), and the copy promises review within 48 hours | `createReport()`, `ReportBlockMenu` |
| Block | Silent and mutual; available on every student surface | `blockStudent()` |
| Review queue | Reports with a 48 h countdown; dismiss, or suspend the account | `/admin`, `resolveReport()` |
| Suspension | A suspended student or listing disappears from every view | `suspendedIds` in `canSee()` / `visibleTo()` |
| Listing verification | Students only see verified listings; new listings start unverified | `visibleTo()`, `verifyListing()` |

## 6. Known gaps

These must be closed **before any real student data is stored**:

| Gap | Risk | Planned fix |
|---|---|---|
| Demo session cookie (`role:id`, not signed) | Anyone can become any account | Real authentication (Supabase) with a verified school email |
| Verification code is always `123456` | No proof of enrolment | Real school-email verification; an ambassador check where schools have no email (record only "verified on date by method", never ID images) |
| In-memory store | No durability, no audit trail | Postgres with row-level security that mirrors `canSee()` |
| Photos are files on the app server | Tied to one server | Private object storage + short-lived signed URLs |
| The contact guard is pattern-based | Determined users can get around it (e.g. spelling digits out) | Accept as a speed bump; rely on reporting. Revisit with real chat data. |
| Interests and passes are kept forever | Excess retention | A retention schedule (later phase) |
| The admin role is a demo login | No reviewer accountability | Named reviewer accounts + an action log |
| No legal review | Claims may not match the law | Confirm whether age and education count as *sensitive personal information* under RA 10173 Sec. 3(l); register with the NPC; run a privacy impact assessment |
| A school email reveals the school | The cluster mapping is coarse but derived from the email | Keep the email private (done); review whether the cluster alone identifies people in small schools |

## 7. Data subject rights (prototype support)

| Right | Status |
|---|---|
| Be informed | Consent screen in onboarding explains each toggle; Privacy page shows "what others see" |
| Access / portability | **Download my data** (`/api/my-data`) returns everything held about you as JSON |
| Rectify | Consent is editable. Editing the Living Profile is not built yet. |
| Erase | **Delete my account** removes your profile, interests, passes, blocks, inquiries, messages and score-log entries. Reports *about* you are kept to protect others; reports you filed stay but no longer name you. |
| Object | Turning matching off stops all matching use |

## 8. Changing this document

Any PR that adds a field, a consent, a new view model or a new disclosure must update [§3](#3-data-inventory) and [§4](#4-disclosure-stages) in the same PR. The `compliance-reviewer` agent checks copy and privacy claims against these rules and the project rules in `CLAUDE.md`.
