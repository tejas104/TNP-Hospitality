# TNP-FREELANCER-ASTRA-M2 — attendance, earnings, payouts and standing frontend

Status: DRAFT — no writer lease. This follows TNP-FREELANCER-ASTRA-M1 and reviewed workforce/attendance/finance contracts.

## Result

Use verified `gpt-6-astra` / high for the responsive Freelancer post-assignment experience without moving attendance or money rules into the browser.

## Proposed ownership

- existing `app/freelancer/**` and `components/tnp/portals/freelancer/**` under a new exact lease
- local presentation helpers/styles/tests only

## Workflows

- Event pass/QR presentation, expiry and briefing status; never treat a decorative code as production attendance proof.
- Check-in/out history and distinct GPS recorded/missing/denied/outside-radius evidence.
- Attendance correction/history presentation that retains original evidence and reason.
- Explainable earnings by assignment using integer paise, rate snapshot and pending-verification/earned/adjusted/approval states.
- Monthly payout history: pending/approved/processing/failed/uncertain/paid/reversed as supported by the reviewed contract, with no provider-success invention.
- Ratings, comments, averages, strikes, under-review and human-decision account standing.
- Loading/empty/error/retry/stale/refresh/reset across all tabs.

## Gates

Requires reviewed/integrated attendance and finance contracts plus exact source/launch/lease/reviewer packet. Independent Sol review remains mandatory for money/attendance-sensitive behavior even though Astra owns presentation. Browser assertions must trace the same assignment through response, attendance, earning and payout views; server tests prove authorization/idempotency/invariants.
