# TNP-WORKER-PROFILE-API-M5 - normal profile and admin-console projection

Status: DRAFT / DEPENDENCY AND REVIEW CAPACITY HOLD. No writer, branch, worktree, port, Ready SHA, reviewer appointment or push authority. Source baseline must be reverified after M5 and access-foundation integration.

Human owner and fixed-SHA acceptance reviewer: Kartik. Proposed author: verified GPT-6 Sol backend session after P handoff/pause. Fresh non-author Sol security/data review and external Claude review required.

## Result

Build the normal authenticated worker profile and tenant-scoped staffing projection in W1. This milestone does not accept file bytes, Aadhaar data, passbook images, exact bank values or payout destination changes. Private document and payout endpoints are a later sensitive milestone after ADR-0009 decisions. The M5 /operations frontend is the admin console under components/tnp/portals/admin, not the deleted Operations desk.

## Prerequisites

- Client-demo M5 reviewed, product conflicts resolved and integrated.
- TNP-WORKER-ACCESS-FOUNDATION-M5 accepted and integrated: real worker/Operations identity and capabilities.
- Platform required-index hardening accepted before staging.
- DEC-33 role/field projection approved. DEC-34/35/36 gate later private work, not this normal profile.
- Exact Ready source/launch SHA, clean isolated writer worktree, model/host/reviewer evidence and serialized file ownership.

## Proposed ownership

server/workers/** normal profile model, validation, service and projections; narrow server/data/repository.ts, mongo.ts and indexes.ts changes; app/api/v1/workers/me/** and app/api/v1/operations/workers/**; server/audit/model.ts for a reviewed sensitive-read audit extension; focused tests and runbook. The exact Ready allowlist replaces this proposal. No frontend, shared preview fixture, RSVP, provider, finance ledger or live Atlas mutation is owned.

## Acceptance

Worker session userId and active worker membership in a TNP-kind organization are the sole own-profile identity. GET/PATCH uses the W1 field matrix. PATCH requires CSRF, If-Match profile revision and Idempotency-Key. A profile edit is independent of document/Finance revisions. Operations list/detail exposes exact allowed fields only, bounded by TNP tenant, with no generic admin or platform cross-tenant bypass. Sensitive contact access is separately gated/audited. Tests cover wrong tenant, worker and role; forged IDs; stale/duplicate writes; revoked sessions; exact response keys; export leakage; pagination and index failures. Run project checks and fixed-SHA independent review before integration.
