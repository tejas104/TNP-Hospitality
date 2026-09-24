# Careers W1 Draft review - Claude Opus 5.5

Status: user-provided independent read-only Draft review, received 2026-09-24. Verdict: Revise Draft contract. This is not an application-code approval or Kartik acceptance.

Reviewer reported Claude Opus 5.5 (claude-opus-5-5) on DESKTOP-DL9FDM7 in clean detached D:/TNP-review/TNP-CAREERS-CONTRACT-8660dd7-claude. Target was local docs commit 8660dd74807dc646e7df67f15ec2266d6e9aaf42 versus main 831597573fe6898f8a19e5cf416d36a364c3544b. Reviewer read the seven-file diff and current auth, routes, Freelancer preview, Operations, index and audit sources. No build/test was run and no files were edited, merged or pushed.

## Blocking contract findings

1. No worker or Operations sign-in/session issuance or applicant promotion, so /workers/me would be unreachable or might be wired to a demo persona.
2. No capability grant model or owner for verifier and Finance; one membership role does not imply private access.
3. No exact role/endpoint/field/export matrix, risking Planner, admin or cross-tenant disclosure.
4. Payout destination change can redirect future money without step-up, independent notice, provider verification, cooling and freeze-time snapshot.
5. A masked-Aadhaar upload could store a full number if the worker uploads an unmasked card; method and purpose must be decided.
6. Storage, consent, retention, Aadhaar, provider and capability release conditions had no numbered decision/owner.

## Other findings

Split presentation from server adoption; record integrated backend and client-demo source prerequisites. Existing application drafts hold profile-like information in browser storage. Require resource revision plus idempotency, separate revision streams, quarantine/scanning/EXIF stripping, and sensitive-read audit extension. Audit role-key versus display-label mapping, theme scale/default, and exact meaning of revocation.

P's revision adds DEC-32 through DEC-39, a field matrix, access-foundation task, separated M5a/M5b and private-data milestones, payout/Aadhaar gates and M5 admin-console path correction. The revised Draft still needs focused reviewer re-check and Kartik product/security decisions before any Ready lease.
