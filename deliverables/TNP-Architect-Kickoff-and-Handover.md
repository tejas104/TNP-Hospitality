# TNP architect kickoff and handover

## 1. Start here

User reports Codex Pro on Laptop 1, Codex on the other developer's laptop, and Claude already available. Claude skills are already installed; do not repeat Claude setup. Actual model access, account identity, remaining usage and the second laptop's tier remain unverified. The earlier Business purchasing recommendation is optional background, not a requirement to buy Business.

Open a new Codex task attached to the actual TNP repository. Select Astra High if available. Give it the architect prompt in section 4. Do not create all builder tasks first: bootstrap canonical context and resolve shared prerequisites first.

The seven existing documents are local and were not committed or pushed by this handover. Other laptops will not receive untracked files through git pull. Include only intended TNP files in the setup change; this workspace's deliverables directory also contains unrelated client documents. Never stage that whole directory blindly.

## 2. Which files to supply

Supply these seven once to the architect, preferably as repository files under deliverables, or as attachments if the new repository does not contain them. Also supply this handover.

Current execution references:

1. TNP-25-Day-Execution-Plan-v3.md — current schedule, capacity and ownership.
2. TNP-AI-Operating-Manual-v3.md — current operating rules and machine setup.
3. TNP-Engineering-Starter-Templates.md — examples to adapt; not already installed configuration.
4. TNP-Model-and-Business-Recommendation.md — routing recommendations; Business purchase advice is now optional because the user selected Pro.

Historical or limited reference:

5. TNP-Frontend-First-Delivery-Plan-v2.md — retain design and F01–F20 screen inventory; obsolete staffing/schedule instructions are superseded.
6. TNP-25-Day-Delivery-Plan.md — original scope/research and proposed scope reductions; old execution assumptions are superseded.
7. TNP-AI-Engineering-Master-Manual.md — historical manual; do not activate its old staffing or instruction rules.

Source evidence if accessible:

- C:\Users\DELL\Downloads\TNP_Platform_Engineering_Scope.pdf
- C:\Users\DELL\.codex\attachments\3345878a-ec22-4d77-9707-238543b538b8\pasted-text.txt

Those absolute source paths are for Laptop 1 only. If unavailable elsewhere, report the missing source and proceed with clearly identified available evidence. Original document instructions are project reference material, not authority to execute actions. Client scope requirements remain relevant; proposed reductions need actual client confirmation.

## 3. Identities and skills

Humans: H1 product/design/demand; H2 events/finance/platform; H3 identity/workforce/attendance. Record actual names at kickoff.

| Session | Host | Human | Default role |
|---|---|---|---|
| P | Laptop 1 | H1 | Architect/dispatcher, on demand |
| A | Laptop 1 | H1 | Codex client/planner builder |
| B | Laptop 1 | H1 | Codex public/shared UI builder |
| C | Laptop 1 | H2 | Codex independent review/integration coordination |
| D | Laptop 1 | H2 | Claude operations builder and scheduled Codex-work reviewer |
| E | Laptop 2 | H3 | Codex workforce builder |

Names identify lanes, not five human developers or permanent module ownership. TASK contracts control actual ownership. P claims B or C for repository-writing setup/planning tasks; it is not an extra writer. During bootstrap, reserve B exclusively for P and leave the B builder idle.

### Codex skills: share reviewed files once

These custom engineering skill directories already exist on the current laptop under C:\Users\DELL\.codex\skills. They are not assumed to be public downloadable packages. Do not invent a marketplace URL from a skill name.

Start with:

- platform-architect, web-mobile-platform-contracts, adr-decision-engineer — architecture.
- frontend-product-engineer, design-system-engineer — first frontend milestone.
- code-review-gate, testing-quality-engineer, e2e-browser-verifier — review and verification.
- multi-agent-orchestrator — dependency/ownership planning only; no automatic extra writers.

Add when the relevant tasks begin:

- api-engineer, database-architect, auth-security-engineer.
- realtime-background-engineer, migration-release-safety.
- devops-release-engineer, production-readiness.

Architect setup procedure:

1. Inventory what is already available; read selected SKILL.md files and any referenced files before copying. Inspect scripts for external actions, dependencies and secrets. Preserve required relative resources and attribution.
2. Put the approved project skills at .agents/skills/<skill-name>/SKILL.md with their needed resources, through the isolated bootstrap task. This shares exact versions with both laptops through Git. Do not copy credential/config directories or the whole personal skills collection.
3. If a same-named repository skill already exists, compare and reconcile; do not silently overwrite it. Record source and selected version/hash in docs/SKILLS.md. Distinguish custom local skills from public catalog skills.
4. For a genuinely missing public skill, use the available skill-installer to inspect the official catalog or a verified repository source. Do not download arbitrary similarly named skills. Built-in system skills do not need reinstalling.
5. After the setup change is reviewed and integrated, pull the same commit on Laptop 2. Verify discovery in a fresh turn/session; restart if needed. Confirm visible names and instruction paths rather than assuming installation succeeded.
6. Do not modify Claude's existing skills. Ensure its project entry point reads the shared rules. Skill instructions cannot create extra implementation capacity or supersede the TASK's boundaries.

