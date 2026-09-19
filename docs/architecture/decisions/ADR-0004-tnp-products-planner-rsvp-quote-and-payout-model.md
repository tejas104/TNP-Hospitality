# ADR-0004 — TNP products, Planner authority, RSVP entitlement, quotation and payout model

Status: Accepted product direction on 2026-09-19. Detailed commercial, privacy, rating and payroll policies remain named client decisions.

## Context

TNP sells hospitality workforce, TNP Planner, Venue and RSVP products. The earlier workflow conflated a client-appointed external planner with a senior TNP Planner and made Operations the default final workforce selector. The product also needs one consistent rule for quotations, RSVP activation and calendar-month freelancer payment.

## Decision

1. Model four connected product families: People/workforce, TNP Planner, Venue and RSVP. Workforce products include Event Coordinator, Event Executive, Hostess, Volunteer and Porter, with an extensible approved catalogue.
2. Distinguish a client-appointed planner from a TNP Planner. The former is an authorized Client-organization representative/buyer. The latter is a senior TNP role approved from experienced candidates and sold as a TNP service.
3. A Client workspace guides customers through selecting any combination of products and submitting a product order. It must allow explicit `Not needed` choices and must not silently bundle add-ons.
4. Admin alone creates/revises official quotations and grants ordered scope. Separate the actor who requests an add-on from the organization that receives and approves its quotation.
5. After Admin grant, the assigned TNP Planner may select/assign venue and workforce within the event's authorized scope. The single allocation service still enforces role eligibility, quantity, schedule overlap, replacement and audit.
6. RSVP is a separate detailed paid product. A vendor organization registers, receives an Admin quotation, satisfies required payment/approval, then receives an isolated entitlement and team workspace. A Client or TNP Planner may also request RSVP for a TNP-managed event; Admin grants it to that event/billing party.
7. TNP Planner may rate assigned workforce. An assigned Event Coordinator may rate approved lower-level roles on that event. Ratings are assignment scoped, evidence-based, disputable and never create automatic permanent deactivation.
8. Freelancer earnings derive from verified attendance-day entries and captured assignment day rates within a calendar month. Operations/Admin reviews and Finance approves the month-end payout. Event count alone is not a payment basis.
9. Keep client collections, RSVP commercial entitlement and freelancer payouts as separate ledgers/workflows even when they reference the same event.
10. Preserve a modular monolith and shared identity/API/domain boundaries; the corrected product model does not justify microservices or a frontend-only business-rule implementation.

## Alternatives

- **One generic Planner role:** rejected because it mixes a customer's representative with TNP's vetted senior service provider.
- **Operations makes every final assignment:** rejected as the normal UX because the granted TNP Planner is expected to build and assign the event team; Operations remains grant/exception authority and the allocation service remains mandatory.
- **Automatic quotation from the order form:** rejected because the user requires Admin-created quotations and commercial rules are incomplete.
- **RSVP as a small event toggle:** rejected because it is a separately sold, WhatsApp-based operational product with organization/team access and detailed guest workflows.
- **Pay by event count:** rejected because the confirmed direction is verified attendance days inside a calendar month.

## Consequences

- Public/product copy, demo identities, navigation and dashboards must use the corrected role names.
- Client order, quotation, grant and fulfillment become explicit linked records.
- Planner dashboard actions require grant scope and allocation validation.
- RSVP access needs entitlement and tenant isolation in addition to login.
- Rating contracts need rater/subject/event-role authorization and dispute history.
- Monthly statements need attendance-day, rate snapshot, cutoff, approval and reconciliation policies.
- ADR-0003 is superseded; existing preview components remain labelled synthetic until corrected milestones are launched and reviewed.

## Evidence and linked contracts

- `docs/PLATFORM-USAGE-WORKFLOW-BLUEPRINT.md`
- `docs/PRODUCT.md`
- `docs/DOMAIN-RULES.md`
- `docs/RSVP-SERVICE-BLUEPRINT.md`
- `docs/CLIENT-INPUTS-AND-ACCESS-REGISTER.md`
