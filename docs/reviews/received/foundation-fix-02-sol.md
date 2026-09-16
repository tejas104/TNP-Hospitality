# TNP-FOUND-01 FIX-02 independent Sol review

Requested/selected model: `gpt-5.6-sol`, high effort, per dispatch. Canonical agent identity: `/root/foundation_payout_review` (fresh read-only task; Laptop 1 fallback authorized by P/user). A separate runtime session identifier is not exposed to this reviewer and is therefore unavailable.

Worktree: `D:\TNP-review\foundation-fix-02-sol-local`

Range: `1402026e296caa0389e4c26e2e32b28279d41823..c53e13149be79f3b97aea4ef9fd3b7c8e82d2423`

State: detached HEAD at `c53e13149be79f3b97aea4ef9fd3b7c8e82d2423`; direct parent `1402026e296caa0389e4c26e2e32b28279d41823`; clean before and after review. Changed files are only `lib/contracts/preview.ts`, `lib/demo/service.ts`, and `tests/preview-contract.test.mjs`.

Verdict: **CHANGES REQUESTED**

The original mixed-worker blocker is corrected. Independent probes confirmed worker 001 receives only earning 001 / 225000 paise, worker 003 receives only earning 002 / 90000 paise, the unfiltered Operations batch retains both IDs / 315000 paise, multiple same-worker earnings sum correctly, reload preserves the projection, unknown workers return empty, and worker reads do not mutate stored payouts.

## Findings

1. **[P1] Empty worker ID still opens the unfiltered Operations view** — `lib/demo/service.ts:196`

   `if (!workerId)` treats an explicitly supplied empty string as an omitted filter. External probe: `listPayouts()` returned 5 batches as intended for Operations, but `listPayouts('')` also returned all 5. This violates the FIX-02 requirement that an invalid empty worker ID cannot accidentally return all batches. Distinguish `workerId === undefined` from a supplied empty ID and return an empty/structured invalid result for the latter.

2. **[P1] Duplicate earning references double-count the worker projection** — `lib/demo/service.ts:205-214`

   The loop maps every occurrence in `payout.earningIds`; it does not deduplicate IDs before collecting and summing. With `[earning-001, earning-001, earning-002]`, worker 001 received `[earning-001, earning-001]` and 450000 paise instead of one earning ID and 225000 paise. Deduplicate by earning ID before emitting identifiers and summing net amounts.

3. **[P2] The committed regression omits required payout boundary cases** — `tests/preview-contract.test.mjs:356-394`

   The test covers the basic mixed batch and in-memory read immutability, but not empty versus omitted filters, duplicate references, dangling references, or payout projection after reload. Add these cases so the two defects above and the externally verified fail-closed/reload behavior cannot regress.

## Verification

- `node --experimental-strip-types --test tests/preview-contract.test.mjs` — PASS, 13/13.
- `node --experimental-strip-types payout-probe.mjs` from `D:\TNP-review\foundation-fix-02-sol-local-scratch-01` — original mixed-worker case PASS; multi-earning worker 001 returned IDs `[earning-001, probe-earning-005]` / 235000 and worker 003 returned `[earning-002]` / 90000; Operations retained all three IDs / 325000; reload returned the same worker-001 projection; `immutable: true`; dangling mixed reference returned only worker 001's known ID / 225000 and worker 003's known ID / 90000; omitted/empty/unknown counts were `5/5/0`; duplicate worker-001 projection was `[earning-001, earning-001]` / 450000.
- `git diff --check 1402026e296caa0389e4c26e2e32b28279d41823..c53e13149be79f3b97aea4ef9fd3b7c8e82d2423` — PASS.
- `tsc -p . --noEmit` — unavailable as a code verdict: global TypeScript ran, but this clean review worktree has no `node_modules`, so it could not resolve `@cloudflare/workers-types`, `node`, or `vinext/types`. Dependencies were not installed for this bounded review.
- Full lint/build/UI checks were not rerun; this was a three-file service/contract/test correction with no UI change.

No tracked source, fixture, contract, register, commit, branch, remote, or deployment was modified. This review does not satisfy the separate Sonnet gate or human integration approval.
