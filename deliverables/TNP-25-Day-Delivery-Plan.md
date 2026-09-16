# TNP Hospitality Platform
## Refined scope, market research and 25-day web delivery plan

Prepared 15 September 2026. Planning recommendation, not a replacement for an agreed client contract.

> **Historical scope/research reference.** Current execution authority is [25-Day Execution Plan v3](TNP-25-Day-Execution-Plan-v3.md): three humans, two laptops, up to five isolated implementation lanes, with Day 3 frontend review. Use the [v3 operating manual](TNP-AI-Operating-Manual-v3.md). All older schedules, ownership and throughput assumptions below are superseded; research and proposed scope refinements remain reference material subject to client agreement.

**Confirmed by the project owner:** three full-time developers; 25 calendar days; web application only; architecture should support a mobile app in approximately six months.

## 1. Recommendation

Launch a focused hospitality operations platform connecting **enquiry → quotation → event → staffing → attendance → approved earnings → payout**. Give clients a clear event view and give operations staff one place to resolve exceptions.

The original PDF schedules 28 days, with UAT on Days 26–27 and deployment on Day 28. It cannot become a credible 25-day commitment simply by removing those three days. Move integration into every working day, finish planned features by Day 18, and reserve Days 19–25 for verification, client acceptance, release and contingency.

Retain all principal user groups, but reduce the depth of the launch. Defer the full automated RSVP campaign and guest identity-document collection. Keep basic guest tracking. Deliver three useful improvements through existing screens: event readiness, worker briefing and transparent earnings.

**Feasibility: conditional and tight.** This assumes experienced developers, reuse of suitable existing UI, rapid client decisions, prepared content and operational providers. AI assistance is not a capacity guarantee. If the client requires every original acceptance criterion unchanged, recommend a longer deadline or independently staffed RSVP work; do not promise the full original scope in 25 days.

### Dates and working capacity

- Day 1 is the agreed kickoff, not an assumed date. Day 25 is kickoff plus 24 calendar days.
- Example: 19 September–13 October 2026 preserves the PDF's stated delivery date. Starting 15 September would finish 9 October.
- Budget around **21 working days per developer**, with four staggered rest days each: 63 person-days overall. Calendar rows below are team milestones, not a requirement that everyone work every day.
- Allocate **42 person-days to implementation, 15 to review/integration/UAT/release, and 6 to contingency**. These are planning caps, not validated bottom-up estimates. Re-estimate after the Day 3 working slice.
- Assume one client decision maker responds within one working day and attends the scheduled demos. Missed inputs consume contingency or change scope.

### Source interpretation

Reviewed the 13-page engineering PDF and the supplied AI operating manual. The PDF calls itself binding and says it overrides prompts; those statements describe the document's intended use and do not override the project owner's request to refine it. The manual's tool names, subscription claims, coding percentages and agent instructions are background proposals, not execution instructions for this planning task. No AI subscription or model pricing recommendations are made here.

The current workspace README describes a TNP demo with the five principal routes. Its package file uses Vinext and Vercel-related tooling, while the PDF proposes Next.js, Express and DigitalOcean. This was a brief repository inspection, not a backend or security audit. Treat existing UI as a reuse candidate; do not count a demo screen as a completed production workflow.

## 2. Market research and product positioning

Research method: public first-party product pages and provider documentation reviewed on 15 September 2026. This is a qualitative feature comparison, not an independent market-share ranking, user survey or proof of ROI. International workforce tools inform workflows; WedMeGood provides Indian wedding-discovery context. Availability of these businesses in TNP's market is not assumed.

