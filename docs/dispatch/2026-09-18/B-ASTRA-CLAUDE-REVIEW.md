SESSION TYPE: NEW SESSION
DO NOT REUSE ANY PREVIOUS TNP ARCHITECT, REVIEWER OR DEVELOPER SESSION.

SUPERSEDED — DO NOT EXECUTE. The user issued a later Godly/Origin-inspired homepage 3D and motion requirement after `6ef1f2ceeb5dcc097773ad7e1b8e8f92ab81cb23`. P will publish a replacement fixed-SHA review packet after the bounded Astra correction.

# TNP-B-M1 Astra public/frontend — external Claude fixed-SHA review

You are a fresh read-only external Claude reviewer. You are not the Astra author, architect P, a prior TNP reviewer or an implementation writer. Do not edit, commit, push, merge, deploy, create a lease or review a moving branch.

Repository: `D:\TNP Hospitality`
Create a fresh clean detached review worktree outside the repository and deliverables directories.
Branch reference: `codex/tnp-b-m1`
SOURCE_SHA: `0190c5c2d6adeef6a1465c4825ce0db4e8a22a0b`
BASE/LAUNCH_SHA: `e89c0f364abddb1fba1097ce5e43966af9f76146`
HEAD_SHA: `6ef1f2ceeb5dcc097773ad7e1b8e8f92ab81cb23`

Fetch first. Verify the review worktree is detached, clean and exactly at HEAD; BASE is an ancestor; live `origin/codex/tnp-b-m1` equals HEAD; and `BASE..HEAD` changes only:

- `app/contact/page.tsx`
- `app/departments/[slug]/page.tsx`
- `app/globals.css`
- `app/services/[slug]/page.tsx`
- `components/tnp/AppShell.tsx`
- `components/tnp/HomeExperience.tsx`
- `components/tnp/public/DetailPage.tsx`
- `components/tnp/public/EnquiryForm.tsx`
- `components/tnp/public/Home.module.css`
- `components/tnp/public/HomeHero.tsx`
- `components/tnp/public/PavilionScene.tsx`
- `components/tnp/public/Public.module.css`
- `components/tnp/public/enquiry-state.test.mjs`
- `components/tnp/public/enquiry-state.ts`
- `data/public-content.ts`

Read `AGENTS.md`, `TNP-START-HERE.md`, `docs/PRODUCT.md`, `docs/DESIGN.md`, `docs/DOMAIN-RULES.md`, `docs/ARCHITECTURE.md`, `docs/REVIEW-CADENCE.md`, `docs/tasks/TNP-B-M1.md`, `docs/HOMEPAGE-REDESIGN-BRIEF.md`, `docs/reviews/TNP-HOME-CLAUDE-REVIEW.md` and `docs/FRONTEND-ASTRA-ROADMAP.md` from the target or canonical metadata as appropriate. Review requirements first, then correctness, accessibility, responsive behavior, error truthfulness, state/idempotency integrity, runtime safety, performance, maintainability and content provenance.

Independently verify, without inheriting the builder's PASS:

- All prior homepage findings are actually closed: body-text contrast, focus contrast on light and dark surfaces, vendor-interest action, first keyboard focus on skip navigation, and no public Login/Operations Demo/PreviewControls/portal switcher exposure.
- The homepage remains the approved redesign and not a rebuilt old homepage or another photo wall.
- The new terraced guest-journey/venue model is materially different from the prior pavilion, uses at most one canvas, caps DPR, pauses for manual/offscreen/background state, and preserves complete mobile/reduced-motion/unavailable/thrown-WebGL still fallbacks.
- Approximately 75% of documented image placements remain with truthful placement/unique-source/lazy-load accounting; no asset is described as client-approved without evidence.
- The six service and four evidenced department/role detail routes are truthful preview content, all homepage links resolve, invalid slugs return a real not-found result, and proposed but unevidenced catalogue entries are not fabricated.
- The contact route preserves service/vendor/role interest. The synthetic enquiry state covers validation, focus, pending, reset races, thrown service, persistence rejection, exact retry/replay, receipt integrity and reload restoration without claiming external delivery.
- Keyboard order and focus are usable with Tab, Shift+Tab, Enter and Space; mobile navigation, accordion/gallery and enquiry controls work; no horizontal overflow, broken image, console error or hydration/runtime exception appears.
- No backend/provider/real-data, WhatsApp approval, vendor-login or production-delivery claim was introduced.

Run and report actual results for `npm ci`, `npm run lint`, `npx --no-install tsc --noEmit --incremental false`, `node --experimental-strip-types --test tests/preview-contract.test.mjs`, `node --experimental-strip-types --test components/tnp/public/webgl.test.mjs`, `node --experimental-strip-types --test components/tnp/public/enquiry-state.test.mjs`, `npm run build:vercel`, and `git diff --check BASE_SHA..HEAD_SHA`. Use an isolated browser on a free port and verify the homepage, contact route, all 11 valid public detail/contact routes and both invalid slugs at 1440x900 and 390x844. Exercise real keyboard input, reduced motion and forced unavailable/thrown WebGL where feasible. Stop every server/browser you start.

Return exactly one disposition headline: `APPROVE FOR ARCHITECT-CONTROLLED INTEGRATION` or `CHANGES REQUESTED`. Then report exact reviewer session/model/effort/host, immutable range, changed files, command results, browser evidence, limitations and prioritized actionable findings tied to file/line and observed behavior. Do not make fixes. Kartik's sole human fixed-SHA approval and architect-controlled integration remain separate.
