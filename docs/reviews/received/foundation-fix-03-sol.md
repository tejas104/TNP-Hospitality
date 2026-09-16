# TNP-FOUND-01 FIX-03 independent Sol review

Requested/selected model: `gpt-5.6-sol`, high effort, per dispatch. Canonical agent identity: `/root/foundation_payout_review` (focused continuation of the fresh read-only independent review; Laptop 1 fallback authorized by P/user). A separate runtime session identifier is not exposed to this reviewer and is therefore unavailable.

Worktree: `D:\TNP-review\foundation-fix-03-sol-local`

Range: `c53e13149be79f3b97aea4ef9fd3b7c8e82d2423..d8473f888cc70819ff8a149f3544e81a6b6ea36b`

State: detached HEAD at `d8473f888cc70819ff8a149f3544e81a6b6ea36b`; direct parent `c53e13149be79f3b97aea4ef9fd3b7c8e82d2423`; clean before and after review. The delta changes only `lib/demo/service.ts` and `tests/preview-contract.test.mjs`.

Verdict: **PASS** within the focused FIX-03 scope.

No actionable findings remain in this delta. Only an omitted/undefined worker filter selects the complete Operations view. Empty and whitespace-only filters return an empty worker result. Duplicate earning references are de-duplicated before worker projection and `netPaise` summation. Mixed membership, multiple distinct earnings for one worker, dangling references, unknown workers, explicitly associated empty batches, read immutability, unchanged raw Operations records, and reload behavior are covered by committed regression assertions and an independent probe.

## Verification

- `node --experimental-strip-types --test tests/preview-contract.test.mjs` — PASS, 13/13 tests.
- `node --experimental-strip-types payout-probe.mjs` from `D:\TNP-review\foundation-fix-03-sol-local-scratch-01` — PASS. Omitted/empty/whitespace/unknown counts were `5/0/0/0`; the explicit empty batch remained `[]` / 180000; worker 001 received unique IDs `[earning-001, probe-earning-005]` / 250000; worker 003 received `[earning-002]` / 90000; Operations retained the duplicate ID, dangling ID, all referenced IDs and stored 340000 total; `immutable: true`; `reloadMatches: true`.
- `git diff --check c53e13149be79f3b97aea4ef9fd3b7c8e82d2423..d8473f888cc70819ff8a149f3544e81a6b6ea36b` — PASS.
- Independent TypeScript compilation was not run: this clean review worktree has no local `node_modules/.bin/tsc`, and the prior global compiler attempt showed the project dependency types cannot resolve without the local dependency stack. No dependency installation was performed for this bounded review.
- Full lint/build/UI checks were not rerun. This focused correction changes two service/test files and no UI; prior builder claims are not counted as independently executed evidence here.

No tracked source, fixture, contract, register, commit, branch, remote, integration, or deployment was modified. This PASS does not replace the separate Sonnet gate or required human/domain approval.
