# ADR-0002 — production platform foundation

Status: Accepted for a temporary development/staging foundation on 2026-09-18. Production account ownership, data migration, provider activation and deployment remain separate client cutover gates.

## Context

The repository is one React/Vinext/Vite/Nitro application with supported App Router `route.ts` handlers, but it has no production API, authentication, persistence, durable jobs or provider adapters. The Day-5 milestone needs a small production foundation that future web and mobile clients can share without changing the current frontend framework or creating services the two-human team cannot safely operate.

The platform must enforce identity, role and organization scope on the server; preserve request/audit identity; isolate vendors; fail closed when configuration or persistence is unavailable; and keep email, WhatsApp, payments and guest documents disabled until their separate approvals and controls exist.

Decision owners: Anjaneya for product, deployment and content implications; Kartik for platform, Operations, security and data implications. Both approve shared tenant/auth contracts.

## Proposed decision

1. Keep one modular monolith in the existing Vinext application. HTTP route handlers under `app/api/**` remain thin and call framework-independent modules under `server/**`. Do not introduce microservices, queues, a monorepo or a framework migration in this milestone.
2. Version business endpoints under `/api/v1`. Keep `/api/health` as process liveness and `/api/ready` as dependency readiness. Readiness fails when required configuration or approved persistence is unavailable; health does not claim downstream readiness.
3. Use `organizationId` as the tenant boundary. A user gains scoped access only through an explicit membership carrying a fixed platform role and status. Every repository query and sensitive command receives server-derived actor and organization context; client-supplied role or organization claims never authorize access.
4. Prefer opaque, revocable, database-backed sessions in secure HttpOnly cookies with CSRF protection for browser mutations. The concrete identity provider/session package remains a decision gate; implement the boundary and tests before binding a provider.
5. Preserve MongoDB Atlas as the intended database direction, but do not install or connect a driver until Atlas and environment ownership are approved. Repository interfaces, document shapes, index specifications and schema-version policy remain provider-neutral until that approval.
6. Require an idempotency key and canonical request fingerprint for protected mutations. Same-key/same-payload replays the stored result; same-key/different-payload conflicts. Persist the mutation receipt and domain effect atomically where the approved datastore supports transactions.
7. Every protected mutation records actor, organization, request ID, idempotency key, action, target, time and outcome. Logs and errors never include secrets, raw session tokens or sensitive guest documents.
8. Validate environment configuration at server startup/first use with names only in source. Development, staging and production secrets remain separated and owned by named humans. No real values enter Git, fixtures, tests or logs.
9. Keep email, WhatsApp, payment, KYC, GPS and document-upload adapters disabled by default. Missing provider approval produces an explicit unavailable capability, never a synthetic success.
10. Use additive/backward-compatible schema evolution in this milestone. Publish index intent with the query each index supports. No destructive migration, implicit data rewrite or production deployment is authorized.
11. Use the current user-confirmed MongoDB Atlas cluster only as temporary development/staging infrastructure. Configuration is environment-only; no secret or real personal data enters Git, fixtures or logs. The client-controlled production cluster replaces it at deployment through a rehearsed export/import or application migration with reconciliation and rollback.
12. Treat the repository's currently linked Vercel project as temporary development/preview infrastructure. The client-controlled production project/account, domain and DNS are supplied or transferred at release cutover. Current linkage is not production ownership evidence.
13. Adopt the proposed opaque database-backed cookie-session boundary and initial roles `platform_admin`, `organization_admin`, `operations`, `finance`, `planner`, `client`, `vendor_operator`, `worker`, with membership states `invited`, `active`, `suspended`, `revoked`. Future role changes require contract tests and migration analysis.
14. Keep document upload, email, WhatsApp and payment adapters disabled until their client/provider/security/UAT gates pass. Current production secret owners, retention policy and provider accounts remain client-input blockers, not reasons to fabricate working integrations.
15. Use additive schema changes, feature-disable/application rollback, daily production backups and a demonstrated staging restore as the default release policy. Exact production RPO/RTO and restore operator remain client cutover inputs.

Boundary map:

`app/api route -> request parsing -> session identity -> role/tenant authorization -> application command/query -> repository/idempotency/audit ports -> approved adapters`

Route handlers own HTTP translation only. Domain/application modules own authorization requirements and invariants. Repositories own tenant-filtered persistence. Adapters own provider-specific SDKs and failure translation.

## Decisions resolved for the development Ready contract

- MongoDB Atlas is approved for the temporary development/staging foundation; Kartik is the platform/domain operator and P may perform bounded technical operations through available project tooling. Production ownership changes to the client at deployment.
- Opaque revocable database-backed cookie sessions and the initial membership model above are approved.
- The currently linked Vercel project is approved for temporary development/preview only. Production Vercel, domain/DNS and final environment owners remain client cutover inputs.
- Secret values remain provider-managed. Missing current connector visibility is a readiness failure, never permission to place a value in source.
- Document upload and external email/WhatsApp/payment adapters remain disabled.
- Backward-compatible rollback is approved. Production daily backup, restore drill, RPO/RTO and named restore operator remain mandatory before go-live.

Tool evidence at acceptance: `.vercel/project.json` identifies a linked temporary project, but the connected Vercel tool returned no visible teams and could not list the project. No callable MongoDB management tool was exposed to this session. Therefore external resource existence is user-confirmed, while live account/cluster access remains unverified and cannot support a production-ready claim.

## Alternatives considered

- Separate API service or microservices: rejected for this milestone because it adds deployment, observability and coordination cost without a demonstrated scale or isolation need.
- Browser-only authorization or tenant filtering: rejected because it cannot protect direct API or record-ID access.
- Stateless long-lived JWT authorization: not preferred because revocation, role changes and suspension are harder to enforce safely; may be reconsidered for a future mobile token exchange.
- Immediate provider SDK integration: deferred until owners, accounts, retention and failure semantics are approved.
- New monorepo/packages layout: rejected because the existing single application can express the required boundaries without structural migration.

## Consequences

- The first milestone establishes trustworthy boundaries and tests, not production backing for every F01–F20 workflow.
- Future web and mobile clients can share the same API/domain authorization model.
- H2 owns a concentrated platform surface, so exact path ownership and independent security/data review remain mandatory.
- Provider-neutral interfaces may require later adapter work, but prevent premature account and vendor lock-in.
- MongoDB indexes, sessions, backups and deployment readiness remain FAIL/WARNING until the named decisions and environment evidence exist.

Evidence: `docs/ARCHITECTURE.md`, `docs/DOMAIN-RULES.md`, `docs/DELIVERY-PLAN.md`, `docs/RSVP-SERVICE-BLUEPRINT.md`, and `docs/tasks/TNP-PLATFORM-M1.md`.
