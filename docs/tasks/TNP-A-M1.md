CURRENT CORRECTION AUTHORITY 2026-09-17: READY upon this publication. See docs/dispatch/2026-09-17/A.md and current STATUS/LANES for the resumed existing sole-writer identity, exact correction baseline, scope, two prompts and checks. This supersedes the original initial-HEAD instruction below for this correction only; do not return to the original launch or recreate the worktree. Original ownership and no-main-merge/deployment boundaries remain.

# TNP-A-M1 — two-prompt frontend milestone for A

Status: READY. Exclusive writer lease RESERVED 2026-09-17T03:54:05.3969102+05:30 for existing Dev A session01a0aa5f-a826-7ab1-9cb7-a44736047ebe under Anjaneya; expires at final fixed milestone review handoff or P revocation. One writer, no additional agent. Actual start not yet observed.
Human: Anjaneya / H1.
Host: Laptop 1 / DESKTOP-DL9FDM7.
Tool/model: assigned Codex gpt-5.6-sol / high under user-approved implementation policy; select and report actual runtime before editing. Existing Dev A session01a0aa5f-a826-7ab1-9cb7-a44736047ebe verified in local task inventory; old Laptop2/Kartik role in its history is superseded: this is A/Anjaneya/Laptop1.
Branch: codex/tnp-a-m1; P creates it at the published LAUNCH_SHA.
Worktree: D:\TNP-worktrees\TNP-A-M1; destination verified unused before reservation. P creates it after Ready publication. All implementation commands must explicitly use this worktree, never the attached main checkout.
SOURCE_SHA: 370f1cd27af7a6d7f1f68986e0ddc2f15391267d, verified integrated main. Foundation dependency merge e6025cb0d16c433c0d29745d3eea1f9618718a67 is an ancestor; reviewed application d8473f888cc70819ff8a149f3544e81a6b6ea36b integrated and approved. Integrated service tests13/13, lint0 errors/3 inherited warnings, typecheck/build/provenance/diff checks passed.
LAUNCH_SHA: this committed Ready contract; full SHA supplied externally after publication. It is different from SOURCE_SHA; do not embed or guess its own hash.
Dependencies: integrated TNP-FOUND-01; TNP-A-01 and TNP-A-02. The second phase's first-phase dependency is an internal checked checkpoint in this grouped milestone, not a separate integration.
Owned paths: components/tnp/portals/client/** and components/tnp/portals/planner/**, including feature-local styles.
Mode: local labelled synthetic responsive-web preview.
Resources reserved: port3101/http://localhost:3101 on Laptop1, no listener observed at preflight; recheck before bind. Dedicated A synthetic browser profile. No current server or DB/provider/job claim. Start npm run dev -- --port 3101 --hostname localhost; record actual origin. One heavy build per laptop.
Risk: Routine frozen-contract UI; changes to financial calculation or shared semantics escalate before editing.
Review appointment at final fixed milestone: P arranges fresh independent Sol/high on Laptop1; Kartik arranges separate Sonnet on Laptop2, both capabilities evidenced by completed foundation reviews. One consolidated review window. Human reviewer Kartik. No review presently running, no invented calendar slot; changes in availability pause the handoff, not the first checkpoint.
Sharing authorized: this reserved Dev A builder may commit and non-force push only codex/tnp-a-m1 at checked checkpoints. P may fetch/inspect. No main push/merge, force-push, deployment or moved reviewed tags.

## Shared execution rules
This Ready contract is the exclusive launch authority after publication at the supplied LAUNCH_SHA. Foundation is integrated and reviewed. Verify startup identity/model/HEAD/ancestry/cleanliness before editing and return startup evidence to P for the serialized Building record; no additional permission is required if they match. H1 has only this active complex builder reservation; B-public remains unleased.

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
