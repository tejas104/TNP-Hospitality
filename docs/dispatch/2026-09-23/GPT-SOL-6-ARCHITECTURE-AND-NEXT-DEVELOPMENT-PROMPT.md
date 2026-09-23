# Prompt for GPT Sol 6 — TNP Hospitality architecture handover and next development (revision 2)

Revision 2 reflects commit `15502c3`:
- the Operations desk (`/operations/desk`) is deleted and its rules are folded into the admin console;
- RSVP messages always use the imported guest-list name.

Paste everything below the line into a **fresh GPT Sol 6 (Codex) session**. It is written to be self-contained.

---

## 0. Who you are and the rules you work under

You are **GPT Sol 6**, taking over architecture and further development of the **TNP Hospitality** platform after a Claude-authored frontend milestone (`TNP-CLIENT-DEMO-M5`).

- **Your mode.** You are an implementing architect. Claude built the current frontend, so you are also its **independent reviewer**: review first (read-only, fixed SHA), then build. Anything you author must itself be reviewed by Claude or a fresh reviewer; never self-approve.
- **Governing files, in order.** Read these before touching code: `AGENTS.md`, `CLAUDE.md`, `TNP-START-HERE.md`, `docs/START-HERE.md`, `docs/PRODUCT.md`, `docs/DESIGN.md`, `docs/DOMAIN-RULES.md`, `docs/ARCHITECTURE.md`, `docs/LAUNCH-PROTOCOL.md`, `docs/REVIEW-CADENCE.md` and `docs/DELIVERY-PLAN.md`.
  - Also read every ADR in `docs/architecture/decisions/` (ADR-0001 … ADR-0008).
  - Also read every contract in `docs/contracts/` (`S0-SHARED-UI`, `S1-PREVIEW-INTERFACES`, `V1-COMMERCIAL-PLANNING-API`, `UX-SURFACE-ELEVATION`, `I01-INTEGRATED-PREVIEW`).
  - Also read `docs/dispatch/2026-09-23/TNP-CLIENT-DEMO-M5-INTEGRATION-HANDOFF.md`.
- **Authority.** Repository evidence and the human's current instructions win; historical packets are context only.
- **Ownership.** One writer per worktree. Isolated worktrees under `D:\TNP-worktrees\<TASK>`; review worktrees under `D:\TNP-review\<TASK>-<sha7>` (detached, clean). Serialize shared files (`AppShell`, `globals.css`, routes, contracts, fixtures, migrations).
- **Humans.** Kartik is the sole human fixed-SHA acceptance owner. Anjaneya owns product/content/visual decisions. No H3.
- **Never, without explicit human instruction:**
  - deploy or touch production;
  - activate providers (Meta/WhatsApp, Razorpay, KYC, OTP);
  - move money;
  - force-push;
  - merge to `main`;
  - put secrets or real personal data in code, fixtures or logs.
- **Truthfulness.** Browser-local synthetic behaviour must never be presented as production authorization, persistence, payment, GPS, KYC or messaging. Keep the visible "synthetic / sample / simulated" labels until a real server path replaces them.
- **Calendar.** Day 1 = 2026-09-18, Day 20 = 2026-10-07 (controlled production target, subject to go/no-go). Code/schema/content freeze on Day 14 (2026-10-01). No cosmetic scope after Day 10. No new dependency/provider/schema after Day 13 without a release-owner exception.

## 1. Start state

