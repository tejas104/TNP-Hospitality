SESSION TYPE: NEW SESSION
DO NOT REUSE ANY PREVIOUS TNP ARCHITECT, REVIEWER OR DEVELOPER SESSION.

# TNP-SHARED-FIX-01 — external Claude fixed-SHA review

You are a fresh read-only external Claude reviewer. You are not the author, architect P, a prior reviewer or an implementation writer. Do not edit, commit, push, merge, deploy, create a lease or review a moving branch.

Repository: `D:\TNP Hospitality`
Create a fresh clean detached review worktree outside the repository's deliverables directory.
Branch reference: `codex/tnp-shared-fix-01`
BASE_SHA: `e0f3e041a0e5f4198effa33d403be485ab6d6986`
HEAD_SHA: `022449ee02626ed70bd2081c798fb65788b25b76`

Fetch first. Verify the review worktree is detached, clean and exactly at HEAD; BASE is an ancestor; live `origin/codex/tnp-shared-fix-01` equals HEAD; and the immutable range changes only:

- `components/tnp/shared/PreviewControls.tsx`
- `components/tnp/shared/previewActionIdentity.ts`
- `components/tnp/shared/previewActionIdentity.test.mjs`
- `lib/demo/service.ts`
- `tests/preview-contract.test.mjs`

Read `AGENTS.md`, `TNP-START-HERE.md`, `docs/PRODUCT.md`, `docs/DESIGN.md`, `docs/DOMAIN-RULES.md`, `docs/ARCHITECTURE.md`, `docs/REVIEW-CADENCE.md`, `docs/LAUNCH-PROTOCOL.md` and `docs/tasks/TNP-SHARED-FIX-01.md`. Review requirements first, then correctness, concurrency/idempotency, data integrity, error truthfulness, accessibility, responsive behavior, runtime safety and maintainability.

Independently verify both corrections:

- Preview action identity is persisted and monotonic per control action across reloads; an exact captured retry can reuse its key, a new action cannot collide, expected generation is captured at invocation, reset/new generation is separated, and storage/identity failures remain visibly truthful.
- `submitRequirement` resolves the booking and event in the serialized reducer and atomically rejects missing or cross-linked pairs with field errors and no insertion; valid pairs and exact replays still work.
- No feature-portal, contract, fixture, route, package, status or unrelated behavior changed.

Run and report actual results for `npm ci`, `npm run lint`, `npx --no-install tsc --noEmit --incremental false`, `node --experimental-strip-types --test tests/preview-contract.test.mjs`, `node --experimental-strip-types --test components/tnp/shared/previewActionIdentity.test.mjs`, `npm run build:vercel`, and `git diff --check BASE_SHA..HEAD_SHA`. Use an isolated browser on a free port and verify 1440x900 and 390x844, real keyboard operation, reload followed by a different action without false `IDEMPOTENCY_CONFLICT`, reset generation, visible loading/empty/error/ready states, focus, overflow and console/runtime errors. Attribute inherited warnings, audit advisories and environment limitations; do not inherit the builder's PASS.

Return `PASS` or `CHANGES REQUESTED`, exact reviewer session/model/effort/host, immutable range, changed files, command results, browser evidence, limitations and prioritized actionable findings with file/line evidence. Stop any server you start. Do not make fixes. Anjaneya+Kartik human semantic disposition and integration remain separate.
