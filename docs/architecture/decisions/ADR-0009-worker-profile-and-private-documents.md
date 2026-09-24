# ADR-0009: Worker profile and private document boundary

Status: Proposed on 2026-09-24. Product direction is confirmed by the user; storage, Aadhaar method, retention, and payout-provider choices still require Kartik/security review before live collection.

## Decision

The public workforce journey is labelled "Careers With Us". The existing /freelancer route and internal worker/freelancer identifiers remain compatible during migration. "Hostess/Welcome Girls" is the visible role name; the existing Hostess value remains a stable domain key until a separately reviewed data migration. Existing assignments, reports, filters, and exports must display the new label through one shared formatter.

A worker owns one authenticated profile. The server derives the worker ID from the active session, never from a browser-selected demo persona or a submitted worker ID. The normal profile contains contact and experience fields, role interests, service area, availability, consented portrait status, and onboarding state. Verification documents and payout destinations are separate private records. A worker can see their own masked status; Operations sees only the fields needed for staffing. Privileged verification and Finance capabilities are distinct from ordinary Operations access.

The two selectable workforce themes are (1) a restrained gradient treatment and (2) teal #008080 with beige/ivory support. Theme preference contains no private data and may be kept in browser storage until an authenticated preference API is available. Both themes keep semantic tokens, accessible contrast, keyboard focus, reduced-motion behavior, and identical task flows.

Photos and documents use private staged object storage, content sniffing, strict size/type limits, malware scanning, per-object ownership, audit, short-lived authorized download, and explicit retention/deletion. MongoDB stores metadata and object references, not file bytes. A public portrait derivative requires a separate consent and approval state. No identity or bank file enters the shared synthetic preview envelope, localStorage, sessionStorage, source fixtures, logs, public CDN, or a normal Operations list.

Payout onboarding is versioned. Routine reads return provider destination reference, masked display, verification state, and effective version only. A destination change cannot rewrite a frozen payout. Exact account values and passbook images are not exposed to planners or ordinary co-admins. A provider-backed beneficiary method and private file store must be selected before real account or passbook collection.

For Aadhaar, prefer a reviewed masked or offline-verification path that does not retain a full Aadhaar number. The UI must not invite an unmasked scan into the current preview. The exact verification method, consent text, authorized storage, access, and retention need a recorded decision before activation. UIDAI guidance distinguishes Aadhaar authentication/requesting-entity storage from offline verification; the team must review the applicable path rather than assume ordinary object storage is sufficient.

## Architecture

Browser -> session/CSRF-protected API -> worker profile service -> tenant-scoped Mongo metadata.
Private upload -> staged object -> validation/scanning -> document metadata -> restricted reviewer access.
Payout onboarding -> server payout adapter -> versioned masked destination metadata.
Operations worker view -> role/capability checks -> staffing projection; privileged verification/Finance views use separate endpoints.

One worker profile revision supports optimistic conflict rejection and append-only audit of sensitive changes. Every list/detail/download rechecks tenant, role, capability, and record ownership. No public reference ID grants document access. Protected downloads use no-store responses and short expiry. Revocation makes later reads fail.

## Gate

This ADR becomes Accepted only after the selected storage/provider and Aadhaar/retention policy are recorded and independently reviewed. Until then, real upload and bank submission endpoints fail closed. Existing labelled synthetic preview remains synthetic. See W1-CAREERS-WORKER-PROFILE and the two Draft implementation tasks.
