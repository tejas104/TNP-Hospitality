# Portal role and scope refinement

Status: CANONICAL FRONTEND DIRECTION — 2026-09-19. This document refines what each person may see and do in the responsive web experience. It does not replace server authorization, create a writer lease, approve a provider, or authorize production data. `docs/PRODUCT.md`, `docs/DOMAIN-RULES.md`, `docs/ARCHITECTURE.md`, ADR-0004 and ADR-0007 remain authoritative for domain and security behavior.

## Non-negotiable product truths

- TNP sells four product families: Hospitality workforce, TNP Planner, Venue and RSVP.
- A client-appointed planner is a representative inside a Client organization. They are not a TNP Planner and receive no internal talent-pool or allocation authority.
- A TNP Planner is an experienced TNP professional who applies, is approved by Admin and receives authority only for assigned events and active grants.
- A request is not a quotation. A quotation acceptance is not payment. Payment is not a fulfillment grant. A grant is not an assignment. The UI must show each milestone separately.
- A Freelancer application does not reserve capacity. Allocation/offer, offer response and later reconfirmation are distinct records and actions.
- Browser navigation, hidden controls and synthetic identity switching are presentation only. Server-side organization, event, relationship, capability and record checks remain mandatory.
- Location means point-in-time evidence captured for an attendance scan. It is not continuous tracking or background geofencing.
- RSVP is WhatsApp message and information collection only. It does not include calls, travel or hotel booking, room/vehicle inventory, dispatch or payments.

## Entry and role-state model

Every workspace opens with the named active identity, effective role, current organization/event scope, current state and one dominant next action. Direct entry without an eligible identity returns to the relevant chooser or access state. Switching identity clears record selections, drafts that are not owned by the new identity and event-specific filters.

| Actor/state | May see | May do | Must not see or do |
| --- | --- | --- | --- |
| Visitor | Public four-family catalogue, evidence-safe venues/Planner profiles and enquiry forms | Submit an anonymous mixed-product request and receive a reference | Private workspace, fabricated availability/price, staff or Client data |
| Client applicant | Own enquiry/access request and invitation status | Correct requested contact details when invited; accept an eligible invitation | Authorized event or commercial workspace before approval |
| Approved Client | Own organization events, orders, quotations, collection status, grants, documents and shared RSVP summaries | Create/request products, respond to eligible quotation versions, supply event information, view granted fulfillment | Issue official quotations/grants, allocate workers, view bank/KYC/internal notes |
| Client-appointed planner | Invited Client organization/events and explicitly delegated product/request scope | Prepare briefs and request Hospitality, Venue and RSVP for that Client; coordinate permitted Client actions | TNP Planner identity, talent-pool membership, internal allocation or cross-client access |
| TNP Planner candidate | Own application, evidence consent and review state | Save, submit and respond to a revision request | Assigned-event/private resource workspace before approval and assignment |
| Approved unassigned TNP Planner | Own approval/profile state and no-assignment guidance | Maintain allowed professional profile/availability | Private Client event data merely because approval exists |
| Assigned TNP Planner | Assigned Client brief, active grant limits, eligible venue/workforce evidence, assigned team, scoped instructions, reconfirmation/attendance evidence and permitted RSVP status | Propose/select resources within grant, send scoped worker instructions, manage permitted coordination, rate assigned workers for the event | Issue quotation, self-grant scope, see bank/KYC/internal notes or other events, approve own exceptions |
| Freelancer applicant | Own profile/application/assessment and decision state | Apply for approved roles and non-overlapping events; retain multiple applications | Reserve a position by applying, inspect other applicants or bypass approval |
| Offered/assigned Freelancer | Own offer/assignment, deadlines, instructions, attendance, standing and statements | Accept/decline offer, reconfirm separately, acknowledge instructions, view/correct own evidence through allowed flow | View other workers, allocate, approve own attendance/pay or access internal notes |
| Event Coordinator | Freelancer capabilities plus explicitly granted coordination/rating scope for the assigned event | Coordinate only assigned approved subordinate roles and submit scoped ratings/instructions | Global manager rights, self-rating, peer/unrelated-event access, finance/KYC access |
| RSVP vendor owner | Purchased organization, authorized events, team, usage and entitlement state | Manage event access and owner-level configuration within active entitlement | Provider secrets, cross-organization data or Finance controls |
| RSVP event manager/operator | Assigned event inbox, campaigns, information and reports according to capabilities | Perform only event/capability-authorized message and review actions | Owner-level team/entitlement authority by implication |
| RSVP Client viewer/approver | Explicitly shared event summaries, reports or campaign approvals | Approve only shared items | Vendor inbox, guest export or configuration unless separately granted |
| RSVP guest | Expiring/revocable party/event invitation | Provide requested information and communication preferences | Staff navigation, identity switcher or unrelated guest data |
| Scoped co-admin | Capability-authorized queues, records and actions in assigned organizations/events | Perform named read/create/edit/publish/approve/export actions | Authority from membership alone; bank/provider/security/cross-org/export access unless named |
| Finance actor | Authorized collection or payout queues and masked destination/state evidence | Perform separately granted review, maker, approval, release or reconciliation steps | Treat Admin role as release permission; conflate Client collections and worker payouts |
| Main Admin | Co-admin lifecycle, effective capabilities/scopes and authorized catalogue/commercial/workforce/administration functions | Assign named scopes/capabilities, subject to audit and protected invariants | Shared login, last-admin removal, relationship bypass or maker/checker bypass |

