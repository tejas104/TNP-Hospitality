# TNP — one current instruction, D: on both laptops

## Current state
P is correcting TNP-BOOT-01. Both reports requested changes at review-01; no application task has launched. Their findings and author dispositions are now in docs/reviews/BOOT-01-CORRECTIONS.md. Read the new fixed candidate tnp-bootstrap-review-02 only after P supplies its published full SHA. The old review-01 remains unchanged for history.
The previous three generic prompts were stages, not three commands to run together. Discard them as launch instructions. A first implementation does not need prior findings or a reopened lease. Those apply only after that task's first review.

## Exact machine mapping
| Human/host | Base clone | Sessions | Future writer folders |
|---|---|---|---|
| Anjaneya / Laptop 1 | D:\TNP Hospitality | P architect; A/B Codex | D:\TNP-worktrees\TNP-S0, TNP-S1, TNP-A-01, TNP-B-01 (each full path under that parent) |
| Kartik / Laptop 2 | D:\TNP-Hospitality | C Claude; D Codex | D:\TNP-worktrees\TNP-C-01 and D:\TNP-worktrees\TNP-D-01 |

Anjaneya's current bootstrap writer is D:\TNP-worktrees\TNP-BOOT-01. Kartik's supplied review evidence names D:\TNP-review\bootstrap-astra. New review-02 folders use D:\TNP-review\bootstrap-02-claude and D:\TNP-review\bootstrap-02-astra. Planned paths are not existing leases. Do not confuse the space in Laptop 1's clone name with the hyphen in Laptop 2's. No new clone or file uploads are needed when the correct repo checkout is available. Git supplies canonical docs, selected references, PDF and nine skills. Do not reinstall Claude skills or copy personal configuration/credentials.

## The only next prompt to send
Send the following to a NEW review session on Kartik's laptop: first Claude, then a separate NEW Codex session with Astra selected. This is a review prompt, not a developer launch. Replace EXPECTED_SHA with the full new SHA P supplies. No batch of developer prompts is needed.

```text
You are a read-only reviewer of corrected TNP-BOOT-01 on Kartik's laptop.
EXPECTED_SHA: [full review-02 SHA from architect P]
BASE_SHA: 9d58061f2d36514ebc932fa94bb3dc90f4b97a97
Remote: https://github.com/tejas104/TNP-Hospitality.git
Existing base clone: D:\TNP-Hospitality
Fixed tag: tnp-bootstrap-review-02

Inspect the actual host, clone remote/status and git worktree list.
Fetch origin without resetting or changing the base checkout. Resolve
the fixed tag and require equality with EXPECTED_SHA. Stop on mismatch.
Create an unused detached review worktree at EXPECTED_SHA:
Claude: D:\TNP-review\bootstrap-02-claude
Astra: D:\TNP-review\bootstrap-02-astra
If it exists, verify its exact HEAD and clean state; never force/reuse
a dirty or different checkout. Target all reads/checks at this worktree.

Record actual model/context evidence. Claude performs opposite-model
source review. A separate fresh Codex Astra session performs the Astra
gate; neither author P nor an existing developer context can substitute.

Read AGENTS.md, TNP-START-HERE.md, docs/reviews/TNP-BOOT-01.md,
docs/reviews/BOOT-01-CORRECTIONS.md and the received reports. Inspect the
whole BASE_SHA..EXPECTED_SHA diff and relevant source independently.
Verify the corrected launch protocol, S0/S1 scopes, TypeScript test
strategy, consumer service matrix, domain protections and D: paths.
Run the documentation checks in the review packet if available.
No application dependency installation is needed for this docs review.

Return reviewed SHA, actual model and freshness evidence, findings,
executed checks/limitations and PASS or CHANGES REQUESTED. Distinguish
AI review from human approval. Do not edit, fix, merge, push, deploy,
launch developers or change Claude installation. Return findings to P.
```

Kartik's Claude executable was reported at C:\Users\Om\.local\bin\claude.exe; this is an existing tool location, not a repository/worktree path. Bare claude may not be on PATH. Python 3.11.9 and Node24 were reported on the verified host; conflicting earlier orientation reports are superseded by the machine-identified report, subject to fresh inspection.

## What happens immediately afterward
Bring both results to this architect session. P resolves findings; both required reviews and Kartik's human approval must apply to the final candidate. Then obtain authorization for the exact reviewed bootstrap integration. Main is not merged by a review prompt.
After integration, P issues ONE populated Ready packet for B/S0, with the full launch commit and source baseline, actual model/host, review appointments and a reserved writer lease. B starts S0 only. Do not ask A/C/D to retry their Draft tasks meanwhile.

## Development and review order
Bootstrap review/approval/integration -> B S0 -> review/approval/integration -> B S1 -> review/approval/integration -> independent consumer tasks. Initially A-01 and D-01, one builder per human; rotate B-01/C-01 as capacity permits. Every subsequent same-lane task also needs review/integration first. Final integrated browser gate I01 follows A-02/B-01/C-03/D-03 before Day-3 readiness claims.
Review happens after ONE completed task, regardless of how many messages it took. Codex A/B/D -> Claude review; Claude C -> Codex review. Human A/B reviewer Kartik; C/D reviewer Anjaneya. S0/S1/C-03/D-02/D-03 additionally need separate fresh Astra gates. Fixes return to the original builder with a reopened lease and require re-review at a new commit. Do not send a correction prompt before there is an implementation and its review findings.

## First developer prompt — P supplies this only with a real Ready packet
The eventual recipient is B on Anjaneya's laptop. The exact prompt and hashes will be issued together after bootstrap integration, not as placeholders to paste now. It will direct B to D:\TNP-worktrees\TNP-S0 on codex/tnp-s0 at LAUNCH_SHA, verify SOURCE_SHA ancestry and the Ready contract, and implement S0 only. See docs/LAUNCH-PROTOCOL.md for complete non-circular rules.
All Ready packets name review-sharing authority and a fixed commit. No force-push after handoff, no moved tags, no invented remote access or active lease. No native app, production deployment or blanket future publishing is authorized here.
