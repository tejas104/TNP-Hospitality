SESSION TYPE: OLD SESSION `7785999d-ff07-40fe-b2ae-86893368bf5b`

DO NOT OPEN A NEW SESSION. Resume only this exact Claude Code desktop author session. This is one bounded implementation correction, not a new Reports redesign or review.

# TNP-OPERATIONS-REPORTS-CLAUDE-M2 — one-defect CSV cleanup correction

Kartik authorizes continued frontend gate closure under the existing task contract. Work only in:

- branch `codex/tnp-operations-reports-claude-m2`;
- worktree `D:\TNP-worktrees\TNP-OPERATIONS-REPORTS-CLAUDE-M2`;
- current immutable starting HEAD `89fec9df168a49b9621ea4adda6c4312dbd5b8dc`;
- port 3109 only if browser verification genuinely needs it and the port is free.

Do not use the base clone, its untracked `tmp/`, any old scratchpad or another worktree. First run a read-only preflight and stop on any mismatch:

- report actual session/model/effort/host/account and current directory;
- fetch only the named feature ref if necessary;
- prove local HEAD and `origin/codex/tnp-operations-reports-claude-m2` both equal the full starting SHA;
- prove the worktree is clean, source/launch/checkpoint ancestry is intact, and port3109 is free;
- read current `AGENTS.md`, `TNP-START-HERE.md`, `docs/tasks/TNP-OPERATIONS-REPORTS-CLAUDE-M2.md` and `docs/reviews/TNP-OPERATIONS-REPORTS-SOL-REVIEW.md` through the base repository using `git show` or read-only file access without merging main.

## Sole defect

Fresh independent Sol/high cleared the full Reports milestone except this P2 failure-path resource leak:

`prepareCsvDownload` creates a hidden download anchor. When `anchor.click()` throws, the object URL is revoked but the anchor remains attached to the DOM.

Correct the helper so every created anchor is removed in guarded `finally` cleanup whether click succeeds or throws, while every created object URL is also revoked. Preserve the thrown/failure result so the UI cannot announce a successful export after click failure.

## Exact ownership

Writable only:

- `components/tnp/portals/operations/operationsReportsState.ts`
- `components/tnp/portals/operations/operationsReports.test.mjs`

`OperationsReports.tsx` is frozen unless you stop and prove the helper cannot receive/remove its own anchor under the current design. All CSS, navigation, report derivation, filters, CSV columns, copy, browser evidence, shared contracts/services, other portals, packages, docs, server/API/provider code and production state are frozen.

## Required regression evidence

Add focused assertions for both paths:

1. successful click: one anchor is appended, clicked, removed and its URL revoked exactly once;
2. throwing click: the same anchor is removed and URL revoked exactly once, the failure propagates/returns through the existing failure contract, and no false success is produced.

Retain all prior stable-ID, exact-current-filter CSV, quoting, reset/race/error and snapshot behavior. Avoid timers, arbitrary delays or a second export implementation.

Run and report:

- focused `operationsReports.test.mjs` plus the existing Operations suite and `tests/preview-contract.test.mjs`;
- `npm run lint`;
- `npx --no-install tsc --noEmit --incremental false`;
- `npm run build:vercel`, with at most one unchanged retry only for the documented Windows `EBUSY` after stopping task-owned processes;
- `git diff --check 89fec9df168a49b9621ea4adda6c4312dbd5b8dc..HEAD` and exact two-file scope.

If C: is full, keep review/install cache and temporary files on D:; do not clean unrelated user files. Stop any task-owned server and prove port3109 free. Commit only the two owned files, non-force push only the feature branch, prove clean local/remote equality, and return one new immutable final SHA with exact commands/results and limitations.

Then stop. Fresh Sol/high focused re-review and Kartik exact-SHA acceptance remain mandatory. Do not merge main, push main, deploy, connect providers or touch production.
