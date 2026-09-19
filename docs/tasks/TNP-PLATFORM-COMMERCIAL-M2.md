# TNP-PLATFORM-COMMERCIAL-M2 — orders, quotations, grants and Planner authority

Status: DRAFT — no writer, branch, worktree, port or lease. Do not implement before `TNP-PLATFORM-M1` receives Kartik's exact-SHA acceptance and architect-controlled integration/verification. `TNP-PLATFORM-HARDENING-M1` must also close before staging or any milestone relies on production-style database idempotency readiness. ADR-0006 remains Proposed and DEC-17 through DEC-20 must be resolved or explicitly bounded as non-production scenarios in the eventual Ready contract.

Responsible domain owner and sole human fixed-SHA acceptance reviewer: Kartik. Anjaneya supplies product/catalogue/commercial decisions. Proposed author: fresh verified `gpt-5.6-sol` / high. Mandatory review: fresh independent Sol/high for authorization/concurrency, separate external Claude, and Kartik exact-SHA acceptance; author self-review satisfies none of these gates.

## Result

Implement the first real shared application/domain slice joining Client requests, Admin quotation/grant authority and assigned TNP Planner resource proposals while preserving tenant isolation, immutable versions, idempotency, audit and the existing allocation boundary.

## Proposed ownership

- new `server/commercial/**`
- new thin routes under `app/api/v1/service-orders/**`, `app/api/v1/quotations/**`, `app/api/v1/fulfillment-grants/**`, `app/api/v1/resource-proposals/**` and the narrow Planner assignment query route
- new focused tests under `tests/**` named by the Ready record
- additive repository/index extensions required by this domain
- one commercial runbook/contract delta if required

No frontend component, shared preview fixture/service, global style, provider integration, collection/payout effect, RSVP message provider, document upload, production data or deployment is owned. Any allocation-service change requires a serialized prerequisite or separately reviewed handoff.

## Required implementation boundary

- Implement `docs/contracts/V1-COMMERCIAL-PLANNING-API.md` through framework-independent commands/queries and thin HTTP translation.
- Add resource-specific relationship authorization for customer owner, serving TNP organization and explicitly assigned Planner; do not add a global cross-tenant bypass.
- Snapshot versioned catalogue/order/quotation data; preserve immutable prior quotation/grant/history records.
- Validate transitions and expected revisions server-side.
- Use the integrated actor-bound idempotency/audit service so exact retries never duplicate effects and changed actor/action/payload/revision conflicts.
- Keep collection/payment, assignment, RSVP entitlement and ratings behind explicit ports/status references unless a separately reviewed dependency is integrated.
- Use integer paise and no unapproved tax/deposit formula.

## Stop conditions

- Platform M1 review/integration is incomplete or its contracts change incompatibly.
- Customer/service organization relationship cannot be derived authoritatively.
- The task needs a second database, microservice, queue, auth SDK or provider mutation.
- Product decisions would require inventing catalogue, pricing, tax, deposit, Planner approval, rating or partial-allocation policy.
- Existing allocation behavior must change without a reviewed ownership transfer.

## Verification

- Contract tests cover the ten matrices in `V1-COMMERCIAL-PLANNING-API.md` plus malformed input, missing configuration, repository failure and audit failure/rollback.
- Concurrency tests cover duplicate submit, simultaneous quotation issue, stale acceptance, grant revision versus proposal submission and allocation handoff replay.
- Authorization tests cover Customer A/B isolation, serving/non-serving TNP organizations, client-appointed planner, candidate/approved/assigned TNP Planner, Operations, Finance and Worker denial.
- Index/query rationale covers relationship lists, event/order detail, active quotation/grant lookup, Planner assignments, idempotency and audit.
- Run locked install if needed, focused/full platform tests, lint, explicit non-incremental TypeScript, Vercel build, diff check and safe local API probes with synthetic/absent provider configuration.

Return one immutable pushed feature SHA, exact changed paths/checks/probes/limitations and a clean stopped worktree. No main merge/push, provider connection, production data, quotation issuance, payment, allocation or deployment.
