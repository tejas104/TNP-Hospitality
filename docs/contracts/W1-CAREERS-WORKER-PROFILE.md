# W1 - Careers With Us, worker profile and Operations contract

Status: Draft, revised after independent Claude review on 2026-09-24. No writer lease, production collection or provider activation is granted.

## Names, routes and themes

Use "Careers With Us" for the public workforce entry and "Careers" where a shorter label is needed. Keep /freelancer as a compatibility route and preserve stored role keys. A shared role-key formatter displays Hostess as "Hostess/Welcome Girls" in public departments, opportunities, applications, Planner requests, Operations, reports and human-facing exports. Forms submit Hostess, not the display label. One canonical role-key catalogue feeds preview choices, later server validation and the formatter; adding a key is a reviewed shared-contract change. Exports use distinct roleKey and roleLabel columns; filenames never contain the slash.

The user confirms Teal/Beige as the main default theme and Gradient as the second selectable theme. Teal uses #008080, accessible hover #006b6b, ivory/beige #f5f1e7, champagne #bba879 and neutral text, with supporting accents. Shared site-wide application is the working scope; DEC-37 confirms exact gradient stops, accent mapping and final scope before UI Ready. Large surfaces may use gradients; text and controls remain on solid contrast-safe tokens. Theme choice stores no personal data, applies before first paint and does not change workflow, status meaning, focus or reduced-motion behavior.

## Identity prerequisite

The existing API exposes GET/DELETE session only; it does not issue sessions. A separate access foundation must define worker/Operations sign-in, applicant-to-worker promotion, active membership and capability grants. /workers/me requires an active worker membership in a TNP-kind organization; all IDs and tenant scope come from that session. The M5 /operations route is a synthetic admin console under components/tnp/portals/admin; the old Operations desk is absent. It cannot call real endpoints through its synthetic persona switcher. M5a remains labelled synthetic; M5b adopts the accepted real identity path only after the access foundation and profile API are integrated.

## Profile and field-access matrix

Normal own-profile fields: workerId, legalName, displayName, contact methods, serviceArea, roleKeys, skills, languages, experience, availability and profile revision. Emergency contact is excluded until DEC-35 defines necessity and viewers. Verification checklist and payout readiness are derived from their separate records.

| Actor and endpoint | Allowed fields | Disallowed fields | Export |
|---|---|---|---|
| Worker, /workers/me | Own normal profile and revision; own consent, document status, masked payout status via separate endpoints | Other workers; private document bytes in normal profile response | No bulk export |
| TNP Operations, /operations/workers list/detail | workerId, displayName, roleKey/roleLabel, serviceArea, skills, availability, staffing/onboarding status; consented approved portrait derivative | legalName, personal contact, identity files, bank values, passbook, private portrait original | Staffing columns only after scoped export contract |
| Scoped Operations contact action | Contact only for an authorized active assignment or a separately granted worker_contact_view capability, with access audit | Bulk contact list | No default contact export |
| Assigned TNP Planner | Event/grant-scoped assignment projection only: workerId, displayName, role label and approved portrait where allowed | Generic worker list, personal contact, identity/finance records | Event roster columns only after grant checks |
| Verifier capability in TNP organization | Document metadata and time-limited private content for assigned verification purpose; consent record; decision history | Bank destination unless separately granted | Document bytes never in normal export |
| Finance/payout capability | workerId, displayName, provider destination reference, masked display, status and version as needed for approved payout work | Identity files, exact account details in routine reads | Masked finance columns only |
| organization_admin or platform_admin without named capability | No private verification/bank fields; no cross-tenant bypass | Private files, exact destination, unrestricted worker list | No sensitive default export |

The authorization service must test exact response keys and list scope per role; omitted sensitive fields are not null-filled placeholders. Consent withdrawal can remove a portrait derivative while retaining an authorized historical audit record. Direct file reads/downloads need separate owner or verifier authorization and a read-access audit.

## Private document and payout states

Photo, identity evidence and passbook/bank evidence are separate document categories with owner, version, status, submitted/reviewed timestamps, reviewer and reason code. The requested Aadhaar upload is pending DEC-34; an unmasked upload must never be accepted merely because the UI asked for masking. Display missing, submitted, quarantined, rejected and verified separately. Upload is not verification.

Provisional upload bounds for review: portrait JPEG/PNG/WebP up to 5 MiB; documents PDF/JPEG/PNG up to 10 MiB. Validate content signatures, dimensions and decompression limits as appropriate; reject SVG, executable content and mismatched extensions. Stage privately, scan, then release. Re-encode portraits and strip EXIF/GPS. Downloads use server-generated filenames, Content-Disposition: attachment, no-store and short expiry. The final provider/type/device policy belongs to DEC-35.

Payout destination entry is server mediated and versioned. New versions remain pending through step-up, notice, provider verification, cooling and maker/checker policy. Snapshot the effective destination version at batch freeze. The current passbook request stays pending until DEC-28 determines whether the provider method needs the image. Routine reads are masked.

## Proposed API boundaries

- GET/PATCH /api/v1/workers/me: own normal profile; PATCH requires active worker identity, CSRF, If-Match revision and Idempotency-Key.
- GET /api/v1/workers/me/onboarding: own derived checklist and masked status.
- Private photo/document initiation, finalization, metadata and authorized download endpoints only after DEC-34/35 and accepted storage/scanning controls. Finalization requires document revision and Idempotency-Key.
- Payout destination proposal/confirmation endpoints only after DEC-28/36. Every mutation requires destination revision and Idempotency-Key.
- GET /api/v1/operations/workers and /{workerId}: TNP tenant staffing projection with bounded pagination; no generic admin bypass.
- Separate verifier and Finance endpoints after DEC-33/36 capability approval.

Each resource has its own revision stream: normal profile, each document, each payout destination. A verifier decision does not bump the normal profile revision. All writes require CSRF, server-side validation, tenant/ownership checks and audit; sensitive reads/downloads have read-access audit. Normal reads use no-store. Tests cover IDOR, forged role/tenant/worker IDs, stale revision, duplicate finalization, MIME and size rejection, revoked session, inactive membership, consent withdrawal, export column leakage and wrong-tenant access.

## Connected journey and release evidence

Authenticated worker edit -> persisted profile revision -> authorized admin-console staffing projection after refresh. Document submission -> quarantine/scan -> verifier decision -> derived checklist; ordinary Operations sees status only. Finance sees masked payout state only with capability. On switching from preview to server-backed mode, remove only the known personal-field preview draft keys and prove no real profile fields are written to web storage.

At 1440/1100/390/320 widths verify names, role labels, both themes, keyboard/touch/reduced motion and all states. M5a proves synthetic presentation; M5b proves real session/API/Operations behavior with synthetic test actors. Server tests prove persistence and authorization. Independent security review and provider/storage UAT are separate production gates.
