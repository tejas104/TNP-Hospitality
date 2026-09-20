SESSION TYPE: OLD SESSION — resume only Codex task `01a0bee6-65ab-73c2-a0c6-60eb83111347`. DO NOT OPEN A NEW CODEX SESSION OR REUSE A DIFFERENT SESSION.

# TNP-UX-FOUNDATION-M1 — browser navigation race correction

Same independent Claude Opus 5 session `0959ee97-bf48-4129-962d-3eab2fdf7b62` returned `CHANGES REQUESTED` on exact `bde9e6ba19e86da4476917de7693732251124e68`. The prior synthetic-warning blocker is fully closed. There is no application defect: the pure Switch profile -> Back journey passed 6/6. The fixed-SHA gate is held solely because the checked-in browser runner does not await the chooser navigation before calling Back and passed only 2/9 controlled candidate attempts.

## Identity and baseline

- required runtime: `gpt-5.6-luna` / low on `DESKTOP-DL9FDM7`;
- existing task/session: `01a0bee6-65ab-73c2-a0c6-60eb83111347`;
- exact baseline/current branch tip: `bde9e6ba19e86da4476917de7693732251124e68`;
- branch/worktree: `codex/tnp-ux-foundation-m1` / `D:\TNP-worktrees\TNP-UX-FOUNDATION-M1`;
- owned port/fallback: `3118` / `3218`.

Before editing, read the current task and canonical requirements, inspect the latest `turn_context` to prove the required runtime, and report exact clean HEAD, branch, remote equality and free ports. Stop without editing if any field differs.

## Exact writable scope

- `tests/ux-foundation.browser.mjs`
- `tests/ux-foundation.test.mjs`

Everything else is frozen, including `components/tnp/shared/PreviewControls.tsx`, application/CSS/font/asset/package files, docs/registers, homepage/cube and every portal-local feature.

## Required correction

1. In the Back/Forward scenario, after clicking the exact `Switch demo profile` link, await `**/login?workspace=client` before `page.goBack()`.
2. Delete only the newly added unit test that reads `PreviewControls.tsx` and uses literal source strings/`indexOf` to infer warning placement. Do not replace it with another source-text assertion; the rendered browser scenario is the load-bearing proof.
3. Preserve all existing browser behavior checks, including the closed visible warning at desktop, 390px, 320px and 200% zoom, keyboard disclosure, reset truth, overlay clearance, no overflow and zero application/hydration errors.

## Verification and handoff

Run the focused UX tests, all independently discovered tracked `.test.mjs` files, lint, explicit `npx --no-install tsc --noEmit --incremental false`, `npm run build:vercel`, `git diff --check` and an exact two-path allowlist audit. Run the full browser matrix five consecutive times from clean server state and record every 17/17 result; one pass is not sufficient after the reproduced race. Follow the repository's single unchanged `EBUSY` retry rule and disclose any environmental failure honestly.

Commit and ordinarily non-force push one clean immutable successor whose direct parent is exactly `bde9e6ba19e86da4476917de7693732251124e68`. Return exact SHA, changed files, commands/results, five-run browser evidence, limitations, clean/remote equality and free-port evidence. Do not merge, integrate main, deploy or mutate providers/production. The same Claude session must then perform focused fixed-SHA re-review, followed by Kartik exact-successor acceptance and P-controlled integration.
