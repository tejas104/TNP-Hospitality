# S1 — Shared interface and synthetic scenario agreement

Status: Draft. Owner B/Anjaneya; Kartik co-designs workforce/operations semantics read-only. Review Claude + Kartik + independent Astra.
Dependent on integrated S0. No canonical fixtures/types/service ownership is delegated to feature lanes.

## Owned paths to implement
lib/contracts/preview.ts — browser-safe DTOs and feature service interfaces.
lib/demo/scenario.ts — canonical initial synthetic records and explicit policy assumptions.
lib/demo/store.ts — versioned namespaced persistence/reset and deterministic mutations.
lib/demo/service.ts — one implementation of the shared feature service contract.
lib/services/preview.ts — explicit preview composition/accessor.
components/tnp/shared/PreviewControls.tsx plus AppShell.tsx for controls only.
tests/preview-contract.test.mjs — behavioral scenario tests to add in this task.
No package/framework/provider/schema changes. No HTTP adapter pretending to call a real service.

## DTO agreement to finalize in this task
Stable string IDs, ISO timestamps with explicit event timezone, integer paise and stated pay unit. Paginated list shape {items,nextCursor}; structured errors {code,message,fieldErrors?,retryable}.
Keep UI view models separate from proposed Mongo records. A preview actor label grants no production authorization.
Booking -> Event/function -> Position -> Assignment -> Attendance -> Earning -> monthly payout display. Requirement links to booking/event; Quotation has version, issuing entity, lines and total. Application, planner verification, assessment, rating and guest-summary views use the same scenario IDs.
Opportunity must expose event/position IDs, role, schedule/timezone, venue/reporting details, payRatePaise/payUnit, required/filled quantities and eligibility reason.
Explicit service operations: submit booking/requirement, register planner/applicant, submit assessment, list/get requirements/events/opportunities, claim, respond Coming/Not Coming, list roster, review application, record preview attendance/correction, view/adjust/approve preview earning, revise/approve preview quote. Define typed outcomes before consumers begin.
Absence of accepted business policy must be represented by scenario metadata and labels; no production state machine is approved here.

## Canonical scenario
Synthetic booking tnp-demo-booking-001, two function events tnp-demo-event-001/002, positions with different quantities (include 6 and 40 to prevent fixed 10+1 assumptions), eligible/ineligible workers, pending/confirmed/declined responses, full/unavailable opportunity, GPS-denied attendance, reasoned correction, revised quote and processing payout.
Store namespace tnp-preview-v1. Capture an explicit deterministic clock/timezone; do not depend on wall-clock dates making scenarios expire unexpectedly.
Reference links across portal navigation must reflect mutations. Same-browser refresh retains preview data; Reset restores the full scenario. Separate devices are not synchronized; demonstrate the cross-portal walkthrough in one browser profile.
Scenario variants for loading/empty/error are explicit controls, not scattered always-success branches.

## Required behavior tests (task adds the named test file)
Use Node v22.23.2 built-in test runner:
node --experimental-strip-types --test tests/preview-contract.test.mjs
Tests import explicit relative .ts paths from .mjs; no runtime tsconfig aliases.
Assert cross-view requirement/event IDs, claim-to-roster update, full/ineligible rejection, repeated action behavior, Coming/decline state distinction, GPS-denied marker, reasoned correction retaining evidence, two distinct preview approvals, integer money, reset and versioned reload behavior.
These tests validate a preview simulation only, not server concurrency/security/provider correctness. Do not call this test command passed before the file exists and actually runs.
Retain existing lint/type/build checks and a one-browser planner -> Operations -> worker -> roster -> attendance -> earning journey.

## Consumer freeze
After reviewed merge, A/B/C/D consume these interfaces without editing them. Feature-only display state belongs in each owned directory. A new field or transition becomes an S1 amendment prerequisite, never four local fixture forks.
Live API/auth/provider composition needs a later reviewed production contract. No live fallback to these mocks is permitted.
