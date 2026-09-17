# D — interrupted-writer takeover preflight

Status: READ-ONLY RECOVERY ONLY. No replacement lease exists.

Use this only if the original D Codex task cannot resume. Claude or another Codex task may perform the preflight, but must not edit source until P publishes a serialized lease reassignment.

## Required recovery evidence

Run from Kartik's Laptop2 without moving or recreating the worktree. Report:

- actual replacement task/session identity, model/effort, host and current directory;
- `git -C D:\TNP-worktrees\TNP-D-M1 status --short --branch`;
- local HEAD, branch and `origin/codex/tnp-d-m1` after fetch;
- whether local HEAD equals, descends from or diverges from remote `9785bd5631a99e5372dbca928f62eda52c004384`;
- exact modified/untracked paths and a diff summary, without printing secrets or personal data;
- whether a dev server or other writer process still owns port 3104 or the worktree;
- confirmation that the original task is stopped and will not resume after reassignment.

Do not reset, clean, stash, checkout, commit, push, rebase, merge, run formatters or start implementation. Do not create another D worktree/branch. If local work exists, preserve it exactly.

## Reassignment gate

P may issue a replacement lease only after the evidence above is reconciled. The Ready update must name the new writer, explicitly revoke the old writer, record the exact resume HEAD and dirty/clean state, retain the same owned Operations paths and correction scope, and keep one writer only.

- If Claude/Sonnet becomes the implementation author, it cannot perform the separate Sonnet review; use fresh independent Codex/Sol plus the required human/domain review.
- If another Codex/Sol task becomes the author, keep the separate Sonnet review and fresh independent Sol integrity review, neither performed by the authoring task.
- Mixed authorship and the commit boundary must be disclosed in the final handoff.

C must remain Draft while this D ownership decision uses Kartik's one-complex-task capacity. No main merge, integration, deployment or production action is authorized.
