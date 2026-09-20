SESSION TYPE: OLD SESSION `0959ee97-bf48-4129-962d-3eab2fdf7b62`. DO NOT OPEN A NEW CLAUDE SESSION. Resume only the same independent Claude Opus 5 session that reviewed `653da55991363f910dbeddc3773d55ee507f7491` and `bde9e6ba19e86da4476917de7693732251124e68`.

# TNP-UX-FOUNDATION-M1 — round-2 focused fixed-SHA re-review

Review exact immutable candidate `72fe456f9aa43cdddd21dced3adbe4f1fc050812` read-only. Its direct parent must be exact previously reviewed `bde9e6ba19e86da4476917de7693732251124e68`. This round addresses only your P2-1 browser-runner synchronization finding and your non-blocking P3-1 source-string-test finding. The prior visible-warning application blocker was already proven closed and no application source changes in this successor.

## Required runtime and setup

- report session ID, actual model/effort evidence, host/account, PWD and tool versions;
- verify live remote `codex/tnp-ux-foundation-m1` equals the candidate;
- verify one direct-parent commit and an exact two-path delta:
  - `tests/ux-foundation.browser.mjs`
  - `tests/ux-foundation.test.mjs`
- recreate a clean detached reviewer worktree at `D:\TNP-review\TNP-UX-FOUNDATION-M1-CLAUDE` and use review port `3119` with fallback `3219` only if free;
- do not review or edit in the writer worktree.

## Focused review

1. Confirm the browser scenario awaits `**/login?workspace=client` after the exact Switch demo profile click and before `goBack()`.
2. Confirm the brittle `readFile`/literal-JSX/`indexOf` warning-placement unit test and its unused import are removed, while the rendered warning browser scenario remains intact.
3. Reproduce the previously failing Back/Forward case across at least five independent fresh-server runs, recording every result. Verify the full 17-scenario matrix each run or explain any narrower diagnostic separately.
4. Spot-check that the prior application correction remains true at the candidate: the mandatory sentence renders once outside and before the closed disclosure, visible at desktop, 390px, 320px and 200% zoom; controls stay collapsed; keyboard/reset/clearance/overflow/console behavior remains correct.
5. Run the applicable focused tests, all independently discovered tracked tests, lint, explicit non-incremental TypeScript, Vercel build, diff check and exact scope audit. Follow the repository's one unchanged `EBUSY` retry rule and disclose environmental deviations.

Do not reopen deferred homepage labels, styling/class differentiation, dead shared exports/CSS, AppShell hardening, the cube, other pages or the 19/19 program unless this two-file successor causes a concrete regression. Do not modify source, commit, push, merge, deploy or change providers/production.

Return findings first, ordered P0-P3, with exact file/line and reproduction evidence. Then end with exactly one disposition for `72fe456f9aa43cdddd21dced3adbe4f1fc050812`: `APPROVE FOR KARTIK FIXED-SHA ACCEPTANCE` or `CHANGES REQUESTED`. Stop the server, remove the detached review worktree if safe and prove ports3119/3219 free. Kartik's exact-SHA acceptance remains a separate gate.
