# TNP-D-01 — F12 Operations overview and F13 event list/detail/roster using shared scenario.

Status: Draft. NOT dispatched. Writer lease: NONE.
Responsible human: Kartik (H2).
Lane/host: D / Laptop 2 / Kartik (confirmed; verify actual path/model at launch).
Tool/model/effort: Codex on Kartik's Laptop 2 (user confirmed); exact model/effort pending launch verification.
Isolated branch: codex/tnp-d-01 (planned, not created).
Absolute worktree: D:\TNP-worktrees\TNP-D-01 (proposed, not created or verified).
Audited source baseline: 9d58061f2d36514ebc932fa94bb3dc90f4b97a97.
Implementation baseline SHA: PENDING integrated source/dependency baseline (SOURCE_SHA); do not start from the old audit SHA.
Launch-contract revision: PENDING; P supplies the full LAUNCH_SHA after committing the Ready TASK. This file does not embed its own commit hash.
Review sharing: PENDING authorized pusher, branch/ref and fixed SHA handoff; no force-push or moving reviewed tags.
Reviewer host/availability: PENDING appointment; preferred Sonnet and Sol reviewer hosts are Kartik Laptop 2, Codex review of C on Anjaneya Laptop 1.
Launch protocol: docs/LAUNCH-PROTOCOL.md; initial HEAD must equal LAUNCH_SHA, not SOURCE_SHA.
Dependencies: TNP-FOUND-01. Verify all transitive prerequisite commits through that dependency; never depend on this task itself.
Merged dependency evidence: NONE yet; record each merge SHA and verify ancestry with git merge-base --is-ancestor before marking Ready.
Mode: labelled synthetic frontend preview only.
Risk: Routine preview; Astra not required unless shared domain/architecture changes.
Opposite-model reviewer: fresh Claude session; actual version and availability pending.
Independent human reviewer: Anjaneya; schedule/acceptance pending.
Astra gate: Not required within frozen UI scope; escalate before any listed high-risk change.
Canonical contract: ../contracts/S0-SHARED-UI.md and ../contracts/S1-PREVIEW-INTERFACES.md.

## Owned paths/contracts/resources
components/tnp/portals/operations/** only.
No live database, webhook, provider or background job. Proposed local port 3104; verify it is free. Separate browser profile/fixture namespace for task checks; do integrated cross-portal walkthrough in one profile.
Consumer of frozen shared contracts only; no ownership of shared state schema or mutations.

## Do not modify
Anything outside owned paths. In particular package/lockfiles, framework/hosting config, auth/API/database/providers, real client data, other lane views and shared status/lease registers.
AppShell, globals.css, PortalPages compatibility file, existing route wiring, shared helpers, lib/contracts, lib/demo and lib/services are frozen. Raise a prerequisite for changes.

## Acceptance
Preserve approved composition; sidebar reaches actual panels or explicitly marks later features unavailable; linked metrics, two functions per booking, selectable event detail and roster; quantities 6 and 40 work without layout assumptions; worker claims reflect on navigation.
All primary actions must be real preview interactions, with relevant errors/recovery. Unimplemented screens do not earn readiness credit. Proposed business rules remain labelled.

## Required checks
Read AGENTS.md, PRODUCT.md, DESIGN.md, DOMAIN-RULES.md, ARCHITECTURE.md, the referenced contract and task.
Do not update shared STATUS/LANES from a builder branch; return evidence to the dispatcher.
Routine required checks: npm ci; npm run lint; npx --no-install tsc --noEmit; npm run build:vercel.
After S1 exists also run: node --experimental-strip-types --test tests/preview-contract.test.mjs.
Browser: 1440x900 and 390x844; keyboard/focus, primary journey, relevant loading/empty/error/success, refresh/reset. Record actual commit/origin and screenshots or reproducible evidence. Use a reserved per-task browser profile; no real PII/providers.
No merge, push, publication, production operations or spawned implementation agents.
Task-specific: Each primary nav/metric destination, list/detail filtering, empty/error, 6/40 roster rendering and cross-portal claim update; desktop/mobile and keyboard.

## Launch and handoff
P records actual host/path/model, dependency evidence, reviewer availability, SOURCE_SHA, sharing authority and a reserved exclusive lease in the Ready contract. P commits it and supplies LAUNCH_SHA externally. Create the task worktree at LAUNCH_SHA and verify docs/LAUNCH-PROTOCOL.md. Mark Building only after observed launch. Initial implementation needs no prior task review findings or reopened lease; those apply only to a correction cycle.
At completion: changed files, fixed HEAD_SHA, commands/results, browser evidence, unresolved gaps and review target. Stop writing at review handoff. Builder fixes findings under the same bounded task; new HEAD requires relevant re-review.
