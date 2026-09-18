# TNP Astra frontend roadmap

Status: governing model/sequence decision from 2026-09-18. This document reserves no writer by itself; every milestone still needs an exact Ready contract, source/launch SHA, worktree, owned paths, checks and reviewers.

## Model and review policy

- `gpt-6-astra` authors all new or materially revised homepage, public service, Client, Freelancer, RSVP and related UI/frontend surfaces.
- The actual runtime/model/effort must be verified before mutation. A requested Astra assignment is not evidence that Astra ran.
- Astra does not own authentication, database, provider, finance or shared domain semantics unless a separate contract explicitly assigns them.
- Fresh Claude provides the normal opposite-model fixed-SHA review for Astra-authored UI. Sensitive cross-module/API/security/data changes also receive the specialist review named by their contract.
- Kartik is the sole human fixed-SHA reviewer. Anjaneya remains the product/content/visual input owner.

## Delivery order

| Order | Milestone | Astra-owned result | Dependency |
|---|---|---|---|
| 1 | TNP-B-M1 public non-3D frontend | Homepage interaction corrections, public-shell/workspace discovery, service/department pages and contact/vendor enquiry; keep the earlier constellation only as a temporary preview | Integrated D + Shared Fix; current preview branch |
| 2 | Client UI follow-up | Material Client/Planner UI creation or redesign needed to consume the production platform contracts; preserve already integrated A behavior | Platform API/auth contracts fixed; separate Ready scope |
| 3 | RSVP UI | Managed-client and vendor workspaces, guest import/errors, function responses, follow-up, approved exports and truthful provider-disabled states | Tenant/auth/API and RSVP contract ready; retention/provider decisions |
| 4 | Freelancer UI | Application/assessment, opportunity/claim/Coming/briefing, then attendance/earnings/payout/ratings presentation as backend contracts become ready | Platform auth plus reviewed workforce/domain services |
| 5 | Remaining service UI | Maintenance, login/recovery/tracking/access, approved reporting presentation and final responsive polish | Corresponding server contracts and client inputs |
| 6 | Final homepage 3D | User-selected abstract gold/red Celebration Constellation on white/ivory, motion and all fallbacks; replace the temporary scene only after the rest of the frontend is complete | Orders 1–5 complete and integrated; client imagery/content sufficiently stable |

Only one Astra writer owns overlapping shared/public paths at a time. Service-page work inside the current B lease completes before Client/RSVP/Freelancer UI leases begin. Client and Freelancer paths may later run as distinct leases only when they do not share AppShell, contracts, routes or fixtures.

User sequencing decision 2026-09-18: the final 3D model is last. Do not spend another frontend lease on the homepage scene while any planned non-3D screen milestone remains incomplete.

Image/content implementation rule 2026-09-18: every non-3D Astra milestone includes purposeful replaceable image slots where imagery improves narrative, hierarchy or comprehension. Preview images remain local, typed, accessible and explicitly illustrative; client assets later replace the source metadata without redesigning the layout. Operational tables, forms and dense authenticated controls do not receive decorative photography without a product reason.

CLIENT/PLANNER FOLLOW-UP DRAFTED 2026-09-18: `docs/tasks/TNP-CLIENT-ASTRA-M1.md` now bounds the next Astra visual/frontend milestone around the already integrated synthetic Client and Planner workflows. It preserves booking, registration, requirement, quote/status, identity and refresh/reset behavior; uses replaceable illustrative image slots only where they aid discovery/context; and freezes shared services, route glue and platform semantics. It remains Draft until the current public correction is fixed/reviewed and an exact source/launch/lease/reviewer packet is issued.

## Shared contract boundary

Web UI consumes `/api/v1` and typed domain/application behavior; it does not recreate authorization, tenant filtering, capacity, attendance, quote, payout or RSVP isolation rules in components. Missing API behavior returns to the platform/domain owner. Synthetic previews stay labelled until server-backed behavior is reviewed and integrated.

## Acceptance repeated for every Astra milestone

- Deliberate hierarchy and reuse of proven tokens/components; no indiscriminate card grids or decorative motion.
- Desktop and mobile, real keyboard order/activation, visible focus, WCAG AA text/non-text contrast and no horizontal overflow.
- Loading, empty, validation, error, retry, success, refresh and stale-state behavior where applicable.
- Reduced-motion and low-capability fallbacks; measured 3D/image budgets on public pages.
- Truthful provider/data state, no real personal data in fixtures and no synthetic success represented as production.
- Exact fixed SHA, changed-path allowlist, command results, browser evidence, limitations, fresh review and Kartik disposition before integration.
