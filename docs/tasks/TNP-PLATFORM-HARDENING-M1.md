# TNP-PLATFORM-HARDENING-M1 — required-index readiness and replay regression

Status: DRAFT — prerequisite Platform M1 is now accepted and locally integrated/verified at merge `8544a2a5a9fcff7eefc35bcde2430cf9e1ea3ba6`, but no writer, branch, worktree, port, Ready launch commit or lease exists. This hardening remains required before staging can be declared ready and before a commercial-domain writer relies on production-style database idempotency guarantees.

Source findings: `docs/reviews/TNP-PLATFORM-M1-CLAUDE-REVIEW.md`, all P3/non-blocking for local integration.

Responsible owner and sole human fixed-SHA acceptance reviewer: Kartik. Proposed author: fresh verified `gpt-5.6-sol` / high. Fresh independent security/concurrency review and external Claude review follow authorship.

## Bounded result

1. Document the narrow exact self-logout replay available after revocation, including its validation constraints and the fact it authorizes no other route or mutation.
2. Make readiness/startup truthfully fail or remain non-ready until every required unique/TTL/supporting index for the current platform schema is verified by name, key/options and intended query. Applying missing indexes remains an explicit migration/operator action unless a later accepted decision authorizes automatic mutation.
3. Reorder the runbook so configuration/database reachability, index application/verification and readiness checks cannot imply safe concurrency before the unique idempotency index exists.
4. Commit the cross-user concurrent idempotency-conflict regression that proves one effect, no cached-response disclosure, current-request rejection audit and rollback of the losing effect.

## Proposed ownership

- `app/api/ready/route.ts`
- `server/health/readiness.ts`
- `server/data/indexes.ts`
- `tests/platform-foundation.test.mjs`
- `docs/runbooks/PLATFORM-FOUNDATION.md`

No session/idempotency behavior redesign, UI, domain workflow, dependency, provider configuration, live Atlas mutation or deployment is owned. If a migration command or repository interface change is required, P must publish the exact expanded allowlist before launch.

## Verification

- required index absent/mismatched/present matrices using deterministic adapters;
- safe behavior when index inspection fails or database is unavailable;
- concurrent same-actor replay and cross-actor conflict/rejection/audit matrices;
- exact logout retry plus all prior negative replay tests;
- health remains liveness while readiness reflects configuration/database/index readiness;
- locked install if needed, platform/shared tests, lint, explicit TypeScript, Vercel build, diff check and safe local probes without contacting a provider.

One immutable fixed SHA, fresh independent review and Kartik acceptance precede integration. No provider mutation, production data, main push or deployment.
