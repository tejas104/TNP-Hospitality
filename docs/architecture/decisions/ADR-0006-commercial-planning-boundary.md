# ADR-0006 — commercial orders, cross-organization service authority and Planner grants

Status: Proposed on 2026-09-19 for the next platform milestone. The corrected product/authority model is accepted; detailed catalogue, quotation, collection, grant, rating and assignment policies in DEC-17 through DEC-20 remain owner decisions before a Ready implementation contract.

## Context

TNP serves customer and vendor organizations while its own Admin, Operations and approved TNP Planners must act on customer events. A simple rule that permits access only when `actor.organizationId === record.organizationId` is necessary for ordinary tenant data but insufficient for legitimate TNP service delivery. Relaxing that rule globally would create a cross-tenant data leak.

The platform also needs one auditable chain from a Client or authorized representative's product request to an Admin-issued quotation, Client acceptance, fulfillment grant and TNP Planner resource proposal. Browser state must not create commercial or assignment authority.

## Decision

1. Keep the existing modular monolith. Add a `commercial` application/domain module and consume the existing session, authorization, repository, idempotency and audit boundaries after `TNP-PLATFORM-M1` is accepted and integrated. Do not create another service or database.
2. Every commercial aggregate records both `customerOrganizationId` and `serviceOrganizationId`. The service organization is the TNP organization responsible for delivery. Neither value may be trusted from a client payload without server-side resolution.
3. Access is relationship scoped, not globally cross-tenant:
   - an active customer/vendor member may access only records owned by their organization and only the commands allowed by their membership and event scope;
   - an active TNP `platform_admin` or `operations` member may access a customer record only when its `serviceOrganizationId` is the actor's TNP organization and the operation is allowed for that role;
   - an active TNP `planner` member additionally requires an explicit active Planner assignment to that event/grant;
   - `finance` receives only the collection/payout capabilities explicitly assigned to that workflow;
   - a worker receives no commercial-order access merely because the worker is assigned to the event.
4. A client-appointed planner remains a customer-organization representative using the `client` membership role plus server-owned event/order permission scope. It never receives the TNP `planner` role by choosing a label or submitting an application.
5. A TNP Planner candidate/approval record is separate from organization membership. Approval may make a TNP member eligible for the `planner` role, but only an authorized Admin command may activate that role and only a later event/grant assignment creates event authority.
6. Use separate linked aggregates:
   - `ProductCatalogueVersion` and immutable product snapshots;
   - `ServiceOrder` with revisioned product-order lines;
   - immutable `QuotationVersion` records plus a quotation lifecycle;
   - `FulfillmentGrant` scoped to accepted quotation/order lines;
   - `PlannerEventAssignment` scoped to one active grant/event;
   - `ResourceProposal` for requested venue/workforce selections;
   - authoritative venue/workforce allocation records remain owned by the single allocation service.
7. Only authorized Admin/Operations quotation commands issue, revise, withdraw or expire an official quotation. An order form may calculate a clearly labelled estimate only under a separately approved pricing contract; no such estimate is approved now.
8. Quotation acceptance, collection/payment state, fulfillment grant and actual resource assignment are separate state machines. No transition silently implies the next one.
9. A fulfillment grant records exact product line scope, quantity/limits, validity, conditions and revision. A Planner proposal cannot exceed or outlive the active grant. Grant changes invalidate or require revalidation of affected uncommitted proposals; they do not silently delete historical decisions.
10. Planner venue/workforce selection produces a proposal or allocation command. It becomes an assignment only after the allocation service atomically validates eligibility, capacity, schedule overlap, grant scope and idempotency and persists the result.
11. Protected mutations require `Idempotency-Key`, an expected aggregate revision where state can race, server-derived actor/relationship scope and append-only audit evidence. Exact replay returns the original receipt; a different payload conflicts.
12. Money uses integer paise and explicit currency/qualifier/source snapshots. Client collections and worker payouts remain separate ledgers and are not implemented by this commercial milestone.
13. List/detail responses expose only presentation-safe evidence. Identity documents, private contact data, bank data, provider secrets and internal risk notes never enter partner/Planner/workforce cards.
14. API DTOs use stable opaque IDs, ISO timestamps, explicit status values and structured errors. Web and future mobile clients consume the same contract.

Boundary map:

`route -> session actor -> organization/service relationship policy -> command/query -> aggregate repository + idempotency + audit -> allocation/collection port`

The relationship policy is narrow and resource specific. It does not replace normal tenant filtering or grant a TNP role unrestricted access to every organization.

## State separation

```text
ServiceOrder:       draft -> submitted -> clarification_requested -> under_review -> quoted -> closed/cancelled
QuotationVersion:   draft -> issued -> accepted/declined/expired/withdrawn/superseded
Collection:         not_required/pending/processing/paid/failed/uncertain/reversed  (separate ledger)
FulfillmentGrant:   pending_conditions -> active -> suspended/revised/revoked/completed
ResourceProposal:   draft -> submitted -> approved/rejected/stale/withdrawn
Allocation:         requested -> assigned/rejected/released/replaced               (allocation service)
```

An accepted quotation is not payment success. Payment success is not a grant. A grant is not an assignment.

## Alternatives considered

- **Strict record-owner tenant equality for every actor:** rejected because TNP Admin/Operations and assigned TNP Planners could not deliver services to customer events.
- **Global TNP super-user bypass:** rejected because it creates unnecessary cross-tenant exposure and weak auditability.
- **One order record containing mutable quote, payment, grant and assignments:** rejected because revisions and failures would overwrite commercial and operational history.
- **Frontend-enforced grant limits:** rejected because direct API calls and concurrent allocation would bypass them.
- **A separate commercial microservice:** rejected because the current scale and two-human operating model do not justify another deployment or failure boundary.

## Consequences and risks

- The existing platform authorization helper remains useful for same-tenant records but needs a resource-specific relationship policy before commercial routes are added.
- Repository queries must include customer/service relationship criteria; direct record IDs are never sufficient.
- Operations and Planner interfaces can share identifiers and state without sharing private fields or authority.
- Pending commercial and rating policies stay explicit; preview fixtures may demonstrate named scenarios but cannot become production defaults.
- Highest risks are cross-tenant leakage, stale quotation acceptance, duplicate effects on retained retries, grant overrun and UI states that imply payment or assignment prematurely.

## Acceptance criteria

- Customer A cannot read or mutate Customer B records by ID, list filter, nested event route, export or retained retry.
- TNP Operations can access only records served by its TNP organization and only allowed commands.
- A client-appointed planner has customer-scoped buying permissions but never TNP Planner authority.
- An approved TNP Planner without an active event/grant assignment cannot access the event's private planning data.
- Quote issue/revision/acceptance, grant issue/revision and resource proposal/allocation each preserve immutable history and reject stale revisions.
- Exact mutation retries replay one receipt/effect; changed payload, actor, relationship, action or revision conflicts safely.
- Grant limits are rechecked by the server at proposal and allocation time.
- All denials and sensitive transitions append safe audit evidence without logging secrets or private documents.

Evidence: `ADR-0002`, `ADR-0004`, `docs/DOMAIN-RULES.md`, `docs/PLATFORM-USAGE-WORKFLOW-BLUEPRINT.md`, and `docs/tasks/TNP-PLATFORM-COMMERCIAL-M2.md`.
