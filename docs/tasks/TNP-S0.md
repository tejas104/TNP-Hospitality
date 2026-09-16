# TNP-S0 — Extract the four existing portals and shared visual helpers without redesign; resolve the eight inherited navigation lint errors within the named files.

Status: Draft. NOT dispatched. Writer lease: NONE.
Responsible human: Anjaneya (H1).
Lane/host: B / Laptop 1 (proposed; verify at launch).
Tool/model/effort: Codex; exact model/effort pending selection on assigned host.
Isolated branch: codex/tnp-s0 (planned, not created).
Absolute worktree: D:\TNP-worktrees\TNP-S0 (proposed, not created or verified).
Audited source baseline: 9d58061f2d36514ebc932fa94bb3dc90f4b97a97.
Implementation baseline SHA: PENDING current integrated main after prerequisites; do not start from the old audit SHA.
Dependencies: TNP-BOOT-01 and transitive bootstrap/S0/S1 as applicable.
Merged dependency evidence: NONE yet; record each merge SHA and verify ancestry with git merge-base --is-ancestor before marking Ready.
Mode: labelled synthetic frontend preview only.
Risk: Architecture/shared UI; independent Astra REQUIRED.
Opposite-model reviewer: Claude; actual reviewer session/model and availability pending.
Independent human reviewer: Kartik; schedule/acceptance pending.
Astra gate: REQUIRED at a fixed commit in a fresh session, independent of author.
Canonical contract: ../contracts/S0-SHARED-UI.md.

## Owned paths/contracts/resources
All exact paths in docs/contracts/S0-SHARED-UI.md, including bounded HomeExperience anchor changes. No other files.
No live database, webhook, provider or background job. Proposed local port 3102; verify it is free. Separate browser profile/fixture namespace for task checks; do integrated cross-portal walkthrough in one profile.
Shared ownership is exclusive for this prerequisite; other builders wait.

## Do not modify
Anything outside owned paths. In particular package/lockfiles, framework/hosting config, auth/API/database/providers, real client data, other lane views and shared status/lease registers.
Do not extend ownership beyond the referenced prerequisite contract.

## Acceptance
All five URLs and existing interactions retain behavior; approved compositions preserved; named exports and compatibility barrel valid; desktop/mobile/reduced-motion/focus evidence; visible sample-data label; zero lint errors, with unchanged inherited warnings separately recorded.
All primary actions must be real preview interactions, with relevant errors/recovery. Unimplemented screens do not earn readiness credit. Proposed business rules remain labelled.

## Required checks
Read AGENTS.md, PRODUCT.md, DESIGN.md, DOMAIN-RULES.md, ARCHITECTURE.md, the referenced contract and task.
Do not update shared STATUS/LANES from a builder branch; return evidence to the dispatcher.
Routine required checks: npm ci; npm run lint; npx --no-install tsc --noEmit; npm run build:vercel.
After S1 exists also run: node --experimental-strip-types --test tests/preview-contract.test.mjs.
Browser: 1440x900 and 390x844; keyboard/focus, primary journey, relevant loading/empty/error/success, refresh/reset. Record actual commit/origin and screenshots or reproducible evidence. Use a reserved per-task browser profile; no real PII/providers.
No merge, push, publication, production operations or spawned implementation agents.
Task-specific: The S1 scenario test is not applicable yet. Do not add or run an invented test suite. Capture before/after for each route.

## Launch and handoff
Human records actual host/path/model, complete dependency evidence, own/reviewer availability, exact baseline and lease timestamp/session. Only then change Draft -> Ready -> Building after observed launch.
At completion: changed files, fixed HEAD_SHA, commands/results, browser evidence, unresolved gaps and review target. Stop writing at review handoff. Builder fixes findings under the same bounded task; new HEAD requires relevant re-review.
