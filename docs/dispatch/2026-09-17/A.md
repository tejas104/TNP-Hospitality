# A — TNP-A-M1 correction batch

Give this whole packet to the existing Dev A task. Execute Prompt 1 and then Prompt 2 without waiting for review between them.

## Execution contract

READY upon publication of this packet and matching STATUS/LANES on origin/main. Existing sole writer: `01a0aa5f-a826-7ab1-9cb7-a44736047ebe`, Anjaneya, DESKTOP-DL9FDM7, assigned gpt-5.6-sol / high. Existing branch `codex/tnp-a-m1`, worktree `D:\TNP-worktrees\TNP-A-M1`, correction baseline `1cd1209f8cf3a26336cb839a4b8d2e6adb6c6e12`. This resumes the existing milestone; do not recreate/reset/rebase it or merge metadata main into source. Port 3101; one heavy build per laptop.

Fetch origin; read this packet, current registers, AGENTS.md, TNP-START-HERE.md, PRODUCT, DESIGN, DOMAIN-RULES, ARCHITECTURE, LAUNCH-PROTOCOL, REVIEW-CADENCE, original TNP-A-M1 and referenced contracts with git show where needed. Verify actual directory, task ID from process environment, host, branch, clean HEAD equal to correction baseline, remote equality and original launch ancestry. Report actual observable model metadata; unavailable metadata is not proof of mismatch. Stop only on an actual mismatch or ownership/shared-contract blocker, preserving changes. Do not use browser session metadata as sole writer authority.

Own only `components/tnp/portals/client/**` and `components/tnp/portals/planner/**`, including local helpers/tests/styles. Shared PreviewControls, services, contracts, fixtures, routes, package files and registers remain frozen. Maintain labelled synthetic behavior. Branch checkpoint commits and non-force pushes are authorized; main merges/pushes and deployment are not. Lease ends at final review handoff.

Read `docs/reviews/TNP-A-M1-sol-review.md` in full. Include any already-received Sonnet findings in the same correction pass, identifying their source. P has not received the complete Sonnet report; do not claim its findings closed without seeing it. Work through the known findings now rather than request another unchanged-SHA review.

## Prompt 1 — request identity and record lifecycle

Fix booking, planner registration and requirement submission as complete logical actions. Persist operation, payload fingerprint, request key, expected generation and receipt before/after invocation as appropriate; reload and same-action retry must reuse identity. Successful unchanged forms must show the existing receipt instead of creating duplicate records. Explicit new submission or a materially changed payload gets a new identity; never reuse a key for different payloads. Handle unavailable/corrupt local storage without fabricated success. Invalidate prior-generation pending requests and receipts on reset while preserving only explicitly separate editable draft data.

Reconcile booking/event selections against current records and their relationship after load, reset and booking changes. Immediately before requirement submission, require an existing event belonging to the selected booking. Never submit hidden stale dropdown values. Clear/revalidate success IDs, quote notices, pending retries and timelines when shared reset removes their records. Escalate the missing shared-service booking/event invariant to P; do not patch frozen service code.

Verify reload/resubmit for all three operations, changed payload, reset/new generation, stale cross-linked IDs, two-record switching and storage failure. Run the original milestone checkpoint checks, commit/non-force push checkpoint 1, then continue.

## Prompt 2 — truthful status, recovery and combined regression

Map collection `paid` without a valid reference to one explicit unconfirmed/non-paid display state for text, styling and accessibility. Exercise this malformed case through a local UI test/probe without altering shared fixtures. Store explicit quote notice success/error from structured outcomes; all error codes must use error presentation, never message-text matching.

Validate all earlier wizard prerequisites when restoring Review. Missing/empty/error catalogues must explain the blocked action and provide a working recovery path with focus to the invalid step; remove silent enabled-submit returns. Check all six Sol findings together and any supplied Sonnet findings. Do not work around the inherited shared PreviewControls key collision by weakening generation/idempotency; report it separately.

Final checks: lint, `npx --no-install tsc --noEmit`, `node --experimental-strip-types --test tests/preview-contract.test.mjs`, build:vercel and git diff --check; reuse healthy installed dependencies. Add focused local tests for lifecycle/display failures where practical. Exercise 1440x900 and 390x844, keyboard/focus, submit/list/detail/quote/reload, no duplicate unchanged submissions, reset, stale generation/version, missing paid reference, empty restored Review, retry and two-record identity. Stop preview before build if needed. Attribute inherited warnings and any untested case.

Commit/non-force push final checkpoint. Return baseline, both checkpoint SHAs, clean remote-equal final SHA, changed paths, finding-by-finding disposition, commands, browser evidence and remaining shared gaps. Pause. P fetches the fixed SHA and requests one consolidated focused Sol plus separate Sonnet delta/regression window; Kartik retains human review. No intermediate review request and no self-approval.
