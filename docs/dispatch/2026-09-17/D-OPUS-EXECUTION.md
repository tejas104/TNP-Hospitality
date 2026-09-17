# D — Claude Opus replacement execution packet

Status: READY upon publication. Resume the exact preflighted OLD SESSION only.

## Lease

- Sole writer: Claude session `local_b91eab6d-b285-45c9-97ca-ee941be342a9`.
- Actual model/effort: `claude-opus-5` / medium. This is accepted for the bounded correction; do not claim a higher setting.
- Human/host: Kartik / DESKTOP-VO8G3GR.
- Worktree/branch: `D:\TNP-worktrees\TNP-D-M1`, `codex/tnp-d-m1`.
- Baseline: `d9baeb3b5947a42e2c46b1a80b85156a531ac221`.
- Port: 3104.
- Owned paths: `components/tnp/portals/operations/**` only.
- Revoked writer `01a0aded-481f-7121-a788-b8c307f8ab59` must not resume.

The preflight reported a clean remote-equal baseline, no stash/local changes, free port and no dev server. Reconfirm those facts after fetch. Stop on divergence, another writer/process or unrelated changes. Do not reset, clean, stash, recreate, rebase or merge main.

Read `D-REVIEW-2-CORRECTION.md`; its two prompts and boundaries are incorporated here. This task is D Operations work, not TNP-C and not D-03 finance.

## Prompt 1 — compact Operations navigation

Add a feature-owned compact section selector/navigation in `AdminOperations.tsx` plus its module stylesheet. When the frozen shared sidebar is hidden, expose all five working sections: Overview, Events & roster, Requirements, Verification and Attendance. Preserve desktop sidebar behavior. Use accessible controls with clear current state, visible focus and mobile hit targets. On section change, update the panel and move focus to the Operations workspace or heading without disruptive scroll behavior.

Do not modify `app/globals.css`, AppShell/shared navigation, shared services/contracts/fixtures, packages/registers, other portals or finance. Do not expose future unavailable modules as active. Add focused feature-local coverage for the working section list/current state where practical. Run applicable checks, commit and non-force push checkpoint 1, then continue.

## Prompt 2 — responsive regression and fixed-SHA handoff

At 390x844 and around the 1100px breakpoint, enter every section and return to Overview without reload. Test Tab, Shift+Tab, Enter and Space; current-state semantics; focus visibility; mobile hit targets; overflow; console output. Recheck desktop sidebar and metric shortcuts plus the four previously closed areas: record selection, exact retry identity, filtered event/detail/roster synchronization and pending-only verification. Recheck replacement/roster/audit and attendance correction.

Run lint, TypeScript noEmit, shared13 contract tests, both focused Operations suites, Vercel build and `git diff --check`. Commit/non-force push the final checkpoint. Return preflight confirmation, checkpoint/final SHAs, clean remote equality, exact paths, commands/results, browser evidence, inherited warnings, limitations and actual identity/model/effort/host. Stop the server and pause. No main merge/deployment.

Final target requires separate fresh Sonnet delta/regression review and fresh independent Sol/high review actually on Anjaneya Laptop1 / DESKTOP-DL9FDM7, then Anjaneya human disposition with Kartik domain input.
