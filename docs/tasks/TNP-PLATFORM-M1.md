# TNP-PLATFORM-M1 — temporary-development modular-monolith foundation

Status: FRESH SOL APPROVED — PAUSED FOR EXTERNAL CLAUDE AND KARTIK EXACT-SHA ACCEPTANCE at clean pushed remote-equal `bc6b5565af1750168b10701955d131c3ec2f2dc4`. The correction writer and Sol reviewer leases are closed; do not reopen implementation unless a reviewer returns a bounded finding. Architect-controlled integration remains prohibited until both remaining dispositions are recorded.

Responsible human and sole human fixed-SHA reviewer: H2 Kartik. Anjaneya supplies any product/content decision but is not a second code-review gate.
Sole writer: fresh internal Codex subagent `/root/platform_builder`, assigned `gpt-5.6-sol` / high on DESKTOP-DL9FDM7.
Branch/worktree: `codex/tnp-platform-m1` / `D:\TNP-worktrees\TNP-PLATFORM-M1`.
SOURCE_SHA: `1a32c6b0bcb034f3b122f86e7cd57b14553e6ba4`, locally integrated main with D and Shared Fix.
LAUNCH_SHA: the commit carrying this Ready task plus STATUS/LANES reservation; P supplies the exact full SHA after commit. Initial writer HEAD must equal it.
Port: 3105 / `http://localhost:3105`, verified free at Ready; recheck before binding.
Approved dependency change: add only the official `mongodb` Node driver and its lockfile resolution. No auth/provider SDK is approved; use Node platform crypto and explicit interfaces.
Risk: authentication, authorization, tenancy, persistence, idempotency, audit and release operations. Fresh independent Sol/high review, separate external Claude review and Kartik human approval are mandatory.

## Required decisions

Implement only the accepted development/staging decisions in `docs/architecture/decisions/ADR-0002-platform-foundation.md`. The current Atlas cluster and linked Vercel project are temporary resources confirmed by the user but not live-verified through a connector in this session. The builder may implement environment-driven adapters and local/API tests; it must not claim external connectivity, mutate a provider account, place secrets in source or treat temporary ownership as production readiness. Client-owned production accounts, DNS, secret owners, migration, backup/restore and RPO/RTO remain cutover gates.

## Proposed exact ownership

The final Ready contract may activate only these new paths unless it explicitly narrows them further:

- `app/api/health/route.ts`
- `app/api/ready/route.ts`
- `app/api/v1/session/route.ts`
- `server/config/env.ts`
- `server/http/api.ts`
- `server/security/session.ts`
- `server/security/authorization.ts`
- `server/tenancy/model.ts`
- `server/data/repository.ts`
- `server/data/mongo.ts`
- `server/data/indexes.ts`
- `server/idempotency/service.ts`
- `server/audit/model.ts`
- `server/health/readiness.ts`
- `tests/platform-foundation.test.mjs`
- `docs/runbooks/PLATFORM-FOUNDATION.md`
- `package.json` and `package-lock.json` only for the approved official `mongodb` driver

Forbidden: `components/**`, public/client/planner/freelancer/Operations feature paths, preview contracts/fixtures/services, `data/**`, AppShell/global CSS, existing route pages, Vite/Nitro configuration, unrelated docs/registers, real environment values, provider activation, production data and deployment. Any shared API contract needed by another active writer must be serialized by P first.

## Prompt 1 — provider-neutral server boundary

Create thin route handlers and framework-independent configuration, request, session, authorization, tenancy, idempotency, audit and health/readiness contracts. Fail closed for missing identity, wrong role, wrong tenant, malformed input and missing required configuration. Do not trust client role/tenant claims. Never log secrets or session tokens. Use deterministic in-memory test adapters only inside tests; do not present them as production persistence.

## Prompt 2 — approved persistence/session foundation

Implement the environment-driven MongoDB connection/repository and session boundary, organization/vendor/user/membership persistence, index/schema-version specifications, atomic idempotency/audit behavior where supported, and staging/backup/migration/rollback runbook skeleton. Use names-only environment documentation including `MONGODB_URI`, `MONGODB_DB_NAME`, `SESSION_SECRET`, `SESSION_COOKIE_NAME`, `APP_BASE_URL` and `TNP_ENVIRONMENT`; never add values. Make readiness fail closed when configuration or connectivity is absent. Keep external messaging/payment/document adapters disabled. Do not claim the temporary cluster was reached unless independently evidenced, and do not claim all product workflows are production-backed.

## Acceptance and checks

Tests must cover unauthenticated rejection, wrong-role rejection, direct-ID cross-tenant rejection, two-vendor isolation, idempotent replay, same-key/different-payload conflict, audit actor/request evidence, malformed input, configuration/connection failure, no secret leakage and health/readiness distinctions. Every index names its supporting query. Schema evolution is additive and rollback-aware.

Run locked install after approved dependency changes; lint; non-incremental TypeScript; focused Node tests; Vercel build; diff check; local API probes for health/readiness and authorization failures. Record exact environment variable names without values. Browser work is limited to any route behavior genuinely exposed; do not manufacture a UI.

Builder returns baseline/checkpoints/final SHA, exact changed files, commands/results, API/test evidence, index rationale, migration/rollback limitations and clean local/remote state, then pauses. No main merge/push, deployment or production/provider operation.

The sole writer may create checked commits and non-force push only `codex/tnp-platform-m1` after live remote comparison. Any need to modify existing UI/domain/preview paths or introduce another dependency is a stop-and-escalate condition.

## Fixed-SHA correction after independent review

Correction SOURCE_SHA: `f0bb13590aab37c9bae69d3e1c727cfb8f20daf5`. Resolve only the three findings recorded in `docs/reviews/TNP-PLATFORM-M1-SOL-REVIEW.md`:

1. bind idempotency replay to the original actor or membership, reject cross-actor same-tenant reuse without exposing the cached response, and append safe actor/request replay audit evidence without re-running the effect, including the concurrent conflict/replay path;
2. implement a narrowly scoped revoked-session logout replay that verifies the same token/session/action/actor/key and CSRF, returns only the stored logout result, clears the cookie, and cannot authorize a new mutation or any other route;
3. add and document an explicit Vercel-config local-development command so the existing `process.env` boundary receives the six named variables, while preserving the standard frontend command and fail-closed behavior.

Correction ownership is limited to `server/idempotency/service.ts`, `server/security/session.ts`, `app/api/v1/session/route.ts`, `tests/platform-foundation.test.mjs`, `docs/runbooks/PLATFORM-FOUNDATION.md`, and `package.json`. `server/data/indexes.ts`, Mongo repository code, lockfile, every UI/domain/preview path and all provider resources remain frozen unless P publishes a revised prerequisite. Add focused reproductions for cross-actor replay, same-actor replay audit, concurrent replay audit, exact logout replay, revoked-session non-replay rejection, wrong CSRF/key/action rejection and the documented command. Run the full prior matrix and safe synthetic API probes, push one new immutable final, stop servers and pause for focused independent Sol, separate external Claude and Kartik review.
