# TNP-C-01 — F07 freelancer application and assessment preview.

Status: Draft. NOT dispatched. Writer lease: NONE.
Responsible human: Kartik (H2).
Lane/host: C / Laptop 2 / Kartik (confirmed; verify actual path/model at launch).
Tool/model/effort: Claude on Kartik's Laptop 2 (user confirmed); exact version/effort pending launch verification.
Isolated branch: codex/tnp-c-01 (planned, not created).
Absolute worktree: C:\dev\tnp-work\TNP-C-01 (proposed, not created or verified).
Audited source baseline: 9d58061f2d36514ebc932fa94bb3dc90f4b97a97.
Implementation baseline SHA: PENDING current integrated main after prerequisites; do not start from the old audit SHA.
Dependencies: TNP-S1 and transitive bootstrap/S0/S1 as applicable.
Merged dependency evidence: NONE yet; record each merge SHA and verify ancestry with git merge-base --is-ancestor before marking Ready.
Mode: labelled synthetic frontend preview only.
Risk: Routine synthetic onboarding preview; Astra not required unless identity/security authority changes.
Opposite-model reviewer: fresh Codex session; actual model and availability pending.
Independent human reviewer: Anjaneya; schedule/acceptance pending.
Astra gate: Not required within frozen UI scope; escalate before any listed high-risk change.
Canonical contract: ../contracts/S0-SHARED-UI.md and ../contracts/S1-PREVIEW-INTERFACES.md.

## Owned paths/contracts/resources
components/tnp/portals/freelancer/** only.
No live database, webhook, provider or background job. Proposed local port 3103; verify it is free. Separate browser profile/fixture namespace for task checks; do integrated cross-portal walkthrough in one profile.
Consumer of frozen shared contracts only; no ownership of shared state schema or mutations.

## Do not modify
Anything outside owned paths. In particular package/lockfiles, framework/hosting config, auth/API/database/providers, real client data, other lane views and shared status/lease registers.
AppShell, globals.css, PortalPages compatibility file, existing route wiring, shared helpers, lib/contracts, lib/demo and lib/services are frozen. Raise a prerequisite for changes.

## Acceptance
Editable application steps, required validation, availability/experience/preferred-role entry, assessment questions/result, submitted reference and pending verification; use synthetic inputs and explicit KYC preview states; no simulated approval presented as live.
All primary actions must be real preview interactions, with relevant errors/recovery. Unimplemented screens do not earn readiness credit. Proposed business rules remain labelled.

## Required checks
Read AGENTS.md, PRODUCT.md, DESIGN.md, DOMAIN-RULES.md, ARCHITECTURE.md, the referenced contract and task.
Do not update shared STATUS/LANES from a builder branch; return evidence to the dispatcher.
Routine required checks: npm ci; npm run lint; npx --no-install tsc --noEmit; npm run build:vercel.
After S1 exists also run: node --experimental-strip-types --test tests/preview-contract.test.mjs.
Browser: 1440x900 and 390x844; keyboard/focus, primary journey, relevant loading/empty/error/success, refresh/reset. Record actual commit/origin and screenshots or reproducible evidence. Use a reserved per-task browser profile; no real PII/providers.
No merge, push, publication, production operations or spawned implementation agents.
Task-specific: Incomplete application rejection; assessment back/forward, result, retry/error and submitted reference; refresh/reset and mobile/keyboard.

## Launch and handoff
Human records actual host/path/model, complete dependency evidence, own/reviewer availability, exact baseline and lease timestamp/session. Only then change Draft -> Ready -> Building after observed launch.
At completion: changed files, fixed HEAD_SHA, commands/results, browser evidence, unresolved gaps and review target. Stop writing at review handoff. Builder fixes findings under the same bounded task; new HEAD requires relevant re-review.
