# A — fixed-SHA correction delta/regression review packet

Status: REVIEW PREPARED. No reviewer is claimed running or complete by this packet.

## Immutable target

- Author/writer: Dev A `01a0aa5f-a826-7ab1-9cb7-a44736047ebe`, Anjaneya, DESKTOP-DL9FDM7.
- Branch: `codex/tnp-a-m1`.
- Reviewed-before-correction baseline: `1cd1209f8cf3a26336cb839a4b8d2e6adb6c6e12`.
- Correction checkpoint 1: `77a944a613c3a3bd6cd64e0dd7d23d1a0716f066`.
- Final correction target: `ddfef13582735f9d1f08b284cee111ec810b1c06`.
- Original launch `f2bfd882d738125e31f5de70896cf6a65d385990` and correction baseline are ancestors of the target.
- Local writer worktree was clean and `origin/codex/tnp-a-m1` plus live `ls-remote` matched the final target at dispatcher handoff.

Review the immutable target directly. Do not review a moving branch, edit the author worktree, merge main, deploy, or treat this packet as acceptance.

## Ownership and correction scope

The baseline-to-target diff contains ten paths, all within the existing A ownership:

- `components/tnp/portals/client/**`
- `components/tnp/portals/planner/**`

No shared contract, fixture, service, route, package, register or other lane path changed. The correction adds durable local action journals/tests, planner record reconciliation, reset cleanup, truthful quote/collection outcomes, and Review recovery behavior.

## Dispatcher pre-review verification

These checks were rerun by replacement P against the clean final worktree. They are verification evidence, not an independent review verdict.

- `git merge-base --is-ancestor` for original launch and reviewed correction baseline: PASS.
- `git diff --check 1cd1209f...ddfef135...`: PASS.
- `node --experimental-strip-types --test tests/preview-contract.test.mjs`: PASS, 13/13.
- Client focused local-action/display tests: PASS, 5/5.
- Planner reference-pair tests: PASS, 3/3.
- `npm run lint`: PASS with 0 errors and the same three inherited React compiler warnings in `hooks/use-mobile.ts` and `components/tnp/AppShell.tsx`.
- `npx --no-install tsc --noEmit --incremental false`: PASS.
- `npm run build:vercel`: PASS. Existing non-failing Vinext/Nitro dynamic-import, large-chunk, trace-include, plugin-timing and builder-platform advisories remain; they are not newly certified away.

Independent browser checks used the fixed candidate at `http://localhost:3101`, then stopped the server:

- Exact 1440x900 and 390x844 viewports on `/client` and `/planner`; document scroll width stayed within both viewports.
- Empty catalogue while a persisted Review draft was active produced an explained blocked state, disabled submission and a working return-to-Venue focus path.
- Client submission created `tnp-demo-booking-002`; reload restored that exact receipt; unchanged resubmission kept the same ID and explicitly reported no new logical booking.
- Planner selection of the real `tnp-demo-booking-002`, which has no owned event, cleared the event selection and rejected submission with `Choose a linked sample event` rather than sending a hidden/stale ID.
- No browser console warnings or errors were captured during these checks.

Browser limitations: P did not independently exercise a UI Reset/new-generation cycle, corrupt/unavailable local storage, every structured quote failure, or a paid-without-reference UI fixture. The 13 shared tests and eight focused tests cover service generation/idempotency plus helper/display behavior, but the reviewers must still exercise the missing UI cases. Browser data was labelled synthetic and local only.

## Required finding-by-finding review

Read `docs/reviews/TNP-A-M1-sol-review.md` in full and inspect both correction commits. Return one disposition for each original finding:

1. Booking, planner-registration and requirement action identity persists before/after invocation; reload and unchanged retry never duplicate, while changed payload or explicit new action gets a new identity.
2. `paid` without a valid reference uses one unconfirmed/non-paid label, style and accessible meaning.
3. Stored booking/event selections reconcile to current records and relationship; hidden stale or cross-linked values cannot be submitted by A UI.
4. Preview reset invalidates A-owned prior-generation receipts, pending retries, success IDs, quote notices, lookups and timeline state while preserving only documented editable drafts.
5. Restored Review revalidates venue/planner/details and provides an explained, keyboard-usable recovery path.
6. Every quote failure uses explicit error outcome/icon/style; no message-text success inference remains.

Regression review must also cover two-record selection, submit/list/detail/reload, stale version and stale generation, retry identity, missing records, loading/empty/error/ready, 1440x900 and 390x844, keyboard focus, and no overflow/console error.

## Separate gates and unresolved shared work

- Appoint a fresh independent Sol/high reviewer for this fixed SHA.
- Obtain the existing full Sonnet baseline report from Kartik and run a separate focused Sonnet delta/regression review. Do not claim unseen Sonnet findings closed or commission a duplicate unchanged-baseline audit merely because the complete report was not delivered to P.
- Kartik remains the human reviewer.
- `docs/tasks/TNP-SHARED-FIX-01.md` separately owns the frozen PreviewControls reload request-key collision and the shared `submitRequirement` booking/event invariant. A's UI guard does not close that service defect.

A is paused with no active source write. Any findings return to the original author only after P publishes a bounded reopened correction lease. No application integration or deployment is authorized.
