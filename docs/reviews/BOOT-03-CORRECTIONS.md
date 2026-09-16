# Supplied review-03 findings and author correction disposition

User pasted Sonnet and Sol reports reviewing716766870b01caad9bf3484b2c52e63401850d9a. This is a labelled author summary, not a byte-exact exported report. Do not claim an original file hash verifies a conversation paste. Future reviewers should save their report outside the source worktree and return its file or attachment with full SHA/model/session evidence; P archives exact provided bytes with a manifest as done for supplied review-01 attachments.
Sonnet: reported claude-sonnet-5 on DESKTOP-VO8G3GR, new clean detached review; conditional PASS with M2 initial consumer dependency, L5 ADR model wording and L6 provenance recommendation. Sol: reported gpt-5.6-sol/high but same earlier DevD task01a0aa6d-9b9a-75c3-839a-c0ac7b5f18a5; CHANGES REQUESTED, fresh architecture gate NOT passed. Four findings: dependency names, contradictory canonical docs, reset semantics, checker coverage.
User relays Kartik approving requested changes and asking to start developers. Record human authorization to correct findings; do not infer independent gate approval or claim prerequisite implementation exists.

| Finding | Applied correction | Required verification |
|---|---|---|
| Sonnet M2 / Sol1 | First consumers now depend on TNP-FOUND-01; I01 names integrated foundation. S0/S1 explicitly non-dispatchable checklists | Policy checker plus reviewer ancestry/launch reasoning |
| Sonnet L5 / Sol2 | Replaced whole live STATUS/LANES/INTEGRATION/DELIVERY/review packet and updated ADR; one current candidate/model/milestone policy | Active-policy consistency regression tests; historical reports intentionally unchanged |
| Sol3 | Separate retained resetReceipts; explicit expectedGeneration, serialized commit-time checks, stale delayed-write prevention, exact replay/conflict outcomes and future behavioral tests | Reviewer checks specification now; foundation builder later implements/tests, no mock PASS |
| Sol4 | Generic task dependency parsing, foundation/existing dependency validation, non-dispatchable phases, policy markers and stale active instruction checks | Mutation regressions must fail on old dependency, missing milestone, wrong model/tag and bad phase dispatch |
| Sonnet L6 | Preserve honest source-summary distinction; require future saved report files/attachments | No retroactively fabricated raw report |

This is author correction, not independent approval. Review current immutable target in the review packet. No app/schema/framework/provider changes or launch are performed.
