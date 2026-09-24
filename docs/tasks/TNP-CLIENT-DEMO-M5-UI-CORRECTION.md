# TNP client-demo M5 UI correction

Status: **Draft / capacity hold**. Kartik is now identified as the responsible operator, but an RSVP backend review still occupies his waiting-review lane under AGENTS.md. This packet is not a writer lease. P will issue a serialized Ready commit and its full LAUNCH_SHA only after that capacity gate and exact preflight clear; product acceptance and source integration remain separate gates.

## Identity and provenance

- Dispatcher P: current task `01a0d2d3-e18b-7920-bbf8-ca67a9947edc`, DESKTOP-DL9FDM7. Its 2026-09-24 turn context reports `gpt-6-sol` / high.
- Read-only Astra preflight was completed by `/root/m5_astra_preflight`, thread `01a0d4a0-567d-7343-9c03-61ead1c26d79`, DESKTOP-DL9FDM7, with `gpt-6-astra` / low verified from its own session JSONL. The user subsequently directed **no working subagents**. That preflight session is not an active or future writer appointment; an inline Astra/low runtime must be verified when this Draft becomes Ready.
- Responsible human/operator: **Kartik**, explicitly identified by the user in the current task. H1 Anjaneya retains visual/product decision ownership; Kartik is the fixed-SHA human acceptance owner.
- Integrated source baseline at this Draft preflight: `10f149472c06fa8ad7855bf24f21e4fa9a41c94f` on main, remote-equal. The actual SOURCE_SHA must be refreshed at Ready; the later docs-only Ready commit will be LAUNCH_SHA and its full hash supplied after creation.
- Correction input: clean, live-remote-equal `claude/tnp-client-demo-m5` at docs tip `42ada80e0ef448e5262c6d7b18057bf28592dfb6`; reviewed application SHA `15502c3bfdc0ba3e8df9a39a0cc8a04b83340e8d` is an ancestor. The two later handoff files are documentation only. This input is an unintegrated candidate under correction, not an accepted dependency of main.
- Independent initial findings: `docs/reviews/TNP-CLIENT-DEMO-M5-SOL-REVIEW.md` (three P1 and two P2). The reviewed source remains immutable.
- A separate clean local RSVP candidate `3334a14dbb600fa09387734bbadbea378e5560b8` descends from M5 code `15502c3` and changes both RSVP backend and 24 frontend paths. Its handoff says the public launcher is restricted, but current `components/tnp/access/routes.ts` still sets `demoWorkspaces = workspaceRegistry`; the cube, tiny labels and Planner anchors also remain unresolved. Its independent backend/security review returned CHANGES REQUESTED. Before Ready, P must choose and verify the correction input against the successor review and update this packet, rather than assuming this older M5 staging target represents the latest aggregate.
- A later clean RSVP correction `d883a8d654840e12176efd9ec1959adff0763986` descends from that candidate and has a bounded independent Sol PASS for four backend code findings. Fresh Claude, Kartik acceptance and Mongo transaction proof remain open. Its inherited M5 frontend findings are still present. Refresh this UI correction's staging input and SOURCE_SHA after those gates; do not merge the older M5 candidate merely because this Draft names it.
- `git merge-tree --write-tree d21c6c4 42ada80` returned a tree without conflicts in read-only preflight. Reverify against the actual later SOURCE_SHA before the task branch merges the candidate.

## Reserved correction lane