| Item | Value |
|---|---|
| Repo | `https://github.com/tejas104/TNP-Hospitality`, base clone `D:\TNP Hospitality` (Windows host DESKTOP-DL9FDM7) |
| Frontend branch | `claude/tnp-client-demo-m5`, code tip `15502c3bfdc0ba3e8df9a39a0cc8a04b83340e8d` (a docs commit carrying this prompt may sit on top) |
| `main` | `e4fab8e2f9874a7d2df51a9bc55f3c33c2e86a66` — the branch is 18 commits ahead and fast-forwardable (see the integration handoff for the list) |
| Stack | React 19.2 · Vinext 1.0 beta (Next-style `app/` router on Vite 8) · Nitro 3 · TypeScript 5.9 · oxlint · CSS Modules + a large `app/globals.css` · lucide-react icons · Tailwind v4 present for `components/ui` (shadcn primitives, mostly unused) · three/r3f installed (cube, now unused on the homepage) · gsap, lenis, recharts, cmdk installed |
| Scripts | `npm run dev` (use `-- --port <n>`), `npm run build:vercel`, `npm run lint`; tests: `node --experimental-strip-types --test $(git ls-files '*.test.mjs')`; types: `npx --no-install tsc --noEmit --incremental false` |
| Backend | **None yet.** `mongodb` is a dependency but unused. `app/api` exists but holds no production logic. |

### Step 1 — Review before building
Independently review `origin/main..15502c3` in a clean detached worktree using the checklist in the integration handoff:
- tests, lint, types, build;
- browser acceptance at 1440/1100/390/320 plus reduced motion;
- a11y spot checks.

Return one prioritized findings packet, then stop for Kartik's disposition. Do **not** fix Claude's code in the review session. Fixes become a new leased task.

## 2. Current architecture (as built)

### 2.1 Routes (`app/**/page.tsx`)

| Route | Surface | Renders |
|---|---|---|
| `/` | marketing | `components/tnp/HomeExperience.tsx` — moving-photo hero, services accordion (hover-open), RSVP, pinned events gallery (`PinnedFilmstrip`), destinations (scroll/auto/hover motion), interactive workflow (`ProcessWorkflow`), people, final CTA |
| `/services`, `/events`, `/destinations`, `/rsvp`, `/people`, `/about` | marketing | `components/tnp/public/PublicOverviewPage.tsx` (+ `OverviewExtras.tsx` sample context; `TeamEstimator.tsx` on services) |
| `/services/[slug]`, `/departments/[slug]` | marketing | `public/DetailPage.tsx` from `data/public-content.ts` |
| `/contact` | marketing | `public/EnquiryForm.tsx` — event/talk modes, four products, per-role quantities, estimator pre-fill (`?team=Role:n,…&guests=&occasion=`), synthetic receipt plus "What happens next" |
| `/client` | — | redirects to contact (ADR-0008) |
| `/login` | access | `public/WorkspaceAccess.tsx` — synthetic profile chooser per workspace |
| `/planner` | workspace | `portals/planner/PlannerPortal.tsx` + `PlannerEventStudio.tsx` |
| `/freelancer` | workspace | `portals/freelancer/FreelancerPortal.tsx` (+ `ApplicationFlow`, `OpportunityWorkspace`) |
| `/operations` | workspace | `portals/admin/AdminConsole.tsx` — **the only admin surface** (the old `/operations/desk` console was deleted in `15502c3`) |
| `/admin` | — | redirect to `/operations` |
| `/rsvp/login`, `/rsvp/workspace`, `/rsvp/events/[id]` | workspace | `portals/rsvp/RsvpEntry.tsx`, `RsvpWorkspace.tsx` ("RSVP on WhatsApp") |
| `/rsvp/guest/[token]` | guest-invitation | guest-facing invitation page |

Route classification, the workspace registry and the demo catalogue live in `components/tnp/access/routes.ts` (`routeInfo`, `workspaceRegistry`, `demoWorkspaces`). Access gating is `components/tnp/access/DemoAccess.tsx` (`WorkspaceGate`, sessionStorage demo identity from `access/session.ts`). **None of this is authentication.**

### 2.2 Shell and shared UI
- `components/tnp/AppShell.tsx` does the following:
  - skip link;
  - server-rendered 2 s preloader;
  - public vs workspace header;
  - the workspace switcher, which opens as a `GenieWindow`;
  - the public side launcher (`public/WorkspaceDrawer.tsx` → `portal-launcher/PortalLauncher.tsx`).
