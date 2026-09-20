SESSION TYPE: OLD SESSION — `cdd20a88-eed6-465c-908d-4b7496afbff1`

DO NOT OPEN A NEW CLAUDE SESSION. Resume only the same independent Claude Code desktop review session that returned `CHANGES REQUESTED` on `71212ea57ada4447ff34a6ffebd14e439e2dc0da`.

# TNP-BRAND-AGGREGATE-M2 — round-4 CRLF portability re-review

READ-ONLY REVIEW ONLY — DO NOT IMPLEMENT.

Review exact immutable successor:

- launch/direct ancestor: `99b4c98c0888ea1b3703830356386b71b7152149`;
- previously reviewed parent: `71212ea57ada4447ff34a6ffebd14e439e2dc0da`;
- round-4 candidate: `d70d2e2315ab56e6b248879354aef2a6d4ea3067`;
- branch: `codex/tnp-brand-aggregate-m2`;
- writer worktree: `D:\TNP-worktrees\TNP-BRAND-AGGREGATE-M2`.

First report the actual resumed session ID, model, effort, host/account and PWD. Verify live feature-remote equality, direct-parent provenance, clean candidate checkout and exact one-file test delta. Use a clean detached Windows review worktree with the repository's normal CRLF checkout behavior. Do not edit, commit, push, merge, deploy, change providers or change production.

## Exact round-4 allowlist

- `tests/brand-teal-palette.test.mjs`

All CSS, TSX, routes, copy, behavior, data, services, contracts, fixtures, packages, shared shell, homepage, Client/Planner/RSVP, material/3D, provider and production paths must be byte-identical to `71212ea...`.

## Finding to close

Confirm `blockFromSource()` normalizes CRLF and lone CR before exact multiline selector lookup, and that the synthetic CRLF rule probe is load-bearing. In the actual detached checkout, prove CRLF exists on disk in `FreelancerPortal.module.css` and the palette test. Run the focused guard and full independently discovered suite; both must pass without altering line endings. Mutation-test bypassing/removing normalization and confirm the focused guard fails at the multiline panel selector, then restore and verify the immutable candidate.

Run lint, explicit non-incremental TypeScript, Vercel build and `git diff --check 71212ea57ada4447ff34a6ffebd14e439e2dc0da..d70d2e2315ab56e6b248879354aef2a6d4ea3067`. Confirm both portal CSS blobs and all production source are unchanged. No browser rerun is required because round four contains no production change and the rendered fix was already independently cleared. Remove the review worktree and prove ports 3117, 3211, 3213, 3215 and any review port are free.

Builder evidence to reproduce, not inherit: one-file test delta; mutation without normalization 5/6; restored focused 6/6; writer full 118/118; fresh Windows checkout with 1,492 CSS and 285 test CRLF pairs passes 6/6 and 118/118; lint with only the three inherited warnings; explicit TypeScript; first-attempt build; clean remote-equal writer checkout; verification worktree removed and ports free.

Return findings ordered P0-P3 with exact file/line evidence, commands/results and limitations. End with exactly one disposition for full successor `d70d2e2315ab56e6b248879354aef2a6d4ea3067`: `APPROVE FOR ARCHITECT-CONTROLLED INTEGRATION` or `CHANGES REQUESTED`. Then stop. Kartik exact-SHA acceptance is a separate gate; no main push, deployment, provider or production action is authorized.
