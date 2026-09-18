SESSION TYPE: OLD SESSION — 01a0b368-5c6d-7751-ae69-7565418d8cd6
DO NOT OPEN A NEW TNP WRITER, ARCHITECT OR REVIEWER SESSION.

# TNP-B-M1 — bounded Astra homepage art-direction correction

Status: READY for the same verified `/root/b_astra_builder`, actual `gpt-6-astra` / high, on DESKTOP-DL9FDM7.

- Worktree/branch: `D:\TNP-worktrees\TNP-B-M1` / `codex/tnp-b-m1`
- SOURCE_SHA: `6ef1f2ceeb5dcc097773ad7e1b8e8f92ab81cb23`
- LAUNCH_SHA: the commit carrying this file; P supplies its exact full SHA after commit
- Port: 3102, recheck before binding
- Review after correction: fresh external Claude fixed-SHA review, then Kartik as sole human reviewer

The user issued a later homepage direction after the prior fixed handoff, so `6ef1f2ce...` is not integration-ready. Preserve the completed service/detail/contact/enquiry work. Modify only:

- `components/tnp/HomeExperience.tsx`
- `components/tnp/public/HomeHero.tsx`
- `components/tnp/public/PavilionScene.tsx`
- `components/tnp/public/Home.module.css`
- `components/tnp/public/Public.module.css`
- narrowly scoped new motion helper/test files under `components/tnp/public/**`

All routes, AppShell, global CSS, data/content, enquiry implementation/tests, package files, platform/server code, other portal code and registers are frozen. Do not add a dependency.

Use [Recent/Godly](https://recent.design/) as reference for editorial scale, asymmetry, generous whitespace, typography, cinematic pacing and purposeful scroll storytelling. Use [Origin UI](https://www.originkit.dev/) as reference for polished micro-motion, shaders/particles and performance-aware interaction. Do not copy third-party source, paid components, assets or brand treatment.

Build one original TNP **Celebration Constellation**: a refined luminous canopy/chandelier-pavilion whose central venue form and orbiting guest, planner, vendor and operations nodes communicate multi-sided event orchestration. It must read as hospitality/event coordination rather than a generic sci-fi orb, dashboard globe, particle toy or literal building render. Use the existing TNP ink/ivory/brass language and restrained celebration accents; the still fallback must communicate the same concept.

Add multiple purposeful motion layers: staged hero copy/CTA reveal; restrained fine-pointer parallax; a scroll-progress journey line or equivalent that clarifies plan-to-celebration flow; section/image-mask reveals; staggered service/role cards; subtle card/CTA hover and focus motion; and a quiet closing-section transition. Prefer compositor-friendly transform/opacity work. Never scroll-jack, hide content pending animation, move focused controls, introduce layout shift, autoplay disorienting motion or add another canvas.

Retain exactly one canvas, capped DPR, modest geometry/draw calls, progressive mount, offscreen/background/manual pause, content-first first paint, and complete mobile/reduced-motion/WebGL-unavailable/thrown-initialization still fallbacks. Mobile must not run the heavy scene. All effects require static/reduced-motion equivalents and keyboard/touch usability.

Re-run and report the prior shared 15, WebGL 5 and enquiry 4 tests, any new motion guards, lint, explicit non-incremental TypeScript, Vercel build and diff check. Verify 1440x900 and 390x844, real keyboard, fine/coarse pointer behavior, reduced motion, manual/background/offscreen pause, forced WebGL failure, all public links/contact/enquiry regression, no overflow and zero console/runtime errors. Make one checked non-force final push after live remote comparison, then pause and return exact SHA/evidence. No main merge/push, deployment or provider operation.