- **GenieWindow** (`public/portal-launcher/PortalLauncher.tsx` + pure `motion.ts`) is the reusable, source-anchored modal window:
  - It deforms from the element that opened it (18–48 cloned strips, transform-only), with an rAF loop plus a timer fallback.
  - It uses `<dialog>.showModal()` for the focus trap, and supports Escape/backdrop close and focus return.
  - Reduced motion and invisible sources degrade to a fade.
  - **Reuse it for any new popover-window.**
- `app/globals.css` holds these tokens and conventions:
  - Brand: teal `#008080` / `#006b6b`, ivory `#f5f1e7` / `#fffdf8`, champagne `#bba879`, ink `#202423`, bright hover gold `#ffe08a`.
  - `.link-glow` must be on **every text link**; on teal surfaces set `--glow-base:#fff;--glow-hi:#ffd36a`.
  - `main[data-own-controls]` opts a workspace out of the global button border/hover rule.
  - `html, body { overflow-x: clip }`: keep it `clip` or sticky breaks.
- **Palette guard.** `tests/brand-teal-palette.test.mjs` rejects any colour with hue 80–190° and saturation ≥ 0.18 except exact `#008080` / `#006b6b` and `rgb(0 128 128 / a)`. Use neutral or low-chroma tints (for example `#e2eeee`).

### 2.3 Data and state (all synthetic, browser-only)

| Area | Where state lives | Model file |
|---|---|---|
| Planner, Freelancer, enquiries | `lib/demo/store.ts` + `lib/demo/scenario.ts` behind `lib/services/preview.ts` (`getBrowserPreviewService()`), typed by `lib/contracts/preview.ts` | preview contract (S1) |
| Admin console | sessionStorage `tnp-admin-console-v2` (`AdminState` version 2) | `portals/admin/adminData.ts` (types, seed, `quoteTotals`, `quoteFromRequest(request, id, today, rates)`, `earningLines`, `earnings` → `{earned, approved, awaitingApproval, paid, remaining}`, `approveEarning`, `collectionStatus`, `approveApplicant`; state has `approvals`, `attendanceLog`, `rateCard`, `rateRevisions`, `services`, `collections`, `log[{at,text,actor}]`). UI in `AdminConsole.tsx` + `AdminSections.tsx` (Attendance, Finance, Catalogue & rates, Audit log, …) |
| Admin search | — | `portals/admin/palette.ts` |
| Exports | built in browser | `portals/admin/exporters.ts` (`toXlsx`, `toPdf`, `safeText`, `crc32`, `zip`) |
| RSVP | localStorage `tnp-rsvp-chat-v4` | `portals/rsvp/rsvpChatData.ts`: types `RsvpEvent`, `GuestThread` (`contactName` = imported guest-list name used for `{name}`; `whatsappName` = profile name, display-only), `Message`, `Sender`, `TeamLogin`, `Broadcast`, `MediaItem`, `Group`; helpers `suggestFromMessage`, `checkCompliance`, `replaceTerm`, `personalize`, `fillTemplate`, `eventStats` |
| Public estimator | — | `public/team-estimate.ts` (`estimateTeam`, `encodeTeam`, `decodeTeam`) |
| Content | static | `data/tnp.ts`, `data/public-content.ts`, `data/media.ts` (Unsplash preview media, not client-approved) |

**Money is integer paise everywhere.** Keep it that way through the API and database.

### 2.4 Tests
Node's built-in runner with type stripping (`*.test.mjs`). Import TS modules with an explicit `.ts` extension; `.tsx` with JSX cannot be imported by the runner, so keep testable logic in `.ts` files. `tests/client-demo-m5.test.mjs` covers:
- genie geometry and timing;
- launcher wiring;
- admin rules (two-person approval order, live rate card, separate collections);
- exporters (a real xlsx ZIP header, PDF, formula guard);
- RSVP suggestion, compliance and personalisation (the imported name wins over the WhatsApp profile name);
- the estimator;
- the palette.

