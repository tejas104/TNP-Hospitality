# F01–F20 source audit

Audited source: 9d58061f2d36514ebc932fa94bb3dc90f4b97a97, 2026-09-16. Source inspection plus public/home and Operations browser observation; not a full mobile/interaction acceptance run.
P = components/tnp/PortalPages.tsx. Lines refer to this baseline, before S0.
“Partial” includes static representations of the set. “Missing” means no implementation of the bounded screen set was found. No set is independently certified frontend-ready; 0/20 verified, target 16/20 by Day 3. All production integrations below are missing in tracked source.

| ID | Screen set | State / concrete evidence | Gap / next task |
|---|---|---|---|
| F01 | Homepage/navigation/portfolio | Partial: HomeExperience.tsx:19; AppShell.tsx; services/events/about anchors and animated galleries exist | Full phone/keyboard/reduced-motion certification, portfolio filter/content requirements and image provenance; B-01 |
| F02 | Public detail template/content/enquiry | Missing: only five route page files; data/tnp.ts service summaries are homepage content, not detail pages | Reusable populated service/department template and contact validation; client content pending; B-01 |
| F03 | Client booking four steps | Partial: P:23–114 category selector and short local-success form | Venue/planner/details/review wizard, validation and refresh state; A-01 |
| F04 | Client event/quote/payment status | Missing: client export has only discovery and brief | Event/team summary, quote/version/approval/revision/payment-status preview; A-02 |
| F05 | Planner registration/requirement | Partial: P:116–190 forms toggle local booleans | Required registration/requirement fields, validation and shared submission IDs; A-01 |
| F06 | Planner list/detail/status | Partial: P:191–206 static status timeline | Actual requirement list/detail, filters and reference/status consistency; A-02 |
| F07 | Application/assessment | Partial: P:225–246 labels and fixed 94% result | Editable application and assessment steps/result/errors; C-01 |
| F08 | Opportunities/detail | Partial: P:256–280 one fixed opportunity and slot display | Feed/filter/detail, eligible/full/unavailable/error cases; C-02 |
| F09 | Claim/Coming/briefing | Partial: P:210–212,276,289–300 local accepted/reminder state | Shared roster update, distinct acceptance/reconfirmation/decline and briefing; C-02 |
| F10 | Pass/attendance/GPS denied | Partial: P:304–328 decorative QR, Simulate Scan, fixed inside-zone label | Event evidence/history and GPS-denied state; C-03 |
| F11 | Earnings/payout/ratings/standing | Partial: P:330–350 static scores/bars/metrics | Explainable earning/history tabs, payout states/comments/standing and pending-policy correction; C-03 |
| F12 | Operations overview | Partial: P:358–402 approved shell and fixed metrics | Working destinations, fixture-driven metrics and responsive/state checks; D-01 |
| F13 | Events/detail/roster | Partial: P:432–456 single live panel and workforce text | Selectable list/detail, linked roster and configurable quantities/functions; D-01 |
| F14 | Verification queue/review | Partial: P:406–428; only planner Approve has handler | Review/reject/change-role/worker approvals and reasoned decisions; D-02 |
| F15 | Attendance exceptions/replacements | Partial: P:449–487 incident/replacement toggles; Contact/Send Opportunity lack handlers | Truthful attendance exception queue, eligible candidates/actions, remove live-distance implication; D-02 |
| F16 | Quote/earnings/payout approvals | Partial: P:500–516 payout summary only | Quote builder/version/entity and two-stage earning approval preview; D-03 |
| F17 | Basic RSVP/import/follow-ups | Missing: sidebar #rsvp has no module; homepage RSVP counters are marketing preview | Days 4–6 backlog: guest CSV/manual validation/status/follow-up; contract unresolved for automation/documents |
| F18 | Venue/profile/assessment/rates maintenance | Missing: no CRUD/maintenance views in routes or portals | Days 4–6 backlog; split exact domains/paths after S1 and policy decisions |
| F19 | Login/recovery/tracking/access states | Missing: AppShell Login goes to /planner; role switcher is demo navigation | Days 4–6 auth/tracking UI backlog; real security needs separate server task |
| F20 | Expense/report/audit/fixed roles | Missing: #reports link has no module; no expense/audit/role controls | Days 4–6 backlog; finance/RBAC production gate separate |

Summary: 14 partial, 6 missing, 0 complete screen sets certified. Reuse is substantial visually, but a route or dead button is not a finished set.
Primary demonstration order: Operations -> client/planner -> freelancer. Record each set's commit, preview origin, actual checks and independent human signoff before incrementing the numerator.
No browser interaction or production acceptance is inferred from source handlers. Deployed reference SHA remains unknown.
