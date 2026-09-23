# TNP-CLIENT-DEMO-M5 — integration handoff prompt (revision 2)

Revision 2 supersedes the first handoff (`b03bdea`). It adds commit `15502c3`, which removes the old Operations desk, moves its useful rules into the admin console, and makes the imported guest-list name the only name RSVP messages use.

Paste everything below the line into the integrating session (Codex / GPT Sol 6 or a human integrator).

---

## Role and authority

You are the **integrator** for the TNP Hospitality frontend. Your job is to review, verify and integrate branch `claude/tnp-client-demo-m5` into `main` as the platform's main frontend. Follow `AGENTS.md`, `CLAUDE.md`, `docs/START-HERE.md`, `docs/LAUNCH-PROTOCOL.md` and `docs/REVIEW-CADENCE.md`. Codex reviews Claude-authored work; the author (Claude) must not self-approve. Kartik is the human acceptance owner. **Do not deploy, change providers, or touch production.** Push only what your task lease authorises.

## Exact source

| Item | Value |
|---|---|
| Repository | `https://github.com/tejas104/TNP-Hospitality` (local base clone `D:\TNP Hospitality`) |
| Branch | `claude/tnp-client-demo-m5` |
| Code tip | `15502c3bfdc0ba3e8df9a39a0cc8a04b83340e8d` (a docs-only commit carrying this file may sit on top) |
| Branch base on `main` | `e4fab8e2f9874a7d2df51a9bc55f3c33c2e86a66` — `main` has **not** moved since, so the branch is strictly ahead (fast-forwardable) |
| Author worktree | `D:\TNP-worktrees\TNP-CLIENT-DEMO-M5` (do not write in it) |
| Preview used during authoring | `http://localhost:3126` (`npm run dev -- --port 3126`) |

The branch carries **18 commits** over `main` (96 files, +17,011 / −4,459): 8 earlier frontend commits that were never merged (M3 portals/RSVP/finance review, hospitality cube, M4 client-demo) plus 10 M5 commits:

```
15502c3 feat(demo): fold Operations desk into the admin console; RSVP uses guest-list names
b03bdea docs: M5 integration handoff and GPT Sol 6 architecture prompt (revision 1)
5e5e118 feat: team estimator, admin search and RSVP setup guide
a335519 feat: link glow, porters, RSVP numbers and assistant
1137be5 feat: pinned events gallery, workflow, genie switcher
b341ec7 feat: admin console, WhatsApp-style RSVP and moving hero
b67cd06 fix: hide genie window scrollbar and keep page from shifting
e14211c feat: bento admin, brighter hovers and livelier public pages
58213c9 feat: slow genie open to half speed
8f88f51 feat: polish demo workspaces with genie windows
-- earlier, not yet on main --
d5dcd4b feat: refine demo workspaces
bc0d070 feat: open synthetic client demo frontend
be78ffa fix: remove stale public portal promotion
43dbc19 fix: keep hospitality cube controls reachable on mobile
51539dc feat: present illustrated hospitality service cube
c41db1c feat: add hospitality cube interaction foundation
8062b5a Expand portal previews, financial review and message-only RSVP
5c96af4 feat: unify public enquiries and two-role workspace access
```

## Preflight (record the output)

```powershell
git fetch origin
git rev-parse origin/claude/tnp-client-demo-m5          # expect 15502c3… or a docs commit on top of it
git merge-base --is-ancestor origin/main origin/claude/tnp-client-demo-m5; $LASTEXITCODE   # expect 0
git log --oneline origin/main..origin/claude/tnp-client-demo-m5
git diff --stat origin/main...origin/claude/tnp-client-demo-m5 | Select-Object -Last 1
```

Create a **detached, clean review worktree** at the exact tip (e.g. `D:\TNP-review\TNP-CLIENT-DEMO-M5-<sha7>`), `npm ci`, and review there. Never review a moving branch.

## Required checks (run in the review worktree)

