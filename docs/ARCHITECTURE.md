# Architecture

How Livora is put together, and the rules that keep private data on the server.

**Applies to:** v0.1.0 (MVP prototype on sample data). **Stack:** Next.js 16 (App Router, Server Actions, Turbopack), React 19, TypeScript, Tailwind v4, Vitest.

> Next.js 16 differs from older versions. Before changing routing, caching or Server Actions, check the bundled docs in `node_modules/next/dist/docs/` (see `AGENTS.md`).

## 1. The big picture

```
 Browser (client components)
   │  renders view models only; calls Server Actions; loads photos by URL
   ▼
 src/app/**            Server components (pages) + src/app/actions.ts (Server Actions)
   │  calls only DAL functions; never reads the store directly
   ▼
 src/lib/dal/*         Server-only data access layer ("server-only" import)
   │  checks the session, applies visibility + privacy rules,
   │  converts private records into *View types
   ├──► src/lib/scoring/*   pure functions: compatibility engine
   ├──► src/lib/safety/*    pure functions: age gate, age bands, contact guard
   ▼
 src/lib/mock/*        In-memory store + seed data (Postgres-shaped)
```

There are three layers, and each one talks only to the layer below it:

| Layer | Can import | Must not |
|---|---|---|
| **UI** (`src/app`, `src/components`) | DAL functions, view-model types, `scoring/categories` labels | Import `src/lib/mock`, or pass a `Student`/`Listing` record to a client component |
| **DAL** (`src/lib/dal`) | Store, scoring, safety, all types | Run in the browser (enforced by `import "server-only"`) |
| **Pure logic** (`src/lib/scoring`, `src/lib/safety`) | Types only | Touch the store, cookies or the network. That keeps them unit-testable. |

## 2. Data model

All types are in `src/lib/types.ts`, split into two groups:

**Private records** (server only): `Student`, `Owner`, `Listing`, `Inquiry`, `Interest`, `Block`, `Report`, `Message`. They are shaped like future Postgres tables. A `Student` includes everything the scoring needs: the raw Living Profile answers, simulation answers, budget, school email and year of birth.

**View models** (safe for the browser): built by the DAL for one specific viewer.

| View model | Built by | Contains | Never contains |
|---|---|---|---|
| `CandidateView` | `listCandidates()` | first name, age band, cluster, score, friction points, photo URL, interest state | answers, email, birth year, budget |
| `CandidateDetailView` | `getCandidate()`, `discoverDeck()` | the above + per-category score and reason, house-rule notes, scoring version | the other person's raw values |
| `ListingView` | `listListings()`, `getListing()` | listing info, Housing Fit, Living Fit with a match, your inquiry | `address` unless your inquiry was accepted |
| `OwnerInquiryView` | `ownerInquiries()` | first name, school cluster, move-in month, group size, status | everything else about the student |
| `ThreadView` | `getThread()` | partner's first name, messages, contact-unlock progress | anything about the partner's profile |

The store (`src/lib/mock/store.ts`) has one array per table plus `suspendedIds` and `scoreLog`. It lives on `globalThis.__livoraStore`, so hot reloads in dev keep the data, and it is rebuilt from `seed.ts` whenever the server restarts or someone presses **Reset sample data** (`resetStore()`).

## 3. Sessions and roles

`src/lib/dal/session.ts` reads an httpOnly cookie, `livora_demo_session`, whose value is `student:<id>`, `owner:<id>` or `admin`.

