# S1 — Shared interface and synthetic scenario agreement

Status: Draft. Owner B/Anjaneya; Kartik co-designs workforce/operations semantics read-only. Review Sonnet + Kartik + independent Sol. Anjaneya and Kartik both approve the shared semantics. Kartik is a domain co-designer, not an independent domain designer; independent AI reviews remain required.
Dependent on completed and checked S0 in TNP-FOUND-01; foundation integrates only after both phases pass milestone review. No canonical fixtures/types/service ownership is delegated to feature lanes.

## Owned paths to implement
lib/contracts/preview.ts — browser-safe DTOs and feature service interfaces.
lib/demo/scenario.ts — canonical initial synthetic records and explicit policy assumptions.
lib/demo/store.ts — versioned namespaced persistence/reset and deterministic mutations.
lib/demo/service.ts — one implementation of the shared feature service contract.
lib/services/preview.ts — explicit preview composition/accessor.
components/tnp/shared/PreviewControls.tsx plus AppShell.tsx for controls only.
tests/preview-contract.test.mjs — behavioral scenario tests to add in this task.
tsconfig.json is owned ONLY to add compilerOptions.allowImportingTsExtensions=true, retaining noEmit=true and every other existing option. No package/lockfile/framework/provider/schema changes. No HTTP adapter pretending to call a real service.

## DTO agreement to finalize in this task
Stable string IDs, ISO timestamps with explicit event timezone, integer paise and stated pay unit. Paginated list shape {items,nextCursor}; structured errors {code,message,fieldErrors?,retryable}.
Keep UI view models separate from proposed Mongo records. A preview actor label grants no production authorization.
Booking -> Event/function -> Position -> Assignment -> Attendance -> Earning -> monthly payout display. Requirement links to booking/event; Quotation has version, issuing entity, lines and total. Application, planner verification, assessment, rating and guest-summary views use the same scenario IDs.
Opportunity must expose event/position IDs, role, schedule/timezone, venue/reporting details, payRatePaise/payUnit, required/filled quantities and eligibility reason.
Explicit service operations: submit booking/requirement, register planner/applicant, submit assessment, list/get requirements/events/opportunities, claim, respond Coming/Not Coming, list roster, review application, record preview attendance/correction, view/adjust/approve preview earning, revise/approve preview quote. Define typed outcomes before consumers begin.
Absence of accepted business policy must be represented by scenario metadata and labels; no production state machine is approved here.

## Canonical scenario
Synthetic booking tnp-demo-booking-001, two function events tnp-demo-event-001/002, positions with different quantities (include 6 and 40 to prevent fixed 10+1 assumptions), eligible/ineligible workers, pending/confirmed/declined responses, full/unavailable opportunity, GPS-denied attendance, reasoned correction, revised quote and processing payout.
Storage key/prefix is fixed: tnp-preview-v1. The persisted envelope contains generation, deterministic records, ordinaryRequestLedger and resetReceipts. Refresh preserves all four. The reset and generation protocol below is normative; Reset replaces records and clears only ordinaryRequestLedger, while retaining resetReceipts. Capture an explicit deterministic clock/timezone; do not depend on wall-clock dates making scenarios expire unexpectedly.
Reference links across portal navigation must reflect mutations. Same-browser refresh retains preview data; Reset restores the full scenario. Separate devices are not synchronized. At the later I01 browser gate, demonstrate connected portals in one browser profile; S1 itself proves transitions through service tests only.
Scenario variants for loading/empty/error are explicit controls, not scattered always-success branches.

