SESSION TYPE: NEW SESSION

DO NOT OPEN, RESUME OR REUSE THE CURRENT ARCHITECT SESSION `01a0bcc2-a3c0-7750-8bd9-edcabd621d62`, THE HISTORICAL CLIENT WORKTREE, OR ANY OLD TNP BUILDER/REVIEW SESSION.

# TNP-UX-FOUNDATION-M1 — Astra/medium launch preflight only

You are the proposed inline frontend author for the next serialized TNP milestone. This packet does not grant a writer lease. Do not create or edit application source until P returns an exact Ready LAUNCH_SHA and explicitly activates the lease.

## Required runtime and host evidence

- Required model: `gpt-6-astra`.
- Required reasoning effort: `medium`.
- Host: `DESKTOP-DL9FDM7` under Kartik's separate assigned Windows/application profile and seat.
- Report the exact Codex task/session ID and the UI/runtime evidence that proves model and effort. A requested setting, packet text or host match is not proof.
- Proposed branch: `codex/tnp-ux-foundation-m1`.
- Proposed worktree: `D:\TNP-worktrees\TNP-UX-FOUNDATION-M1`.
- Proposed development port: `3118`.
- Do not create the branch/worktree yourself before P supplies the launch commit and lease.

If actual model/effort cannot be observed, stop and report `MODEL GATE UNVERIFIED`; do not edit source.

## Read completely

1. `AGENTS.md`
2. `TNP-START-HERE.md`
3. `docs/PRODUCT.md`
4. `docs/DESIGN.md`
5. `docs/STATUS.md`
6. `docs/LANES.md`
7. `docs/REVIEW-CADENCE.md`
8. `docs/LAUNCH-PROTOCOL.md`
9. `docs/UX-COMPLETION-BRIEF.md`
10. `docs/CLIENT-WISPR-INSPIRED-REDESIGN-BRIEF.md`
11. `docs/PORTAL-ROLE-SCOPE-REFINEMENT.md`
12. `docs/contracts/UX-SURFACE-ELEVATION.md`
13. `docs/tasks/TNP-UX-FOUNDATION-M1.md`

## Preflight response to P

Return only read-only evidence first:

- exact task/session ID, host, model and effort evidence;
- actual PWD/branch/HEAD/status and remote URLs;
- confirmation that `output/` and `tmp/` in the base clone were not changed, staged or removed;
- whether the proposed worktree path and port 3118 are unused;
- acknowledgement that SOURCE_SHA and LAUNCH_SHA are pending and that no packet grants a lease;
- acknowledgement that fresh external Claude fixed-SHA review and Kartik exact-SHA acceptance follow implementation.

Wait for P to create and share the metadata-only Ready launch commit. After P supplies the full LAUNCH_SHA, the initial isolated worktree HEAD must equal it, SOURCE_SHA must be its ancestor, and `SOURCE_SHA..LAUNCH_SHA` must change only `docs/tasks/TNP-UX-FOUNDATION-M1.md`, `docs/STATUS.md` and `docs/LANES.md`.

## Scope after—not before—lease activation

Implement the task's exact owned paths and acceptance criteria: typed route/surface manifest; truthful tab-scoped synthetic profiles with memory fallback; `/operations` canonicalization and `/admin` compatibility; homepage-only custom cursor; compact non-obscuring preview chrome; accessible header workspace switcher replacing the fixed side dial; semantic action/numeric/density/elevation primitives with three real shared consumers; modern workspace-access cards; and evidence-safe shared `PartnerCard`.

Freeze portal-local Client/Planner/Freelancer/RSVP feature work, homepage redesign/3D, service/domain contracts/fixtures, server/API/provider code, packages/lockfiles, production data and repository registers. If a portal-local adapter is required, stop and return the exact path/need to P.

Required verification after implementation is the focused contract suite, all affected existing tests, lint, explicit non-incremental TypeScript, Vercel build, exact diff check and the full real-browser matrix in `docs/UX-COMPLETION-BRIEF.md`. Return one clean immutable feature SHA for fresh Claude and Kartik review. Do not push `main`, deploy, change providers/production or claim synthetic access as production authentication.
