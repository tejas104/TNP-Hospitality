# Domain rules and pending business decisions

## Required invariants
- Server derives identity and enforces role plus ownership/event scope. Reference IDs alone do not grant private access.
- Only eligible approved workers claim valid positions. Capacity, assignment, rate snapshot and overlap reservation must stay consistent under concurrency/retries.
- One allocation service handles worker claims and admin assignment. Admin override must not silently overfill. H2 owns implementation; H1 reviews and both approve contracts.
- Production claim acceptance requires 20 concurrent requests on 10 slots -> exactly 10 assignments, then 500 on 10 -> exactly 10; duplicate requests and simultaneous overlapping events must remain safe.
- Distinguish initial assignment acceptance from attendance reconfirmation. Expiry/confirm/decline/replacement races must preserve capacity and audit.
- Attendance requires eligible assignment, authorized event-scoped TL/coordinator, valid event token/code and server evidence. GPS denial is recorded as missing, never valid; the PDF requires a missing-GPS check-in path.
- Corrections preserve original attendance evidence and append reason/actor/time. Never display an unsaved action as persisted.
- Earnings derive from verified attendance and an agreed rate snapshot. Adjustments require reasons. TL/coordinator then Finance approvals are explicit.
- Integer paise throughout money paths; no floating-point amount storage. Collections and payouts have separate ledgers.
- One logical worker/month payable; provider attempts and uncertain/failed/reversed states must reconcile safely. A provider reference alone is not final success. Duplicate/restarted requests cannot pay twice.
- Sensitive approvals, allocation changes, rates, account decisions, corrections and money events need audit trails.
- Three consecutive poor ratings trigger human review. Permanent deactivation is a human decision; no automatic irreversible policy is approved.

## Pending decision register
No entry below is approved merely because a source proposed a default. H1 collects client decisions; H2 supplies operational implications. Dates use relative days until kickoff is agreed.

| ID | Question / source tension | Owner | Needed by / blocked work |
|---|---|---|---|
| DEC-01 | Confirm full WhatsApp RSVP and guest-document scope versus proposed deferral; basic RSVP stays | Anjaneya + client | Day 1 scope forecast; automation/uploads |
| DEC-02 | Initial acceptance versus T−2h reconfirmation, T−1h expiry, cancellations and late replacements; configurable windows proposed | Kartik + client | Before allocation/jobs contract |
| DEC-03 | Setup/travel buffers, midnight intervals and overlap reservations before final confirmation | Kartik + client | Before allocation |
| DEC-04 | Flat shift/hourly/event pay, missing checkout, overtime, lateness and cancellation adjustments | Kartik + client | Before earnings |
| DEC-05 | Position/worker/default rate precedence and effective date/snapshot timing | Kartik + client | Before assignment/rates |
| DEC-06 | Monthly timezone/cutoff, late approvals, uncertain payout/reversal and reconciliation process | Kartik + client | Before finance |
| DEC-07 | Poor-rating threshold, chronological ordering, corrections/appeal and under-review eligibility | Kartik + client | Before rating/eligibility |
| DEC-08 | Outside-radius handling, reason/review; missing GPS must remain distinct | Kartik + client | Before attendance |
| DEC-09 | Invoice entity/template, deposits, revisions, refunds and collection allocation | Anjaneya + Kartik + client | Before quotes/collections |
| DEC-10 | Venue CSV, permission editor, profitability/report depth and public content/motion reductions proposed historically | Anjaneya + client | Day 1 scope forecast |
| DEC-11 | Supplied public copy, three service pages/twelve departments, TNP images, invoice assets | Anjaneya + client | Day 2 content; F01/F02/F16 |
| DEC-12 | Provider activation and restricted launch alternatives for KYC/OTP/payments/payouts | Kartik + client | Test access Day 5; live decision Day 15 |
| DEC-13 | Production hosting/build route, auth, API tooling, jobs, private storage/restore | Kartik + Anjaneya | Architecture task before backend build |

Record actual decisions with evidence in decisions/CLIENT-DECISIONS.md. Pending policy may be represented as labelled scenario assumptions in preview fixtures, never silently used as production authority.
