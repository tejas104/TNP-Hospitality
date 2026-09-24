# ADR-0009: Worker profile and private document boundary

Status: Proposed, revised after independent Claude Draft review on 2026-09-24. The user's requested product scope is recorded; DEC-32 through DEC-37 remain pending. This ADR does not authorize real collection or a writer lease.

## Boundary and sequence

"Careers With Us" is the human-facing workforce journey. /freelancer and internal worker/freelancer keys stay compatible. The visible role label is "Hostess/Welcome Girls"; the stored role key remains Hostess. One shared formatter covers public content, forms, staffing views and export display columns, while machine fields keep the key.

The implementation depends on independent review, product disposition and integration of the Claude-authored client-demo M5 code tip 15502c3 (handoff-doc tip 42ada80). The earlier aggregate is an ancestor, not a separate frontend review target. After the shared site-theme foundation, Careers presentation M5a can deliver copy and synthetic states; the identity/capability foundation and worker-profile API precede server-backed Careers/admin-console adoption M5b. Private documents and payout onboarding are a later sensitive milestone. The two waiting reviews remain M5 frontend and RSVP backend until one closes.

The current server can validate an existing session but has no worker/Operations sign-in or session-issuing route. /operations remains a synthetic preview. A browser-selected preview persona never authorizes a worker request. The access foundation must establish server-owned worker and Operations identity, active worker membership in a TNP-kind organization, applicant promotion and scoped grants before /workers/me or private Operations endpoints are live.

The existing /operations route in the M5 candidate renders components/tnp/portals/admin/AdminConsole.tsx; the older portals/operations desk was deleted. Any worker projection adopts the admin console through an exact leased seam after M5 integration. A normal worker profile, verification records and payout destinations are separate tenant-scoped records with independent revisions. Every read/write derives organization and user from the session. Staffing projections use an explicit field matrix in W1; generic admin and platform roles receive no implicit bank, document or cross-tenant access. Verification and Finance are separate capability decisions under DEC-33. A worker-profile edit cannot conflict merely because a verifier changed a document state.

## Theme boundary

The user confirms Teal/Beige as the main and default theme, with supporting accents, and Gradient as the second selectable theme. Site-wide coverage is the working scope; exact gradient stops, accent mapping and final scope remain under DEC-37. Shared semantic tokens should make public pages and workspaces consistent if site-wide is accepted. Large gradient surfaces may vary; text and controls retain solid contrast-safe surfaces. Theme preference alone may use browser storage and must apply before first paint without storing personal data. The existing admin-console palette is an adoption target, not a third theme.

## Private files and consent

Private object storage holds staged files; MongoDB holds only metadata and object references. Uploads are quarantined until content inspection and malware scanning pass. Contracted MIME allowlists, size caps, portrait re-encoding/EXIF stripping, generated download filenames, attachment disposition, no-store responses, object ownership, short-lived access and audit are required. A public portrait derivative needs separate consent and approval. Revoked sessions, inactive memberships, withdrawn relevant consent and document deletion each have defined, separate effects. No bank or identity file enters preview state, web storage, fixtures, logs, a public CDN or a routine Operations view.

Consent records need purpose, exact text/version, actor, timestamp, withdrawal and affected data. Retention/deletion distinguishes profile/document copies from required financial and audit history. DEC-35 must approve policy and provider before real files. In server-backed mode, existing browser-local application drafts containing personal fields are removed by a scoped migration; only non-sensitive theme preference remains in web storage.

## Payout destination

A new destination is a new version, initially pending. It cannot receive a payout before step-up re-authentication, approved separate-channel notice, provider verification, applicable cooling period and maker/checker decision under DEC-28/DEC-36. The effective destination version is snapshotted when a payout batch freezes. Frozen payout instructions are never redirected by a later profile change. Routine reads expose only provider reference, masked display and status. Passbook images and exact account values have a separate, restricted boundary.

## Aadhaar

The user's requested Aadhaar evidence remains a pending product path. No current screen accepts an Aadhaar scan. DEC-34 must record why Aadhaar is necessary and choose offline/QR verification that retains no full number, a proven server-masked upload path that rejects unmasked files without logging OCR text, or an alternate document. Merely instructing a worker to mask a card is insufficient. The applicable UIDAI/privacy requirements need owner review before activation; the requesting-entity rules must not be assumed to apply to every workflow. Primary references: https://uidai.gov.in/images/Circular-No.14_of-2025.pdf and https://uidai.gov.in/en/921-faqs/aadhaar-online.

## Audit and integrity

Profile PATCH, upload finalization, verifier decisions and payout changes require both an Idempotency-Key and an expected resource revision. Profile, document and destination revisions are separate. Sensitive read/download audit records have request ID, actor, purpose, target, outcome and time without file contents or exact account/identity values. The current mutation-oriented audit model requires a reviewed extension rather than treating read events as fake mutations. Tenant-scoped indexes and migration/rollback evidence are required.

## Gate

ADR acceptance requires DEC-32 through DEC-36 decisions, the approved field matrix, private storage/scanning and payout-provider design, independent security/data review and Kartik acceptance. Until those gates close, upload and bank submission fail closed. M5a remains a labelled synthetic UI milestone.
