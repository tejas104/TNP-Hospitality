# TNP 25-day execution plan — version 3

16 September 2026. **Three human owners, two laptops, up to five isolated AI implementation lanes.**

This is the current execution plan. It replaces earlier assumptions about three laptops, one implementation session per developer and fixed model ownership. Preserve the approved TNP design, Day 3 frontend review, 25-calendar-day deadline, web-only release and future shared-API mobile direction.

## 1. Recommendation on the proposed six-chat arrangement

Use **four builders + one review/integration session + one on-demand planning session** as the normal operating mode. This is six conversation roles, but only four active implementation lanes. It is compatible with the five-implementation-lane ceiling.

Do not make every builder wait for a central Astra chat to manufacture its next prompt. Use planning sessions to settle ambiguous business rules, decompose substantial features and produce ready TASK contracts. A builder then reads the contract and canonical repository documents directly.

Reserve the fifth implementation slot for an independent ready task when supervision and review capacity exist. Never keep all five writing merely to maximize utilization. Finishing reviewed, tested work is the throughput measure.

The reviewer is initially read-only. Fixes return to the responsible builder. If the reviewer starts changing code, it becomes a bounded implementation task with its own human owner, lane/worktree and fresh independent review. It cannot certify its own fix as independently reviewed.

## 2. Laptops, lanes and humans

Human labels **H1/H2/H3** deliberately differ from execution lanes **A/B/C/D/E**. Assign real names at kickoff.

| Lane | Host | Initial tool | Suggested human supervisor | Normal role |
|---|---|---|---|---|
| A | Laptop 1 | Codex | H1 | Client/planner implementation |
| B | Laptop 1 | Codex | H1 | Public/shared-UI or another non-overlapping ready task |
| C | Laptop 1 | Codex | H2 | Review/integration coordination; fifth builder only when scheduled |
| D | Laptop 1 | Claude Code | H2 | Operations/finance implementation; routine Claude review when not writing |
| E | Laptop 2 | Codex | H3 | Identity/workforce implementation |

**P — planning session:** on-demand, normally run by H1, using Astra for consequential ambiguity and a cheaper suitable model for routine decomposition. It is not a sixth implementation slot. Read-only analysis is allowed alongside builders; authoring canonical documents is a writing task that must claim an available lane/worktree, usually B or C, and its file boundaries.

Tool/model choice can change between tasks. Record the actual model that authored each change so opposite-model review follows the author, not the lane's historical name. Pause/checkpoint before swapping tools; do not have both write simultaneously.

### Human domain ownership

- **H1:** product/design, public/client/planner demand, client feedback and shared UI decisions.
- **H2:** events/positions/allocation service, finance/providers/jobs, release infrastructure.
- **H3:** identity/permissions, workforce eligibility/overlap, attendance/ratings and basic guests.

H2 and H3 define one claim-service transaction contract. There must not be separate worker-side and admin-side allocation engines. H1 owns shared visual components; a domain owner can authorize another human's lane to implement a bounded change.

Suggested human review rotation: H1 reviews H2's changes; H2 reviews H3's; H3 reviews H1's. High-risk changes also involve the relevant domain owner and independent Astra review. No human is required to sign off code they cannot explain.

### Two laptops are still two interactive workstations

H1/H2 share Laptop 1 with scheduled keyboard/review handoffs. H3 uses Laptop 2. Model inference being remote does not eliminate local build, browser, memory and operator limits. Use individual accounts/seats and appropriate OS profiles or supported separate sessions; verify that switching operators does not interrupt active jobs or expose another person's signed-in account. Do not assume the app supports several simultaneous identities in one desktop instance. If access/session constraints reduce overlap, reduce concurrency.

## 3. Mandatory TASK contract and launch gate

Every simultaneously active implementation task must declare:

1. Unique TASK ID and a concrete outcome.
2. Assigned lane and responsible human owner.
3. Actual tool/model and reasoning setting.
4. Unique Git branch and absolute worktree path.
5. Baseline commit and explicit dependencies, with their completion evidence.
6. Owned files/directories, API/domain contracts and shared resources.
7. Explicit do-not-modify boundaries.
8. Acceptance criteria and required tests/check commands.
9. Preview versus production mode, risk classification and reviewer assignment.
10. Handoff/review record and next integration step.

