# Decision log

Why Livora is built the way it is. Add a new entry whenever a decision changes scope, privacy, scoring or the stack. Don't edit old entries: mark them **Superseded by D-NN** and add a new one.

**Format:** context → decision → consequences. **Status:** Accepted, Superseded or Proposed.

---

### D-01 · Build the MVP frontend first, with no deadline
**2026-11-08 · Accepted**
- **Context:** The repo only had tooling. The founder wants something they can see and try before investing in a backend.
- **Decision:** Build the MVP screens first on mock data. Timelines are not a constraint.
- **Consequences:** Real auth, a database and real verification are later phases ([PRD §6](../.agents/PRD.md#6-mvp-scope)). The app must say clearly that it uses sample data.

### D-02 · Scope: four student flows, a minimal owner view, an admin queue
**2026-11-08 · Accepted**
- **Decision:** Onboarding + Living Profile, Living Simulation, Matches + chat, Rooms + inquiry; plus an owner view and a safety review queue.
- **Consequences:** Every role can be demoed from the home page.

### D-03 · Next.js + TypeScript + Tailwind, mobile-first PWA
**2026-11-08 · Accepted**
- **Decision:** Next.js 16 App Router with Server Actions, TypeScript, Tailwind v4, Vitest. Installable PWA.
- **Consequences:** Server components let private data stay on the server by default. Next.js 16 differs from older versions, so check the bundled docs (`AGENTS.md`).

### D-04 · Mock data behind a server-only data access layer
**2026-11-08 · Accepted**
- **Decision:** An in-memory store shaped like the future Postgres schema, reached only through `src/lib/dal/*` (`server-only`), which returns view models.
- **Consequences:** Moving to Supabase only touches `mock/` and `dal/`. Privacy rules live in one place and can be reviewed.

### D-05 · Blurred photo until both accept, blurred in the file itself
**2026-11-08 · Accepted**
- **Context:** DormMate led with photos. A CSS blur still sends the full image to the browser.
- **Decision:** Candidates show a blurred photo. Full photo and chat unlock on a mutual accept. The blurred version is a separate, pre-rendered file served by `/api/photo/[id]`; photos live in `private/`.
- **Consequences:** Photos can't be fetched directly. Real uploads (later) need a server-side blur step.

### D-06 · Collect a minimal set of fields
**2026-11-08 · Accepted**
- **Decision:** First name, school email, year of birth + 18+ confirmation, gender (room matching only), room preference, budget, must-haves, Living Profile, house rules. Dropped: surname, mobile, birthdate, MBTI, zodiac, bio, free-text interests.
- **Consequences:** Others see an age band, never an age. See the data inventory in [PRIVACY.md](PRIVACY.md#3-data-inventory).

### D-07 · Granular consent, optional ones off by default
**2026-11-08 · Accepted**
- **Decision:** Matching is required. Photo to matches, check-ins for scoring and university reports are opt-in, and all can be changed in Privacy.

### D-08 · Block + report + review queue
**2026-11-08 · Accepted**
- **Decision:** Report on every profile, chat and listing, with review promised within 48 hours. Block is silent and mutual. An admin queue can dismiss or suspend.

### D-09 · Minimal owner view
**2026-11-08 · Accepted**
- **Decision:** Owners see only first name, school cluster, move-in month and group size. Accepting an inquiry releases the address to that student. Owners never see scores or answers.

### D-10 · Text chat with safety features
**2026-11-08 · Accepted**
- **Decision:** Text only, between mutual matches. A safety banner; contact details blocked for the first 20 messages.
- **Consequences:** The 20-message threshold is a guess ([open questions](../.agents/PRD.md#14-open-questions)).

### D-11 · A transparent, weighted scoring module in TypeScript
**2026-11-08 · Accepted**
- **Decision:** A pure, versioned, unit-tested engine (`rules-v1.0`). Explanations for every category; raw answers never exposed.
- **Consequences:** See [SCORING.md](SCORING.md). Bump the version on every change.

### D-12 · Dealbreakers lower the score; they never filter anyone out
**2026-11-08 · Accepted** (changes the first plan, which filtered people out)
- **Context:** Filtering hides people based on one answer, which goes against "explain, never judge".
- **Decision:** −15 points per dealbreaker conflict, plus a visible warning. Nobody is hidden by score.

### D-13 · Keep the deferred features on record
**2026-11-08 · Accepted**
- **Decision:** Group matching, the Roommate Agreement, 30/90-day check-ins and room/slot swaps are wanted, not dropped. They are listed under "Later phases" in the PRD.

### D-14 · Borrow DormMate's layout patterns, not its disclosure model
**2026-11-09 · Accepted**
- **Decision:** A bottom tab bar, a swipe deck, an "It's a match!" dialog, one-question onboarding screens and illustrated empty states. The deck card is **report-first**: score, friction and category bars; the photo is a small blurred avatar.
- **Consequences:** Familiar mobile patterns without making looks the first thing people judge. See [DESIGN.md](DESIGN.md).

### D-15 · Livora coral, light-first
**2026-11-09 · Accepted**
- **Decision:** Brand `#e5484d` (dark `#ff6b70`) on a light UI; dark mode follows the device.

### D-16 · Motion follows Emil Kowalski's design-engineering principles
**2026-11-09 · Accepted**
- **Decision:** Press feedback `scale(0.97)`, custom ease-out curves, UI motion under 300 ms, velocity-based swipe dismissal, `@starting-style` dialogs, and a fade-only deck with reduced motion.

### D-17 · Passing is private
**2026-11-09 · Accepted**
- **Decision:** "Pass" on Discover is never shown to the other person and can be undone with "Review passed students".