Browser verification was done with Playwright (`npx`-cached at `C:\Users\DELL\AppData\Local\npm-cache\_npx\…\playwright`); `tests/*.browser.mjs` exist but require `TNP_PLAYWRIGHT_MODULE`.

## 3. Domain invariants you must enforce server-side
These come from `docs/DOMAIN-RULES.md` and the ADRs. The UI only simulates them.

1. **Identity and tenancy.**
   - The server derives identity.
   - Roles: Main Admin (exactly one), scoped co-admins (capability list), TNP Planner (event/grant scoped), Freelancer, RSVP vendor organisation members (manager/operator/viewer, org-isolated), and public enquirers (no login).
   - A reference ID never grants access.
2. **Commerce.**
   - Every paid product starts as an order line.
   - Only Admin/Operations issue immutable `QuotationVersion`s and `FulfillmentGrant`s.
   - The requesting actor and billing organisation are explicit.
3. **Allocation.**
   - One allocation service handles both worker claims and admin assignment.
   - It enforces capacity (never overfill), overlapping-assignment reservation and eligibility.
   - Proof target: 20 concurrent requests on 10 slots → exactly 10; then 500 on 10 → exactly 10; duplicates are idempotent.
4. **Attendance.**
   - Attendance needs an eligible assignment, an authorised event-scoped coordinator, a valid event token and server evidence.
   - Missing, denied, low-accuracy and outside-radius GPS results stay distinct.
   - Corrections append (reason/actor/time) and never overwrite. The console already models this with `attendanceLog`.
   - A replacement for an absent worker goes through the same allocation service as the original assignment, with no bypass.
5. **Earnings and payouts.**
   - Earnings = verified attendance days × the day-rate snapshot.
   - One payable per worker per month.
   - Two approvals (coordinator, then finance).
   - Batches freeze before provider processing.
   - Idempotent provider attempts; reconcile before any retry.
   - Collections and payouts use separate ledgers.
   - Rates are revisioned with reason/actor. Quotations and earnings snapshot the rate at issue time.
6. **RSVP.**
   - WhatsApp messages only (no calls).
   - The original guest message is preserved as evidence; categorisation never overwrites it.
   - **Guest name source of truth.**
     - The name on the organiser's imported guest list is the only value used for `{name}` and template parameters.
     - The WhatsApp profile name from webhooks is stored separately, is display-only and must never be substituted into messages.
     - The phone number is the join key between an import row and the WhatsApp contact.
   - A person confirms ambiguous replies.
   - Travel, stay and pickup are collected information only (no booking, dispatch or payment).
   - Event-scoped reads and writes; the org-level dashboard aggregates counts only.
   - Guest ID documents are **not** collected live until a secure storage/retention/access lifecycle is approved.
7. **Exports.**
   - Re-apply tenant/event/role/column scope.
   - Redact secrets.
   - Neutralise spreadsheet formulas.
   - Use audited, expiring downloads.
8. **Audit.** Every approval, allocation change, rate, account decision, correction and money event is audited.

## 4. Target architecture (build this)

Follow `docs/ARCHITECTURE.md` "Production direction": **responsive web → versioned HTTPS API → modular Node monolith → MongoDB Atlas + private object storage → durable jobs and provider adapters.**

