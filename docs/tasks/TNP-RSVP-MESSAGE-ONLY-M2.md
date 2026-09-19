# TNP-RSVP-MESSAGE-ONLY-M2 — corrected WhatsApp information and multi-event product

Status: DRAFT — no writer, branch, worktree, port or lease. Depends on a serialized decision about whether to correct the existing RSVP branch or integrate only a bounded predecessor subset. Do not launch until P records exact source/launch SHAs, owned paths, reviewers and the impact on the shared UX foundation.

Product source: `docs/RSVP-SERVICE-BLUEPRINT.md`, `docs/PLATFORM-USAGE-WORKFLOW-BLUEPRINT.md`, ADR-0005 and the 2026-09-19 client decision.

## Result

Transform the reviewed RSVP predecessor into the current product: WhatsApp message-only, information-only, organization-level daily multi-event command centre plus isolated per-event workspaces. Preserve useful organization/event/import/message/report/accessibility foundations. Remove or reframe product behavior that claims Calls, hotel/room inventory or allocation, travel booking, vehicle assignment/dispatch, booking/payment or provider completion.

## Required UI

- Apply the shared dashboard surface/elevation contract to the all-events Today attention cards, event switcher and ambiguous/failed-message queues; do not turn travel/stay information into partner inventory cards.
- Organization `Today` dashboard across active events with event cards, reply progress, failed messages, ambiguity, missing information, ownership and latest change.
- All-events list/switcher with date/status/search, keyboard support and separate event URLs.
- Event workspace: overview, guests/parties, WhatsApp inbox, campaigns/templates, collected information, reports, team/settings.
- Distinguish vendor owner, event manager/operator, explicitly shared Client viewer/approver and guest invitation. Owner-level team/entitlement authority is never implied by event membership, and a Client viewer does not inherit vendor inbox or guest-export access.
- Reply interpretation: original message, structured answers, suggested categories, clear versus ambiguous/conflicting state and human confirmation.
- Information-only travel/stay/pickup views and exports. No booking, inventory, allocation, dispatch or payment action.
- Cross-event navigation clears guest/inbox/report selection and cannot leak counts or records.
- Explicit provider-disabled, loading, empty, filtered-empty, error, retry, suspended, expired and no-entitlement states.
- Entitlement presentation separates `pending_conditions`, `scheduled`, `active`, `suspended`, `grace_read_only`, `completed/expired` and `revoked`; quotation/payment/grant/provider readiness remain separate evidence. Every mutation and export rechecks organization, event, date window and named capability.

## Removed from acceptance

- Calls route/queue, call actions, call outcomes and caller metrics.
- Hotel inventory, room proposal/hold/allocation and room-capacity enforcement.
- Vehicle inventory, transfer assignment, dispatch and movement lifecycle.
- Ticket/hotel/room/vehicle search, reservation, supplier payment or RSVP checkout.

Historical movement/room code may not remain publicly reachable or claim product support. P must decide whether it is deleted in the correction branch or retained only as unreachable predecessor evidence; the builder cannot widen shared ownership to decide this.

## Required verification

- Focused tests for organization/event isolation, event-switch clearing, daily aggregate derivation, message replay/deduplication, ambiguous reply review, original-message preservation, opt-out suppression and report immutability.
- Negative tests prove no call/booking/allocation/dispatch/payment action or label is reachable.
- Desktop/mobile/keyboard/touch/reduced-motion browser matrix at 1440/1100/390/320, including three active events and similar guest names/phones across two events.
- Existing relevant guest import/message/report regressions, lint, explicit TypeScript, build and diff check.

One immutable fixed SHA, fresh independent review and Kartik product acceptance precede P-controlled integration. No provider, production or payment mutation.
