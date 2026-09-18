SESSION TYPE: NEW SESSION

DO NOT OPEN OR REUSE ANY PREVIOUS TNP ARCHITECT, REVIEWER OR DEVELOPER SESSION.

# TNP-CLIENT-ASTRA-M1 — Kartik Cursor-account handoff

You are a replacement candidate on the same physical device under Kartik's separate Cursor account. This is a session/account change only. It does not authorize a second writer, inherit the previous session's identity, waive repository gates or make incomplete work accepted.

## First response: read-only preflight only

Do not edit, format, stage, commit, push, pull, merge, reset, checkout, clean, stash, install, start a server/browser, create a worktree, claim a lease, integrate main, deploy or connect providers during the first response.

Repository: `D:\TNP Hospitality`

Existing task worktree: `D:\TNP-worktrees\TNP-CLIENT-ASTRA-M1`

Existing branch: `codex/tnp-client-astra-m1`

Expected host: `DESKTOP-DL9FDM7`

Requested writer runtime for later implementation: `gpt-6-astra` / high. Report the actual model and effort shown by your runtime; a requested value is not proof. If Astra/high is unavailable, stop after preflight and say so.

Canonical identities:

- SOURCE: `6320cfaa654432cd734bc71eef375a36101afc9e`
- LAUNCH: `04e45a8411d22750c7a099bb0afe4d75fe1333a4`
- Completed Client checkpoint / expected HEAD: `b84f1eef0e322aa4112213d45e5b4761d79b28e2`
- Expected live remote `origin/codex/tnp-client-astra-m1`: `b84f1eef0e322aa4112213d45e5b4761d79b28e2`
- Reserved implementation port after lease transfer: `3106`

Read fully:

1. `AGENTS.md`
2. `TNP-START-HERE.md`
3. `docs/PRODUCT.md`
4. `docs/DESIGN.md`
5. `docs/REVIEW-CADENCE.md`
6. `docs/tasks/TNP-CLIENT-ASTRA-M1.md`
7. `docs/dispatch/2026-09-18/CLIENT-ASTRA-M1-EXECUTION.md`
8. the newest entries in `docs/STATUS.md` and `docs/LANES.md`

Use the project `frontend-product-engineer`, `design-system-engineer`, `testing-quality-engineer` and `e2e-browser-verifier` skills. The multi-agent decision is one sequential writer because Client/Planner identity, retry and state risks overlap.

## Required read-only evidence

Return all of the following and then stop:

1. Actual session/account identifier, actual model, actual effort, host and current directory.
2. Exact absolute worktree and branch.
3. `git rev-parse HEAD`, `git status --short`, `git diff --check`, staged status and live remote SHA.
4. Confirmation that SOURCE is an ancestor of HEAD and LAUNCH is an ancestor of HEAD.
5. Confirmation that HEAD and live remote equal the completed Client checkpoint.
6. Confirmation that port3106 has no listener and no task dev server is running.
7. Exact preserved WIP must be only:

```text
 M components/tnp/portals/planner/PlannerPortal.tsx
?? components/tnp/portals/planner/illustrative-media.test.mjs
?? components/tnp/portals/planner/illustrative-media.ts
```

Nothing should be staged. Do not discard or normalize those files. If any identity, SHA, branch, remote, worktree, port, staged state or changed path differs, stop and report the mismatch without fixing it.

The architect P will review this evidence and publish an explicit replacement lease before implementation. Do not proceed merely because this prompt exists.

## Completed Client Prompt 1 — preserve it

The pushed Client checkpoint changed exactly:

```text
components/tnp/portals/client/ClientExperience.tsx
components/tnp/portals/client/ClientExperience.module.css
components/tnp/portals/client/ClientStatusHub.tsx
components/tnp/portals/client/ClientStatusHub.module.css
components/tnp/portals/client/illustrative-media.ts
components/tnp/portals/client/illustrative-media.test.mjs
```

It adds editorial Client discovery using existing labelled illustrative imagery, local section navigation, clearer Venue to Planner to Details to Review progress, selected-brief summaries, review editing, validation/focus recovery, honest draft-storage failure handling, booking/quote pending and retry recovery, booking-selection isolation, loading/empty/error/ready states, image fallback and responsive local `#008080` styling. It does not change booking DTOs, shared contracts, authentication, payments, external delivery or providers.

Checkpoint evidence: locked install; 31/31 focused/shared tests; lint with three inherited warnings; explicit non-incremental TypeScript; diff checks; Vercel build after one unchanged Windows `EBUSY` retry; 1440x900, 1100x900, 390x844, 619/621 and 899/901 browser checks; keyboard/touch; four-step validation/edit/review; two bookings; restore/replay/new action; quote approval/revision/stale guard; injected response/storage/image failures; reduced motion and overflow. Chromium emulation is not physical-device or Safari proof. Dependency audit reported 11 existing advisories and no dependency change was authorized.

## Preserved Planner WIP — incomplete and unverified

`PlannerPortal.tsx` has approximately 83 additions and 22 deletions. Partial work includes an editorial hero, illustrative-image helper, draft-storage failure message, loading distinction, selected booking/event context, mutation try/catch/finally handling, local anchors/busy state, partial invalid-field focus and more truthful illustrative-stage wording. The two untracked files define/test labelled existing Jaipur imagery.

Do not call this functional or complete. Planner CSS has not been updated; most new classes are absent; the `#planner-directory` target is missing; field-error associations and validation focus are incomplete; directory/filter/state work and storage guards remain; `PlannerRequirements.tsx` and its CSS are unchanged; no Planner lint, TypeScript, test, build or browser verification has run.

## Implementation after explicit lease transfer

Resume Prompt 2 only. Preserve the Client checkpoint and the three WIP files. Complete the Planner registration/requirement workspace and master-detail directory within the exact allowlist in `CLIENT-ASTRA-M1-EXECUTION.md`. Preserve pending sample-verification truth, booking/event pairing, retry identity, local restoration and existing draft/submitted/staffing statuses. Keep the seven-stage journey explicitly illustrative.

Do not implement booking-schema expansion, live availability/reservations, marketplace/recommendations, event creation/cancellation/staff allocation/publishing, real auth/roles/invitations, payments/invoices/refunds, chat/WhatsApp/email/push delivery, or RSVP documents/rooming/travel/transport. These major additions require separate user/client and contract approval.

Required final checks include:

```powershell
npm run lint
npx --no-install tsc --noEmit --incremental false
node --test components/tnp/portals/client/localAction.test.mjs components/tnp/portals/client/illustrative-media.test.mjs components/tnp/portals/planner/localAction.test.mjs components/tnp/portals/planner/illustrative-media.test.mjs tests/preview-contract.test.mjs components/tnp/shared/previewActionIdentity.test.mjs
npm run build:vercel
git diff --check
```

Also verify 1440x900, 1100x900, 390x844 and both sides of changed breakpoints with real keyboard/touch, reduced motion, loading/empty/error/retry/success/stale/restore/reset/storage-failure states, two-record identity isolation, image fallback, contrast, overflow, footer/fixed-overlay and console/hydration checks. A Windows `EBUSY` packaging failure permits only one unchanged retry after stopping owned processes; do not change source to mask it.

At completion, stage exact owned paths only, compare the live remote against the known Client checkpoint, commit and non-force push only `codex/tnp-client-astra-m1`, report exact final SHA/remote equality/checks/evidence/limitations, stop the dedicated server/browser, verify port3106 free and return the lease.

Fresh independent Claude review and Kartik's separate fixed-SHA acceptance are required for the future immutable final. Do not integrate main, push main, deploy, connect providers or mutate production.
