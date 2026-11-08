# Changelog

All notable changes to Livora. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow [Semantic Versioning](https://semver.org/). The scoring engine has its own version (`SCORING_VERSION`), noted when it changes.

## [Unreleased]

### Added
- Documentation set: README, architecture, privacy and safety design, scoring, design system, demo guide and QA checklist, decision log, glossary, contributing guide, security policy, this changelog.

## [0.1.0] - 2026-11-09

First MVP prototype, on sample data. Scoring engine `rules-v1.0`.

### Added
- **Onboarding** in 18 one-question screens: school-email check (demo code), 18+ age gate, gender and room preference, budget, must-haves, the 9-category Living Profile with importance and up to 3 dealbreakers, house rules, granular consent.
- **Living Simulation** with 8 scenarios, blended into the self-reported profile.
- **Discover** swipe deck, report-first: score, friction points and category bars; blurred avatar; private pass; velocity-based swipe; "It's a match!" dialog.
- **Matches** grid, a "waiting on them" list, and a per-category score explanation.
- **Chat** between mutual matches, with a safety banner and contact details blocked for the first 20 messages.
- **Rooms** ranked by Living Fit or Housing Fit; inquiries; the address is released only after the owner accepts.
- **Owner view:** inquiries with four student fields, accept/decline, new (unverified) listings.
- **Safety review queue:** reports with a 48 h countdown, dismiss or suspend, listing verification.
- **Privacy page:** what others see, consent toggles, JSON data export, account deletion.
- Report and Block on every student surface; Report on listings.
- Gated photo route serving pre-rendered blurred or full images from `private/`.
- Coral, light-first design system with dark mode, bottom tab bar, press feedback, reduced-motion support.
- PWA manifest and icons.
- Unit tests for the scoring engine, age gate and contact-detail guard.

[Unreleased]: https://github.com/yasmnngls/livora-webapp/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/yasmnngls/livora-webapp/releases/tag/v0.1.0