The human owner checks this before dispatch. An empty field such as “dependencies: whatever is needed” does not pass. Multiple writers never share a worktree. Cross-worktree overlap on owned files or contracts is also prohibited while both tasks are active, unless the dependency is resolved by serializing them.

Canonical repository context: `AGENTS.md`, `CLAUDE.md`, `docs/PRODUCT.md`, `docs/DESIGN.md`, `docs/DOMAIN-RULES.md`, `docs/ARCHITECTURE.md`, `docs/contracts/`, TASK, `docs/STATUS.md`, decisions and review records. Conversation history is not project state. The planner has no private authoritative version of the requirements.

## 4. Scheduler and work-in-progress limits

### Default limits

- Normally **3–4 implementation writers**, maximum **5**.
- Maximum two supervised implementation tasks per human; use one for complex financial/security/concurrency work or during heavy review duty.
- Start a fifth task only when its dependencies are merged, owned areas/resources are free, a human has capacity and the review queue is clear enough.
- Keep at most two tasks waiting for review across the team. When two accumulate, stop dispatching new implementation and clear the queue.
- An unresolved critical finding blocks dependent dispatch and merge. A critical review waiting beyond its agreed review window gets priority over new features.
- Keep roughly one to two days of ready contracts. Do not generate 25 days of detailed prompts against an architecture that will evolve.
- Use short-lived task branches, preferably merged within one working day; split or explicitly replan branches extending beyond two working days.

### Dependency rules

Run tasks together only if they do not write the same files, contract, migration/index definition, fixture or shared mutable test data. Worktree isolation alone does not make coupled changes safe.

```text
S0: preserve approved demo; extract owned portal components; shared tokens
  -> S1: agree DTOs + mock service interfaces + canonical synthetic scenario
     -> client/planner UI
     -> worker UI
     -> Operations UI
     -> public templates (after shared UI prerequisite)

Identity + permissions + event/position contract
  -> safe allocation + overlap reservation
     -> confirmation/expiry/replacement
        -> verified attendance
           -> earning + approvals
              -> monthly payout + reconciliation
```

Frontend consumers can use a frozen mock contract while backend work proceeds. They cannot invent fields and force the backend to catch up silently. Begin after the interface prerequisite is merged, then validate both adapters against it.

### Integration rules

One release captain owns the main integration queue. Merge prerequisites first and one PR at a time. Revalidate a dependent PR against current main. Green CI is required, plus appropriate source review and browser/domain evidence. Run an integrated smoke journey after each meaningful merge; fix or revert a confirmed regression promptly. Do not queue all branches for a late “integration day.”

## 5. Realistic capacity and throughput

Keep the existing assumption of approximately 21 working days per human within the 25-calendar-day period, with four staggered rest days each: **63 human person-days**, not 105 AI person-days. Machine scheduling does not increase this human budget. The old 42/15/6 package allocation is superseded by the human-time model below because supervision/review is now explicit.

Illustrative budget for a fully staffed day with seven focused hours per human:

| Activity across the team | Human hours |
|---|---:|
| Task contracts, dependencies and decisions | 2 |
| Agent supervision, manual implementation and debugging | 6 |
| Source review and finding disposition | 4 |
| Browser/domain/integration testing | 4 |
| Merge, CI and staging/release work | 2 |
| Client communication and status | 1 |
| Unallocated contingency | 2 |
| **Total** | **21** |

Across 21 fully staffed-day equivalents this is 441 hours, including 42 hours of contingency. These are planning assumptions, not measured capacity. Rest-day coverage and the two-keyboard constraint can lower daily availability; never spend the same person's hour twice across lanes.

Initial throughput forecast: **3–5 small accepted tasks per fully staffed implementation day**, **1–3 for difficult coupled work**. A task is a bounded deliverable, not a fixed size unit; screens, prompts and generated lines are not interchangeable with tasks. This is a conservative planning hypothesis to replace after Days 1–3 with actual supervision, review wait, rework and merge data.

Do not budget five 8-hour agent runs as five senior developers. If agents finish faster than humans can inspect, review and test, stop starting work. More unfinished code increases risk rather than delivery.

## 6. Day 3 frontend review remains the first milestone

Preserve the existing website and the Operations Demo format. The screen inventory remains **F01–F20**, with **F01–F16 review-ready by Day 3** and F17–F20 completed after feedback by Day 6. This is 80% of defined frontend review screen sets, not 80% production completion.

