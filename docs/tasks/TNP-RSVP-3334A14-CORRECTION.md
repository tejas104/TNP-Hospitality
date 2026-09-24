SESSION TYPE: NEW SESSION

# TNP RSVP fixed-SHA correction

Status: **Draft / preflight pending**. A new GPT-6 Sol/medium Codex task may inspect this packet read-only. P must record its actual task/runtime/host, launch baseline and lease in a serialized docs-only Ready commit before any source edit. Reusing the interrupted review subagent or the outgoing author session as writer is forbidden.

## Objective and immutable input

- Correct the four findings in `docs/reviews/TNP-RSVP-3334A14-SOL-REVIEW.md` against exact local candidate `3334a14dbb600fa09387734bbadbea378e5560b8` without expanding the product. This is the same Kartik RSVP review queue, not an unrelated new milestone.
- P's Draft source register is local main `1d76e2cc4b02f694142d6087c1e1c205af8f7d4b` (docs only, remote main still `10f149472c06fa8ad7855bf24f21e4fa9a41c94f`). Refresh before Ready. The later Ready commit is LAUNCH_SHA; the writer's initial correction worktree HEAD must equal that full SHA, with SOURCE_SHA as an ancestor. On the isolated branch, merge the immutable RSVP candidate as the first authorized source action and record both parents. `git merge-tree --write-tree 1d76e2c 3334a14` returned a tree without conflicts in Draft preflight; recheck at Ready.
- Proposed branch/worktree: `codex/tnp-rsvp-correction-20260925` / `D:\TNP-worktrees\TNP-RSVP-CORRECTION-20260925`. Both were absent at Draft preflight. One writer only. Use a free dedicated port only if an HTTP check is needed; do not stop the existing 3134 demo server.
- Responsible human/operator: Kartik, as named by the user for the active correction path. P remains task `01a0d2d3-e18b-7920-bbf8-ca67a9947edc`. Independent Sol reviewer task `01a0d4b5-1121-7ea2-ae03-74be4015fb1d` is read-only and complete; focused successor re-review requires a fresh appointment. Kartik exact-successor acceptance remains separate.

## Bounded correction scope

1. **Close/reply race (P1):** make event closure and any new pending reply/information write conflict or serialize on a common event revision inside Mongo transactions. Add a deterministic interleaving test and, if a configured development MongoDB is available, a real transaction race check. Never claim a fake store proves Mongo concurrency.
2. **Shared-contact suppression (P1):** choose and document conservative event-scoped contact policy. An opt-out, wrong-number or block must prevent message preparation and audience eligibility through every party sharing that contact, including newly imported parties. Preserve separate party/person RSVP state. Address legacy rows without `contactKey`; add indexes/migration notes before production. Reconsent requires fresh reviewed evidence.
3. **Consent evidence (P2):** require an appropriately reviewed reply before recording consent, including after opt-out. Keep original reply text unchanged and test pending/confirmed, wrong party, stale after opt-out and suppressed contact cases.
4. **Replay authorization (P2):** recheck current actor, entitlement and event scope before returning a stored RSVP mutation response. Contain shared helper changes so other platform mutations retain their behavior; test suspended/revoked entitlement, removed event membership and valid replay.

Initially owned source paths after Ready: `server/rsvp/**`, `app/api/v1/rsvp/**` only if route contract must change, `server/idempotency/service.ts` only for an explicit narrow replay hook, and focused `tests/rsvp-*.test.mjs` plus any existing platform idempotency test that must assert non-regression. The new task may propose an exact scope amendment for a necessary shared repository/index/migration file before editing it. Frozen: public/homepage, Planner, Careers, Admin/Operations, RSVP browser UI, shared auth/session/tenancy, package/deployment/provider configuration, `docs/STATUS.md`, `docs/LANES.md`, and preserved `.claude/`, `output/`, `tmp/` in main.

## Checks and return

Run focused tests, every tracked `*.test.mjs`, lint, non-incremental TypeScript, Vercel build and diff check. Record inherited warnings and environmental failures honestly. Verify `provider_disabled`, tenant/event isolation, exact source/changed paths and clean final SHA. Return fixed-SHA report with changed files, commands/results, Mongo evidence or explicit absence, limitations, reviewer handoff and current port/process state. No self-certification, main merge/push, provider enablement or deployment.
