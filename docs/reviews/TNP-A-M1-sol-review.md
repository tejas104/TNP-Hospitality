# TNP-A-M1 consolidated independent Sol review

Review target: `1cd1209f8cf3a26336cb839a4b8d2e6adb6c6e12`  
Launch baseline: `f2bfd882d738125e31f5de70896cf6a65d385990`  
Prompt 1 checkpoint: `db2c9bef7736a60de09c9d999ac60c083b93f6d2`  
Mode: fresh independent, read-only, consolidated review of both milestone prompts. No implementation edits, commit, push, merge, deployment, or production action.

Reviewer: `gpt-5.6-sol`, reasoning effort `high`, fresh agent `/root/a_m1_review`. Browser smoke, typecheck and lint were performed by the parent architect and supplied as coordinated evidence; they were not independently rerun by this reviewer. No reviewer subagents or implementation edits. The parent corrected the exact typecheck command transcription below after receiving the report.

## Result

**FINDINGS — correction and fixed-SHA re-review required before integration.**

### [High] 1. Reloading a completed form loses the logical request identity and creates duplicate records

- `components/tnp/portals/client/ClientExperience.tsx:255-272`
- `components/tnp/portals/planner/PlannerPortal.tsx:211-223`
- `components/tnp/portals/planner/PlannerPortal.tsx:247-275`

Each submit constructs a fresh `requestKey`; the only retained request is component state (`ClientExperience.tsx:112-113`, `PlannerPortal.tsx:87-90`). A reload preserves the form draft but discards the request key and success receipt. Submitting the unchanged logical action therefore creates another record instead of replaying or showing the prior result.

The coordinated browser check reproduced this at the fixed SHA: the first client submit created `tnp-demo-booking-002`; reload restored the same step-4 draft; pressing the unchanged submit action created `tnp-demo-booking-003`.

Impact: the required persisted-draft/idempotency behavior is broken and a normal refresh/resubmit creates duplicate bookings. The planner registration and requirement flows use the same lifecycle and have the same defect.

Minimal correction: persist the pending request (including `requestKey`, `expectedGeneration`, operation, payload fingerprint, and eventual receipt) before invoking the mutation; hydrate it on reload and reuse it for the same unchanged logical action. After a confirmed success, show/disable the completed action until the user explicitly starts or materially changes a new record. Do not silently reuse the key for a different payload.

### [High] 2. A paid collection with no reference is still rendered as paid

- `components/tnp/portals/client/ClientStatusHub.tsx:535-549`

`confirmedPaid` correctly requires both `status === 'paid'` and a reference, but the false branch renders `item.status`. For `{status: 'paid', reference: null}`, the pill therefore still says `paid`, directly contradicting the adjacent “not treated as paid” copy and the acceptance rule that an unknown/missing reference never means paid.

Impact: the finance-status UI can communicate a false paid outcome.

Minimal correction: derive one display state and styling state that maps `paid` without a reference to an explicit non-paid/unconfirmed label; use that derived state for both text and `data-state`. Add a UI-level assertion for the malformed/missing-reference case, because the canonical fixture currently contains no paid-without-reference record.

### [High] 3. Persisted planner selections are not reconciled, and booking/event linkage is not validated before mutation

- `components/tnp/portals/planner/PlannerPortal.tsx:132-136`
- `components/tnp/portals/planner/PlannerPortal.tsx:157-169`
- `components/tnp/portals/planner/PlannerPortal.tsx:247-267`

On load/reset, stored `bookingId` and `eventId` are retained whenever they are merely nonempty; their existence and relationship are not checked. The dropdown only lists `matchingEvents`, but a stale controlled `eventId` can remain set even when it is absent from those options. Submission validates only nonempty IDs, then sends them unchanged.

Impact: after reset or stale local storage, the UI can submit an invalid pair. If both IDs still exist but belong to different records, the frozen shared service also does not enforce `event.bookingId === bookingId`, allowing a cross-linked requirement. This violates the milestone's record-identity requirement.

Minimal A-owned correction: when references load or reset, retain a booking only if it exists; retain an event only if it exists and belongs to that booking; otherwise select a valid linked event or clear the field. Before mutation, require `events.some(event => event.id === draft.eventId && event.bookingId === draft.bookingId)`. Separately escalate the shared-service invariant because it is outside A's owned paths.

### [Medium] 4. Shared reset leaves A-owned success, pending, and timeline state referring to removed records

- `components/tnp/portals/client/ClientExperience.tsx:160-168`
- `components/tnp/portals/client/ClientExperience.tsx:635-655`
- `components/tnp/portals/planner/PlannerPortal.tsx:76-90`
- `components/tnp/portals/planner/PlannerPortal.tsx:142-150`
- `components/tnp/portals/planner/PlannerPortal.tsx:359-380`
- `components/tnp/portals/planner/PlannerPortal.tsx:480-499`
- `components/tnp/portals/planner/PlannerPortal.tsx:504-525`
- `components/tnp/portals/client/ClientStatusHub.tsx:131-143`

