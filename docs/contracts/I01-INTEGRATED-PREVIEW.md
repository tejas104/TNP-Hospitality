# TNP-I01 — post-consumer browser acceptance gate

Status: Planned acceptance gate, not a dispatched implementation task or writer lease.
Timing: Day 3 before any F01–F16 readiness claim or client walkthrough. If prerequisites miss the slot, report the shortfall; do not skip this gate.
Dependencies: integrated S0, S1, A-02, B-01, C-03 and D-03 (with their transitive tasks and reviews).
Accountable human: Anjaneya; Kartik participates in workforce/Operations/finance acceptance. P records the exact integrated SHA and actual browser reviewer appointment before execution. Verification is read-only except synthetic preview interactions; no source fixes under this gate.
At 1440x900 and 390x844, verify one-browser planner requirement -> Operations event -> worker claim -> roster -> attendance -> earnings/quote views, including refresh/reset, shared IDs, duplicate action, full replacement rejection, missing/outside GPS and uncertain payout. Include public enquiry and client collection states. Verify keyboard/focus, errors and no real provider or geolocation claims. Use only synthetic inputs in one dedicated profile.
Run npm run lint; npx --no-install tsc --noEmit; npm run build:vercel; node --experimental-strip-types --test tests/preview-contract.test.mjs on that integrated checkout. Record origin, SHA, executed checks and visual evidence; no invented pass.
Report each screen set ready/partial/missing. Failures return to the owning lane as a separately bounded fix and get relevant re-review. No UI defects are silently charged to completed S1. Integration acceptance does not approve production security, concurrent server allocation or providers.
