# Domain rules and pending business decisions

## Required invariants
- Server derives identity and enforces role plus ownership/event scope. Reference IDs alone do not grant private access.
- Keep client-appointed planner membership distinct from the approved TNP Planner role. A client representative cannot acquire TNP Planner allocation authority by choosing a label in the browser.
- Every paid TNP product begins as an order line. Only authorized Admin/Operations actors issue or revise official quotation versions and grant fulfillment scope. The requesting actor and billing organization may differ, but both are explicit and auditable.
- A TNP Planner may select/assign venue and workforce only for an assigned event and within the active Admin grant. Allocation still uses the single allocation service; a grant does not bypass eligibility, capacity, overlap or audit.
- Only eligible approved workers claim valid positions. Capacity, assignment, rate snapshot and overlap reservation must stay consistent under concurrency/retries.
- One allocation service handles worker claims and admin assignment. Admin override must not silently overfill. H2 owns implementation; H1 reviews and both approve contracts.
- Production claim acceptance requires 20 concurrent requests on 10 slots -> exactly 10 assignments, then 500 on 10 -> exactly 10; duplicate requests and simultaneous overlapping events must remain safe.
- Distinguish initial assignment acceptance from attendance reconfirmation. Expiry/confirm/decline/replacement races must preserve capacity and audit.
- Publishing Positions enters staffing and produces opportunity notifications only for active eligible freelancers whose role, availability, rating and location permit the opportunity. This is not an unrestricted broadcast of event details to every account. Assigned freelancers separately receive the configurable pre-event Coming/Not Coming prompt; expiry/nonresponse flags replacement without silently changing capacity.
- Production notifications require server-owned audience selection, durable at-least-once jobs, idempotent per-recipient delivery, retries/backoff, deduplication, failure/dead-letter visibility, device-token lifecycle and authorization-safe payloads. A feed badge or browser-only toast is not delivery proof.
- Attendance requires eligible assignment, authorized event-scoped TL/coordinator, valid event token/code and server evidence. GPS denial is recorded as missing, never valid; the PDF requires a missing-GPS check-in path.
- Corrections preserve original attendance evidence and append reason/actor/time. Never display an unsaved action as persisted.
- Earnings derive from verified attendance and an agreed rate snapshot. Adjustments require reasons. TL/coordinator then Finance approvals are explicit.
- Integer paise throughout money paths; no floating-point amount storage. Collections and payouts have separate ledgers.
- One logical worker/month payable; provider attempts and uncertain/failed/reversed states must reconcile safely. A provider reference alone is not final success. Duplicate/restarted requests cannot pay twice.
- Sensitive approvals, allocation changes, rates, account decisions, corrections and money events need audit trails.
- Three consecutive poor ratings trigger human review. Permanent deactivation is a human decision; no automatic irreversible policy is approved.
- TNP Planner ratings and Event Coordinator ratings are assignment/event scoped. Event Coordinators may rate only client-approved lower-level roles assigned to their coordinated event; no self, unrelated-event or unrestricted subordinate rating.
- Freelancer monthly earnings derive from verified attendance-day entries and immutable assignment day-rate snapshots within a defined calendar-month timezone. Event count alone is not pay, and the same payable entry cannot be included twice.
- RSVP communication is WhatsApp message only; no phone/mobile calling workflow is part of the product.
- RSVP travel, pickup/drop and stay values are collected information, not evidence of a ticket/room/vehicle booking, dispatch or payment. The original guest message remains evidence; categorization never overwrites it.
- RSVP organization dashboards may aggregate attention counts across events, but guest/message/information reads and writes remain explicitly event scoped. Event switching cannot retain or expose another event's selected guest or report.

## Pending decision register
No entry below is approved merely because a source proposed a default. H1 collects client decisions; H2 supplies operational implications. Dates use relative days until kickoff is agreed.

