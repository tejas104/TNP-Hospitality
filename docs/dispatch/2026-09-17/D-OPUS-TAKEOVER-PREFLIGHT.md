# D — Claude Opus takeover preflight for second correction

Status: READ-ONLY PREFLIGHT. Writer lease NONE. Stop before source edits.

The user requested a new Claude Opus session on Kartik Laptop2 to replace the nearly-limited Codex D writer. This is a replacement writer for TNP-D-M1, not authorization to start the TNP-C freelancer lane. The prior D Codex session `01a0aded-481f-7121-a788-b8c307f8ab59` is revoked and must remain stopped.

## Candidate assignment

- Host: Kartik Laptop2 / expected DESKTOP-VO8G3GR; report actual.
- Base clone: `D:\TNP-Hospitality`; report actual.
- Existing worktree: `D:\TNP-worktrees\TNP-D-M1`.
- Existing branch: `codex/tnp-d-m1`.
- Remote correction baseline: `d9baeb3b5947a42e2c46b1a80b85156a531ac221`.
- Future owned paths after Ready: `components/tnp/portals/operations/**` only.
- Future task: both prompts in `D-REVIEW-2-CORRECTION.md`.

## Required evidence

Fetch origin without pull, merge, rebase or checkout changes. Read current `AGENTS.md`, startup/launch/cadence documents, STATUS, LANES, `D-REVIEW-2-CORRECTION.md`, `D-DELTA-REVIEW.md` and the prior D review.

Return:

- actual Claude task/session/conversation identity from the trusted runtime;
- actual selected model and effort, proving Opus rather than inferring it;
- actual host, base-clone path and current directory;
- `git -C D:\TNP-worktrees\TNP-D-M1 status --short --branch`;
- local HEAD, branch and fetched remote branch SHA;
- whether local HEAD equals, descends from or diverges from the remote baseline;
- exact modified/untracked paths and diff summary, if any;
- whether port 3104 or any process still owns the worktree/dev server;
- confirmation that the revoked Codex session is stopped and will not resume;
- confirmation the candidate accepts the existing Operations-only ownership and review gates.

Do not edit source, create/delete/move/reset/clean/stash the worktree, switch branches, commit, push, run formatters, start the dev server, merge main, deploy or start TNP-C. Preserve any local interrupted changes exactly. After reporting the evidence, STOP and wait for P to publish the identity-specific OLD SESSION continuation lease.