### 4.1 Backend layout (propose it in an ADR before coding)
- **Where it runs.** The recommendation is Nitro server routes in this repo (`server/` already exists) under `/api/v1/*`, deployed with the Vercel preset the build already uses. Record the choice in an ADR; a separate Express service is also acceptable if the ADR justifies it.
- **Modules** (one folder each, domain logic framework-free and unit-testable):
  - `identity`: users, sessions, roles, co-admin capabilities, RSVP org memberships.
  - `catalogue`: services, roles, rate card, media; revisioned.
  - `demand`: enquiries, client requests, order lines.
  - `commerce`: quotations (immutable versions), grants, invoices, collections.
  - `events`: events, functions, positions/assignments.
  - `allocation`: the single claim/assign service with a Mongo transaction plus a per-worker reservation document or unique index.
  - `attendance`: scan evidence, corrections.
  - `ratings`
  - `finance`: earnings, payables, payout batches, provider attempts, reconciliation.
  - `rsvp`: orgs, events, guests, threads, messages, broadcasts, senders, templates, media metadata, entitlements.
  - `notifications`: durable jobs, per-recipient idempotent delivery.
  - `exports`
  - `audit`
- **Auth.**
  - HttpOnly session cookies. Admin and RSVP staff sign in with email + OTP or a password with MFA; freelancers use phone OTP via a provider; the Main Admin bootstrap is an out-of-band seed.
  - Enforce capability checks per route.
  - Pick the auth approach in an ADR (DEC-13/DEC-14).
- **API conventions.**
  - Versioned `/api/v1`.
  - JSON with stable IDs, ISO timestamps with timezone, integer paise.
  - Cursor pagination; structured errors `{code, message, retryable}`.
  - An `Idempotency-Key` header on every mutation.
  - Optimistic concurrency via a `revision` field.
  - Typed DTOs shared with the frontend in `lib/contracts/`.
- **Mongo collections** (indicative). Add unique indexes where invariants demand them:
  - `users`, `memberships`, `capabilities`
  - `catalogueRevisions`, `rateCards`
  - `enquiries`, `clientRequests`, `orderLines`
  - `quotations` + `quotationVersions`, `grants`
  - `events`, `functions`, `positions`
  - `assignments` (unique: position + worker; reservation doc per worker and time window)
  - `attendanceEvidence`, `attendanceCorrections`, `ratings`
  - `earnings` (unique: assignment + day), `payables` (unique: worker + month), `payoutBatches`, `providerAttempts`
  - `collections`
  - `rsvpOrgs`, `rsvpEvents`, `rsvpGuests`, `rsvpThreads`, `rsvpMessages` (immutable), `rsvpBroadcasts`, `rsvpSenders`, `rsvpTemplates`, `rsvpMedia`
  - `jobs`, `auditLog`
- **Jobs.** Use a durable job collection with leases and retries; dead-letter entries are visible to admins. Jobs cover reminders and reconfirmations (DEC-26), notification fan-out, WhatsApp sends, export generation and payout processing.
- **Object storage.** Private bucket (S3-compatible). Signed short-lived URLs. RSVP media stored only after the document policy is approved.

### 4.2 WhatsApp / RSVP integration (after the business decisions — DEC-01/22/29)
Use the **WhatsApp Business Platform Cloud API** (Meta), directly or via an official Business Solution Provider (for example Gupshup, Interakt, AiSensy or Twilio; decide in an ADR on cost, template tooling and India data handling).
- **Senders.** Each vendor/team number is registered to the WhatsApp Business Account (display-name approval, OTP verification). This maps the UI's `Sender` plus "Add number" onto a real registration flow; **a browser must never call Meta directly**.
- **Templates.** Categories are Utility / Marketing / Authentication, with server-side submission and status tracking.
  - Keep the frontend wording assistant (`checkCompliance`) as a pre-submit lint, but treat Meta's decision as authoritative.
  - Marketing sends require recorded opt-in.
- **Flows.** Use WhatsApp Flows for structured RSVP collection (function-wise attendance, party size, travel/stay/pickup). This replaces free-text parsing where possible.
- **Inbound messages.** A webhook receiver verifies the signature and stores every inbound message immutably. It runs `suggestFromMessage`-style categorisation as a **suggestion**, and a human confirms in the UI.
- **Media.** Downloaded server-side, virus-scanned, stored privately, with retention/erasure per policy.
- **Personalisation.** `{name}`-style variables become template parameters rendered per recipient server-side.
- **Multi-user.** Several org members can be signed in the same day. Each outbound message records `senderId` and `actorUserId`; per-user sender choice is a preference, validated against org membership.

