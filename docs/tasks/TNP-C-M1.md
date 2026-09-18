# TNP-C-M1 — two-prompt frontend milestone for C

Status: DRAFT, NOT DISPATCHED. Writer lease NONE.
Human/domain owner and sole human reviewer: Kartik / H2.
Host: planned Laptop1 / DESKTOP-DL9FDM7 under a separate Kartik-operated team profile; actual profile/session/path evidence PENDING Ready preflight. Laptop2 remains fallback.
Tool/model: `gpt-6-astra` / high requested by the user for Freelancer UI; actual runtime/model/effort PENDING and mandatory at Ready preflight.
Branch: codex/tnp-c-m1 (proposed; not created).
Worktree: D:\TNP-worktrees\TNP-C-M1 (proposed; not created).
Source and integrated foundation SHA: PENDING approved integration.
Launch SHA: PENDING future Ready commit, supplied externally by P.
Dependencies: integrated TNP-FOUND-01; TNP-C-01 and TNP-C-02. The second phase's first-phase dependency is an internal checked checkpoint in this grouped milestone, not a separate integration.
Owned paths: components/tnp/portals/freelancer/**, including feature-local styles.
Mode: local labelled synthetic responsive-web preview.
Resource proposal: port 3103, http://localhost:3103; check free before binding. Dedicated synthetic profile; no current reservation.
Risk: Frozen synthetic onboarding/opportunity UI; identity, allocation or shared-contract changes escalate.
Review appointment: fresh external Claude fixed-SHA review after Astra authorship; Kartik is sole human reviewer. Add independent Sol if the milestone crosses security/data/finance/domain boundaries. Actual appointment PENDING.
Sharing: proposed original builder-only non-force push to codex/tnp-c-m1; effective only in the Ready contract. No current push or write lease.

## Shared execution rules
This is a prepared draft, not a launch instruction. P will issue the Ready version only after reviewed foundation integration, actual appointments and capacity are recorded. Do not send a developer into a missing prerequisite. SOURCE_SHA, dependency integration SHA, LAUNCH_SHA and exclusive lease are deliberately PENDING; candidate c53e13149be79f3b97aea4ef9fd3b7c8e82d2423 is not an integrated baseline.

At activation read AGENTS.md, TNP-START-HERE.md, docs/PRODUCT.md, docs/DESIGN.md, docs/DOMAIN-RULES.md, docs/ARCHITECTURE.md, docs/LAUNCH-PROTOCOL.md, docs/REVIEW-CADENCE.md, both foundation contracts and the referenced phase specifications. This grouped TASK supersedes their separate per-slice launch branches only when Ready. Verify actual host/model/session, clean initial HEAD=LAUNCH_SHA, SOURCE_SHA ancestry, integrated dependency ancestry and the launch three-file allowlist. Preserve unrelated changes; never reset to make a check pass.

Work through Prompt 1 then Prompt 2 within ONE branch/worktree and ONE lease. After Prompt 1, run its applicable checks, commit and non-force push the named branch once authorized by the Ready contract. Send P the checkpoint SHA, then continue Prompt 2 without waiting for formal review. Pause early only for a shared-contract gap, ownership conflict, failing prerequisite or material security/financial issue. No other task, implementation subagent or writer is authorized.

For every mutation capture expectedGeneration at invocation and retain requestKey for retries of that same action. Handle structured errors and STALE_GENERATION without overwriting newer state. Consume shared services; no local competing shared fixtures, adapter bypass, fabricated success or production authority. Local view/draft state may remain in the owned feature directory, with clearly scoped synthetic-only persistence and reset behavior; raise any missing shared contract to P before inventing a cross-portal representation.

Forbidden: shared AppShell, globals.css, PortalPages barrel, existing route glue, shared components, lib/contracts, lib/demo, lib/services, package/lockfiles, framework/provider/auth/database config, docs/registers, other lane views, unrelated deliverables/tmp. Only explicitly listed new public routes are an exception for B. Responsive web only; preserve the public/Operations composition. No live provider calls, real personal data, native app or deployment.

## Checks and final handoff
At both checkpoints run npm run lint; npx --no-install tsc --noEmit; node --experimental-strip-types --test tests/preview-contract.test.mjs; npm run build:vercel; git diff --check. Use npm ci for the initial clean install; reuse this worktree's dependencies afterward unless repair is necessary. Never copy another worktree's node_modules. One heavy build per laptop at a time. No npm test/typecheck/E2E script is assumed to exist.

Verify affected routes at 1440x900 and 390x844 with actual keyboard Tab/Enter/Space, visible focus, primary actions, loading/empty/error/success, refresh/reset, correct record identity and no footer obstruction/overflow. Retain the synthetic warning. Record exact SHA, origin, steps, results and screenshots/assertions outside tracked source. Do not equate a screenshot with interaction proof.

Before final push, self-check the whole two-prompt milestone against both acceptance lists and resolve failures in owned paths. Report both checkpoint SHAs, final fixed HEAD, changed paths, exact commands/results, inherited warnings, browser evidence, known gaps and actual model/session/host. Pause the lease. P fetches the named ref, verifies remote/fixed SHA and ownership, then obtains one consolidated milestone review at that fixed commit. Original builder handles consolidated findings, followed by delta/regression re-review. No force-push, main merge/push or deployment.

Foundation is a prerequisite; TNP-I01 remains the later integrated cross-portal browser gate. A lane's completion does not certify other portals or production behavior.

## Prompt 1
Build F07 freelancer application and assessment preview. Use editable steps for required details, experience/availability/preferred role as supported by the approved contract. Wire registerApplicant and submitAssessment; show validation, back/forward, pending verification, assessment outcome, submitted reference and retry. Use only synthetic sample choices and explicit KYC preview states; do not solicit identity documents or bank details or imply real approval. Preserve draft/reset behavior without writing new shared schema. Exercise incomplete submissions, duplicate action, assessment recovery, refresh, mobile and keyboard. Commit/push checkpoint 1 and continue Prompt 2.

## Prompt 2
Build F08 opportunity feed/detail and F09 claim/Coming/briefing. Use list/get opportunity and typed claim/respond services; show role/location filters, schedule/timezone, pay amount/unit and reporting details. Handle valid/full/ineligible/overlap cases, quantities 6/40, duplicate claim and pending/error outcomes. Keep initial claim distinct from Coming/Not Coming; show nonresponse and inactive/replaced states truthfully. Re-read assignments/roster after mutation and verify the same IDs through the service; do not require an unfinished Operations UI to pretend to be complete. Do not recreate capacity rules in the client or add service workarounds. F10/F11 attendance, payout and ratings are C-03, outside this two-task batch. Run final checks, push final checkpoint and pause.
