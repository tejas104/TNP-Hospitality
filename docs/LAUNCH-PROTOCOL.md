# Launch protocol — source baseline and launch commit

This is the sole launch procedure. Templates and prompts do not grant a writer lease.

1. P verifies prerequisite reviews, human approval and integration. Record SOURCE_SHA, the full current integrated source commit, and each dependency's integrated SHA. Every dependency must be an ancestor of SOURCE_SHA and SOURCE_SHA must be in verified main history. No invented merge evidence.
2. In a serialized docs task, P records Ready in docs/tasks/TASK.md: responsible human, exact lane/host/tool/model/effort and evidence, unused absolute D: worktree, branch, owned/forbidden paths/contracts/resources, acceptance/checks/mode/risk, AI reviewer host/model appointment, independent human reviewer appointment, Astra gate host/appointment if required, and a reserved exclusive writer lease with session/time. Also record an explicitly authorized review-sharing pusher/ref. Initial tasks need no earlier findings or reopened lease.
3. Commit that Ready contract and register updates. Its full hash is LAUNCH_SHA, supplied in P's dispatch message AFTER the commit exists. Do not write a commit's own hash into itself. The field inside the task says this commit carries the Ready contract. SOURCE_SHA remains the earlier integrated commit. The only allowed SOURCE_SHA..LAUNCH_SHA changes are docs/tasks/TASK.md, docs/STATUS.md and docs/LANES.md; any other change needs a new integrated baseline. P shares this exact launch commit only under recorded push authority so the other host can obtain it.
4. Create the new task branch/worktree at LAUNCH_SHA, not SOURCE_SHA. Verify initial HEAD equals LAUNCH_SHA; SOURCE_SHA is an ancestor; every dependency is an ancestor of SOURCE_SHA; the three-file diff allowlist holds; the Ready fields/lease actually match the session. Readiness is a human-and-evidence gate, not a PASS from the bootstrap snapshot checker.
5. The builder records actual launch evidence to P. P serializes Building status without forcing the builder to change its initial commit. One writer per worktree, no overlapping shared resources, normally one active builder per human. Pause dispatch at two waiting reviews and do not add work to a human with a waiting review.
6. Builder implements one task, runs required checks, commits and pauses at a fixed HEAD. A correction cycle needs the reviewed SHA, findings and a reopened bounded lease. Those fields are NOT prerequisites for the first implementation.
7. Review-sharing entry names who may push which branch; ordinary non-force updates only. Reviewed SHAs/tags are immutable. Reviewers use detached worktrees at fixed commits; no reviewing a moving branch. Fixes produce new review SHAs. No blanket push/merge/deploy authority is granted here.

## Reviewer routing
Preferred Claude source-review host for A/B/D: Kartik Laptop 2, fresh review session; C's source review: Anjaneya Laptop 1 Codex. Human approval A/B -> Kartik; C/D -> Anjaneya. Appointments must be recorded before Ready, not presumed from this preference.
Required Astra gates: fresh Codex Astra review on Kartik Laptop 2, whose supplied report demonstrated gpt-6-astra/low on 2026-09-16. Verify the newly selected session again. If unavailable, Anjaneya may host a separate fresh Astra reviewer session, never author P; otherwise the affected task waits. H1/H2 decide routing/schedule and record it; there is no automatic gate waiver or silent substitute. Same-model Astra review supplies process independence; the separate opposite-model review supplies model diversity.
S1 semantics require H1 and H2 approval. H2 domain input is co-design, not proof of independent domain authorship. Independent AI reviews and recorded human dispositions remain required.

## Paths and branch naming
Laptop 1 base clone: D:\TNP Hospitality. Laptop 2 base clone: D:\TNP-Hospitality (Kartik's supplied machine evidence). These are different paths on different machines.
Each host uses D:\TNP-worktrees\TASK for its own future writer worktrees. Kartik review worktrees use D:\TNP-review. Paths remain proposed until created and observed. Never create a nested worktree inside the source clone.
The codex/ branch prefix is a Git naming convention even for Claude-authored C work. Author tool/model fields determine review routing, not the branch prefix.

## Verification commands (read-only; substitute actual full hashes)
git rev-parse HEAD must equal supplied LAUNCH_SHA at initial launch.
git merge-base --is-ancestor SOURCE_SHA LAUNCH_SHA must exit 0.
git merge-base --is-ancestor DEPENDENCY_SHA SOURCE_SHA must exit 0 for each dependency.
git diff --name-only SOURCE_SHA LAUNCH_SHA must contain only the three documented task/register files.
git show LAUNCH_SHA:docs/tasks/TASK.md must show Ready and the actual reservation.
git status --short must be clean before initial implementation. Do not delete user changes to make it clean.
