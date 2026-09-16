# TNP — one ordered setup and development guide

This is the operating sequence for Anjaneya and Kartik. Follow the numbered steps in order. You do not need to assemble instructions from old chats.
Current candidate: branch `codex/tnp-bootstrap`; fixed review tag `tnp-bootstrap-review-01`. P publishes the tag after committing this guide and supplies its full commit SHA in the handoff. Verify that SHA before reviewing. Never move/reuse this tag for fixes.
Baseline being reviewed: `9d58061f2d36514ebc932fa94bb3dc90f4b97a97`.
This branch is shared for review. It is not merged into main, independently approved, deployed, or already installed on Kartik's laptop.

## 1. Know who runs what

| Person/laptop | Session | Tool | Responsibility |
|---|---|---|---|
| Anjaneya / Laptop 1 | P — this existing chat | Codex architect | Context, contracts, dispatch, review fixes; occupies B when writing |
| Anjaneya / Laptop 1 | A | Codex | Client/planner, F03–F06 |
| Anjaneya / Laptop 1 | B | Codex | S0 shared extraction, S1 shared fixtures/interfaces, then public F01–F02 |
| Kartik / Laptop 2 | C | Claude | Freelancer/workforce, F07–F11 |
| Kartik / Laptop 2 | D | Codex | Operations, F12–F16 |
| Kartik initially | R-Claude and R-Astra | Separate fresh review sessions | Bootstrap review only; read-only |

C is Claude and D is Codex. This corrects the earlier opposite tool assignment; functional areas stay the same.
A/B/C/D are four builder chats, not four humans. Start one builder per human by default. At two waiting reviews, stop starting new work.
Normal AI review: Codex author -> Claude reviewer; Claude author -> Codex reviewer.
Human approval: Kartik reviews A/B; Anjaneya reviews C/D. Architecture/security/concurrency/financial work additionally requires an independent Astra gate.
A reviewer can run on an available machine; it does not become a writer. If Kartik uses Claude to produce an AI review of D, Anjaneya still supplies the independent human approval.

## 2. What to send to each person

**Send Kartik this one guide (TNP-START-HERE.md), the GitHub repository link, and P's full review SHA.** After cloning, everything else is already in Git. Do not send credentials or reinstall Claude skills.

| Session | Files it reads from its own checkout | Attach separately? |
|---|---|---|
| Both bootstrap reviewers | AGENTS.md, CLAUDE.md as applicable, docs/tasks/TNP-BOOT-01.md, docs/reviews/TNP-BOOT-01.md, docs/BASELINE.md, relevant canonical/contracts/source references | No |
| A | AGENTS.md, docs/tasks/TNP-A-01.md (later A-02), PRODUCT/DESIGN, S0/S1 contracts, LANES | No |
| B | AGENTS.md, docs/tasks/TNP-S0.md, then TNP-S1.md, then TNP-B-01.md, referenced canonical/contracts | No |
| C / Claude | CLAUDE.md, AGENTS.md, docs/tasks/TNP-C-01.md (later C-02/C-03), workforce/domain/contracts, LANES | No |
| D / Codex | AGENTS.md, docs/tasks/TNP-D-01.md (later D-02/D-03), Operations/domain/contracts, LANES | No |

The repository includes eight intended TNP Markdown references under deliverables/, the PDF at docs/references/TNP_Platform_Engineering_Scope.pdf, and nine reviewed custom Codex skills at .agents/skills/.
They are source/reference copies, not authority to revive old three-human staffing or unapproved deferrals.
A normal Git clone includes hidden tracked .agents files. Do not copy personal .codex/.claude credentials or configuration directories.
A browser-only chat without repository filesystem access cannot perform this code review merely by receiving a path. Use Claude Code/Codex with the exact local folder attached.

**Anjaneya does not need to clone again.** The architect's original checkout is D:\TNP Hospitality, but the new files currently live in D:\TNP-worktrees\TNP-BOOT-01 on the bootstrap branch. New developer sessions must use their own later task worktrees, not all write in the original project folder. Being in the same named project does not guarantee the correct branch or files.

