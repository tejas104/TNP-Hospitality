SESSION TYPE: OLD SESSION `96dfef2e-af39-4af1-a619-26ed81ca128a`

DO NOT OPEN A NEW SESSION. Resume only the same Claude Opus 5 review session that returned the round-three P2 on `28ecc920ffe055db0495159e90ee1a1ce3ed2226`.

# TNP-FREELANCER-ASTRA-M1 - round-three focused fixed-SHA re-review

READ-ONLY REVIEW ONLY. Do not edit, format, stage, commit, merge, push, deploy, connect providers or change production.

Review exactly:

- base: `28ecc920ffe055db0495159e90ee1a1ce3ed2226`
- candidate: `d16ab51d0c63efcdef3d93520d288f05afec1b2c`
- branch: `codex/tnp-freelancer-astra-m1`
- detached review worktree: `D:\TNP-review\TNP-FREELANCER-d16-claude`
- writer worktree: `D:\TNP-worktrees\TNP-FREELANCER-ASTRA-M1` (clean evidence only; do not write)
- candidate remote ref must equal the full SHA above
- allowed delta only:
  - `components/tnp/portals/freelancer/useFreelancer.ts`
  - `components/tnp/portals/freelancer/freelancer.test.mjs`
  - `components/tnp/portals/freelancer/browser-check.mjs`

Before review, report actual session identity/model/host, PWD, detached HEAD, branch status, candidate remote ref, cleanliness, base ancestry, exact changed files and port3108 state. Stop on a mismatch. Read current `AGENTS.md`, `TNP-START-HERE.md`, `docs/tasks/TNP-FREELANCER-ASTRA-M1.md`, `docs/dispatch/2026-09-19/FREELANCER-ASTRA-ROUND3-CORRECTION.md` and your previous round-three finding.

## Blocking question

Determine whether the correction now prevents a planted fresh-key registration journal for seeded workers 004 and 005 from reaching the service or receiving false saved/recovered feedback, while preserving a genuine new applicant success -> lost response -> reload -> exact service-ledger replay with exactly one worker/application and the original receipt.

Inspect specifically:

1. The `worker-absent` marker is written only after a pre-submit standing check returns `NOT_FOUND`, before the first mutation.
2. Exact retained request identity, payload, profile and generation still match on replay; the service ledger remains authoritative for replay versus payload conflict.
3. Seeded workers 003, 004, 005, 006 and 007 reject planted unmarked fresh-key journals without worker/application mutation, retained retry or saved/recovered success copy.
4. Changed payload on the same key still reaches the existing idempotency conflict path where appropriate and does not mutate records.
5. Cross-profile isolation, generation reset/stale journal, storage-denial fallback, application/assessment/opportunity/claim/Coming/Not Coming behavior, keyboard/touch/reduced-motion and AA contrast remain intact.
6. A hand-crafted exact-copy marked journal remains only a synthetic client-local residual risk; no production authorization claim was introduced.

## Independent checks

At minimum run from the detached candidate:

```powershell
node --experimental-strip-types --test components/tnp/portals/freelancer/freelancer.test.mjs components/tnp/shared/previewActionIdentity.test.mjs tests/preview-contract.test.mjs
npm run lint
npx --no-install tsc --noEmit --incremental false
git diff --check 28ecc920ffe055db0495159e90ee1a1ce3ed2226..d16ab51d0c63efcdef3d93520d288f05afec1b2c
```

Run the existing Freelancer browser check against a task-owned dev server/CDP browser if the local browser runtime is available. It must report all 18 groups and zero browser errors. The builder/P evidence already records a first-attempt `npm run build:vercel` PASS; reproduce the build if resources permit, with only the documented one unchanged retry for a Windows Nitro `EBUSY` after stopping review-owned processes.

Return findings first with exact file/line references. Then give exactly one disposition for exact `d16ab51d0c63efcdef3d93520d288f05afec1b2c`:

- `APPROVE FOR ARCHITECT-CONTROLLED INTEGRATION`, or
- `CHANGES REQUESTED` with the smallest bounded correction.

Kartik exact-SHA acceptance and P-controlled local integration remain separate. Do not push main or deploy.