- Proposed branch: `codex/tnp-m5-ui-correction`.
- Proposed worktree: `D:\TNP-worktrees\TNP-M5-UI-CORRECTION`, absent at Draft preflight; inline Astra/low writer identity to be verified at Ready. Local dev port 3240 was free at Draft preflight. No lease begins until P supplies LAUNCH_SHA and the author verifies HEAD, model, host, branch, worktree, ownership and port; it expires at fixed-SHA handoff or P revocation.
- On Ready, create the branch/worktree at LAUNCH_SHA and verify initial HEAD equals LAUNCH_SHA and SOURCE_SHA is an ancestor. The correction input and merge sequence must first be refreshed after RSVP review; the currently proposed M5 docs tip `42ada80` is a Draft target only. Record staging SHA and full two-parent provenance. Stop if conflicts or unexpected source changes appear. This is correction staging and receives full aggregate review before any source integration.
- Human reviewer: Kartik at the final fixed SHA. Independent read-only Sol re-review and fresh Claude review of Codex-authored UI remain future gates with exact reviewer identities to be appointed without subagents, subject to the user's latest direction. Prior reviewer `/root/m5_sol_review` supplied only the initial M5 assessment; it is not authorized for a new active review.
- Review-sharing: P may share only the named correction branch by ordinary non-force push when its exact fixed SHA and pusher are recorded. No main source merge, force push, deployment, provider or production action is included.

## Correction scope

Use the **existing accepted** product direction: public launcher/chooser shows only TNP Planner and Freelancer; Operations stays internal and RSVP access dedicated. Restore the retained `HomeHero` hospitality cube to the right side of the teal hero without using the moving-photo backdrop. This is a correction to ADR-0008/DESIGN, not acceptance of the M5 demo deviations. DEC-38 remains open for human disposition at fixed-SHA acceptance.

Owned source paths after the immutable candidate merge:

- `components/tnp/access/routes.ts` and, only as needed to prevent public/internal leakage, `components/tnp/public/portal-launcher/PortalLauncher.tsx`, `components/tnp/public/WorkspaceAccess.tsx`, `components/tnp/public/access-content.ts`, `components/tnp/AppShell.tsx`.
- `components/tnp/HomeExperience.tsx`, `components/tnp/public/Home.module.css`, and retained cube-local `components/tnp/public/HomeHero.tsx` / `HospitalityCube.module.css` only if rendering reveals a concrete defect. Preserve existing motion/fallback logic unless a test reproduces a regression.
- `components/tnp/portals/planner/PlannerPortal.tsx` and `PlannerEventStudio.tsx` for three distinct section destinations and unique IDs.
- Focused assertions in `tests/client-demo-m4.test.mjs`, `tests/frontend-completion-m3.test.mjs`, `components/tnp/public/access-content.test.mjs`, and one new focused public-access regression test if needed. Update assertions for actual product behavior, not source-string mirrors.

Forbidden after merge: `components/tnp/portals/admin/**`, `components/tnp/portals/operations/**`, `components/tnp/portals/rsvp/**`, server/API/data contracts, finance, docs/STATUS.md, docs/LANES.md, secrets and preserved base `tmp/`, `output/`, `.claude/`. The P1 Operations regression receives a separate serialized correction before aggregate acceptance.

## Acceptance and handoff

1. Public dock, mobile menu, chooser and workspace switcher expose only Planner/Freelancer; direct internal route compatibility stays truthful, with no production-auth claim.
2. Homepage renders the approved cube with WebGL/static/reduced-motion behavior and no mobile obstruction, while retaining left copy/actions and truthful preview wording. Hero labels are at least 12px and body lead at least 16px at 390/320, subject to visible layout/contrast verification.
3. Planner section controls reach distinct visible destinations; IDs are unique and keyboard focus lands sensibly.
4. Run tracked `*.test.mjs`, `npm run lint`, `npx --no-install tsc --noEmit --incremental false`, `npm run build:vercel`, and `git diff --check`; record any inherited warning or first-build environmental failure. Do not normalize repeated build failures.
5. Verify 1440x900, 1100x900, 390x844 and 320x844 homepage/dock/Planner flows, keyboard, touch, reduced motion and a 320px scroll sweep. Record screenshots and exact origin/port. The 19/19 aggregate and Operations/Admin/RSVP workflows remain later aggregate gates.
6. Return exact changed files, staging and final SHAs, commands/results, browser evidence, limitations and clean branch status. Stop at the fixed candidate for independent review; no self-certification.
