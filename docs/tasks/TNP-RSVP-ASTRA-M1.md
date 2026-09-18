# TNP-RSVP-CLAUDE-M1 — RSVP synthetic customer and partner frontend

Status: READY RESERVATION — Kartik explicitly selects fresh Claude Code desktop session `b9a9e46c-394a-4e30-836e-b07cf30f2276`, actual model `claude-opus-5`, on `DESKTOP-DL9FDM7` as the sole writer. The runtime does not expose an effort field; requested effort is high and must be confirmed from the application selector before the first source edit. The reservation activates only after the current Client/Planner writer is paused at a fixed handoff so one human does not supervise two complex active builders.

Source: `435b62bb1f66e4c8090f3bf5e15b1fcad8d1b42d`

Branch/worktree/port: `codex/tnp-rsvp-claude-m1` / `D:\TNP-worktrees\TNP-RSVP-CLAUDE-M1` / `3107`

The commit carrying this Ready reservation is the LAUNCH_SHA supplied externally after commit creation. Initial worktree HEAD must equal that exact commit and Source must be its ancestor.

## Result

Build a comprehensive responsive synthetic frontend for both TNP-managed RSVP customers and vendor-operated RSVP partners. This is a presentation and interaction milestone that uses task-local typed sample records/adapters because the reviewed organization/tenant and RSVP service contracts are not yet integrated.

The frontend must label this boundary truthfully. It may demonstrate organization/event context and two similar-looking synthetic vendors, but it must not claim server-enforced tenant isolation, production authentication, durable persistence, WhatsApp delivery, private document handling, live inventory, or audit evidence. Those remain separate platform/RSVP contract and production gates.

## Sole writer and capacity

- Writer: NEW Claude Code desktop session `b9a9e46c-394a-4e30-836e-b07cf30f2276`.
- Actual model: `claude-opus-5`; effort field unavailable to the session, requested high.
- Human operator/acceptance owner: Kartik.
- Host/profile: `DESKTOP-DL9FDM7` / `desktop-dl9fdm7\dell` under the user's separate Claude application account.
- The lease is exclusive to this session and these paths. Do not open or reuse another TNP session.
- No source edit until P/dispatcher confirms the Client/Planner writer is paused and records this RSVP reservation ACTIVE. Read-only preparation may continue meanwhile.

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
