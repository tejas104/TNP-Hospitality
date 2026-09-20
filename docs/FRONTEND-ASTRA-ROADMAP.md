# TNP Astra frontend roadmap

Status: governing model/sequence decision from 2026-09-18. This document reserves no writer by itself; every milestone still needs an exact Ready contract, source/launch SHA, worktree, owned paths, checks and reviewers.

Current completion target from the latest 2026-09-20 instruction: all F02-F20 screen sets must be independently frontend-ready (19/19). F01 remains excluded from redesign and percentage counting; its separately authorized hero-cube replacement has an independent review gate. This is a UI/frontend measure, not production capability.

## Model and review policy

- `gpt-6-astra` authors all new or materially revised homepage, public service, Client, Freelancer, RSVP and related UI/frontend surfaces.
- The actual runtime/model/effort must be verified before mutation. A requested Astra assignment is not evidence that Astra ran.
- Astra does not own authentication, database, provider, finance or shared domain semantics unless a separate contract explicitly assigns them.
- Fresh Claude provides the normal opposite-model fixed-SHA review for Astra-authored UI. Sensitive cross-module/API/security/data changes also receive the specialist review named by their contract.
- Kartik is the sole human fixed-SHA reviewer. Anjaneya remains the product/content/visual input owner.

## Delivery order

| Order | Milestone | Result | Dependency |
|---|---|---|---|
| 1 | TNP-B-M1 public non-3D frontend | Homepage interaction corrections, public-shell/workspace discovery, service/department pages and contact/vendor enquiry; keep the earlier constellation only as a temporary preview | Integrated D + Shared Fix; current preview branch |
| 2 | Shared UX foundation | Destination-accurate navigation, truthful demo profiles, obvious action hierarchy, compact density, body-font numerals, partner-card primitive and homepage-only custom cursor | Brand/Freelancer/Operations review gates integrated; aggregate palette check |
| 3 | Corrected Client + TNP Planner UI | Guided multi-product event builder; client-appointed planner boundary; TNP Planner application/approval/dashboard; quotation/grant truth | Integrated UX foundation; reviewed product/order/grant presentation contracts |
| 4 | Operations/Admin completion | Product-order queue, Admin-only quotation versions, grants/audit, catalogue/access, workforce coordination, finance/payout presentation, reports and maintenance pages under their reviewed contracts | Integrated UX foundation; reviewed authorization/commercial/workforce/finance contracts |
| 5 | Freelancer completion | Application/opportunities followed by attendance-day earnings, monthly payouts, ratings and standing as contracts become ready | Integrated UX foundation plus workforce/attendance/finance contracts |
| 6 | Message-only RSVP UI | Multi-event command centre and event workspaces for WhatsApp messaging, information collection, assisted categories and reports; no calling/booking/dispatch/payment | Integrated UX foundation; RSVP product/tenant/provider contracts and remaining client decisions |
| 7 | Public/access/login completion | Service/access/recovery/tracking states, attractive truthful login/chooser flows, approved content/assets and cross-portal consistency | Orders 2–6 integrated; client inputs available |
| 8 | Non-homepage 100% aggregate gate | F02-F20 audit, desktop/mobile/keyboard/touch/reduced-motion/200% zoom regression, action-state and typography consistency, truthful limitation inventory; all 19/19 frontend-ready | Orders 2–7 reviewed, accepted and integrated |

Only one Astra writer owns overlapping shared/public paths at a time. Service-page work inside the current B lease completes before Client/RSVP/Freelancer UI leases begin. Client and Freelancer paths may later run as distinct leases only when they do not share AppShell, contracts, routes or fixtures.

User scope clarification 2026-09-20: do not spend a frontend lease on the homepage or its 3D scene within this program. The active sequence ends at the non-homepage aggregate gate.

Separate exception 2026-09-20: the user authorizes `TNP-HOME-CUBE-M2` outside this non-homepage program. It owns only the existing hero's right-side scene and cannot change the approved teal hero, left content, typography, CTAs, navbar, page structure or any F02-F20 completion claim. Its isolated writer/review/integration gates remain independent of the 19/19 program metric.

