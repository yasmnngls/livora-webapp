# Security policy

## Status

Livora is a **prototype running on sample data**. It has no real authentication (a demo cookie switches between sample accounts), no persistent storage, and must not hold real personal data. The known gaps are listed in [docs/PRIVACY.md §6](docs/PRIVACY.md#6-known-gaps).

| Version | Supported |
|---|---|
| 0.1.x (prototype) | Fixes on `main` only |

## Reporting a vulnerability

Please report privately using **GitHub → Security → Report a vulnerability** on this repository (a private security advisory). Don't open a public issue or PR for a vulnerability.

Include:
- What the problem is and its impact (e.g. "a student can see another student's full photo before a mutual match").
- The steps to reproduce it on the sample data.
- The affected route, Server Action or file, if you know it.

We aim to acknowledge reports within 3 working days. This is a small team's goal, not a guaranteed service level.

## What counts as in scope

The highest-priority issues are anything that breaks a privacy rule:

- Raw answers, school email, year of birth, budget or simulation answers reaching another user or the browser.
- A full photo served before a mutual match, or any photo served after a block or with photo consent off.
- A listing address shown before the owner accepts.
- An owner seeing more than first name, school cluster, move-in month and group size.
- Seeing or messaging someone who is blocked, suspended, in another cluster, or not a mutual match.
- Under-18 sign-up getting past the age gate.

**Known and out of scope** until real auth ships: the demo session cookie can be edited to become any sample account, and the verification code is fixed. These are documented prototype limitations.
