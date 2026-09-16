# TNP: frontend-first delivery plan, version 2

> **Historical version.** The screen inventory and approved design criteria remain reference material. Execution, ownership, review gates and schedule are superseded by [Execution Plan v3](TNP-25-Day-Execution-Plan-v3.md) and the [v3 operating manual](TNP-AI-Operating-Manual-v3.md). Old developer A/B/C mean human H1/H3/H2 respectively; they are not current execution-lane names.

Prepared 15 September; finalized 16 September 2026. Three developers, 25 calendar days, web only. Native mobile is a separate future project approximately six months later.

## 1. The revised commitment

**Day 3: a deployed, interactive frontend review covering at least 80% of the agreed primary screen sets. Day 25: the agreed production web release, including UAT and handover.**

The client has already expressed a preference for the website and particularly the Operations Demo format. Use that as the design baseline. This is an extension of the approved experience, not a redesign exercise.

Reference: [TNP website](https://tnp-hospitality-demo.vercel.app/) and [Operations Demo](https://tnp-hospitality-demo.vercel.app/admin). Both were inspected in the browser. Local implementation was also inspected in `components/tnp/PortalPages.tsx`, `AppShell.tsx`, `HomeExperience.tsx` and `app/globals.css`.

This version supersedes the schedule and developer ownership in the earlier plan. Its market research, launch scope proposals, domain corrections and security/financial requirements remain applicable. The proposed deferral of full WhatsApp RSVP automation and guest identity-document collection still needs agreement against the actual client contract.

### Define the Day 3 promise correctly

Frontend-ready means the client can navigate the relevant screens, fill forms, see validation, follow the primary interaction and review realistic states. It does not mean real KYC, secure authentication, database persistence, real QR attendance or payments are complete.

Use a clearly labelled **“Client review preview — sample data”** environment. Track two separate columns for every feature: **frontend review status** and **production integration status**. “80% frontend reviewed” must never become “80% of the project complete.”

The Day 3 gate approves layout, terminology, fields, navigation and workflows. It does not replace Days 21–22 operational UAT.

## 2. Preserve the design the client liked

### Observed design language

- Public site: deep teal backdrop, large cream serif headings, event photography, light sand sections and animated editorial galleries.
- Operations: dark teal left sidebar; large cream heading; metric tiles; light verification panels; event-control panel; status badges; ratings and payout summaries.
- Existing theme tokens include deep teal `#084c49`, dark teal `#062b29`, ivory `#f5f1e7` and champagne `#bba879`.

### Apply it consistently

1. Preserve the homepage's approved composition and functioning animations. Fix issues selectively; do not replace it with a generic template or new animation framework.
2. Use the Operations format for admin/event-management screens. Derive reusable navigation, page header, metrics, status, table/list, form, detail panel, confirmation dialog and empty/error state patterns from it.
3. Keep freelancer screens usable on a phone: the same colors, typography and status language, with a compact header, cards and thumb-friendly actions. Do not squeeze a desktop sidebar onto a small screen.
4. Keep client discovery warm and editorial, then use a restrained portal shell for quotations and event status. The four-step booking wizard should not become an admin dashboard.
5. Keep prominent overview typography; use shorter headers on dense detail screens. Treat this as an efficiency refinement for client review, not a change of brand.
6. Preserve motion on public storytelling sections; use quick functional feedback in portals. Respect reduced motion, focus visibility and keyboard access.

### Correct the demo's implied scope

The source currently uses local React state for several actions, a decorative QR icon, static metrics and simulated geofence incidents. Sidebar entries include anchors rather than complete module destinations. These are frontend starting points, not production behavior.

- Keep the event-control/map-panel composition, but show venue context, last verified check-in and attendance exceptions. Remove continuous “worker exited the venue” detection from the launch demonstration, or isolate it as an explicitly future concept.
- Replacement candidates use role, availability and stated location. Do not imply live “1.7 km away” tracking without actual authorized location data.
- “Simulate Scan” may remain in the labelled preview. Real attendance needs TL permission, event-scoped tokens, server timestamp and verified persistence later.
- Show a three-poor-rating **review** workflow with a human decision, not automatic permanent blocking.
- The public preview's document counters must be labelled future/demo or removed from the launch route if document collection remains deferred.
- Before production, replace the public demo role switcher with actual authorized role navigation; a URL or sidebar switch never grants access.

## 3. Measurable 80% coverage

Agree this inventory during the first two hours of Day 1. Each row is one bounded screen set, weighted equally for this **review coverage metric only**. It is not an effort estimate. A screen set can include a short wizard or a list/detail pair; its boundary is specified below.

There are 20 sets. Complete the first 16 to review-ready standard by Day 3: **16 / 20 = 80%**. The final four are completed after feedback by Day 6. Existing code is reused where suitable, but no row is claimed complete merely because a route already exists.

| ID | Screen set and boundary | Owner | Target |
|---|---|---|---|
| F01 | Approved homepage, navigation and portfolio sections | A | Day 3 |
| F02 | Shared public detail template populated with supplied service/department content; contact/enquiry form | A | Day 3 |
| F03 | Client booking: venue, planner, details, review/submit steps | A | Day 3 |
| F04 | Client event summary and quote/payment-status preview | A | Day 3 |
| F05 | Planner registration and requirement form | A | Day 3 |
| F06 | Planner requirement list and detail/status | A | Day 3 |
| F07 | Freelancer application and assessment steps | B | Day 3 |
| F08 | Freelancer opportunity feed and event detail | B | Day 3 |
| F09 | Claim/Coming response and worker briefing states | B | Day 3 |
| F10 | Freelancer pass, attendance history and GPS-denied state | B | Day 3 |
| F11 | Earnings, payout history, ratings and account-standing tabs | B | Day 3 |
| F12 | Operations overview using the approved format | C | Day 3 |
| F13 | Operations event list, detail and roster | C | Day 3 |
| F14 | Planner/freelancer verification queue with review/decision panel | C | Day 3 |
| F15 | Attendance exceptions and replacement queue | C | Day 3 |
| F16 | Quote builder and earnings/payout approval preview | C | Day 3 |
| F17 | Basic RSVP guest list, import preview and follow-ups | B, C review | Days 4–6 |
| F18 | Admin venue/profile/assessment/rate maintenance using standard forms | B; A venue support | Days 4–6 |
| F19 | Login/recovery/application tracking and expired/forbidden states | B | Days 4–6 |
| F20 | Expense/report/audit views and fixed-role settings | C | Days 4–6 |

Basic role-entry navigation is available in the preview from Day 1; full F19 auth/recovery screen treatment is part of the last 20%. F02 reuses templates, not eighteen independently designed pages. Missing client content is tracked separately and cannot be concealed by counting blank templates as completed populated pages.

### Review-ready checklist for each of F01–F16

- Matches the approved design language on desktop and mobile; no clipped primary content.
- Primary actions work against a consistent fixture/data adapter and give truthful preview feedback.
- Form labels, required fields and common validation errors are implemented.
- Relevant loading, empty, error and success states can be demonstrated; an irrelevant state is marked N/A with a reason.
- Navigation reaches a real screen/panel; no dead primary buttons or placeholder links.
- Uses shared components and API-shaped data; no direct production-provider call.
- Sample content and preview-only behavior are clearly identified.
- Another developer opens and checks the screen, rather than approving screenshots alone.

If 16 sets do not pass, report the actual count and missing rows. Do not change weights or rename unfinished work to reach 80%.

## 4. Three developers: ownership for the whole sprint

| Person | Days 1–3 | Days 4–18 | Shared responsibility |
|---|---|---|---|
| Developer A — product/UI lead | Public site, client and planner UI; design tokens/shared shell | Demand APIs, bookings, venues, planner/client integration | Client feedback, visual consistency, shared UI ownership |
| Developer B — workforce lead | Freelancer onboarding, assignments, attendance/earnings UI | Identity/RBAC, onboarding, claims, confirmation, attendance, ratings, basic guest tracking | Domain contracts, worker/mobile-browser QA |
| Developer C — operations/finance lead | Operations UI, event roster, verification and finance preview | Event/position APIs, finance, provider adapters, jobs, admin and deployment | CI, provider readiness, finance invariants, release coordination |

Supporting work is assigned explicitly. A helps B with guest/venue presentation after demand integration. B supplies identity permissions that C's admin endpoints consume. C owns Position capacity/assignment service changes; B owns worker-facing claim integration and overlap/eligibility rules, with one jointly reviewed contract. Avoid two independently implemented claim engines.

Each person uses Codex to implement and Claude to review/plan within their lane. The client/product owner decides scope; no AI is the final business decision maker. A coordinates client decisions; C coordinates merges through Day 3, then releases use a named rotating captain.

## 5. First 72 hours

### Day 1 — reuse baseline and complete the first screen in each lane

**First two hours, all three:** reproduce the current build, record approved demo URL/commit, identify shared components, settle inventory F01–F20, assign paths and one fixture scenario. Keep the existing Vinext/Vercel preview build for these three days unless a reproduced blocker makes that impossible. Defer a framework/repository restructuring exercise.

- A: establish the approved theme/shell patterns and client booking skeleton; preserve the homepage.
- B: extract the freelancer component to its owned file, build opportunity/briefing patterns and define assignment/attendance DTOs.
- C: extract the Operations component, build overview/event detail, configure the preview build and shared mock-data boundary.
- A alone coordinates extraction from `PortalPages.tsx` and changes to shared CSS/AppShell. Merge this prerequisite early before separate lane edits. B/C provide requirements while it is being done.
- Spend a bounded 30–45 minutes each on API/field agreement and provider readiness. Credentials/onboarding are started by the responsible human immediately, even though frontend dominates these days.

**Day 1 checkpoint:** all primary portal entry routes work in one integrated preview; shared components and fixture contract exist; each lane demonstrates one primary interaction.

### Day 2 — complete primary journeys

- A: F02–F06 forms, wizard state, client quotation view, planner requirement tracking.
- B: F07–F11 application/assessment, feed, claim/reconfirmation, attendance and earnings states.
- C: F12–F16 roster, verification actions, exception/replacement, finance approval states.
- Merge at lunchtime and end of day. Use the same booking/event/worker IDs across portals.
- Run a shared preview scenario: planner requirement → operations event → worker claim → roster change → sample attendance → pending earnings.

**Day 2 checkpoint:** all 16 target sets are present; main interactions work; remaining defects are itemized. Presence alone does not pass the Day 3 checklist.

### Day 3 — verify, polish and obtain client feedback

- Morning: complete mobile layouts and validation/error states; test preview navigation and scenario consistency.
- Midday: cross-review A → B, B → C, C → A; run the current lint/type/build commands and relevant browser checks.
- Early afternoon: deploy an immutable review preview from a recorded commit; verify the deployed pages, not only local output. Keep the approved reference demo accessible.
- Final session: client walkthrough, decision log and issue classification. Publish actual coverage, feedback and the Days 4–6 plan.

**Do not spend Day 3 adding optional visual effects or rebuilding a layout the client has already approved.**

### Capacity inside these three days

Three developers provide nine person-days if all are available for the first three days. Allocate roughly six to screen extension, one to shared setup/contracts/preview, and two to cross-browser review, integration and client preparation. This is feasible only with reuse and bounded screen sets. It is part of the 63-person-day overall capacity assumption, not extra free capacity before the sprint.

## 6. Mock-to-real integration without rebuilding the frontend

Use UI → feature hook/service interface → mock adapter OR HTTP adapter → backend API. The adapters expose the same typed contract. Do not scatter `if (demo)` conditions across every page or store security/financial decisions in components.

Recommended planned organization (create only the needed folders):

```text
components/tnp/portals/client/       A
components/tnp/portals/planner/      A
components/tnp/portals/freelancer/   B
components/tnp/portals/operations/   C
components/tnp/shared/              A coordinates
lib/contracts/                     B coordinates, all review
lib/services/                      one owner per domain
lib/demo/                          synthetic fixtures and adapter
```

These are planned destinations, not existing folders or an immediate monorepo migration. Thin route files can continue importing the appropriate portal component.

Use one synthetic wedding booking with two functions, several positions, confirmed/pending workers, a declined worker, a GPS-denied attendance example, a revised quote and a monthly payout in processing. All money uses integer paise and dates carry timezone context. Demo storage may hold synthetic data in a namespaced browser store to survive navigation/refresh; provide Reset Demo and do not collect real personal information. Separate browsers/devices do not share that store; present the walkthrough in one browser session.

Preview-only simulation controls must not ship in live production. Production build/config validation must fail if required modules select mock adapters; add an integration check for fixture leakage. Live payment/KYC/payout buttons remain unavailable until their real services pass acceptance. Backend authorization cannot be simulated into existence by a role selector.

## 7. Client review session: 45–60 minutes

1. **5 minutes:** restate what is interactive sample data, what is production-integrated and what is out of this release.
2. **15 minutes:** Operations overview → event/roster → verification → attendance exception → replacement → payout approval. Start with the format the client liked.
3. **10 minutes:** client booking and planner requirement journey.
4. **10 minutes:** worker application, claiming, Coming response, attendance and earnings.
5. **5–15 minutes:** client decisions and priorities.

Record each item with feedback ID, screen, requested change, reason, priority, owner and acceptance. Classify as: defect against agreed scope; presentation revision; business-rule clarification; new scope. A consolidates one list. Apply accepted design feedback by Day 5; unresolved high-impact rules block only their dependent work. Continue independent work while awaiting the answer.

Ask the client to approve layout/navigation, fields/terminology, primary workflows and the listed remaining 20%. Do not ask for blanket production approval. If the client is unavailable on Day 3, deliver the review link and logged walkthrough; client approval remains pending, not assumed.

## 8. Remaining 25-day schedule

| Day | Main output | Owner / checkpoint |
|---|---|---|
| 1 | Shared UI/fixtures, preserved homepage, primary portal shells | A/B/C as above |
| 2 | Sixteen primary screen sets present and connected in preview | A/B/C |
| 3 | At least 16/20 review-ready; deployed client review | A client session; C preview |
| 4 | Triage feedback; first live identity/demand/event endpoints; F17–F20 begin | B auth, A demand, C events |
| 5 | Accepted design changes; onboarding/KYC and collections test-access check | A feedback; B/C providers |
| 6 | Remaining frontend sets complete; forms start replacing fixtures | A/B/C integration demo |
| 7 | Eligible feed, atomic claim, capacity and overlap verification | B/C one contract |
| 8 | Live requirement → event → worker claim → roster demo | A/B/C client checkpoint |
| 9 | Confirmation deadlines, durable jobs and replacement states | B worker; C jobs/events |
| 10 | TL attendance, QR/code/GPS paths; payout test-access gate | B attendance; C payouts |
| 11 | Verified attendance → rate snapshot → earnings → approvals | B/C |
| 12 | Quotations/invoices, verified collections and event cash allocations | A client consumption; C finance |
| 13 | Payout attempts, webhook replay, reconciliation and failure handling | C; B independent verification |
| 14 | Basic RSVP persistence, guest import, summaries and essential admin settings | B guest; A summary; C admin |
| 15 | Complete live core journey demo; provider/live-launch decision | All with client |
| 16 | Ratings, corrections, audit/report reconciliation and integration defects | B ratings; C finance; A regression |
| 17 | Performance, content, permissions, job recovery and backup rehearsal | All |
| 18 | Baseline complete; all critical production paths use real adapters | Feature freeze |
| 19 | Concurrency, money correctness and authorization suites | Cross-lane review |
| 20 | Device/camera/location/network checks and recovery exercise | Release candidate |
| 21 | Client UAT across worker, planner, TL, admin and finance | Client executes scripts |
| 22 | UAT fixes and targeted retesting; acceptance review | All |
| 23 | Training, final data/config and deployment rehearsal | A/B training; C release |
| 24 | Authorized production release and smoke checks | Release captain + all |
| 25 | Stabilization, handover, support ownership and remaining backlog | All |

Four staggered rest days per developer remain budgeted across the 25 calendar days; plan them after the first-three-day review push and maintain milestone coverage. Do not interpret the table as 25 working days for every developer.

Critical backend work is moved forward after Day 3 rather than waiting for all aesthetic feedback. No extra feature budget is created by showing the frontend early. The production gates from the earlier plan remain: safe claims/overlaps, valid attendance, no duplicate earnings/transfers, scoped access, provider reconciliation, backups and real UAT.

## 9. Scope and mobile boundaries remain intact

The baseline retains public/client/planner/freelancer/admin web experiences, event staffing, attendance, core finance and basic RSVP. Full automated WhatsApp RSVP, guest identity documents, continuous background geofencing, native applications and advanced AI features remain proposed later work. Provider readiness may require an explicitly agreed restricted pilot; incomplete live financial rails are never silently called complete.

Keep business rules in the shared Node/Express API with MongoDB Atlas. For the future mobile app, reuse identities, data, API contracts, permissions, domain services and jobs. Design web-specific views separately from reusable contracts. Mobile screens, authentication device flow, native notifications and hardware integration still require a separately estimated project.

## 10. Deliverables and evidence

**Day 3:** review preview URL/commit, coverage inventory with evidence, working sample scenario, device checks, known gaps and client feedback record.

**Day 6:** agreed revisions, remaining screen sets, contract baseline and per-module integration status.

**Day 18:** production-integrated feature inventory, critical verification results and no hidden fixture fallbacks.

**Day 25:** deployed agreed scope, client acceptance, runbooks, backup/recovery evidence, access handover and Phase 1.1 backlog.

Use the companion [AI Engineering Master Manual](TNP-AI-Engineering-Master-Manual.md) for laptop setup, Codex/Claude responsibilities, Git workflow, prompts and review handoffs. Use [Starter Templates](TNP-Engineering-Starter-Templates.md) to prepare the small shared instruction/task files.