## 3. Kartik: get repository access and clone once — do this first

Anjaneya supplies the repository URL:
https://github.com/tejas104/TNP-Hospitality.git

If the repo is private, Kartik's own GitHub account needs repository access and any invitation must be accepted. “Repository not found” or authentication failure means resolve account/access first; do not share Anjaneya's token/password.

The following commands assume Windows PowerShell. Paths are proposed for Kartik and must be unused. If he already has a TNP clone, use the existing clone's actual path, inspect its status, fetch, and create fresh review worktrees; never overwrite it.

Check installed tools first:
```powershell
git --version
node --version
npm --version
claude --version
```
Use the existing installations. The tested Node version is 22.23.2; package engine requires >=22.13.0. Check the actual available Codex model on Kartik's host; Anjaneya's model access does not prove Kartik's access.

Clone the **bootstrap branch**, not default main:
```powershell
if (Test-Path -LiteralPath 'C:\dev\tnp-h2') { throw 'Folder exists: inspect it; do not overwrite or clone into it.' }
New-Item -ItemType Directory -Path 'C:\dev' -Force | Out-Null
git clone --branch codex/tnp-bootstrap https://github.com/tejas104/TNP-Hospitality.git 'C:\dev\tnp-h2'
if ($LASTEXITCODE -ne 0) { throw 'Clone failed; resolve GitHub access first.' }
Set-Location -LiteralPath 'C:\dev\tnp-h2'
git fetch origin --tags
if ($LASTEXITCODE -ne 0) { throw 'Fetch failed.' }
git remote -v
git status --short
git rev-parse 'tnp-bootstrap-review-01^{commit}'
```
Compare the printed full tag SHA to the full SHA P supplied. Stop on mismatch. This pinned tag is the review target, even if the branch later advances. Do not force-update a conflicting local tag.

## 4. Kartik: create two separate read-only review folders

Run after the clone and SHA comparison:
```powershell
Set-Location -LiteralPath 'C:\dev\tnp-h2'
$TnpReviewSha = (git rev-parse 'tnp-bootstrap-review-01^{commit}').Trim()
if ($LASTEXITCODE -ne 0) { throw 'Review tag unavailable.' }
New-Item -ItemType Directory -Path 'C:\dev\tnp-review' -Force | Out-Null
if ((Test-Path -LiteralPath 'C:\dev\tnp-review\bootstrap-claude') -or (Test-Path -LiteralPath 'C:\dev\tnp-review\bootstrap-astra')) { throw 'Review folder exists; inspect before reusing.' }
git worktree add --detach 'C:\dev\tnp-review\bootstrap-claude' $TnpReviewSha
if ($LASTEXITCODE -ne 0) { throw 'Claude review worktree failed.' }
git worktree add --detach 'C:\dev\tnp-review\bootstrap-astra' $TnpReviewSha
if ($LASTEXITCODE -ne 0) { throw 'Astra review worktree failed.' }
git -C 'C:\dev\tnp-review\bootstrap-claude' rev-parse HEAD
git -C 'C:\dev\tnp-review\bootstrap-astra' rev-parse HEAD
```
Both HEADs must equal the published tag SHA. These are review folders, not C/D developer folders. Reviews are read-only by instruction; a detached worktree itself is not a filesystem permission lock.

For source-only bootstrap review, npm install is unnecessary. If a reviewer independently repeats app checks, run them sequentially in that review folder with its own npm ci and report actual results. Existing lint has 8 errors and 3 warnings; do not claim it passed. The Python documentation checker uses only the standard library: python docs/checks/verify_bootstrap.py (use an available Python 3 executable or report unrun; do not invent availability).
Fresh-checkout provenance and docs checks already passed on Anjaneya's host. This does not substitute for Kartik's review.

## 5. Kartik: Claude bootstrap review — run now

Open Claude Code in C:\dev\tnp-review\bootstrap-claude. For the existing terminal installation:
```powershell
Set-Location -LiteralPath 'C:\dev\tnp-review\bootstrap-claude'
claude
```

