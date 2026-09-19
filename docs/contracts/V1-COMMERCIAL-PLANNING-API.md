# V1 commercial and planning API contract

Status: DRAFT contract — no implementation or provider authority. This contract refines accepted product invariants while DEC-17 through DEC-20 remain explicit policy gates. It consumes the platform session/idempotency/audit foundation only after that candidate is reviewed and integrated.

## Contract rules

- Routes are under `/api/v1` and use the server-derived session actor.
- Every protected mutation requires `Idempotency-Key`; state-changing commands also carry `expectedRevision` where noted.
- IDs are opaque stable strings. Timestamps are ISO-8601 UTC. Money is `{ currency: "INR", amountPaise: integer }`.
- Responses include `requestId`; mutation success includes a stable receipt/effect identifier. Errors use stable codes and never expose another tenant's record content.
- `customerOrganizationId`, `serviceOrganizationId`, role, Planner assignment and grant scope are resolved/validated server-side. A payload value is a requested reference, never authority.
- List endpoints are cursor paginated with bounded page sizes and server-owned filters.

## Product catalogue

Product families:

- `workforce`: `event_coordinator`, `event_executive`, `hostess`, `volunteer`, `porter`, plus later approved versioned codes;
- `tnp_planner`;
- `venue`;
- `rsvp`.

An order line snapshots catalogue version, public name, family/code, unit, requested quantity/scope and the commercial qualifier visible at submission. Historical records never change when catalogue copy changes.

`GET /api/v1/catalogue/products` returns only active products visible to the actor's organization and event context. It does not return internal cost, unpublished rates or private eligibility logic.

## Service orders

Core shape:

```ts
interface ServiceOrder {
  id: string;
  revision: number;
  customerOrganizationId: string;
  serviceOrganizationId: string;
  eventId: string;
  requesterMembershipId: string;
  billingOrganizationId: string;
  representativeKind: 'client_owner' | 'client_appointed_planner' | 'tnp_planner';
  status: 'draft' | 'submitted' | 'clarification_requested' | 'under_review' | 'quoted' | 'closed' | 'cancelled';
  lines: ServiceOrderLine[];
  createdAt: string;
  updatedAt: string;
}
```

Required routes/commands:

- `POST /api/v1/service-orders` — create a draft for an authorized customer/vendor member or assigned TNP Planner acting on an event.
- `GET /api/v1/service-orders` and `GET /api/v1/service-orders/{orderId}` — relationship-filtered list/detail.
- `PATCH /api/v1/service-orders/{orderId}` — edit only an allowed draft or clarification state with `expectedRevision`.
- `POST /api/v1/service-orders/{orderId}/submit` — validate at least one explicit requested line, event ownership/assignment and billing party.
- `POST /api/v1/service-orders/{orderId}/clarification-response` — append a response; never overwrite the Admin question/history.
- `POST /api/v1/service-orders/{orderId}/cancel` — policy-checked cancellation; it does not erase quotations or grants.

Each optional product is explicit `requested` or `not_needed`; omission cannot silently bundle it. Workforce role lines remain distinct and carry requested quantity plus date/shift/scope evidence defined by the event contract.

## Quotations

An official quotation is an immutable issued version linked to one order revision. Only authorized TNP Admin/Operations actors may issue/revise/withdraw it.

```ts
interface QuotationVersion {
  id: string;
  quotationId: string;
  version: number;
  orderId: string;
  orderRevision: number;
  status: 'draft' | 'issued' | 'accepted' | 'declined' | 'expired' | 'withdrawn' | 'superseded';
  lines: QuotationLineSnapshot[];
  subtotal: Money;
  adjustments: QuotationAdjustment[];
  total: Money;
  validUntil: string | null;
  issuedByMembershipId: string | null;
  issuedAt: string | null;
}
```

Required routes/commands:

- `POST /api/v1/service-orders/{orderId}/quotations` — Admin draft against an exact order revision.
- `POST /api/v1/quotations/{quotationId}/issue` — issue an immutable version after server recalculation and authorization.
- `POST /api/v1/quotations/{quotationId}/revise` — create a new version with a required reason; prior version becomes `superseded` but remains readable.
- `POST /api/v1/quotations/{quotationId}/accept` and `/decline` — authorized billing/customer actor, exact active version, validity and `expectedRevision` checks.
- `POST /api/v1/quotations/{quotationId}/withdraw` — authorized TNP actor with reason.

