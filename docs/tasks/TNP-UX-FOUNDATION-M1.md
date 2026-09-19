# TNP-UX-FOUNDATION-M1 — shared portal navigation, demo access and interaction foundation

Status: DRAFT — no writer lease. Do not implement until the fixed-SHA Freelancer, corrected Operations Reports and Brand Teal candidates are reviewed, accepted and integrated, followed by an aggregate palette/regression check. The technically reviewed RSVP predecessor is no longer an integration prerequisite because its product scope was superseded; keep RSVP feature paths frozen and provide only the shared route/access adapter boundary consumed later by `TNP-RSVP-MESSAGE-ONLY-M2`.

Responsible product/visual owner and sole human fixed-SHA acceptance reviewer: Kartik for code acceptance; Anjaneya/client direction remains required for final content/assets. Proposed UI author: fresh verified `gpt-6-astra` / medium. Fresh external Claude fixed-SHA review follows Astra authorship. Actual identity/model/host/worktree/source/launch/port/review appointment are pending.

Mode: responsive synthetic frontend foundation. This task does not implement production authentication, authorization, persistence, providers, finance rules, database changes or the homepage redesign.

Canonical requirements: `docs/UX-COMPLETION-BRIEF.md`, `docs/DESIGN.md`, `docs/PRODUCT.md`, `docs/decisions/CLIENT-DECISIONS.md`.

## Result

Provide one predictable shared workspace shell in which every role has obvious navigation, a truthful named demo identity, visible action hierarchy, native cursor, compact non-obscuring demo chrome and reusable interaction/numeric/density/surface primitives. Redesign the flat workspace-access choices into modern raised interactive role cards and establish the orientation/next-action/attention composition consumed by later dashboards. Homepage behavior and design remain frozen except for proving the custom cursor still works there.

## Proposed exact ownership

- `components/tnp/AppShell.tsx`
- `app/globals.css`
- `data/tnp.ts`
- `app/login/page.tsx`
- new canonical `app/operations/page.tsx`
- compatibility-only `app/admin/page.tsx`
- `components/tnp/public/WorkspaceAccess.tsx`
- `components/tnp/public/WorkspaceAccess.module.css`
- `components/tnp/public/WorkspaceDrawer.tsx`
- `components/tnp/public/access-content.ts`
- `components/tnp/shared/PreviewControls.tsx`
- new shared evidence component `components/tnp/shared/PartnerCard.tsx`
- new shared evidence styles `components/tnp/shared/PartnerCard.module.css`
- new shared access/navigation primitives under `components/tnp/access/**`
- focused tests beside those paths or under `tests/`

All portal-local feature directories, public homepage sections/3D, shared service/domain contracts/fixtures, server/API/provider code, packages/lockfiles and docs/registers are frozen for the builder. If a local portal adapter is required, stop and return the exact follow-up ownership rather than widening this task.

## Acceptance

1. Mount the multicolour custom cursor only on `/`. Navigating homepage -> portal -> homepage restores/removes body state correctly. Coarse pointer and reduced motion remain safe.
2. Replace binary public/nonpublic logic with explicit `marketing`, `access`, `workspace` and `guest-invitation` classification covering all accepted routes, including RSVP.
3. Use one typed route manifest for desktop/mobile navigation, portal switching, active state, transition labels and demo workspace catalogue. No duplicate or semantically false portal links.
4. Public shell presents one clear Workspaces link. Workspace shell presents Home, Workspaces, complete portal switching, active demo identity, Switch profile and Exit demo. Guest invitations never expose staff navigation.
5. Implement truthful named synthetic profile selection using tab-scoped session storage plus memory fallback. Do not request passwords or imply production auth. Direct workspace entry without a profile returns to the relevant chooser. Label the senior TNP Planner demo separately from a client-appointed planner, which remains a scoped Client-organization persona.
6. Provide an RSVP adapter boundary for organization-level and event-scoped routes without importing the superseded Calls/booking/allocation model. Preserve the Freelancer candidate's named profile matrix through a later feature-owned adapter. Corrected RSVP persona/event behavior remains feature-owned by `TNP-RSVP-MESSAGE-ONLY-M2`.
7. Switching/exit/reset semantics match the UX brief. Preview tools and warnings cannot cover task actions at required viewports; reset labels state their true scope.
8. Add semantic action, numeric, density and elevation/surface primitives with at least three proven shared consumers before abstraction. Primary/secondary/tertiary are distinguishable without hover; operational numbers use body-family tabular numerals. Follow `docs/contracts/UX-SURFACE-ELEVATION.md`; do not turn passive sections or dense records into decorative cards.
9. Canonicalize `/operations` while keeping `/admin` as a compatibility redirect until all references and browser tests are migrated.
10. Preserve all existing retry/generation/reset/domain behavior and truthful preview limitations.
11. Workspace access cards must group role name, truthful access state, outcome copy and action into one raised composition with resting affordance, responsive hover/focus/active feedback and reduced-motion parity. Shared dashboard primitives must support orientation, one dominant next action and compact attention queues without forcing every metric into a card.
12. The shared `PartnerCard` must support evidence-safe Venue and approved TNP Planner presentation: attributable or explicitly illustrative image metadata, robust missing-image fallback, name, location/specialty evidence, qualified capacity/price/availability/rating fields only when supplied, one selection action, loading/error/unavailable/selected states, keyboard/touch parity and reduced-motion behavior. It must not define domain eligibility, fabricate verification or own feature queries.

## Required checks

- focused route-manifest, surface-classifier, session parser/storage fallback, navigation uniqueness, reset-scope and cursor-mount tests;
- every existing public/shared/portal contract test affected by the aggregate source;
- lint, explicit non-incremental TypeScript, Vercel build and diff check;
- real-browser matrix from `docs/UX-COMPLETION-BRIEF.md`, including two-tab identity isolation, Back/Forward, keyboard/touch/reduced-motion, 200% zoom, overlay clearance and console/hydration review.

One immutable final commit and fresh Claude/Kartik review precede P-controlled integration. No main push, deployment or provider mutation.
