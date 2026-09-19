SESSION TYPE: NEW SESSION

DO NOT REUSE AN OLD SESSION. This must be a fresh independent Codex `gpt-5.6-sol` / high fixed-SHA review. READ-ONLY REVIEW ONLY: do not implement, edit candidate files, format, commit, push, merge, deploy, connect providers or touch production.

# TNP-OPERATIONS-REPORTS-CLAUDE-M2 — CSV cleanup focused re-review

Review the immutable correction only:

- Candidate: `3cc630c432d84dc00e2d41f9a886d6872b7d50a6`
- Direct parent: `89fec9df168a49b9621ea4adda6c4312dbd5b8dc`
- Branch: `codex/tnp-operations-reports-claude-m2`
- Writer worktree: `D:\TNP-worktrees\TNP-OPERATIONS-REPORTS-CLAUDE-M2` — inspect read-only
- Expected delta: exactly:
  - `components/tnp/portals/operations/operationsReportsState.ts`
  - `components/tnp/portals/operations/operationsReports.test.mjs`

Use a new clean detached D:-drive review worktree at the exact candidate. First prove live remote equality, clean detached state, direct-parent equality, exact two-file scope, writer-worktree cleanliness and free port3109. Stop on any mismatch. Report actual session/model/effort/host/account; unavailable evidence stays unavailable.

Read current `AGENTS.md`, `TNP-START-HERE.md`, `docs/tasks/TNP-OPERATIONS-REPORTS-CLAUDE-M2.md`, `docs/dispatch/2026-09-19/OPERATIONS-REPORTS-CLAUDE-CSV-CORRECTION.md` and this packet from main. The earlier report file named `docs/reviews/TNP-OPERATIONS-REPORTS-SOL-REVIEW.md` is absent from all local refs; do not invent it. The authoritative retained finding is in the task contract and correction packet.

## Required finding closure

Independently prove `prepareCsvDownload` cleans every created browser resource on both normal and throwing click paths:

1. a successful click appends/creates one anchor, clicks it, removes that same anchor and revokes the one object URL exactly once;
2. a throwing click still removes that same anchor and revokes that URL exactly once;
3. click failure remains `{ ok: false, message }` and cannot be replaced by a cleanup error or reported as success;
4. object-URL creation failure does not attempt anchor removal or URL revocation;
5. deferred scheduling preserves the browser download opportunity without creating a second export path.

Inspect the actual helper and tests rather than inheriting the author's verdict. Evaluate the stated residual limitation: if a scheduled asynchronous revocation callback itself later throws, determine whether that is a candidate defect, an unrealistic injected-environment case or a non-blocking platform residual. Prioritize correctness and resource cleanup over style.

## Retained regression boundary

- Stable-ID report derivation, exact-current-filter CSV rows, deterministic columns and formula neutralization remain unchanged.
- Reset/race/error handling and false-success prevention remain intact.
- No CSS, navigation, report semantics, frozen service, other portal, package, server/provider or production behavior changed.
- Synthetic preview/export language must not imply an official immutable report or production delivery.

Run from the detached exact candidate and report actual results:

- `node --experimental-strip-types --test components/tnp/portals/operations/operationsReports.test.mjs`
- `node --experimental-strip-types --test components/tnp/portals/operations/*.test.mjs`
- `node --experimental-strip-types --test tests/preview-contract.test.mjs`
- `npm run lint`
- `npx --no-install tsc --noEmit --incremental false`
- `npm run build:vercel`, with at most one unchanged retry only for documented Windows `EBUSY` after confirming no task-owned process holds the output
- `git diff --check 89fec9df168a49b9621ea4adda6c4312dbd5b8dc..3cc630c432d84dc00e2d41f9a886d6872b7d50a6`

A browser rerun is not mandatory for this pure helper correction unless code inspection or tests expose a browser-contract uncertainty. Do not borrow the author's earlier 41/41 browser evidence as your own.

Return findings first, severity ordered, with exact file/line and reproduction. End with exactly one disposition:

- `APPROVE FOR ARCHITECT-CONTROLLED INTEGRATION` for `3cc630c432d84dc00e2d41f9a886d6872b7d50a6`, or
- `CHANGES REQUESTED` for that exact SHA.

Also report command evidence, limitations, clean candidate/writer worktrees and free port. Kartik's exact-SHA acceptance and P-controlled local integration remain separate. Do not merge or deploy.
