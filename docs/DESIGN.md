# Design system

Livora's look, components and motion rules. The layout patterns come from DormMate's screens; the privacy rules and the motion craft (based on Emil Kowalski's design-engineering principles) are Livora's own.

**Source of truth:** `src/app/globals.css` (tokens + utilities) and `src/components/ui.tsx` (primitives). If this doc and the code disagree, the code wins. Fix the doc.

## 1. Principles

1. **The report before the person.** Layouts lead with the score, friction points and category bars. Photos are small and blurred until a mutual match.
2. **Phone first.** Designed at 390 px wide; one column; the main actions sit within thumb reach (bottom tab bar, a Next button pinned to the bottom).
3. **Friendly, not flirty.** Warm coral, rounded cards, plain words. No hearts-and-flames dating-app language.
4. **Every tap gets an answer.** Press feedback on everything pressable; nothing appears or disappears without a short transition.
5. **Restraint.** Animate only what helps people understand what just happened. Things used many times a day stay fast.

## 2. Colour tokens

Defined as CSS variables on `:root` and exposed to Tailwind through `@theme inline` (e.g. `bg-brand`, `text-muted`, `border-line`). Light is the default; dark mode follows the device (`prefers-color-scheme`).

| Token | Tailwind | Light | Dark | Use |
|---|---|---|---|---|
| `--bg` | `bg-bg` | `#fbf8f7` | `#161213` | Page background |
| `--surface` | `bg-surface` | `#ffffff` | `#1f1a1b` | Cards, dialogs |
| `--surface-2` | `bg-surface-2` | `#f5efed` | `#2a2324` | Fields, chips, bar tracks |
| `--text` | `text-text` | `#2a2024` | `#f3eceb` | Body text |
| `--muted` | `text-muted` | `#7a6a6f` | `#b0a2a4` | Secondary text |
| `--border` | `border-line` | `#ece4e1` | `#3a3133` | Hairlines |
| `--brand` | `bg-brand` / `text-brand` | `#e5484d` | `#ff6b70` | Primary actions, scores, active tab |
| `--brand-strong` | `bg-brand-strong` | `#cf3c41` | `#ff858a` | Primary hover |
| `--brand-ink` | `text-brand-ink` | `#ffffff` | `#2b0a0c` | Text on brand |
| `--brand-soft` | `bg-brand-soft` | `#fdecec` | `#3a1c1e` | Tinted backgrounds |
| `--warn` / `--warn-soft` | | `#b45309` / `#fef3e2` | `#fbbf24` / `#3a2c10` | Notices (e.g. matching off) |
| `--danger` / `--danger-soft` | | `#c2262e` / `#fdecec` | `#f87171` / `#3b1717` | Dealbreakers, destructive actions |
| `--ok` / `--ok-soft` | | `#18794e` / `#e9f7ef` | `#4ade80` / `#13301f` | Success, "Interested" hint |

**Rules:** use tokens, never raw hex values in components. Keep text on `--brand` in `--brand-ink`. Pair every new colour with its dark value.

## 3. Type, shape and space

- **Font:** Geist Sans (`--font-sans`). Inputs are 16 px so iOS doesn't zoom on focus.
- **Headings:** `font-extrabold tracking-tight` (page titles `text-2xl`, hero `text-4xl`). Scores on cards are `text-6xl font-extrabold text-brand`.
- **Radius:** cards `rounded-3xl`, fields `rounded-2xl`, buttons and options `rounded-full` (pills).
- **Elevation:** one shadow token, `--shadow`, used only on `card`.
- **Touch targets:** buttons and options are at least 48 px tall (`min-h-12`).
- **Layout:** `main` is a centered column up to `max-w-2xl` with a 16 px gutter (`px-4`), and gets `pb-28` when the tab bar is shown. The Discover deck is narrower (`max-w-md`).

## 4. Components

### CSS utilities (`globals.css`)

| Utility | What it is |
|---|---|
| `card` | Rounded surface with a border and shadow |
| `pressable` | Adds press feedback (`scale(0.97)`) and colour transitions to anything tappable |
| `btn`, `btn-primary`, `btn-secondary`, `btn-danger` | Pill buttons; hover only on devices with a mouse |
| `field`, `label` | Text inputs and their labels |
| `chip` | Small rounded tag (amenities, metadata) |
| `option` | Large pill choice wrapping a visually hidden radio/checkbox. It fills with brand colour through `:has(input:checked)` and shows a focus ring through `:has(input:focus-visible)`. |
| `dialog.sheet` | Native `<dialog>` with an animated entry and exit |

### React primitives (`src/components`)

| Component | Notes |
|---|---|
| `TabBar` | Fixed bottom bar; the active tab sits in a filled circle. Student: Discover · Matches · Chat · Rooms · Privacy. Owner: Inquiries · New listing. Admin: Review. |
| `Logo` | Roof line over two windows + "livora" wordmark |
| `ReportBlockMenu` | Report form (reason + details, promises review within 48 hours) and silent Block, inside a `dialog.sheet`. Required on every student and listing surface. |
| `SampleDataBadge` | "Sample data" label. Keep it on every screen that shows seed data. |
| `PageTitle`, `Notice` (tones), `EmptyState` (art: search, heart, chat, home) | Layout helpers |
| `ScoreBadge`, `Friction` | Score display and friction-point list; friction text never reveals answers |
| `Avatar` | Plain `<img>` from `/api/photo/[id]`. **Never blur with CSS**: the server sends the blurred file. |

## 5. Key screens

| Screen | Pattern |
|---|---|
| **Home** | Centered hero ("Find your perfect dormmate."), three promise cards, demo panel |
| **Onboarding** | One question per screen, 18 screens, progress bar ("8 of 18"), large pill options, Next pinned to the bottom |
| **Discover** | Card deck: the top card shows a small blurred avatar, first name, age band, score, dealbreaker warning, top two friction points, nine category bars, and "See why this score". Pass / Interested buttons below. |
| **Match dialog** | "It's a match!" → Start chat / Keep discovering |
| **Matches** | "Matched · N" grid + "Waiting on them" list |
| **Chat** | Avatar row of matches above the conversation list; the thread opens with a safety banner |

## 6. Motion

Every animation must have a reason (feedback, explaining a change of state, or avoiding a jarring jump) and stay **under 300 ms**.

### Curves (`:root`)

| Token | Value | Use |
|---|---|---|
| `--ease-out` | `cubic-bezier(0.23, 1, 0.32, 1)` | Default for entering and responding |
| `--ease-in-out` | `cubic-bezier(0.77, 0, 0.175, 1)` | Things moving across the screen |
| `--ease-drawer` | `cubic-bezier(0.32, 0.72, 0, 1)` | Sheets and drawers |

Never use `ease-in` for UI, because it feels slow at the start. Plain `ease` is only for colour changes.

### Rules

| Element | Motion | Why |
|---|---|---|
| Buttons, options, links | `scale(0.97)` on `:active`, 160 ms `--ease-out` | The UI visibly hears the tap |
| Colour changes on press | Background, border and text colour transition **together** (150 ms) | Avoids a flash of white text on a pale background |
| Hover | Only inside `@media (hover: hover) and (pointer: fine)` | Stops hover states from sticking after a tap on touch screens |
| Deck drag | The card follows the finger 1:1 with a slight rotation (`dx / 22` deg); no transition while dragging | Direct manipulation |
| Deck dismiss | At ≥ 110 px **or** a flick > 0.11 px/ms; exits in 220 ms with `--ease-out` | A quick flick is enough; no need to drag far |
| Deck snap-back | Below the threshold the card returns to 0 with the same curve | |
| Deck stack | Waiting cards sit at `translateY(10px) scale(0.96)`; the third is hidden | Shows depth without clutter; never `scale(0)` |
| Swipe hints | INTERESTED / PASS labels fade in with drag distance | Says what letting go will do |
| Dialogs | Fade + scale from 0.96 with `@starting-style` (200 ms); exit 140 ms | Nothing appears from nothing; exits are faster than entries |
| Onboarding progress | `scaleX` on the bar, 300 ms `--ease-out` | Transform only, so the GPU handles it |

### Gestures

- Pointer capture once a drag starts, so the drag continues even when the finger leaves the card.
- Extra fingers are ignored during a drag (no jumping when someone shifts their grip).
- Drags don't start on links or buttons inside the card.
- `touch-action: pan-y` keeps vertical page scrolling working on the card.

### Performance

Animate only `transform` and `opacity`. Set transforms directly on the element instead of through inherited CSS variables.

## 7. Accessibility

- **Reduced motion:** with `prefers-reduced-motion: reduce`, transitions are limited to opacity and colour, press-scale is off, and the deck **fades** instead of flying away (`useReducedMotion()` in `DiscoverDeck`).
- **Keyboard:** the deck has Pass / Interested buttons with descriptive labels ("Pass on Bea"), so swiping is never required. Options show a visible focus ring.
- **Hidden cards:** cards under the top one are `aria-hidden` and can't be focused.
- **Scroll padding:** `html { scroll-padding-top: 4.5rem; scroll-padding-bottom: 7rem }` keeps focused elements clear of the sticky header and the fixed bottom bars.
- **Contrast:** check new colour pairs in both themes. Brand-on-white is used for large text and buttons. Body text uses `--text` / `--muted`.
- **Native controls:** dialogs use `<dialog>` with `showModal()` (focus trap, Esc to close); choices are real radios and checkboxes inside `option` labels.

## 8. Writing style

- Plain words, short sentences, second person ("You keep different sleep schedules.").
- Scores are framed as "decision support, not a verdict".
- Safety copy is specific ("reviewed within 48 hours", "can't be shared until you've exchanged 20 messages").
- Never claim real verification, real users or legal compliance. Seed content says "Sample data".
