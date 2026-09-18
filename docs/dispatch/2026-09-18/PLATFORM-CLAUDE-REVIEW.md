SESSION TYPE: NEW SESSION
DO NOT REUSE ANY PREVIOUS TNP ARCHITECT, REVIEWER OR DEVELOPER SESSION.

SUPERSEDED — DO NOT EXECUTE. Independent review requested corrections after `f0bb13590aab37c9bae69d3e1c727cfb8f20daf5`. Use `docs/dispatch/2026-09-18/PLATFORM-FINAL-CLAUDE-REVIEW.md` for corrected final `bc6b5565af1750168b10701955d131c3ec2f2dc4`.

# TNP-PLATFORM-M1 — external Claude fixed-SHA review

You are a fresh read-only external Claude reviewer. You are not the platform author, architect P, a prior TNP reviewer or an implementation writer. Do not edit, commit, push, merge, deploy, connect to or mutate MongoDB/Vercel, create a lease or review a moving branch.

Repository: `D:\TNP Hospitality`
Create a fresh clean detached review worktree outside the repository and deliverables directories.
Branch reference: `codex/tnp-platform-m1`
SOURCE_SHA: `1a32c6b0bcb034f3b122f86e7cd57b14553e6ba4`
BASE/LAUNCH_SHA: `ce64172eff2e96bc0fdfeb4384d93ebd197712ce`
HEAD_SHA: `f0bb13590aab37c9bae69d3e1c727cfb8f20daf5`

Fetch first. Verify the worktree is detached, clean and exactly at HEAD; BASE is an ancestor; live `origin/codex/tnp-platform-m1` equals HEAD; and the immutable range changes only the 18 paths authorized in `docs/tasks/TNP-PLATFORM-M1.md`.

Read `AGENTS.md`, `TNP-START-HERE.md`, `docs/PRODUCT.md`, `docs/DESIGN.md`, `docs/DOMAIN-RULES.md`, `docs/ARCHITECTURE.md`, `docs/REVIEW-CADENCE.md`, `docs/tasks/TNP-PLATFORM-M1.md`, `docs/architecture/decisions/ADR-0002-platform-foundation.md` and `docs/runbooks/PLATFORM-FOUNDATION.md`. Review in risk order: requirements, correctness, authentication/session security, authorization/tenant isolation, data integrity, concurrency/idempotency/audit atomicity, architecture, index/query fit, readiness/operations, tests and documentation.

Independently try to falsify, without using real secrets or a live cluster:

- unauthenticated, revoked, malformed, expired and wrong-tenant sessions fail closed; roles and organization context are server-derived and revalidated per request;
- no platform-admin or direct-ID tenant bypass exists; two-vendor isolation and wrong-role rejection hold;
- tokens/secrets are never stored or logged in recoverable form; cookie, CSRF and credential-digest behavior matches the accepted ADR;
- protected mutations require idempotency; exact replay, same-key/different-payload conflict, concurrent claims, transaction commit/abort and rejected/failed audit behavior are coherent;
- Mongo client/session lifecycle and transaction callbacks are correct for the official driver and do not accidentally reuse ended sessions, report success before commit, or leak cross-tenant data;
- index definitions support documented queries and uniqueness/TTL semantics without unsafe rollout assumptions;
- liveness remains process-only while readiness fails closed for missing/invalid configuration or unavailable persistence;
- malformed input and internal errors return safe structured responses with request IDs and no secret leakage;
- runbook truthfully separates temporary development resources from client-owned production cutover, including backups, restore evidence, migration reconciliation, rollback and provider-disabled state.

Run and report actual results for `npm ci`, `node --experimental-strip-types --test tests/platform-foundation.test.mjs`, `node --experimental-strip-types --test tests/preview-contract.test.mjs`, `npm run lint`, `npx --no-install tsc --noEmit --incremental false`, `npm run build:vercel`, and `git diff --check BASE_SHA..HEAD_SHA`. Use only synthetic or absent environment values for safe local API probes of health, readiness and authorization failure; do not contact a live provider. Stop every server you start.

Return exactly one disposition headline: `APPROVE FOR ARCHITECT-CONTROLLED INTEGRATION` or `CHANGES REQUESTED`. Then report exact reviewer session/model/effort/host, immutable range, changed files, command/API results, limitations and prioritized actionable findings tied to file/line and observed behavior. Do not make fixes. A separate independent Sol/high review and Kartik's sole human fixed-SHA approval remain mandatory.