The existing [frontend plan v2, Section 3](TNP-Frontend-First-Delivery-Plan-v2.md) contains the screen boundaries and readiness criteria. Its old developer-A/B/C labels map to human owners H1/H3/H2 respectively; this v3 lane assignment supersedes those assignments.

### First three days, dependency-safe dispatch

| Period | A | B | C | D | E |
|---|---|---|---|---|---|
| Day 1 initial block | Wait for shared prerequisites; H1 settles fields | S0/S1 shared UI extraction and fixture interfaces, H1 | H2 coordinates reviews; no competing edits | H2 provider/setup checks; wait on Operations shell | H3 contracts/identity analysis; no parallel edits to S1 |
| Day 1 after prerequisites merge | Client/planner screen slice, H1 | Public template slice, H1 | Read-only review and integration queue, H2 | Operations overview/event slice, H2 | Freelancer feed/application slice, H3 |
| Day 2 | Booking/planner interactions | Public detail/content states | Review/retest coordination; docs task only in reserved window | Roster/verification/finance preview | Worker confirmation/attendance/earnings preview |
| Day 3 | Client-feedback fixes within owned slice | Responsive/public defects | Release-preview checks and commit-based review | Operations demo polish and critical defects | Worker device/state checks and defects |

Pause builders for review or when owners are conducting the client session. At the Day 3 review, start with Operations, then client/planner, then freelancer. Use labelled synthetic data and consistent records; do not demonstrate a production claim, check-in or transfer that is only a local-state simulation.

Prerequisite/setup/review time is inside the first three days. Reuse is essential. If fewer than 16 sets meet the criteria, report the actual count and gap rather than changing the denominator.

## 7. Revised 25-day schedule

Lane allocations are dispatch candidates, not permission to begin before dependencies pass. A/B/C/D/E can switch tool or task between checkpoints.

| Day | Output and dependencies | Implementation lane candidates | Human/review checkpoint |
|---|---|---|---|
| 1 | Shared file extraction, contracts/fixtures, stable preview foundation, then separate UI slices | B first; A/D/E after merged prerequisite | H1 design; H2 build/provider readiness; H3 contracts; C read-only review |
| 2 | Primary client/planner, public, worker and Operations journeys | A/B/D/E | Opposite-model task reviews, two merge windows minimum |
| 3 | F01–F16 verified and deployed for client review | A/B/D/E defects only; reduce concurrency for QA | Actual coverage + client decisions; preserve reference demo |
| 4 | Accepted feedback; auth/permission foundation; demand and event contracts | E auth; A demand; D events; B bounded design fixes | Astra reviews security/architecture; dependent APIs wait on contracts |
| 5 | KYC/onboarding and collections test access; quote/venue/remaining UI | E onboarding; A venues; D quotes; B remaining UI | H1 feedback closeout; H2/H3 provider checks |
| 6 | F17–F20 complete; first persistent demand/event/identity flow | A demand; E identity integration; D event API; B independent remaining screen | Cross-portal integration; no unreviewed contract drift |
| 7 | Atomic allocation and serialized worker overlap invariants | D owns allocation; E separately owned caller/eligibility after contract; A/B independent demand work | Independent Astra concurrency review; 20/500-on-10 tests |
| 8 | Live requirement → event → claim → roster demonstration | A/D/E integration fixes; B public verification | Client checkpoint; human verifies rules and data |
| 9 | Durable confirmation/expiry jobs and replacement queue | D jobs; E confirmation UI; A client status; B only independent task | Review expiry/confirm races; dispatch after job contract |
| 10 | TL QR/code attendance, GPS exceptions and payout-provider test gate | E attendance; D finance foundation; A demand defects | Astra auth/attendance review; H2 checks payout access |
| 11 | Verified attendance → rate snapshot → earning → two approvals | D earnings after attendance contract; E correction evidence; A approved quote flow | Astra financial-integrity review; human finance policy check |
| 12 | Invoice/collection reconciliation and event cash allocations | D finance; A client HTTP integration; E basic guest data after stable event scope | Separate collections/payout ledgers; no finance parallel overlap |
| 13 | Monthly payout, idempotency, uncertain/failure/reversal handling | D payout; E independently owned guests; A/B independent UI/verification | Astra payment review; duplicate/restart tests |
| 14 | Basic guest persistence/import, admin settings, audits and summaries | E guests; A client summary; D admin/finance completion | Permission/export checks; dependencies merged first |
| 15 | Full real core journey and provider live-launch decision | Normally 2–3 lanes fixing cross-flow issues | H1/H2/H3 client demonstration and go-live dependency decision |
| 16 | Ratings, corrections, reports and cross-module defects | E ratings; D finance reports; A demand regression; B bounded polish | Astra on difficult cross-module changes |
| 17 | Performance, job recovery, role coverage and backup restore | 2–3 independent fixes; C coordinates test evidence | Humans validate representative devices and recovery |
| 18 | Baseline complete, no mock fallback in live paths | Only completion fixes | Feature freeze and release candidate inventory |
| 19 | Security, concurrency, financial and integration suites | 1–3 defect lanes, no new features | Independent critical review; retest affected commits |
| 20 | Device/network/provider failure checks and release rehearsal | 1–3 defect lanes | Recovery/rollback evidence; UAT candidate |
| 21 | Client operational UAT | 0–2 urgent defect lanes | Human support prioritized over dispatch |
| 22 | UAT fixes, targeted retest and acceptance | 1–3 bounded defect lanes | Client verifies corrections and open limitations |
| 23 | Training, configuration/data checks, go/no-go and rollback target | 0–2 release-essential fixes | Human release owner approves exact candidate |
| 24 | Authorized production release and smoke checks | One release writer; others read-only test/observe | Named operator, monitor money/data/access |
| 25 | Stabilization buffer, handover and accepted backlog | Only authorized release defects | Client handover and support ownership |