## Required behavior tests (task adds the named test file)
Verification baseline: Node v22.23.2. Laptop 2 reports v24.19.0; that version is provisional until the same checks pass there. Package minimum alone is not compatibility evidence. Use the built-in test runner:
node --experimental-strip-types --test tests/preview-contract.test.mjs
Tests and all transitive TypeScript runtime imports use explicit relative .ts extensions; type-only imports use import type. No runtime tsconfig aliases, enums or other non-erasable syntax. Add the narrowly authorized allowImportingTsExtensions option, then verify both direct Node execution and tsc --noEmit.
Assert cross-view requirement/event IDs, claim-to-roster update, full/ineligible rejection, repeated action behavior, Coming/decline state distinction, GPS-denied marker, reasoned correction retaining evidence, two distinct preview approvals, integer money, reset and versioned reload behavior. Also assert duplicate Reset (including retry after reload), stale delayed mutation, same-key/different-payload conflict, same-key reuse in a new generation, and rejection of stale expectedGeneration; use the exact outcomes below.
These tests validate a preview simulation only, not server concurrency/security/provider correctness. Do not call this test command passed before the file exists and actually runs.
Retain lint/type/build checks and five-route smoke checks plus preview controls reset/reload. Prove planner -> Operations -> worker -> roster -> attendance -> earning transitions through service-level behavioral tests in S1. The full browser journey is NOT an S1 acceptance gate: it is TNP-I01 after the consuming tasks integrate; see docs/contracts/I01-INTEGRATED-PREVIEW.md. S1 has no portal wiring ownership.

## Consumer freeze
After reviewed merge, A/B/C/D consume these interfaces without editing them. Feature-only display state belongs in each owned directory. A new field or transition becomes an S1 amendment prerequisite, never four local fixture forks.
Live API/auth/provider composition needs a later reviewed production contract. No live fallback to these mocks is permitted.


## Consumer-to-service acceptance matrix (required before freeze)
Every operation is Promise-based with typed outcomes. Ordinary mutations take requestKey, expectedGeneration and actor/scenario context and follow the ordinary-mutation rules below. resetPreview is a separate control operation using the resetReceipts rules, not the ledger it clears. Query failures and deterministic mutation failures must be reproducible.

| Consumer | Required records/queries/mutations | Required states and assertions |
|---|---|---|
| A-01 F03/F05 | Venue and planner catalogues with location/budget/recommendation metadata; listVenues/listPlanners; submitBooking/registerPlanner/submitRequirement; persisted draft | Own venue, validation, draft reload/back, successful linked IDs, empty/error/retry |
| A-02 F04/F06 | List/get booking, requirement, event, versioned quotation and separate client collection ledger; clientApproveQuote and clientRequestQuoteRevision with quote ID, expected version and reason for revision | Stale-version approval rejects, duplicate request replays, revision request remains distinct from Operations editing a quote; pending/approved/revised quote; unpaid/processing/failed/uncertain/paid sample collection status; missing reference is not paid |
| B-01 F01/F02 | submitEnquiry and enquiry receipt stored in the shared scenario | Required fields, validation/retry, deduplicated repeated request; no real message sent |
| C-01 F07 | registerApplicant/submitAssessment; application and assessment records | Invalid/pending/rejected/approved-sample/error; no fake live KYC |
| C-02 F08/F09 | List/get opportunity, claim, respond, list assignments/roster | Capacity 6/40, eligibility, full, overlap, duplicate claim, Coming/Not Coming distinct, roster consistency |
| C-03 F10/F11 | Event pass, attendance evidence/history, earning breakdown, payout history, rating and standing queries | Wrong event/expired/duplicate scan outcomes; missing/denied GPS distinct from outside radius; under-review not permanently blocked; zero earnings and uncertain payout |
| D-01 F12/F13 | Event/position/requirement lists/details/filtering, roster, metric queries from shared records | Multiple functions, quantities 6/40, empty/error, metrics reflect worker claim |
| D-02 F14/F15 | reviewApplication/changeRole; recordAttendance/correctAttendance; markNonresponse; adminAssign/replaceAssignment via one allocation mutation; audit query | Reason validation; missing/outside GPS; full/ineligible/overlap replacement rejects; failed replacement preserves original allocation; successful replacement updates old/new capacity atomically in the simulation; nonresponse and human-decision audit |
| D-03 F16 | reviseQuote including lines/entity/version; view/adjustEarning; sequential approvals; payout status query and deterministic scenario transitions | Integer paise gross/deductions/net; proposed tax lines labelled; zero/adjusted earnings; duplicate/reordered approvals; immutable processing batch; processing/failed/uncertain/reversed/paid distinct; no live transfer |

