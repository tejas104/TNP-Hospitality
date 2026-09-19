# TNP-BRAND-AGGREGATE-M2 — integrated palette adoption and guard closure

Status: READY for inline architect implementation after launch from the commit carrying this record. This is a bounded post-integration correction, not a redesign and not authority for UX Foundation or Client source work.

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
