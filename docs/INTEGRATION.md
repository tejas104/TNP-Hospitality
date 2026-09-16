# Current bootstrap integration procedure

Current candidate: tnp-bootstrap-review-04. Review pair: Sonnet + independent Sol. Foundation milestone: TNP-FOUND-01.

No main merge is performed by these instructions. User authorized bootstrap sharing. Integrate only the final fixed candidate after required AI review, Kartik human disposition and explicit integration authority. Anjaneya is the named integration captain; P may execute on his behalf only with recorded authorization.

## Required evidence
Resolve candidate tag to the exact SHA supplied by P. Sonnet re-review must address accepted findings at that SHA; a genuinely separate Sol task must record actual model and architecture-gate disposition. Old DevD reviewer context and interrupted/mixed-model runs do not count. Record model/session, SHA, checks/limitations and approval separately from author checks. Fixes produce a new immutable target; no moved tags/force-push.
The inherited application lint has8 errors/3 warnings. Human approval of a docs-only integration must acknowledge that inherited baseline exception; S0 phase owns the8 navigation errors. No silent green claim.

## Preserve original local files
Original main checkout D:\TNP Hospitality contains eight intended untracked source references plus unrelated client files. Before an authorized integration:
1. Verify main/HEAD/status and candidate ancestry against current main. Stop on unexpected changes, never reset.
2. Compare only the eight intended references against docs/references/MANIFEST.json hashes. Differences require reconciliation.
3. Back up those exact matching files to a named external location; verify backup hashes and resolved absolute paths. Move only those exact matching files out of the checkout to avoid Git collisions. Preserve unrelated deliverables and tmp entirely.
4. On original main, git merge --ff-only EXACT_REVIEWED_SHA after reserving the human integration window. If it fails, restore exact missing source files from the verified backup, never force.
5. Confirm main/HEAD and python docs/checks/verify_bootstrap.py --provenance-only. Share main only under recorded push authority and verify remote SHA. Record actual outcome.
6. P prepares the Ready foundation contract from that integrated source baseline. It is the only dispatch for S0/S1. Serialize its Ready commit onto main before builder launch as in LAUNCH-PROTOCOL.md. There is no separate S0 or S1 integration gate inside the milestone.

## Subsequent foundation and consumer integration
B completes S0 then S1 with checks/checkpoint commits in one worktree. One Sonnet source review plus independent Sol architecture review and human approval covers the completed foundation. Integrate that reviewed milestone before consumers. Consumer dependency evidence names foundation's integrated commit. Later per-lane grouped launch contracts must be issued explicitly; old phase files do not grant leases.
Ready/Building register changes use current main and reserved captain integration as specified in LAUNCH-PROTOCOL.md; feature branches may need normal reviewed merges as main advances. Never discard authoritative register history. No deployment or production operation is authorized here.
