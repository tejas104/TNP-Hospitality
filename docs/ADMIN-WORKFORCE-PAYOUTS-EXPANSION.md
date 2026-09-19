# Admin, workforce coordination, payout, RSVP entitlement and export expansion

Status: Canonical product expansion recorded 2026-09-19. This document defines the page and contract target; it does not claim the current frontend has production auth, location, notification, payment or provider behavior.

## 1. Plain-language product outcome

TNP should feel simple to customers and powerful to its team:

- A visitor sees four choices: **Hospitality**, **Planner**, **Venue** and **RSVP**.
- Hospitality contains every approved workforce role. One request can ask for several roles and quantities, such as hostesses and porters, without requiring a TNP Planner.
- A customer can submit a request before login. TNP reviews it, issues the official quotation and can later approve/invite that customer into a workspace.
- An external event planner gets a very short “Tell us what you need” form. This is separate from applying to become a vetted TNP Planner.
- One Main Admin controls security and delegation. Named co-admins receive only the permissions and event/organization scope they need.
- Admin can maintain services, workforce roles, venues, Planner/partner listings, images and public price presentation through reviewed draft/publish states.
- TNP Planners coordinate only their granted events. Freelancers can apply broadly, receive instructions, reconfirm assignments, record attendance and see earnings/payout states.
- RSVP customers use TNP, not Meta, for daily work. TNP controls the provider connection unless a separately approved branded-sender onboarding is purchased.
- The same responsive web product works well in current Android and iOS browsers. Native Android/iOS apps remain a later separately funded phase.

## 2. Actor and authority model

| Actor | Product scope |
|---|---|
| Visitor | Browse the four products and submit a request without private workspace access. |
| Client applicant | Submit a request and request access; see a reference and honest pending state. |
| Approved Client | Own authorized events, requests, quotations, grants, documents and profile image. |
| External planner business | Submit the short business enquiry and later receive only invited Client/event scope. |
| TNP Planner candidate | Apply for the vetted TNP role; submission grants no workspace authority. |
| Assigned TNP Planner | Coordinate resources, instructions and attendance evidence only for an active event/grant. |
| Freelancer | Manage own profile, applications, assignments, instructions, attendance, bank onboarding and statements. |
| Co-admin | Exercise named capabilities such as catalogue publishing, staffing or attendance within assigned scope. |
| Main Admin | Manage co-admin lifecycle/capabilities, security boundaries and all otherwise-authorized operations. |
| Finance maker/approver | Prepare or approve payout batches; these must be distinct capabilities even if one person holds another role. |
| RSVP vendor/team | Use only purchased/active organization and event entitlements. |

No one shares the Main Admin login. The last active Main Admin cannot be removed without a separately reviewed recovery/transfer procedure. Permission and beneficiary changes require reasoned audit and step-up authentication in production.

## 3. Public request and account-access journeys

### Four-product entry

The public services page offers Hospitality, Planner, Venue and RSVP with plain-language outcomes, inclusions, exclusions and one next action. Hospitality expands into role pages and a mixed-role request builder.

### Direct mixed-role request

A `PublicEnquiry` contains one or more `RequestLine` records:

- product/role code and human label;
- quantity;
- date, start/end time and timezone;
- event/venue or reporting location;
- skills, uniform, language and operational requirements;
- whether the customer already has a planner or wants a TNP Planner.

Submission creates a reference, not a booking, quote, payment or assignment. Admin may ask for clarification and separately issue an official quotation.

### External planner business intake

The first step asks only for name, company, phone, email, optional GST and required products: Hospitality, RSVP and Venue. Conditional details appear only after a product is chosen. No account or document upload is required before initial submission. A separate route and explanation handles `Apply to become a TNP Planner`.

### Client access

Anonymous enquiries and account access remain separate. Admin may approve an invitation after identity/contact checks and link it to the enquiry/organization. The requester sees pending, approved, declined or expired invitation states without account-enumeration details.

## 4. Editable catalogue and media

Core records:

- `ServiceCategory` and `ServiceOffering`;
- `WorkforceRole`;
- `VenueProfile`;
- `TNPPlannerProfile` and `PartnerProfile`;
- `MediaAsset` with alt text, rights/source, crop/order and fallback;
- `PriceDisplay` with currency, amount/range, unit, qualifier and validity;
- immutable `PublicationRevision`.

Admin/co-admin editors use `draft → in_review → published → archived`. Public pages read only the active published revision. Published prices are descriptive unless a reviewed contract marks them fixed; official quotation and assignment-rate snapshots remain immutable when catalogue content changes.

## 5. Workforce applications, allocation and conflicts

One event workforce request contains multiple role lines. Each line becomes a position group with its own quantity and shift.

Applications: `applied → shortlisted → allocation_pending → selected | not_selected | withdrawn | expired | conflict_flagged`.

- Applying does not reserve time or capacity.
- A freelancer may apply for tomorrow and any other non-overlapping event.
- Allocation is the only reservation step and must serialize worker schedule plus position capacity.
- After successful allocation, overlapping applications show `Selected for another event` to authorized users without exposing the other customer's private details.
- Non-overlapping applications remain active.
- Replacement uses the same allocation service. Failure preserves the original valid state and never overfills a role.

Setup/travel buffers, overnight intervals and same-day shift rules remain a named policy decision.

## 6. Instructions and notes

Do not use one unrestricted notes box.

- `WorkerInstruction`: worker-facing, versioned, event/assignment scoped, authored and time-stamped.
- `TeamInstruction`: event-team or role-team audience.
- `WorkforceAnnouncement`: privileged Admin audience selection.
- `InternalWorkerNote`: staff-only and never visible to workers or Planners.

A TNP Planner may publish instructions only to assigned workers in an active granted event. Admin/co-admin access follows capability and scope. Read/acknowledged is recorded separately and never treated as proof that an instruction was followed. Notes must not contain bank data, identity documents, exact home addresses or hidden disciplinary decisions.

## 7. Reconfirmation, reminders and replacement

Initial offer acceptance and pre-event reconfirmation are different state machines.

`allocated → offer_pending → accepted | declined | offer_expired`

`accepted → reconfirmation_scheduled → response_required → confirmed | declined | expired_nonresponse`

`expired_nonresponse → replacement_required → candidate_proposed → approval_pending → allocated | rejected | unresolved_shortage`

The current preview assumption is: reconfirmation is due at T−3 hours; unanswered reminders repeat every ten minutes during the configured reminder window; at the configured cutoff the assignment expires, the freelancer receives cancellation notice and Admin opens/approves a replacement. The exact interpretation of “before two hours,” event timezone and exception rules must be confirmed before production.

Durable jobs carry assignment and schedule version. Confirmation and expiry race on one aggregate revision; only one wins. Rescheduling invalidates old jobs. Notification delivery/read never counts as confirmation.

Audible browser alerts require an opt-in sound toggle/test and cannot be guaranteed while a tab/device is blocked, muted or offline. Use persistent in-app urgency plus approved push/WhatsApp/SMS/email fallbacks and a delivery-failure queue.

## 8. Attendance scan location

Attendance uses an authenticated assigned worker, an event-bound short-lived token/pass and a consumed scan nonce. The server validates event/assignment and derives inside/outside status; client claims are never authoritative.

Evidence states: `recorded`, `gps_missing`, `gps_denied`, `low_accuracy`, `outside_radius`, `suspicious`.

Store capture time, server receive time, accuracy and evidence state. Admin/co-admin with the location capability and the assigned TNP Planner may view the latest point-in-time scan for that event. The product must never label it continuous or live monitoring. Exact coordinates are visible only for a bounded operational window, audited on access and omitted from normal exports; later records should retain a minimized status unless a reviewed retention policy requires more.

## 9. Profile image and bank onboarding

Every authenticated user may upload a profile image. Production upload requires file-type/size validation, private staging, malware checks, consent, crop/fallback, object-storage authorization and per-surface visibility rules.

