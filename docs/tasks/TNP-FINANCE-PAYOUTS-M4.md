# TNP-FINANCE-PAYOUTS-M4 — payout onboarding, batches, reconciliation and printable documents

Status: DRAFT — no writer, branch, worktree, port or lease. Launch requires integrated Admin shell, accepted commercial/finance contracts and reviewed provider-neutral payout interfaces.

Required UI author: verified `gpt-6-astra` / medium. Financial/state-contract implementation and review require `gpt-5.6-sol` / high or higher only when justified. Human owner and fixed-SHA acceptance reviewer: Kartik. Fresh Claude plus independent Sol financial-integrity review is mandatory.

## Result

Give Freelancers a safe masked payout-profile and statement experience, and give authorized Operations/Finance users separate review, maker, approval, release, provider-status and reconciliation views. Add print-ready invoice and receipt documents without claiming live Razorpay behavior.

## Proposed ownership

- new `components/tnp/portals/operations/finance/**`
- new `components/tnp/portals/operations/commercial/documents/**` for Admin document views
- exact Freelancer-local payout-profile/statement adoption only under a separate serialized lease
- feature-local synthetic adapters, fixtures, print styles and tests

## Required UI

- Masked bank/VPA destination, verification/change state and clear privacy copy; no Planner or ordinary co-admin access.
- Monthly payable detail with attendance/rate provenance, gross, adjustments, net and review history in integer paise.
- Distinct Operations review, Finance approval, batch creation and release capabilities.
- Batch/instruction/provider attempt timeline with pending, queued, processing, processed, failed, rejected, cancelled, reversed and reconciliation-required states.
- Lost-response and reversal cases never suggest retrying with a new money effect.
- Invoice and receipt are distinct immutable document versions; a paid receipt requires authoritative confirmed collection. Freelancer payout acknowledgment is a separate document.

## Print requirements

- Dedicated A4 white-paper view with logo/legal entity placeholder, number/version/status, parties, references, line items, approved tax fields, totals, safe payment reference and notes.
- `@media print` removes navigation/actions/shadows, expands clipped regions, repeats table headers, controls row/page breaks and keeps totals/signature blocks together.
- `SAMPLE — NOT VALID`, DRAFT, CANCELLED or VOID marks survive print/PDF.
- Verify one-page and multi-page documents, long names, many lines, partial payment, zero optional tax, large values, print backgrounds disabled and mobile print/download.

## Verification

- Authorization and state matrices; two organizations cannot cross-read destinations, statements, documents or exports.
- Payout preview tests cover one worker/month, frozen batches, same-key lost-response replay, out-of-order/duplicate webhook projections, reversal and destination change after freeze.
- Android/iOS responsive behavior and mobile Lighthouse performance above 80 on Finance overview/document preview, median of three production-build runs.
- Print/PDF visual comparison plus focused tests, lint, explicit TypeScript, Vercel build, diff and console/hydration checks.

One immutable fixed SHA, independent reviews and Kartik acceptance precede P-controlled integration. No beneficiary creation, payout, provider configuration, official invoice issue, main push or deployment.
