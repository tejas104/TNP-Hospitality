# Bootstrap review and safe integration

No main integration or production operation was performed. User now authorizes sharing codex/tnp-bootstrap plus a fixed review tag on GitHub so Kartik can clone BEFORE review. Current sequence is the root TNP-START-HERE.md guide: clone candidate, two read-only reviews, return findings, then approved integration.

## Review
Kartik obtains Claude review and a separate fresh Astra architecture gate at the exact candidate SHA supplied in the final handoff. Use the detached review checkout supplied there; do not edit it.
Record actual reviewer/model, reviewed SHA, checks, findings/disposition and human approval. P fixes under B if needed; reviewers re-review the new SHA. Do not accept this author's own documentation checks as independent review.
Application lint has eight inherited errors. A docs-only integration exception must explicitly acknowledge that baseline or wait for a separately reviewed fix; no silent green-gate waiver.

## Original checkout collision to handle
D:\TNP Hospitality has the eight intended source Markdown references as untracked files. A fast-forward merge may refuse to overwrite them even though bootstrap copies are identical. Unrelated client deliverables also exist there.
Before an authorized human integration:
1. Verify original main/HEAD/status and that the candidate is descended from current main. If main changed, revalidate rather than reset it.
2. Verify every intended untracked reference's SHA256 against docs/references/MANIFEST.json. If any differs, stop and reconcile; do not overwrite.
3. Make a verified backup of ONLY those eight matching TNP files to a named path outside the checkout. Move only those exact files out of the way after validating absolute source/backup paths. Leave every unrelated deliverable and tmp file untouched. Do not use git clean or broad directory deletion.
4. With a reserved integration window and the exact reviewed SHA, the human can run git merge --ff-only REVIEWED_SHA from original main. This is a future human action, not permission granted by this file.
5. If merge fails, restore the exact backed-up files to their original missing paths; never force/reset through the failure. Record outcome.
6. After success, confirm branch/HEAD, run the bootstrap provenance check, verify original files/application unchanged, and record human review and merge evidence in a serialized documentation update.
7. Only then make TNP-S0 Ready with the new baseline, actual model/host/reviewer and writer lease.

## Laptop 2
User authorized the current bootstrap branch/tag push; verify its actual remote SHA using TNP-START-HERE.md and P's handoff. Kartik first clones that unmerged branch and creates separate detached Claude/Astra review worktrees at the fixed tag. Do not wait for main integration before bootstrap review. After approved integration and separately authorized sharing of main, fetch the exact integrated commit before developer launch.
Do not share personal credentials/config folders. A prompt sent to another chat is not proof the repository files, model access or lease exist there.
