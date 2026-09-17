# TNP-SHARED-FIX-01 — preview request identity and requirement linkage

Status: DRAFT, NOT DISPATCHED. Writer lease NONE.

Purpose: close two independently reproduced shared defects before any integrated frontend acceptance claim:

1. `PreviewControls` reuses `preview-controls-variant-1` after a browser reload while the preview generation is unchanged, so a different variant payload can receive `IDEMPOTENCY_CONFLICT`.
2. `submitRequirement` checks that the supplied booking and event IDs exist but does not require the event to belong to that booking.

This draft records scope and acceptance only. It does not reserve a writer, model, host, worktree, branch, port, review session, source SHA or launch SHA. A and D correction leases remain the only implementation leases. Do not launch this task until capacity is free and P publishes a complete Ready contract under `docs/LAUNCH-PROTOCOL.md`.

## Dependencies and authority

- Reviewed and integrated TNP-FOUND-01, including the normative generation/idempotency rules in `docs/contracts/S1-PREVIEW-INTERFACES.md`.
- Final fixed-SHA handoff or explicit pause/revocation for the human lane that will own this correction.
- Actual writer identity, host, model/effort, clean unused worktree, branch, immutable source and launch SHAs, reviewer appointments and exclusive lease recorded at Ready.
- H1 and H2 approve any shared semantic change. This task is intended to enforce the existing S1 contract, not widen it.

## Proposed bounded ownership

Only the eventual Ready contract may activate these paths:

- `components/tnp/shared/PreviewControls.tsx`
- one explicitly named new helper and focused Node test under `components/tnp/shared/**`, if needed to make request-key behavior directly testable
- `lib/demo/service.ts`
- `tests/preview-contract.test.mjs`

Frozen: feature portal directories, `lib/contracts/**`, scenario/fixture shape, store/reset protocol, routes, AppShell, global CSS, package/lockfiles, framework/provider/auth/database configuration and shared registers. Escalate before editing a frozen path. No feature-lane workaround may weaken generation or idempotency behavior.

## Prompt 1 — durable variant action identity

Make every intentional preview-variant mutation use a request key that cannot collide with a different payload after component remount or browser reload in the same generation. Preserve the same key only for a genuine retry of the same captured action. Capture `expectedGeneration` at invocation and never substitute a later generation during retry. Do not change Reset semantics or clear the service ledgers to hide a collision.

Add a focused deterministic probe for the request-key helper/lifecycle. Verify at minimum: two distinct variant actions in one mount; reload followed by a different variant in the same generation; a genuine same-action retry; same-key/different-payload conflict remains rejected at the service layer; reset then variant action in the new generation; and unavailable browser persistence/identity facilities fail truthfully rather than fabricating success.

## Prompt 2 — booking/event relationship invariant

In `submitRequirement`, resolve both records and require `event.bookingId === booking.id` immediately before the serialized mutation commits. Unknown booking, unknown event and an existing-but-cross-linked pair must all return structured validation failure without inserting a requirement. A valid linked pair must continue to succeed and replay idempotently.

Extend `tests/preview-contract.test.mjs` with a valid second booking plus an event owned by another booking so the cross-link failure is proved with two existing IDs. Assert the requirement count and connected records are unchanged after rejection. Retain the current planner-to-Operations connected-flow coverage.

## Required verification and handoff

Run `npm run lint`; `npx --no-install tsc --noEmit`; `node --experimental-strip-types --test tests/preview-contract.test.mjs`; any focused helper test explicitly added by Ready; `npm run build:vercel`; and `git diff --check`. Attribute inherited warnings and do not invent an npm test/typecheck/E2E script.

Browser evidence must exercise preview variant changes before and after reload, reset/new generation, loading/empty/error/ready recovery, visible status output, keyboard operation and no `IDEMPOTENCY_CONFLICT` for different actions. Service evidence must cover valid, missing and cross-linked requirement IDs. Synthetic tests do not prove production authorization or concurrency.

The builder returns exact baseline, checkpoint/final SHA, clean remote equality, changed paths, commands/results, browser evidence and limitations, then pauses. Fixed-SHA review requires fresh independent Sol/high plus separate Sonnet review; Anjaneya and Kartik retain shared-semantics acceptance. No main merge, deployment or production/provider change is authorized by this draft.
