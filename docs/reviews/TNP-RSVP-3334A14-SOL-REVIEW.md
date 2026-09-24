# TNP RSVP fixed-SHA Sol review — 2026-09-25

**Verdict: CHANGES REQUESTED.** Reviewed code SHA `3334a14dbb600fa09387734bbadbea378e5560b8`, descended from M5 code `15502c3bfdc0ba3e8df9a39a0cc8a04b83340e8d`. Reviewer was the new read-only Codex task `01a0d4b5-1121-7ea2-ae03-74be4015fb1d` in clean detached `D:\TNP-review\TNP-RSVP-BACKEND-3334a14` on DESKTOP-DL9FDM7. Its own session `turn_context` records actual `gpt-6-sol` / `medium`; the reviewer final did not have that metadata and therefore reported it unverified at the time. The author branch remained untouched.

## Findings

1. **P1 — Event closure races a new pending reply.** `server/rsvp/service.ts:320` counts pending review before closure; `server/rsvp/service.ts:617` can insert a new reply without a conflicting write to the event. Concurrent transactions can commit closure with an unresolved reply. Serialize closure and review-queue writes on a common event revision, and verify against MongoDB transaction behavior.
2. **P1 — Shared-contact opt-out can be bypassed.** `server/rsvp/mongo.ts:155` suppresses one guest row while `server/rsvp/service.ts:583` and message preparation inspect the selected guest only. Two reviewed parties can share the same contact; the other party can remain message-eligible after an opt-out. Define event-scoped contact suppression and enforce it for audience and message preparation.
3. **P2 — Consent accepts an unreviewed reply.** `server/rsvp/service.ts:539` checks party association and reply time, but not `reviewStatus`; `tests/rsvp-service.test.mjs:186` confirms consent directly from an unconfirmed reply. Require reviewed evidence before restoring or marking contact consent.
4. **P2 — Idempotent replay skips current entitlement.** `server/idempotency/service.ts:292` returns a stored mutation response before the RSVP method checks current entitlement. Replaying after suspension can return prior data. Reauthorize active scope and entitlement before replay return, with a focused suspension test.

## Verification and limits

- Reviewer: `node --test tests/rsvp-service.test.mjs` passed 18/18; focused `git diff --check` passed; detached checkout stayed clean at the target SHA.
- Reviewer could not complete non-incremental TypeScript in its dependency-free checkout because `@cloudflare/workers-types`, `node` and `vinext/types` definitions were absent. P's prior inline check in the author worktree passed TypeScript and 156/156 tracked tests; those checks do not resolve these review findings.
- Reviewer did not run MongoDB integration or build. The browser-local RSVP workspace is not connected to this server candidate; no live Meta delivery was verified.
- The separate M5 frontend rejection remains open in this descendant: public `demoWorkspaces` still uses the full registry, the photo backdrop still replaces the cube, mobile labels remain tiny, and Planner section links still share one target. Backend correction must not be reported as aggregate frontend acceptance.

Kartik fixed-SHA acceptance, corrected successor review, real MongoDB transaction evidence, source integration and deployment remain separate gates.
