# ADR-0005 — RSVP message-only, information-only, multi-event boundary

Status: Accepted product direction on 2026-09-19. WhatsApp provider, categorization policy, packages and production scale remain named decisions.

## Context

The prior RSVP blueprint and frontend candidate included phone-calling queues, vehicle dispatch, room allocation and operational travel/stay management. The user clarified that RSVP communicates only through WhatsApp messages, gathers and segregates guest information, supports many events every day, and leaves real-world travel/room booking and payment to people outside the app.

## Decision

1. RSVP communication is WhatsApp messaging only. Remove phone/mobile calling features and call records from current product acceptance.
2. RSVP collects guest replies and organizes them by event, function, party, response and requested information categories. Rules may suggest categories; ambiguous free text requires human confirmation and preserves the original message.
3. Travel, pickup/drop and stay are information-collection categories only. The app does not reserve tickets/rooms, allocate vehicles, dispatch drivers, manage supplier inventory or process booking/payment.
4. One organization workspace manages multiple daily events. It includes an all-events `Today` command centre and separate event workspaces with isolated guests, messages, campaigns, information and reports.
5. Real-world operators use versioned reports/exports to perform bookings and payments outside RSVP. An external reference/status may be added only through a later approved record-only contract.
6. Preserve a shared identity and modular RSVP domain; do not create a separate deployment/database per event.

## Alternatives

- **Full hospitality logistics engine:** rejected because bookings, allocation, dispatch and payments are handled by people outside RSVP.
- **Phone calling plus WhatsApp:** rejected because communication is WhatsApp message only.
- **Single-event workspace:** rejected because vendors operate many events daily.
- **Autonomous free-text classification:** rejected as the sole authority because ambiguous replies can attach sensitive information to the wrong guest/event; assisted categorization plus human confirmation is safer.

## Consequences

- The current RSVP candidate cannot be integrated as final product scope unchanged even though its fixed-SHA technical review passed.
- Preserve useful tenant/event/import/message/report foundations; remove or reframe Calls, room inventory/allocation, vehicle assignment/dispatch and booking/payment semantics.
- Replace broad logistics dashboards with information-needs views and exports.
- Add organization-wide daily multi-event navigation and cross-event leakage tests.
- Update DTOs, fixtures, UI copy, tests and acceptance before a new fixed-SHA review.

## Evidence and linked contracts

- `docs/RSVP-SERVICE-BLUEPRINT.md`
- `docs/PLATFORM-USAGE-WORKFLOW-BLUEPRINT.md`
- `docs/PRODUCT.md`
- `docs/CLIENT-INPUTS-AND-ACCESS-REGISTER.md`
