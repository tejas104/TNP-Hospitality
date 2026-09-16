# TNP engineering starter templates

Updated 16 September 2026 for three humans, two laptops and up to five isolated implementation lanes. Companion to [AI Operating Manual v3](TNP-AI-Operating-Manual-v3.md) and [Execution Plan v3](TNP-25-Day-Execution-Plan-v3.md).

These are copy-ready examples for an agreed setup branch. They have **not** been installed as live repository instructions or configuration. Merge with existing files deliberately; do not overwrite working team instructions. Replace task-specific examples and confirm business decisions before treating them as accepted policy.

## 1. Root AGENTS.md

```markdown
# TNP engineering instructions

## Product and milestone
- Web-only delivery across 25 calendar days.
- Day 3 is an interactive frontend review: 16 of 20 defined screen sets.
- Preview readiness and production integration are separate statuses.
- Reuse the approved TNP website and Operations format.
- Read docs/PRODUCT.md, docs/DESIGN.md and the assigned task before editing.
- Read relevant docs/DOMAIN-RULES.md, architecture and contracts for domain work.

## Current repository
- React/Vinext demo; preserve the existing build during the frontend push.
- Do not introduce a new framework, database or package-manager migration
  without a documented decision and task.
- MongoDB Atlas is the agreed database direction for the backend.
- Business authority belongs in the shared API, so future mobile can reuse it.

## Ownership
- H1: public/client/planner; coordinates shared UI and global styles.
- H2: events/finance; coordinates jobs, dependencies and deployment.
- H3: identity/workforce/attendance; coordinates worker and identity contracts.
- Humans H1/H2/H3 are not execution lanes A/B/C/D/E.
- Laptop 1: A/B/C Codex, D Claude Code initially. Laptop 2: E Codex.
- Models/tools may change between tasks; record the actual author.
- Every active implementation TASK declares lane, human owner, unique
  branch/worktree, baseline, dependencies, owned areas, do-not-modify
  boundaries, acceptance criteria and required tests.
- Never run multiple implementation writers in the same worktree.
- Parallel tasks also need disjoint file/contract/test-resource ownership.
- Up to five implementation writers; normally three or four. Idle is valid.
- Obtain context from canonical repository documents, not chat history.
- Shared contract/file changes require coordination with the named owner.
- Never discard another developer's changes to clear your working tree.

## Dispatch and review
- Dependencies must be satisfied before dependent implementation starts.
- At two tasks waiting for review, clear the queue before dispatching more.
- Routine implementation normally gets opposite-model task/PR review.
- Architecture, security, concurrency, payments/payouts, financial integrity
  and difficult cross-module changes require independent Astra review.
- Review the exact task/PR commit, never an arbitrary count of prompts.
- Reviewer starts read-only; original builder fixes confirmed findings.
- If a reviewer writes a fix, classify it as implementation and obtain
  fresh independent review; no self-certification.
- Integration patches are bounded tasks; merge with review/CI evidence.

## Execution
- Implement the bounded task and run its relevant checks.
- Proceed with routine authorized work; ask only for a missing decision
  that materially blocks correctness, identifying dependent work.
- Preserve the client's approved visual direction.
- Keep mock and HTTP adapters behind the same declared contract.
- Use synthetic data only in preview; label simulated behavior accurately.
- No native app or continuous background geofence promise in this release.
- Do not store authoritative auth, capacity, attendance or money rules in UI.
- Financial values are integer paise; source identity from the server session.
- Enforce permissions and ownership on the server.
- Claims, attendance and payouts need the domain invariants and failure tests.

## Verification commands available at setup
- npm ci
- npm run lint
- npx --no-install tsc --noEmit
- npm run build:vercel
- npm run dev (use the printed local URL)
- No test/test:e2e script is assumed until installed and documented.
- Open significant UI changes in the browser and check responsive states.

## Completion
- Report what changed, task acceptance, checks actually run and limitations.
- Never claim a simulated integration or unrun check passed.
- Record a stable commit for independent review.
- Review the intended diff; avoid staging unrelated files.
- Keep secrets and real personal information out of source, fixtures and logs.
- External publication, production release and real money operations require
  the actual authorization for that task; this file grants none by itself.
```