## Client workspace

### First viewport

- Show organization, event goal/current event, access role, current commercial/fulfillment state and one next action.
- Present Hospitality workforce, TNP Planner, Venue and RSVP as separate product families. Each workforce role is a separate line: Event Coordinator, Event Executive, Hostess, Volunteer and Porter.
- Let the Client select any product alone or in combination. Include explicit `Not needed`, `I already have a venue` and `I have my own planner` paths. Never require Venue or TNP Planner merely to submit a request.

### Order and lifecycle

- Builder sequence: event basics, products, role quantities/scope, details, review.
- Preserve requester and billing organization separately. A client-appointed planner may prepare the request while the Client remains the buyer.
- Detail timeline: draft, submitted, clarification requested, quotation issued/revised/expired, Client response, collection status, grant issued/revoked, allocation progress.
- Show official prices only from an issued quotation version. Do not invent availability, ratings, taxes or deposits.
- Commercial controls appear only for the eligible version and billing authority. QA mutations belong in labelled demo controls, not business actions.

## TNP Planner workspace

### Candidate and approval

- Replace external-studio language with a professional TNP Planner application: experience, cities, event categories, leadership evidence, availability and consent.
- States: saved draft, submitted, under review, revision requested, approved, declined and suspended.
- Approval does not expose Client data. An approved but unassigned Planner sees a truthful no-assignment state.

### Assigned event command

- First viewport: assigned event, Client brief, active grant/version, deadline, unresolved decision and next permitted action.
- Destinations: Overview, Plan, Venue, Workforce, Team, Instructions, RSVP, Attendance evidence, Reports and Closure/ratings, each filtered to the assigned event and capability.
- Proposal/selection becomes an assignment only after the authoritative allocation succeeds. Disabled controls explain quantity, eligibility, overlap, expiry, stale grant or permission reasons.
- Replacement is proposed by Planner but approved by authorized Admin/co-admin. Planner sees point-in-time attendance evidence only where granted, never bank/KYC/internal staff notes.

## Freelancer workspace

- Start with compact identity, approval/standing, next assignment or application state and one recommended action, not a large generic hero.
- Distinguish role application, event opportunity application, allocation/offer, offer response, pre-event reconfirmation, attendance and payout.
- Replace the current reserving `claimOpportunity` presentation only after a reviewed shared application/allocation contract exists. Relabelling the current action to Apply is prohibited because the existing operation returns an assignment and reserves capacity.
- Consume the approved role catalogue, including Event Executive and Porter; local role arrays cannot define eligibility.
- Instructions show author, audience, revision and read/acknowledged state. Internal staff notes use a different model and never reach the worker.
- Post-assignment destinations add pass, attendance/calendar, monthly statements, payout history and rating/standing only after the respective reviewed contracts. Pay is derived from verified payable days and captured rate snapshots, not event counts.

## RSVP workspace

- Organization Today shows active events, reply progress, failed/ambiguous messages, missing information, ownership and latest changes.
- Event workspace provides Overview, Guests/parties, WhatsApp inbox, Campaigns/templates, Collected information, Reports and Team/settings.
- Preserve the original message alongside interpreted answers and categories. Ambiguous/conflicting replies require human confirmation.
- Entitlement states are separate from commercial and provider readiness: pending conditions, scheduled, active, suspended, grace read-only, completed/expired and revoked.
- Every mutation/export checks organization, event, entitlement date and named capability. Switching event clears guest/inbox/report selections.
- No reachable Calls, booking, room/vehicle inventory, allocation, dispatch or payment label, action or route.

