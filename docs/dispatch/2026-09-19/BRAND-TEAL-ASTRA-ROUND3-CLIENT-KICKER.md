SESSION TYPE: OLD SESSION `/root/brand_teal_astra_correction`

DO NOT OPEN A NEW SESSION. Resume only the same Astra/low collaboration task that authored and returned `48189e0b8783ef8abf80040997115a67275def57`.

# TNP-BRAND-TEAL-M1 — round-three Client status-kicker correction

IMPLEMENTATION CORRECTION ONLY. Start from exact clean live-remote-equal candidate `48189e0b8783ef8abf80040997115a67275def57` on the existing branch/worktree. Re-prove PWD, branch, HEAD, live remote, cleanliness and port3111 free before editing.

## Sole rendered defect

P's independent read-only browser sweep at 1440x900 and 390x844 found `CLIENT EVENT & FINANCE STATUS` nearly invisible in the teal Client status hub. The global `.section-kicker { color: #006b6b }` renders on the hub's `#008080` background at approximately 1.33:1. Screenshot and computed-style evidence confirm the defect. Other sampled public, Planner, Freelancer and Operations kickers/statuses passed their solid-surface contrast checks.

Add the smallest Client-status-hub-local override so this kicker uses white or another approved accessible neutral on the actual teal surface. Preserve all layout, copy, data, behavior and other colours.

## Writable paths only

- `components/tnp/portals/client/ClientStatusHub.module.css`
- `tests/brand-teal-palette.test.mjs`

Add a deterministic source/contrast assertion that prevents the Client hub kicker from reverting to teal-on-teal. All other files are frozen.

## Verification and handoff

- Focused palette/contrast guard plus all fifteen discovered tests.
- `npm run lint`.
- `npx --no-install tsc --noEmit --incremental false`.
- `npm run build:vercel`, with only the documented single unchanged Windows `EBUSY` retry.
- `git diff --check 48189e0b8783ef8abf80040997115a67275def57..HEAD` and exact two-file scope.
- Render `/client` at 1440x900 and 390x844; record computed foreground/background and WCAG ratio for the exact kicker, confirm no overflow/console/hydration regression and preserve visible Client action boundaries/focus.

Commit only the two files, ordinary non-force push only `codex/tnp-brand-teal-m1`, prove clean live remote equality and free port3111, then return one immutable successor. Fresh same-Claude review and Kartik exact-SHA acceptance remain mandatory. Do not merge/push main, deploy or change providers/production.
