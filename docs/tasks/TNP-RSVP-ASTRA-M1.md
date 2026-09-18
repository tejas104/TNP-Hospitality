# TNP-RSVP-CLAUDE-M1 — RSVP synthetic customer and partner frontend

Status: ROUND-4 CHANGES REQUESTED — MINIMAL ADAPTER CORRECTION READY for the same sole writer `/root/rsvp_astra_refiner`, process `CODEX_THREAD_ID` `01a0b5da-a640-7d92-b88e-519d07dbe96f`, verified orchestrator configuration `gpt-6-astra` / medium on `DESKTOP-DL9FDM7`. Shell model/effort variables are unavailable and are not separate runtime evidence.

Round-3 candidate: `992b00d49ee1209e0289c2167fad5408318bd2e8`, clean and remote-equal on `codex/tnp-rsvp-claude-m1` in `D:\TNP-worktrees\TNP-RSVP-CLAUDE-M1`; port `3107` is free.

Fresh independent Sol/high fixed-SHA Round-3 disposition: `CHANGES REQUESTED` on `992b00d49ee1209e0289c2167fad5408318bd2e8`.

## Round-4 minimal adapter findings

Preserve all cleared work. Change only RSVP-local adapter/import identity behavior and focused tests/browser evidence for these two P1s:

1. Add a batch-scope material-identity reverse index independent of parser line number and parser-derived row key. The same normalized material row moved because blank lines or ordering change its line/key must conflict atomically and never append a duplicate. Preflight slot, parser key and stable material identity before any mutation. Preserve legitimate multi-member household grouping, exact replay, rejected/unresolved replay, operational failure retry, stable-reference skip and org/event/persona isolation.
2. Clearing an existing known arrival/departure answer to `null` (details later) must persist the cleared travel state, release/invalidate every active dependent pickup/drop plan and block assignment/dispatch until new details are supplied and the movement is replanned. No obsolete leg, vehicle, `planBasedOn` or dispatchable state may survive. Preserve the already-cleared non-null endpoint/mode/reference/time update path.

Required regressions must use actual `previewImport` parser output before and after an inserted blank line or reordering, plus Node/browser clearing-known-travel-to-null followed by attempted dispatch. No UI/design/motion changes.

## Round-3 final bounded findings

Preserve every cleared correction, UI, design and motion file. Change only RSVP-local adapter/logic/tests/browser evidence needed for these two remaining P1s:

1. Import identity must persist every first-seen non-operational outcome, including accepted, skipped, rejected and unresolved rows, and preflight atomically before any row mutation in both directions: scope+original row slot and scope+row key. A previously seen row moved to another slot must conflict even if material is identical; a previously rejected/unresolved identity with changed material must conflict. Exact same accepted/skipped outcome replays; exact same failed operational row may retry; a new batch with an existing stable guest reference safely skips. Preserve organization/event/persona isolation and household grouping without allowing slot/key bypass.
2. Existing travel-leg updates must persist normalized arrival origin and departure destination, not only time/mode/reference. Any material route change—origin, destination, mode, direction-related routing or time—must invalidate dependent pickup/drop movement plans atomically and require replan before dispatch, even when the timestamp is unchanged. Route identity must then use the persisted current endpoints.

Required new regression cases: accepted row moved slot; rejected short-phone row changed under same slot/key; unresolved row changed; exact rejected/unresolved replay; exact failed operational retry; arrival origin persistence; departure destination persistence; mode-only change with unchanged time forces replan; endpoint-only change with unchanged time forces replan; dispatch blocked until replan; route key reflects updated endpoints. No further visual change.

## Round-2 bounded findings

Preserve all cleared Round-1 corrections and design/motion work. Change only what is necessary for these two P1 invariants plus focused tests/browser evidence:

1. Scope import row receipts and party mappings to the complete logical action. Exact replay is allowed only when `{orgId, eventId, personaId, batchId, rowKey, full normalized material-row fingerprint}` matches. Same-scope changed phone, email, functions or party fields must return conflict and mutate nothing. Different event or organization must never reuse a receipt, reference or party mapping. Preserve exact failed-row retry, accepted-row replay and new-batch stable-reference skip behavior. A future shared batch identity requires a server-owned authorization contract; do not invent one here.
2. Derive vehicle route identity from normalized actual origin and destination plus direction/window, not coarse transport-mode labels. A true same route/window may aggregate passengers and must enforce total capacity. Flight versus train/bus, different same-mode origins/destinations or any other different route in the same window must reject overlap atomically. Different windows remain allowed. Preserve stale assignment/replan and illegal lifecycle rejection.

Required regression matrix: exact import replay; changed phone/email/functions/party material conflict; same-org different-event isolation; different-org/event isolation; failed-row retry; new-batch stable-reference skip; true-same-route capacity; flight/train; flight/bus; same-mode different endpoints; different-window allow; stale/illegal movement rejection. No additional visual redesign in Round 2.

