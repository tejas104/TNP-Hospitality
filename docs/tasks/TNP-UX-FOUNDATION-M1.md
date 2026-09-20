# TNP-UX-FOUNDATION-M1 — shared portal navigation, demo access and interaction foundation

Status: CORRECTED IMMUTABLE CANDIDATE WAITING SAME-CLAUDE RE-REVIEW — `gpt-5.6-luna` / low produced clean pushed remote-equal direct successor `bde9e6ba19e86da4476917de7693732251124e68` from reviewed `653da55991363f910dbeddc3773d55ee507f7491`, changing exactly PreviewControls and two focused UX tests. The mandatory safety warning is now outside the closed disclosure and browser-proven visible once at desktop, mobile and 200% zoom. Author and P verification pass; writer lease is closed. Same Claude session `0959ee97-bf48-4129-962d-3eab2fdf7b62`, then Kartik exact-successor acceptance and P-controlled integration remain mandatory.

Responsible product/visual owner and sole human fixed-SHA acceptance reviewer: Kartik for code acceptance; Anjaneya/client direction remains required for final content/assets. Author task `01a0bee6-65ab-73c2-a0c6-60eb83111347` is verified `gpt-6-astra` / medium on `DESKTOP-DL9FDM7`; its separate assigned profile/seat is user-operated context and is not independently exposed by runtime metadata. Fresh external Claude Opus 5/default-effort fixed-SHA review is appointed under Kartik on `DESKTOP-DL9FDM7` in a separate profile and detached clean `D:\TNP-review\TNP-UX-FOUNDATION-M1-CLAUDE` worktree; exact review session ID and runtime evidence must be recorded before review begins. Reserved branch/worktree/port are `codex/tnp-ux-foundation-m1`, `D:\TNP-worktrees\TNP-UX-FOUNDATION-M1` and `3118`.

Mode: responsive synthetic frontend foundation. This task does not implement production authentication, authorization, persistence, providers, finance rules, database changes or the homepage redesign.

Canonical requirements: `docs/UX-COMPLETION-BRIEF.md`, `docs/CLIENT-WISPR-INSPIRED-REDESIGN-BRIEF.md`, `docs/DESIGN.md`, `docs/PRODUCT.md`, `docs/decisions/CLIENT-DECISIONS.md`.

## Ready launch contract — 2026-09-20

- SOURCE_SHA: `d8fe3ec39c5d8d9fe540e384529688810c5b2973`, verified equal to `origin/main` before this Ready commit.
- LAUNCH_SHA: the full hash of the commit carrying this Ready contract; P must supply and verify it after commit creation. Do not substitute moving `main`.
- Integrated dependencies: Platform Foundation merge `8544a2a5a9fcff7eefc35bcde2430cf9e1ea3ba6`, public navigation/access merge `6320cfaa654432cd734bc71eef375a36101afc9e`, Client/Planner predecessor merge `9b80a4fefcd79168e1195bc02fdb115b35cd01d0`, Operations Reports merge `27eb3a6a12f8c7ac03f167d51dceaf8c389dc2b7`, Freelancer merge `0de845955c153735680dffe5c513e9202801eb6a`, Brand Teal merge `b56ad987735a8a3ad909c35ede974a2e7353f8b3` and Brand Aggregate M2 merge `bb2297da4b72d032aac57322be0f319352a892cb`; all must remain ancestors of SOURCE_SHA.
- Exclusive writer reservation: task/session `01a0bee6-65ab-73c2-a0c6-60eb83111347`, verified `gpt-6-astra` / medium, DESKTOP-DL9FDM7, reserved at `2026-09-20T18:41:36+05:30`. Activation requires exact LAUNCH_SHA checkout proof and P's follow-up.
- Review-sharing authority: the author may ordinarily non-force push only `codex/tnp-ux-foundation-m1`. P may push this metadata-only Ready commit to `main` under the user's launch authority. No force-push, merge, deployment or provider/production authority.
- Risk: shared navigation, route/session state, focus management and overlay behavior have broad frontend regression risk. This remains synthetic preview work and must not imply production authentication or authorization.
- Review gate: fresh appointed Claude fixed-SHA review, then Kartik exact-SHA acceptance, then P-controlled integration. The author cannot self-certify.

