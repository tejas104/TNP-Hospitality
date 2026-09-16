# TNP Hospitality: AI-Assisted Engineering Master Operating Manual

> **Archived operating model.** Use [AI Operating Manual v3](TNP-AI-Operating-Manual-v3.md) and [Execution Plan v3](TNP-25-Day-Execution-Plan-v3.md). The three-laptop, one-builder-per-developer and review assumptions below are historical and must not be copied into active agent instructions. Current model/plan advice is in [Model and Business Recommendation](TNP-Model-and-Business-Recommendation.md).

## Three developers, Codex + Claude Code, frontend review in three days

Version 2 • Finalized 16 September 2026 • 25-calendar-day web delivery

## 1. Start here

This is the operating guide for the [frontend-first delivery plan](TNP-Frontend-First-Delivery-Plan-v2.md). It describes setup and work to perform; it does not claim those accounts, repository protections or pipelines have already been configured.

**Operating model:** three human owners; one shared repository; one active implementation task per developer; Codex as the default implementation agent; Claude Code as planner/reviewer; human review, CI and browser checks before merging. Either coding tool can implement a task when appropriate, but only one tool writes that task at a time.

**Delivery model:** reuse the approved TNP website and Operations format, complete 16 of 20 primary frontend screen sets for Day 3 review, finish feedback and remaining frontend by Day 6, integrate production services through Day 18, then verify, run UAT and release by Day 25.

**Client-review preview is not production:** display sample-data status clearly. Native apps, continuous geofencing and the proposed deferred RSVP/document work are not silently added because the earlier demo showed them.

Read in this order:

1. Sections 2–4: who owns the work and repository decisions.
2. Sections 5–8: set up all three laptops and shared tooling.
3. Sections 9–12: perform a normal task, review and merge.
4. Sections 13–17: client review, production integration, troubleshooting and handover.
5. [Starter Templates](TNP-Engineering-Starter-Templates.md): copy-ready instructions, task and handoff formats.

## 2. Human roles and accountability

Assign actual names to A, B and C before kickoff. These labels do not imply different seniority.

| Responsibility | A: product / demand | B: workforce / identity | C: operations / finance |
|---|---|---|---|
| Days 1–3 UI | Homepage, public templates, client, planner | Application, worker feed, briefing, attendance, earnings | Operations, events/roster, verification, finance preview |
| Later production ownership | Leads, requirements, booking, venues, client/planner integration | Auth/RBAC, worker approval, eligibility/overlap, attendance, ratings, basic guests | Events/positions, allocation service, finance, providers, jobs, admin |
| Shared ownership | Theme, shell, client feedback | Shared contracts, identity permissions | CI, deployment, job infrastructure |
| Peer review default | Reviews C | Reviews A | Reviews B |
| Client involvement | Consolidates requests and acceptance | Worker/TL workflow demonstrations | Operations/finance demonstrations |

Every endpoint, component group and domain service has one primary owner. B and C jointly define allocation rules, but there is one server-side claim service: C owns changes to it, B supplies worker eligibility/overlap requirements and integrates the worker UI. Shared work has an explicit task, named implementer and reviewer.

The client decides business policies and accepts scope. The developers decide implementation within that agreed scope. A coordinates decisions; A does not become the sole backend reviewer. Rotate the release captain after Day 3, with C handling the initial preview setup. A captain handles merge order, CI/staging status and blockers; budget 30–45 minutes on normal days and more for a release.

### Decisions that need human ownership

Business-rule changes, scope tradeoffs, new paid dependencies, production credentials, migrations affecting real data, live money movement, user permission changes and deployment timing have named human owners. Routine reversible implementation in a ready task proceeds without repeated permission requests. Record approvals already given; do not ask again for the same authorized step.

## 3. What Codex and Claude each do

This allocation is a workflow recommendation, not a claim that one model is universally superior.