## 2. Root CLAUDE.md

```markdown
# Claude Code: TNP project entry point

Read AGENTS.md as the shared engineering policy for this repository.
Read docs/PRODUCT.md, docs/DESIGN.md, the assigned task and its referenced
domain rules/contracts. Confirm current directory, branch and commit.

Use repository facts and recorded client decisions, not memories of a
different conversation or laptop. Explain conflicts instead of silently
rewriting shared policy.

For planning, propose a bounded task with acceptance and dependencies.
For review, inspect the exact BASE_SHA..HEAD_SHA and do not edit source.
Prioritize correctness, authorization, races, finance/attendance integrity
and then UI/accessibility regressions. Report concrete actionable findings
with file/line, trigger and impact. Separate uncertainty from demonstrated
failure and state which verification you actually performed.

When explicitly assigned implementation, become the sole writer for that
task only after the previous writer stops. Follow the same task contract
and checks as Codex. Do not merge or deploy without task authorization.

Routine Codex-authored tasks normally receive Claude review; Claude-authored
tasks receive Codex review. High-risk categories require independent Astra
review as stated in AGENTS.md. Read docs/LANES.md and verify the writer lease.
```

Both tools must verify that they read the shared policy. Do not assume a textual reference automatically imports every document; the startup prompt explicitly directs the tools to read them.

## 3. docs/PRODUCT.md

```markdown
# TNP product baseline

## Outcome
Connect enquiry, quotation, event staffing, verified attendance and
approved monthly worker payments in one web platform.

## Delivery
- 3 human developers; 2 laptops; up to 5 isolated implementation lanes.
- 25 calendar days; human supervision/review/testing constrain throughput.
- Day 3: 16/20 screen sets ready for client frontend review.
- Day 6: remaining frontend and accepted review revisions complete.
- Day 18: feature freeze and production integration complete.
- Days 21–22: client UAT. Day 24: authorized release. Day 25: handover.
- Kickoff date: record the agreed actual date before scheduling.

## Design baseline
- https://tnp-hospitality-demo.vercel.app/
- https://tnp-hospitality-demo.vercel.app/admin
- Preserve approved website and Operations format.

## Scope references
Read deliverables/TNP-25-Day-Execution-Plan-v3.md for current execution,
ownership, milestones and review gates. Its reference to v2 Section 3
preserves the screen inventory only, not the old staffing assumptions.
Earlier delivery plans remain historical scope/research references.

## Explicit distinctions
Frontend preview uses labelled synthetic data. Production integration
requires real APIs, authorization, persistence and verification.
Native mobile is separate future work using the same platform API.

## Proposed scope decisions awaiting contract confirmation
Full automated WhatsApp RSVP and guest identity-document collection are
proposed for Phase 1.1. Basic guest tracking remains in the launch plan.
Record the client's decision here; do not label it approved without evidence.

## Client decision owner
Record name, communication channel and response expectation.
Record UAT participants and Day 3 review slot.
```

## 4. docs/DESIGN.md

```markdown
# TNP design baseline

## Approved direction
Client likes the existing public website and especially Operations format.
References are in PRODUCT.md. Record reference deployment/commit and
screenshots before modifying the demo.

## Preserve
- Deep teal/ivory/champagne palette and existing typography system.
- Public photography composition and working editorial animations.
- Operations dark sidebar, cream overview heading, metric tiles,
  light verification panels, event control and clear status indicators.

## Adapt
- Use compact mobile worker layouts rather than a desktop sidebar.
- Use shorter headings on dense detail screens.
- Keep client discovery/wizard distinct from admin operations.
- Retain event-control composition; represent verified attendance and
  exceptions rather than continuous background geofence monitoring.

## Shared patterns
Page shell/header, metric, list/table, status badge, labelled field,
detail panel, confirmation dialog, skeleton, empty/error state.

## Review evidence
For each F01–F20 set record owner, preview URL/commit, desktop/mobile
checks, primary interaction, relevant states and accepted client feedback.
No completion credit for a dead primary button or an empty template.

## Feedback decisions
ID | screen | change | reason | decision | owner | target | evidence
Populate after the client review; silence is not acceptance.
```