- `getSession()` is wrapped in React `cache()`, so it runs once per request.
- Pages and actions call `requireStudent()`, `requireOwner()` or `requireAdmin()`. A wrong or missing role redirects to `/`.
- **This is a demo switch, not authentication.** Replacing it with real auth (verified school email, Supabase sessions) is a precondition for storing real data. See [PRIVACY.md §6](PRIVACY.md#6-known-gaps).

## 4. Request lifecycles

### Reading a page (e.g. `/discover`)

1. `src/app/discover/page.tsx` (server component) calls `requireStudent()`.
2. It calls `discoverDeck(me)`. The DAL filters students through `canSee()`, drops anyone the viewer has already marked interested or passed, scores each pair with `score()` (which records the result in `scoreLog`), and returns `CandidateDetailView[]` sorted by score.
3. The page passes those view models to the client component `DiscoverDeck`. Only that serialized data reaches the browser.

### Writing (e.g. tapping **Interested**)

1. `DiscoverDeck` calls the Server Action `setInterest(id, true)` in `src/app/actions.ts`.
2. The action calls `requireStudent()`, then `expressInterest(me, id)`. The DAL checks `canSee()` again, because a client could send any id.
3. It returns `{ mutual }`. The client shows the "It's a match!" dialog when that is true, and the action revalidates the affected paths.

**Rule:** every Server Action re-checks the role and the visibility rules on the server. The client can't be trusted to send only valid ids.

### Loading a photo

`<img src="/api/photo/s2">` → `src/app/api/photo/[id]/route.ts`:

1. No student session → 404.
2. Your own photo → full.
3. You can't see the target (`canSee()` is false), or they haven't consented to `photoToMatches` → 404. A 404 looks the same as "no such person", so it doesn't confirm the account exists.
4. Mutual match → `private/photos/<id>.png`. Otherwise → `private/photos/<id>-blurred.png`.
5. The response is sent with `Cache-Control: private, no-store`, so a browser or proxy cache can't serve an old full photo after a block.

The blurred files are made by `scripts/make-assets.mjs`: the image is shrunk to 12 px, scaled back up and blurred, so the original detail is gone from the file itself.

## 5. Key modules

| Module | Responsibility |
|---|---|
| `dal/matching.ts` | `canSee`, `isMutual`, `score`, `listCandidates`, `getCandidate`, `discoverDeck`, `expressInterest`, `passCandidate`, `clearPasses`, `withdrawInterest`, `mutualMatches`. Sample students automatically return interest when the fit is 60 or more (mock behaviour, so the flow can be tried alone). |
| `dal/listings.ts` | Student listing views (ranked by Living Fit with your best match, or by Housing Fit), inquiries, the owner's inquiry view, accept/decline, new listings (created unverified). |
| `dal/chat.ts` | Threads between mutual matches only. `sendMessage` refuses contact details until `CONTACT_UNLOCK_MESSAGES` (20) messages have been exchanged; messages are capped at 1000 characters; sample students reply once. |
| `dal/safety.ts` | Silent, mutual block; reports (reason + details, 48 h review window); admin queue; dismiss or suspend; listing verification. |
| `dal/account.ts` | Onboarding validation (all on the server), simulation answers, consent updates, data export, account deletion. |
| `scoring/engine.ts` | `roommateFit`, `housingFit`, `livingFit`, `effectiveValues`, `SCORING_VERSION`. See [SCORING.md](SCORING.md). |
| `safety/index.ts` | `passesAgeGate`, `ageBand`, `findContactDetail`, `CONTACT_UNLOCK_MESSAGES`. |

## 6. Routes

| Route | Role | Purpose |
|---|---|---|
| `/` | anyone | Landing page + demo panel |
| `/onboarding` | anyone | 18-screen sign-up |
| `/simulation` | student | Living Simulation (8 scenarios), can be skipped |
| `/discover` | student | Swipe deck |
| `/matches`, `/matches/[id]` | student | Matches and "waiting on them"; explanation of a score |
| `/chat`, `/chat/[id]` | student | Conversation list; a thread |
| `/listings`, `/listings/[id]` | student | Rooms; a listing + inquiry |
| `/settings` | student | Privacy: what others see, consent, export, delete |
| `/owner`, `/owner/new` | owner | Inquiries + listings; new listing |
| `/admin` | admin | Report queue + listing verification |
| `/api/photo/[id]` | student | Gated photo |
| `/api/my-data` | student | JSON export of your own data |
| `/manifest.webmanifest` | anyone | PWA manifest (`src/app/manifest.ts`) |

## 7. Adding a feature safely

1. **Start in the DAL.** Write a function that takes the signed-in actor (`Student` or `Owner`) and returns a new `*View` type containing only the fields that screen needs. Add the type to `types.ts` next to the other view models.
2. **Check visibility.** Anything about another student must go through `canSee()` (and `isMutual()` if it unlocks something).
3. **Write through a Server Action** in `src/app/actions.ts`. Call `require*()` first, validate every input on the server, and return `{ error }` or a small result object.
4. **Keep pure logic pure.** Rules that can be expressed as a function of inputs go in `scoring/` or `safety/`, with a Vitest test next to them.
5. **Add Report/Block** to any new surface that shows a student or a listing (`ReportBlockMenu`).
6. **Update the docs.** If you add or change a field, update the data inventory in [PRIVACY.md](PRIVACY.md). If scoring changes, update [SCORING.md](SCORING.md) and bump `SCORING_VERSION`.

## 8. Moving to a real backend (later phase)

The mock store was shaped so the move only touches `src/lib/mock` and `src/lib/dal`:

- **Tables:** each `Store` array becomes a Postgres table, and `suspendedIds` becomes a column on `students`. `scoreLog` becomes an append-only table.
- **Row-level security** repeats the `canSee()` and owner rules in the database, so a bug in the DAL can't leak rows on its own.
- **Photos:** move from `private/photos` to private object storage, with short-lived signed URLs issued by the same route logic. Keep the blurred version pre-rendered.
- **Auth:** a verified school email becomes the session; drop the demo cookie and the demo panel.
- **No UI change:** screens keep calling the same DAL functions and receiving the same view models.

## 9. Testing

| Kind | Where | Run |
|---|---|---|
| Unit | `src/lib/scoring/engine.test.ts`, `src/lib/safety/safety.test.ts` | `npm test` |
| Types | `next typegen` route types + `tsc` | `npm run typecheck` |
| Lint | ESLint (`eslint-config-next`) | `npm run lint` |
| End-to-end | Manual checklist in [DEMO.md](DEMO.md#3-manual-qa-checklist). There is no automated e2e suite in the repo yet. | — |
