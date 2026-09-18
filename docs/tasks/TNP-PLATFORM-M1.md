# TNP-PLATFORM-M1 — production modular-monolith foundation

Status: DRAFT, NOT DISPATCHED. Writer lease NONE. Convert to Ready only after the decision owners resolve every gate named in ADR-0002 and P publishes exact source/launch metadata.

Responsible human: H2 Kartik. H1 Anjaneya reviews product/deployment implications.
Proposed sole writer: internal Codex subagent `/root/platform_builder`, assigned `gpt-5.6-sol` / high on DESKTOP-DL9FDM7; not launched.
Proposed branch/worktree: `codex/tnp-platform-m1` / `D:\TNP-worktrees\TNP-PLATFORM-M1`; both must remain unused until Ready.
SOURCE_SHA / LAUNCH_SHA / port / exact approved dependencies: PENDING final Ready publication.
Risk: authentication, authorization, tenancy, persistence, idempotency, audit and release operations. Fresh independent Sol/high review, separate external Claude review and Anjaneya human approval with Kartik domain ownership are mandatory.

## Required decisions

Read and approve or amend `docs/architecture/decisions/ADR-0002-platform-foundation.md`: Atlas/environment owner, session/auth choice and account owner, membership model, deployment/DNS owner, secret owners, document retention/upload state, provider-disabled state, backups/restore and rollback. No unresolved irreversible choice may be invented by the builder.

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
- `package.json` and `package-lock.json` only for dependency names explicitly approved in the final Ready contract

Forbidden: `components/**`, public/client/planner/freelancer/Operations feature paths, preview contracts/fixtures/services, `data/**`, AppShell/global CSS, existing route pages, Vite/Nitro configuration, unrelated docs/registers, real environment values, provider activation, production data and deployment. Any shared API contract needed by another active writer must be serialized by P first.

## Prompt 1 — provider-neutral server boundary

Create thin route handlers and framework-independent configuration, request, session, authorization, tenancy, idempotency, audit and health/readiness contracts. Fail closed for missing identity, wrong role, wrong tenant, malformed input and missing required configuration. Do not trust client role/tenant claims. Never log secrets or session tokens. Use deterministic in-memory test adapters only inside tests; do not present them as production persistence.

## Prompt 2 — approved persistence/session foundation

After the final Ready contract names approved dependencies and decisions, implement the MongoDB connection/repository and session boundary, organization/vendor/user/membership persistence, index/schema-version specifications, atomic idempotency/audit behavior where supported, and staging/backup/rollback runbook skeleton. Keep external messaging/payment/document adapters disabled. Do not claim all product workflows are production-backed.

## Acceptance and checks

Tests must cover unauthenticated rejection, wrong-role rejection, direct-ID cross-tenant rejection, two-vendor isolation, idempotent replay, same-key/different-payload conflict, audit actor/request evidence, malformed input, configuration/connection failure, no secret leakage and health/readiness distinctions. Every index names its supporting query. Schema evolution is additive and rollback-aware.

Run locked install after approved dependency changes; lint; non-incremental TypeScript; focused Node tests; Vercel build; diff check; local API probes for health/readiness and authorization failures. Record exact environment variable names without values. Browser work is limited to any route behavior genuinely exposed; do not manufacture a UI.

Builder returns baseline/checkpoints/final SHA, exact changed files, commands/results, API/test evidence, index rationale, migration/rollback limitations and clean local/remote state, then pauses. No main merge/push, deployment or production/provider operation.