```powershell
npm ci
$tests = git ls-files '*.test.mjs'
node --experimental-strip-types --test $tests          # expect 138 pass, 0 fail (lower than rev 1's 159 because the Operations desk and its tests were deleted)
npm run lint                                            # only the inherited hooks/use-mobile.ts warning is expected
npx --no-install tsc --noEmit --incremental false       # expect exit 0
npm run build:vercel                                    # see note on EBUSY below
git diff --check origin/main...HEAD
```

**Build note:** on this Windows host `npm run build:vercel` intermittently fails with `EBUSY: resource busy or locked, copyfile …node_modules…` during the nf3 trace step (file locks from dev servers/antivirus). It is environmental; retry until exit 0 and record the attempt count. A real compile error will fail every attempt with a different message.

**Dev-server note:** Vite occasionally served a stale `app/globals.css` after rapid edits. If a new global rule seems missing, `touch app/globals.css` and hard-refresh.

## What changed (review map)

### Global / shell
- `app/globals.css`
  - multicolour arrow cursor site-wide; the circular spectrum cursor and its component were removed from `components/tnp/AppShell.tsx`.
  - `html, body { overflow-x: clip }` (was `hidden`) so `position: sticky` works.
  - bright interaction layer: hover gold `#ffe08a` replaced dull cream `#fff5df` everywhere, nav underline, button glow.
  - `.link-glow` — left-to-right gold sweep on text links (**house rule: every text link uses it**; on teal set `--glow-base:#fff; --glow-hi:#ffd36a`).
  - 2 s launch preloader rendered from the server (`AppShell` `useState(true)`, CSS failsafe hides it after 6 s).
  - opt-out selector `main:not([data-own-controls])` so Admin and RSVP own their button styling.
  - `.genie-workspace-list` styles.
- `components/tnp/AppShell.tsx` — the workspace switcher now opens a **GenieWindow**; the Preloader shows on every first load.

### Genie window system (reusable)
- `components/tnp/public/portal-launcher/motion.ts` — pure geometry: `genieSlices`, `genieAxis`, `cubicBezier`, `LAUNCHER_TIMING {open:1440, close:1240}`, `GENIE_EASE`.
- `components/tnp/public/portal-launcher/PortalLauncher.tsx` — exports `GenieWindow({sourceRef, open, onClose, title, label, align?})` (modal `<dialog>`, sliced-strip deformation from the source element, rAF + timer fallback, focus in/out, Escape/backdrop, reduced-motion fade) and the side-dock launcher (portalled to `<body>` because the header is transformed).
- Used by: the launcher, the Freelancer page menu, the workspace switcher, the admin freelancer profile, the admin command palette and RSVP "Add number".

### Public site
- `components/tnp/HomeExperience.tsx`:
  - hero cube replaced by a moving photo background (`.heroBackdrop`).
  - Services hover-to-open (90 ms intent, lock after change).
  - pinned horizontal events gallery (`PinnedFilmstrip.tsx`, 10 photos, 1:1 scroll scrub).
  - interactive 4-step workflow (`ProcessWorkflow.tsx`).
  - destinations scroll/auto/hover motion.
  - "Estimate your team" link.
- `components/tnp/public/HomeHero.tsx`, `PavilionScene.tsx` and `hospitality-cube-motion.ts` are now **unused by the homepage** but kept, because tests reference them. Decide whether to delete them in a follow-up (see limitations).
- `PublicOverviewPage.tsx` + `OverviewExtras.tsx` — sample context (stats, steps, FAQ, occasion chips, destination season table) plus scroll reveal and hover on Services/Events/Destinations/RSVP.
- `TeamEstimator.tsx` + `team-estimate.ts` (tested) — on `/services`; "Send this team to TNP" opens `/contact?interest=event-request&occasion=…&guests=…&team=Role:n,…`.
- `app/contact/page.tsx` + `EnquiryForm.tsx` — decode the `team` parameter (unknown roles and bad numbers are dropped) to pre-fill the workforce quantities; the receipt now shows "What happens next".
- `data/tnp.ts`, `data/public-content.ts` — **Porter** added to the services (item 05), people roles, Planner and Freelancer role lists.