## Required correction and refinement pass

Preserve the candidate's comprehensive RSVP behavior and truthful synthetic/provider-disabled boundary. Correct all six independent-review findings before polish:

1. Enforce vehicle assignment and movement lifecycle invariants inside the local adapter mutation boundary. Before any write, evaluate the selected transfers together with every active transfer already assigned to that vehicle in the same date/window. Reject overlap and aggregate capacity conflicts atomically, reject illegal movement transitions, and reject stale versions rather than overwriting newer state.
2. Enforce room occupancy and inventory atomically in proposal/reproposal. Reject a party above category maximum occupancy; reject exhausted category inventory while excluding that stay's existing hold where appropriate; require the current expected version before mutation.
3. Make generated report revisions immutable and truthful. Freeze exact rows, header, counts and scope signature at generation, or invalidate the revision and disable export whenever filters/scope change. Never export live changed rows under prior revision metadata.
4. When mobile drawer navigation changes section, suppress opener-focus restoration and move focus to the destination heading after close. Escape/cancel-only dismissal must still restore the opener.
5. Represent Calls list/detail selection in the `party` URL parameter so activation, refresh, deep links and browser Back/Forward resolve the same party without cross-event leakage.
6. Remove the infinite spinner rotation under `prefers-reduced-motion`; static icon plus progress text is sufficient.

Add focused regression tests for overlapping same-window vehicle assignments, aggregate vehicle capacity, illegal/stale movement transitions, room occupancy/inventory/reproposal/stale cases, frozen or invalidated report scope/export, Calls URL continuity, drawer navigation focus and reduced-motion CSS.

Then perform the user-requested bounded modern design/motion refinement across RSVP-owned screens. Keep the approved dark-teal/ivory/champagne TNP composition and calm editorial-operational hierarchy; do not rebuild it. Shorten the 320–390px event hero so the first useful status content appears sooner. Improve coherent surface depth, selected/changed state clarity, section/list-detail continuity, active navigation, hover/press/focus feedback, empty/loading/error transitions, drawers/dialogs and guest-step progress using the existing RSVP-local motion policy and CSS transform/opacity. No new dependency, WebGL, scroll hijacking, perpetual live effect, repeated full-table animation or motion that implies a provider send/server save. Coarse-pointer/save-data behavior and genuine reduced-motion parity are mandatory.

Writable paths remain only `app/rsvp/**` and `components/tnp/portals/rsvp/**`. Everything else stays frozen. Produce one immutable correction/refinement final on the existing feature branch, ordinary non-force push only after live comparison, then stop server/browser and return the lease. Fresh independent Sol fixed-SHA delta/regression review plus Kartik acceptance precede P-controlled integration.

Source: `435b62bb1f66e4c8090f3bf5e15b1fcad8d1b42d`

Branch/worktree/port: `codex/tnp-rsvp-claude-m1` / `D:\TNP-worktrees\TNP-RSVP-CLAUDE-M1` / `3107`

The commit carrying this Ready reservation is the LAUNCH_SHA supplied externally after commit creation. Initial worktree HEAD must equal that exact commit and Source must be its ancestor.

## Result

Build a comprehensive responsive synthetic frontend for both TNP-managed RSVP customers and vendor-operated RSVP partners. This is a presentation and interaction milestone that uses task-local typed sample records/adapters because the reviewed organization/tenant and RSVP service contracts are not yet integrated.

The frontend must label this boundary truthfully. It may demonstrate organization/event context and two similar-looking synthetic vendors, but it must not claim server-enforced tenant isolation, production authentication, durable persistence, WhatsApp delivery, private document handling, live inventory, or audit evidence. Those remain separate platform/RSVP contract and production gates.

## Sole writer and capacity

- Original writer: Claude Code desktop session `b9a9e46c-394a-4e30-836e-b07cf30f2276`, final `7fb677bb614422e0d7b5a64842b7533e09ec8a7d`; lease returned.
- Correction/refinement writer: `/root/rsvp_astra_refiner`, process `01a0b5da-a640-7d92-b88e-519d07dbe96f`.
- Verified orchestrator model/effort: `gpt-6-astra` / medium.
- Human operator/acceptance owner: Kartik.
- Host/profile: `DESKTOP-DL9FDM7` / `desktop-dl9fdm7\dell` under the user's separate Claude application account.
- The correction lease is exclusive to this agent and these paths. Do not open or reuse another TNP session.
- No source edit until P/dispatcher supplies the exact commit carrying this correction contract as `LAUNCH_CONTRACT_SHA`. Do not merge main into the feature branch.

## Writable paths

- `app/rsvp/**`
- `components/tnp/portals/rsvp/**`
- RSVP-local presentation helpers, typed synthetic records/adapters, styles and tests only within those directories

