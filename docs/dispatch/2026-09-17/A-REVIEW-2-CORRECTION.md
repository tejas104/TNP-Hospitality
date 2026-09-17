# A — second focused correction after fixed-SHA review

Status: READY upon publication. Resume the existing A OLD SESSION only.

## Fixed authority

- Sole writer: `01a0aa5f-a826-7ab1-9cb7-a44736047ebe`, Anjaneya / DESKTOP-DL9FDM7.
- Existing worktree/branch: `D:\TNP-worktrees\TNP-A-M1`, `codex/tnp-a-m1`.
- Correction baseline: `ddfef13582735f9d1f08b284cee111ec810b1c06`.
- Owned paths remain `components/tnp/portals/client/**` and `components/tnp/portals/planner/**` only.
- No shared contract/service/fixture, route, AppShell, package, register, other portal, main, deployment or production change.

Fetch and read this packet plus `A-DELTA-REVIEW.md` and the original review without merging main into the feature branch. Confirm exact clean baseline, remote equality, identity, host and port 3101 before editing. Stop on another writer, divergence or unrelated changes. Do not reset, clean, rebase or recreate the worktree.

## Consolidated finding

The Sonnet review passed the six original findings. Independent Sol/high review found one remaining P2. `readAction` in both feature-local helpers validates field shapes but does not recompute the fingerprint from the stored request, accepts empty/malformed status fields, and lets restore paths present arbitrary success receipt IDs without verifying the current-generation service record and material linkage. Corrupt browser storage can therefore fabricate restored success or retry a request different from the displayed draft.

## Prompt 1 — semantic journal validation

Harden both feature-local action-journal decoders. Recompute the fingerprint from `request.operation` and `request.payload` and require exact equality with the stored fingerprint. Require nonempty request key/actor ID and status-appropriate receipt/error fields; reject malformed, contradictory or empty values. Keep the current storage-unavailable behavior truthful and preserve valid pending/error/success journals.

Add focused tests in the existing Client and Planner test files for mismatched fingerprints, empty receipt IDs, malformed success/error records, changed request payload under an old fingerprint and valid backward-compatible journals. Commit and non-force push checkpoint 1, then continue.

## Prompt 2 — service-backed restoration and failure recovery

Before presenting a restored success, verify the receipt ID resolves in the current generation and that the service record matches the operation's material request payload/linkage. Use existing queries only: booking lookup for Client; planner list reconciliation for registration; requirement lookup for Planner requirement. A missing, stale or mismatched record must clear/quarantine the journal and show a truthful local-action-unavailable/recovery message, never restored success and never automatic replay under a forged identity.

Handle journal write failure after a successful mutation truthfully: do not imply the service mutation failed or offer a duplicate-producing replay; expose the returned synthetic record result while clearly stating local retry/restore identity could not be persisted. Add focused tests/probes for forged/missing receipts, current-generation payload mismatch and post-invocation journal-write failure.

Browser-check valid reload deduplication, explicit new action, deliberately corrupted journal, missing/forged receipt, reset/new generation and storage-write failure where safely injectable. Preserve all previously closed booking/planner/linkage/reset/Review/quote behaviors.

Run shared13 tests, both focused suites, lint, non-incremental TypeScript, build and `git diff --check`; verify 1440x900 and 390x844, keyboard, overflow and console output. Commit/non-force push final SHA, report both checkpoints/evidence/limitations, stop the server and pause. No merge/deployment.

Final target requires focused independent Sol and separate Sonnet delta/regression re-review plus Kartik human disposition.