Paste:
```text
You are independent TNP reviewer R-Claude, supervised by Kartik.
This is source review, not developer C implementation. Remain read-only.

Worktree: C:\dev\tnp-review\bootstrap-claude
Task: TNP-BOOT-01
BASE_SHA: 9d58061f2d36514ebc932fa94bb3dc90f4b97a97
Review target: tnp-bootstrap-review-01^{commit}

Verify working directory, detached HEAD, and that HEAD equals the
review tag. Print and record the full reviewed HEAD_SHA and actual
Claude model/version. Stop on a mismatch.

Read AGENTS.md, CLAUDE.md, TNP-START-HERE.md,
docs/tasks/TNP-BOOT-01.md and docs/reviews/TNP-BOOT-01.md.
Inspect the complete BASE_SHA..HEAD_SHA diff and relevant baseline
source. Use repository evidence, not author conclusions.

Check Anjaneya A/B Codex and Kartik C Claude/D Codex, two-human capacity,
clone/worktree instructions, pending client requirements, all F01–F20
evidence, S0/S1 dependencies, disjoint ownership and skill provenance.
Do not treat author-written plans as independent architectural approval.
Review the unchanged app baseline and inherited lint failures honestly.

Run permitted documentation checks if the environment supports them.
Do not edit files, fix findings, install Claude skills, merge, push or deploy.
Return:
1. Full BASE_SHA and reviewed HEAD_SHA; model/version.
2. Findings with severity, file/line, trigger, impact and evidence.
3. Checks actually performed and unrun checks.
4. Blocking issues and review disposition.
This is the opposite-model review, not the separate Astra gate.
```

Save/copy the report for P. Findings are not instructions to let the reviewer rewrite the branch.

## 6. Kartik: separate Codex Astra review — run next

Open C:\dev\tnp-review\bootstrap-astra as the local folder for a **fresh Codex task**. Use that existing folder directly; do not create an extra automatic worktree. Select Astra for this review if actually available. If unavailable, report the gate blocked; do not pretend another model met it.

Paste:
```text
You are independent TNP Astra reviewer R-Astra, supervised by Kartik.
You did not author this architecture. Fresh review; remain read-only.

Worktree: C:\dev\tnp-review\bootstrap-astra
Task: TNP-BOOT-01
BASE_SHA: 9d58061f2d36514ebc932fa94bb3dc90f4b97a97
Review target: tnp-bootstrap-review-01^{commit}

Verify directory, detached HEAD and equality to the tag; record the
full reviewed HEAD_SHA and actual model/effort. If not using Astra,
report that the required Astra gate has not been performed.

Read AGENTS.md, TNP-START-HERE.md, the TASK, review packet, domain rules,
architecture, S0/S1 contracts, dependency graph and baseline source.
Inspect the entire BASE_SHA..HEAD_SHA diff independently.

Assess API/domain boundaries, proposed production direction, preview
truthfulness, two-human supervision/review capacity, cross-worktree
ownership, financial/attendance/allocation invariants, pending scope
decisions and the new clone/review/dispatch instructions.
Check actual mapping: Anjaneya A/B Codex; Kartik C Claude/D Codex.
Do not inherit the architect's or Claude review's conclusions.

Return actionable findings with severity, file/line, trigger/impact and
evidence; exact checks and limitations; and an explicit Astra gate
disposition at the full reviewed SHA.
Do not edit, merge, push, deploy or certify human acceptance.
```

Use the same candidate for both reviews. If P fixes it later, obtain the new immutable target and re-review affected work; do not reuse an old approval.

## 7. Bring BOTH reports back to this existing architect chat

Paste:
```text
Bootstrap review handoff
Claude reviewed SHA: [paste actual full SHA]
Claude report: [paste findings/checks/disposition]

Astra reviewed SHA: [paste actual full SHA]
Astra model/effort: [paste actual setting]
Astra report: [paste findings/checks/gate]

Kartik's human observations/disposition:
[paste; do not claim approval if unresolved]
```