The reset handlers only reload query data. They do not invalidate booking/planner/requirement success IDs, pending request objects, quote notices, or the planner status timeline. The contract allows a clearly separate local draft, so the draft need not be erased; however, a successful shared record that reset removed must not continue to be presented as current persisted success.

Impact: after “Reset preview,” the UI can still show a removed booking/registration/requirement as saved and mark requirement stages complete. Old retry controls can also target the prior generation.

Minimal correction: on `tnp-preview-reset`, clear or revalidate mutation receipts, success IDs, pending requests, lookup/quote notices, and timeline state against the new generation, while preserving only the explicitly documented local draft fields. Reconcile draft references as in finding 3.

### [Medium] 5. A persisted Review step becomes a dead primary action in the Empty state

- `components/tnp/portals/client/ClientExperience.tsx:205-226`
- `components/tnp/portals/client/ClientExperience.tsx:255-256`
- `components/tnp/portals/client/ClientExperience.tsx:627-655`

Review validation checks detail fields but does not revalidate the venue or planner. When a persisted Review draft is loaded and the catalogue is switched to the explicit Empty state, `venue`/`planner` become undefined, but the submit button stays enabled. `submit()` then returns silently on `!venue`, producing no error or recovery path.

Impact: the primary action is dead in a required scenario state, and an invalid restored draft is not explained.

Minimal correction: Review submission must validate all prerequisite steps, surface venue/planner errors, and either move focus to the invalid step or disable submit with an explained state while catalogues are not ready.

### [Medium] 6. Non-version quote failures are announced with a success icon

- `components/tnp/portals/client/ClientStatusHub.tsx:187-207`
- `components/tnp/portals/client/ClientStatusHub.tsx:226-246`
- `components/tnp/portals/client/ClientStatusHub.tsx:485-493`

The quote notice chooses an alert icon only when the message contains `STALE_VERSION`; every other failure, including `STALE_GENERATION`, `IDEMPOTENCY_CONFLICT`, validation, or not-found outcomes, receives `CheckCircle2`.

Impact: structured mutation errors can be visually presented as success, weakening the required error recovery and truthful stale-generation behavior.

Minimal correction: store an explicit notice outcome (`success`/`error`) from `result.ok` and render icon/style from that value, never by searching message text.

## Inherited shared issue outside the A diff

`components/tnp/shared/PreviewControls.tsx:17-18,35-46` resets its in-memory sequence to zero after reload. The first variant mutation can persist `preview-controls-variant-1`; after reload, choosing a different variant reuses that key with a different payload and receives `IDEMPOTENCY_CONFLICT`. A memory-backed service probe reproduced the collision. This file is frozen and unchanged in A-M1, so it is not an A implementation finding; it needs a serialized shared correction. It limits reliable loading/empty/error browser verification across reloads.

## Verification evidence

- Immutable source reviewed with `git show 1cd1209f...:<path>`; the main checkout SHA was not treated as the review target.
- `git merge-base --is-ancestor f2bfd882... 1cd1209f...`: PASS.
- `git merge-base --is-ancestor db2c9bef... 1cd1209f...`: PASS.
- `git diff --check f2bfd882... 1cd1209f...`: PASS.
- Diff ownership: PASS; exactly eight files, all under `components/tnp/portals/client/**` and `components/tnp/portals/planner/**`.
- `node --experimental-strip-types --test tests/preview-contract.test.mjs`: PASS, 13/13. The fixed and current test blobs are identical. These service tests do not exercise A's component reload, local draft, reset, or rendering lifecycles.
- Coordinated exact-candidate `node D:/TNP-worktrees/TNP-A-M1/node_modules/typescript/bin/tsc --project D:/TNP-worktrees/TNP-A-M1/tsconfig.json --noEmit --incremental false`: PASS.
- Coordinated exact-candidate `npm run lint`: PASS with 0 errors and 3 inherited React compiler warnings (`hooks/use-mobile.ts:16`, `AppShell.tsx:60`, `AppShell.tsx:94`).
- Build was not rerun in this review; the builder-reported build remains a claim for this review packet.

## Browser evidence and limitations

The coordinated fixed-SHA smoke check covered 390x844 and 1440x900. Client submit/list/detail/reload, two planner requirement identities, stale-version guard, missing-record state, viewport overflow, and captured console errors were checked. Requirement `001` and `002` displayed the correct distinct details; scroll widths stayed within both viewports; no console errors were captured. The duplicate booking behavior in finding 1 was reproduced.

This was not full browser acceptance. Loading/error/empty recovery across reload, complete reset reconciliation, keyboard Tab/Enter/Space and visible focus, reduced motion, and every mutation failure/retry path remain unverified. Missing browser evidence is not counted as a code defect above.
