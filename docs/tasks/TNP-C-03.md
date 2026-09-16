# TNP-C-03 — F10 pass/attendance history/GPS-denied and F11 earnings/payout/ratings/account-standing views.

Status: Draft. NOT dispatched. Writer lease: NONE.
Responsible human: Kartik (H2).
Lane/host: C / Laptop 2 (proposed; verify at launch).
Tool/model/effort: Codex; exact model/effort pending selection on assigned host.
Isolated branch: codex/tnp-c-03 (planned, not created).
Absolute worktree: C:\dev\tnp-work\TNP-C-03 (proposed, not created or verified).
Audited source baseline: 9d58061f2d36514ebc932fa94bb3dc90f4b97a97.
Implementation baseline SHA: PENDING current integrated main after prerequisites; do not start from the old audit SHA.
Dependencies: TNP-C-02 and transitive bootstrap/S0/S1 as applicable.
Merged dependency evidence: NONE yet; record each merge SHA and verify ancestry with git merge-base --is-ancestor before marking Ready.
Mode: labelled synthetic frontend preview only.
Risk: Sensitive attendance/financial presentation; independent Astra REQUIRED for semantic integrity.
Opposite-model reviewer: Claude; actual reviewer session/model and availability pending.
Independent human reviewer: Anjaneya; schedule/acceptance pending.
Astra gate: REQUIRED at a fixed commit in a fresh session, independent of author.
Canonical contract: ../contracts/S0-SHARED-UI.md and ../contracts/S1-PREVIEW-INTERFACES.md.

## Owned paths/contracts/resources
components/tnp/portals/freelancer/** only.
No live database, webhook, provider or background job. Proposed local port 3103; verify it is free. Separate browser profile/fixture namespace for task checks; do integrated cross-portal walkthrough in one profile.
Consumer of frozen shared contracts only; no ownership of shared state schema or mutations.

## Do not modify
Anything outside owned paths. In particular package/lockfiles, framework/hosting config, auth/API/database/providers, real client data, other lane views and shared status/lease registers.
AppShell, globals.css, PortalPages compatibility file, existing route wiring, shared helpers, lib/contracts, lib/demo and lib/services are frozen. Raise a prerequisite for changes.

## Acceptance
Preview pass, event-linked attendance history and denied GPS distinct from valid; earnings explanation shows attendance/rate/adjustment/approval status from shared data; payout history/reference clearly synthetic; four-criteria ratings/comments and human-review standing; no automatic deactivation or live-tracking claim.
All primary actions must be real preview interactions, with relevant errors/recovery. Unimplemented screens do not earn readiness credit. Proposed business rules remain labelled.

## Required checks
Read AGENTS.md, PRODUCT.md, DESIGN.md, DOMAIN-RULES.md, ARCHITECTURE.md, the referenced contract and task.
Do not update shared STATUS/LANES from a builder branch; return evidence to the dispatcher.
Routine required checks: npm ci; npm run lint; npx --no-install tsc --noEmit; npm run build:vercel.
After S1 exists also run: node --experimental-strip-types --test tests/preview-contract.test.mjs.
Browser: 1440x900 and 390x844; keyboard/focus, primary journey, relevant loading/empty/error/success, refresh/reset. Record actual commit/origin and screenshots or reproducible evidence. Use a reserved per-task browser profile; no real PII/providers.
No merge, push, publication, production operations or spawned implementation agents.
Task-specific: GPS denied/missing versus outside-radius display; correction preserves evidence; earning pending/two-approved/processing views; no-reference payout is not paid; under-review is not permanently blocked.

## Launch and handoff
Human records actual host/path/model, complete dependency evidence, own/reviewer availability, exact baseline and lease timestamp/session. Only then change Draft -> Ready -> Building after observed launch.
At completion: changed files, fixed HEAD_SHA, commands/results, browser evidence, unresolved gaps and review target. Stop writing at review handoff. Builder fixes findings under the same bounded task; new HEAD requires relevant re-review.