Both SHAs must match. P handles accepted corrections in the reserved B bootstrap task and publishes a new fixed target when needed. Reviews remain independent.
After required review and human approval, integration is a separate explicit step. P will prepare/perform only authorized integration and then update launch contracts.
The original Anjaneya checkout contains untracked copies of reference files; docs/INTEGRATION.md handles that collision. Do not run git clean, reset or force checkout to clear it.
No main merge, production deployment or blanket future publishing is authorized merely by this guide.

## 8. Do NOT launch all four builders immediately after review

Actual order:
```text
Bootstrap reviewed + human integration
  -> B: TNP-S0
  -> S0 fixed-commit review + human integration
  -> B: TNP-S1 in a new task branch/worktree
  -> S1 fixed-commit review + human integration
  -> Ready independent A/B/C/D frontend tasks
```

S0 extracts the shared portal file and establishes shared-theme ownership.
S1 establishes one typed interface and shared synthetic scenario.
Before they merge, A/C/D may read but must not implement competing portal changes.
Initially run A-01 and D-01 (one builder per human), then rotate B-01/C-01 as human review capacity permits. Four writers are optional, not a schedule promise.

P must first record each Ready task's exact merged baseline/dependency SHAs, actual tool/model, reviewer, worktree/branch, resource reservation and exclusive writer lease. Currently these application tasks are Draft. Do not invent those values or start based only on the suggested paths below.

| Sequence | Laptop/tool | Branch | Planned absolute task folder |
|---|---|---|---|
| TNP-S0 first | Anjaneya / B Codex | codex/tnp-s0 | D:\TNP-worktrees\TNP-S0 |
| TNP-S1 after S0 | Anjaneya / B Codex | codex/tnp-s1 | D:\TNP-worktrees\TNP-S1 |
| TNP-A-01 after S1 | Anjaneya / A Codex | codex/tnp-a-01 | D:\TNP-worktrees\TNP-A-01 |
| TNP-B-01 after S1 | Anjaneya / B Codex | codex/tnp-b-01 | D:\TNP-worktrees\TNP-B-01 |
| TNP-C-01 after S1 | Kartik / C Claude | codex/tnp-c-01 | C:\dev\tnp-work\TNP-C-01 |
| TNP-D-01 after S1 | Kartik / D Codex | codex/tnp-d-01 | C:\dev\tnp-work\TNP-D-01 |

These worktrees are NOT already created by this guide. Actual paths may change only through a recorded launch agreement.
After each slice: review/integrate before the next same-lane task. A-01 -> A-02; C-01 -> C-02 -> C-03; D-01 -> D-02 -> D-03. No automatic next-task launch.

## 9. Creating a developer worktree — only when P issues its Ready launch packet

Anjaneya already has the repository; do not clone again.
Kartik uses his C:\dev\tnp-h2 clone, not a review folder.
P supplies the exact baseline SHA; do not replace it with whichever branch happens to be current.

This reusable PowerShell block asks for values from the Ready TASK. It does not make a Draft task Ready:
```powershell
$TnpClone = Read-Host 'Actual base clone path: D:\TNP Hospitality or C:\dev\tnp-h2'
$TnpTaskBranch = Read-Host 'Branch exactly from the Ready TASK'
$TnpTaskPath = Read-Host 'Absolute unused worktree path exactly from the Ready TASK'
$TnpBaseSha = Read-Host 'Full implementation baseline SHA from P'
if (-not [System.IO.Path]::IsPathRooted($TnpTaskPath)) { throw 'An absolute path is required.' }
if (Test-Path -LiteralPath $TnpTaskPath) { throw 'Path already exists; do not reuse a writer folder blindly.' }
git -C $TnpClone fetch origin
if ($LASTEXITCODE -ne 0) { throw 'Fetch failed.' }
git -C $TnpClone cat-file -e "$TnpBaseSha^{commit}"
if ($LASTEXITCODE -ne 0) { throw 'Baseline is not available locally. Ask P; do not choose another commit.' }
git -C $TnpClone worktree add -b $TnpTaskBranch $TnpTaskPath $TnpBaseSha
if ($LASTEXITCODE -ne 0) { throw 'Worktree creation failed.' }
Set-Location -LiteralPath $TnpTaskPath
git branch --show-current
git rev-parse HEAD
git status --short
npm ci
if ($LASTEXITCODE -ne 0) { throw 'Dependency installation failed.' }
```

