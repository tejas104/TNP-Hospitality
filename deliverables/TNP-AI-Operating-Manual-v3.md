# TNP AI operating manual — version 3

16 September 2026. Current operating policy: **3 humans / 2 laptops / up to 5 isolated implementation lanes.**

This replaces the earlier manual's execution, ownership and review model. The [v3 delivery plan](TNP-25-Day-Execution-Plan-v3.md) owns schedule/scope; this manual owns dispatch, setup, handoffs and integration. No tools, accounts, worktrees or remote settings were provisioned merely by writing this guide.

## 1. Name the roles before starting

- H1: product/design/demand; normally supervises A and B on Laptop 1.
- H2: events/finance/platform; normally supervises D and the C review/integration role on Laptop 1.
- H3: identity/workforce/attendance; normally supervises E on Laptop 2.
- A/B/C initially use Codex; D initially uses Claude Code; E initially uses Codex. Tools are interchangeable per task.
- P is an on-demand task-planning conversation, not an extra implementation lane.

Normal mode: A/B/D/E write independent tasks, C performs read-only review or integration coordination, P prepares decisions/contracts on demand. Maximum mode: C takes an independent implementation task, raising writers to five; pause/reassign its reviewer duties explicitly. Document writing and integration corrections count as writing when they modify repository files.

Humans remain responsible for understanding merged code, testing, review dispositions, conflicts, merge decisions and client acceptance. Agents do not own business accountability.

## 2. Account and physical-machine setup

Use an individual account/seat per actual human user. Five lanes do not imply five people or five seats, and two laptops do not imply only two users. Do not share one human's authenticated session among three developers. Account access and the product's supported sign-in/session arrangements must be verified before promising simultaneous operation.

On Laptop 1, H1 and H2 need separate authenticated environments, such as separate OS profiles and their own clones. Test whether processes continue safely when switching user sessions; do not log out an owner whose tasks must continue. If simultaneous independent app sessions are unsupported, use permitted CLI/OS-session arrangements or time-share. Do not improvise by copying credential directories.

One designated operator controls the active desktop/browser at a time. Other humans can review decisions, specifications and diffs during handoffs, but the plan does not assume a third independent keyboard/browser workstation. This is a practical throughput constraint.

### Base installations on both laptops

1. Install Git for Windows, the team-approved Node version, an editor and the chosen Codex coding client. The inspected repository's Node engine floor is `>=22.13.0`; record one exact tested team version.
2. Use the existing npm lockfile and build tooling for the Day 3 preview. Do not migrate package managers/frameworks in setup.
3. On Laptop 1, install Claude Code through its official distribution; it can also be installed on Laptop 2 for convenient opposite-model review, without creating another simultaneous implementation lane.
4. Sign in under the actual human's account; give access only to the relevant repository/test environments.

Basic checks in PowerShell:

```powershell
git --version
node --version
npm --version
```

