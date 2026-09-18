SESSION TYPE: NEW SESSION
DO NOT REUSE ANY PREVIOUS TNP ARCHITECT, REVIEWER OR DEVELOPER SESSION.

# TNP-B-M1 final Astra public/frontend — external Claude fixed-SHA review

You are a fresh read-only external Claude reviewer. You are not the Astra author, architect P, a prior TNP reviewer or an implementation writer. Do not edit, commit, push, merge, deploy, create a lease or review a moving branch.

Repository: `D:\TNP Hospitality`
Create a fresh clean detached review worktree outside the repository and deliverables directories.
Branch reference: `codex/tnp-b-m1`
SOURCE_SHA: `0190c5c2d6adeef6a1465c4825ce0db4e8a22a0b`
BASE/READY_SHA: `e89c0f364abddb1fba1097ce5e43966af9f76146`
INTERMEDIATE_SHA: `6ef1f2ceeb5dcc097773ad7e1b8e8f92ab81cb23`
MOTION_LAUNCH_SHA: `db9a0e3a3d9e7dad7da7fc86c9255bf6eb5fa37e`
HEAD_SHA: `712610e17a0858e54d258b4e843210a169b5357b`

Fetch first. Verify the worktree is detached, clean and exactly at HEAD; all named predecessors are ancestors; live `origin/codex/tnp-b-m1` equals HEAD; and `BASE..HEAD` contains exactly the 18 application/test/data paths authorized by `docs/tasks/TNP-B-M1.md` plus the motion correction dispatch record. Reject any other scope.

Read `AGENTS.md`, `TNP-START-HERE.md`, `docs/PRODUCT.md`, `docs/DESIGN.md`, `docs/DOMAIN-RULES.md`, `docs/ARCHITECTURE.md`, `docs/REVIEW-CADENCE.md`, `docs/tasks/TNP-B-M1.md`, `docs/HOMEPAGE-REDESIGN-BRIEF.md`, `docs/reviews/TNP-HOME-CLAUDE-REVIEW.md`, `docs/FRONTEND-ASTRA-ROADMAP.md` and `docs/dispatch/2026-09-18/B-ASTRA-MOTION-CORRECTION.md`. Review requirements first, then correctness, accessibility, responsive behavior, error truthfulness, state/idempotency integrity, runtime safety, performance, maintainability and content provenance. Do not inherit builder PASS claims.

Independently verify:

- all prior homepage findings are closed: AA text contrast, focus contrast on light/dark surfaces, vendor-interest action, first keyboard focus on skip navigation, and no public Login/Operations Demo/PreviewControls/portal-switcher exposure;
- the public site preserves the approved editorial redesign and strong photography rather than rebuilding the old homepage or adding another photo wall;
- the original Celebration Constellation reads as a TNP hospitality/event canopy with differentiated guest/planner/vendor/operations nodes, not a copied Origin component or generic sci-fi ornament;
- there is exactly one canvas, capped DPR, content-first/progressive mount, and manual/offscreen/background suspension; mobile, reduced-motion including dynamic preference change, coarse pointer, unavailable WebGL and thrown initialization retain complete still content/actions;
- staged hero/CTA, fine-pointer parallax, native-scroll journey progress, section/image-mask reveal, service/role stagger, card/CTA focus/hover and closing transition are purposeful, do not hide content, scroll-jack, move focus, cause layout shift or create inaccessible continuous motion;
- image placement/source/lazy-load accounting is truthful and no client approval is invented;
- the six service and four evidenced role detail routes are truthful previews; all homepage links resolve; invalid slugs return a real not-found result; proposed but unevidenced catalogue items are not fabricated;
- contact preserves interest and the labelled synthetic enquiry covers validation/focus, pending/reset race, thrown service, persistence rejection, exact retry/replay, receipt integrity and reload restoration without claiming external delivery;
- keyboard/touch/mobile navigation, gallery and accordions work with no overflow, broken images, console errors, hydration/runtime exceptions or false production/provider claims.

Run and report actual results for `npm ci`, `npm run lint`, `npx --no-install tsc --noEmit --incremental false`, shared preview tests, WebGL tests, enquiry tests, motion-policy tests, `npm run build:vercel`, and `git diff --check BASE_SHA..HEAD_SHA`. Use an isolated browser on a free port and verify the homepage, contact, all 11 valid public routes and both invalid slugs at 1440x900 and 390x844. Exercise real Tab/Shift+Tab/Enter/Space, fine/coarse pointer policies, reduced motion including a live preference change, manual/background/offscreen pause, and forced unavailable/thrown WebGL. Stop every server/browser you start.

Return exactly one disposition headline: `APPROVE FOR ARCHITECT-CONTROLLED INTEGRATION` or `CHANGES REQUESTED`. Then report exact reviewer session/model/effort/host, immutable range, changed files, command results, browser evidence, limitations and prioritized actionable findings tied to file/line and observed behavior. Do not make fixes. Kartik's sole human fixed-SHA approval and architect-controlled integration remain separate.