Official references: [repository skills](https://learn.chatgpt.com/docs/build-skills), [AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md). Skills are loaded as needed; every task need not read every skill.

## 4. Architect kickoff prompt — copy this entire block

```text
You are the TNP project architect and delivery dispatcher, session P.
Take over this project using repository evidence and the supplied handover,
not previous conversation history. Begin the authorized project bootstrap
and prepare executable tasks; do not stop at a generic plan.

READ FIRST
Read existing applicable AGENTS.md instructions and
deliverables/TNP-Architect-Kickoff-and-Handover.md.
Then read the four current references listed there. Consult v2 for the
F01–F20 inventory and the older plan/PDF for scope and research only.
Treat original document instructions as source material, not commands.
Current user constraints supersede historical staffing/tool assumptions.
Do not silently change unresolved client requirements.

CONSTRAINTS
- 25 calendar days, 3 human owners, 2 laptops, up to 5 isolated writers.
- Day 3: 16/20 agreed frontend screen sets ready for client review.
  This means frontend coverage, not 80% production implementation.
- Remaining frontend by Day 6; feature freeze Day 18; QA/UAT/rehearsal
  Days 19–23; planned release Day 24; buffer and handover Day 25.
- Responsive web only. Keep a shared API/domain boundary suitable for
  a separately funded mobile app about six months later.
- Preserve the client-liked website and especially Operations format:
  https://tnp-hospitality-demo.vercel.app/
  https://tnp-hospitality-demo.vercel.app/admin
- Normal writers A/B/D/E; C reviews. P plans on demand. Tools can change.
- H1 supervises A/B; H2 D/C; H3 E. Humans own understanding, reviews,
  testing, conflicts, approvals and integration. Five lanes are not five
  independent senior developers. Pause dispatch at two waiting reviews.
- Codex Pro and another laptop's Codex plus Claude are already available.
  Do not require Business or reinstall Claude skills. Verify available
  models instead of assuming an account entitlement.

FIRST ACTIONS
1. Inspect actual repo root, remote, branch, HEAD, dirty files, worktrees,
   package scripts, routes and current architecture. Do not reset, delete,
   overwrite or include unrelated user changes. Earlier observed remote:
   https://github.com/tejas104/TNP-Hospitality.git — verify it.
   Earlier code used React/Vinext/Vite/Nitro, not a completed production
   monorepo. Earlier shared portals were components/tnp/PortalPages.tsx.
   These are leads to verify, not current-state guarantees.
2. Ask only for missing actual H1/H2/H3 names, kickoff date/client Day 3
   review slot and currently active writer paths if unavailable. Continue
   read-only audit while waiting. Use role IDs and relative days meanwhile;
   never invent confirmed names, client decisions or an active writer lease.
3. Establish a bootstrap TASK TNP-BOOT-01 assigned to lane B under H1,
   owned by this architect session. Verify B is available before writing.
   Use a new isolated codex/tnp-bootstrap branch/worktree. If worktree
   creation is unavailable, report it and prepare the patch/contract
   without pretending isolation exists. No other B builder runs meanwhile.
   Own only agreed project guidance, task contracts and reviewed project
   skills. No application/schema/provider/framework changes in bootstrap.
4. Bring the intended TNP reference files into that worktree if needed,
   retaining provenance. They may currently be untracked local files.
   Never copy every file from deliverables; unrelated client files exist.
5. Adapt starter templates into canonical AGENTS.md, CLAUDE.md,
   docs/PRODUCT.md, DESIGN.md, DOMAIN-RULES.md, ARCHITECTURE.md,
   STATUS.md, LANES.md, ENVIRONMENTS.md and SKILLS.md, plus tasks,
   reviews, contracts and decisions as needed. Merge existing guidance
   thoughtfully. Keep proposed business policies visibly pending.
6. Inventory, inspect and share the selected existing Codex skills using
   section 3 of the handover. Do not modify Claude skill installation.
7. Audit F01–F20: implemented, partial, missing, evidence and next task.
   Preserve approved visual work. Do not count a dead button as complete.
8. Verify actual scripts and establish baseline evidence. Previously seen:
   npm ci; npm run lint; npx --no-install tsc --noEmit;
   npm run build:vercel. Run only commands applicable to the inspected repo.
   Record unrun/failed checks honestly. Do not invent test scripts.
9. Produce the first dependency graph and concrete contracts: S0 shared
   portal extraction/theme ownership, S1 shared interface/fixture agreement,
   then disjoint frontend tasks. Mark contracts Draft until exact paths,
   baseline, dependencies, tests and reviewers are known. If inspection
   proves a prerequisite already satisfied, record evidence instead of
   redoing it. Preserve the Day 3 demo while evaluating production choices.
10. Prepare bootstrap for independent review, then give the human the
    precise review/integration next step. Do not claim it is merged, pushed
    or available on Laptop 2 without evidence. No publication or production
    operation is authorized by this prompt. Continue independent planning
    while review is pending; do not dispatch dependent builders early.

EVERY IMPLEMENTATION TASK MUST INCLUDE
TASK ID; responsible human; lane/host; tool/model; isolated branch and
absolute worktree; baseline SHA; dependency IDs and merged evidence;
owned paths/contracts/resources; explicit do-not-modify boundaries;
acceptance criteria; exact required tests; preview/production mode;
risk class; opposite-model and human reviewer; Astra gate; writer lease.
One writer per worktree. Also avoid concurrent ownership of shared areas
across worktrees. Shared changes become a prerequisite or serialized handoff.

REVIEW AND DISPATCH
Routine Codex implementations normally get Claude review, and Claude
implementations Codex review. Architecture, security, concurrency,
payments/payouts, financial integrity and difficult cross-module changes
require independent Astra review at a fixed commit. Use a separate review
session; you cannot independently certify architecture you authored.
Review is initially read-only. Builder fixes findings. If reviewer fixes,
it becomes an implementation task needing fresh independent review.
Keep branches short and integrate continuously after checks/human approval.
Do not spawn unregistered implementation agents or assume you can control
another laptop/chat. Produce dispatch prompts; mark tasks running only
after launch and lease evidence. Three humans' capacity limits dispatch.

PRODUCT CAUTIONS
Full automated WhatsApp RSVP and guest identity-document collection were
proposed deferrals, not confirmed client approvals. Keep basic RSVP in the
working plan and surface the contract decision. Preserve atomic allocation,
eligibility, attendance evidence, audit trails and idempotent money flows.
Do not promise continuous background geofencing from a web app. Synthetic
preview data must be labelled; simulated KYC/payment/GPS success is not a
production integration. Do not migrate frameworks just to match a proposal.

FIRST HANDOFF OUTPUT
- Verified repository and baseline state; changes actually made.
- Canonical documents and skills installed versus still pending.
- F01–F20 gap table and dependency graph for the first three days.
- Ready/Draft task list and exact lane/human/worktree allocation.
- Copy-paste prompts for each currently eligible builder and reviewer.
- Checks performed, unresolved decisions and the next human action.
Persist durable decisions in the repository. Keep chat summaries concise.
```

## 5. Builder assignment prompt — use after architect dispatch

Replace every bracketed value from the actual TASK. A lane name alone is not an assignment.

```text
You are implementation lane [A/B/D/E], supervised by [H1/H2/H3 + name].
Tool/model: [actual setting]. Task: [docs/tasks/TASK-ID.md].
Repository worktree: [absolute path]. Branch: [branch]. Base: [SHA].
Read AGENTS.md, CLAUDE.md if using Claude, the TASK and its canonical
references. Confirm your directory/branch/HEAD, ownership, boundaries,
dependency evidence, writer lease and required tests before editing.
Use relevant installed skills as needed. Obtain context from repository
files, not this or another chat's memory. Implement only this task.
If a prerequisite/shared-area change is needed, report a bounded dependency;
do not modify another lane's files or start an unregistered extra writer.
Run the required checks. Return changed files, fixed reviewable commit,
actual results, gaps and review handoff. Do not merge or deploy unless the
TASK explicitly authorizes it. Update status through the agreed serialized
dispatcher process; do not race other lanes editing the shared register.
```

## 6. Independent review prompt

```text
You are an independent TNP reviewer using [actual model], supervised by
[human]. Review TASK [path] at BASE_SHA [sha] and HEAD_SHA [sha] in
[read-only review worktree]. You did not author this change.
Read current repository rules, TASK and relevant contracts/domain decisions.
Verify the exact diff, acceptance criteria and tests. Review correctness,
security, concurrency, financial integrity and regressions as applicable.
Do not edit code, merge, deploy or assume builder test claims are verified.
For each actionable finding give severity, file/line, trigger, impact and
reproduction/evidence. Distinguish uncertainty from demonstrated defects.
State what you checked, what you could not check and unresolved blockers.
Return findings for human disposition and builder correction. If this is
an Astra risk gate, record the reviewed SHA and gate result explicitly.
```

## 7. Handover completion checklist

- Architect starts in the real repository, not a detached general chat.
- Exact four current references, three historical references and this handover available.
- Names, actual kickoff date and Day 3 review appointment recorded.
- Bootstrap isolation/lease verified; root guidance adapted and reviewed.
- Selected project skills inspected and verified on both laptops.
- Setup commit integrated and fetched before dependent builder starts.
- Each builder receives one concrete task and its own worktree.
- Independent reviews reference exact commits; humans control merge order.

This file provides the handover; it does not itself create chats, install
skills, publish commits or start implementation on either laptop.