## 5. docs/DOMAIN-RULES.md starting checklist

```markdown
# TNP domain rules: initial baseline

## Invariants
- Identity and permissions are checked on the server, including ownership.
- Only eligible approved workers can reserve valid positions.
- Capacity, active assignment and overlap reservation remain consistent.
- Retries cannot create duplicate assignments, earnings or successful transfers.
- Admin assignment overrides never silently overfill capacity.
- Attendance requires an eligible assignment and authorized event-scoped TL.
- Missing GPS is recorded as missing; it is never silently treated as valid.
- Attendance corrections preserve original evidence and require a reason.
- Earnings derive from verified attendance and an agreed rate snapshot.
- Team Leader/coordinator and Finance Admin approvals are explicit and auditable.
- Money is integer paise; collection and worker payout ledgers are separate.
- Provider reference alone does not prove payout success.
- Three consecutive poor ratings trigger human review, not automatic
  permanent deactivation.

## Decisions still requiring business confirmation
Initial acceptance versus event-day reconfirmation; expiry/cancellation;
overlap/setup/travel interval; flat-shift/hourly pay; missing checkout;
overtime/penalties; rate precedence; rating threshold/order; monthly cutoff;
late approvals; invoice/deposit/refund policy; outside-radius handling.

For each: record question, proposed default, decision owner, deadline,
actual decision and affected tasks. Never convert a proposed default into
accepted policy without a decision record.
```

## 6. docs/ARCHITECTURE.md starting record

```markdown
# TNP architecture record

## Current implementation
Existing React/Vinext/Vite frontend and Vercel preview build. Portal
components are being divided into owned slices; use actual paths.
Do not claim the planned API is already implemented.

## Target
Responsive web -> typed service interface -> HTTPS API -> Node/Express
domain modules -> MongoDB Atlas/private storage -> durable jobs/providers.
Future mobile uses the same API and domain rules.

## Boundaries
H1: demand/client/planner. H3: identity/workforce. H2: events/finance/jobs.
H2 owns the single allocation service; H3 owns worker eligibility and
overlap requirements. Agree their transaction contract before building.
Assign implementation to an available A–E lane by TASK. Human owner and
model/tool are separate fields; docs/LANES.md records active writer leases.

## Preview
Shared synthetic scenario and mock adapter with reset behavior.
No live credentials, no real PII and no production calls.

## Decisions to record
Production build/hosting route; API contract tooling; Mongo transaction
and index design; session/auth provider; durable job mechanism; provider
adapters; storage/backup/restore; web notification fallback.

For each consequential decision: status, reason, alternatives, tradeoff,
owner and evidence. Day 3 design review does not settle every backend choice.
```

## 7. A ready task example: docs/tasks/TNP-F08.md

```markdown
# TNP-F08: worker opportunities and event detail preview

Responsible human owner: H3
Assigned lane: E (Laptop 2)
Implementation tool/model: Codex / Sol Medium; verify availability
Opposite-model reviewer: Claude; human reviewer H2
Risk: frontend preview; escalate security/concurrency implementation to Astra
Branch: codex/tnp-f08-opportunity-feed
Worktree: C:\dev\tnp-work\h3\TNP-F08 (create unused path through Git)
Base commit: populate actual merged prerequisite SHA before dispatch
Milestone: Day 3 frontend review
Mode: labelled synthetic preview; production integration NOT included
Dependencies: S0 shared extraction/theme; S1 DTO/fixtures; record merged SHAs
Status: draft until dependencies and exact owned paths are confirmed

## User outcome
A worker can find an eligible sample event and understand its role, time,
location, pay and remaining capacity before continuing to the claim flow.

## Owned area
Freelancer portal component and worker feature adapter/fixtures.
Record actual file paths after the shared PortalPages extraction.
Do-not-modify boundaries: global styles, Operations components, canonical
shared fixture/contracts, auth, allocation server and provider integrations.
Request a prerequisite change if one of these must change.

## References
AGENTS.md, PRODUCT.md, DESIGN.md, DOMAIN-RULES.md and the workforce contract.

## Preview contract
Opportunity: id, eventId, positionId, title, roleLevel, startAt, endAt,
timezone, venueSummary, payRatePaise, requiredQty, filledQty, eligibility.
Service returns a paginated shape, even if fixture data is small.
Errors are explicit; no unlabelled always-success path.

## Acceptance
- Mobile-friendly feed and detail panel use approved TNP patterns.
- Role/location filter controls operate on sample data.
- Event details show reporting information and clear pay units.
- Full/unavailable opportunity disables the claim action with a reason.
- Loading, no-results and service-error states are demonstrable.
- Link to F09 carries the correct event/position ID.
- Sample claim outcome updates the shared roster fixture on navigation.
- Preview role is not treated as a production authorization mechanism.

## Required tests and verification
npm run lint; npx --no-install tsc --noEmit; npm run build:vercel.
Run commands separately; record actual results. Contract/adapter checks:
valid, full and unavailable fixtures render the expected distinct outcomes.
Browser checks at desktop and phone widths; keyboard selection, focus,
filter, full-capacity, empty/error and refresh behavior.
No payment, KYC, GPS or real network provider success is claimed.

## Completion evidence
Changed files, commit, preview URL, checks actually run, screenshots,
known gaps, peer reviewer and integration status.
```

