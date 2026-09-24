# TNP client-demo M5 - independent fixed-SHA review

Date: 2026-09-24. Verdict: **CHANGES REQUESTED / do not integrate**.

## Identity and scope

- Candidate: Claude-authored `claude/tnp-client-demo-m5`, exact application code `15502c3bfdc0ba3e8df9a39a0cc8a04b83340e8d`. The subsequent branch tip `42ada80e0ef448e5262c6d7b18057bf28592dfb6` carries author handoff documentation, not a new application candidate.
- Review range: merge-base `e4fab8e2f9874a7d2df51a9bc55f3c33c2e86a66..15502c3`. Earlier frontend candidates `be78ffa` and `8062b5a` are ancestors, included in this one combined review.
- Independent reviewer: collaboration task `/root/m5_sol_review`, thread `01a0d429-6843-7bc1-8be6-295016aaaa64`, separate from the Claude author, on `DESKTOP-DL9FDM7`. The reviewer could not inspect runtime metadata during its turn; P later verified its own session JSONL `turn_context` in `C:\Users\DELL\.codex\sessions\2026\09\24\rollout-2026-09-24T21-34-38-01a0d429-6843-7bc1-8be6-295016aaaa64.jsonl` records actual `gpt-6-sol` / high. This is independent runtime evidence for the completed review.
- Review checkout: clean detached `D:\TNP-review\TNP-CLIENT-DEMO-M5-15502c3` at the exact code SHA. Review was read-only. Dispatcher P performed a separate supplemental in-app-browser observation; it is labelled below.
- Current main and live remote main: `831597573fe6898f8a19e5cf416d36a364c3544b`. Main is not an ancestor of this candidate; the author handoff's fast-forward assertion is stale.

## Findings

### P1 - Public workspace exposure conflicts with accepted ADR-0008

`components/tnp/access/routes.ts:21-49` places Admin/Operations and RSVP in `demoWorkspaces`. `components/tnp/public/portal-launcher/PortalLauncher.tsx:301` and `components/tnp/AppShell.tsx:235` render that four-entry collection to public visitors; `components/tnp/public/WorkspaceAccess.tsx:29` offers its demo profiles. The reviewer saw Planner, Freelancer, Admin/Operations and RSVP in the public dock at 1440, 390 and 320 pixels. ADR-0008 permits only Planner and Freelancer in the public launcher, keeps Operations internal and RSVP dedicated. Restrict public selection to the two permitted journeys, including the mobile menu and chooser, or record a superseding DEC-38 product decision before acceptance. The private routes also need a real server authority gate before production.

### P1 - Approved homepage cube is absent

`components/tnp/HomeExperience.tsx:86-87` uses a moving photo hero in place of the authorized prominent right-side hospitality cube; `components/tnp/public/Home.module.css:1516` animates the photos. The approved cube remains referenced in `docs/DESIGN.md` and the bounded homepage exception; retaining unused cube code/tests is not rendered behavior. Restore the approved scene or obtain an explicit DEC-38 disposition from Kartik/Anjaneya/client, followed by a new fixed-SHA review.

### P1 - Operations loses shared preview-service workflows and report provenance

At the baseline, `components/tnp/portals/operations/AdminOperations.tsx` read the shared preview service, attendance history and event passes, then used that service for attendance, correction, nonresponse, admin allocation and replacement; `OperationsReports.tsx` built staffing, exception and audit views from the same snapshot. M5 deletes that desk and its focused tests. `app/operations/page.tsx` now renders the new console, whose `components/tnp/portals/admin/AdminConsole.tsx:118-173` seeds separate sample `AdminState` and persists it in `sessionStorage`. The new admin tree contains no calls to those preview-service APIs. It recreates some concepts as independent synthetic state but loses the pass/evidence/exception workflow and consistent report source. `/operations/desk` returning 404 is consistent with the author's removal request; the capability loss still needs an explicit reviewed product/architecture disposition or restored service integration in the new composition. Remaining `operationsFlow` tests exercise an unused service, not the rendered `/operations` route.

### P2 - Planner section navigation has one destination for three labels

`components/tnp/portals/planner/PlannerPortal.tsx:913-915` points all three section links to `#planner-requirement`. The event studio also duplicates that id with a legacy form. Provide distinct targets or view-switching behavior and verify keyboard navigation.

### P2 - Mobile homepage labels are too small

The reviewer measured the hero eyebrow at 8px and foot labels at 7px at 390/320, with a 14px mobile lead; see `components/tnp/public/Home.module.css:1107`. Increase sizes within the responsive typography contract and recheck layout. The dispatcher independently observed 7-10px computed labels in the rendered in-app browser; the browser's actual viewport differed from its requested override, so the reviewer's exact-width Playwright measurements are authoritative.

## Verification and limits

- `$tests = git ls-files '*.test.mjs'; node --experimental-strip-types --test $tests`: 23 tracked test files, 138 passed, 0 failed.
- `npm run lint`: exit 0, inherited `hooks/use-mobile.ts` warning.
- `npx --no-install tsc --noEmit --incremental false`: exit 0.
- `git diff --check e4fab8e2f9874a7d2df51a9bc55f3c33c2e86a66..HEAD`: exit 0.
- `npm run build:vercel`: first attempt failed during Nitro tracing with `EBUSY` copying `content-type/package.json`; one unchanged retry passed. No source edit was used to bypass the error.
- HTTP: `/`, `/contact`, `/services`, `/planner`, `/freelancer`, `/operations` and `/rsvp/workspace` returned 200; `/client` redirected 307 to `/contact?interest=event-request`; `/operations/desk` returned 404.
- Reviewer Chrome/Playwright homepage smoke at 1440x900, 390x844 and 320x844: no page errors or document-width overflow; the four-item launcher opened, Escape closed it and focus returned to its trigger. It ran as an inline PowerShell here-string passed to `node --input-type=module -e $code`, importing the cached Playwright module at `C:\Users\DELL\AppData\Local\npm-cache\_npx\705bc6b22212b352\node_modules\playwright\index.mjs`. An initial `127.0.0.1:3237` attempt was refused because the server bound `localhost`; the successful run used `http://localhost:3237/`. No script artifact or screenshots were produced. The dispatcher separately saw the same four entries in the in-app browser and a rendered moving-photo hero.
- Not verified in this review: 1100px, full reduced-motion and keyboard/touch matrices, complete Planner/Admin/Freelancer/RSVP workflows, screenshots, and independent 19/19 screen-set evidence. Tests and this limited browser smoke do not establish production authentication, persistence, provider delivery or private-data security.
- Reviewer stopped its dev server and left the fixed checkout clean. No candidate source, main, provider or production state was changed.

## Disposition

Return findings to the original author under a bounded correction lease after DEC-38 decides the dock and hero. A corrected commit needs focused independent re-review, applicable aggregate browser evidence, and Kartik's exact-SHA acceptance. Integration must reconcile divergent main in a separately reviewed plan. The RSVP backend queue remains independent; no new writer lease is activated by this review report.
