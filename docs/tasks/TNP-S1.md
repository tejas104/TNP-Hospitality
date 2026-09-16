# TNP-S1 — Implement the shared typed preview interface, deterministic scenario, persistence/reset and behavioral tests before parallel consumers.

Status: Draft. NOT dispatched. Writer lease: NONE.
Responsible human: Anjaneya (H1).
Lane/host: B / Laptop 1 / Anjaneya (confirmed; verify actual path/model at launch).
Tool/model/effort: Codex; exact model/effort pending selection on assigned host.
Isolated branch: codex/tnp-s1 (planned, not created).
Absolute worktree: D:\TNP-worktrees\TNP-S1 (proposed, not created or verified).
Audited source baseline: 9d58061f2d36514ebc932fa94bb3dc90f4b97a97.
Implementation baseline SHA: PENDING integrated source/dependency baseline (SOURCE_SHA); do not start from the old audit SHA.
Launch-contract revision: PENDING; P supplies the full LAUNCH_SHA after committing the Ready TASK. This file does not embed its own commit hash.
Review sharing: PENDING authorized pusher, branch/ref and fixed SHA handoff; no force-push or moving reviewed tags.
Reviewer host/availability: PENDING appointment; preferred Sonnet and Sol reviewer hosts are Kartik Laptop 2, Codex review of C on Anjaneya Laptop 1.
Launch protocol: docs/LAUNCH-PROTOCOL.md; initial HEAD must equal LAUNCH_SHA, not SOURCE_SHA.
Dependencies: TNP-S0. Verify all transitive prerequisite commits through that dependency; never depend on this task itself.
Merged dependency evidence: NONE yet; record each merge SHA and verify ancestry with git merge-base --is-ancestor before marking Ready.
Mode: labelled synthetic frontend preview only.
Risk: Architecture/cross-module contract; independent Sol REQUIRED.
Opposite-model reviewer: Claude; actual reviewer session/model and availability pending.
Independent human reviewer: Kartik; schedule/acceptance pending.
Astra gate: REPLACED by fresh independent Sol review at fixed commit, per explicit user approval on 2026-09-16. Do not label this an Astra review.
Canonical contract: ../contracts/S1-PREVIEW-INTERFACES.md.

## Owned paths/contracts/resources
All exact paths in docs/contracts/S1-PREVIEW-INTERFACES.md, including ONLY tsconfig.json compilerOptions.allowImportingTsExtensions=true. AppShell changes only mount preview controls. No portal-component edits.
No live database, webhook, provider or background job. Proposed local port 3102; verify it is free. Separate browser profile for route/control checks. S1 proves the connected journey through service tests; browser walkthrough belongs to I01 after consumer integration.
Shared ownership is exclusive for this prerequisite; other builders wait.

## Do not modify
Anything outside owned paths. In particular package/lockfiles, framework/hosting config, auth/API/database/providers, real client data, other lane views and shared status/lease registers.
Do not extend ownership beyond the referenced prerequisite contract.

## Acceptance
Shared IDs and state survive same-browser navigation/refresh; Reset restores all records; explicit error/empty/full/ineligible/GPS-denied cases; defined service outcomes; no real providers; behavioral scenario tests and five-route smoke pass.
Every matrix service operation must have deterministic behavioral evidence. Browser acceptance here covers route smoke and preview controls only; full connected portal journeys wait for TNP-I01. Proposed business rules remain labelled.

## Required checks
Read AGENTS.md, PRODUCT.md, DESIGN.md, DOMAIN-RULES.md, ARCHITECTURE.md, the referenced contract and task.
Do not update shared STATUS/LANES from a builder branch; return evidence to the dispatcher.
Routine required checks: npm ci; npm run lint; npx --no-install tsc --noEmit; npm run build:vercel.
After S1 exists also run: node --experimental-strip-types --test tests/preview-contract.test.mjs.
Browser: 1440x900 and 390x844; five-route smoke and preview-controls keyboard/focus, error/reset/reload only. Connected portal journeys are I01 acceptance, not S1 acceptance. Record actual commit/origin and screenshots or reproducible evidence. Use a reserved per-task browser profile; no real PII/providers.
No merge, push, publication, production operations or spawned implementation agents.
Task-specific: Add tests/preview-contract.test.mjs and run the named Node test command; it is a deliverable, not an existing baseline check.

## Launch and handoff
P records actual host/path/model, dependency evidence, reviewer availability, SOURCE_SHA, sharing authority and a reserved exclusive lease in the Ready contract. P commits it and supplies LAUNCH_SHA externally. Create the task worktree at LAUNCH_SHA and verify docs/LAUNCH-PROTOCOL.md. Mark Building only after observed launch. Initial implementation needs no prior task review findings or reopened lease; those apply only to a correction cycle.
At completion: changed files, fixed HEAD_SHA, commands/results, browser evidence, unresolved gaps and review target. Stop writing at review handoff. Builder fixes findings under the same bounded task; new HEAD requires relevant re-review.

## Milestone dispatch override
The user selected batched milestone review. This file is now a phase specification inside TNP-FOUND-01, not a separately dispatched task. Its standalone branch/lease/dependency-merge instructions are inactive while that milestone is used. S0 checks precede S1 in the same worktree; one formal foundation review/integration follows S1. Read REVIEW-CADENCE.md and TNP-FOUND-01.md.
