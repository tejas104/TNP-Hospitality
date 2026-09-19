# TNP-OPERATIONS-COMMERCIAL-M3 — product orders, quotations and fulfillment grants

Status: DRAFT — no writer, branch, worktree, port or lease. This follows accepted/integrated Operations Reports, Brand Teal and `TNP-UX-FOUNDATION-M1`, plus a reviewed product/order/quotation/grant contract. It must not be folded into the one-defect Operations Reports correction.

Responsible domain owner and sole human fixed-SHA acceptance reviewer: Kartik. Proposed frontend author: verified `gpt-5.6-sol` / high because the surface exposes commercial and authorization-sensitive state. Fresh independent Claude review is required; contract, money or authorization changes also require the specialist review named by the eventual Ready record.

## Result

Give authorized Admin/Operations users one auditable work queue for Client and TNP Planner product requests, official quotation versions and fulfillment grants. The frontend presents authority; it does not manufacture it.

## Proposed exact ownership

- `components/tnp/portals/operations/**` excluding frozen report files unless an explicit serialized adoption delta is recorded
- an Operations-local order/quotation/grant view model, styles and tests

Shared domain/API contracts, Client/Planner/Freelancer/RSVP components, public shell, packages, providers and production data are frozen unless separately leased.

## Required UI

- Unified request queue filtered by organization, event, requester, product family, age, owner and status.
- Request detail with separate order lines for TNP Planner, Venue, RSVP and each workforce role/quantity.
- Explicit requester, billing organization and client-appointed representative identities; none imply TNP Planner authority.
- Versioned quotation composer/reviewer showing line scope, quantity, rate/price source, integer-paise totals, taxes/deposits only when approved, validity, notes and revision reason.
- Only an authorized Admin action may issue, revise, withdraw or expire an official quotation. Draft preview and issued version must be visually distinct.
- Acceptance/rejection/revision-request and collection status remain separate from quotation issue.
- Grant builder starts only from an eligible accepted commercial state, records event/product scope, limits, assigned TNP Planner where applicable, validity and revocation reason.
- Grant detail shows what the Planner may propose versus what still requires allocation/approval. A grant never bypasses capacity, overlap, eligibility or audit.
- History/audit timeline uses stable IDs, actor, time, prior/new state and reason without exposing secrets or raw private payloads.

## Safety and failure states

- Permission denied, stale quotation version, concurrent revision, invalid transition, lost response, retry replay, server validation, partial load and reconciliation-required states.
- No optimistic `issued`, `accepted`, `paid`, `granted` or `assigned` state before authoritative confirmation.
- Exact retry of the same logical mutation replays the original receipt; a different payload conflicts rather than mutating history.
- Read-only historical versions remain inspectable after revision, expiry, withdrawal or revocation.
- Synthetic previews are labelled and cannot be mistaken for live quotations, grants, payments or allocations.

## Required verification

- Desktop/mobile/keyboard/reduced-motion coverage and dense-table overflow behavior.
- At least two organizations, two events and repeated product names prove stable-identity routing/filter/export behavior.
- Authorization matrix proves viewer, quote author, quote approver and grant authority distinctions supplied by the reviewed contract.
- State-transition tests prove no skipped quotation/grant stage and no duplicate version/receipt under retained retry.
- Focused tests, Operations regression suite, lint, explicit non-incremental TypeScript, Vercel build, diff check and browser console/hydration checks.

One immutable fixed SHA, fresh independent review and Kartik acceptance precede P-controlled integration. No main push, deployment, provider connection, quotation issuance or production mutation.
