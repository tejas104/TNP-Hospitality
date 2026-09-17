# D — fixed-SHA correction delta/regression review packet

Status: REVIEW PREPARED. No reviewer is claimed running or complete by this packet.

## Immutable target

- Author/writer: Dev D `01a0aded-481f-7121-a788-b8c307f8ab59`, Kartik, DESKTOP-VO8G3GR, assigned gpt-5.6-sol/high.
- Branch: `codex/tnp-d-m1`.
- Original launch: `58c324953e0f2da775a77efb172059bb84534ae7`.
- Reviewed-before-correction baseline: `9785bd5631a99e5372dbca928f62eda52c004384`.
- Correction checkpoint 1: `f11088b1c9d9a6450b8cbf96ffec8c24de2eae91`.
- Final correction target: `d9baeb3b5947a42e2c46b1a80b85156a531ac221`.

P live-verified the remote target, both required ancestry relationships, the owned-path boundary and `git diff --check`. Review the immutable target directly. Do not edit the author worktree, review a moving branch, merge main, deploy, or treat this packet as acceptance.

## Ownership and correction scope

The baseline-to-target diff contains exactly these six Operations-owned paths:

- `components/tnp/portals/operations/AdminOperations.module.css`
- `components/tnp/portals/operations/AdminOperations.tsx`
- `components/tnp/portals/operations/OperationsDecisionPanels.tsx`
- `components/tnp/portals/operations/operationsFlow.test.mjs`
- `components/tnp/portals/operations/operationsState.test.mjs`
- `components/tnp/portals/operations/operationsState.ts`

No shared contract/service/fixture, other portal, register, package, finance/D-03, main or deployment path changed.

## Builder-attributed evidence

The writer reports a clean remote-equal worktree and stopped server/port. Reported checks: lint PASS with three inherited warnings outside Operations; TypeScript PASS; shared contract tests 13/13; focused Operations tests 8/8; Vercel build PASS with inherited advisories; diff whitespace PASS. Reported browser coverage at exact 1440x900 and 390x844 includes reset generation1->2, ready/loading/empty/error/retry, pending review completion, replacement/roster/audit identity, no wrong-action retry after ineligible attendance, attendance record/correction evidence, keyboard focus and no overflow/console output. Reviewers must reproduce the material cases they rely on.

The builder also observed the known frozen `PreviewControls` request-key collision before Reset; `TNP-SHARED-FIX-01` owns that separate defect. Reset clearing it does not close the shared issue.

## Required finding-by-finding review

Read `docs/reviews/TNP-D-M1-sol-review.md` in full and inspect both correction commits. Return one explicit disposition for each original finding:

1. Every submitted assignment/application/event identity exists in its visible current option set; initial attendance has a truthful prerequisite state and post-assignment/replacement selections reconcile.
2. Feedback and retry are bound to the exact action/request/record; attendance failures cannot invoke retained replacement work; deterministic failures do not show inert retry.
3. Filtered event list, detail, positions and roster stay synchronized; a no-match result exposes no hidden event detail/actions; delayed responses cannot overwrite newer selection.
4. Ordinary verification decisions include only valid pending applications with resolvable worker/role evidence; reviewed/invalid entries remain read-only and empty pending state disables action.

Regression review must also cover reset/stale generation, full/ineligible/overlap replacement preservation, successful replacement roster/audit refresh, attendance pass/record/correction evidence, approved-ledger correction rejection, nonresponse, two-record identity, loading/empty/error/ready, 1440x900 and 390x844, keyboard focus, overflow and console output.

Run the smallest sufficient fixed-SHA commands available: focused Operations tests, shared contract tests, TypeScript, lint, build and `git diff --check`. State any environment limitation rather than inheriting the builder result.

## Required gates and handoff

- Fresh independent Sol/high fixed-SHA delta/regression review.
- Separate fresh Sonnet fixed-SHA delta/regression review.
- Human reviewer Anjaneya, with Kartik domain input.

Each review is read-only. Return exact reviewer identity/model/effort/host, target SHA, commands/results, browser evidence, limitations, and PASS or prioritized findings with file/line evidence. Do not edit, commit, push, merge or deploy. If findings remain, P consolidates them and reopens the original D writer under a bounded OLD SESSION correction lease. If all gates pass, P prepares human disposition/integration separately.
