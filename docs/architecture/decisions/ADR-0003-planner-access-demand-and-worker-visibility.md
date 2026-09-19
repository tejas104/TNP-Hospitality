# ADR-0003 — Planner access, demand approval and worker visibility

Status: Accepted as product direction on 2026-09-19; production identity, privacy, selection authority and data contracts remain gated decisions.

## Context

The current `/planner` route is a labelled synthetic frontend preview. It is publicly reachable and combines sample Planner registration with requirement creation. The desired product separates public explanation, Planner onboarding/authentication, Operations approval, multi-role workforce demand and the approved Planner workspace.

The Planner needs useful applicant evidence, while TNP must preserve worker privacy and centrally enforce eligibility, capacity, schedule overlap, replacement and audit rules.

## Decision

1. Keep `/planner` as a public role/product page. It explains the Planner offering and provides `Become a Planner`, `Planner sign in` and lower-priority contact actions.
2. A Planner applicant creates or joins a Planner organization, completes a profile and enters a review lifecycle. Only an approved, active membership enters the production Planner dashboard.
3. Planner-account approval and per-requirement approval are separate decisions. Account approval permits demand creation; it does not authorize automatic publication or staffing.
4. A Planner event brief contains venue/schedule information and multiple workforce lines. One submission may request several roles and quantities for the same event/function.
5. Operations reviews the requirement, requests changes, rejects or approves. Approval creates controlled positions that are published only to eligible workers.
6. The Planner receives an event-scoped applicant comparison view containing only approved professional/performance evidence. Private KYC, banking, home address, internal notes, unrelated-event data and raw payout information remain unavailable.
7. For v1, the Planner may shortlist or rank preferences; Operations performs final allocation through the single allocation service. A different client decision requires a revised authorization/allocation contract.
8. The Planner dashboard covers events, requirements, applicants, assigned team, venues, quotes/invoices, notifications, reviews, reports and organization settings. Every view is organization/event scoped and server authorized in production.
9. Demo login/profile selection may show this flow with synthetic records, but it must remain visibly separate from production authentication.

## Consequences

- The current single public Planner screen must eventually split into public, access/application/status and authenticated workspace surfaces.
- Identity/organization membership is a prerequisite for production Planner data.
- The requirement contract must evolve from one role/quantity mutation into an event demand aggregate with multiple lines and versioned changes.
- Applicant comparison needs explicit privacy, rating provenance and performance-summary contracts.
- Operations remains a necessary authority even when the Planner supplies preferences.
- Real-time or provider notifications require durable server jobs; browser alerts are only preview behavior.

## Pending owner decisions

- Individual versus company Planner eligibility and required evidence.
- Planner organization roles and invitation authority.
- Who creates the source booking/event and who may edit it after approval.
- Listed/custom venue rules and venue verification.
- Quote/deposit gate before position publishing.
- Exact worker fields, rating periods, rating authors and dispute process.
- Final-selection authority if the recommended Operations-controlled allocation is changed.
- Cancellation, replacement and reconfirmation windows.

See `docs/PLATFORM-USAGE-WORKFLOW-BLUEPRINT.md` and `docs/CLIENT-INPUTS-AND-ACCESS-REGISTER.md`.