| ID | Question / source tension | Owner | Needed by / blocked work |
|---|---|---|---|
| DEC-01 | RSVP is confirmed as a sellable vendor/TNP multi-event, WhatsApp-message and information-collection product. Calling, booking, room/vehicle allocation, dispatch and RSVP payment processing are excluded. Detailed attachment/access/retention, provider, categorization and message cadence approval remain pending; see RSVP-SERVICE-BLUEPRINT.md | Anjaneya + Kartik + client | Before RSVP implementation contracts and real guest onboarding |
| DEC-02 | Initial acceptance versus T−2h reconfirmation, T−1h expiry, cancellations and late replacements; configurable windows proposed | Kartik + client | Before allocation/jobs contract |
| DEC-03 | Setup/travel buffers, midnight intervals and overlap reservations before final confirmation | Kartik + client | Before allocation |
| DEC-04 | Daily attendance-based pay is confirmed as the base direction; define partial/overnight day, same-date multiple assignment, missing checkout, overtime, lateness and cancellation adjustments | Kartik + client | Before earnings |
| DEC-05 | Day-rate position/worker/default precedence and effective date/snapshot timing | Kartik + client | Before assignment/rates |
| DEC-06 | Monthly timezone/cutoff, late approvals, uncertain payout/reversal and reconciliation process | Kartik + client | Before finance |
| DEC-07 | Poor-rating threshold, chronological ordering, corrections/appeal and under-review eligibility | Kartik + client | Before rating/eligibility |
| DEC-08 | Outside-radius handling, reason/review; missing GPS must remain distinct | Kartik + client | Before attendance |
| DEC-09 | Invoice entity/template, deposits, revisions, refunds and collection allocation | Anjaneya + Kartik + client | Before quotes/collections |
| DEC-10 | Venue CSV, permission editor, profitability/report depth and public content/motion reductions proposed historically | Anjaneya + client | Day 1 scope forecast |
| DEC-11 | Supplied public copy, three service pages/twelve departments, TNP images, invoice assets | Anjaneya + client | Day 2 content; F01/F02/F16 |
| DEC-12 | Provider activation and restricted launch alternatives for KYC/OTP/payments/payouts | Kartik + client | Test access Day 5; live decision Day 15 |
| DEC-13 | Production hosting/build route, auth, API tooling, jobs, private storage/restore | Kartik + Anjaneya | Architecture task before backend build |
| DEC-17 | Product catalogue naming/scope, TNP Planner experience approval, client-appointed planner permissions and independent product prerequisites | Anjaneya + Kartik + client | Before corrected Client/Planner contracts |
| DEC-18 | Admin quotation authority, billing-party selection, quote expiry/deposit and grant conditions | Anjaneya + Kartik + client | Before order/quotation implementation |
| DEC-19 | Planner assignment limits inside a grant; venue selection/hold rules; allocation exception authority | Kartik + client | Before Planner resource assignment |
| DEC-20 | Rating hierarchy, dimensions, weighting, dispute/publication and eligibility effect | Kartik + client | Before production ratings |
| DEC-21 | Payable-day definition, same-date multiple assignments, partial/overnight/overtime/cancellation, cutoff timezone and payout date | Kartik + client | Before production monthly earnings |
| DEC-22 | RSVP structured reply categories, auto-suggestion versus mandatory human confirmation, ambiguous/free-text handling and original-message retention | Kartik + client | Before reply interpretation |
| DEC-23 | RSVP all-events daily metrics, per-event workspace lifecycle, archive/retention and expected concurrent event/message volume | Kartik + client | Before multi-event production scale |

Record actual decisions with evidence in decisions/CLIENT-DECISIONS.md. Pending policy may be represented as labelled scenario assumptions in preview fixtures, never silently used as production authority.


## Explicit integrity requirements retained from scope evidence
- Uniqueness must be enforced for one earning per assignment and one payable per worker/month; deduplicate provider events for collections as well as payouts.
- Serialize competing allocation writes on a worker reservation (or an equivalently proven conflict mechanism). A transactional read of "no overlap" alone is not enough. One allocation path enforces capacity, overlap and replacement; the preview simulates these outcomes but does not prove server concurrency safety.
- Pay calculation uses one effective attendance result while retaining all original evidence and corrections. Reject wrong-event, expired and duplicate scan effects; a replay must not create another attendance/earning.
- Once payout batch processing begins, the batch cannot be edited. Resolve uncertain outcomes by reconciliation before another money effect.

## Additional pending policy questions
DEC-14 (Kartik + client, before identity/authorization): may one person hold multiple roles; which combinations/scopes are allowed?
DEC-15 (Anjaneya + Kartik + client, before quotes/earnings/payables): GST/TDS applicability, invoice entity, gross/deductions/net presentation, withholding responsibility and rounding. No tax rates or legal treatment are approved here.
DEC-16 (Kartik + client, before approval/ledger design): require distinct human approvers and compensating entries for post-approval/post-payment corrections? These are reviewer-proposed protections, not silently confirmed client policy. Preview uses explicitly labelled distinct sample actors and append-only correction examples while the production decision remains pending.