## Operations and Administration workspace

### Today

- Compact named identity, effective capabilities and current organization/event scope.
- One next action plus an authorization-filtered attention queue: product requests, quotation decisions, expiring grants, staffing gaps, overdue confirmations, attendance exceptions and reconciliation.
- Do not fetch broad sensitive collections and hide them after the fact. Queries themselves must be scope- and section-driven.

### Business

- Requests, Clients/access, quotation versions, collections, grants, invoices and receipts.
- Requester and billing party remain separate. Quotation issue, grant issue, collection status and assignment use distinct capabilities and states.

### Events and people

- Event list/detail with Overview, Requirements, Team, Attendance, Instructions, Documents and History.
- Multi-role quantities remain independent. Non-overlapping Freelancer applications remain active; overlap warnings reveal no other Client/event detail.
- Initial offer and pre-event reconfirmation are separate. Replacement proposal/approval is race-safe. Instructions have worker/role-team/event-team audiences; staff-only notes are separate.
- Attendance evidence uses capture time, receive time, accuracy and recorded/missing/denied/outside/low-accuracy/suspicious states. Exact coordinates are capability-limited and excluded from ordinary exports.

### Website content

- Services/roles, venues, TNP Planner/partner profiles, media and qualified displayed prices use draft, review, published and archived revisions.
- Save draft, Submit for review and Publish are different actions. Published revision and unpublished preview are always identifiable. Historical quotation/rate/document snapshots never change with catalogue edits.

### Finance and documents

- Keep Client collections, Freelancer monthly payables, batches, provider attempts and reconciliation distinct.
- Main Admin is not automatically Finance maker, approver or releaser. Show effective capabilities and masked destination versions.
- Invoice, collection receipt and Freelancer payout acknowledgement are separate immutable document types.
- A4 print view removes app chrome/shadows, repeats headers, controls breaks and preserves SAMPLE/DRAFT/CANCELLED/VOID marks.

### Administration and exports

- Main Admin manages named co-admin capabilities and organization/event scopes with reasoned audit. Protect the last active Main Admin.
- Export authorization is checked both when requested and when downloaded. Apply tenant/event/column allowlists, formula safety, purpose/audit metadata and a stable snapshot/hash.

## Shared frontend contract

The serialized UX Foundation owns route classification, named synthetic identities, tab-scoped profile selection, compact preview chrome, workspace navigation, action/numeric/density/elevation primitives and a shared evidence-rich `PartnerCard`. Feature portals consume those components without editing shared ownership paths.

Role-aware presentation must model at least:

- access state: applicant, invited, active, suspended, revoked;
- scope: organization IDs, event IDs and relationship/grant IDs;
- named capabilities, not broad `isAdmin` checks;
- record version and request identity for mutations;
- loading, empty, filtered-empty, partial, permission-denied, stale, retry and read-only-history states.

Production authorization remains server-side. Synthetic adapters must label preview data and may demonstrate states, but cannot prove authentication, allocation, attendance integrity, notification delivery, provider success or financial correctness.

## Delivery order

1. Integrate accepted Brand Teal and run aggregate palette/regression checks.
2. Implement and review UX Foundation, including exact shared `PartnerCard` ownership and role/access presentation seams.
3. Review shared commercial, workforce application/allocation, instructions/reconfirmation, attendance/location, RSVP entitlement and finance contracts.
4. Run bounded non-overlapping Astra portal milestones: Client/TNP Planner; Admin shell/catalog/access; Operations commercial; Workforce coordination; Freelancer application/offer correction; RSVP correction; Finance and post-assignment Freelancer views.
5. Run role/isolation/security, browser, mobile-performance and print gates; then complete the homepage last.

## Required verification

- Two organizations, two events and repeated names/labels for direct-link, refresh, Back/Forward, switch and record-selection isolation.
- Actor matrix for every role/state above, including denied routes and proving sensitive data was not fetched.
- Retained retry, lost response, stale version, conflict, generation reset, storage denial and two-tab isolation.
- 1440x900, 1100x900, 390x844 and 320px; keyboard, touch, focus return, 200% zoom, reduced motion, safe area and virtual keyboard.
- Actual Android Chrome and iOS Safari behavior where required by the task; production-like mobile Lighthouse median of three cold runs with minimum integer performance 81 on named target pages.
- Focused tests, relevant portal/shared regressions, lint, explicit non-incremental TypeScript, Vercel build, diff check and browser console/hydration review.
