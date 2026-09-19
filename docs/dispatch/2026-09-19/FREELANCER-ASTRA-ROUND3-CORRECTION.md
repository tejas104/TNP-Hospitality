SESSION TYPE: OLD SESSION `01a0b4fa-f7ad-7e31-a0ea-babdec221d0b`

DO NOT OPEN A NEW SESSION. Resume only the original `/root/freelancer_builder` Codex session whose actual runtime was verified as `gpt-6-astra` / high on `DESKTOP-DL9FDM7`.

# TNP-FREELANCER-ASTRA-M1 — round-three retained-registration correction

IMPLEMENTATION CORRECTION ONLY. Start from exact clean remote-equal `28ecc920ffe055db0495159e90ee1a1ce3ed2226` on:

- branch: `codex/tnp-freelancer-astra-m1`
- worktree: `D:\TNP-worktrees\TNP-FREELANCER-ASTRA-M1`
- port: `3108`
- direct predecessor: `c8c6d759a8d5f375e20db43ef2570defd9ad8cfc`
- same independent reviewer after handoff: Claude session `96dfef2e-af39-4af1-a619-26ed81ca128a`

Before editing, report actual session/thread ID, model, effort, host, PWD, branch, HEAD, remote ref, tracked cleanliness and port state. Stop on any mismatch. Read current `AGENTS.md`, `TNP-START-HERE.md`, `docs/tasks/TNP-FREELANCER-ASTRA-M1.md`, this packet and the same-Claude round-two return. Ignore the base checkout's unrelated untracked `tmp/`; do not inspect, alter, stage or delete it.

## Sole blocking defect

The exact round-two candidate correctly recovered a genuine lost registration response, but its admission proof is too broad. `isRetainedRegistration` currently accepts a matching retained request whenever the profile has any application. Seeded workers 004 and 005 already have seeded applications. A planted fresh-key journal for either profile can therefore pass the guard, create a contradictory pending application and show false saved feedback. Workers 003/006/007 happened to remain blocked only because they have no application, and the current tests enumerate only those three.

Fix replay admission so it proves this retained request's own effect rather than merely finding any application for the profile. The smallest acceptable client-local rule may require all of the following evidence: exact retained request identity/payload/profile/generation; current worker display name and role matching that payload; worker is not approved; and an application for that profile and role exists. An equally strong first-attempt marker wholly inside the owned Freelancer journal is acceptable if it is captured before submission and cannot be inferred solely from post-effect application existence. Do not change shared contracts, fixtures or preview-service behavior.

The service ledger remains authoritative. Genuine new applicant success -> lost response -> reload -> exact retry must reach `service.mutate`, replay the original receipt, preserve exactly one worker and one application, and show truthful recovered-success feedback. A materially changed payload on the same key must still conflict. A seeded worker with a planted fresh request key must remain blocked without worker/profile mutation, new application or success copy.

## Writable paths only

- `components/tnp/portals/freelancer/useFreelancer.ts`
- `components/tnp/portals/freelancer/freelancer.test.mjs`
- `components/tnp/portals/freelancer/browser-check.mjs`

All other paths are frozen, including Freelancer presentation/CSS, shared contracts/services/fixtures, other portals, route/shell/global files, packages, docs, backend/provider and production state. Do not redesign or expand scope.

## Mandatory regression proof

Add deterministic unit and browser coverage for:

1. A genuinely new applicant succeeds once, loses the response, reloads the exact journal and receives the original replayed receipt with exactly one worker/application.
2. Seeded workers `tnp-demo-worker-003`, `004`, `005`, `006` and `007` are all blocked from a fresh registration journal. For 004 and 005 explicitly plant a fresh request key and different name/role payload and prove no new application, no worker mutation and no saved-success copy.
3. Same key with materially changed payload returns the existing idempotency conflict and no mutation.
4. Another profile cannot inherit the request, receipt, draft or feedback.
5. Generation reset/stale journal and storage-denial in-memory fallback remain truthful.
6. Previously cleared application/assessment/opportunity/claim/Coming/Not Coming, selected-worker, keyboard, touch, reduced-motion and AA-contrast behavior remains unchanged.

Client-local anti-tamper checks are not production authorization. State that a hand-crafted exact-copy journal remains a residual production-boundary risk requiring future server-side enforcement; do not weaken the synthetic preview to pretend otherwise.

## Verification and handoff

Run the focused Freelancer tests plus applicable shared preview/request-identity tests, then the task browser matrix at `1440x900`, `1100x900`, `390x844` and `320px`, including 004/005 planting and genuine lost-response replay. Also run:

- `npm run lint`
- `npx --no-install tsc --noEmit --incremental false`
- `npm run build:vercel` — one unchanged retry only for documented Windows Nitro `EBUSY` after stopping task-owned processes
- `git diff --check 28ecc920ffe055db0495159e90ee1a1ce3ed2226..HEAD`

Commit only the three owned files, non-force push only `codex/tnp-freelancer-astra-m1`, stop task-owned server/browser processes, prove port3108 free, worktree clean and live remote equal to the new final SHA, then return the lease. Report exact changed files, commands/results, viewport/state evidence, limitations and immutable final SHA.

Do not merge main, push main, deploy, connect providers, change production, or request Kartik acceptance yet. The same Claude OLD SESSION must first perform focused fixed-SHA re-review of the successor; Kartik acceptance and P-controlled local integration remain separate gates.
