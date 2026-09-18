# TNP — 20-calendar-day deployment plan

Status: current execution plan from 2026-09-18. It supersedes the earlier 25-day cadence. Day 1 is 2026-09-18; Day 20 is 2026-10-07. The target is a controlled production deployment on Day 20, not an unconditional promise or standing deployment authorization.

## Delivery definition

The Day-20 release target is a responsive web v1 with the approved public experience, role-scoped portals, persistent server-backed core workflows, auditable Operations and finance behavior, basic RSVP/vendor access, observability, backups and a rehearsed rollback. Native mobile remains excluded.

The release must not present browser-local synthetic behavior as production authorization, persistence, payment, GPS, KYC or messaging. Full WhatsApp automation/media ingestion can go live only if business verification, sender/display-name setup, templates, webhook/media security, consent/opt-out and UAT are evidenced. If an external approval is absent, the feature stays disabled behind an explicit release decision; silently shipping a fake or unsafe substitute is prohibited.

## Starting position

- Foundation and A Client/Planner milestone are integrated on main. A is complete and its lease is closed.
- D Operations milestone is pushed and Sonnet-reviewed; independent Sol/high review, Anjaneya disposition and integration remain.
- B public/homepage and C freelancer milestones are Draft until Ready leases are published.
- Homepage candidate `b1dcac83d29a0c26d490f9ede6dad8bc65f0106d` has focused Sol evidence but still needs counterpart/human disposition before reuse or integration.
- Shared `PreviewControls` request-key reuse and public "Operations Demo" exposure need one serialized shared correction.
- The current preview service/domain logic is useful acceptance scaffolding; production auth, persistence, server authorization, deployment/rollback and provider evidence remain release work.

## Fast-path operating rules

1. At most two complex writers, one supervised by each human. A shared-file writer occupies a lane; Cursor tabs and AI subscriptions do not create extra human capacity.
2. One owner per worktree/path. Shared contracts, AppShell, PortalHero, PreviewControls, routes, fixtures and migrations are serialized.
3. Use three consolidated fixed-SHA review windows on Days 5, 9 and 13. Builders checkpoint internally and continue within a Ready milestone; reviewers do not edit reviewed code.
4. Findings return once as one prioritized packet to the original writer. Re-review covers the correction delta plus retained critical regressions.
5. Integrate only reviewed immutable SHAs with human disposition. No force-push, moving review target or blind merge from another lane.
6. One heavy build per host at a time. A transient Windows Nitro `EBUSY` gets one unchanged retry after confirming no task server owns the output.
7. No cosmetic scope after Day 10. No new dependency/provider/schema after Day 13 without release-owner exception and rollback analysis.
8. P owns serialized integration/status/release records. H1 owns public/client/content acceptance; H2 owns workforce/Operations/finance/platform evidence.
9. Effective 2026-09-18, Kartik provides the sole human fixed-SHA acceptance disposition across all lanes. Anjaneya continues to own product/content/visual inputs. Astra authors the homepage, Client, Freelancer, RSVP, public service pages and related frontend work under explicit Ready leases; independent AI and sensitive-domain gates remain.

## Calendar and exit evidence