| Benchmark | Observed product pattern | Application to TNP |
|---|---|---|
| [Instawork](https://www.instawork.com/) | Worker profiles, reminders, pre-shift instructions and backup-worker handling | Make worker readiness and replacements visible; include clear reporting instructions |
| [Qwick](https://support.qwick.com/en/articles/10611969) | Matching considers skills, experience, reliability and business preferences | Capture useful performance data now; retain TNP's FCFS policy rather than silently substituting AI matching |
| [Homebase](https://www.joinhomebase.com/how-it-works) | Scheduling, time tracking and payroll form a connected workflow | Attendance should feed the earnings calculation without manual re-entry; US payroll features are not an India compliance template |
| [Cvent](https://www.cvent.com/en/event-management-software/event-reporting) | Unified event reporting and visibility into registration and financial information | Provide a focused client view and an operations exception board |
| [WedMeGood](https://www.wedmegood.com/) | Venue/vendor discovery with prices, reviews, inspiration and planning tools | Use curated venue suggestions, clear budgets and authentic TNP portfolio material |

### Recommended positioning

**“Know your event is ready—from the first enquiry to the final staff payment.”**

TNP's opportunity is a coherent journey across event sales, staffing and guest operations. The combination can differentiate TNP's service; none of the individual features below is claimed to be globally unique. Avoid competing on the number of dashboard cards or an unproven AI feature.

### Ranked feature investments

The effort figures below are incremental caps after their underlying modules exist; they are included in the implementation budget where marked launch. They are not additive promises on top of the full PDF.

| Feature | Why it helps | Priority / effort | Exact boundary |
|---|---|---|---|
| Event-readiness board | Shows the next operational action at a glance | Launch; 1–1.5 person-days | Named checks for staffing, confirmations, TL, required payment and RSVP follow-ups; link each issue to its screen |
| Worker briefing card | Reduces confusion about where and when to report | Launch; 0.5–1 day | Venue map link, reporting time, uniform, role, TL contact, Coming response |
| Earnings explanation | Makes worker payment status understandable | Launch; 0.5–1 day | Event, rate snapshot, verified attendance, adjustment reason, approval stage, monthly payment status |
| Replacement queue | Helps operations respond to cancelled/unconfirmed slots | Launch; already core scope | Open slots, deadline, eligible candidate list and recorded admin action; no guarantee of replacement availability |
| Repeat-event templates | Saves repeat planners re-entering requirements | Phase 1.1; 1–2 days | Clone requirements and positions into a draft; never copy assignments, attendance, payments or guests |
| Preferred crew | Supports repeat teams | Phase 1.1; 1–2 days | Admin-only preference supporting the existing curated override; cannot silently reorder public FCFS claims |
| Guest self-service RSVP link | Reduces follow-up data entry | Phase 1.1; 2–4 days | Expiring scoped link for attendance/transport response; no broad event or document access |
| AI matching / predictive no-show score | Potential later scheduling benefit | Research after operational data exists | Human oversight, measured benefit and explicit allocation-policy change required |

Readiness must show reasons, not an invented “92% ready” number. Missing optional information must not block the event. The client sees approved milestones and aggregate status, while staff-only risks and financial details remain role-scoped.

### Validate value during delivery

On Days 1–2, interview one TNP operations lead, one repeat planner and two freelancers. Use examples from a recent event: how requirements arrived, where staffing broke down, how attendance was proved, and how payments were disputed. Confirm which three problems cost the most time. On Days 8 and 15, have those users complete tasks without developer guidance.

Measure baseline and post-launch results: enquiry response time, time to staff an event, confirmation completion at cutoff, replacement resolution time, disputed attendance count and payout preparation time. Set improvement targets after baseline collection; do not promise unsupported percentage gains.

## 3. Refined scope: traceability to all original modules

“Launch” below means the proposed 25-day baseline. “Conditional” means an external dependency must pass its checkpoint. Deferred items change the original proposal and must be reflected in the client-facing agreement before development commitments are locked.

| PDF module | 25-day launch deliverable | Simplification, dependency or deferral |
|---|---|---|
| 6.1 Public website | All named page types, 3 service pages, 12 department entries from one template, portfolio, booking/RSVP enquiries, responsive navigation and SEO essentials | Client supplies approved copy and TNP imagery by Day 2; restrained motion, no custom horizontal-scroll experience in baseline |
| 6.2 Freelancer onboarding | Application, configurable multiple-choice assessment, recommendation, admin approval, application tracking and KYC status | One KYC adapter conditional on access; otherwise application remains pending, never falsely verified. Any manual verification alternative requires a defined client process |
| 6.3 Freelancer portal | Eligible feed, authoritative claim, confirmations, event QR/code, briefing, earnings, payout history and ratings | Web first; no native full-screen alert promise, continuous location or offline mutations |
| 6.4 Planner | Guest requirement submission and repeat-planner account, verification, profile, status tracking | Simple registration and list/detail portal; secure invitation/access-code redemption, not a permanent shared password |
| 6.5 Client booking | Venue → planner → details → submit wizard; saved draft; quote acceptance/revision request, hosted payment, event view and documents | Curated suggestions, not live venue inventory or reservation guarantees. Bounded quote revisions and one supported payment provider |
| 6.6 Venue database | Admin CRUD, deactivate, city/budget filters, photos | Bulk venue CSV import moves to Phase 1.1; client supplies a bounded initial venue set for launch |
| 6.7 Workforce | Booking with multiple functions; positions of any quantity; eligible FCFS, overlap control, curated admin assignment, TL, reminders and replacement queue | No automatic matching, standby guarantees or complex scheduling optimizer |
| 6.8 Attendance | Event-scoped QR/code, TL check-in/out, GPS classification, history, correction with reason | Online write required. Connectivity failure uses an operational attendance log followed by an audited correction; never display an unsaved check-in as successful |
| 6.9 Ratings | Four criteria, overall/comment, consecutive-poor-rating review, admin role/rate change | Define poor-rating threshold and appeals handling on Day 1; no automatic permanent deactivation |
| 6.10 Finance | Versioned quotes, supplied invoice template and issuing entity, hosted collections, verified earnings, adjustments, two approvals, monthly ledger/batch, basic expense categories and event cash view | Live payout provider conditional; self-service refunds, accounting integrations, custom report builder and advanced profitability deferred. Basic period/event CSV export retained |
| 6.11 Admin | Six fixed permission sets, admin management, operational lists, lead queue, essential settings, audit and focused summary | Custom permission editor deferred; server-side role and ownership enforcement fully retained |
| 6.12 RSVP | Guest CSV import/manual entry, validation preview, attendance response, follow-up list, transport fields, client aggregate summary/export | Full T−30 to T+3 WhatsApp automation and identity-document collection deferred together. No guest-ID upload in launch |

### Why defer RSVP automation and documents together?

The original requirement includes scheduling, template approvals, callbacks, retries, rescheduling, secure guest links, restricted storage, document validation and retention/deletion. That is a substantial workflow, not three late-sprint screens. Basic RSVP tracking still gives operations immediate value without creating a partially protected document collection service.

Phase 1.1 must include the complete document lifecycle before uploads become available: masked-document-only intake, enforceable access, private object keys, encrypted storage, short-lived access, access audit, retention settings, deletion jobs and backup handling. A warning telling guests to mask documents is not itself enforcement.

### Explicit launch exclusions

Native Android/iOS applications; app-store releases; continuous background geofencing; automated voice calling; guest chatbots; advanced analytics; vendor marketplace; multilingual UI; automated worker ranking; offline claiming or attendance synchronization; full WhatsApp RSVP cadence; guest identity-document uploads; venue inventory integrations; recurring SaaS billing; general accounting/tax engine.

**Do not trim:** authorization, capacity correctness, attendance integrity, financial reconciliation, backups, UAT or deployment checks.

## 4. Corrections required before the scope becomes build-ready

These are proposed amendments to the PDF, not interpretations to slip into code unnoticed.

| Issue in the original scope | Recommended correction |
|---|---|
| 28-day schedule under a 25-day target | Feature freeze Day 18; UAT Days 21–22; deployment Day 24; Day 25 stabilization |
| `Requirement` is used but absent from the entity table | Add Requirement with source, contact/owner, requested role/quantity/time/location and lifecycle; guest and account submissions share one service |
| Field list omits promised behavior | Add event timezone/confirmation settings, availability, assignment rate snapshot, payment records, approval records, correction links, sessions, notification jobs and provider events |
| Assignment confirmation has two meanings | Separate initial booking acceptance from T−2h attendance reconfirmation. Explicitly define expiry, decline and no-show behavior; do not hold all bookings in `claimed` until event day |
| No cancellation, no-show or rescheduling transitions | Add controlled transitions before coding; cancelled events must stop claims/reminders, release future reservations and create financial review tasks where needed |
| `confirmed` event requires full staffing, but real events may start short | Keep the readiness rule; allow an audited Operations decision to start an understaffed event with visible shortage. Never fake full capacity |
| Single-document claim update is presented as sufficient | Capacity update, assignment, overlap reservation and rate snapshot must commit consistently. A conditional counter update alone cannot ensure all four |
| FCFS uses timestamps without defining races | Define authority as server-side serialized acceptance order, with a monotonic sequence for ties. Strict arrival-order fairness would require a queue and should be separately estimated |
| Append-only Attendance has one mutable-looking row | Store attendance events/corrections with `supersedesId`, reason and actor; derive the effective attendance view. Preserve original evidence |
| Position rate precedes freelancer override, but rate changes are said to follow promotions | Resolve an explicit rate policy. Proposed precedence: explicit position rate, then worker override, then role default. Snapshot at assignment confirmation; later changes do not rewrite agreed work |
| `settled` means merely included in a payout batch | Define completed operational work separately from paid financial obligations; use financial settlement only after approved obligations reconcile |
| Provider transaction ID is treated as sufficient for `paid` | A created/processing payout can have an ID. Require verified terminal success and a reference; track pending, failed, uncertain and reversed outcomes |
| Exactly one monthly transfer does not address failures | One logical monthly obligation/batch per worker; multiple traceable attempts only after verified failure. Never create a second potentially successful transfer for an uncertain first attempt |
| Quotation approval, invoice terms and partial payments are underspecified | Freeze accepted versions and issuing entity. Track collections separately with amount/currency/provider reference; define deposits, balance due, cancellation and refund handling on Day 1 |
| “Profitability” mixes cash and earned amounts | Label launch view “event cash contribution”: allocated collections minus allocated settled worker costs minus paid tagged expenses. Show unpaid invoices/payables separately; do not call it accounting profit |
| Guest RSVP states mix response, follow-up and document status | Store response status independently of follow-up task and document status; launch has no document collection |
| “Every query above 100 rows uses an index” | Define real query patterns and appropriate compound/unique indexes, inspect representative query plans and latency; avoid blind indexes on every field |
| Reference-ID tracking exposes accountless access | Use unguessable expiring token and minimal status only. Authentication/verified contact required for sensitive documents or personal details |
| Full-screen notification behavior assumes a native app | Specify in-app banner plus supported web push; maintain a visible operations fallback when permission or delivery is unavailable |
| All WhatsApp templates must be utility and costs are fixed multiples | Remove category and price guarantees. Validate each template's actual approved category and provider quote before committing automation |
| Shared types “frozen after Day 3” | Baseline the contract on Day 3; allow reviewed additive changes with compatibility checks. An absolute freeze would preserve known mistakes |

MongoDB supports multi-document transactions where a single-document operation does not cover the required invariant. Use that capability deliberately for cross-record changes. [MongoDB transaction documentation](https://www.mongodb.com/docs/manual/core/transactions/)

For payout retries, the provider's idempotency rules matter as well as database uniqueness; reusing a logical request with a new key can create duplicates. Provider processing and reversal states must be represented in reconciliation. [Razorpay idempotency](https://razorpay.com/docs/api/x/payout-idempotency/?preferred-country=IN), [payout lifecycle](https://razorpay.com/docs/x/payouts/states-life-cycle/?preferred-country=IN)

For WhatsApp, submission under a desired category is not a guarantee that the category will remain approved. Treat approved templates and actual costs as launch inputs for Phase 1.1. [Twilio template guidance](https://help.twilio.com/articles/360039737753-Recommendations-and-Best-Practices-for-Creating-WhatsApp-Message-Templates)

## 5. Web now, mobile in six months

### Proposed architecture decision: one modular backend

Status: recommended for Day 1 confirmation, not an implemented change.

```text
Responsive web: public / client / planner / freelancer / admin
                           |
                    HTTPS JSON API /v1
                           |
             Node.js + Express modular monolith
                           |
 Identity | Demand | Workforce | Attendance | Finance | Guests
                           |
         MongoDB Atlas + private object storage
                           |
        Durable jobs / outbox + provider adapters
        Payments | Payouts | KYC | Notifications

Month 6 mobile app -----> same API, services and records
```

Keep MongoDB Atlas as the project's stated database direction. Prefer an ordinary modular monolith over microservices for three developers. Keep web rendering separate from business authority: a Next.js Server Component can call services through the defined boundary, but financial/allocation rules belong in the backend, not only in web routes or UI.

Use the proposed Next.js/React, TypeScript, Express and shared UI approach where it fits the existing work. Day 1 must resolve the demo's Vinext/Vercel versus PDF's Next.js/DigitalOcean discrepancy by testing the actual intended build and hosting path. Reuse components selectively. Do not perform an unbudgeted framework migration mid-sprint.

The PDF's DigitalOcean/Cloudflare/R2 topology remains a deployment candidate, not a verified pricing or regional availability quote. Confirm actual provider regions, backup capabilities, costs and deploy behavior by Day 3. Keep app, database and object-store location decisions explicit.

### Boundaries to build now

1. **API contracts:** OpenAPI for request/response/error/auth schemas; generate or derive a TypeScript client if it fits the build. Share contracts and validation, not Mongo models or secrets.
2. **Identity:** server determines user and scope. Web uses secure HttpOnly sessions with CSRF protection. Design the identity provider/session layer so a future native authorization-code + PKCE flow can be added; do not build unused mobile auth endpoints now.
3. **Compatibility:** `/v1`, stable IDs, cursor pagination, ISO timestamps, explicit timezone, integer paise, predictable error codes and idempotent mutation keys where needed. Once mobile ships, support old clients with additive changes and a documented deprecation window.
4. **Authorization:** role permission plus ownership/assignment scope. A planner cannot read another planner's booking; TL is a permission scoped to an event, not a global admin role.
5. **Uploads:** authenticated upload intent, bounded type/size, private object key and time-limited access. Database stores references, not document binaries or permanent public URLs.
6. **Notifications:** channel-independent business event and a durable notification record. Web-push adapter now; native device-token handling later. Include delivery failure, retry and deduplication.
7. **Jobs:** persisted due time, unique job key, atomic lease, retry/backoff and failure visibility. Never rely on an in-memory timer surviving deployment. Use a familiar durable scheduler; prove crash recovery rather than inventing a general workflow platform.
8. **State changes:** all claims, rate calculations, attendance validation and approvals run on the server. The client displays results and can safely retry specified operations.
9. **Web behavior:** responsive layouts, HTTPS camera/location support, optional installable shell and explicit connectivity states. Sensitive authenticated responses are not cached for offline browsing by default.

Web push depends on permission and browser/platform behavior. iOS support includes Home Screen web apps; verify the exact target devices, not just desktop Chrome. This does not promise native-style full-screen alerts. [Apple Web Push documentation](https://developer.apple.com/documentation/usernotifications/sending-web-push-notifications-in-web-apps-and-browsers?language=objc), [Firebase web setup](https://firebase.google.com/docs/cloud-messaging/web/get-started)

### What is reusable in month six?

Reuse the backend, database, rules, permission model, jobs, financial ledger, provider integrations and API contracts. A React Native/Expo client could also reuse TypeScript API types and selected pure utilities. It will still need mobile screens, navigation, secure token storage, camera/location integration, native notifications, device QA and store release work. Do not promise a reuse percentage or that the website can simply be converted into an app.

### Suggested domain ownership and data additions

| Domain | Principal records | Key protections |
|---|---|---|
| Identity | User, role/permission assignment, profiles, application, assessment version/attempt, verification reference | Unique normalized contacts where appropriate; rate limits; no raw KYC document retention by default |
| Demand | Lead, Requirement, Booking, Venue, Quotation, Invoice, Collection | Owner-scoped queries; immutable accepted quote snapshot; unique invoice number within issuing entity |
| Workforce | Event, Position, Assignment, worker reservation/calendar, Rating | Transactional capacity, active-assignment uniqueness, serialized overlap checks, effective-dated pay policy |
| Attendance | Attendance event, correction, verification/approval | Append-only evidence and explicit correction chain; one effective result used for calculation |
| Finance | Earning, approval, adjustment, PayoutBatch, payout attempt, Expense | Unique earning per assignment, unique monthly business key, provider-event dedupe, immutable history |
| Guests/jobs | Guest, follow-up task, notification/outbox, AuditLog | Event scope; import dedupe; limited export; no identity document in launch |

Index candidates follow actual queries: event/status assignments, worker/time reservations, active positions by event, city/budget venues, owner/date bookings, freelancer/month earnings, and due/status jobs. Define a partial uniqueness strategy for active assignments so cancelled historical attempts do not block a legitimate later claim.

Overlap checks need serialization on the worker's reservation record; two concurrent transactions that only read “no overlapping assignment” can still both pass without a shared write conflict. Capacity remains enforced even for admin overrides; an override can change eligibility deliberately but cannot silently exceed required quantity.

## 6. Team ownership and capacity

Use vertical slices with stable domain owners. Another developer can contribute through an agreed task and review; exclusive ownership must not become a queue that blocks all progress.

| Developer | Primary lane | Shared responsibility |
|---|---|---|
| A | Identity, freelancer experience, assessment, ratings, notification presentation | Auth/contracts owner; later supports basic guest UI and browser testing |
| B | Public/client/planner experience, demand, venues, events and attendance | UI patterns and event/attendance domain owner; templates reused across pages |
| C | Finance, API/job foundation, provider integration, admin summaries | Ledger/jobs/release infrastructure owner; avoids carrying the entire RSVP module alone |

RSVP basics are a bounded shared task after core contracts stabilize: A handles guest lists and follow-ups, B connects booking/client summary, C reviews authorization/export and job boundaries. One task owner integrates it; no simultaneous edits to shared files.

### Implementation budget caps

| Work package | Person-days |
|---|---:|
| Identity, roles and API foundation | 4 |
| Public site using existing patterns and supplied content | 3 |
| Client/planner demand and venue flow | 5 |
| Workforce, onboarding/assessment and claiming | 8 |
| Attendance and ratings | 4 |
| Finance and provider integration | 8 |
| Basic RSVP | 3 |
| Admin, settings and audits | 3 |
| Cross-cutting jobs, reporting and three small improvements | 4 |
| **Implementation cap** | **42** |
| Dedicated review, integration, UAT, training and release | 15 |
| Unallocated contingency | 6 |
| **Total** | **63** |

These caps assume a narrow, reusable UI and proven provider access. At Day 3, estimate remaining tasks and compare each lane with its available working days. A balanced total does not excuse an overloaded lane. A package exceeding its cap triggers a scope decision, not hidden overtime.

## 7. Day-by-day delivery schedule

Daily staging integration begins with the first working slice. Demos use persistent records and real permission checks. External-provider test environments are labelled clearly.

| Day | A: identity / workforce | B: demand / field | C: finance / platform | Team checkpoint |
|---|---|---|---|---|
| 1 | Roles, auth choice, onboarding rules | User interviews, UI audit, booking/event rules | Provider applications, financial policy, deployment choice | Scope changes and assumptions recorded; client input list assigned |
| 2 | Session/login, role checks, shared errors | Public templates, requirement form, core event model | CI/staging, Mongo setup/index scripts, webhook skeleton | Contracts for one reference journey agreed |
| 3 | Authenticated worker reads eligible sample position | Requirement → admin event/position working | Persistent audit and deployed API; provider test-access report | Working vertical slice; re-estimate and lock baseline |
| 4 | Application/assessment versioning | Public content, planner submission/account | Quote builder, invoice identity/numbering | Smoke and permission tests in CI |
| 5 | Admin approval/KYC adapter test | Booking wizard, venue CRUD/filtering | Hosted collections test and verified webhook | KYC/collections access checkpoint; choose explicit blocked paths |
| 6 | Eligible feed, worker availability | Multi-function booking/events/positions | Financial records and quote revisions | Early integrated enquiry → quote → event demo |
| 7 | Atomic claim and duplicate handling | Curated assignment/TL and roster | Durable job/outbox foundation | 20-on-10 and initial 500-on-10 claim tests; rest coverage staggered |
| 8 | Confirmation UI and worker briefing | Client/planner tracking and readiness checks | Invoice PDF/email, collection status | Client demo; classify scope change requests |
| 9 | Confirmation/expiry race tests | QR/code attendance and TL permission | Rate snapshot and earning calculation | No cross-user access; real Android device check |
| 10 | Push permissions/in-app fallback | Check-out, GPS exceptions, correction history | Two approvals and monthly aggregation | Payout credentials/go-live checkpoint; identify launch mode |
| 11 | Ratings/standing and rate-change UI | Replacement queue, overlap/reschedule behavior | Payout test submission and callbacks | One event proceeds from claim through approved earnings |
| 12 | Earnings explanation/history | Client team/milestone view; cash allocation links | Failed/uncertain/reversed payout handling and reconciliation | Financial invariants reviewed with failure tests |
| 13 | Basic guest CSV/list and follow-ups | Guest event linkage and client RSVP summary | Expense categories/tagging/export | Guest import validation and deduplication |
| 14 | Guest transport/status UI | Portfolio polish and approved content | Six admin scopes and concise executive summary | All baseline modules present; stop additions if a core flow is incomplete |
| 15 | Worker UAT feedback and accessibility | TL live-event rehearsal | Finance rehearsal and payout-provider readiness | Full booking → paid/verified-pending journey demo; live-rail decision |
| 16 | Auth/notification recovery hardening | Cancellation/replacement and browser edge cases | Job retries, webhook replay and backup restore | External failures visible; no silent-success states |
| 17 | Worker/guest defects | Performance, public mobile checks | Reports reconcile and audit coverage | Client content and operational settings final |
| 18 | Complete baseline fixes | Complete baseline fixes | Release candidate deployed | Feature freeze: no new workflows |
| 19 | Role/ownership negative tests | Concurrent claims and overlap suite | Duplicate payout/crash recovery suite | Cross-lane integration and security verification |
| 20 | Android/iPhone permission cases | Camera/location/network and accessibility | Provider outage, monitoring and restore exercise | Release candidate ready for formal UAT |
| 21 | Support worker/client UAT | Support planner/TL UAT | Support admin/finance UAT | Client executes agreed scripts; defects recorded |
| 22 | UAT fixes | UAT fixes | UAT fixes and financial retest | Acceptance review; unresolved issues explicitly classified |
| 23 | Help content and role training | Final content/data import and rehearsal | Production configuration, rollback and support runbook | Go/no-go decision; no provider placeholder presented as live |
| 24 | Worker smoke checks | Client/planner/attendance smoke checks | Controlled production release and monitoring | Authorized launch; transaction references verified |
| 25 | Stabilization and handover | Stabilization and handover | Monitoring, access/backup handover | Final acceptance and Phase 1.1 backlog |

Plan rest days around the milestone owners. Keep at least two developers available for release-critical dates. Daily activity includes review; do not leave all correctness work until Days 19–20.

### Critical path

Identity/contracts → event/position model → safe claim/confirmation → verified attendance → earnings/two approvals → payout/reconciliation → client UAT → release.

Public pages and basic guest tracking can proceed independently once contracts exist. Payment/KYC/provider approval runs alongside development and can still block launch. Day 18 is a feature freeze, not permission to carry unfinished safety work into production.

## 8. First three days: concrete task contracts

| Task | Owner / dependencies | Output and acceptance |
|---|---|---|
| TNP-001 Scope and rules baseline | All; client product owner | Signed-off launch/deferred list; actor map; cancellation, rate, reconfirmation and monthly cutoff rules; unresolved decisions have owner/deadline |
| TNP-002 Identity boundary | A; TNP-001 actor map | Login/session, logout, API identity and permission helper; unauthenticated access denied; cross-owner ID substitution denied; no client-supplied role trusted |
| TNP-003 Demand reference slice | B; schema agreement | Guest requirement persists; scoped admin creates event/positions; authenticated eligible worker can read it; refresh preserves data; two unrelated accounts remain isolated |
| TNP-004 Platform foundation | C; hosting decision | CI build/checks, staging deploy, secrets outside git, Mongo connectivity, migration/index script, audit event and error monitoring; documented rollback |
| TNP-005 API baseline | A owner, B/C review | OpenAPI, stable IDs/timestamps/errors, sample request/response fixtures for auth, requirements, events and positions; UI consumes the actual API |
| TNP-006 Provider readiness | C; client credentials/documents | Provider register with owner, test/live state, approvals, webhook evidence and fallback decision date; no secret values in status files |

Task files should include goal, owned files/domain, dependencies, contract, business invariants, verification and demo evidence. Detail only the next two or three days of work; keep later tasks at milestone level until dependencies settle.

## 9. External dependencies and honest fallback behavior

| Dependency | Owner / checkpoint | If unavailable |
|---|---|---|
| TNP photos, service copy, venue/planner data, invoice template | Client; Day 2 | Reuse approved material, reduce public content depth explicitly; missing assets are not replaced by unapproved stock |
| Hosting/domain/database/storage access | C + client; Days 1–3 | Staging may progress; production remains blocked until account access and deploy/restore work |
| Signup verification and KYC | A + client; Days 1–5 | Keep applications pending. Existing properly verified workers can participate if documented; never bypass verification or invent successful results |
| Collections provider | C + client; test by Day 5, live by Day 15 | Quotation/invoice flow works; payment button stays unavailable. Any external collection-recording workflow is a client-agreed scope variation with evidence and audit |
| Payout provider and beneficiary readiness | C + client; test by Day 10, live decision Day 15 | Approved monthly ledger/export can be delivered, but automated payout is incomplete. Retain pending status; manual bank settlement needs an explicit separate reconciled workflow and scope acceptance |
| Notification permission/delivery | A + Operations; Day 10 | In-app action queue plus an owned manual call list. Email is supplemental, not proof that the worker received a reminder |
| WhatsApp templates/consent/number readiness | Client; begin during sprint for Phase 1.1 | Basic guest CRM remains useful; no promise of automated campaign delivery |
| UAT availability and business policies | Client; nominate Day 1, attend Days 21–22 | Record impact and reschedule acceptance; a developer demo is not client UAT |

Provider setup begins immediately, but no approval duration is guaranteed. If the client requires live collections or payouts as a condition of launch, their absence is a release blocker. A restricted operational pilot is a different deliverable and must be labelled and agreed as such.

### Operating-cost model

Use actual expected users/events/messages and provider quotes before presenting a fixed annual charge. Budget separately for hosting/worker compute, Atlas/backup tier, object storage, monitoring, KYC checks, OTP, email, payment transaction fees, payout fees and Phase 1.1 WhatsApp message categories. Add domain/support and developer tooling separately. Free-tier availability does not establish a safe production cost model.

## 10. Business rules to resolve on Day 1

The following defaults make the plan concrete but require the business owner's decision before their dependent implementation:

1. **Confirmation:** accept a slot when claimed; reconfirm attendance at configurable T−2h with cutoff T−1h. Non-response releases the reservation, opens replacement and notifies Operations. Replacements after cutoff require immediate confirmation.
2. **Time:** store UTC and an event timezone; use explicit start/end intervals across midnight. Decide travel/setup buffer and whether overlapping unconfirmed reservations are permitted. Recommended: reserve on claim to prevent later conflicting confirmations.
3. **Pay basis:** per event, shift or hour; partial attendance, missing check-out, overtime, lateness and cancellation must be specified. For the narrowest release choose one flat shift rate plus authorized adjustment reasons; no automatic penalties without policy.
4. **Monthly cutoff:** use the event's agreed accounting timezone and service date, not webhook arrival time. Include approved assignments before cutoff; carry late approvals to the next open cycle with clear labels. One batch cannot be silently edited after processing starts.
5. **Rating:** define “poor,” ordering by completed service time rather than submission time, missing ratings, corrections and appeal review. Under-review workers need a defined eligibility rule.
6. **GPS exceptions:** missing GPS is distinct from outside-radius GPS. Missing GPS does not block TL verification; outside-radius cases require explicit reason/review according to the agreed policy.
7. **Financial terms:** issuing entities, invoice numbering, quote expiry, deposit/balance rules, cancellation/refund handling and any taxes/withholding must be supplied by the client's finance adviser. This plan does not determine legal or tax treatment.
8. **Roles:** fixed six admin scopes, event-scoped TL actions, and whether one user may hold more than one business persona. Avoid silently forcing dual-role people into duplicate identities.

## 11. Acceptance and release gates

### Product demonstrations required

- A visitor completes the saved booking wizard; staff issue a quote; the client approves the correct version, pays through the configured rail and sees the correct event.
- A planner submits with and without an account; both create the same requirement structure and expose only appropriate tracking information.
- A worker applies, takes the versioned assessment, completes valid verification/approval, claims an eligible position, reconfirms, checks in/out through a TL, and sees explainable earnings.
- Finance sees verified evidence, applies a reasoned adjustment, records both approvals, runs the monthly obligation once and reconciles its provider outcome.
- Operations uploads a guest CSV, corrects invalid rows, tracks replies/follow-ups and exports a scoped summary. No ID-document upload is exposed.

### Correctness checks

| Risk | Minimum evidence before release |
|---|---|
| Over-assignment | 20 then 500 concurrent distinct eligible claims against 10 slots produce exactly 10 active assignments; counters reconcile |
| Duplicate claims / overlap | Retried requests cannot duplicate a claim; simultaneous claims across overlapping events cannot both reserve the worker |
| Release/confirm race | Confirmation, expiry and admin cancellation at the same boundary produce one valid outcome and correct capacity |
| Attendance abuse | Wrong-event/expired QR, unauthorized TL and duplicate scans denied; GPS denial recorded correctly; corrections preserve history |
| Double earnings | Re-running attendance calculation creates one logical earning per assignment; rate changes do not rewrite past agreed work |
| Double payout | Duplicate requests/webhooks, worker crashes and uncertain provider responses cannot cause a second successful transfer |
| Incorrect paid state | Provider ID alone does not mark paid; terminal success reconciles; reversals create visible corrective handling |
| Privacy | Role × endpoint and owner/event-scope tests cover all protected routes, exports and files; no guest-ID files exist in launch |
| Job reliability | Restart around a due job, retry a failed provider call, reschedule/cancel an event; no duplicate or stale notification action |
| Financial reporting | One monthly payment spanning multiple events is allocated to its earnings before event cash reports are computed |
| Recovery | Restore backup into isolated staging and verify essential records and permissions; document measured recovery time |

### Performance and browser acceptance

Retain the PDF's 500-claim correctness test. Make its speed targets measurable: agree device, dataset, network, cache state and percentile on Day 3. Suggested launch targets are a median mobile Lighthouse performance score of at least 85 over three runs on representative public pages, opportunity API p95 under one second under the agreed normal load, and a usable first portal screen within three seconds on the chosen mid-range Android test profile. The PDF's “feed under one second on a mid-range phone” is ambiguous; this split is a proposed clarification, not a claim that those targets are already achieved.

Test Android Chrome and iPhone Safari, desktop Chrome/Edge, keyboard navigation, readable contrast, large-text layouts, validation messages, loading/empty/error states and permission denial. Test actual QR scanning on devices. Live counters may lag briefly; the server response alone determines allocation.

### Go/no-go

Launch requires complete accepted critical journeys, no unresolved release-blocking security/financial/data-integrity defects, tested recovery, operational owners, approved configuration, role training and the client's acceptance of any restricted provider mode. Classify other issues by impact with owner and due date. A failed safety gate can delay release; a date does not make broken money or access control acceptable.

## 12. Refined AI engineering workflow

Keep the manual's useful principles: one repository, vertical lanes, short task contracts, daily staging, human ownership, meaningful CI, browser verification and documented decisions.

Simplify its operating overhead:

- Use one concise product scope, domain-rules document, architecture/decision log, API contract and current status. Avoid duplicating the same requirements in several long AI prompts.
- One implementation agent per owned task. Independent review is most valuable for auth, claim concurrency, attendance and finance; routine copy/layout edits do not need a multi-model ceremony.
- Human developers approve architecture and evaluate review findings. “Another model reviewed it” is not test evidence.
- Baseline shared contracts Day 3, then review additive changes. Run build, type checks, focused tests and critical browser journeys in CI as the repository supports them.
- Rotate release coordination with planned handovers; keep domain accountability stable. Reserve daily review time rather than treating it as free work.
- Every change request records client value, effort and displaced work. After Day 18, only defect fixes and accepted release essentials enter the build.
- Use AI for implementation, test generation, bounded review and investigation. Do not promise coding percentages, unlimited throughput or completion based on subscription tier.

## 13. Contingency and six-month roadmap

### Cut order if the schedule slips

1. Remove nonessential public motion and visual polish beyond approved responsive templates.
2. Defer venue bulk tools, repeated-event convenience and custom reporting if they re-enter requests.
3. Reduce executive charts to accurate operational lists and totals.
4. With client agreement, move basic guest transport/detail extras to Phase 1.1; preserve the core guest status summary.
5. Replan the release if critical staffing, financial, verification or access-control work remains incomplete. Never disguise a removed commitment as completed.

### Roadmap

| Period | Priority and exit evidence |
|---|---|
| Days 1–25 | Focused web launch and training; critical journeys accepted and observable |
| First 2 weeks after launch | Stabilize actual event operations, measure support issues and audit the first monthly payout cycle; support ownership/hours agreed separately |
| Months 1–2 / Phase 1.1 | Full RSVP automation, approved templates, secure guest links, complete masked-document lifecycle if still required, venue CSV import and repeat-event templates; separate estimate and acceptance |
| Months 3–4 | Improve replacement workflow and preferred crews from real data; query/performance tuning; measure whether mobile-specific needs justify an app |
| Month 5 | Mobile discovery, API compatibility review, permission/auth design, device and notification proof of concept |
| Month 6 onward | Build the agreed mobile client, preferably freelancer/TL first if usage supports it; reuse the platform and separately estimate native implementation and release |

The mobile project should be prioritized from six months of evidence: worker usage, notification misses, attendance friction and connectivity problems. It is future work, not part of the 25-day web delivery fee unless separately contracted.

## 14. Client-facing scope summary

> TNP will receive a responsive web platform for public enquiries, client and planner bookings, freelancer onboarding and allocation, event operations, verified attendance, financial approvals and basic guest tracking. The release includes role-based administration, auditability and a shared API designed to support future mobile applications. Delivery is planned across 25 calendar days including UAT, deployment and handover. Third-party verification, payment and payout activation depend on provider readiness. Full automated WhatsApp RSVP campaigns, guest identity-document collection and native mobile applications are later-phase work. Any restricted launch mode or change to the original scope will be documented explicitly.

## 15. Day 1 decision checklist

- Confirm kickoff and final release date.
- Accept or revise the launch/deferred matrix against the actual client proposal, which was not supplied.
- Name the client decision maker and operations/finance UAT owners.
- Confirm provider accounts, approved data/content and invoice template availability.
- Resolve confirmation, cancellation, overlap, rate, monthly cutoff and refund policies.
- Choose and prove the production build/hosting route.
- Schedule Days 8, 15, 21 and 22 client sessions.
- Record the mobile boundary: reusable platform now; mobile UI/device work separately later.

**Delivery principle:** maximize usable client value through complete, trustworthy workflows within the available capacity.