### 4.3 Payouts (after DEC-12/28)
Use Razorpay (RazorpayX Payouts) only through server adapters:
- beneficiary onboarding;
- a batch freeze;
- maker/checker approval;
- idempotent attempt keys;
- webhook plus reconciliation.

Nothing in the browser holds provider keys. Until activation, finance screens stay "recorded as disbursed (sample)".

### 4.4 Frontend migration pattern
For each module, replace the local store with a typed client in `lib/services/` that implements the same interface as today's preview service, then flip the implementation behind one factory:
- `AdminConsole` `update()` → API mutations;
- RSVP `save()` → API mutations;
- `lib/demo/store.ts` → HTTP.

Keep the synthetic adapter for demos and tests. Every screen needs real loading, empty, error, retry and permission-denied states, and must drop its "sample" label only when the data is real.

## 5. Next development — prioritized backlog

Each item is a separately leased task with a fixed-SHA review.

**P0 — integrate and unblock (Days 6–8)**
1. **Review and integrate.** Independently review and integrate `claude/tnp-client-demo-m5`; record decisions on:
   - the 4-role demo launcher versus ADR-0008's two roles;
   - removal of the homepage cube;
   - removal of the hero pause control.
2. **Architecture ADRs.**
   - Backend placement (Nitro vs separate service), auth approach, Mongo schema and index plan, job runner, object storage.
   - Sequence: identity → catalogue/demand/commerce → events/allocation → attendance → finance → rsvp.
3. **Contracts.** `lib/contracts/api-v1.ts` DTOs, generated from or checked against the ADR; an OpenAPI document under `docs/contracts/`.

**P1 — production-integrated core (Days 6–13)**
4. **Identity and access.**
   - Real sign-in for Admin/co-admins, Planners, Freelancers and RSVP org members.
   - Replace `DemoAccess` with a server session and keep the demo mode behind a flag.
   - Main Admin protection (DEC-24).
5. **Demand → quote.**
   - Persist `/contact` enquiries (with `team` quantities) as client requests.
   - The admin quote maker creates immutable quotation versions.
   - A print-ready A4 quotation/invoice view (DESIGN: print CSS) replaces the text PDF.
6. **Events and allocation.**
   - Events, functions, positions, assignments.
   - One allocation service with the concurrency proofs (20→10, 500→10, duplicate-safe, overlap-safe).
   - Wire the admin "publish assignment / approve applicant" and the freelancer "apply/claim" screens.
7. **Attendance.**
   - Coordinator scan with event token and point-in-time location evidence (the GPS states stay distinct).
   - Append-only corrections.
   - Connect the existing admin Attendance page (it already has corrections with reason and history, and absent-worker replacement) to the API.
8. **Finance.**
   - Earnings from verified attendance days × the rate snapshot.
   - Monthly payables; two approvals; batch freeze.
   - The Finance page already has the UI: approval queue, awaiting/approved/paid/remaining, and the client collections ledger. Back it with real data, using real signed-in actors instead of the sample `COORDINATOR_ACTOR`/`FINANCE_ACTOR`.
   - Razorpay stays deactivated until DEC-28.
9. **Exports.** Server-side authorised XLSX (use a vetted library server-side) and PDF, audited and expiring. Keep the browser exporters only for demo mode.
10. **Audit log.**
    - Write it server-side on every sensitive mutation.
    - The admin viewer (Records → Audit log) and its export already exist; connect them to the API.
    - Also connect Catalogue & rates (rate revisions, service listing publish) so the public pages read published listings.

**P2 — RSVP product (Days 9–13, provider activation gated)**
11. **RSVP tenancy.**
    - Orgs, members, entitlements (active, grace read-only, suspended, expired).
    - The admin "RSVP access" page manages them.