Everything else is frozen, including AppShell/global CSS, shared components/contracts/services/fixtures, Client, Planner, Freelancer, Operations, public/homepage files, packages/lockfiles, server/API/provider code and status/lease registers. Do not use the shared `PortalHero` unchanged because it exposes an Operations Demo link. Missing shared behavior is escalated, not recreated outside RSVP-owned paths.

## Prompt 1 — workspace and guest operations

- Local RSVP shell and truthful preview/access states.
- TNP-managed and vendor-operated organization/event context.
- Event/function overview with people and household counts kept separate.
- T-30 through post-event service calendar.
- Guest/party directory and master-detail profile.
- Search, combined filters, filtered-empty, loading, error, retry, stale, refresh and reset states.
- Manual entry and CSV import preview with row validation, duplicates, partial outcomes and stable retry identity.
- Conditional mobile guest response flow with independent per-function answers.
- Calling/follow-up queue with synthetic owner/outcome/timestamps.
- Purposeful replacement-ready imagery only outside dense operational tables.

## Prompt 2 — hospitality and provider-disabled completion

- Independent arrival/departure, pickup/drop, travel and self-drive presentation.
- Stay and rooming request/proposal/approval/allocation/communication distinctions.
- Template/campaign/message timelines labelled synthetic and provider-disabled.
- Separate business-verification, sender/display-name, template-approval, integration and UAT states; never promise approval timing.
- Document desk disabled by policy or sample metadata only; never collect/store real identity documents.
- Controlled report/export preview with scope, generated-at, revision and stale-report labelling.
- Two synthetic organization contexts, access suspended/expired/denied states and safe context clearing. This is presentation evidence only, not service/API isolation proof.
- Extensive purposeful motion, keyboard/touch behavior, reduced-motion equivalents and performance cleanup.

## Required microfeatures

- Needs-attention reasons, true-empty versus filtered-empty guidance, announced result counts and keyboard-removable filters.
- Persistent organization/event breadcrumb, exact plus friendly timestamps and updated-since-opened indicators.
- Before/after summaries for meaningful guest/logistics edits.
- Safe clipboard feedback, dirty/saved state, discard confirmation and one calm action-feedback region.
- Retry preserving entered data and request identity; explicit new-action versus retry-same-action behavior.
- Bulk-action preview with exact scope/count and mixed-outcome presentation.
- Two-record, two-event and two-organization selection isolation within the synthetic adapter.
- Event-day Today view, overdue follow-up ordering, changed-arrival dependency warnings and stale-report warnings.
- Image failure fallback, long-name/reference wrapping and optional RSVP-local density preference.

## Motion and visual direction

Use the existing TNP palette and typography: `#008080` semantic action teal, `#006b6b` hover, `#062b29` deep teal, `#f5f1e7` ivory, `#bba879` champagne, Georgia display headings and the existing body stack. Combine the Operations dark/cream workspace composition with the Client/Planner editorial ivory form language. Avoid generic gradient dashboards, glass-card piles, decorative photo walls or huge headings in dense tables.

Use maximum purposeful motion for hierarchy and feedback: workspace reveal, active navigation, bounded overview stagger, drawers/sheets, guest steps, filter chips, accordions, selection, pending/success feedback and changed-row emphasis. Prefer CSS opacity/transform; installed GSAP may be used only for meaningful sequencing. No new motion dependency, scroll hijacking, perpetual movement, repeated full-table animation, fake live-tracking motion or WebGL/3D. Implement `prefers-reduced-motion` from the start.

## Verification

Run actual relevant commands; do not invent npm scripts:

- `npm run lint`
- `npx --no-install tsc --noEmit --incremental false`
- focused `node --test` commands for RSVP-local and applicable shared regressions
- `npm run build:vercel`
- `git diff --check`

Verify `1440x900`, `1100x900`, `390x844`, narrow `320px`, both sides of changed breakpoints, real keyboard activation/focus, touch, reduced motion, loading/empty/error/retry/partial/stale/reset states, import replay, conditional guest steps, two synthetic organizations/events, image failure, contrast, overflow, footer/fixed-overlay obstruction, console and hydration.

A Windows Nitro `EBUSY` permits one unchanged retry only after stopping task-owned processes. Do not change source to mask it.

## Review and handoff

Make checked internal checkpoints, then one immutable final. Stage only exact owned paths. Compare the live feature ref before an ordinary non-force push. Stop the dedicated server/browser, confirm port 3107 is free, confirm a clean worktree and return the lease.

Report Source, Launch, checkpoint and final SHAs; every changed file; actual commands/results; browser evidence; and all synthetic/provider/security limitations.

Claude may not self-certify or merge. Fresh independent Codex `gpt-5.6-sol` / high reviews the exact final SHA in a detached worktree, with additional security/architecture review if the implementation crosses the approved local-only boundary. Kartik supplies the human fixed-SHA disposition. P/architect alone integrates after PASS and explicit merge authorization. No main push, deployment, provider connection or production mutation.
