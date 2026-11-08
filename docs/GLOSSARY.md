# Glossary

Use these terms the same way in code, copy and docs.

| Term | Meaning | In code |
|---|---|---|
| **Age band** | The age range shown to others (18–20, 21–23, 24–26, 27+). The exact age is never shown. | `ageBand()` |
| **Age gate** | The 18+ check at sign-up: year of birth **and** a confirmation | `passesAgeGate()` |
| **Candidate** | Another student you're allowed to see | `CandidateView` |
| **Cluster (school cluster)** | A group of nearby campuses whose students can share housing (pilot: U-Belt, Sampaloc). Derived from the school-email domain. | `schoolCluster`, `SCHOOL_DOMAINS` |
| **Contact unlock** | The point (20 messages in a thread) after which contact details can be sent in chat | `CONTACT_UNLOCK_MESSAGES` |
| **DAL** | Data access layer: the server-only functions that read and write data and return view models | `src/lib/dal/*` |
| **Dealbreaker** | A category (max 3) where a big difference really matters to you. A conflict lowers the score by 15 and shows a warning. | `dealbreakers`, `DEALBREAKER_PENALTY` |
| **Dealbreaker conflict** | A friction point in a category either person marked as a dealbreaker | `hasDealbreakerConflict` |
| **Discover** | The swipe deck of candidates you haven't acted on yet | `discoverDeck()` |
| **Effective value** | A category value after averaging the self-report with Living Simulation answers | `effectiveValues()` |
| **Friction point** | A category where two people differ by 2 or more (on 0–4), shown as a neutral sentence | `FrictionPoint`, `FRICTION_GAP` |
| **House rules** | Agreements about the shared space (smoking, drinking at home, overnight guests), used instead of personal labels | `HouseRules` |
| **Housing Fit** | 0–100: how well a room meets a student's budget (60%) and must-haves (40%) | `housingFit()` |
| **Importance** | How much a category matters to you: 1 nice to have, 2 matters, 3 very important | `Importance` |
| **Inquiry** | A student's request to an owner about a listing: move-in month + group size | `Inquiry` |
| **Interest** | A one-way "Interested". Only revealed once it is mutual. | `Interest` |
| **Living Fit** | 0–100: Roommate Fit (60%) combined with the pair's lower Housing Fit (40%) for a specific room | `livingFit()` |
| **Living Profile** | The 9-category self-report: sleep, cleanliness, noise, social, study, food, temperature, privacy, responsibilities | `LivingProfile` |
| **Living Simulation** | 8 everyday scenarios whose answers refine the Living Profile | `SCENARIOS` |
| **Mutual match** | Both students marked each other Interested (and neither blocked the other). Unlocks the full photo and chat. | `isMutual()` |
| **Pass** | A private "not now" on Discover | `passCandidate()` |
| **Roommate Fit** | 0–100 compatibility between two students | `roommateFit()` |
| **Sample data** | Invented seed data. Must always be labelled as such in the UI. | `isSample`, `SampleDataBadge` |
| **Scoring version** | The engine version logged with every score (`rules-v1.0`) | `SCORING_VERSION` |
| **Suspended** | An account or listing removed from every view after a reviewer acts on a report | `suspendedIds` |
| **Verified listing** | A listing approved by a reviewer. Only verified listings are shown to students. | `Listing.verified` |
| **View model** | A data shape built for one viewer that contains only what they may see. The only thing that reaches the browser. | `*View` types |
| **Visible** | One student may see another: same cluster, both consent to matching, no block, neither suspended, compatible room preferences | `canSee()` |