Day 18 feature freeze, Days 19–23 stabilization/UAT/rehearsal and Day 25 release buffer are protected. Extra agent capacity does not expand scope automatically or consume this buffer with new features.

## 8. Review policy

Routine implementation normally receives opposite-model review: Codex-authored work → Claude review; Claude-authored work → Codex review. A reviewer reads TASK, canonical documents, BASE_SHA, HEAD_SHA, diff and relevant source. Review happens at each bounded task/PR checkpoint, never every N prompts.

Escalate architecture, security, concurrency, payments/payouts, financial integrity and difficult cross-module changes to **independent Astra review**. This is additional scrutiny, not a substitute for human approval and required tests.

If Astra helped plan the feature, use a fresh review session with the actual contract/code and without the planning conversation's conclusions. Same model in a fresh session offers process independence, not guaranteed statistical independence; opposite-family review and human evidence remain valuable. If Astra wrote the implementation, add Claude review and a separate Astra review session for the risk gate.

Review findings return to the original builder. Corrections get a new HEAD_SHA and targeted re-review. An integration patch that changes behavior becomes its own task and must be reviewed; an “integrator” cannot silently repair and self-approve several PRs.

## 9. Hard production gates and unchanged scope

Retain server-side authorization/ownership checks, safe capacity and overlap handling, verified attendance/corrections, rate snapshots, two-stage approvals, one logical monthly payable with safe provider attempts, callback dedupe, reconciliation, audit, restore evidence and client UAT. Client collections and worker payouts remain separate.

Maintain the proposed focused launch scope. Full WhatsApp RSVP cadence, guest identity-document collection, native mobile and continuous background geofencing remain later work unless the client explicitly changes the scope and capacity plan. Provider activation can still block the relevant live workflow. No agent should mark unverified workers or unsettled transfers successful to satisfy a deadline.

Future mobile consumes the same API and domain services; no production rules may be stranded in mock adapters or browser-only logic. Native UI/device integration remains separately estimated future work.

## 10. Checkpoints for adapting concurrency

At Days 3, 8 and 15, inspect accepted task throughput, human supervision/review time, review wait, rework rate, main failures and model usage. Increase concurrency only when dependency and human capacity are demonstrably available. Reduce it when review backlog, shared-file conflicts, laptop contention or integration failures rise.

Use the [v3 operating manual](TNP-AI-Operating-Manual-v3.md) for setup, lane switching and task/review mechanics. Use the [model and Business-plan recommendation](TNP-Model-and-Business-Recommendation.md) for quality/usage choices. The [updated starter templates](TNP-Engineering-Starter-Templates.md) define required TASK fields and canonical instructions.