| Activity | Default tool | Human action |
|---|---|---|
| Break a feature into a bounded task | Claude Code in planning mode, or Codex planning | Developer confirms contract and scope |
| Implement UI/API/tests/refactor | Codex | Developer monitors scope and checks the result |
| Review completed implementation | Claude Code against the recorded commit | Developer accepts/rejects findings with reasons |
| Fix confirmed review findings | Original builder | Developer verifies targeted changes |
| Difficult auth/concurrency/financial issue | Independent review by the other tool | Domain owner decides using evidence and tests |
| Browser verification | Available browser automation + developer | Developer observes actual behavior and device limits |
| Client interpretation, merge and release | Human | AI prepares evidence and assists execution |

Each developer signs into their own account for each product. Use the model available in the account that performs the task well; record model/version for difficult investigations. Avoid building this manual around a model alias, subscription price or a required percentage of AI-written code. Access and usage limits depend on the account and can change.

Default to normal reasoning for bounded implementation; use deeper reasoning for disputed architecture, races and money handling. More reasoning is not a substitute for missing requirements. If usage limits interrupt the builder, commit a safe checkpoint and hand off via the task record rather than continuing from memory in another tool.

### Do not build an agent-management project

The starting setup is three implementation sessions across three laptops, plus brief review sessions. Do not require a third orchestration product, a custom agent swarm, automatic cross-model messaging or a prompt-improvement chain. Add specialist agents only for a concrete independent task when the human owner deliberately chooses to delegate it; file ownership and verification still apply.

## 4. Repository and baseline decisions

Verified local facts:

- Remote: `https://github.com/tejas104/TNP-Hospitality.git`.
- Current branch inspected: `main`; local HEAD inspected: `9d58061`, “Lift pinned filmstrip above viewport edge.” The deployed commit must be verified in the hosting dashboard rather than assumed equal to local HEAD.
- Existing routes: `/`, `/client`, `/planner`, `/freelancer`, `/admin`.
- Portal components currently share `components/tnp/PortalPages.tsx`.
- Build tooling uses Vinext/Vite/Nitro and a Vercel build script. It is not the plain Next.js/Express monorepo proposed in the original PDF.
- `package.json` has `dev`, `build`, `build:vercel`, `lint`, `format` and a lockfile. It does not yet define `test`, `test:e2e` or `typecheck` scripts.
- The workspace contains unrelated deliverables; do not stage the entire workspace indiscriminately.

### Baseline actions, Day 1

1. A verifies the client-approved preview URL and records its deployment/commit and screenshots.
2. C verifies that a fresh clone can install, run and build the current app; records any baseline failures rather than hiding them.
3. A splits the shared portal file into stable per-lane components, preserving behavior. One person owns this small prerequisite; merge it before all lanes start writing.
4. All three settle shared contracts, fixtures, component boundaries and the F01–F20 inventory.
5. Keep the working preview build through Day 3. Evaluate the eventual production topology through an explicit decision; no mid-demo framework conversion or casual package upgrade.

Do not delete, relocate or rewrite the existing shared working folder as part of setting up other laptops. New development clones can live outside cloud-synced directories to reduce file-lock/sync conflicts.

## 5. Laptop setup: each developer

The command examples use native Windows PowerShell and a new `C:\dev\TNP-Hospitality` clone. Run them only on the intended developer machine and only if that destination is unused. They are instructions, not commands executed by this planning task.

### Step 1 — accounts and invitations

- Use an individual GitHub account with the required repository access and MFA.
- Sign into Codex with the developer's own authorized account. Separately confirm Claude Code access before planning work around it.
- Give hosting/database/provider access according to the developer's actual responsibility. Prefer separate development credentials and databases; do not distribute production administrator credentials to all laptops.
- Nominate the client/organization owner for infrastructure billing and eventual handover.

### Step 2 — install the local basics

Install Git for Windows and Node.js from their official distributions, plus an editor such as VS Code. Use one team-approved Node version compatible with the existing repo; its current engine floor is `>=22.13.0`. Pin the exact tested version in a small environment record rather than having each developer independently install a different version. Retain npm and the current `package-lock.json`; do not switch to pnpm/yarn during the frontend push.

Verify:

```powershell
git --version
node --version
npm --version
```