Freelancer payout onboarding supports bank account and/or VPA only after the provider decision. The server sends the data to the payout adapter, retains provider destination IDs plus masked display and validation state, and avoids plaintext destination values in routine storage/logs. A change creates a new version, not an overwrite, and cannot redirect a frozen payout.

## 10. Razorpay payout model

Recommended records:

- `FreelancerPayoutProfile` and versioned `PayoutDestination`;
- immutable attendance-derived `EarningEntry`;
- unique worker/month/currency `MonthlyPayable`;
- immutable-after-processing `PayoutBatch`;
- one logical `PayoutInstruction` per approved payable revision;
- `ProviderPayoutAttempt`, `WebhookEventReceipt`, append-only `MoneyLedgerEntry` and `ReconciliationCase`.

Flow: verified attendance → payable calculation → Operations review → Finance approval → maker creates batch → authorized releaser confirms → transaction persists instruction/ledger/outbox → worker sends Razorpay request → verified webhooks update attempts → reconciliation resolves timeouts, long-processing, reversals and mismatches.

Use one internal logical key and one provider idempotency key per attempt. Lost-response retries reuse the same provider key. A processed payout may later reverse, so reconciliation and append-only corrections remain mandatory. TNP's internal maker/checker approval remains authoritative even if provider-side approvals become available.

## 11. RSVP timed entitlement without Meta friction

Keep quotation, collection, entitlement, event grant and WhatsApp readiness separate.

`pending_conditions → scheduled → active → suspended | grace_read_only → expired/completed | revoked`

Admin sets service start/end as UTC instants plus named event timezone, event/user/guest/message/export limits, team capabilities and sender mode. Every import, campaign, send, reply mutation, team change and export rechecks organization, event and entitlement. Queued sends recheck again at execution time.

Default experience: TNP owns the WhatsApp provider connection, number(s), credentials and template process; vendor users sign in only to TNP. A vendor-branded number/display name is separate assisted onboarding and may require provider/business steps.

## 12. Export model

Supported target formats:

- CSV for portable row data;
- XLSX for typed multi-sheet business workbooks;
- PDF for branded reports, quotations and statements;
- JSON for privileged integrations/admin use;
- ZIP plus manifest for approved bulk packages.

Every export records organization, event, filters, timezone, generated time, exporter, row count, schema/revision and content hash. Large exports run in background, store privately and use short-lived signed downloads. Authorization is checked both when requesting and downloading.

Exports use role/tenant/event/column allowlists, redact exact location and full bank/VPA data, neutralize spreadsheet formulas and executable links/macros, and audit reason, recipient, downloads, expiry and deletion. Revoked members and expired links cannot download old files.

### Printable invoices and receipts

Official invoice and receipt pages use semantic HTML and a dedicated print stylesheet rather than printing the dashboard. Each document includes a stable document number, version/status, issue/payment timestamps, issuer and billing identity, order/quotation references, line items, integer-paise totals, tax fields only when approved, payment method/reference in safe masked form and correction/cancellation history where applicable.

Print acceptance:

- clean A4 output with predictable margins, repeated table headers and controlled page breaks;
- no sidebar, navigation, buttons, demo controls, shadows or clipped overflow;
- black/neutral text with sufficient contrast and no colour-only status meaning;
- visible `DRAFT`, `SAMPLE`, `CANCELLED` or `VOID` watermark when applicable;
- browser print and generated PDF preserve the same document/version identity;
- print action is unavailable until an authoritative invoice/receipt record exists.

## 13. Android, iOS and mobile performance

The current release is responsive web, tested in current Chrome on Android and Safari on iOS-sized viewports and interaction constraints. It must account for safe-area insets, dynamic viewport height, touch targets, virtual keyboards, date/time inputs, sticky controls, reduced motion, low memory and blocked autoplay/notification permissions.

