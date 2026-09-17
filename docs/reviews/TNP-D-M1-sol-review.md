# TNP-D-M1 independent Sol/high consolidated review

Reviewer: fresh `/root/d_m1_review`, selected model `gpt-5.6-sol`, reasoning `high`. No reviewer subagents. Findings are based on fixed source and shared-service evidence; the listed UI reproduction steps were not independently executed in a browser. Parent published this report without changing the review conclusions.

## Verdict

**Findings — correction required before milestone acceptance.**

Reviewed immutable remote commit `9785bd5631a99e5372dbca928f62eda52c004384` against launch baseline `58c324953e0f2da775a77efb172059bb84534ae7` and checkpoint 1 `01f7f15dc0e2d2f19f77b258160a3ac4bd3f6228`. The remote ref resolved to the reviewed SHA. The baseline is an ancestor. The diff is limited to the three owned Operations paths and `git diff --check` is clean.

This is a read-only independent review. No source, commit, branch, remote, merge, deployment, provider, or production state was changed.

## Actionable findings

### [P2] Attendance and post-mutation forms submit record IDs that are absent from their visible options

- **Files/lines:** `components/tnp/portals/operations/OperationsDecisionPanels.tsx:108-126`, especially `:118`, and `:154-183`.
- **Reproduction:** Reset the preview and open Attendance exceptions. `recordAssignmentId` is initialized to `tnp-demo-assignment-006`, but reset data contains assignments 001-005. The displayed `missingAttendanceAssignments` options are 003 and 005: 003 is `not-coming` with an expired pass, and 005 is `pending` with no pass. The controlled select therefore has no option matching its submitted state, yet the button is enabled. Submitting uses hidden ID 006 and `getEventPass` returns `NOT_FOUND`. Explicitly choosing 003 reaches `EXPIRED_PASS`; choosing 005 returns `NOT_FOUND`, so the reset-state primary attendance action cannot succeed. After a successful replacement, the panel remounts with `replacementAssignmentId` hard-coded to replaced assignment 002, which is no longer among `activeAssignments`; that form similarly submits a record absent from its select until the user changes it.
- **Impact:** The F15 primary action is initially unusable, the UI can show a different identity (or no selected option) from the identity sent to the service, and a successful mutation immediately leaves another control in a stale state. This fails the working-primary-action, correct-record-identity, refresh/reset, and attendance-evidence acceptance requirements.
- **Fix:** Derive controlled IDs from the current option collections and reconcile them whenever records change. Restrict the attendance list to actually actionable confirmed assignments. Because reset data has no confirmed assignment without attendance, render an explicit empty/prerequisite state, then select the newly created admin assignment after that successful flow rather than keeping an invented ID. Disable submit whenever the selected ID is absent from the current options.

### [P2] Attendance preflight failures expose a retry button wired to a different retained mutation

- **Files/lines:** `components/tnp/portals/operations/AdminOperations.tsx:158-175`, `:192-204`, `:252-255`; `components/tnp/portals/operations/OperationsDecisionPanels.tsx:22-30`.
- **Reproduction:** From reset data, first attempt a replacement of assignment 002 with worker 004. The service returns `INELIGIBLE`, and `pendingAction` retains that replacement request. Next submit the initial attendance form. `getEventPass(006)` returns `NOT_FOUND`; the handler replaces the visible feedback but neither clears nor replaces `pendingAction`. The shared Feedback component renders “Retry same request” for every non-`STALE_GENERATION` error. Clicking it resubmits the old replacement and changes the visible result back to `INELIGIBLE` (an idempotent replay), rather than retrying attendance. If attendance is the first failure, the same retry button is rendered while `pendingAction` is null, so it does nothing. Deterministic validation/rejection errors also receive a retry button even though retrying the same retained key replays the stored failure.
- **Impact:** Recovery is not tied to the action or record named by the current error. Operators can believe they retried attendance while the client actually resubmitted a replacement request; in the initial path, the advertised retry is inert. The service ledger prevents this particular stale rejected request from becoming a new mutation, but the UI violates retry identity and structured-error handling requirements.
- **Fix:** Clear or replace retained retry state before attendance preflight. Model feedback with the exact action identity plus `retryable`, and render retry only when the displayed error has a matching retained request (or a retained composite attendance action that repeats pass lookup and mutation). Do not offer same-request retry for deterministic service rejections.

### [P2] Event filters leave a hidden event's detail and roster visible, including under “No filter match”

