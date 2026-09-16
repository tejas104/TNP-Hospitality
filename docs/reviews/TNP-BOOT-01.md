# Independent review packet — TNP-BOOT-01

Author P; responsible human Anjaneya; lane B; Codex (local configured gpt-6-astra/high).
BASE_SHA: 9d58061f2d36514ebc932fa94bb3dc90f4b97a97.
Candidate branch: codex/tnp-bootstrap. Fixed HEAD_SHA is supplied in the final human handoff; verify it before review. Never review a moving branch without resolving/pinning its commit.
Source worktree D:\TNP-worktrees\TNP-BOOT-01.
Dedicated detached review worktree will be recorded in the handoff if created; source review remains read-only.
Mode: documentation/preview planning. Required human reviewer Kartik.
Routine AI reviewer: Claude (actual version/session pending).
Astra gate: required, separate fresh review at the same fixed SHA; no author self-certification.
No independent review performed yet. No human approval or merge claimed.

## Review checklist
- Verify exact diff is allowlisted docs/guidance/selected references/skills and scoped .gitattributes provenance rules; app and package/config trees unchanged.
- Check two-human mapping, capacity claims, queue limits and actual versus proposed worktree/model/lease fields.
- Verify original requirement contradictions remain pending; no fake RSVP/document deferral approval.
- Trace all F01–F20 evidence to baseline source; do not count cosmetic UI or dead buttons.
- Inspect S0/S1 shared ownership and consumer disjointness, dependency and review gates.
- Validate manifest hashes and absence of copied credentials/unrelated client documents.
- Re-run docs/checks/verify_bootstrap.py and git diff --check; inspect baseline logs and distinguish inherited errors from regressions.
- Verify skill instructions cannot auto-launch unregistered writers.
- Confirm production/API/hosting choices remain proposals and Day 3 demo preservation is explicit.

## Findings (reviewer returns these to human/builder, does not edit here)
ID | severity | file/line | trigger | impact | evidence | disposition owner
No findings supplied yet; this means not reviewed, not passed.

## Disposition and completion
Kartik records confirmed/rejected/reproduce with reasons. P fixes accepted findings under the bounded lease. New commit -> relevant independent re-review.
Record reviewer/model, fixed reviewed SHA, checks actually run, limitations, unresolved blockers, Astra result and human approval.
Only then may a human integrate. Publication and production remain outside authorization.

## Updated review target and cross-host setup
The initial local 5cece04 checkpoint is superseded by the single-guide/tool-mapping revision. Review immutable tag tnp-bootstrap-review-01 after P publishes it; verify the full SHA from P's handoff. Kartik creates two separate detached worktrees from that tag using TNP-START-HERE.md. The older local detached checkout, if present, is not the current target. Review the entire original BASE_SHA..new HEAD_SHA diff. Include the corrected C Claude/D Codex mapping, GitHub authorization boundaries and clone-before-review order.
