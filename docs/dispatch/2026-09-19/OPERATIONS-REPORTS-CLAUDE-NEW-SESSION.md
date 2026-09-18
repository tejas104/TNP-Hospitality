# Claude startup and execution packet — Operations Reports & Audit workspace

SESSION TYPE: NEW SESSION

DO NOT OPEN, CONTINUE, OR REUSE ANY PREVIOUS TNP SESSION. In particular, do not reuse the RSVP author session or any Freelancer/Client review session. Start one fresh Claude Code desktop session and remain in that session for this task.

## First response only — mandatory read-only identity preflight

Do not edit, create, delete, move, format, install, commit, push, start a server, bind a port, or create a worktree yet.

Return exactly this startup evidence to Kartik/P:

1. Actual Claude product/runtime and selected model as shown by the application. Request Claude Opus 5 with the highest practical coding/reasoning mode available, but report the real value rather than claiming the requested value.
2. Session/conversation ID and whether this is genuinely a new session.
3. Windows account/profile, computer name, current working directory and repository root.
4. `git rev-parse --show-toplevel`, `git rev-parse --abbrev-ref HEAD`, `git rev-parse HEAD`, `git status --short --branch`, and `git remote -v` from the base clone, read-only.
5. Confirmation that you will use only the isolated branch, worktree, port and paths supplied in the later activation message.
6. Confirmation that no previous TNP chat, scratchpad, task worktree, agent, implementation subagent, or untracked source will be reused.

Stop after this report. A candidate baseline is `e6b5bc1f619c78eac3da18b6c0bb6ffa1a54f490`, but it is not a launch SHA and must not be used to start work. P will verify current main, capacity and review appointments, commit the Ready contract, create/verify the isolated worktree, and reply with the exact `SOURCE_SHA`, `LAUNCH_SHA`, branch, worktree, port and exclusive writer lease. No P reply means no implementation authority.

---

## Task reserved after activation

Task: `TNP-OPERATIONS-REPORTS-CLAUDE-M2`

Outcome: replace the disabled Operations **Reports** destination with a polished, responsive, accessible, service-backed synthetic Reports & Audit workspace. It must help an operations lead understand staffing, verification, attendance exceptions and audit history without implying production authority, payment completion, profitability, provider delivery, or immutable server-generated reporting.

This is a frontend product task with difficult state/identity behavior. Use Claude's strengths in whole-surface information architecture, dense operational UX, clear copy, reusable view-model design and adversarial reasoning. The visual result should feel like a natural extension of the client-liked Operations composition: dark teal control rail, cream editorial heading, restrained champagne accents, light evidence cards, crisp hierarchy and compact phone behavior.

This packet deliberately separates attractive presentation from behavioral truth. A visually impressive page that derives the wrong record, keeps a stale response, exports a different dataset, fabricates a success state, or obscures synthetic limitations is a failure.

## Mandatory reading after activation, before the first source edit

Read completely:

- `AGENTS.md`
- `TNP-START-HERE.md`
- `docs/PRODUCT.md`
- `docs/DESIGN.md`
- `docs/DOMAIN-RULES.md`
- `docs/ARCHITECTURE.md`
- `docs/LAUNCH-PROTOCOL.md`
- `docs/REVIEW-CADENCE.md`
- the Ready task contract named by P
- `docs/contracts/S0-SHARED-UI.md`
- `docs/contracts/S1-PREVIEW-INTERFACES.md`
- `components/tnp/portals/operations/AdminOperations.tsx`
- `components/tnp/portals/operations/OperationsDecisionPanels.tsx`
- `components/tnp/portals/operations/operationsState.ts`
- both existing Operations test files
- the relevant types and query signatures in `lib/contracts/preview.ts`

Before editing, provide a short implementation map in the session:

- every proposed panel/metric/filter/export field;
- its exact contract type and `PreviewService` query source;
- the stable identity used to join/filter it;
- its empty/error/loading behavior;
- whether it is raw evidence, a derived count, or a labelled limitation;
- the exact owned file expected to implement it.

If any requested value cannot be derived from the frozen service contract, label it unavailable or stop and raise a prerequisite. Do not create a second fixture, shadow store, local business ledger, fake API, or component-local success receipt.

## Ownership after P activates the lease

Writable only:

- `components/tnp/portals/operations/**`

Expected implementation shape, which may be refined within the owned directory:

- edit `AdminOperations.tsx` only to load the already-supported queries, expose Reports in both desktop and compact navigation, and render the feature;
- edit `operationsState.ts` only for feature-local section/filter/selection helpers;
- edit `AdminOperations.module.css` only for Operations-local responsive styling and motion;
- add a focused `OperationsReports.tsx` rather than expanding one giant component;
- add a pure `operationsReportsState.ts` or similar view-model helper if useful;
- add focused Node tests and a task-local browser check/evidence file under the same owned directory.

Frozen:

- all RSVP, Client, Planner, Freelancer and public/homepage files;
- `app/**`, shared shell/navigation, `app/globals.css`, `components/tnp/shared/**` and `components/tnp/PortalPages.tsx`;
- `lib/contracts/**`, `lib/services/**`, `lib/demo/**`, shared tests and fixtures;
- package/lock/config/framework/hosting files;
- docs/status/lease registers from the builder branch;
- auth, API, database, providers, secrets, real personal data and production state.