### Workspaces
- **Planner** (`portals/planner/PlannerEventStudio.*`) — neumorphic event "window" cards, inline validation, submitted state; `PlannerPortal.tsx` role list.
- **Freelancer** (`portals/freelancer/FreelancerPortal.*`) — in-flow sticky workspace bar, sample wallet, genie glass page menu.
- **Admin** — the only admin surface is the console at **`/operations`** (`portals/admin/*`). It has two glass designs (A ivory / B teal). Its sections:
  - **Daily work:**
    - Dashboard. Its to-do list includes earnings awaiting approval, approved-but-unpaid payouts, and money still to collect from clients.
    - Events & assignments: publish an assignment; approve applicants without overfilling.
    - **Attendance:**
      - The first mark saves directly.
      - Changing an existing mark needs a reason of at least 5 characters. It is appended to `attendanceLog` with actor and time, and the original is never overwritten.
      - Each event shows its correction history.
      - On an event that is not finished, an **absent** freelancer can be **replaced** by an active freelancer with the same role who is not already on the event. The change is logged; no message is sent.
    - Freelancer applications: approve or reject.
    - Freelancers & ratings: profiles open in a genie window.
  - **Money:**
    - Quotations:
      - The quote maker starts from the client request using the **live rate card**.
      - It supports a discount and an adjustment, with PDF/XLSX export.
      - A ready quote can be marked **"Accepted (sample)"**.
    - **Finance & payouts:**
      - Every attended earning line needs **two approvals**: the event coordinator first, then finance, and finance must be a different person. `approveEarning` throws otherwise, and the error shows inline.
      - Payouts can only be recorded against approved-but-unpaid money: `remaining = approved − paid`.
      - The KPIs show Earned, Awaiting approval, Disbursed and Ready to pay.
      - The **Client collections** ledger for accepted quotes (total, received, outstanding, "Record") is kept separate from freelancer payouts.
  - **Setup & access:**
    - **Catalogue & rates:**
      - Changing a day rate needs a reason and creates a numbered `rateRevisions` entry.
      - New quotes use `state.rateCard`; quotes already issued keep their own line rates.
      - Public service listings have a publish/hide toggle and a starting price. This is sample only; the public site does not read it yet.
    - RSVP access: per-event grants and team logins.
    - Admins & co-admins: capabilities.
  - **Records:**
    - Reports: xlsx/pdf for every table, now including **Client collections** and **Audit log**.
    - **Audit log**: every change with actor and time, searchable. `update()` stamps `actor` on every entry.
  - Ctrl/Cmd+K command palette (`CommandPalette.tsx`, logic in `palette.ts`, tested). Its labels derive from the NAV, so the new sections are searchable.
  - Exporters: `portals/admin/exporters.ts` (dependency-free stored-ZIP XLSX + text PDF, formula-injection guard; tested).
  - Data model: `adminData.ts` holds `AdminState` **version 2** in sessionStorage key **`tnp-admin-console-v2`**. Older v1 state is ignored, so the app reseeds instead of crashing. It adds:
    - state fields `approvals`, `attendanceLog`, `rateCard`, `rateRevisions`, `services`, `collections`, and `log[].actor`;
    - helpers `earningLines`, `approveEarning`, `collectionStatus`, and `quoteFromRequest(…, rates)`;
    - sample actors `ACTOR`, `COORDINATOR_ACTOR` and `FINANCE_ACTOR`.
  - The seed adds a spare Hostess (`fl-11`) so replacement can be demonstrated. `QT-0007` is seeded as `ready` so it can be accepted.
- **Removed — the old Operations desk.** At the user's request ("I don't want that old dashboard to exist"):
  - The route `app/operations/desk/page.tsx` is deleted. `/operations/desk` now 404s, and nothing links to it.
  - Deleted from `components/tnp/portals/operations/`:
    - `AdminOperations.tsx` and `AdminOperations.module.css`
    - `OperationsDecisionPanels.tsx`
    - `OperationsReports.tsx`
    - `operationsReports.browser-check.js`
    - `operationsReportsState.ts` and `operationsReports.test.mjs`
    - `operationsState.ts` and `operationsState.test.mjs`
  - The `AdminOperations` export is removed from `components/tnp/PortalPages.tsx`.
  - Its useful rules now live in the console, as listed above: two-step approval, separate collections, attendance corrections, replacements, rate revisions and the audit log.
  - `lib/services/preview.ts` and `lib/demo/*` are untouched. `tests/operationsFlow.test.mjs` still covers them.
