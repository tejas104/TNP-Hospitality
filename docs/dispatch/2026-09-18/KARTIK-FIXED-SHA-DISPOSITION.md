# Kartik fixed-SHA disposition — current review window

Kartik is the sole human fixed-SHA reviewer. Review each immutable target separately; approval of one does not approve the other and does not authorize a remote-main push, deployment, provider mutation or production data operation.

## TNP-B-M1 Astra public/frontend

- Branch: `codex/tnp-b-m1`
- Launch: `e89c0f364abddb1fba1097ce5e43966af9f76146`
- Final: `712610e17a0858e54d258b4e843210a169b5357b`
- Required external review: `docs/dispatch/2026-09-18/B-ASTRA-FINAL-CLAUDE-REVIEW.md`
- Confirm the public design direction, new 3D guest-journey model, visible service/role content, image/gallery treatment, enquiry truthfulness, and the listed missing-client-content limitations.

Record one exact statement:

`KARTIK APPROVES TNP-B-M1 FINAL 712610e17a0858e54d258b4e843210a169b5357b FOR ARCHITECT-CONTROLLED LOCAL INTEGRATION ONLY.`

or

`KARTIK REQUESTS CHANGES TO TNP-B-M1 FINAL 712610e17a0858e54d258b4e843210a169b5357b: <file/behavior-specific findings>.`

## TNP-PLATFORM-M1

- Branch: `codex/tnp-platform-m1`
- Launch: `ce64172eff2e96bc0fdfeb4384d93ebd197712ce`
- Final: `bc6b5565af1750168b10701955d131c3ec2f2dc4`
- Required reviews: fresh focused independent Sol/high plus `docs/dispatch/2026-09-18/PLATFORM-FINAL-CLAUDE-REVIEW.md`
- Confirm accepted roles/tenant model, session policy, temporary-development Mongo/Vercel boundary, client-owned production cutover, disabled providers, migration/backup/restore/rollback expectations and remaining production gates.

Record one exact statement:

`KARTIK APPROVES TNP-PLATFORM-M1 FINAL bc6b5565af1750168b10701955d131c3ec2f2dc4 FOR ARCHITECT-CONTROLLED LOCAL INTEGRATION ONLY.`

or

`KARTIK REQUESTS CHANGES TO TNP-PLATFORM-M1 FINAL bc6b5565af1750168b10701955d131c3ec2f2dc4: <file/behavior-specific findings>.`