If a frozen file appears necessary, stop and report the exact missing contract. Do not work around the boundary in component code.

## Product scope

### 1. Reports landing and trustworthy snapshot context

- Promote **Reports** from the disabled future list into the same real section system used by Overview, Events, Requirements, Verification and Attendance.
- The section must be reachable from the desktop rail and compact responsive navigation with correct `aria-current`, focus transfer and back/forward interaction behavior already used by the workspace.
- Show the current synthetic scenario/generation context and an explicit statement that the report is generated in-browser from the current preview snapshot.
- Include a clearly visible limitation: no production authorization, scheduled report, email delivery, immutable server archive, live tracking, tax/profitability calculation, payment execution or provider reconciliation is being performed.
- Use service results only. Never parse visible DOM text to calculate a report.

### 2. Operational overview

Derive a concise evidence dashboard from current service records, with labels that distinguish totals from decisions:

- functions/events by status;
- required positions and required headcount;
- active assignments and open capacity where derivable from `Position.quantity` and active assignment records;
- pending verification applications;
- attendance evidence totals split into recorded, GPS missing, GPS denied and outside radius;
- audit entry count and most recent recorded audit time;
- optional quote/collection/earning/payout status counts only if the frozen service exposes them cleanly and the copy explicitly says they are preview statuses, not money success.

Do not calculate profit, GST/TDS, balances due, worker net pay, payment success or business performance because client policy and production ledgers are not approved. A provider/reference field alone never means paid.

### 3. Linked report views

Provide at least three coherent views within Reports:

1. **Staffing coverage** — event/function rows linked by stable `eventId`, showing position types, required quantity, active assignment count and remaining capacity. Two events with similar names must never be merged. Selecting a function must show only that function's positions/assignments.
2. **Attendance & verification exceptions** — reasoned groups for pending applications and attendance evidence states. Keep GPS missing, GPS denied and outside radius distinct. Never render missing evidence as verified.
3. **Audit explorer** — filter/search by action, actor ID, entity ID and free text; preserve raw stable IDs alongside human labels. Audit records with the same action/reason but different IDs must remain individually addressable and exportable.

Views may use segmented controls, tabs or a master-detail layout. Choose the clearest mobile and keyboard behavior; do not add ornamental controls that do not alter the displayed dataset.

### 4. Filtering, selection and empty states

- Search/filter must operate on stable record fields and normalized text, not array position or display label alone.
- Event selection is by exact ID. When filters remove the selected event, reconcile to a valid visible ID or clear the detail explicitly; never leave stale detail behind.
- Preserve distinct zero-result states for “the scenario has no records” and “filters match no records.”
- Provide an obvious clear-filters action.
- Query loading, deterministic empty, deterministic error and retry states must be meaningful and accessible.
- Reset or generation change must invalidate old selection/export state and refresh from the new snapshot.
- Late async results from an earlier refresh must not overwrite a newer generation or selection.

### 5. Honest export

Add a user-initiated CSV export for the currently selected report view only if it can be implemented entirely inside the owned feature directory without new dependencies.

Export requirements:

- derive from the same typed view model currently rendered, never a separately recomputed approximation;
- include a clear synthetic-preview marker, current generation/snapshot context, stable IDs and relevant status/evidence fields;
- reflect active filters and selected function exactly;
- escape commas, quotes and line breaks correctly;
- use a deterministic column order and meaningful filename;
- do not include hidden records, unrelated events or real personal information;
- announce success only after Blob/URL/download preparation succeeds;
- if browser export preparation throws, show a recoverable error and do not claim download success;
- revoke object URLs and avoid accumulating resources;
- label CSV as a browser-generated preview export, not an official, signed, immutable or provider-delivered report.

PDF, email, scheduled exports, cloud storage and report history are unavailable and must remain visibly unavailable rather than simulated.

## Motion and visual quality

Make the surface feel modern and premium, but operational clarity wins over spectacle.

- Use short, purposeful panel/row transitions, filter-result transitions, restrained count emphasis and clear hover/focus feedback.
- Avoid continuous decorative motion, parallax, cursor-following effects, chart animation that delays reading, or animation of sensitive state changes as celebration.
- Honor `prefers-reduced-motion` live and in CSS. Reduced motion must remove nonessential transitions/spinners without hiding progress or status.
- Keep contrast at WCAG AA, targets at least 44px where practical, strong visible focus, semantic landmarks/headings, correctly associated labels and live-region announcements that do not become noisy.
- At 390×844, no clipped filters, off-screen tables, tiny horizontal hit targets or required precision scrolling. Convert dense rows to readable cards or allow a clearly labelled, keyboard-usable scroll region only when genuinely necessary.
- Preserve the existing Operations design language; do not restyle the whole portal, create global tokens, or introduce a second visual system.

## Failure-informed engineering protocol

The previous Claude RSVP task looked comprehensive but missed material identity changes and clearing known state. Prevent that class of mistake here with all of the following:

1. **Identity matrix before implementation.** For every join, filter, selection and export, write down the stable key. Display labels, row order and array indexes are never identities.
2. **Layered proof.** Test the pure view model, the React behavior and the real browser flow. A helper-unit pass is not browser proof; a screenshot is not interaction proof.
3. **Material-change tests.** Reorder source arrays, insert an unrelated record, use duplicate names/reasons and change selection while a query is pending. The same stable record must remain correct and a different record must not inherit its state.
4. **Clearing tests.** Clear filters, clear a selected event by filtering it out, reset the preview and move from populated to empty/error states. No obsolete detail, count, export content, success banner or selection may survive.
5. **Outcome truth.** A UI receipt must follow the actual service/browser result. Never infer success from starting an operation, constructing a filename, seeing a reference string, or changing local state.
6. **No false persistence.** Component state may hold ephemeral filter/view preferences only. It may not impersonate persisted report history, scheduled delivery, official approval or server audit.
7. **Current-context export.** The browser check must compare visible filtered rows and parsed CSV rows/IDs, not merely confirm that a download event fired.
8. **Race safety.** Force an older load to resolve after a newer reset/selection and prove it is ignored.
9. **Adversarial copy audit.** Search final UI text for `live`, `verified`, `approved`, `paid`, `sent`, `saved`, `official`, `secure`, `real-time` and similar terms; each use must be supported and scoped or rewritten.
10. **Stop on missing contracts.** Do not turn a contract gap into attractive fake functionality.

## Required automated tests

Add focused tests under the owned Operations directory covering at minimum:

- derived staffing counts with two similar-looking events and reordered input;
- selected-event reconciliation when filtered/removed;
- distinct missing/denied/outside/recorded attendance counts;
- audit filter identity with duplicate-looking action/reason rows;
- zero scenario records versus zero filter matches;
- CSV quoting and deterministic columns;
- CSV contains exactly the currently filtered stable IDs and excludes hidden IDs;
- a reset/generation change clears stale selection/export state;
- stale async result cannot overwrite the newer context;
- reduced-motion policy and navigation section registration where source-level checks are appropriate.

Retain and run the existing Operations and shared contract suites. Do not weaken, delete, skip or rewrite an existing assertion to make the task pass.

## Mandatory browser matrix

Use the exact activated SHA and dedicated browser profile/port. Exercise behavior, not only visual capture:

- 1440×900 desktop;
- 1100×900 compact threshold and the adjacent breakpoint side if relevant;
- 390×844 phone;
- mouse, touch-equivalent controls, Tab, Shift+Tab, Enter, Space and Escape where applicable;
- rail and compact navigation into/out of Reports with focus landing/return verified;
- each report view, filtering, clearing and event selection;
- duplicate-looking rows with identity checked through displayed IDs;
- CSV export parsed and compared to visible filtered record IDs;
- export failure surfaced without false success;
- loading, empty, error and retry;
- reset while Reports is open;
- forced slow/late query versus newer reset/selection;
- reduced motion;
- no horizontal page overflow, clipped focus, console error, hydration error or uncaught rejection.

Record reproducible steps and assertions. Screenshots are supporting evidence only.

## Commands and git discipline

After activation, verify initial `HEAD == LAUNCH_SHA`, clean status, `SOURCE_SHA` ancestry, dependency ancestry, three-file launch diff, correct branch/worktree and free reserved port before editing.

Run:

```text
npm ci
node --experimental-strip-types --test tests/preview-contract.test.mjs
node --experimental-strip-types --test components/tnp/portals/operations/*.test.mjs
npm run lint
npx --no-install tsc --noEmit
npm run build:vercel
git diff --check
```

Use only documented existing commands. Do not claim a nonexistent `npm test`, typecheck or E2E script. If the Windows Nitro output hits the documented `EBUSY` packaging lock, stop task-owned processes, verify the source is unchanged and retry once; report a repeated lock as an environmental limitation without changing code to mask it.

Commit only exact owned paths. Never use `git add .`. Create one meaningful checkpoint after the pure report/view-model/tests are green, then one final commit after UI/browser verification. Ordinary non-force push only to the branch P authorizes. Never merge/rebase/reset/clean, push main, deploy, publish, touch providers, or move a reviewed SHA.

## Completion handoff

Stop all task-owned browser/server processes and prove the port is free. Return:

- actual session/model/host/worktree/branch;
- `SOURCE_SHA`, `LAUNCH_SHA`, checkpoint SHA and final immutable SHA;
- local/remote equality and clean status;
- exact changed files;
- scope-diff output;
- exact automated commands/results including inherited warnings;
- browser matrix with behavioral assertions;
- CSV-visible-ID comparison evidence;
- screenshots/evidence paths if created outside tracked source;
- limitations and every deliberately unavailable capability;
- confirmation no real personal data/provider/production state was used.

Then pause. Claude-authored code requires a fresh independent Codex Sol/high fixed-SHA review for report/financial semantic integrity and Kartik's exact-SHA human acceptance before P-controlled integration. You may fix findings only after P records a bounded correction lease. No self-certification, main merge, deployment or production claim.