| Day / date | Delivery work | Required exit evidence |
|---|---|---|
| **1 — Sep 18** | Close D Sol/human gate and integrate if PASS. Obtain counterpart/human disposition for the existing homepage candidate. Lock v1 scope and assign the shared correction. Confirm production project/account, domain/DNS control, database, authentication approach, sender mode/provider status, payment/collection mode, document-retention decision and secret owners. | D disposition or explicit blocker; exact homepage disposition; written provider/platform decision list; no unleased implementation. |
| **2 — Sep 19** | Implement and review the serialized shared correction: durable PreviewControls request identity plus removal/rewording of public Operations-demo exposure. Publish exact Ready contracts for the next two non-overlapping writers. Prepare staging, environment-variable names, CI checks and rollback skeleton. | Shared fixed SHA reviewed/integrated; clean main; B/platform Ready leases; staging and secrets checklist without values. |
| **3–4 — Sep 20–21** | **H1/B Astra:** homepage motion/3D refinement, public navigation, service/department pages and enquiry flow, using the approved homepage candidate only after disposition. **H2/platform:** server API boundary, persistent data model/migrations, sessions/authentication, role/tenant authorization, idempotency, audit and staging wiring around approved domain services. WhatsApp onboarding runs externally in parallel. | Checked checkpoints; owned-path isolation; desktop/mobile/keyboard/reduced-motion/non-WebGL evidence; API/auth/data tests; migration up/down or forward/rollback evidence; no real secrets in Git. |
| **5 — Sep 22** | Review Window 1: fixed-SHA Sonnet/Sol reviews by authorship/risk, consolidated corrections, human dispositions and architect integration of B/platform only when PASS. | Remote-equal SHAs; review reports; full lint/type/contract/build/diff checks; staging smoke; blockers reforecasted the same day. |
| **6–8 — Sep 23–25** | **Astra frontend, serialized by ownership:** RSVP/vendor/customer UI plus Freelancer application/assessment/opportunity/Coming UI in separate Ready leases; Client UI follow-up where production contracts require it. **H2 platform/domain:** persistent RSVP/workforce services, authorization, isolation, capacity, attendance and finance contracts. Provider-disabled states stay truthful. | Two-vendor isolation probes; import replay/row-error tests; capacity/eligibility/overlap tests; attendance evidence; payout/earning derivation; responsive/keyboard flows. |
| **9 — Sep 26** | Review Window 2: independent fixed-SHA review, focused correction, human disposition and integration for RSVP/C. Start integrated staging walkthrough. | PASS or explicit release blocker; no self-certification; integrated build and cross-role record IDs. |
| **10–12 — Sep 27–29** | **H1:** F18 maintenance and F19 login/recovery/tracking/access UI, final approved copy/assets and homepage performance refinement. **H2/D-03/F20:** quotation generation and revisions, invoice/collection state, attendance-derived earnings, two-stage payout approval, expenses, reports, audit and fixed-role administration. Complete monitoring, rate limits, backup jobs and operator runbooks. | Server-enforced authorization; integer-money/idempotency tests; distinct approval actors; stale-version/retry behavior; expense/audit traceability; recovery/session-revocation tests; logs/alerts and backup evidence. |
| **13 — Sep 30** | Review Window 3 and final feature integration. Run I01 end-to-end: enquiry; client booking/quote/collection; planner requirement; Operations allocation/review/replacement; worker claim/Coming/attendance/earning/payout; RSVP vendor/customer isolation. Resolve only release-blocking findings. | Integrated fixed SHA; exact evidence for every claimed F01–F20 set; full contract/integration/browser suite; no known P0/P1; P2s owned and scheduled. |
| **14 — Oct 1** | **Code, schema, dependency and content freeze.** Produce release candidate RC1. Only approved release-blocking corrections after this point. | Tagged/immutable RC1; migration manifest; environment matrix; feature-flag list; release notes; rollback target. |
| **15 — Oct 2** | Functional regression, browser/device/keyboard/accessibility and content QA across public and all roles. | Desktop/mobile matrices, focus/overflow/console evidence, valid/invalid/empty/loading/error/retry/reset/reload coverage. |
| **16 — Oct 3** | Security, tenancy, concurrency, finance, performance and resilience day. | Direct-ID tenant isolation; authorization probes; allocation/attendance races; webhook/idempotency replay; money invariants; rate-limit/upload checks; measured performance; no unresolved critical audit issue. |
| **17 — Oct 4** | H1/H2/client UAT on staging. Defect fixes only, followed by focused regression. | Signed UAT disposition, fixed-SHA correction evidence, updated known-limitations list. |
| **18 — Oct 5** | Production rehearsal: clean build/deploy to staging, migration, backup/restore sample, smoke, rollback and incident drill. | Timed runbook; successful restore/rollback evidence; monitoring/alert receipt; on-call contacts. |
| **19 — Oct 6** | Formal production-readiness review and go/no-go. Lock release SHA and deployment window. | All readiness categories PASS, or explicitly approved feature-disabled limitation; client/H1/H2 release signoff; explicit deployment authorization. |
| **20 — Oct 7** | Production deployment, migrations, smoke tests, live monitoring and handover. No new features. | Production URL and release SHA; health/auth/core-flow smoke; migration result; logs/alerts; rollback window; handover and known limitations. |

## Production-readiness gates

| Category | Day-20 requirement | Owner |
|---|---|---|
| Functional | Required v1 flows pass end-to-end against server persistence; synthetic-only states are labelled or disabled. | H1/H2 |
| Security | Server-side authentication, authorization, tenant isolation, session revocation, rate limits, safe uploads and secret separation. | H2 + independent review |
| Data | Reviewed schema/migrations, idempotency, concurrency controls, backup and demonstrated restore. | H2 |
| Finance | Integer minor units, versioned quote/revision, distinct approvals, idempotent earnings/payout/expense transitions and audit. | H2 + Sol review |
| Providers | Actual environment evidence for any enabled WhatsApp/payment/email integration; consent/template/failure/reconciliation behavior. | H2 + product owner |
| Performance | Measured production-like public and portal behavior, image/3D budgets, reduced-motion and non-WebGL fallback. | H1 |
| Accessibility | Keyboard operation, visible focus, labels/errors, responsive overflow and reduced motion verified. | H1 |
| Operations | Structured logs, health checks, actionable alerts, support/runbook and incident owner. | P/H2 |
| Release | Reproducible build, environment inventory, feature flags, backward-compatible release path and tested rollback. | P |
| Approval | Fixed release SHA, Kartik human acceptance, required Anjaneya/client content decisions, client UAT and explicit deploy authorization. | Kartik + client decision owners |

Any FAIL in security, tenant isolation, data restore, financial integrity, required provider behavior or rollback makes Day 20 a NO-GO. The correct response is to disable an explicitly optional feature with approval or move the release date—not to relabel a preview as production.

## Daily control rhythm

- Start of day: P publishes exact priorities, leases, owned paths and blockers.
- Midday: builders send checkpoint SHA and failing evidence early; no hidden blocker until handoff.
- End of day: checks, non-force push, remote equality, concise evidence and lease state.
- Review days: no new complex work for a human whose milestone is awaiting disposition.
- Every day: update remaining-days forecast, critical path, provider status and launch risk.

No deployment is authorized merely by this plan. Day-20 deployment requires the Day-19 go/no-go record and an explicit user/client authorization for the exact release SHA and environment.