Initial launch proof must show worktree HEAD equals LAUNCH_SHA, SOURCE_SHA is its ancestor, every dependency above is an ancestor of SOURCE_SHA, and `SOURCE_SHA..LAUNCH_SHA` changes only this task plus `docs/STATUS.md` and `docs/LANES.md`.

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
- new locally served open-source font asset `public/fonts/InterVariable.woff2`
- font license record `public/fonts/INTER-OFL.txt`
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
13. Remove the fixed right-edge semicircle portal dial on every workspace route. Replace it with an explicit header-level current-workspace pill and compact click/keyboard-opened popover on desktop plus safe-area-aware mobile sheet/menu treatment. No hover auto-open, content overlap, duplicate route list or preview controls inside the switcher. Escape closes and returns focus; all destinations come from the typed route manifest.
14. Establish a locally served, license-recorded Inter variable product/UI font plus semantic typography tokens for shared access/workspace surfaces. Use sans-first hierarchy for navigation, forms, actions, workspace titles, status and numerals; keep Georgia only as a sparse editorial/public accent. Do not use proprietary competitor fonts or bulk-edit frozen portal-local styles. The final handoff must enumerate remaining portal-owned Georgia/mono migrations for their next milestones.

## Required checks

- focused route-manifest, surface-classifier, session parser/storage fallback, navigation uniqueness, reset-scope and cursor-mount tests;
- every existing public/shared/portal contract test affected by the aggregate source;
- lint, explicit non-incremental TypeScript, Vercel build and diff check;
- real-browser matrix from `docs/UX-COMPLETION-BRIEF.md`, including two-tab identity isolation, Back/Forward, keyboard/touch/reduced-motion, 200% zoom, overlay clearance and console/hydration review.

One immutable final commit and fresh Claude/Kartik review precede P-controlled integration. No main push, deployment or provider mutation.

## Claude finding and bounded correction lease — 2026-09-20

Fresh Claude review reproduced the candidate provenance, scope, 128/128 tests, lint/TypeScript, 16/16 browser scenarios and eventual unchanged-source build. Its sole blocking P2 finding is that the mandatory synthetic-data safety sentence is nested inside the closed `<details>` disclosure in `PreviewControls` and is therefore not visible at rest on data-entry routes. The separate homepage destination-label mismatch is assigned to the later public/access milestone; dead exports/CSS, thin forced-colors assertions and a non-reproducing Suspense placeholder are non-blocking and excluded from this correction.

Correction baseline is exact `653da55991363f910dbeddc3773d55ee507f7491`. Existing branch/worktree/port remain `codex/tnp-ux-foundation-m1`, `D:\TNP-worktrees\TNP-UX-FOUNDATION-M1`, and `3118` with fallback `3218`. Existing task/session `01a0bee6-65ab-73c2-a0c6-60eb83111347` is reassigned to `gpt-5.6-luna` / low for this small correction; it must report actual runtime metadata and exact clean checkout/remote/port proof before editing.

Exact writable paths are only:

- `components/tnp/shared/PreviewControls.tsx`
- `tests/ux-foundation.test.mjs`
- `tests/ux-foundation.browser.mjs`

Make the warning visible outside the collapsible content while preserving the compact scenario/reset disclosure, semantics, accessible naming, focus behavior, responsive clearance and reset truth. Add focused proof for the closed state at desktop, 390px mobile and 200% zoom. All other application/test/assets/packages/docs are frozen in the feature worktree. Return one clean ordinarily pushed immutable successor with direct parent `653da559...`; same-Claude focused fixed-SHA re-review, Kartik exact-SHA acceptance and P-controlled integration follow. Dispatch: `docs/dispatch/2026-09-20/UX-FOUNDATION-M1-PREVIEW-WARNING-CORRECTION.md`.

## Corrected immutable successor — 2026-09-20

- candidate: `bde9e6ba19e86da4476917de7693732251124e68`;
- direct parent: `653da55991363f910dbeddc3773d55ee507f7491`;
- branch and remote: `codex/tnp-ux-foundation-m1`, ordinarily pushed and verified remote-equal;
- exact delta: the three authorized correction paths only;
- author: focused 8/8, all tracked 129/129, browser 17/17 including closed warning at desktop/390px/200% zoom, lint with one inherited warning, TypeScript PASS, Vercel build PASS after one unchanged retry for transient Windows `EBUSY`, clean checkout and free ports3118/3218;
- P: remote equality, direct parent, exact scope, clean worktree, 129/129, lint, TypeScript and Vercel build PASS after one unchanged `EBUSY` retry independently reproduced.

Focused re-review packet: `docs/dispatch/2026-09-20/UX-FOUNDATION-M1-CLAUDE-FOCUSED-REREVIEW.md`. Same Claude session must return an exact-successor disposition before Kartik acceptance. No integration or next overlapping frontend lease yet.
