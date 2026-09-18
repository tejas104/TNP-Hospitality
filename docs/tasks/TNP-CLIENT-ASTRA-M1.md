# TNP-CLIENT-ASTRA-M1 — Client and Planner visual frontend follow-up

Status: READY — sole writer `/root/b_astra_builder`, actual `gpt-6-astra` / high OLD SESSION `01a0b368-5c6d-7751-ae69-7565418d8cd6`, after startup at the exact launch commit carrying the 2026-09-18 Ready record.

Source: `6320cfaa654432cd734bc71eef375a36101afc9e`

Branch/worktree/port: `codex/tnp-client-astra-m1` / `D:\TNP-worktrees\TNP-CLIENT-ASTRA-M1` / `3106`

## Purpose

Use `gpt-6-astra` / high to materially refine the existing Client and Planner responsive interfaces while preserving the already integrated, tested synthetic booking, registration, requirement, quote and status behaviors. This is a visual/frontend milestone, not production API, authentication or database integration.

## Proposed ownership

- `components/tnp/portals/client/**`
- `components/tnp/portals/planner/**`
- narrowly scoped local helpers/tests within those two directories

Exact execution allowlist and two-prompt cadence: `docs/dispatch/2026-09-18/CLIENT-ASTRA-M1-EXECUTION.md`.

Freeze route glue, AppShell/global CSS, shared contracts/services/fixtures, homepage/public files, Operations/Freelancer/RSVP paths, packages, platform/provider configuration and all server behavior. Missing shared behavior must be escalated instead of recreated in components.

## Product and visual direction

- Preserve the four-step Client venue/planner/details/review journey, Client status/quote states, Planner registration/requirement entry and Planner list/detail/status behavior.
- Create a deliberate editorial Client discovery experience and a clearer professional Planner workspace using the established TNP ivory, deep-teal and champagne design language.
- Use purposeful local illustrative photography for venue discovery, planner identity/context and key narrative moments. Image slots must be typed, accessible, labelled illustrative and replaceable later through source metadata without a layout rewrite.
- Do not force decorative photography into dense forms, status tables or operational controls where it weakens comprehension.
- Use motion only for hierarchy, state feedback and spatial continuity; preserve keyboard use, reduced motion and stable touch/mobile browsing.
- Keep every preview truthfully labelled. No live booking, verification, payment, email, WhatsApp, provider or production persistence claim.

## Required states and checks

- Desktop `1440x900` and mobile `390x844`, no horizontal overflow or footer obstruction.
- Real keyboard order/activation, visible focus, correct headings/labels and WCAG AA contrast.
- Loading, empty, filtering, validation, pending, error/retry, success, stale version, refresh/restore and reset behavior remain correct.
- Two different booking/requirement records must preserve exact identity through list/detail/status views.
- Existing local-action, shared preview-contract and relevant regression tests; lint; explicit non-incremental TypeScript; Vercel build; diff check; browser console/hydration check.

## Launch gates

Ready conditions are satisfied by the launch record carrying this task update. The writer must verify the exact launch HEAD, clean isolated worktree, source ancestry, branch, port and allowlist before the first source edit. Platform/API work may be consumed only after its separately reviewed integration. Fresh external Claude and Kartik review the immutable final. No main merge/push, deployment or provider mutation is implied.
