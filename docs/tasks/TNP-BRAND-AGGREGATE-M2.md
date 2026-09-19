# TNP-BRAND-AGGREGATE-M2 — integrated palette adoption and guard closure

Status: FIXED-SHA HANDOFF / FRESH CLAUDE AND KARTIK REVIEW REQUIRED. Inline implementation is complete at exact clean pushed remote-equal `d5c15be0be3acf984206a0a29c3f16dabe522bdf`, direct child of Launch `99b4c98c0888ea1b3703830356386b71b7152149`. This remains a bounded post-integration correction, not a redesign and not authority for UX Foundation or Client source work.

Responsible product decision owner and sole human fixed-SHA acceptance reviewer: Kartik. Writer: current architect task `01a0b965-d3e3-73d2-a866-a81332d1904e` on DESKTOP-DL9FDM7, inline only per the user's no-subagent direction. Runtime model/effort metadata are unavailable and are not inferred. Fresh independent Claude fixed-SHA review follows authorship.

Source SHA: `14fa826cee42612b54ffb339219eb9b6a195226c`, the current local main after accepted Brand integration `b56ad987735a8a3ad909c35ede974a2e7353f8b3` and its serialized integration record.

Launch SHA: the commit carrying this Ready task and matching `docs/STATUS.md` / `docs/LANES.md`. Initial worktree HEAD must equal Launch and Source must be its ancestor; `SOURCE_SHA..LAUNCH_SHA` may contain only this task and those two registers.

Branch/worktree/port:

- `codex/tnp-brand-aggregate-m2`
- `D:\TNP-worktrees\TNP-BRAND-AGGREGATE-M2`
- `3117` / `http://localhost:3117`

Ordinary non-force push only to the named feature branch is authorized for fixed-SHA review sharing. No main push, deployment, provider or production action.

## Exact writable paths

- `components/tnp/portals/freelancer/FreelancerPortal.module.css`
- `components/tnp/portals/operations/AdminOperations.module.css`
- `tests/brand-teal-palette.test.mjs`

All TSX/behavior/domain/service/contract/fixture, public/homepage, Client/Planner/RSVP, shared shell, package/lockfile, provider, production and documentation paths are frozen in the writer branch.

## Required correction

1. Replace the Freelancer-local `--deep: #062b29` brand alias with exact `#008080`. Introduce/use neutral ink for text/form/border uses that previously depended on `--deep`; keep actual dark branded panels teal. Replace `.updated`'s `#26493c` with a neutral overlay that remains legible on teal.
2. Replace Operations Reports `.exportStatus` legacy `rgb(8 76 73 / 9%)` with exact-teal alpha while preserving error styling and behavior.
3. Extend the guard for the review's non-live P3 gaps: JS style-object named colours, JSX `fill`/`stroke` named colours, and hexadecimal colours inside supported Three.js light constructors. Measure beige-card contrast against actual `#e5e1cd`, not ivory. Add mutation probes for every new case and avoid prose/class-name false positives.
4. Do not address 3D material flatness, disabled/pressed visual redesign, Client redesign or workspace-switcher work in this task.

## Verification and handoff

- focused palette guard and mutation probes;
- every discovered test file on the integrated source;
- lint, explicit non-incremental TypeScript, Vercel build and diff check;
- browser-check Freelancer and Operations Reports at 1440x900, 1100x900 and 390x844, including updated/status contrast, keyboard focus, no overflow and clean console;
- stop the server, prove port3117 free, return one clean pushed immutable SHA for fresh Claude and Kartik review.

No self-certification or integration before those reviews.

## Immutable candidate returned 2026-09-20

- candidate: `d5c15be0be3acf984206a0a29c3f16dabe522bdf`;
- branch: `codex/tnp-brand-aggregate-m2`;
- remote equality: verified after ordinary non-force push;
- exact delta: the three writable paths above, with 28 insertions and 21 deletions;
- focused guard: 6/6 PASS;
- independently discovered project tests: 18 files / 118 tests PASS;
- lint: PASS with the same three inherited React-compiler warnings in `hooks/use-mobile.ts:16` and `components/tnp/AppShell.tsx:79,116`;
- explicit non-incremental TypeScript: PASS;
- Vercel build: PASS on the first attempt, with normal existing chunk/dynamic-import/nf3 warnings only;
- browser: `/freelancer` and `/admin` Reports at 1440x900, 1100x900 and 390x844; no horizontal overflow or console warning/error, visible keyboard focus, readable teal panels and a wrapping export-status output measured as `rgba(0, 128, 128, 0.09)` over neutral ink;
- cleanup: development server stopped and port3117 free.

Fresh review packet: `docs/dispatch/2026-09-20/BRAND-AGGREGATE-M2-CLAUDE-FIXED-SHA-REVIEW.md`. The fixed synthetic PreviewControls and right-edge workspace control are inherited shared-shell concerns reserved for UX Foundation; they are not reopened by this three-file correction.