## 8. Review/handoff record

```markdown
# Review: TASK_ID

Author:
Responsible human:
Assigned lane / host:
Implementation tool/model/effort:
Dependencies and merged prerequisite SHAs:
Owned areas / do-not-modify boundaries:
Reviewer (human and tool):
Repository/worktree path:
Branch:
BASE_SHA:
HEAD_SHA:
Task contract:
Preview URL and deployed commit:
Mode: frontend preview / production integration
Risk classification:
Independent Astra review required? reason / reviewed SHA / disposition:
Writer lease: active / paused / released; last verified by:

## Builder handoff
User outcome:
Changed files:
Behavior implemented:
Checks actually run and results:
Known gaps:
Next action:

## Findings
ID | severity | file/line | trigger | impact | suggested fix | verified?

## Human disposition
ID | confirmed / reproduce / rejected / duplicate | reason | owner

## Fix verification
Finding | fix commit | reproduction/check | result | reviewer

## Conclusion
Reviewed commit:
Unresolved blockers:
Checks not performed:
Ready for PR / further work:
```

## 9. docs/STATUS.md

```markdown
# TNP current status

Updated by / at:
Current milestone:
Main commit:
Staging URL / commit:
Client-review URL / commit:
Release captain:

## Coverage
ID | human owner | frontend state | production state | evidence | next action
F01 | H1 | unassessed | unassessed | none recorded | baseline review
F08 | H3 | unassessed | unassessed | none recorded | baseline review
F12 | H2 | unassessed | unassessed | none recorded | baseline review
Populate all F01–F20 from the plan. Count only review-ready rows.

## Active tasks
Task | human | lane | model | branch/worktree | dependency SHA | next handoff
Track docs/LANES.md leases and resource ownership. Maximum five writers;
normal four or fewer. Review queue limit: two waiting tasks.

## External dependencies
Provider/content | owner | test state | live state | decision date | impact
No keys, passwords or personal information in this table.

## Client decisions
Feedback/decision ID | outcome or pending question | owner | due date

## Next working day
H1:
H2:
H3:
```

## 10. Pull-request description

```markdown
## Outcome
Concrete user problem and resulting behavior.

## Scope
Task ID, frontend-preview/production mode, affected domain and contracts.

## Verification
Exact commands and browser/domain scenarios actually run; results.
Preview URL and reviewed/deployed commit where relevant.

## Risks and gaps
Remaining limitations, provider dependencies and migration implications.
No claim that synthetic data proves a production integration.

## Review
Independent human reviewer; AI review record; unresolved findings.
```

## 11. Client feedback record

