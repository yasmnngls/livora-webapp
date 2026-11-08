# Demo guide and QA checklist

How to show Livora in about 10 minutes, and how to check by hand that the privacy rules still hold.

**Before every demo:** start the app (`npm run dev`), open the home page and press **Reset sample data**. All data is in memory and resets on restart.

## 1. Sample accounts

All are invented. Every student is 18 or older.

### Students

| Id | Name | Cluster | Notes for the demo |
|---|---|---|---|
| s1 | **Maya** | U-Belt, Sampaloc | The **"Try as sample student"** account. Living Simulation done. Dealbreaker: cleanliness. Budget ₱4,000–6,000; wants Wi-Fi + aircon. |
| s2 | Bea | U-Belt | **Already interested in Maya.** Roommate Fit with Maya: 96 → instant match. |
| s3 | Carla | U-Belt | Night owl, very social. A low score with Maya. |
| s4 | Dani | U-Belt | **Already interested in Maya.** Dealbreaker: temperature. Good for the Block demo. |
| s5 | Ella | U-Belt | Opposite of Maya; two dealbreaker conflicts → score 5, **still shown** (last in the deck). |
| s6 | Faye | Sta. Mesa | Same answers as Maya but a different cluster → **never shown to Maya**. |
| s7 | Gab | U-Belt | Man, same-gender room preference → not shown to Maya. |
| s8 | Hiro | U-Belt | Man → not shown to Maya. |

Sample students automatically return interest when the Roommate Fit is 60 or more, and they reply once in chat. That's mock behaviour, so one person can try the whole flow.

### Owners and listings

| Owner | Listings |
|---|---|
| **Rosa** (o1, the **"Dorm owner view"** account) | l1 Quiet 2-bed room near España · l2 Budget bedspace · l3 Studio-type for 2 · l7 Newly renovated 2-bed · l9 Room for 2, study desks |
| Ben (o2) | l4 Shared room with study hall · l5 Men's dorm · l6 Fan room · l8 Bedspace with weekly cleaning · l10 Aircon bedspace, men only |

All seed listings are verified; their addresses are fake ("100 Sample Street").

### Other roles

- **Safety review queue:** the admin view.
- **New accounts:** use `<name>@ust.edu.ph`, `@feu.edu.ph`, `@ue.edu.ph` (U-Belt) or `@pup.edu.ph` (Sta. Mesa), with verification code **`123456`**. Each email can be used once per reset.

## 2. Demo script (10 minutes)

| # | Do | Say | Shows |
|---|---|---|---|
| 1 | Home page | "You see how well you'd live together before you share anything personal." | Positioning |
| 2 | **Create my profile** → go through a few screens → enter birth year 2010 | "Under-18s can't sign up. The check runs on the server, not just in the form." | Age gate |
| 3 | Back home → **Try as sample student** | "This is Maya. Her deck leads with the score, not a photo." | Report-first Discover |
| 4 | Point at Bea's card: blurred avatar, 96, category bars | "Bea sees the same kind of card about Maya. Neither sees the other's answers." | Disclosure stage 1 |
| 5 | Tap **See why this score** | "Every score is explained, category by category. It's decision support, not a verdict." | Explainability |
| 6 | Back → swipe Bea right | "Bea already liked Maya, so now it's a match. Only now are photos unblurred and chat opened." | Mutual accept |
| 7 | **Start chat** → type `0917 123 4567` | "Contact details are blocked for the first 20 messages." | Contact guard |
| 8 | Send "Hi!" | Bea replies (sample reply) | Chat |
| 9 | **Rooms** → *Quiet 2-bed room near España* | "Living Fit with Bea combines how you'd live together with the room. No address yet." | Living Fit, hidden address |
| 10 | Send an inquiry → log out → **Dorm owner view** | "Rosa sees four things about Maya: first name, school cluster, move-in month, group size." | Owner minimisation |
| 11 | Accept → log out → **Try as sample student** → the same listing | "Now the address appears, only for Maya." | Address release |
| 12 | **Discover** → Dani's card → **See why this score** → **Report** | "Reports are reviewed within 48 hours." Then **Block**: "Blocking is silent and works both ways." | Safety |
| 13 | Log out → **Safety review queue** | "The reviewer sees the report and its countdown, and can dismiss it or suspend the account." | Review queue |
| 14 | Sample student → **Privacy** | "What others see, your consents (all optional ones off by default), download your data, delete your account." | Data rights |

**Handle questions honestly:** login is a demo switch, verification is a fixed code, and nothing is stored after a restart. See [README → Limitations](../README.md#limitations).

## 3. Manual QA checklist

Run this after any change that touches matching, photos, chat, listings or copy. Reset sample data first.

### Onboarding
- [ ] A birth year that makes you under 18 is refused with "Livora is for students 18 and older".
- [ ] The 18+ confirmation is required.
- [ ] An email outside the pilot domains is refused; a wrong code is refused.
- [ ] There are 9 Living Profile screens, then House rules.
- [ ] Optional consents start **off**; you can't continue without the matching consent.
- [ ] Finishing onboarding leads to the Living Simulation, and "Skip for now" goes to Discover.

### Discover and matches
- [ ] Bea's photo is the **blurred** file before a match (open the image URL in a new tab to check).
- [ ] The page source has no raw answers (e.g. "Before 10pm"), school emails, `yearOfBirth` or `budgetMax`.
- [ ] Swiping right on Bea shows "It's a match!"; her photo is then the full file.
- [ ] A quick, short flick dismisses a card.
- [ ] Faye (other cluster), Gab and Hiro (men) never appear for Maya.
- [ ] Ella appears, with the dealbreaker warning, and is not filtered out.
- [ ] Matches shows "Matched · 1" with Bea; the detail page explains the score without raw answers.

### Chat
- [ ] Sending a phone number, email, link or `@handle` early on is blocked with the 20-message explanation.
- [ ] A normal message sends; the sample student replies once.
- [ ] The safety banner is visible.

### Rooms and owners
- [ ] Listings show "Living Fit with Bea" once you've matched.
- [ ] Maya never sees men-only listings.
- [ ] The address ("100 Sample Street") isn't in the page **source** before the inquiry is accepted.
- [ ] The owner's inquiry shows only "Maya · U-Belt, Sampaloc", the move-in month and the group size; the page source has no email, age, score or budget.
- [ ] After the owner accepts, the address appears for Maya.
- [ ] A new owner listing doesn't appear for students until it's verified in the review queue.

### Safety
- [ ] Reporting shows "within 48 hours"; the report appears in the admin queue.
- [ ] After Maya blocks Dani, Dani is gone from Maya's deck **and** Maya is gone from Dani's.
- [ ] Suspending a reported account removes it from every view.

### Privacy page
- [ ] "Download my data" returns JSON with your own data only.
- [ ] Deleting the account logs you out, and Maya disappears for Bea.
- [ ] **Try as sample student** still works after Maya was deleted (it restores her).

### Layout and motion
- [ ] No horizontal scroll at 1440, 390 and 360 px on every screen.
- [ ] Light and dark mode both look right.
- [ ] With reduced motion on (OS setting or DevTools → Rendering), the deck fades instead of sliding, and buttons don't scale.
- [ ] Focused fields aren't hidden behind the header or the bottom bars.
- [ ] No errors in the browser console.
