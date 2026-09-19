# ADR-0007 — Admin catalogue, workforce confirmation, payouts and export boundaries

Status: Accepted product direction on 2026-09-19. Exact timing, privacy-retention, co-admin permission presets, payout onboarding and provider settings remain named implementation decisions.

## Context

TNP needs one Main Admin, multiple co-admins, an editable public catalogue, direct mixed-role Hospitality requests, event-scoped workforce supervision, freelancer reconfirmation and replacement, recurring freelancer payouts, timed RSVP access and broad business exports. These features cross identity, privacy, scheduling, finance and provider boundaries. Implementing them as browser-only state, a generic admin flag or one unrestricted notes/export surface would create false authority and data-leak risk.

## Decision

1. Keep one modular monolith and shared API/domain boundary. Add bounded catalogue/access, workforce coordination, notifications/jobs, attendance evidence, finance/payout, RSVP entitlement and export modules; do not move authority into React.
2. Represent one designated Main Admin with server-side capability administration. Co-admins are named users with explicit capability bundles and optional organization/event scope. Co-admin status never implies finance, provider, bank-data or security authority.
3. The editable public catalogue contains the four public families: Hospitality, TNP Planner, Venue and RSVP. Hospitality contains the approved workforce-role catalogue. Listings, images and indicative prices use draft/published/archived revisions; publication does not rewrite historical quotation, grant or assignment-rate snapshots.
4. Permit unauthenticated visitors to submit a multi-line request for any mix of Hospitality roles and other products without first creating an account or buying a TNP Planner. Account access is a separate Admin-approved invitation/approval lifecycle.
5. Separate the short external planner-business enquiry from the vetted TNP Planner application. An external planner may provide name, company, phone, email, optional GST and requirements without gaining TNP Planner authority.
6. One workforce request contains independently scoped role lines with quantity, schedule, location/reporting point and requirements. Applications do not reserve capacity. Only the single allocation service creates a schedule reservation and atomically validates eligibility, quantity, overlap, buffers, grant scope and idempotency.
7. A freelancer may apply to multiple future or non-overlapping opportunities. Once allocated, other overlapping applications become non-actionable and show a privacy-safe conflict state; unrelated applications remain active.
8. Store worker-facing instructions separately from internal staff notes. Planner instructions are limited to workers assigned to the Planner's active event/grant. Admin/co-admin access follows explicit scope and capability. Every revision and acknowledgement is audited.
9. Attendance location is point-in-time scan evidence, not continuous background tracking. The worker receives a foreground consent explanation; missing, denied, low-accuracy and outside-radius remain distinct. Exact coordinates are event-scoped, time-bounded and excluded from ordinary exports. The UI must say “attendance scan location,” not “live location.”
10. Separate initial assignment acceptance from pre-event reconfirmation. Durable jobs open the window, send idempotent reminders and expire unanswered assignments according to a versioned schedule. Expiry opens a replacement case; an authorized Admin/co-admin approves the replacement through the same allocation service. Browser sound is optional feedback, never the sole delivery mechanism.
11. Every authenticated role may maintain a profile image through a reviewed upload/media boundary. File validation, storage, consent, moderation and visibility are separate from the public catalogue.
12. Freelancer payout details stay server-side. Prefer provider destination identifiers and masked display over routinely stored plaintext bank/VPA data. Destination changes create a new verified version and cannot redirect a frozen payout.
13. Freelancer payouts use immutable attendance-derived earning entries, a monthly payable, maker/checker approval, a frozen batch, one logical payout instruction, provider attempts, webhook receipts, append-only ledger entries and reconciliation cases. Money remains integer paise. Browser code never calls Razorpay directly.
14. RSVP commercial payment, entitlement, event grant and WhatsApp provider readiness remain separate. TNP may operate a TNP-owned sender so clients do not need Meta access. A vendor-branded sender is a separate assisted onboarding path and cannot be promised without provider verification.
15. “Everything exportable” means authorized business records, not secrets or unrestricted personal data. Support CSV and XLSX for operational data, PDF for human-readable reports/statements, JSON for privileged integrations and ZIP manifests for approved bulk packages. Every export is tenant/event/role filtered, audited, revisioned, formula-safe and downloaded through an expiring private link.
16. The release remains responsive web, with first-class support for current Android and iOS browsers. Important public, access and workspace routes must achieve a repeatable mobile Lighthouse performance score above 80 (minimum passing integer score 81) on a production-like build and must retain usable keyboard/touch, reduced-motion and low-capability fallbacks. This is not authorization for native Android/iOS applications.
17. Official invoices and payment receipts require print-ready and PDF-ready document views with immutable identity/version, legal/business fields supplied by the approved commercial contract, accessible HTML, A4 print styling, page-break control and no interactive/navigation chrome. A browser preview cannot issue an official invoice or receipt.

## Alternatives

- **One unrestricted admin role:** rejected because catalogue, workforce, finance, security and provider permissions have different risks.
- **Continuous web location tracking after a scan:** rejected because responsive web cannot truthfully guarantee background monitoring and it exceeds the stated attendance purpose.
- **One free-text notes field:** rejected because internal notes and worker-visible instructions have different audiences and retention.
- **Block all other applications as soon as a freelancer applies:** rejected because an application is not a reservation and non-overlapping future work must remain possible.
- **Direct Razorpay calls from the Admin browser:** rejected because secrets, approval, idempotency, webhook verification and reconciliation require a trusted server boundary.
- **Give every RSVP vendor Meta/provider access:** rejected as the default because the required customer experience is TNP-managed and low friction.
- **Unfiltered “export all” downloads:** rejected because it would leak bank, guest, location, audit or cross-tenant data.

## Consequences

- The frontend may build truthful synthetic states before backend modules exist, but must label unsupported delivery, location and payout behavior.
- Co-admin, notes, location, confirmation, replacement, payout and export pages require reviewed API contracts before production claims.
- Exact reconfirmation timing, overlap buffers, location retention, payout onboarding choice, maker/checker policy and RSVP grace periods remain explicit decisions rather than hidden defaults.
- Mobile Lighthouse budgets, representative devices/routes and CI variance need a recorded measurement profile; the score is measured evidence, not a hand-tuned screenshot claim.
- Homepage work remains last. The new public request, access and workspace pages can proceed in bounded milestones after the current visual/shared prerequisites clear.

## Evidence and linked specifications

- `docs/ADMIN-WORKFORCE-PAYOUTS-EXPANSION.md`
- `docs/PLATFORM-USAGE-WORKFLOW-BLUEPRINT.md`
- `docs/DOMAIN-RULES.md`
- `docs/RSVP-SERVICE-BLUEPRINT.md`
- `docs/architecture/decisions/ADR-0004-tnp-products-planner-rsvp-quote-and-payout-model.md`
- `docs/architecture/decisions/ADR-0006-commercial-planning-boundary.md`
