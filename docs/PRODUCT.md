# Product and delivery baseline

## Confirmed user decisions
H1 is Anjaneya and H2 is Kartik. Two humans, two laptops; no H3. Requested builders are A/B/C/D. P handles architecture here; R reviews independently.
This is responsive web only. A native app approximately six months later is separately funded and consumes the same API/domain boundary.
Preserve the public website and especially the Operations format at https://tnp-hospitality-demo.vercel.app/ and /admin.
The 25-day schedule remains the target, not a claim that two people can deliver unchanged full PDF scope. See DELIVERY-PLAN.md.

## Working product scope
Public enquiry and portfolio; client venue/planner/details booking; planner registration/requirements/status; freelancer application/assessment/KYC state and approval; event/position staffing; confirmation/briefing; authorized attendance and corrections; ratings; quotations/invoices/collections; attendance-derived earnings, two approvals and monthly payouts; basic RSVP; scoped admin/maintenance/audit/reports.
Booking contains multiple function Events. Positions have configurable quantities. Team Leader is event-scoped, not a universal account role. Keep client collections and worker payouts separate.

## Scope conflicts remain visible
The engineering PDF originally specifies WhatsApp cadence and masked guest documents. Historical 25-day plans propose deferring both; the client has not approved that reduction in available evidence.
Basic RSVP remains included. Do not expose live guest-document collection until scope and secure lifecycle are approved; absence of that implementation is an unresolved scope gap, not accepted completion.
Venue CSV import, custom permission editing, richer profitability/reporting and reduced public motion/content depth were also historical proposals. Track them in DOMAIN-RULES.md; do not silently drop original requirements.
MongoDB Atlas is the stated database direction in scope evidence. No backend/database exists in this repo. Preserve that direction; implementation/hosting choices require separate reviewed decisions.
Client-supplied TNP imagery/content and invoice template are still unverified. Current Unsplash media is preview material, not evidence that the PDF's imagery acceptance is met.

## Milestones and acceptance
Day 1 = kickoff date pending. Day 3 appointment/time zone and client decision owner pending. Dates printed in historical documents are not confirmed kickoff dates.
Day 3 target F01–F16, equally weighted 16/20 frontend screen sets. Remaining F17–F20 by Day 6.
A frontend-ready set has working primary actions, consistent fixtures, validation and relevant loading/empty/error/success states, accessible navigation, desktop/mobile verification, truthful preview labels and an independent human walkthrough.
Production-integrated additionally requires real authorized APIs, persistence, invariant/failure tests and provider evidence.
Release-ready additionally requires UAT, restore/rollback, monitoring/training and exact human release authorization.
Current certified coverage: 0/20; this is unverified readiness, not a claim that no UI exists. See F01-F20-AUDIT.md.