- **RSVP on WhatsApp** (`portals/rsvp/RsvpWorkspace.tsx`, `RsvpPanels.tsx`, `rsvpChatData.ts`, `RsvpChat.module.css`; `RsvpEntry.tsx` split out for `/rsvp/login`):
  - chat list, conversation bubbles and templates, guest info drawer.
  - human-confirmed reply suggestions.
  - multiple team logins per day, each with a sending number (Add number with WhatsApp requirements checklist, demo code 123456).
  - wording assistant blocking promotional words in Utility messages.
  - `{name}` per-guest personalisation. **Name source of truth:**
    - `{name}` always uses `contactName`, the name from the imported guest list: import "Raj" and the broadcast says "Hi Raj".
    - The guest's WhatsApp profile name (`whatsappName`) is display-only. It appears in the chat header and guest info as "shown for recognition only, never used in messages".
    - The guest-info field is labelled "Name from your guest list (used in messages)".
    - The Guests CSV import is now `name,phone,party,members,category`. The phone is validated at 10–16 digits and masked on display, and imported guests start with an empty `whatsappName`.
  - guest categories.
  - collected photos/documents (sample) and a Files page.
  - broadcasts, guests CSV import, reports, team & settings, Assistant page with a WhatsApp setup recommendation.
  - a "Get set up" checklist.
  - Data lives in localStorage **`tnp-rsvp-chat-v4`**. The bump from v3 happened because threads gained `whatsappName`. `rsvp-state.ts` remains for its existing tests.

### Tests touched
- `tests/client-demo-m5.test.mjs` (new) covers:
  - genie geometry and timing, and the launcher dock;
  - planner/admin/RSVP wiring;
  - admin rules, including `remaining = approved − paid`;
  - **admin approvals**: finance-before-coordinator and same-person approvals are rejected; the live rate card feeds `quoteFromRequest`; `collectionStatus` works; collections never change payouts;
  - exporters;
  - RSVP suggestions and compliance;
  - personalisation, including **"imported name wins over WhatsApp profile name"**;
  - the estimator and the palette;
  - that the Operations desk page no longer exists and that AdminConsole has no `operations/desk` link.
- `tests/brand-teal-palette.test.mjs`: the assertions on the deleted Operations desk file and its "interaction states" test were removed.
- `tests/frontend-completion-m3.test.mjs`: launcher timing now `{open:1440, close:1240}` (user direction).
- `components/tnp/public/hospitality-cube-motion.test.mjs`: cube timing 2200/900 (user direction; the cube is no longer rendered on the homepage).

## Browser acceptance (record viewport, result, screenshot)

At 1440×900, 1100×900, 390×844 and 320×844, with reduced motion also checked once:
1. **Home.**
   - The 2 s loader shows first.
   - The hero photos move.
   - The Workspaces dock sits at the right, vertically centred, and opens/closes with the genie effect; focus returns to it.
   - Services opens on hover and click.
   - The events gallery pins and travels 10 photos, then releases.
   - Workflow tabs respond to click, hover and arrow keys.
   - Text links glow.
   - There is no horizontal overflow.
2. **`/services`.** The estimator updates live. "Send this team" pre-fills `/contact`. The submitted receipt shows "What happens next".
3. **Planner.**
   - Add 3 Hostess + 4 Volunteer → total 7.
   - Submit.
   - A second event starts empty; the cards scroll to their events.
