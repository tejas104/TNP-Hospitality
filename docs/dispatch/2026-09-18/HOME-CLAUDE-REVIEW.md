SESSION TYPE: NEW SESSION
DO NOT REUSE ANY PREVIOUS TNP ARCHITECT, REVIEWER OR DEVELOPER SESSION.

# TNP homepage — external Claude fixed-SHA review

You are a fresh read-only external Claude reviewer. You are not the homepage author, architect P, a prior reviewer or an implementation writer. Do not edit, commit, push, merge, deploy, create a lease or review a moving branch.

Repository: `D:\TNP Hospitality`
Detached review worktree: `D:\TNP-review\TNP-HOME-b1dc-claude`
Branch reference: `codex/tnp-home-redesign`
BASE_SHA: `1700b2521145c923c6dc31f3f1afe184b27dfd34`
HEAD_SHA: `b1dcac83d29a0c26d490f9ede6dad8bc65f0106d`

Verify the worktree is detached, clean and exactly at HEAD; BASE is an ancestor; live `origin/codex/tnp-home-redesign` equals HEAD; and the immutable range changes only:

- `components/tnp/HomeExperience.tsx`
- `components/tnp/public/Home.module.css`
- `components/tnp/public/HomeHero.tsx`
- `components/tnp/public/PavilionScene.tsx`
- `components/tnp/public/webgl.test.mjs`
- `components/tnp/public/webgl.ts`

Read `AGENTS.md`, `docs/PRODUCT.md`, `docs/DESIGN.md`, `docs/HOMEPAGE-REDESIGN-BRIEF.md`, `docs/tasks/TNP-HOME-REDESIGN.md` and `docs/reviews/TNP-HOME-REDESIGN-DELTA.md`. Review requirements first, then correctness, accessibility, responsive behavior, runtime safety, performance and maintainability.

Required retained checks:

- Preserve the client-liked public redesign; do not rebuild the old homepage or add another photo wall.
- Approximately 75% of photographic placements remain, with an exact baseline/final accounting and no invented client asset approval.
- Exactly one purposeful 3D scene; capped DPR, progressive loading, offscreen/background pause and no avoidable duplicate canvas.
- Reduced-motion, mobile and non-WebGL fallbacks retain all content and actions.
- WebGL2 is probed before mounting R3F; unavailable/thrown initialization routes to the still illustration.
- No public Operations Demo/internal controls or false production vendor/login/WhatsApp claims.
- Primary enquiry and RSVP/vendor-interest actions and all anchors work.
- Contrast, overlays, keyboard order, visible focus, no horizontal overflow or console/runtime errors.
- Verify at 1440x900 and 390x844 with real Tab/Shift+Tab/Enter/Space, reduced motion and forced non-WebGL where feasible.

Run and report actual results for `npm run lint`, `npx --no-install tsc --noEmit --incremental false`, `node --experimental-strip-types --test tests/preview-contract.test.mjs`, `node --experimental-strip-types --test components/tnp/public/webgl.test.mjs`, `npm run build:vercel`, and `git diff --check BASE_SHA..HEAD_SHA`. Attribute inherited warnings and environment limitations; do not inherit the builder's PASS.

Return `PASS` or `CHANGES REQUESTED`, exact reviewer session/model/effort/host, immutable range, changed files, command results, browser evidence, limitations and prioritized actionable findings with file/line evidence. Do not make fixes. Kartik/H1 human disposition and integration remain separate.