Check that current HEAD equals the Ready baseline and the branch/path are correct. Report launch evidence to P so the serialized lane register can reflect actual launch. Do not edit the shared register concurrently from four branches.
Open that exact folder in the assigned coding tool. For Claude, Set-Location to it then run claude. For Codex, attach/open it as the local workspace; do not ask for another automatic worktree.
No file attachments are needed: Git populated the worktree. Verify visible instructions and project skills in a fresh session. If a tool cannot read the folder, fix workspace access rather than pasting the whole project into chat.

## 10. Exact first builder prompts — save these, run only at their gates

### B / Anjaneya / Codex — FIRST developer to start, after bootstrap integration
```text
You are developer B under Anjaneya on Laptop 1.
First TASK: docs/tasks/TNP-S0.md.
Expected task folder: D:\TNP-worktrees\TNP-S0.
Expected branch: codex/tnp-s0.

Read AGENTS.md, the Ready TASK, relevant canonical docs and S0 contract.
Verify actual folder/branch/HEAD, implementation baseline, all merged
dependency SHAs, actual model/effort, reviewer availability and B lease.
If Draft, missing lease, unmerged dependency or mismatch: report it
without editing. Do not claim this prompt alone grants a lease.

Implement S0 only: extract existing portals/shared helpers and perform
the narrowly owned navigation lint fixes. Preserve approved public and
Operations visuals. Respect exact owned/forbidden paths.
Run required checks and desktop/mobile/keyboard/reduced-motion evidence.
Return fixed commit, changed files, tests/results and gaps to P.
Claude/Kartik review and separate Astra gate are required.
Do not merge, push, deploy, spawn writers or start S1 automatically.
```

**B's next prompt, only after S0 review/integration and a new Ready packet:**
```text
You are developer B under Anjaneya. Implement only Ready TASK TNP-S1
from docs/tasks/TNP-S1.md in D:\TNP-worktrees\TNP-S1,
branch codex/tnp-s1. Verify baseline, merged S0 evidence, actual model,
exclusive lease and reviewers before editing.
Read shared rules and S1-PREVIEW-INTERFACES.md. Build the agreed typed
preview service, deterministic shared scenario, reset/reload and
behavioral tests. Do not alter production auth/providers/frameworks.
Run every required check and the cross-portal preview scenario.
Return fixed commit/evidence to P for Claude/Kartik plus independent
Astra review. No merge/push/deploy or automatic next task.
```

**B public work, only after S1 review/integration and a new Ready packet:**
```text
Developer B under Anjaneya: implement only Ready TNP-B-01 in
D:\TNP-worktrees\TNP-B-01, branch codex/tnp-b-01.
Read AGENTS.md/TASK/contracts, verify actual baseline/merged dependencies,
model/reviewer/lease, and stay inside public-owned paths.
Preserve approved visuals; complete F01/F02 interactions and states.
Missing approved copy/TNP imagery remains an explicit acceptance gap.
Do not edit frozen shared shell/types/fixtures or claim placeholders done.
Run exact checks/browser scenarios and return a fixed commit/evidence
for Claude/Kartik review. No merge/push/deploy or extra writers.
```

