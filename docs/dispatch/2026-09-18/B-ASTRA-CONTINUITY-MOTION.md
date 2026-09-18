SESSION TYPE: OLD SESSION — 01a0b368-5c6d-7751-ae69-7565418d8cd6
DO NOT OPEN A NEW TNP ARCHITECT, REVIEWER OR DEVELOPER SESSION.

# TNP-B-M1 Astra non-3D continuity and motion polish

User direction: proceed with non-3D frontend first. Add distinctive current motion to the Destinations composition, rename the fixed workspace trigger to **Explore** with a better discovery icon, add approximately 10% color blending between section endings and the next section, and retain purposeful replaceable illustrative images in all later frontend work. Final 3D stays last.

Writer: same verified `/root/b_astra_builder`, actual `gpt-6-astra` / high, DESKTOP-DL9FDM7.
Branch/worktree: `codex/tnp-b-m1` / `D:\TNP-worktrees\TNP-B-M1`.
SOURCE_SHA: clean pushed `b2e42e8a24d63adb0e110878ea93ae9305c48b5f`.
Canonical Prompt7 record: local-main `41405aefdfe23690e6a56a98799aaeeb91ca2e76`; read with `git show`, never merge it.
LAUNCH_SHA: this commit; P supplies its exact full hash after commit/push.
Port3102: free after P stopped the preview server; recheck before binding.

Read Prompt7 and the user's destination screenshot. Use the current WebKit/Chrome CSS scroll-driven guidance only as platform research: native view/scroll timelines are progressive enhancement and reduced motion is mandatory. Do not copy reference code/assets or add a motion dependency.

Implement an original TNP journey-of-place treatment for the six existing destination cards: fine itinerary connector/progress motif, modest masked image reveal/depth drift, settled place labels and refined hover/focus response. Photography remains primary; no scroll interception, root smooth-scroll forcing, large rotation, content hiding or focus movement. Touch/mobile and unsupported-timeline browsers keep natural complete browsing; reduced motion is static.

Change the fixed trigger's visible label to `Explore`, use `Compass` or an equally clear discovery icon, and give the button an accessible name that still says it opens TNP workspace previews. Use `Choose your TNP space` or equivalent as the drawer heading. Preserve all four links, warning and exact hover/click/tap/Escape/outside/focus-return behavior.

Apply continuous section surfaces: each major homepage section blends its final roughly 10% into the next section's base color, especially teal → ivory. Use CSS variables/background layers or pointer-events-none decoration that cannot obscure content/focus. Keep solid readable surfaces and AA contrast. This is a static color treatment under reduced motion too.

Owned only: `HomeExperience.tsx`, `Home.module.css`, `useHomeMotion.ts`, `WorkspaceDrawer.tsx`, `workspace-interaction.ts/.test.mjs` and new local motion helpers/tests under `components/tnp/public/**`. Freeze AppShell/global CSS, 3D scene/hero, routes, data/media, enquiry, packages, portals/platform/providers.

Run the existing 31 tests plus focused tests, lint, explicit non-incremental TypeScript, Vercel build and source-range diff check. Browser-verify 1440x900 and 390x844 destination entry/mid/exit, all six images/labels, section seams, mouse/keyboard/touch, Explore trigger/drawer, reduced motion, unsupported timeline fallback, all public links/routes, no overflow and zero new console/hydration errors. Capture screenshots.

Commit one immutable final, live-compare then normal non-force push only this branch, stop server/browser, report evidence and pause. No 3D changes, main merge/push, deployment or production claim.