Image/content implementation rule 2026-09-18: every non-3D Astra milestone includes purposeful replaceable image slots where imagery improves narrative, hierarchy or comprehension. Preview images remain local, typed, accessible and explicitly illustrative; client assets later replace the source metadata without redesigning the layout. Operational tables, forms and dense authenticated controls do not receive decorative photography without a product reason.

CLIENT/PLANNER PRODUCT MODEL CORRECTED 2026-09-19: the paused `TNP-CLIENT-ASTRA-M1` branch is historical and must not be reactivated or treated as current product scope. Its combined Client/Planner journey predated the distinction between a client-appointed representative and an experienced Admin-approved TNP Planner. `docs/tasks/TNP-CLIENT-PLANNER-CORRECTED-M2.md` is the clean successor after the shared UX foundation; it has no writer lease.

ALL REMAINING NON-HOMEPAGE FRONTEND REQUESTED AND RESEQUENCED 2026-09-20: serialize `TNP-UX-FOUNDATION-M1`, `TNP-CLIENT-PLANNER-CORRECTED-M2`, `TNP-OPERATIONS-COMMERCIAL-M3`, `TNP-FREELANCER-ASTRA-M2`, `TNP-RSVP-MESSAGE-ONLY-M2`, the public/access pass and the non-homepage aggregate gate. Homepage/3D work is outside this program. This sequence does not combine overlapping shared/portal files or move authorization, quotation, allocation, attendance, rating or finance rules into presentation code. Every Draft still needs reviewed dependencies, exact source/launch/lease and fixed-SHA review.

TYPOGRAPHY AND 100% NON-HOMEPAGE COMPLETION 2026-09-20: UX Foundation establishes the licensed sans-first product tokens and shared access/dashboard primitives. Later portal milestones sequentially migrate their feature-owned explicit serif/mono declarations and complete their real page states. Operations completion includes the contracted commercial, catalogue/access, workforce, finance/payout, reports and maintenance presentation slices rather than stopping at one dashboard. The aggregate gate remains open until every F02-F20 set has browser evidence and independent acceptance; partial sets, dead routes or decorative controls do not count.

BUTTON AFFORDANCE REQUIREMENT 2026-09-20: every sequential public/access/portal milestone must audit its owned buttons and button-like actions for clear resting affordance, readable light-colour hover feedback, visible keyboard focus and equivalent touch/pressed/disabled/loading states. Shared foundations may supply tokens/primitives, but portal-local migrations remain within each feature lease.

DOMAIN BENCHMARK ROUTING 2026-09-20: use current official product experiences only as implementation references. Hospitality inquiry/booking/task views take workflow cues from Tripleseat; event registration/check-in/reporting from Cvent and Eventbrite; guest RSVP/status/reminders from Paperless Post; workforce scheduling/attendance from When I Work; workforce/payroll dashboards from Deel; finance/status surfaces from Stripe; dense navigation and workflow hierarchy from Linear and Miro; product typography/action clarity from Wise and Wispr Flow. Every use must preserve TNP's palette, content, domain truth and accessibility rather than copy trade dress. Source links and exact principles are recorded in `docs/UX-COMPLETION-BRIEF.md`.

## Shared contract boundary

Web UI consumes `/api/v1` and typed domain/application behavior; it does not recreate authorization, tenant filtering, capacity, attendance, quote, payout or RSVP isolation rules in components. Missing API behavior returns to the platform/domain owner. Synthetic previews stay labelled until server-backed behavior is reviewed and integrated.

## Acceptance repeated for every Astra milestone

- Deliberate hierarchy and reuse of proven tokens/components; no indiscriminate card grids or decorative motion.
- Desktop and mobile, real keyboard order/activation, visible focus, WCAG AA text/non-text contrast and no horizontal overflow.
- Loading, empty, validation, error, retry, success, refresh and stale-state behavior where applicable.
- Reduced-motion and low-capability fallbacks; measured 3D/image budgets on public pages.
- Truthful provider/data state, no real personal data in fixtures and no synthetic success represented as production.
- Exact fixed SHA, changed-path allowlist, command results, browser evidence, limitations, fresh review and Kartik disposition before integration.
