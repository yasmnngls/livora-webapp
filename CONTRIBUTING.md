# Contributing to Livora

Thanks for helping. Livora handles information that could locate students, so the privacy rules below are **requirements**, not style preferences. A PR that breaks one won't be merged, even if everything else is great.

## 1. Setup

```bash
npm install
npm run dev          # http://localhost:3000 (or: npx next dev -p 3123)
```

Read first: [README](README.md) → [ARCHITECTURE](docs/ARCHITECTURE.md) → [PRIVACY](docs/PRIVACY.md). This is Next.js 16: check `node_modules/next/dist/docs/` before relying on what you remember from older versions.

## 2. Workflow

1. **Start from a spec.** Check the [PRD](.agents/PRD.md) for scope. For anything non-trivial, open an issue or an OpenSpec change (`openspec/`) before writing code.
2. **Branch** from `main`: `feat/…`, `fix/…`, `docs/…`, `chore/…`.
3. **Build in this order:** DAL function + view model → Server Action → screen. See [ARCHITECTURE §7](docs/ARCHITECTURE.md#7-adding-a-feature-safely).
4. **Verify** (all must pass):
   ```bash
   npm run lint && npm run typecheck && npm test
   ```
   Then run the relevant parts of the [manual QA checklist](docs/DEMO.md#3-manual-qa-checklist), and check phone (390 px) and desktop widths in light and dark mode.
5. **Commit** with [Conventional Commits](https://www.conventionalcommits.org/): `feat(chat): block social handles in early messages`.
6. **Open a PR** using the checklist below. Screenshots are required for visible changes.

## 3. Project rules (non-negotiable)

**Data that reaches the browser**
- Screens get data from `src/lib/dal/*` only, as `*View` types. Never pass a `Student`, `Listing` or raw record to a client component.
- Never send another person's raw answers, school email, year of birth, budget or simulation answers to the browser.
- Others see: first name, age band, school cluster, score, friction points. Never a surname, phone, socials or birthdate. Those aren't collected at all.

**Photos**
- Student photos live in `private/`, never `public/`, and are served only by `/api/photo/[id]`: the blurred file before a mutual accept, the full one after. **Never blur with CSS.**

**Listings and owners**
- The address appears only after the owner accepts that student's inquiry.
- Owners see only first name, school cluster, move-in month and group size.

**Consent and collection**
- Optional consents default to **off**.
- Never collect religion, ethnicity, health, sexual orientation or political views.
- A new field needs a stated purpose and a row in the [data inventory](docs/PRIVACY.md#3-data-inventory).

**Scoring**
- Scores are "decision support, not a verdict". The engine never filters anyone out by score; dealbreakers lower the score and show a warning.
- Bump `SCORING_VERSION` on any change that can move a score, and update [SCORING.md](docs/SCORING.md).

**Safety**
- Every profile, chat and listing has Report. Every student surface has Block. Report copy promises review within 48 hours.
- Every Server Action re-checks the role (`require*()`) and the visibility rules on the server.

**Honesty**
- Sample data stays labelled "Sample data".
- Don't claim real verification, real users, results or legal compliance that the product can't show yet.

## 4. Code style

- TypeScript strict; no `any` in app code.
- Server components by default; add `"use client"` only for interaction.
- Tailwind with the design tokens ([DESIGN.md](docs/DESIGN.md)); no raw hex values in components.
- Motion: only `transform`/`opacity`, `--ease-out`, under 300 ms, hover gated to fine pointers, and a reduced-motion fallback.
- Pure logic (`scoring/`, `safety/`) gets unit tests next to it.
- Comments explain *why*, especially for privacy rules.

## 5. Pull request checklist

Copy this into your PR description:

```markdown
## What and why
<!-- one paragraph; link the issue / spec -->

## Checks
- [ ] `npm run lint && npm run typecheck && npm test` pass
- [ ] Manual QA for the affected areas (docs/DEMO.md §3)
- [ ] Phone (390px) + desktop, light + dark; no console errors
- [ ] Reduced motion checked (if motion changed)

## Privacy
- [ ] No new private field reaches the browser (view models only)
- [ ] New/changed fields added to docs/PRIVACY.md §3
- [ ] Report/Block present on any new student or listing surface
- [ ] SCORING_VERSION bumped + docs/SCORING.md updated (if scoring changed)

## Docs
- [ ] README / docs updated; decision logged in docs/DECISIONS.md (if any)
- [ ] CHANGELOG.md "Unreleased" updated

## Screenshots
<!-- before / after for visible changes -->
```

## 6. Reviews

PRs get two reviews: one for correctness (`code-reviewer`) and one for honesty and privacy (`compliance-reviewer`, which checks against these rules and the project rules in `CLAUDE.md`). Fix every blocker before merging.

## 7. Security issues

Don't open a public issue. See [SECURITY.md](SECURITY.md).
