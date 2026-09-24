# W1 - Careers With Us, worker profile and Operations contract

Status: Draft, 2026-09-24. This contract records the user's requested product result. It grants no writer lease, production data collection, or provider activation.

## Product vocabulary and routes

- Public navigation, launcher, career pages, access chooser, worker-facing headings, and applicable Operations presentation say "Careers With Us" or "Careers" as context requires. Keep /freelancer as a working compatibility route and keep existing code/domain keys until a separate migration is reviewed.
- Display the role as "Hostess/Welcome Girls" everywhere the current Hostess role is shown to a person: public workforce content, applications, opportunity cards, Planner requests, Operations staffing/reports, and user-facing export headings. Preserve the Hostess value in records and tests. Historical free-text notes are not rewritten.
- The worker profile offers a gradient theme and a teal/beige theme. The selected theme affects the whole worker workspace, including profile, opportunities, applications, assignments, and state banners. Selection persists without storing private profile data in the browser.

## Worker profile

The authenticated profile covers legal/display name, contact methods, service area, role interests, skills/languages, experience, availability, emergency contact only if a reviewed operational need is established, consented portrait, verification checklist, and payout-onboarding status. Each field has clear editable/read-only ownership and missing/pending/rejected/approved states. Present a completion checklist that distinguishes submitted from verified. Never imply that uploading a file constitutes verified identity or an approved payout destination.

Photo, masked Aadhaar/offline identity evidence, and passbook/bank evidence are separate document categories with version, owner, status, submitted/reviewed timestamps, reason, and authorized reviewer. The desired final workflow includes upload, replacement, review, and private download. Live controls activate only when the storage, scanning, consent, role, and retention gate in ADR-0009 is accepted. Preview may show synthetic document-status examples only and must not accept real files or account digits.

Bank destination entry is server mediated and versioned. Mask account/VPA values on all routine reads. Show worker submission/validation state; Operations staffing view receives status only; Finance or a specifically granted verification capability gets the least data needed. A changed destination never redirects a previously frozen payout.

## Proposed API surface

- GET/PATCH /api/v1/workers/me: own normal profile, revision-checked mutations.
- GET /api/v1/workers/me/onboarding: own checklist and masked private status.
- POST /api/v1/workers/me/photo and /documents: staged upload initiation/finalization after the private-storage gate.
- GET /api/v1/workers/me/documents: own metadata; private content retrieval uses a separate authorized, expiring action.
- POST /api/v1/workers/me/payout-destinations: provider-mediated version creation after the payout-provider gate.
- GET /api/v1/operations/workers and /{workerId}: tenant-scoped staffing projections, excluding bank values and document bytes.
- GET /api/v1/operations/workers/{workerId}/verification: explicit verifier capability, audited.
- Finance destination review remains a separate capability and endpoint, not a property of generic admin role.

All protected writes require active server session, CSRF, input validation, revision or idempotency control, tenant/ownership checks, and audit. Client-supplied role, tenant, worker ID, or document key is never authority. Normal reads use no-store and bounded pagination. Tests must cover cross-worker and cross-tenant IDOR, role bypass, stale revision, repeated upload finalization, invalid MIME/content, oversized file, malicious filename, revoked session, and restricted download/export.

## Connected Operations journey

A worker edits a permitted field -> the server persists a new revision -> the worker sees the returned state -> Operations list/detail shows the same authorized projection after refresh. A document submission moves only its document state; verifier decision appends actor/time/reason and updates the worker checklist. Operations can review applications and staffing without receiving bank or identity content. Finance sees only an authorized masked payout status unless a separately reviewed action needs more.

## Frontend acceptance

At 1440, 1100, 390, and 320 widths: public rename, role display, both themes, keyboard/touch/reduced motion, profile edit/save/conflict/error/retry, upload status/error when enabled, and Operations projection. Refresh must preserve authoritative server state; switching preview identity must not expose another worker. Browser evidence uses synthetic data only. Server tests prove authorization and persistence separately. Production claims require live storage/provider/identity UAT and independent security review.