For representative public, access, Client, Planner, Freelancer, RSVP and Admin entry/task routes, the production-like build must record mobile Lighthouse performance above 80 (minimum passing integer score 81). Accessibility and best-practices categories should target at least 90; SEO applies only to public routes. Record the exact build SHA, route, Lighthouse version/profile and median of three comparable cold runs. Measure before and after material animation, image, font, bundle or data-list changes. Separately verify real Android Chrome and iOS Safari behavior because Lighthouse emulation is not iOS proof.

Performance budgets should favor route-level code splitting, responsive image sizes/formats, font restraint, bounded animation, virtualized/paginated large lists, skeletons that do not cause layout shift and no provider SDK in the initial bundle unless that route needs it. Mobile fallbacks must remain fully functional when WebGL, motion, push, location or sound is unavailable.

## 14. Frontend page map, excluding the homepage

### Public and access

- Services overview with four choices.
- Hospitality overview and individual role detail pages.
- Mixed-role request wizard and reference/next-steps receipt.
- External planner “Tell us what you need” flow.
- Separate TNP Planner application/explanation.
- Client access request, pending, approved, declined and invitation-expired pages.
- Shared sign-in and role-aware profile/photo settings.

### Operations

- Command centre and attention queues.
- Catalogue: services, roles, venues, TNP Planners, partners, media, prices and revisions.
- Client access approvals and co-admin capabilities.
- Events, multi-role requests, applicants, staffing, conflicts and replacements.
- Confirmation/reminder centre and notification failures.
- Attendance scan evidence and correction queue.
- Worker instructions/internal notes.
- RSVP vendor entitlements, event grants and usage.
- Monthly payables, batches, provider attempts and reconciliation.
- Reports/export centre and audit.

### TNP Planner

- Assigned events/grants, workforce lines, eligible applicants and roster.
- Privacy-safe conflict state, instruction composer and acknowledgement status.
- Reconfirmation/attendance board with point-in-time scan evidence.
- Replacement proposal and Admin approval status.

### Freelancer

- Profile/photo and payout-destination setup.
- Opportunity feed permitting multiple applications.
- Assignments, reconfirmation countdown and notification settings.
- Instruction inbox, attendance scan, earnings, statements and payout history.

## 15. Bounded frontend milestones

1. `TNP-PUBLIC-REQUEST-ACCESS-M3`: public four-product discovery, mixed-role enquiry, external planner intake and access-pending flows.
2. `TNP-ADMIN-CATALOG-ACCESS-M4`: Astra/medium catalogue/publishing, Client access, co-admin capability presentation and mobile Admin shell.
3. `TNP-WORKFORCE-COORDINATION-M4`: staffing conflicts, instructions, reconfirmation, replacement and attendance-evidence surfaces.
4. `TNP-FINANCE-PAYOUTS-M4`: payout onboarding, monthly payables, approvals, attempts, reconciliation and print-ready invoice/receipt presentation.
5. Existing corrected Client/Planner, Freelancer and RSVP tasks consume these contracts in their owned routes.

All remain synthetic frontend milestones until reviewed APIs, durable jobs, private storage and provider adapters exist. Homepage refinement remains last.

## 16. Decisions still required before production

- Exact co-admin capability presets, scopes and Main Admin recovery/transfer.
- Catalogue publication approval and whether displayed prices are indicative or fixed.
- Setup/travel buffers, overnight/same-day overlap rules.
- Exact T−3/T−2 reminder/cutoff interpretation, fallback channels and quiet-hours policy.
- Exact location precision, operational window, retention and consent text.
- Direct Razorpay Fund Account, Payout Link or mixed onboarding; validation and destination-change cooling.
- Maker/checker actors, payout calendar/cutoff, deductions/tax, retry and reversal policy.
- RSVP service/grace dates, limits, shared sender versus branded onboarding and late-reply handling.
- Exact export formats/columns/recipients/retention per module.
- Supported minimum Android/iOS browser versions, representative mobile devices and the agreed Lighthouse CI profile.
- Invoice/receipt issuer fields, numbering, tax/GST treatment, signatures, branding, correction/credit-note and retention rules.