12. **Messaging backbone.**
    - Inbound webhook and immutable messages.
    - Human-confirmed categorisation.
    - Broadcasts with per-recipient personalisation from the **imported guest-list name** (never the profile name).
    - Guest import (`name,phone,party,members,category`) with phone normalisation to E.164 and de-duplication.
    - Sender registration flow; template submission and status.
    - Everything runs in a sandbox until Meta approval.
13. **WhatsApp Flows** for structured collection. The Files page lists media metadata only until the document policy is approved.

**P3 — UX value (only before the Day-10 cosmetic freeze, or after release)**
14. **Client enquiry status.** Signed, expiring status links sent to the enquirer by email/WhatsApp (not browser-held references) showing: received → reviewing → quote shared → confirmed.
15. **Freelancer.**
    - Availability calendar.
    - Earnings statements per month (print view).
    - Reconfirmation prompts (T−2h/T−1h per DEC-02).
    - Profile image upload through the reviewed upload boundary.
16. **Admin.**
    - Saved filters.
    - Bulk approve with confirmation.
    - Notifications inbox fed by the jobs table.
    - Extend the Ctrl/Cmd+K palette with server search.
17. **Planner.** Grant-scoped venue and workforce assignment with allocation validation messages.
18. **Performance.**
    - Mobile Lighthouse above 80 on representative routes (median of 3 cold production runs).
    - Lazy-load three/r3f (now unused on home — remove it if nothing else needs it).
    - Image `srcset`.
19. **Accessibility pass.**
    - WCAG 2.2 AA on every workspace.
    - Focus order through GenieWindows.
    - Reduced-motion parity.
    - 200% zoom.

## 6. Engineering rules for your work
- **Diffs.** Keep changes small and reviewable. Do not bulk-format legacy files. Keep code within owned paths, and serialize shared files.
- **Testing.** Put domain logic in plain `.ts` with `node:test` coverage. Test concurrency and idempotency invariants against a real MongoDB (a replica set is needed for transactions). Keep the palette guard and the M5 tests green.
- **UI.**
  - Every text link uses `.link-glow`.
  - Buttons are clearly distinguishable at rest, with a light-gold hover, strong focus, and pressed/disabled/loading states.
  - Touch targets are at least 44 px.
  - Reuse `GenieWindow` for source-anchored windows.
  - No new brand colours outside the palette.
- **Security.** No secrets in the repo; environment config only. Validate at trust boundaries, rate-limit OTP and webhooks, and run CSRF protection on cookie sessions. Webhook signatures are mandatory. PII in logs must be redacted.
- **Every milestone reports:**
  - exact SHAs;
  - changed files;
  - commands and results;
  - browser evidence (1440/1100/390/320);
  - limitations;
  - a fixed-SHA handoff for independent review.

## 7. Open business decisions you must not assume
DEC-01 … DEC-31 in `docs/DOMAIN-RULES.md`. The ones blocking your backlog:
- RSVP categories and templates (DEC-01/22/29);
- reconfirmation windows (DEC-02/26);
- payable-day rules (DEC-04/21);
- rate precedence (DEC-05);
- payout policy (DEC-06/28);
- invoice entity and tax (DEC-09/15);
- hosting and auth (DEC-13);
- multi-role persons (DEC-14);
- co-admin presets (DEC-24);
- export formats (DEC-30).

Represent pending policy as labelled configuration, never as silent production authority. Ask Kartik and Anjaneya when a decision blocks you.

## 8. First response expected from you
1. The preflight record: host, cwd, branch, HEAD, remotes, worktrees, and your runtime model/effort as actually exposed.
2. The review verdict on `origin/main..claude/tnp-client-demo-m5` (prioritized findings; PASS or CHANGES REQUESTED).
3. A one-page architecture ADR draft (backend placement, auth, data model, jobs, storage, provider adapters) with the P0/P1 task breakdown, lease boundaries and a Day-by-Day schedule to 2026-10-07.

Then stop for Kartik's disposition before implementing.
