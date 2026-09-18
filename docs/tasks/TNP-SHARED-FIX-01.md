# TNP-SHARED-FIX-01 — preview request identity and requirement linkage

Status: READY for local implementation when the builder starts at the exact LAUNCH_SHA carrying this contract. Remote publication remains pending; no remote-equality claim is made.
Responsible human: H1 Anjaneya. H2 Kartik co-approves shared semantics.
Sole writer: Codex subagent `/root/shared_fix_builder`, assigned `gpt-5.6-sol` / high on DESKTOP-DL9FDM7. The model/effort assignment is explicit; the builder must report any runtime mismatch before editing.
SOURCE_SHA: `3e7977f575a2f524643e2f06a8e6446471df726e`.
Integrated dependencies: foundation merge `e6025cb0d16c433c0d29745d3eea1f9618718a67` and A integration merge `dc00a92037b7667c239e666b210a2e15e55c7665`; both are verified ancestors of SOURCE_SHA.
LAUNCH_SHA: the commit carrying this Ready contract and the matching STATUS/LANES reservation; P supplies its full hash after the commit exists. Initial builder HEAD must equal that hash and SOURCE_SHA must be its parent/ancestor.
Branch: `codex/tnp-shared-fix-01`.
Worktree: `D:\TNP-worktrees\TNP-SHARED-FIX-01`.
Reserved local resource: port 3103 and an isolated browser profile; recheck before binding. One heavy build on this host at a time.
Lease: exclusive to `/root/shared_fix_builder`, effective only after P creates the worktree at LAUNCH_SHA and the builder verifies identity, exact HEAD, clean state, ancestry, ownership and port. It ends at fixed-SHA handoff or explicit P revocation. No subagent or second writer may be spawned by the builder.
Review appointments: fresh read-only internal Sol/high subagent `/root/shared_fix_review` after handoff; separate external Claude NEW SESSION review at the immutable range, with exact external identity recorded on receipt; human shared-semantics approval by Anjaneya and Kartik. Reviewers do not edit.
Sharing: local checked commits are authorized. A non-force push is authorized only to `origin/codex/tnp-shared-fix-01` after live ref comparison; no main merge/push or deployment.

Purpose: close two independently reproduced shared defects before any integrated frontend acceptance claim:

1. `PreviewControls` reuses `preview-controls-variant-1` after a browser reload while the preview generation is unchanged, so a different variant payload can receive `IDEMPOTENCY_CONFLICT`.
2. `submitRequirement` checks that the supplied booking and event IDs exist but does not require the event to belong to that booking.

This Ready contract reserves only the writer, branch, worktree, resources and paths above. It does not authorize B, Platform, another writer, main integration, deployment or provider work.

## Dependencies and authority

- Reviewed and integrated TNP-FOUND-01, including the normative generation/idempotency rules in `docs/contracts/S1-PREVIEW-INTERFACES.md`.
- Final fixed-SHA handoff or explicit pause/revocation for the human lane that will own this correction.
- Builder startup must prove the recorded identity, host, assigned model/effort, clean newly created worktree, exact LAUNCH_SHA, SOURCE_SHA ancestry, reviewer appointments and exclusive lease.
- H1 and H2 approve any shared semantic change. This task is intended to enforce the existing S1 contract, not widen it.

## Bounded ownership

Only this Ready contract activates these paths:

- `components/tnp/shared/PreviewControls.tsx`
- `components/tnp/shared/previewActionIdentity.ts`
- `components/tnp/shared/previewActionIdentity.test.mjs`
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

The builder returns exact baseline, checkpoint/final SHA, clean local state, changed paths, commands/results, browser evidence and limitations, then pauses. Claim remote equality only after a successful live comparison and authorized non-force push. Fixed-SHA review requires fresh independent Sol/high plus separate Claude review; Anjaneya and Kartik retain shared-semantics acceptance. No main merge, deployment or production/provider change is authorized by this contract.