```markdown
# TNP Day 3 frontend review

Date/time:
Client participants and decision owner:
Preview URL / commit:
Coverage demonstrated: __ / 20 screen sets
Production integration demonstrated separately:

## Decisions
ID | screen | requested change | reason | classification | decision | owner

Classifications: scope defect, presentation revision, business rule, new scope.

## Approved
Specific layouts/workflows/fields and evidence of acceptance.

## Pending
Decision, affected work, owner and next checkpoint.

## Remaining 20%
F17–F20 plus any target set that did not pass its checklist.

## Next delivery
Accepted changes and Days 4–6 demonstration date.
```

## 12. docs/LANES.md and dispatch template

```markdown
# Lane register

Canonical dispatcher/captain:
Updated at:

Lane | host | human | tool/model/effort | TASK | branch | absolute worktree
A | Laptop 1 | H1 | unassigned | none | none | none
B | Laptop 1 | H1 | unassigned | none | none | none
C | Laptop 1 | H2 | unassigned | none | none | none
D | Laptop 1 | H2 | unassigned | none | none | none
E | Laptop 2 | H3 | unassigned | none | none | none

Per active TASK record:
baseline SHA; satisfied dependency IDs/SHAs; owned paths/contracts;
do-not-modify paths/contracts; ports; test DB/fixture namespace;
writer lease state; next human checkpoint; reviewer/model; Astra risk gate.

Before dispatch verify:
contract complete, dependencies merged, isolated worktree, no overlapping
owned resources, human supervision available, reviewer available and
review queue below the pause threshold. Never dispatch for utilization alone.

Planning session P:
read-only analysis unless a documentation task obtains an A–E writer lease.
Review session C:
read-only unless explicitly reassigned to implementation; any fix requires
fresh independent review and counts toward the five-writer ceiling.
```

## 13. Generic mandatory TASK contract

```markdown
# TASK-ID — concrete outcome

Status: Draft / Ready / Building / Review / QA / Done / Blocked
Responsible human: H1/H2/H3, actual name
Assigned lane and host: A/B/C/D/E and Laptop 1/2
Tool/model/effort: actual setting, not a permanent lane assumption
Branch:
Absolute isolated worktree:
Baseline commit:
Dependencies: TASK IDs and merged commit/evidence, or explicitly none

## Goal and mode
User outcome; frontend preview or production integration.

## Canonical context
Current product/design/domain/architecture/contract documents and decisions.

## Owned areas
Explicit files/directories, domain/API contract and test-resource namespace.

## Do-not-modify boundaries
Explicit files/contracts/providers/data. Name shared prerequisites separately.

## Acceptance criteria
Observable success, rejection/error and recovery behavior.

## Required tests
Exact existing commands and browser/domain scenarios, expected results,
test-data environment and required manual checks. No nonexistent scripts.

## Risk and reviews
Opposite-model reviewer; independent human reviewer.
Astra gate: required for architecture/security/concurrency/payment/payout/
financial-integrity/difficult cross-module changes; record reason either way.

## Resource and writer lease
Ports; database/fixtures; webhook/job ownership; writer state; human check time.

## Handoff
Base/head SHA, actual checks, findings/disposition, next action and merge order.
```

A TASK remains Draft until these fields are concrete and its prerequisites pass. Required changes to a shared area become a prerequisite task or a serialized ownership handoff. Read-only reviewer/planner sessions do not bypass the writer limit when they begin changing files.

## 14. Setup task prompt

Use this after the team decides to install the shared guidance. It is not an instruction that has already been executed.

```text
Prepare the TNP shared engineering setup in a dedicated branch.
Read current repository instructions, Execution Plan v3, Operating Manual
v3 and model guidance. Historical operating models are superseded.
Inspect existing files first. Merge the starter templates into AGENTS.md,
CLAUDE.md and the docs files without overwriting unrelated guidance.
Resolve actual commands, paths and owners from the repo/team decisions.
Keep proposed business policies visibly pending until the client decides.
Do not migrate frameworks, change the database, install unnecessary tools,
change account permissions or deploy production.
Run appropriate checks for the changes and report the exact setup still
requiring a human account/configuration action. Do not claim it is done
because a template exists.
```

After installing the files, start fresh Codex/Claude sessions and run the instruction-check prompt from the manual. Verify both identify the same current scope, task, branch and shared rules. Retire obsolete duplicate instructions only after reviewing their content and authority.