4. **Freelancer.** The menu opens as a glass genie; all 6 pages work; the wallet opens Earnings; focus returns.
5. **Admin `/operations`.**
   - Switch design A/B.
   - Approve an application.
   - Publish an assignment and approve an applicant (overfill is refused).
   - Make a quote, mark it ready, download PDF and XLSX (open both files).
   - **Attendance:**
     - Change an "appeared" mark to "late". A reason is required, and the entry appears in Correction history.
     - On the Mehta–Kapoor Wedding, click "Find replacement" for the absent hostess and pick Riya Sen. The row swaps.
   - **Finance:**
     - Try "Approve" under Finance before Coordinator; it is disabled.
     - Approve as coordinator, then as finance. The line leaves the list and "Ready to pay" rises.
     - Record a payout.
   - **Collections:**
     - In Quotations, "Mark accepted" on QT-0007.
     - In Finance, record ₹50,000 received. Outstanding drops, and over-payment is refused.
   - **Catalogue & rates:**
     - Change the Event Coordinator rate with a reason. "Revision 1" appears.
     - A new quote uses the new rate.
   - **Audit log:** entries show "Kavya Rao (Main admin)" with times, and search filters them.
   - `/operations/desk` returns 404.
   - Open a freelancer profile.
   - Ctrl+K "orbit" → Enter; Ctrl+K "audit" finds the Audit log.
   - Download "All reports · Excel" and confirm it includes the collections and audit sheets.
6. **RSVP `/rsvp/workspace`.**
   - The checklist shows.
   - Add a number (code 123456).
   - Switch "Signed in as".
   - In a chat, type a Utility message with "exclusive offer 20% off" → Send is blocked → apply fixes → send.
   - Ask for photo/ID, then simulate an upload → it appears in Files.
   - A broadcast preview shows a different first name per guest.
   - **Name source of truth:**
     - In Guests, import the default CSV row (`Raj,+91 90000 00001,Sample Mehra family,3,Family`).
     - Open Raj's chat: the composer placeholder reads "Message Raj", and guest info shows "WhatsApp profile name: not set".
     - On a seeded guest, the header shows the different WhatsApp profile name, yet broadcasts still use the guest-list name.
   - At 390×844 the bottom tab bar is used and the composer/send is not clipped.
7. **Console.** No page errors. Only the pre-existing single 404 resource request is known.

## Integration

After independent review passes and Kartik accepts:
- Prefer `git merge --ff-only origin/claude/tnp-client-demo-m5` onto `main` in a serialized integration checkout. If `main` has moved, do a normal reviewed merge instead; never force-push.
- Update `docs/STATUS.md` / `docs/LANES.md` only in the dispatcher's serialized docs task.
- Tag or record the integrated SHA.

## Known limitations (must stay truthful)

- **Everything is synthetic frontend.** There is no backend, auth, database, WhatsApp provider, payment or KYC.
  - Admin state is sessionStorage and RSVP state is localStorage.
  - Payouts, quotes, messages, broadcasts, number verification and uploads are simulated and labelled as such.
- **Public/demo access conflict.** `docs/PRODUCT.md`/ADR-0008 say the public launcher exposes only Planner and Freelancer. This demo exposes four roles (Planner, Freelancer, Admin/Operations, RSVP) per the user's temporary client-demo instruction; `demoWorkspaces` in `components/tnp/access/routes.ts` is the single switch to revert.
- **Homepage cube.** The homepage cube was removed at the user's request; the DESIGN.md cube exception is now superseded in practice. Record it as a decision or restore the cube.
- **Hero controls.** The hero auto-rotation pause control was removed at the user's request (WCAG 2.2.2 consideration); the photo slideshow respects reduced motion.
- **Wording assistant.** Its promotional-word list is TNP's own heuristic, not Meta policy; Meta can still re-categorise templates.
- **Documents.** ID documents are only demonstrated; real collection needs a secure storage/retention/access design first (DOMAIN-RULES).
- **Build.** EBUSY build flakiness on this host (environmental). The `15502c3` build passed on the second attempt.
- **Admin and old state.** The admin approvals, corrections, rate revisions and collections are browser-session samples. Actors are fixed sample names, not signed-in users. Real enforcement (different-person approval, append-only corrections, revisioned rates, separate ledgers) must be server-side. See DOMAIN-RULES and the GPT Sol 6 prompt.
- **Catalogue.** The service-listing toggle does not yet drive the public pages.
- **Verification of 15502c3.** Done at the pane's desktop width and at 375×812: there is no section overflow in any admin section, and no console errors. Wide admin tables now scroll inside their cards (`.stack > * { min-width: 0 }`). The 1100 and 320 widths were not re-run for this commit, so the reviewer should cover them.