For each row, S1 adds deterministic data and behavioral assertions appropriate to the service layer. Consumer UI work remains in its lane. Exact names may be refined in S1, but the exported mapping and tests must be documented before freeze. No consumer creates a competing shared fixture or mutation.
Persistence stores synthetic preview data only. Use sample choices and warnings; do not solicit identity-document uploads, real bank details or other sensitive fields. Reset replaces only this preview envelope as defined above; it does not clear unrelated browser storage. Client-entered arbitrary data cannot be guaranteed synthetic merely by labelling it; this is a local preview limitation, not a privacy certification.


## Normative generation, mutation and reset protocol
This is a single-browser preview simulation, not a cross-tab/device or server concurrency guarantee. One in-process store serializes its commits. Capture expectedGeneration when the user invokes an action; callers supply that captured value with every request. Never silently substitute the current generation during retry.

Ordinary mutation input: {requestKey, expectedGeneration, actorId, operation, payload}. requestKey is nonempty. Canonically fingerprint operation, actorId and payload. Identity is (expectedGeneration, requestKey), across all ordinary operations. Inside the serialized commit section: first compare expectedGeneration with current generation; mismatch returns STALE_GENERATION without writing. Then check ordinaryRequestLedger: matching fingerprint returns the stored result with no effect; different fingerprint returns IDEMPOTENCY_CONFLICT. Otherwise validate against current records and persist resulting records plus receipt together. Async preparation must not write: re-check generation and relevant state in that commit section after any await. Do not yield between final validation and commit. A failed persistence write must not be reported as persisted success. Delay tests must prove old-generation work cannot overwrite a reset envelope.

resetPreview input: {requestKey, expectedGeneration, actorId}; no application-data payload. Identity is (expectedGeneration, requestKey), in the SEPARATE resetReceipts ledger. Fingerprint includes operation=resetPreview and actorId. Inside the same serialized commit section, FIRST look for this reset receipt: identical fingerprint returns its original {fromGeneration,toGeneration,resetId} receipt, even if current generation has advanced; it does not mutate anything. Different fingerprint returns IDEMPOTENCY_CONFLICT. Only if no receipt exists, compare expectedGeneration to current generation; mismatch returns STALE_GENERATION. Otherwise atomically persist generation+1, initial scenario records, empty ordinaryRequestLedger, and resetReceipts extended with this receipt. Do not clear the reset receipt when clearing ordinary receipts. Keep reset receipts throughout the stored preview lifetime, including reload and later resets; no automatic receipt eviction is permitted by this contract. Explicit manual browser-storage removal is outside the retry guarantee.

Example: generation0 ordinary claim keyK succeeds; Reset keyR at expected0 advances to1. Repeating Reset keyR at expected0 returns its original receipt and stays at1 (also after reload). A different Reset keyR2 at expected0 returns STALE_GENERATION. The old claim keyK at expected0 returns STALE_GENERATION; keyK at expected1 executes once against reset data, then replays on retry. Reset keyR at expected1 is a new logical reset and advances to2; a retry of the original expected0/keyR still returns its original receipt without changing generation2. A reset response carries a receipt, not an old full-state snapshot; UI reads current state so delayed responses cannot reinstall old records.

Required tests also cover two reset calls captured at the same generation: the same key produces one increment/replay; different keys yield one success and one STALE_GENERATION. Ordinary same-key/different-payload fails before another effect. Reload preserves both normal replay and reset replay. These are future S1 tests, not checks claimed executed by documentation bootstrap.