### A / Anjaneya / Codex — after S1 integration and Ready launch packet
```text
You are developer A under Anjaneya on Laptop 1.
TASK: docs/tasks/TNP-A-01.md.
Folder: D:\TNP-worktrees\TNP-A-01. Branch: codex/tnp-a-01.
Read AGENTS.md, TASK and canonical contracts. Verify actual folder,
branch/HEAD, baseline, merged S1/dependencies, model/effort, reviewer
and exclusive lease. Stop dependent edits if any launch gate is missing.

Implement only F03 booking wizard and F05 planner entry in the owned
client/planner paths. Use frozen shared services. Include validation,
back/refresh, error/recovery and truthful sample-data feedback.
No shared CSS/interface/fixture edits or real provider behavior.
Run required tests plus desktop/mobile/keyboard scenarios.
Return fixed commit, changed files, actual checks and gaps to P.
Claude/Kartik review; escalate contract/security changes before editing.
No merge/push/deploy, extra writers or automatic A-02.
```

### C / Kartik / CLAUDE — after S1 integration and Ready launch packet
```text
You are developer C under Kartik on Laptop 2, using Claude.
TASK: docs/tasks/TNP-C-01.md.
Folder: C:\dev\tnp-work\TNP-C-01. Branch: codex/tnp-c-01.
Read CLAUDE.md, AGENTS.md, TASK and canonical contracts. Verify actual
folder/branch/HEAD, baseline, merged S1/dependencies, actual Claude
model/version/effort, reviewer and exclusive lease. Do not reinstall
skills. Stop dependent edits if any launch gate is missing.

Implement only F07 application/assessment preview in freelancer-owned
paths. Use shared synthetic services. Include validation, assessment
result, error/recovery and pending verification, optimized for phone use.
No fake live KYC success, production authority or shared fixture edits.
Run exact required checks and browser scenarios; return fixed commit,
changed files, evidence and gaps to P.
A fresh Codex reviewer plus Anjaneya reviews this Claude-authored task.
No merge/push/deploy, extra writers or automatic C-02.
```

### D / Kartik / CODEX — after S1 integration and Ready launch packet
```text
You are developer D under Kartik on Laptop 2, using Codex.
TASK: docs/tasks/TNP-D-01.md.
Folder: C:\dev\tnp-work\TNP-D-01. Branch: codex/tnp-d-01.
Read AGENTS.md, TASK and canonical contracts. Verify actual folder,
branch/HEAD, baseline, merged S1/dependencies, actual model/effort,
reviewer and exclusive lease. Stop dependent edits if gates are missing.

Implement only F12 Operations overview and F13 event/detail/roster
in Operations-owned paths. Preserve the approved layout and use shared
records. Make primary navigation real; support configured quantities.
No global CSS/shared contract edits, live tracking claims or providers.
Run required checks and desktop/mobile/keyboard scenarios.
Return fixed commit, changed files, actual results and gaps to P.
Fresh Claude source review plus Anjaneya's human review are required.
No merge/push/deploy, extra writers or automatic D-02.
```

## 11. What every developer returns; how the other laptop gets later work

Return TASK ID, human/lane, actual model, branch/path, BASE_SHA and HEAD_SHA, changed paths, tests actually run, preview origin/evidence, gaps and lease status.
A local commit is invisible to the other laptop until its branch is explicitly authorized for sharing and actually pushed. Do not assume sending a SHA transfers its objects.
For the current bootstrap only, P is authorized to push the branch and review tag. Future task-branch sharing is recorded in that task/handoff; builders do not infer unlimited push/merge permission.
When a task branch is actually shared, the reviewer fetches it and creates a detached worktree at the supplied full HEAD_SHA. Use fresh review context; fixes return to author.
After human integration and authorized sharing of main, each base clone fetches the integrated SHA. Every new task starts from that exact SHA and its own new branch/worktree, not an old task's checkout.

## 12. Decisions that remain pending

Kickoff date, Day 3 client slot/timezone, client scope approvals, exact developer model selections and actual writer launches remain unconfirmed.
Full WhatsApp RSVP and guest identity-document deferrals are not client-approved. Basic RSVP stays. Responsive web only; no native app or continuous background geofencing.
Day 3 target is 16/20 frontend screen sets, not 80% production complete. Two humans increase schedule risk; preserve Day 18 freeze, Days 19–23 verification, Day 24 planned release and Day 25 buffer.
No application builder is started by writing this guide. Right now: clone -> two reviews -> send both findings here.
