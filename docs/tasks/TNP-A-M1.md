# TNP-A-M1 — two-prompt frontend milestone for A

Status: DRAFT, NOT DISPATCHED. Writer lease NONE.
Human: Anjaneya / H1.
Host: Laptop 1 / DESKTOP-DL9FDM7.
Tool/model: Codex gpt-5.6-sol / high; confirm actual session at Ready.
Branch: codex/tnp-a-m1 (proposed; not created).
Worktree: D:\TNP-worktrees\TNP-A-M1 (proposed; not created).
Source and integrated foundation SHA: PENDING approved integration.
Launch SHA: PENDING future Ready commit, supplied externally by P.
Dependencies: integrated TNP-FOUND-01; TNP-A-01 and TNP-A-02. The second phase's first-phase dependency is an internal checked checkpoint in this grouped milestone, not a separate integration.
Owned paths: components/tnp/portals/client/** and components/tnp/portals/planner/**, including feature-local styles.
Mode: local labelled synthetic responsive-web preview.
Resource proposal: port 3101, http://localhost:3101; check free before binding. Dedicated synthetic profile; no current reservation.
Risk: Routine frozen-contract UI; changes to financial calculation or shared semantics escalate before editing.
Review appointment: Fresh independent Sol as requested plus Sonnet opposite-model review in the same review window; human Kartik. Actual reviewer sessions/availability PENDING.
Sharing: proposed original builder-only non-force push to codex/tnp-a-m1; effective only in the Ready contract. No current push or write lease.

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
Build the F03 booking wizard and F05 planner registration/requirement entry. Preserve the editorial design. Wire venue/planner catalogues, location/budget filters, own-venue path as supported by the approved contract, Venue/Planner/Details/Review navigation, field validation, persisted synthetic draft and linked submission IDs. Use submitBooking, registerPlanner and submitRequirement through the typed preview service. Back/forward/reload must preserve the draft; an error must not display success or create a duplicate. If own-venue or draft semantics require a missing shared field, raise that exact gap before inventing shared data. Check valid and invalid submissions, recommendations labelled as preview and mobile/keyboard use. Commit/push checkpoint 1 and continue Prompt 2.

## Prompt 2
Build F04 client event/quote/collection-status views and F06 planner requirement list/detail/status. Consume the records created in Prompt 1; selecting two different records must show the correct IDs/details. Add search/filter, empty, missing-record and retry states. Wire version-aware quote approval and revision request (with reason); show stale-version rejection without falsely applying approval. Keep client collection status separate from worker payouts; unknown/missing reference never means paid. Display simulated unpaid/processing/failed/uncertain/paid outcomes with truthful copy. Verify submit -> list -> detail -> quote action -> reload in one profile and all shared execution checks, then push final checkpoint and pause.