Git: [official downloads](https://git-scm.com/downloads). Node: [official downloads](https://nodejs.org/en/download). Record the actual installed versions after the baseline build passes.

### Step 3 — clone and configure your identity

```powershell
New-Item -ItemType Directory -Force -Path C:\dev | Out-Null
Set-Location C:\dev
git clone https://github.com/tejas104/TNP-Hospitality.git
Set-Location C:\dev\TNP-Hospitality
git config user.name "YOUR NAME"
git config user.email "YOUR GITHUB EMAIL"
git status --short
git remote -v
```

Replace the two identity placeholders. Authenticate through the normal GitHub flow if prompted; do not put tokens in the remote URL. If you already have a clone, inspect its status and use it instead of cloning over it.

### Step 4 — reproduce the current demo

```powershell
npm ci
npm run lint
npx --no-install tsc --noEmit
npm run build:vercel
npm run dev
```

Run the final command in a dedicated terminal. Use the URL/port printed by the server; the current README mentions port 3001. Open all five routes. Save command results and baseline defects in the setup issue. These checks were selected from the inspected repository; this planning task did not execute them or certify them as passing.

`npm ci` uses the committed lockfile. If package files are inconsistent, create a focused fix; do not delete the lockfile or run a blanket update. On some PowerShell installations an execution-policy problem with npm's script shim can be avoided by invoking `npm.cmd`; do not disable machine-wide execution policy as a routine fix.

### Step 5 — keep environments explicit

At the frontend-preview stage, use synthetic fixtures and no live provider credentials. When backend integration begins, C supplies an `.env.example` containing variable names and harmless defaults, with real values supplied privately. Each person configures their own untracked environment file and isolated development database.

Record environment purpose, database name, fixture mode, API origin, provider mode and preview host in the task. Client-visible variables are public by definition; never put a secret into a `NEXT_PUBLIC_` or equivalent exposed value. A `.gitignore` rule is useful but does not remove a secret that was already committed.

### Step 6 — installation acceptance

Each developer posts: Git/Node/npm versions, clone path, branch/commit, successful install/build or exact blocker, screenshot of `/admin`, Codex instruction check, Claude instruction check and their assigned first task. Allow about 60–90 minutes for setup on a prepared laptop; access/install failures are tracked separately.

## 6. Codex setup

### Preferred: the existing desktop coding experience

1. Open the installed Codex desktop app, or obtain the supported desktop coding surface from the [official desktop setup](https://learn.chatgpt.com/docs/app). OpenAI's current documentation may use ChatGPT desktop naming; use the Codex coding mode exposed in the installed version.
2. Sign into the developer's account and add/open the local repository folder.
3. Check that the displayed working directory and Git branch match the intended task.
4. Use normal workspace-scoped permissions and the native Windows sandbox where supported. If managed policy blocks setup, resolve that specific issue rather than switching to unrestricted full access. [Windows sandbox guidance](https://learn.chatgpt.com/docs/windows/windows-sandbox)
5. Install the agreed root `AGENTS.md` from the starter templates and start a fresh task so instructions are loaded predictably.
6. Run the read-only instruction-check prompt below. Then give Codex one task contract.

If using the CLI instead, follow the current installation/sign-in instructions in the [official Codex CLI guide](https://learn.chatgpt.com/docs/codex/cli), then run `codex` from the exact task directory. The app route is sufficient; developers do not need to install every interface.

### Initial instruction check

```text
Read AGENTS.md and the referenced project documents. Do not edit files.
Report the repository root, current branch and commit, applicable instruction
files, available build/test commands, current delivery milestone, approved
design references and task ownership. Identify conflicting or missing rules.
Do not claim instructions from a different chat or laptop are available here.
```

Codex discovers project instructions through `AGENTS.md`, with more specific paths and override files affecting what it loads. Inspect existing global/project rules rather than assuming a copied root file is the only guidance. Do not erase personal or organization rules automatically. [AGENTS.md documentation](https://learn.chatgpt.com/docs/agent-configuration/agents-md)

### Worktree choice

A worktree is another working folder for the same Git repository. It separates file edits; it does not isolate databases, credentials, ports or external side effects.

- For the first three days, one feature branch in each developer's own clone is the simplest approach.
- When another independent task is needed on the same machine, choose Worktree in Codex or create an explicit Git worktree. Do not also start Claude as a writer in that folder.
- Open Claude at the actual Codex task worktree for review after the builder pauses; reviewing the main checkout may review entirely different code.
- Confirm setup/credentials/ports independently for each worktree. [Codex worktree guide](https://learn.chatgpt.com/docs/environments/git-worktrees)

## 7. Claude Code setup

### Native Windows CLI, recommended for precise repository reviews

Install from the documented official distribution. One supported option is:

```powershell
winget install Anthropic.ClaudeCode
```

Open a new PowerShell window, then:

```powershell
claude --version
claude doctor
Set-Location C:\dev\TNP-Hospitality
claude
```

Complete sign-in with the developer's own eligible account. Native Windows is supported; Git for Windows provides the Bash tool, while available shell behavior depends on the installation. The WinGet distribution requires explicit upgrades; review tool updates outside critical demo/release windows. [Claude installation and authentication](https://code.claude.com/docs/en/setup)

### Set up shared context

Place the agreed `CLAUDE.md` in the repository root. It should point to the same `AGENTS.md`, scope, design, contracts and task documents used by Codex. Run the same instruction-check prompt and confirm Claude reports the correct folder and task. Project instructions are shared through Git; personal auto memory is not the team's authoritative project state. [Claude project instructions](https://code.claude.com/docs/en/memory)

### Review mode

For the standard source review, start Claude in th e paused task directory:

```powershell
claude --permission-mode plan
```

Use the review prompt in Section 10. Plan mode is intended for exploration without source edits; it does not remove the need to check outputs and permissions. Test/build commands can write generated files or exercise services, so run those through the developer's normal validation terminal in the correct test environment. For Claude implementation, deliberately use the regular permitted editing mode after the original writer stops. Do not use blanket permission bypass as the team default. [Claude permissions](https://code.claude.com/docs/en/permissions), [CLI flags](https://code.claude.com/docs/en/cli-reference)

The Claude Code desktop Code tab is an optional alternative. Choose the exact local folder/branch, not a new unrelated workspace; repeat the instruction check. [Desktop setup](https://code.claude.com/docs/en/desktop-quickstart)

## 8. Shared repository setup: once, coordinated by C and A

These are setup deliverables to create in an agreed branch, not existing configured features.

### GitHub

1. Use the existing repository as the source of truth; do not create three separate authoritative repositories.
2. Invite the three developers with appropriate access. Enable branch protection/rulesets for `main` where the repository plan supports them.
3. Require one independent human PR approval, relevant passing CI and resolved blocking review conversations. Add domain-owner review for auth, allocation and finance changes.
4. Prefer squash merge for bounded tasks. Disable force-push/deletion of the protected release branch where supported.
5. Set up an issue board: Backlog → Ready → Building → Review → QA → Done, plus Blocked. Track frontend-ready and production-integrated as separate fields/labels.
6. Keep only one active build task per developer by default. Allow a second ready task only to avoid a real external blocker.

### Build checks

For the current frontend phase, CI runs installation from lockfile, lint, type checking and the Vercel preview build. C adds explicit `typecheck`, `test` and `test:e2e` scripts only when the actual tools/tests exist; a nonexistent script is not a quality gate. Record the exact command in each task.

Start a small browser smoke suite covering navigation, key form validation and the shared preview journey. From Day 4, add API/domain tests where they protect authorization, allocation, attendance and financial correctness. Do not spend the frontend push testing every decorative component.

### Preview and production separation

Keep the approved demo accessible as a reference. Produce a new review deployment with recorded URL and commit; use access protection where available and agreed. C checks the hosting account's actual preview behavior and build settings. Document who can deploy the client-review environment and what production release authorization is required.

Use distinct development, staging and production data/credentials. Synthetic preview fixtures must not write to live services. Each release records the deployed commit, configuration mode, database migration/index version, smoke checks and rollback target.

### Shared memory files

Keep a small useful set:

| File | Purpose | Owner |
|---|---|---|
| `AGENTS.md` | Short common engineering rules and commands | A/B/C review |
| `CLAUDE.md` | Claude entry point to the same rules | A/B/C review |
| `docs/PRODUCT.md` | Current scope, milestones and exclusions | A |
| `docs/DESIGN.md` | Approved demo, visual patterns and review decisions | A |
| `docs/DOMAIN-RULES.md` | Business invariants and unresolved decisions | B, C financial review |
| `docs/ARCHITECTURE.md` | Actual topology, module owners and API boundaries | C with A/B |
| `docs/STATUS.md` | Current milestone, blockers and integration state | Release captain |
| `docs/contracts/` | API/DTO contracts and example payloads | Domain owner; B coordinates |
| `docs/tasks/` | Small ready task contracts | Assigned developer |
| `docs/reviews/` | Reviewed commits, findings and disposition | Reviewer |
| `docs/decisions/` | Meaningful architecture/scope decisions only | Decision owner |

Copy templates deliberately; do not use `/init` from both tools to overwrite each other's instructions. Agent instruction files are guidance, not a security boundary; enforce critical restrictions in application code, environment access and CI.

## 9. Daily task workflow

### Morning: 15 minutes

Each person states yesterday's accepted result, today's task, blockers and shared-file needs. Captain checks main/staging and merge order. A consolidates client feedback. Update task ownership before agents start writing.

### Step 1 — prepare the feature branch

In a clean local checkout:

```powershell
git status --short
git switch main
git pull --ff-only
git switch -c codex/tnp-f08-opportunity-feed
```

The branch name is an example for F08. Use the actual task ID. If status shows changes, stop and checkpoint/reconcile them first; never discard work just to make this recipe run. `--ff-only` intentionally stops on divergence so the developer can inspect it.

### Step 2 — make the task ready

A task has a user outcome, owner, dependency, allowed file areas, approved design reference, DTO/API shape, preview/live mode, business rules, acceptance criteria and verification commands. Use the template in the companion file. A good size is two to six focused hours. Split a task that includes three unrelated modules.

### Step 3 — ask Codex to implement

```text
Implement docs/tasks/TNP-F08.md in this branch.
Read AGENTS.md, docs/PRODUCT.md, docs/DESIGN.md and the task references.
Preserve the approved TNP website and Operations design language.
Use the declared mock/HTTP service boundary and owned file paths.
Proceed through implementation and the specified verification.
Do not expand scope, change shared contracts silently or claim simulated
provider behavior is live. If a required decision is missing, identify the
dependent work and continue independent authorized work.
Return changed files, acceptance results, exact checks, limitations and
the next review checkpoint. Do not deploy production or move live money.
```

The developer checks the initial plan briefly, then lets the agent work. Interrupt for actual scope drift, incorrect business rules, broad refactors or unsafe data assumptions, not ordinary implementation choices.

### Step 4 — inspect and validate

Read the diff and run the task's checks. Open the actual UI. Compare relevant behavior to the original state so you can distinguish pre-existing defects from regressions. Agent-written tests should fail for the intended bug/invariant, not merely reproduce implementation details.

### Step 5 — create a stable review checkpoint

Commit only the intended files after checking staged content:

```powershell
git status --short
git diff --stat
```

Then stage explicit task paths using the editor or `git add` for those paths, inspect `git diff --cached`, and commit. Do not use `git add .` in the existing workspace with unrelated deliverables. Record:

```powershell
git rev-parse HEAD
git merge-base origin/main HEAD
```

The first is HEAD_SHA; the second is BASE_SHA for this review. Record both actual values, not just “latest branch.” Pause Codex writes while Claude reviews.

### Step 6 — Claude reviews; developer decides; Codex fixes

Follow Section 10. A review finding is not automatically a required code change. The human classifies each as confirmed, needs reproduction, duplicate or rejected with reason. Original builder fixes confirmed issues and reruns relevant checks.

### Step 7 — PR and peer review

Push the feature branch, open a PR to the verified base branch and include task ID, outcome, scope, screenshots/preview, exact verification and known gaps. The independent developer reviews it; AI review assists rather than replaces that review. If a fix changes the commit, refresh review evidence for the changed areas.

### Step 8 — integrate and close

Captain confirms merge order and CI; designated human merges. Verify the merged build in staging and run the cross-portal smoke journey. Update status/coverage and record the staging commit/URL. “Merged” and “verified in staging” are distinct states.

### End of day: 10–15 minutes

No unrecorded “almost done.” Each person updates: completed task/commit, verification, next action, blockers and handoff. The next person must be able to continue from repository records without reading a long chat.

## 10. Exact Codex → Claude → Codex handoff

### Recommended simple method: same folder, sequentially

1. Codex finishes and the developer creates a review checkpoint.
2. Pause Codex writes.
3. Open Claude Code in that exact folder with planning permissions.
4. Give it BASE_SHA, HEAD_SHA and the task/requirements.
5. Claude returns findings; developer records disposition in the task/review file.
6. Resume Codex with confirmed findings only.
7. Record the new commit and targeted re-review results.

This avoids a second checkout and dependency setup for routine reviews. It is safe from competing source edits only if the builder remains paused; a review prompt is not a technical lock.

### Claude source-review prompt

```text
Review the TNP task at BASE_SHA..HEAD_SHA. Replace these placeholders with
the exact supplied hashes. Read the task, shared rules, design reference
and changed source before judging the builder summary. Do not edit files,
commit, merge or deploy. Confirm the actual HEAD before reviewing.

Prioritize requirements and workflow, authorization/data exposure,
concurrency and retries, financial/attendance correctness, state handling,
then accessibility/design regressions and maintainability.
Respect whether this is an explicitly labelled frontend preview or a
production-integrated task. Identify preview leakage risks without falsely
claiming the preview already needs every live provider to pass design review.

For each actionable finding give severity, file/line, concrete trigger,
impact and a minimal proposed fix. Separate unverified suspicions from
reproduced defects. Report commands actually run and checks not performed.
State the reviewed commit. Do not invent findings to fill a quota.
```

### Fix prompt back to Codex

```text
Continue the same task. Read the review record and the developer's
disposition. Fix only confirmed findings R1 and R3, and explain any
dependency that requires a wider change. Preserve approved visuals and
contracts. Reproduce each issue where feasible, implement the smallest
correct fix, rerun relevant checks and report the new review checkpoint.
```

### If the tools disagree

Ask for the concrete input/state that causes failure. Reproduce it with a targeted test or browser scenario. Compare the result with the agreed rule, not the model's confidence. Domain owner decides. Escalate a missing business policy to the client; do not hold a vote between models.

### Independent review on another laptop or worktree

The author pushes the task branch. The reviewer fetches it and checks out the specified commit in a separate folder if they need to continue their own work:

```powershell
git fetch origin
git worktree add --detach C:\dev\tnp-review-f08 HEAD_SHA
```

Replace HEAD_SHA with the actual fetched commit hash and choose an unused review directory. Run this from the repository. Confirm `git rev-parse HEAD` inside the review folder before opening Claude. Install dependencies separately if running builds. Use only test credentials; worktrees share Git history but not automatically the required untracked environment files. Native Claude-managed worktrees are another option, but do not layer two different worktree managers over one task. [Claude worktree guide](https://code.claude.com/docs/en/worktrees)

Do not remove a review/work folder until its files and commits are checked and work is safely retained. No automatic cleanup or destructive reset is part of this workflow.

## 11. Review depth and definition of done

| Change | Evidence required |
|---|---|
| Copy/spacing within approved layout | Human diff + actual page check; relevant build/lint coverage |
| New frontend interaction | Claude source review, peer check, form/state/mobile/browser evidence, CI |
| API/permissions or sensitive uploads | Role + ownership negative tests, input validation, data exposure review, peer approval |
| Claims/attendance/earnings/payouts | Failure/concurrency tests, independent domain review, audit/reconciliation evidence, CI |
| Production configuration/migration | Named owner, staging rehearsal, rollback/restore evidence, release decision |

### Frontend review-ready

The row meets its agreed fields, navigation, primary interaction, responsive layout and state requirements; uses shared patterns; is correctly labelled as sample/live; builds; has another developer's browser evidence. This is the only state counted toward Day 3's 16/20 metric.

### Production done

The intended UI uses the real authorized API; data survives correctly; domain rules hold; retries and errors are handled; required tests and browser checks pass; no fixture leakage exists; the change is reviewed and verified in staging; documentation and operational ownership are updated. Mocked provider success cannot satisfy this state.

Retain tests for 20/500 concurrent claims into 10 slots, worker overlap races, confirmation/expiry races, unauthorized attendance, GPS denial, duplicate earnings, duplicate/uncertain payouts and role/owner boundaries. Add verification as its module arrives, not all at the end.

## 12. Shared files, contracts and merge conflicts

### Ownership boundaries

- A coordinates `AppShell.tsx`, shared UI and global CSS. New feature styling should live with its owned feature where possible.
- B coordinates DTO/API contract changes; domain owners review the affected fields and behavior.
- C coordinates package/lockfile, CI, hosting and deployment configuration.
- Any developer can propose a change. A shared-file owner does not become an unresponsive gate: agree a small task and merge order in the morning/midday sync.

### Parallel work rules

Do not run Codex and Claude as simultaneous writers in the same checkout, even if their prompts mention different modules. Do not let multiple agents edit the shared portal monolith. Separate laptops/branches prevent immediate file collisions, but incompatible assumptions can still cause integration defects.

For a dependency, merge a small compatible contract/component prerequisite early. Dependent work starts from that known revision. Avoid chains of long-lived branches and casual cherry-picking between every lane.

### Contract change protocol

Record old/new shape, reason, consumers and migration/testing implications in the task. Prefer additive fields. Update mock fixtures and HTTP adapter consistently. If the API changes an enum/error/status, all affected UIs must handle it. “Types frozen on Day 3” means a reviewed baseline, not an inability to fix a wrong contract.

### Conflict resolution

Pause writers, inspect both intended changes and resolve with the domain/shared-file owner. Run relevant checks after merging. Do not instruct an AI to always take “ours” or “theirs.” If `main` changes after the reviewed commit, update the branch, rerun relevant checks and review affected conflict resolutions before merge.

## 13. First-three-day AI prompts and review agenda

### A — public, client, planner

```text
Implement the assigned F01–F06 task slice. Reuse the current homepage and
approved Operations tokens. Preserve the existing public animation design;
do not introduce a new library. Build the client/planner workflow using the
shared synthetic event and declared service contract. Work only in the
agreed A paths. Make the specified primary actions and error states work,
check responsive behavior and report review evidence.
```

### B — freelancer

```text
Implement the assigned F07–F11 slice using the approved TNP visual system.
Prioritize mobile usability, truthful claim/confirmation states, worker
briefing, attendance/GPS-denied preview and explainable monthly earnings.
Use the same event/assignment fixtures as Operations. Simulations must be
labelled and separate from future server authority. Do not implement live
geofence tracking or automatic permanent blocking.
```

### C — Operations and finance

```text
Implement the assigned F12–F16 slice by extending the existing Operations
format: dark sidebar, cream headings, metric tiles and verification panels.
Make event/roster, review actions, attendance exceptions, replacements and
financial approval previews coherent with the shared fixtures. Keep the
reference demo accessible. No live payments or fake provider success.
```

Use one bounded task within these groups at a time. These lane briefs are not permission to rewrite all listed screens in one huge uncontrolled patch.

### Day 3 client session

A leads with Operations, C demonstrates the event and finance panels, B demonstrates the worker journey, then A covers client/planner. Record the deployed commit and actual 16/20 coverage. Ask for layout/workflow feedback, not blanket acceptance of simulated backend behavior. Track remaining 20% and agreed changes separately. Deliver feedback decisions into `docs/DESIGN.md` and tasks so both tools read the same result.

## 14. Move from preview to production

For each module:

1. Agree API/permission/data contract and unresolved domain decisions.
2. Implement server-side validation and authorization.
3. Persist through the domain service with appropriate transactions/indexes.
4. Add the HTTP adapter using the same frontend contract.
5. Exercise loading/error/retry and forbidden states against the real API.
6. Disable its mock path in live mode and verify no preview-only controls remain.
7. Run the cross-portal journey and mark production integration separately.

Keep rules in the shared API, not only web components or page actions. This is what makes the future mobile app reuse viable. Shared types/SDKs cannot replace server authorization. Native app UI, navigation, token/device handling and store release remain future work.

For providers, record test access, live access, webhook verification, failure behavior and fallback decision. If payouts are pending approval, the ledger can be demonstrated but the live payout requirement remains incomplete. Start onboarding during the frontend push; do not wait until the screen is beautiful.

## 15. Troubleshooting and continuity

| Situation | Required response |
|---|---|
| AI edits outside task | Stop the writer, inspect diff, retain useful work deliberately and restore only unintended changes with care |
| Repeated bug-fix failure | After two unsuccessful approaches, record reproduction/logs and request independent diagnosis; avoid changing unrelated files |
| Codex or Claude limit reached | Safe checkpoint + task/commit/checks handoff; use the other permitted tool or work manually |
| Review sees old code | Compare actual directory/HEAD with review record; reopen exact task folder/commit |
| Missing environment in worktree | Configure its test environment and dependencies explicitly; never copy production secrets automatically |
| Port conflict | Stop the correct server or choose a documented different port; verify which worktree owns it |
| Shared fixture diverges | Fix the canonical fixture/contract through its owner and retest the cross-portal journey |
| Build passes but page fails | Reproduce in the browser, check route/provider/env mismatch and actual response; a build is not runtime evidence |
| Client requests new feature on Day 3 | Record value/effort/impact, choose a scope tradeoff or Phase 1.1; don't let every developer interpret it separately |
| Client delays feedback | Continue independent backend work; mark design/rule approval pending and identify dependent tasks |
| Third-party approval late | Use the plan's explicit gated mode; never fabricate verified/paid state |

### Handoff when changing agent or developer

Always provide: task ID, branch/commit, relevant paths, intended outcome, current behavior, implemented work, exact checks/results, unresolved issue and next action. A chat summary may help, but checked-in source and task records establish the state. A new agent must confirm its actual HEAD before continuing.

## 16. Release and handover

Feature freeze remains Day 18. Days 19–20 verify critical behavior and recovery; Days 21–22 are client UAT; Day 23 is training/rehearsal; Day 24 is controlled release; Day 25 is stabilization and handover. Scope changes consume capacity or displace other work; frontend-first delivery does not create extra days.

Before release, the human owner confirms: accepted scope, real-adapter status, client UAT, security/financial tests, provider readiness, monitoring, backups/restore, rollback and support ownership. The agent prepares the checklist and evidence, then acts within the release authorization provided. No live money movement is authorized by this manual alone.

Handover package: source/build/deploy instructions, architecture/contracts, environment variable names, authorized account access, index/migration instructions, backup/restore runbook, admin/user quick guides, known limitations, issue backlog and support terms. Record who handles the first real event and first monthly payout cycle.

## 17. Team checklist

### Ready to start Day 1

- [ ] A/B/C named; individual accounts and repository access work.
- [ ] Fresh clone baseline and tool versions recorded on each laptop.
- [ ] Approved demo/deployment reference recorded.
- [ ] Shared-file extraction owner and lane paths agreed.
- [ ] AGENTS.md and CLAUDE.md read consistently by both tools.
- [ ] F01–F20 inventory, synthetic scenario and mock/HTTP boundary agreed.
- [ ] Provider onboarding owner, client review slot and credentials plan assigned.

### Ready for Day 3 client review

- [ ] At least 16 screen sets pass the explicit review checklist.
- [ ] Deployed preview verified; sample-data label and reset behavior clear.
- [ ] No dead primary buttons; desktop/mobile checks recorded.
- [ ] Operations format preserved; unsupported geofencing claims removed/isolated.
- [ ] Remaining frontend and production-integration work shown separately.
- [ ] Client feedback has one owner and a recorded disposition.

### Ready for each merge

- [ ] Task acceptance and current commit match the review evidence.
- [ ] Intended files only; contracts/fixtures updated together.
- [ ] Relevant CI/browser/domain tests pass; gaps are not hidden.
- [ ] Independent human review recorded.
- [ ] Merged staging behavior verified and status updated.

**The central rule:** both tools work from the same repository facts and task contract. Their job is to help three developers deliver a product the client can review early and trust at launch.
