# TNP-WORKER-PROFILE-API-M5 - secure worker profile backend

Status: DRAFT / REVIEW CAPACITY HOLD. No writer, branch, worktree, port, Ready launch SHA, reviewer appointment, or push authority is active. Current integrated source baseline is main 831597573fe6898f8a19e5cf416d36a364c3544b. Verify fresh state before Ready. Frontend aggregate and RSVP backend currently occupy both waiting-review slots.

Human owner and exact-SHA acceptance reviewer: Kartik. Proposed author is a verified GPT-6 Sol backend session after P's dispatcher handoff/pause and a published Ready lease. Fresh non-author GPT-6 Sol security/data review plus external Claude review at one fixed SHA are required.

## Result

Build the authenticated normal worker-profile API and tenant-scoped Operations worker projection described in W1-CAREERS-WORKER-PROFILE. Create separately protected photo/document and payout-destination seams that fail closed until ADR-0009 storage, Aadhaar/retention, provider, and capability decisions are accepted. Do not collect real bank details, Aadhaar files, or passbook files in Mongo or the synthetic preview.

## Proposed ownership

- server/workers/**: validation, profile service, separate private metadata models, authorization projections.
- server/data/repository.ts, server/data/mongo.ts, server/data/indexes.ts: narrow tenant-scoped profile persistence and indexes after exact allowlist review.
- app/api/v1/workers/** and app/api/v1/operations/workers/**: thin protected handlers.
- server/security/authorization.ts only if the capability contract is explicitly approved.
- focused server tests and one runbook/contract update.

No public/frontend components, shared preview fixture/service, RSVP, finance ledger, provider integration, production Atlas mutation, package migration, or deployment is owned. An exact path allowlist replaces this proposal before Ready.

## Acceptance

1. Worker session userId is the only source of own-profile identity; cross-user and cross-tenant reads/writes are rejected.
2. Normal profile data persists with revision conflict handling and auditable sensitive changes. Operations list/detail receives the authorized projection without account numbers or document bytes.
3. Verification and payout data have separate storage models and capability checks. Generic organization_admin is not automatically a verifier or Finance actor.
4. Upload/finalization methods reject requests while private storage/scanning/consent/retention are unconfigured. No accepted test can confuse metadata creation with a scanned private file.
5. Profile/photo/payout changes cannot change an existing frozen payout or assignment rate.
6. Required unique/query indexes, migration/rollback, readiness compatibility, and error responses are documented and tested.
7. Tests cover stale revisions, forged IDs, revoked session, CSRF, wrong role, cross-tenant lookup, duplicate request, malformed input, and no leakage in errors/logs.

Prerequisites: platform required-index hardening before staging; accepted ADR-0009 and approved storage/provider policy before activating upload or payout destination collection. Execute all project checks, focused adversarial tests, diff check, and local HTTP tests with synthetic actors. Fixed-SHA independent review and Kartik acceptance precede integration.
