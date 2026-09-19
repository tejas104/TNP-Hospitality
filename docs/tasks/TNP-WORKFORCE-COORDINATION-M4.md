# TNP-WORKFORCE-COORDINATION-M4 — staffing, instructions, confirmation and attendance evidence

Status: DRAFT — no writer, branch, worktree, port or lease. Launch follows the integrated Admin shell and reviewed workforce/notification/location contracts.

Required Admin-frontend author: verified `gpt-6-astra` / medium. Human owner and fixed-SHA acceptance reviewer: Kartik. Fresh Claude plus independent Sol review of allocation, job and privacy state is required.

## Result

Add an event-centred Operations workspace for multi-role requests, multiple Freelancer applications, schedule conflicts, instructions, pre-event reconfirmation, replacement approval and point-in-time attendance-scan location evidence.

## Proposed ownership

- new `components/tnp/portals/operations/workforce/**`
- an explicitly leased adoption seam in `OperationsDecisionPanels.tsx` only if still required
- feature-local synthetic adapters, fixtures and tests

## Required UI

- Event control tabs: Overview, Requirements, Team, Attendance, Instructions, Documents and History.
- Multi-role requirement lines with independent quantity, shift and reporting scope.
- Applicants/assignments show truthful availability and privacy-safe `Selected for another event` conflicts while leaving non-overlapping applications active.
- Confirmation centre with deadline/countdown, Coming/Not Coming, reminder delivery history, overdue/nonresponse and notification-failure queues.
- Replacement case with candidate proposal, conflict reason and Admin/co-admin approve/reject result.
- Worker, role-team and event-team instructions with visible author, audience, revision and acknowledgement; internal notes are separate.
- Attendance evidence says `Location captured at check-in`, timestamp, accuracy and missing/denied/outside states. Optional map opens on demand; never claim live tracking.
- Planner access remains event/grant scoped and bank/KYC/internal-note data stays hidden.

## Critical states

Duplicate/delayed reminders, event reschedule, confirmation-versus-expiry race, two-admin replacement race, wrong/expired/replayed scan, location permission denial, low accuracy, provider failure, offline, stale revision and lost-response replay.

Sound is opt-in after user interaction and is not the sole alert. Preview timing assumptions remain labelled until DEC-26 is accepted.

## Verification

- Desktop/mobile/keyboard/reduced-motion/200% zoom, Android Chrome and iOS Safari behavior.
- Mobile Lighthouse performance above 80 on event/team control, median of three comparable production-build runs.
- Focused tests prove independent role quantities, future/non-overlap applications, conflict privacy, reminder slot deduplication, post-confirmation job no-op, expiry race, one replacement and distinct GPS states.
- Full Operations regressions, lint, explicit TypeScript, Vercel build, diff and console/hydration checks.

One immutable fixed SHA, independent reviews and Kartik acceptance precede P-controlled integration. No production notifications, location collection, main push or deployment.
