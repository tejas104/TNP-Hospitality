SESSION TYPE: NEW SESSION

Do not open, reuse, continue or rely on any prior TNP Claude/Codex session, scratchpad, memory observation, worktree or untracked source. This is a fresh, read-only, independent fixed-SHA review. Repository evidence is authoritative. Do not edit, create, format, commit, push, merge, deploy, install dependencies, change providers, or start implementation. Ignore `D:\TNP Hospitality\tmp\` entirely.

# TNP-BRAND-TEAL-M1 — Claude fixed-SHA review

Kartik has approved proceeding to review, but has not yet accepted this candidate. Review exact candidate `fc7746e06601ca670b09dc8dd47895c543dfec58` from `origin/codex/tnp-brand-teal-m1` against:

- Source: `4859b2e63246eb7aae83a36ba1863b9b250ea326`
- Launch: `5ca80cb9bfb6385ba1617f7575c8f7dc868cd1eb`
- Candidate: `fc7746e06601ca670b09dc8dd47895c543dfec58`
- Expected relation: Source is Launch's parent; Candidate is exactly one commit after Launch.
- Host: `DESKTOP-DL9FDM7`
- Suggested detached review worktree: `D:\TNP-review\TNP-BRAND-TEAL-fc7746-CLAUDE`
- Review server port, only if free: `3112`

First report product/runtime/model/effort/session ID, Windows account, host, current directory, base repository root, exact candidate/remote equality, branch state, and the proposed detached review path. If exact runtime effort is unavailable, state that honestly. Fetch only the named feature ref if required. Create a clean detached worktree at the exact candidate; do not inspect or alter untracked base-clone files. Stop immediately on SHA mismatch, dirty review checkout, unexpected ancestry/scope, occupied port, or inability to review the exact immutable candidate.

Read completely before reviewing:

- `AGENTS.md`
- `TNP-START-HERE.md`
- `docs/PRODUCT.md`
- `docs/DESIGN.md`
- `docs/BASELINE.md`
- `docs/REVIEW-CADENCE.md`
- `docs/decisions/CLIENT-DECISIONS.md`
- `docs/tasks/TNP-BRAND-TEAL-M1.md`

The client decision is exact: visible dark-green/dark-teal brand surfaces across the currently integrated responsive platform must become `#008080`. There must be no replacement dark green or nearly identical green cast. `#006b6b` is allowed only for bounded hover/pressed states or small accessible teal text. Accessible body text, shadows and image overlays may use neutral charcoal/black. Ivory, champagne and white remain supporting colors. Semantic success must use teal plus text/icon/state language, never green-only meaning.

## Exact changed-file allowlist

The Candidate may differ from Launch only in these fourteen files:

1. `app/globals.css`
2. `components/three/EventOrbit.tsx`
3. `components/tnp/portals/client/ClientExperience.module.css`
4. `components/tnp/portals/client/ClientStatusHub.module.css`
5. `components/tnp/portals/operations/AdminOperations.module.css`
6. `components/tnp/portals/planner/PlannerPortal.module.css`
7. `components/tnp/portals/planner/PlannerRequirements.module.css`
8. `components/tnp/public/Home.module.css`
9. `components/tnp/public/Public.module.css`
10. `components/tnp/public/WorkspaceAccess.module.css`
11. `components/tnp/public/destination-motion.test.mjs`
12. `components/tnp/public/destination-motion.ts`
13. `data/tnp.ts`
14. `tests/brand-teal-palette.test.mjs`

Treat any other changed path, behavior/domain change, route/copy-meaning change, dependency change, or hidden generated artifact as blocking.

## Risk-first review

Review requirements and regressions, not only syntax:

1. Prove the active production presentation sources in scope contain none of the forbidden old palette literals or aliases listed in the task. Check that the guard is recursive, targets actual production files, cannot pass by excluding relevant paths, and does not merely self-match its forbidden constants.
2. Verify visible brand surfaces use exact `#008080`/`rgb(0,128,128)` rather than opacity/gradient/filter combinations that visually recreate dark green. Inspect the homepage hero on desktop and phone, public navigation/drawer, access/login, Client, Planner and Operations surfaces.
3. Confirm `#006b6b` appears only in the documented hover/pressed/accessibility exceptions. Look for newly invented greens, legacy CSS variables that still resolve green, inline styles, SVG/Three.js colors and data tints.
4. Confirm contrast and hierarchy remain accessible: normal text WCAG AA, large text/UI/focus at least 3:1, visible keyboard focus, readable disabled/error/success states and non-color status meaning. Measure representative foreground/background pairs; do not infer from names.
5. Confirm layout, copy meaning, routing, forms, state, and interaction behavior did not change. Review motion/fallback edits for behavioral equivalence, deterministic cleanup, reduced-motion handling and WebGL-unavailable/mobile fallback continuity.
6. Confirm no desktop/mobile overflow, obscured focus, missing boundary, hydration/runtime error, or green cast. Pay special attention to the hero, overlays, sticky navigation, drawers, dense portal surfaces, buttons and status cards.
7. Verify the task truthfully excludes pending feature candidates. Do not fail this Candidate merely because RSVP/Freelancer/Operations-Reports branches are not integrated, but require the handoff to identify them as mandatory post-integration palette adoption before aggregate color completion.

## Required independent checks

From the clean detached candidate, run and report exact commands/results:

- provenance, remote equality, ancestry, commit count, exact changed-file allowlist and `git diff --check`;
- `node --test tests/brand-teal-palette.test.mjs components/tnp/public/*.test.mjs tests/preview-contract.test.mjs`;
- every additional current affected portal/shared test discoverable without changing files;
- `npm run lint`;
- `npx --no-install tsc --noEmit --incremental false`;
- `npm run build:vercel` under the documented single unchanged `EBUSY` retry rule only;
- real-browser review of `/`, `/contact`, one service detail, one department detail, `/login`, `/client`, `/planner`, `/freelancer`, and `/admin` at 1440x900, 1100x900 and 390x844.

Browser evidence must include computed key colors, keyboard navigation/focus, desktop/mobile menus/drawers, hover/pressed/focus samples, no horizontal overflow, page/console/hydration errors, hero canvas/fallback state, and reduced-motion/WebGL fallback where the tooling can genuinely force them. Clearly distinguish observed behavior from source/test inference. Stop the task server/browser and prove port 3112 free afterward.

## Response contract

Return findings first, ordered P0 to P3, with exact file and line references plus reproduction/evidence. Then state one disposition: `PASS` or `CHANGES REQUESTED`. A PASS must explicitly confirm exact SHA, scope, palette guard adequacy, visual/contrast/responsive/accessibility result, commands, limitations, clean checkout and free port. If there are no findings, say `No findings.`

Do not fix anything. Do not provide a replacement implementation. Do not merge, push, deploy, or call this production. Kartik remains the sole human exact-SHA acceptance reviewer after your independent review.
