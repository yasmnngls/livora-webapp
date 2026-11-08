# Livora

**Find a dormmate you can actually live with, and a room that fits you both.**

Livora is a mobile-first web app for university students (18+) in the Philippines. Before you learn who someone is, it shows how well you would live together: an explained compatibility score, the points where you might clash, and rooms that suit you both. Personal details are revealed in stages, and only after both people agree.

> **Status: MVP prototype on sample data (v0.1.0).** All students, owners, listings and addresses are invented. Login is a demo switch, not real authentication. Don't put real personal data into it. See [Limitations](#limitations).

---

## Contents

- [Why Livora](#why-livora)
- [What's in the MVP](#whats-in-the-mvp)
- [Quick start](#quick-start)
- [Try the demo](#try-the-demo)
- [Scripts](#scripts)
- [Project structure](#project-structure)
- [How privacy is enforced](#how-privacy-is-enforced)
- [Documentation](#documentation)
- [Limitations](#limitations)
- [Contributing](#contributing)

## Why Livora

Roommate apps tend to work like dating apps: a big photo, a name, an age and a location, then a swipe. For students looking for a shared room, that gets two things wrong:

1. **It shares too much, too early.** Photos, exact ages and contact details can locate a student before anyone has agreed to anything.
2. **It shows the wrong things.** What makes a roommate work out is sleep schedules, tidiness, noise, guests and bills, not looks.

Livora turns this around. You see the **compatibility report first** and the **person second**, and every extra detail needs both sides to say yes.

| Stage | What the other student sees |
|---|---|
| Discover | First name, age band (e.g. 18–20), school cluster, score, friction points, **blurred** photo |
| Mutual match (both say "Interested") | Full photo, text chat |
| 20 messages exchanged | Phone numbers, emails, links and social handles can be shared in chat |
| Owner accepts your room inquiry | The listing's address |

## What's in the MVP

**Students**
- **Onboarding:** 18 short screens, one question each. School-email check (demo code `123456`), 18+ age gate, Living Profile (9 categories, each with an importance and an optional dealbreaker), house rules and granular consent.
- **Living Simulation:** 8 everyday scenarios ("the electric bill is due and your roommate hasn't paid…"). Answers refine the self-reported profile.
- **Discover:** a swipe deck of candidates that leads with the score and friction points. Passing is private.
- **Matches:** your mutual matches, people you're waiting on, and a per-category explanation of every score.
- **Chat:** text only, with a safety banner and a block on sharing contact details early on.
- **Rooms:** verified listings ranked by Living Fit with your match. The address is shown only after the owner accepts your inquiry.
- **Privacy:** what others can see about you, consent toggles, download your data (JSON), delete your account.

**Dorm owners:** see the inquiries for their listings (first name, school cluster, move-in month and group size only), accept or decline them, and post new listings, which stay unverified until a reviewer approves them.

**Safety reviewers:** a report queue with a 48-hour countdown (dismiss, or suspend the account), plus verification of new listings.

**Everywhere:** Report on every profile, chat and listing; silent, mutual Block on every student surface; installable as a PWA.

Deferred features (group matching, Roommate Agreement, 30/90-day check-ins, room swaps, real backend) are listed in the [PRD's Later phases](.agents/PRD.md#later-phases).

## Quick start

Requirements: **Node.js 20 or newer** (developed on 24) and npm.

```bash
git clone https://github.com/yasmnngls/livora-webapp.git
cd livora-webapp
npm install
npm run dev
```

Open http://localhost:3000. If that port is taken, run `npx next dev -p 3123` and open http://localhost:3123.

No environment variables, database or accounts are needed. The data lives in memory and resets when the server restarts.

## Try the demo

The home page has a **demo panel**. A good 5-minute tour:

1. **Try as sample student.** You become Maya (U-Belt cluster), who already has a Living Profile.
2. **Discover:** swipe right or tap **Interested** on Bea (score 96). Bea already likes Maya, so you get **"It's a match!"**
3. **Chat:** send Bea a message (she replies once, automatically). Then try typing a phone number to see the block.
4. **Rooms:** open *Quiet 2-bed room near España* (owned by the sample owner Rosa) and send an inquiry. The address stays hidden.
5. **Log out → Dorm owner view:** accept the inquiry as Rosa. Only four fields about Maya are visible.
6. **Log out → Try as sample student → Rooms:** the address now appears.
7. **Report** someone, then **log out → Safety review queue** to see the report waiting with its 48h countdown.

Or press **Create my profile** to go through onboarding yourself. Use an email ending in `@ust.edu.ph`, `@feu.edu.ph`, `@ue.edu.ph` (U-Belt) or `@pup.edu.ph` (Sta. Mesa), with the code `123456`.

**Reset sample data** puts everything back to the seed. The full script and a manual QA checklist are in [docs/DEMO.md](docs/DEMO.md).

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server (Turbopack) on port 3000 |
| `npm run build` / `npm start` | Production build and server |
| `npm run lint` | ESLint |
| `npm run typecheck` | Generates Next.js route types (`next typegen`), then `tsc --noEmit` |
| `npm test` | Vitest unit tests (scoring engine, age gate, contact-detail guard) |
| `npm run assets` | Regenerates sample photos (full and pre-blurred) and app icons with `sharp` |

**Before you push:** `npm run lint && npm run typecheck && npm test`.

## Project structure

```
src/
  app/                  Routes (App Router). Pages are server components by default.
    actions.ts          All Server Actions (the only write path from the UI)
    api/photo/[id]/     The only route that serves student photos (blurred or full)
    api/my-data/        JSON export of the signed-in student's own data
    discover/ matches/ chat/ listings/ settings/   Student screens
    onboarding/ simulation/                        Sign-up flow
    owner/ admin/                                  Owner and reviewer screens
  components/           Shared UI (TabBar, ReportBlockMenu, Logo, ui.tsx primitives)
  lib/
    types.ts            Domain types (private) and view models (safe for the browser)
    dal/                Server-only data access layer: every read and write goes through here
    scoring/            Pure, versioned compatibility engine + categories + scenarios
    safety/             Pure helpers: age gate, age bands, contact-detail detection
    mock/               In-memory store and seed data (shaped like the future Postgres schema)
private/photos/         Sample photos, outside public/ so they can't be fetched directly
public/icons/           PWA icons
scripts/make-assets.mjs Asset generator
.agents/PRD.md          Product requirements (source of truth for scope)
docs/                   Architecture, privacy, scoring, design, demo, decisions
```

## How privacy is enforced

Livora's privacy rules are enforced on the server, not just hidden in the UI:

- **Only view models reach the browser.** Screens get data from `src/lib/dal/*` (marked `server-only`), which returns `*View` types without raw answers, school email, year of birth, budget or simulation answers.
- **Blurring happens in the image file, not in CSS.** Before a mutual match, `/api/photo/[id]` sends a separately rendered, heavily blurred PNG, so the full photo never reaches the browser.
- **One visibility rule.** `canSee()` requires the same school cluster, both students consenting to matching, no block either way, neither account suspended, and compatible room-gender preferences.
- **Scores support a decision; they never make it.** No one is hidden because of a low score. A dealbreaker lowers the score and shows a warning.

The full data inventory, disclosure stages and known gaps are in [docs/PRIVACY.md](docs/PRIVACY.md).

## Documentation

| Doc | Read it for |
|---|---|
| [.agents/PRD.md](.agents/PRD.md) | Scope, users, requirements, later phases, open questions |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Layers, data flow, request lifecycle, how to add a screen |
| [docs/PRIVACY.md](docs/PRIVACY.md) | Every field collected, why, who sees it; threat model; known gaps |
| [docs/SCORING.md](docs/SCORING.md) | The compatibility formula with worked examples, versioning |
| [docs/DESIGN.md](docs/DESIGN.md) | Brand tokens, components, motion rules, accessibility |
| [docs/DEMO.md](docs/DEMO.md) | Sample accounts, demo script, manual QA checklist |
| [docs/DECISIONS.md](docs/DECISIONS.md) | Why things are the way they are (decision log) |
| [docs/GLOSSARY.md](docs/GLOSSARY.md) | Domain terms: Living Profile, friction point, Living Fit… |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Workflow, project rules, PR checklist |
| [SECURITY.md](SECURITY.md) | Reporting a vulnerability |
| [CHANGELOG.md](CHANGELOG.md) | Release history |

## Limitations

This is a prototype. Be honest about it when you demo it:

- **No real authentication.** A cookie holds the sample role and id (`livora_demo_session`). Anyone can switch accounts.
- **No real verification.** The school-email code is always `123456`. Listing verification is a button in the review queue.
- **No persistence.** The data resets when the server restarts.
- **No photo upload.** New accounts have no photo; sample students use generated illustrations.
- **Untuned scoring.** The weights and thresholds are first guesses, to be tuned with pilot data ([open questions](.agents/PRD.md#14-open-questions)).
- **No legal review yet.** Livora makes no claim of compliance with the Data Privacy Act (RA 10173). NPC registration and a privacy impact assessment are listed as later work.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) first. The project rules there (what may reach the browser, what owners can see, what we never collect) are hard requirements.