Pending tax, deposit, discount and collection policy fields remain structured optional terms. No hard-coded GST/TDS/deposit rule is allowed until the owner decision is recorded.

## Fulfillment grants and Planner assignment

Only an authorized TNP actor may create or revise a grant. The command references an eligible accepted quotation version and records any separately approved collection condition without manufacturing payment state.

```ts
interface FulfillmentGrant {
  id: string;
  revision: number;
  orderId: string;
  quotationVersionId: string;
  eventId: string;
  customerOrganizationId: string;
  serviceOrganizationId: string;
  status: 'pending_conditions' | 'active' | 'suspended' | 'revised' | 'revoked' | 'completed';
  scopes: GrantLineScope[];
  validFrom: string;
  validUntil: string | null;
}
```

Required routes/commands:

- `POST /api/v1/fulfillment-grants` — create from eligible commercial state.
- `POST /api/v1/fulfillment-grants/{grantId}/activate`, `/suspend`, `/revise`, `/revoke`, `/complete` — role/state/revision checked with required reasons where applicable.
- `POST /api/v1/fulfillment-grants/{grantId}/planner-assignments` — assign an approved/eligible TNP Planner to the event; this is not customer representative membership.
- `GET /api/v1/planner/event-assignments` — returns only active/historical assignments visible to the authenticated TNP Planner.

A grant line identifies exact product/order/quotation line, approved quantity/scope, consumed/reserved quantity supplied by authoritative services and any explicit exception reference. UI-calculated remaining quantity is advisory until the server confirms it.

## Resource proposals and allocation handoff

- `POST /api/v1/fulfillment-grants/{grantId}/resource-proposals` — assigned Planner drafts/submits venue/workforce choices within the grant.
- `PATCH /api/v1/resource-proposals/{proposalId}` — allowed draft edits with `expectedRevision`.
- `POST /api/v1/resource-proposals/{proposalId}/submit` — revalidate grant, Planner assignment and visible resource evidence.
- `POST /api/v1/resource-proposals/{proposalId}/allocate` — authorized command into the single allocation service; never writes an assignment directly from the route/UI.
- `GET /api/v1/resource-proposals/{proposalId}` — relationship/event/grant scoped detail.

The allocation result returns assigned/rejected/retry-safe outcome per requested resource with stable IDs. Partial success, if later approved, must be explicit and reconcilable; the first implementation must fail atomically unless the task contract states otherwise.

## Error codes

Minimum stable codes:

- `AUTHENTICATION_REQUIRED`, `ROLE_FORBIDDEN`, `RELATIONSHIP_FORBIDDEN`, `MEMBERSHIP_INACTIVE`;
- `RECORD_NOT_FOUND`, `INVALID_TRANSITION`, `REVISION_CONFLICT`, `IDEMPOTENCY_CONFLICT`;
- `ORDER_NOT_SUBMITTABLE`, `QUOTATION_EXPIRED`, `QUOTATION_SUPERSEDED`;
- `GRANT_INACTIVE`, `GRANT_SCOPE_EXCEEDED`, `PLANNER_NOT_ASSIGNED`;
- `RESOURCE_INELIGIBLE`, `CAPACITY_EXCEEDED`, `SCHEDULE_OVERLAP`, `ALLOCATION_CONFLICT`;
- `CAPABILITY_UNAVAILABLE`, `VALIDATION_FAILED`, `DEPENDENCY_UNAVAILABLE`.

Public error messages remain generic; field errors may identify only fields the actor is authorized to see.

## Required contract verification

1. Two customer organizations with repeated event/order/product names cannot cross-read through list, detail, nested routes, export, direct ID or replay.
2. TNP Operations access succeeds only for records whose `serviceOrganizationId` matches the actor's TNP organization.
3. Client owner and client-appointed planner permissions are event/order scoped and never satisfy TNP Planner role checks.
4. Planner candidate, approved Planner and event-assigned Planner are three distinct states; only the last can access private planning data.
5. Concurrent/stale order edit, quote issue/acceptance, grant revision and proposal submission return deterministic conflicts.
6. Exact same actor/action/payload/revision retry produces one effect and a replay receipt; changed actor, relationship, action, payload or revision cannot reuse it.
7. Quote acceptance never marks collection paid, grant active or resources assigned.
8. Grant activation never bypasses allocation eligibility, capacity or overlap tests.
9. Revocation/suspension blocks new mutations while historical authorized reads retain immutable evidence.
10. Audit records actor, customer/service relationship, event, aggregate/version, request/idempotency identity and outcome without private payloads.
