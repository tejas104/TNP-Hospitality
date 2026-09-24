# TNP-WORKER-ACCESS-FOUNDATION-M5 - worker and Operations identity

Status: DRAFT / SECURITY DECISION AND REVIEW CAPACITY HOLD. No writer, branch, worktree, port, Ready SHA, reviewer appointment or push authority.

Human owner and fixed-SHA acceptance reviewer: Kartik. Proposed author: verified GPT-6 Sol backend session. Fresh non-author Sol security review plus external Claude review are required.

## Result

Provide an approved sign-in/session-issuance path for worker and internal Operations actors. Define public applicant intake, identity verification and the audited transition to an active worker membership in a TNP-kind organization. The browser-selected demo persona is never an authenticated identity. Decide DEC-32 before Ready: email/phone method, invite versus self-apply, verification, abuse protection and recovery.

Implement explicit capability grants for verifier, worker_contact_view and Finance/payout work only after DEC-24/33: Main Admin grant/revoke authority, tenant scope, audit, revoked-session behavior and last-Main-Admin protection. The current membership has one role per tenant and ActorContext has no capability field. Either add a reviewed versioned grant model or an equivalent explicit capability source; do not equate organization_admin or platform_admin with private-data access.

## Proposed ownership

server/security/**, server/tenancy/**, server/data/**, server/audit/** and exact authentication/admin API paths, plus security tests and runbook. P supplies a narrow allowlist and migration contract before Ready. No frontend preview persona, production provider, real OTP/email service, private file upload, payout effect or deployment is owned unless a separate decision and lease explicitly add it.

## Acceptance

Active worker sessions can reach only own worker scope; Operations sessions reach only their TNP tenant and granted functions. Applicant status alone grants no worker membership. Forged role, tenant, capability, stale grant, revoked session, CSRF bypass, rate abuse and cross-user access fail. Session issuance/recovery and grant changes are audited. New indexes have query rationale and safe migration/rollback. External-provider activation remains separately gated. Fixed-SHA independent reviews and Kartik acceptance precede profile API dependency.
