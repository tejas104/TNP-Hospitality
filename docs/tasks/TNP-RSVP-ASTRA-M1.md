# TNP-RSVP-ASTRA-M1 — RSVP customer and partner frontend

Status: DRAFT — no writer lease. Prepared from the user's 2026-09-18 instruction to complete all remaining non-3D frontend pages and workflows.

## Result

Use verified `gpt-6-astra` / high to build the responsive synthetic frontend for TNP-managed RSVP customers and vendor-operated RSVP partners while consuming reviewed identity/tenant/API contracts rather than recreating them in components.

## Proposed ownership

- `app/rsvp/**`
- `components/tnp/portals/rsvp/**`
- local RSVP presentation helpers/styles/tests only

Freeze AppShell/global CSS after the public-shell milestone, existing Client/Planner/Freelancer/Operations components, shared contracts/services/fixtures, packages and provider/server code. Shared gaps return to the platform/RSVP contract owner.

## Prompt 1 — workspace and guest operations

- Customer and vendor context with truthful organization/event scope.
- Event list/detail, function list and guest/party directory.
- CSV/manual import preview with per-row validation, duplicates, partial failure and retry identity.
- Function-wise Confirmed/Pending/Not Coming/Follow-up Required/Document Required/Received views.
- Search/filter, empty/loading/error/retry/stale/refresh/reset states.
- Calling/follow-up queue, assignment and audit-facing timestamps using synthetic data.
- Purposeful replaceable event imagery only where it helps orientation; no decorative images in dense guest tables.

## Prompt 2 — hospitality and provider-disabled flows

- Travel, arrival/departure, pickup/drop, self-drive, hotel/stay and rooming presentation.
- Message/template timeline and delivery states labelled synthetic/provider-disabled.
- Document desk UI may show policy-disabled or sample metadata only; do not solicit or store real identity documents before retention/access/storage decisions.
- Controlled report/export preview with generated-at/context labels; no claim that Excel/PDF was externally delivered.
- Vendor/customer isolation, event switching and suspended/expired access states represented truthfully.

## Gates

Requires reviewed/integrated platform identity/tenant boundary, an RSVP UI contract and exact source/launch/lease/reviewer packet. Verify 1440/1100/390, keyboard/focus, two-vendor direct-ID isolation through the service/API layer, import replay/errors, refresh/reset and no provider claims. No WhatsApp send, private upload, production auth or deployment from this task.