- **File/lines:** `components/tnp/portals/operations/AdminOperations.tsx:216-221`, `:252`, `:270-277`.
- **Reproduction:** On the initial Events & roster screen, event 001 is selected. Set Status to `Planned`, which leaves only event 002 in the tabs. `selectedEvent` is still resolved from unfiltered `data.events`, and `selectedPositions`/`roster` remain tied to event 001, so the page displays the Wedding Ceremony detail below a Reception-only result. Enter a search with no matches: the page shows “No filter match” and still renders event 001 detail and roster.
- **Impact:** List, detail, and roster identities contradict the active filter/empty state. An operator can act on or read a record that the UI says is excluded, so F13 filtering and record-identity acceptance are not met.
- **Fix:** Resolve the selected detail from `filteredEvents`, or clear/reselect the event when filters exclude it. Hide detail and roster in the filtered-empty state. Ensure any automatic reselection loads the matching roster before enabling actions.

### [P2] Verification decisions can approve invalid applications or re-decide reviewed applications

- **File/lines:** `components/tnp/portals/operations/OperationsDecisionPanels.tsx:42-50`, `:59-74`, `:90-91`.
- **Reproduction:** Reset data contains application 001 pending, 002 invalid with an empty role and a nonexistent applicant worker, 003 rejected, and 004 approved. Although the UI splits these into pending and reviewed queues, the decision form populates its select from all `applications`. Select application 002 and approve it with the default reason: the shared operation accepts the existing ID/decision/reason, no worker is found to update, and the UI moves a role-less nonexistent applicant into the approved queue. The same control can reject application 004, flipping its worker's approved state even though the worker has an active assignment. After reviewing the only pending record, the panel remounts and defaults back to reviewed application 001, keeping the decision action enabled.
- **Impact:** The decision queue can create internally contradictory verification/assignment displays and treats resolved/invalid identities as ordinary pending work. This undermines the required pending-versus-reviewed outcome, role/identity correctness, and human-decision integrity.
- **Fix:** Limit ordinary decision controls to pending applications, display role and relevant evidence beside the selected pending identity, and disable the form with an explicit empty state when no pending records remain. If re-review is a required future workflow, give it a separately labelled, contract-backed action with explicit consequences instead of reusing the pending review form.

## Verification evidence

- `git rev-parse origin/codex/tnp-d-m1` -> `9785bd5631a99e5372dbca928f62eda52c004384`.
- `git merge-base --is-ancestor 58c324953e0f2da775a77efb172059bb84534ae7 9785bd5631a99e5372dbca928f62eda52c004384` -> exit 0.
- `git diff --name-status 58c324953e0f2da775a77efb172059bb84534ae7 9785bd5631a99e5372dbca928f62eda52c004384` -> only:
  - `components/tnp/portals/operations/AdminOperations.module.css`
  - `components/tnp/portals/operations/AdminOperations.tsx`
  - `components/tnp/portals/operations/OperationsDecisionPanels.tsx`
- `git diff --check 58c324953e0f2da775a77efb172059bb84534ae7 9785bd5631a99e5372dbca928f62eda52c004384` -> pass, no output.
- `node --experimental-strip-types --test tests/preview-contract.test.mjs` -> **13/13 pass** on Node `v22.23.2` after rerunning outside the D-drive filesystem sandbox. These unchanged shared-service tests verify allocation, replacement preservation, attendance evidence/correction/ledger guards, audit, generation/reset, idempotency, and stale-write behavior. They do not exercise the fixed-SHA Operations React UI or the four findings above.

## Limitations and handoff

The fixed source was inspected directly with `git show` from the immutable commit. Creating a detached Git worktree was blocked because the review sandbox cannot write `.git/worktrees`; a local clone fallback was also blocked by repository ownership/sandbox restrictions. I therefore did not independently rerun fixed-SHA lint, TypeScript, build, or browser checks, and I do not treat the builder's reported passes as independent evidence. I did not reproduce desktop/mobile/keyboard screenshots or DOM behavior in this reviewer session. No dependency installation was attempted.

Return all four findings to the original D author in one correction cycle. Re-review the resulting fixed SHA with focused regression on: reset-state form identities, attendance preflight and exact retry action, post-replacement selection/roster/audit, filtered-empty event detail, pending-only application decisions, full/ineligible/overlap replacement rejection with original assignment preserved, approved-ledger correction rejection, `STALE_GENERATION`, and desktop/mobile keyboard focus.
