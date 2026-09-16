# TNP-FOUND-01-FIX-02 — mixed-worker payout projection

Status: prepared correction packet; NOT yet published on main. B lease reserved for original B only, activation pending serialized register publication. This file does not bypass the blocked main merge/push approval. No consumer launch.

Owner: B / Anjaneya / Laptop 1 DESKTOP-DL9FDM7 / original session 01a0aa5f-c6ee-76e2-93db-6b50e124d174. Builder selection: Codex gpt-5.6-sol, high; confirm actual setting before resume. Existing branch codex/tnp-foundation; existing worktree D:\TNP-worktrees\TNP-FOUND-01. Correction baseline is 1402026e296caa0389e4c26e2e32b28279d41823, not metadata main. Original LAUNCH_SHA remains 77780970a8b0fdb52e1de70d3b35469fa78cb114. No new initial launch is being issued.

## Review disposition

Sonnet PASS at exact baseline within its stated scope; source report archived as received/foundation-fix-01-sonnet.txt. Its broader final wording is limited by its own evidence: all five routes mobile, desktop spot checks on client/admin; Enter/Space activation, complete Tab-order and reduced-motion coverage remain unverified. Do not convert those limitations into a full accessibility pass.

Independent Sol architecture gate CHANGES REQUESTED at the same SHA: mixed-worker payout batches leak foreign earning IDs and combined totals to the nominal batch worker, while omitting the other participating worker. User-supplied summary archived separately; original Laptop 2 report bytes have not been obtained. All other reported correction findings verified or retained. No foundation acceptance, human approval or integration follows from Sonnet PASS alone.

## B prompt — execute only after metadata publication and lease activation

You are original B, not P or Dev D. Continue TNP-FOUND-01 in D:\TNP-worktrees\TNP-FOUND-01 on codex/tnp-foundation using Sol/high. Read current main STATUS/LANES and this packet through git show after fetching; do not merge metadata into the app branch. Confirm actual model/host/session, branch, clean HEAD exactly 1402026e296caa0389e4c26e2e32b28279d41823 and activated exclusive lease. Report unexpected changes instead of resetting. No parallel app writer or automatic next task.

Fix only the remaining mixed-worker payout finding:

1. Reproduce a mixed batch by including worker 003's tnp-demo-earning-002 (90,000 paise) in worker 001's batch whose combined total is 315,000 paise. Commit a regression that fails on the reviewed baseline. Existing single-worker tests do not cover this defect.
2. Derive worker membership from the batch's referenced earnings. A worker-facing result must contain only that worker's earning IDs and corresponding integer-paise amount; it must be discoverable for every participating worker regardless of the batch's top-level workerId. In the reproduction, the mixed batch's worker-001 projection is 225,000 paise and worker-003 projection is 90,000 paise. Never return the full 315,000 to either worker. Preserve legitimate other batches in each result.
3. Preserve listPayouts() as the separate unfiltered Operations query with the original complete batch and combined total. Worker projections must not mutate stored batch records. Derive totals from the existing payable/net amount semantics; do not invent new deductions, rates or production ledger policy. Inspect seed and contract amounts before choosing the sum. If the schema lacks allocation data needed to reconcile a batch total, surface the specific contract issue rather than silently assigning residual amounts to a worker.
4. Preserve single-worker behavior, unknown/no-earning-worker empty results, async outcome and pagination semantics. Add tests for both participants, exclusion of foreign identifiers/amounts, unchanged Operations result before and after worker queries, persistence/reload and malformed/dangling references failing closed without leaking another worker's data. Handle duplicate earning references without double-counting. Explicitly distinguish omitted worker filter from an invalid empty worker ID so it cannot accidentally return all batches.
5. Add a concise contract comment that adjustment-review is reserved and not currently emitted; current approved-ledger correction behavior returns EARNING_ADJUSTMENT_REVIEW_REQUIRED while DEC-16 remains pending. Do not add a new adjustment workflow or silently change previously verified ledger semantics.

Owned paths: lib/demo/service.ts and tests/preview-contract.test.mjs; lib/contracts/preview.ts only for minimal projection typing/documentation; tests/preview-contract.types.ts only if the public return type needs adjustment. No schema/seed/store change is pre-authorized: raise a concrete need to P if these four paths cannot implement correct projection. Existing shared boundary remains frozen for all consumers. No portal/UI, AppShell, globals, package/lockfile, provider, auth, architecture policy, source reports or shared registers edits.

Run npm run lint; npx --no-install tsc --noEmit; node --experimental-strip-types --test tests/preview-contract.test.mjs; npm run build:vercel; python docs/checks/verify_bootstrap.py --provenance-only; git diff --check. Use worktree-owned dependencies; npm ci only if needed. Report unavailable checks honestly. Preserve all 13 existing service tests and type assertions. No new UI change is assigned; existing Sonnet mobile evidence carries only for unchanged UI, not as proof of new checks. Coordinate one heavy build per laptop and do not stop unknown listeners.

After lease activation, original branch-only ordinary checkpoint push authority continues: commit the bounded correction and non-force push codex/tnp-foundation only. Return exact baseline/fixed SHAs, changed paths, reproduction and corrected results, commands, limitations and actual identity. PAUSE at fixed handoff. No main merge/push, deployment, consumer work or spawned implementation agents.

## A / C / D disposition

A: HOLD, no lease. Planned A-01+A-02 remains a later booking/planner milestone. No edits to compensate for payout behavior.
C: HOLD, no lease. Planned C-01+C-02 remains a later freelancer milestone. Do not hide/filter foreign payout rows client-side as a substitute for the shared service fix.
D: HOLD, no lease. Planned D-01+D-02 remains a later Operations milestone. Preserve the separate complete Operations batch view; do not delete mixed batches or constrain fixtures to evade the regression.
B-public remains unleased. B is assigned only the foundation correction above. These are lane dispositions, not frontend launch prompts.

## Focused acceptance after new fixed SHA

Independent Sol re-runs the mixed-worker probe and retained critical regressions against the new immutable SHA. Sonnet provides focused opposite-model review of changed service/contract/test behavior; do not repeat the full bootstrap/mobile audit if UI remains unchanged. Existing independent reviewer contexts may continue, recording actual model/session and target. Both gates must apply to the new SHA. Kartik disposition and H1/H2 semantics approval precede authorized integration. Any remaining finding returns to original B. Later frontend packets require the actual integrated baseline; none are issued here.
