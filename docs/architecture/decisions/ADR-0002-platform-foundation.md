# ADR-0002 — production platform foundation

Status: Proposed; awaiting Anjaneya and Kartik decisions listed below. No implementation lease or provider activation follows from this proposal.

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

Boundary map:

`app/api route -> request parsing -> session identity -> role/tenant authorization -> application command/query -> repository/idempotency/audit ports -> approved adapters`

Route handlers own HTTP translation only. Domain/application modules own authorization requirements and invariants. Repositories own tenant-filtered persistence. Adapters own provider-specific SDKs and failure translation.

## Decisions required before Ready

- Confirm MongoDB Atlas and name development/staging/production environment ownership.
- Approve opaque database-backed cookie sessions or choose a managed identity alternative; name the identity account owner.
- Confirm organization, vendor, user and membership roles/statuses for the first milestone.
- Name the deployment project owner and domain/DNS owner.
- Name the secret owner for each environment.
- Approve document retention, or keep upload disabled.
- Confirm email, WhatsApp and payment adapters remain disabled until provider approval and UAT.
- Approve backup frequency, restore evidence and rollback expectations.

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
