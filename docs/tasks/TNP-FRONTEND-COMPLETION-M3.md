# TNP-FRONTEND-COMPLETION-M3 — public access correction and non-homepage completion

Status: HISTORICAL AUTHOR CANDIDATE / SUPERSEDED REVIEW TARGET — The earlier Ready reservation launched and produced clean, remote-equal frontend-completion candidate `8062b5a3b296c838fb6fa0b784b84ced5e06cbbe` in `D:\TNP-worktrees\TNP-FRONTEND-COMPLETION-M3`. A separate clean, remote-equal combined frontend/cube staging candidate is `be78ffa7de22a971e4122ff378b8bf7ccc99cd92` in `D:\TNP-worktrees\TNP-FRONTEND-AGGREGATE-M3`. Neither SHA has a recorded independent fixed-SHA review or Kartik acceptance. Do not integrate either as accepted frontend source or reopen the author's lease without a findings-based correction contract. The 2026-09-20 Ready details below remain launch history, not a current unclaimed reservation.

Current 2026-09-24 review target: Claude client-demo M5 code 15502c3 contains both 8062b5a and be78ffa, so neither earlier SHA remains a separate frontend review queue. M5 is not accepted or integrated; see CLIENT-DEMO-M5-SOL-REVIEW.md and DEC-38. Historical launch details below remain provenance only.
Responsible human: Kartik (H2). Architect/dispatcher: P. Sole human fixed-SHA acceptance reviewer: Kartik. Final independent AI review must not be performed by the author. No author self-certification.

SOURCE_SHA: `390b47ec32aeb802789a6044a6e23f888978df6d`.

LAUNCH_SHA: the full hash of the metadata-only main commit containing ADR-0008, this Ready contract and its status/lanes records; P supplies it after commit creation. Initial writer worktree HEAD must equal that exact SHA.

Branch/worktree/ports: `codex/tnp-frontend-completion-m3`, `D:\TNP-worktrees\TNP-FRONTEND-COMPLETION-M3`, port `3122`, fallback `3222`.

## Product outcome

Implement ADR-0008 and finish the remaining responsive-web frontend presentation without pretending browser preview state is production capability:

- no Client login, Client demo identity or Client workspace;
- `/client` compatibility redirect to `/contact?interest=event-request`;
- one premium Contact experience for specific mixed-product enquiries and general conversation;
- public information journeys for TNP Planner, Freelancers/workforce, Venue and RSVP;
- exactly two public launcher destinations: TNP Planner and Freelancer;
- macOS-inspired source-to-window open/close continuity, reverse close, Escape/focus return, touch-safe mobile placement and reduced-motion parity, using original TNP design rather than copied Apple assets/trade dress;
- no public Operations Demo or Operations entry in marketing/access launchers; retain the internal Operations/Admin implementation without promoting it publicly;
- complete task-first Planner, Freelancer, internal Operations/Admin, message-only RSVP and public/access states required by the current F02-F20 program;
- obvious resting actions and polished hover/focus/pressed/selected/disabled/loading states, Inter-led product typography, truthful loading/empty/error/success states, 320–1440 responsive behavior and print/mobile requirements where already contracted.

F03/F04 are reinterpreted under ADR-0008 as public mixed-product enquiry/confirmation and reference/status/contact-follow-up without Client authentication. Existing Client portal code is historical implementation evidence, not a destination or readiness claim.

## Exact active ownership after P supplies LAUNCH_SHA

Existing route paths:

- `app/globals.css`
- `app/client/page.tsx`
- `app/contact/page.tsx`
- `app/login/page.tsx`
- `app/planner/page.tsx`
- `app/freelancer/page.tsx`
- `app/operations/page.tsx`
- `app/admin/page.tsx`
- `app/services/[slug]/page.tsx`
- `app/departments/[slug]/page.tsx`

New route presentation may be added only under `app/rsvp/**` for the corrected message-only frontend; do not edit API routes.

Existing component/data ownership:

- `components/tnp/AppShell.tsx`
- `components/tnp/PortalPages.tsx`
- `components/tnp/HomeExperience.tsx` only for destination/copy corrections that remove Client portal or public Operations-demo references; no layout/hero/cube redesign
- all tracked files under `components/tnp/access/**`
- `components/tnp/public/WorkspaceDrawer.tsx`
- `components/tnp/public/WorkspaceAccess.tsx`
- `components/tnp/public/WorkspaceAccess.module.css`
- `components/tnp/public/access-content.ts`
- `components/tnp/public/access-content.test.mjs`
- `components/tnp/public/workspace-interaction.ts`
- `components/tnp/public/workspace-interaction.test.mjs`
- `components/tnp/public/EnquiryForm.tsx`
- `components/tnp/public/enquiry-state.ts`
- `components/tnp/public/enquiry-state.test.mjs`
- `components/tnp/public/DetailPage.tsx`
- `components/tnp/public/Public.module.css`
- all tracked files under `components/tnp/portals/planner/**`
- all tracked files under `components/tnp/portals/freelancer/**`
- all tracked files under `components/tnp/portals/operations/**`
- all tracked files under `components/tnp/shared/**`
- `data/tnp.ts`
- `data/public-content.ts`

New files may be added only under `components/tnp/public/portal-launcher/**`, `components/tnp/portals/rsvp/**`, `app/rsvp/**`, and `tests/` with names prefixed `frontend-completion-m3`.

Owned aggregate test paths: `tests/ux-foundation.test.mjs`, `tests/ux-foundation.browser.mjs`, `tests/ux-components.tsx`, `tests/ux-components.html`, `tests/ux-partner-evidence.test.mjs`, and new `tests/frontend-completion-m3*` files. `tests/brand-teal-palette.test.mjs` is read-only regression evidence.

Every other path is frozen. In particular do not edit homepage hero/cube/3D source or assets, `components/tnp/public/Home.module.css`, `HomeHero.tsx`, `PavilionScene.tsx`, `HospitalityCube*`, home motion/WebGL files, `data/media.ts`, server/API/domain/platform code, database/provider configuration, package manifests/locks, production authentication, payments, WhatsApp activation, deployment configuration, documentation/registers, or untracked `.claude/`, `output/`, `tmp/` trees. Stop and return an exact follow-up need if a frozen path is genuinely required.

Review-sharing authority: ordinary non-force push only to `codex/tnp-frontend-completion-m3`. No main push, merge, deployment, production/provider mutation or force push.

## Delivery cadence

The user explicitly requests implementation before review. Use one writer and two pushed checkpoints on the same branch:

1. **Checkpoint A — public/access foundation:** ADR-0008 route model, Client decommission, Contact journeys, two-role launcher/window motion, removal of public Operations Demo and accessibility/regression coverage.
2. **Checkpoint B — final aggregate frontend:** complete the remaining owned Planner/Freelancer/internal Operations/Admin/message-only RSVP/public/access presentation and 19-set evidence matrix.

There is no formal AI review between checkpoints. P may inspect scope, tests and browser evidence without certifying acceptance. After the one clean pushed final SHA, run one consolidated independent fixed-SHA review plus focused correction successors as needed, then obtain Kartik's exact-SHA acceptance. This batching does not waive scope, accessibility, security-truthfulness, financial/data/provider, build, browser or human acceptance gates.

The homepage cube remains a separate unintegrated candidate. Its latest Claude review proved contrast/test fixes but found the current fixed workspace pill still intercepts Planner/Pause at 320px scrollY 30–90. Do not offset the cube again. The aggregate staging/review step will combine the cube with this task's replacement launcher and must prove the complete 320px scroll sweep before either source is integrated to main.

## Required verification

- Independently discover and run all tracked tests plus focused route/session/enquiry/launcher/portal tests.
- `npm run lint`, `npx --no-install tsc --noEmit --incremental false`, `npm run build:vercel`, `git diff --check`, exact allowlist and remote-equality checks.
- Browser matrices at 1440x900, 1100x900, 390x844 and 320x844, plus 200% zoom, keyboard, coarse pointer/touch, reduced motion, safe-area and virtual-keyboard states.
- Launcher: source-rect continuity, reversible close to exact source when visible, graceful fallback when source is unavailable/offscreen, no hover auto-open, Escape/close/back behavior, focus containment/return, no content obstruction at every scroll position and no animation-only meaning.
- Public journey: no reachable Client login/portal or Operations Demo; `/client` redirects to Contact; general and event-specific enquiry paths validate and produce truthful local references; informational routes and CTAs are destination-accurate.
- Internal workspaces: no public exposure from route manifest/navigation; direct preview remains explicitly synthetic and cannot be claimed as production authorization.
- Record honest limitations. No physical-device, provider, production-auth, payment, WhatsApp delivery or production-readiness claim without evidence.