Official setup references: [Codex desktop](https://learn.chatgpt.com/docs/app), [Codex Windows sandbox](https://learn.chatgpt.com/docs/windows/windows-sandbox), [Claude Code installation](https://code.claude.com/docs/en/setup).

One documented Claude installation option:

```powershell
winget install Anthropic.ClaudeCode
```

Then open a new terminal and check:

```powershell
claude --version
claude doctor
```

Keep normal workspace/sandbox permission boundaries. Installation and ordinary implementation authorization are not permission to deploy production, change live access or move client funds.

## 3. Per-human clones and per-task worktrees

Suggested unused paths:

```text
Laptop 1:
  H1 clone: C:\dev\tnp-h1
  H2 clone: C:\dev\tnp-h2
  Task folders: C:\dev\tnp-work\h1\TASK-ID
                C:\dev\tnp-work\h2\TASK-ID

Laptop 2:
  H3 clone: C:\dev\tnp-h3
  Task folders: C:\dev\tnp-work\h3\TASK-ID
```

Configure filesystem access to the intended OS user. Do not move/delete the existing project folder; these are new-clone examples. All clones use the same existing GitHub remote:

```powershell
git clone https://github.com/tejas104/TNP-Hospitality.git C:\dev\tnp-h1
Set-Location C:\dev\tnp-h1
git config user.name "H1 ACTUAL NAME"
git config user.email "H1 GITHUB EMAIL"
git status --short
git fetch origin
```

Substitute H2/H3's own paths and identities for their setups. Authenticate through the normal GitHub flow; never put access tokens in a URL. Use short task branches, not permanent A/B/C lane branches.

Example task assignment, executed only after dependencies are merged and the destination is unused:

```powershell
git fetch origin
git worktree add -b codex/tnp-f08-feed C:\dev\tnp-work\h1\TNP-F08 origin/main
Set-Location C:\dev\tnp-work\h1\TNP-F08
git rev-parse HEAD
git branch --show-current
npm ci
```

The branch prefix is a naming convention, not permanent model ownership. A later Claude session may implement on a `codex/` branch after a controlled handoff.

Do not let the app silently create a second worktree when the task already has one. Either let the app create the worktree and record its actual path, or create it explicitly and open it as the local task folder. Codex worktree guidance: [official documentation](https://learn.chatgpt.com/docs/environments/git-worktrees).

### Lane register

Maintain `docs/LANES.md`, updated by the dispatcher/captain through a short serialized documentation change:

```text
Lane | host | human | model | TASK | branch | absolute worktree | base SHA
Owned areas | forbidden areas | dependencies | ports | DB/fixture namespace
State | reviewer | risk gate | next human check | lease/handoff status
```

One active writer lease per task/worktree. Closing a chat is not proof that a background writer/process stopped; confirm before reassigning the lease. A lane is reused by assigning a new TASK/worktree rather than dumping the next unrelated feature into the old chat.

## 4. Isolate more than Git

| Resource | Rule |
|---|---|
| Source files | One writer/worktree; disjoint owned areas across active tasks |
| API/types/shared fixtures | One active owner task; merge interface prerequisite before consumers |
| Development servers | Record distinct ports and origins; proposed A/B/C/D/E web ports 3101–3105, configured through supported project scripts |
| API servers | Assign separate API ports/configuration per running environment |
| Mongo/test data | Isolated task DB/namespace; no destructive tests against shared staging |
| Browser tests | Distinct test profiles where supported; serialize tests using one interactive browser surface |
| Build output | Per-worktree directories; do not share writable build caches blindly |
| Provider callbacks | Separate test webhook destination/environment ownership; prevent two workers consuming the same job/transfer accidentally |
| External services | Test credentials, explicit side effects, unique idempotency/business keys |

Initially run at most one heavy build or E2E suite per laptop; raise only after observing resource headroom. Five agents can inspect/edit without five full browsers and build processes running continuously. Ports above are a proposed reservation, not a statement that existing scripts already set them.

## 5. Install one canonical context set

Merge the [updated starter templates](TNP-Engineering-Starter-Templates.md) into an agreed setup branch. They are examples, not already-active root configuration.

Canonical sources:

- `AGENTS.md`: shared workflow, commands and constraints.
- `CLAUDE.md`: Claude entry point to the same repository rules.
- `docs/PRODUCT.md`, `DESIGN.md`, `DOMAIN-RULES.md`, `ARCHITECTURE.md`.
- `docs/contracts/`, `docs/tasks/`, `docs/reviews/`, `docs/decisions/`.
- `docs/STATUS.md`, `docs/LANES.md`, `docs/ENVIRONMENTS.md`.

Archived manuals are historical material, not competing instruction files. Agents read only the relevant current canonical documents and task references. They must identify a conflict, not silently choose an old chat's interpretation. Root instructions should link to detailed documents rather than repeat an entire manual in every context.

Startup prompt for **every** implementation/review/planning session:

```text
Read the canonical repository instructions and the assigned TASK references.
Confirm actual working directory, branch, HEAD, TASK ID, lane, human owner,
owned/forbidden areas, dependency commits, execution mode and required checks.
Obtain project context from repository documents, not prior chat history.
Report a material conflict or missing dependency before dependent edits.
Proceed with independent authorized work; do not invent completion evidence.
```

`AGENTS.md` and `CLAUDE.md` provide instruction entry points, but they are not security enforcement. Server permissions, environment isolation and CI enforce the product's critical rules. [Codex instructions](https://learn.chatgpt.com/docs/agent-configuration/agents-md), [Claude project context](https://code.claude.com/docs/en/memory).

## 6. Dispatch a task

1. Human owner confirms TASK fields, risk and acceptance/tests.
2. Captain checks dependencies are merged and the task's files/contracts/resources are unclaimed.
3. Check human supervision/review availability, not merely idle model sessions.
4. Assign lane, tool/model, branch/worktree, ports/test namespace and reviewer in the lane register.
5. Start the tool inside that exact task folder; run the startup check.
6. Give the bounded implementation prompt below.
7. Owner checks the initial approach, then supervises exceptions and reviews outputs.

```text
Implement TASK <ID> from the repository contract in the assigned lane and
worktree. Follow the current canonical documents, declared dependencies and
owned/do-not-modify boundaries. Preserve approved TNP visuals. Complete
acceptance and required verification, without broadening scope or changing
shared contracts silently. Report exact changed files, commands/results,
remaining gaps and a stable review checkpoint. Preview success must remain
labelled as preview; no unverified provider/data action is production done.
```

If the task needs a shared-file change, request a prerequisite task or a serialized ownership handoff. Do not reach into another worktree. If a prerequisite is not merged, take another genuinely independent task or pause.

## 7. Planning session P

Use Astra for ambiguous architecture/domain decomposition, security boundaries, critical dependency decisions and difficult failures. Routine small TASK drafting can use Sol/Terra or the human owner directly.

P reads current repository state and proposes one to two days of work with dependency IDs, owners, lane candidates, file boundaries, tests and human review load. It does not keep a secret backlog in its conversation or pass large generated prompts as the only specification.

```text
Prepare the next dependency-safe TNP task batch from current repository
status and approved requirements. There are H1/H2/H3 humans, two laptops
and at most five implementation writers. Default to four or fewer.
For each proposed task include dependencies, owned/forbidden paths,
acceptance, required tests, risk review and estimated human attention.
Identify shared prerequisites and integration order. Do not schedule
overlapping modifications. Provide contracts to commit; do not dispatch
agents, modify app source or assume decisions from conversation history.
```

Human owner approves the batch and commits contracts through an available documentation lane. Once merged, builders read the task file directly. No prompt rewrite is required for every follow-up question.

## 8. Task/PR review gates

### Routine opposite-model review

- Codex-authored implementation → Claude review.
- Claude-authored implementation → Codex review, normally Sol for substantive code.
- A mixed-authored task records both authors; use a fresh reviewer and preserve human independence.

Lane D need not be the only place Claude reviews. An available authorized session may review read-only, or D pauses implementation for a review block. If review capacity is exhausted, stop dispatching. Source review can occur in a detached worktree while the author's next independent task proceeds; review must target a fixed commit.

### Independent Astra review

Required for architecture-sensitive, security-sensitive, concurrency-sensitive, payment/payout, financial-integrity and difficult cross-module changes. Set the risk flag when making TASK ready, not after the feature is nearly merged. Record reviewed SHA, findings and disposition. If Astra is unavailable, affected risky work waits for its gate while independent work continues; do not silently downgrade the requirement.

```text
Independently review TASK <ID>, BASE_SHA..HEAD_SHA. Read current requirements,
contracts and source before the builder summary. Do not edit, merge or deploy.
Confirm the exact commit and assess the declared high-risk invariants,
failure paths, permissions, concurrency, retries and financial reconciliation.
Give concrete findings with file/line, trigger, impact and verification.
Distinguish observed defects, unverified risks and checks not performed.
Do not inherit conclusions from the planning/implementation conversation.
```

Astra may have helped plan the task, but its review uses a fresh context. This reduces anchoring; it is not a guarantee of independent model errors. Keep opposite-family and human review where required.

### Review is not implementation

The original builder fixes confirmed findings. The human rejects unsupported suggestions with reasons. Each fix receives a new commit; rerun targeted checks and refresh review for affected behavior. If Astra itself fixes the issue, mark it as an implementer, assign a writer lease and obtain a fresh opposite-model/human review; retain a separate Astra session for the explicit high-risk gate.

## 9. Checkpoint and handoff mechanics

After inspecting/staging only the intended task files, the human records a commit. Avoid broad staging in this workspace, which contains unrelated deliverables.

```powershell
git status --short
git diff --stat
git rev-parse HEAD
git merge-base origin/main HEAD
```

Record actual HEAD_SHA and BASE_SHA. For a detached review, after fetching the pushed commit:

```powershell
git worktree add --detach C:\dev\tnp-review\TASK-ID HEAD_SHA
```

Replace placeholders; choose an unused path with a prepared parent directory. Confirm HEAD inside the review folder. Use supported permission controls for source-only review; a prompt is not a filesystem lock. Claude's planning mode is useful for source review:

```powershell
claude --permission-mode plan
```

Tests can write artifacts or trigger services, so validation runs use the task's controlled test environment. [Claude permission guidance](https://code.claude.com/docs/en/permissions).

Every tool/human handoff records TASK, lane/human, worktree/branch/SHA, source references, changes, actual checks, findings/disposition, next action and writer-lease status. Do not transport the whole conversation as a substitute for this packet.

## 10. CI, review and merge capacity

Current inspected frontend commands:

```powershell
npm ci
npm run lint
npx --no-install tsc --noEmit
npm run build:vercel
```

The current package did not define test/typecheck/E2E scripts when inspected; add real scripts/tests deliberately and update canonical commands. Do not claim a nonexistent test passed. Significant UI changes need browser evidence; production domains need invariant/failure tests.

GitHub setup: use the existing repository, individual access, protected main where supported, required relevant CI, independent human approval and resolved blocking findings. Set up checks as actual runnable jobs; do not mark a planned pipeline configured.

Merge process:

1. Verify dependency commits and correct PR base.
2. Verify opposite-model review and Astra gate when flagged, against the current task head.
3. Human reviewer confirms acceptance and understands the diff.
4. Update against current main; resolve conflicts with the owners and retest affected behavior.
5. Captain merges one PR at a time after checks.
6. Verify staging/integrated behavior and update status; do not equate merge with deployment verification.

Review starvation policy: at two waiting reviews, finish reviews instead of launching more tasks. During a critical integration failure, affected lanes pause feature work. A proposed integration correction needs its own bounded task/worktree and review. Pure merge orchestration does not authorize hidden code changes.

## 11. Daily cadence and measured limits

- Morning, 15 minutes: human availability, blockers, prerequisites, risk reviews and shared ownership.
- Dispatch only ready independent tasks. H1/H2 coordinate Laptop 1 interactive access.
- Midday and late-afternoon integration windows at minimum; merge smaller verified prerequisites earlier when needed.
- Reserve human source-review and browser-test blocks; a fifth builder must not consume them.
- End of day: current main/staging, lane/task state, actual checks, review queue, provider blockers and next ready tasks.

Record approximate human hours for planning, supervision, review, verification and integration, plus task cycle time, rework and model usage. Start with the capacity assumptions in v3; revise with Days 1–3 evidence. A feature that requires a human to spend several hours correcting generated code is not cheap merely because its tokens were inexpensive.

## 12. Definitions of done

**Frontend-ready:** passes its screen-set criteria, primary interactions/states, desktop/mobile checks, shared fixture consistency, preview labelling and reviewed build. Counts toward the Day 3 16/20 metric.

**Production-integrated:** real authorized API, persistent correct data, required tests, domain/race/retry safeguards, no live mock fallback, source review and verified staging journey. Provider readiness is explicit.

**Release-ready:** accepted scope, actual client UAT, critical gates passed, provider mode agreed, monitoring, tested restore/rollback, support/training and exact release authorization.

No arbitrary prompt count defines any of these states. Feature freeze remains Day 18; the release buffer is not a reserve for additional features.

## 13. Setup acceptance checklist

- [ ] H1/H2/H3 named; two-host operator/session arrangement tested.
- [ ] Individual authenticated accounts; appropriate seat/model access verified.
- [ ] Base clones, identities and clean reproducible baseline recorded.
- [ ] Each active TASK has a unique branch/worktree and writer lease.
- [ ] Canonical documents installed consistently; historical manuals clearly retired.
- [ ] Lane/file/contract/resource ownership register maintained.
- [ ] Ports, test data and webhook/job side effects isolated.
- [ ] Reviewer capacity, opposite-model routing and Astra escalation available.
- [ ] CI/main integration, frontend review and production status tracked separately.
- [ ] Resource/concurrency smoke test passes; otherwise fewer lanes operate.

The aim is a sustainable flow of understood, reviewed and verified changes. Five lanes are optional execution capacity under three humans' control.
