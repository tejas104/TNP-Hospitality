# TNP-HOME-CUBE-M2 — existing-hero hospitality cube

Status: ROUND-2 CHANGES REQUESTED / AGGREGATE ROOT FIX — same Claude Opus 5 session `local_ded7975d-09ff-4ae0-9da9-8c06f0a1d72a` verifies the two-file contrast/test corrections and unchanged desktop cube at exact `0c480d73d518ba8e15ebab50ce3c43c1d2c5765a`, but proves a remaining 320px P1 caused by the fixed public workspace trigger. ADR-0008 now supersedes that trigger with a mobile-safe two-role launcher. Do not add another cube offset. Keep this candidate unintegrated and verify it only in the final aggregate staging candidate after the launcher replacement.

Requested author: task/session `01a0bf1e-e769-7bb1-b30e-b2cf0f5d431a`, verified from its recorded `turn_context` as `gpt-6-astra` / low (`Astra light`) on `DESKTOP-DL9FDM7`. Sole human fixed-SHA acceptance reviewer: Kartik. Fresh external Claude Opus fixed-SHA review follows Astra authorship. The author may not self-review.

Reserved branch/worktree/port: `codex/tnp-home-cube-m2`, `D:\TNP-worktrees\TNP-HOME-CUBE-M2`, port `3120`. Review worktree/port: detached `D:\TNP-review\TNP-HOME-CUBE-M2-CLAUDE`, port `3121` only if free.

## Launch contract

- SOURCE_SHA: `f1952eb2b7f8e309eba150e47b45d761b37511d9`, verified equal to live `origin/main` after the bounded design-decision record.
- LAUNCH_SHA: the full hash of the metadata-only commit containing this task plus `docs/STATUS.md` and `docs/LANES.md`; P must supply it after commit creation. Initial worktree HEAD must equal it.
- Existing UX Foundation candidate `653da55991363f910dbeddc3773d55ee507f7491` remains unintegrated and in fresh Claude review. This user-directed exception is safe only because its exact scene-local ownership does not overlap that candidate. It does not reopen another shared-shell or portal writer.
- Review-sharing authority: ordinary non-force push only to `codex/tnp-home-cube-m2`. No force push, main source push, deployment, provider or production authority.
- Requested integration remains gated by fresh independent Claude review and Kartik's later acceptance of the exact final SHA. A request to integrate does not pre-accept an unknown candidate.

## Result

Replace only the existing hero's right-side 3D centerpiece with a premium interactive solid illustrated hospitality cube. Preserve the current page and hero composition exactly: `#008080` teal surface, left copy, typography, CTA labels/actions, navbar, spacing, section transition and all non-hero content.

The transparent-canvas object uses a thin champagne-gold architectural frame, a localized diffused white halo behind it, subtle atmospheric contact reflection below it and a hollow golden connection core. It presents four spatial miniature service worlds:

1. **Venue** — tables, seating, floral/event elements, warm lighting, celebration/staff activity.
2. **Hire Workforce** — hostess-led welcome, waiters, volunteers, crew and check-in coordination.
3. **RSVP** — a coordinator with minimal spatial glass message/status panels, visibly illustrative sample counts and messages, never a giant phone or production WhatsApp claim.
4. **Hire Planner** — planner with tablet, staff/decorators and restrained task/path indicators showing coordination rather than live operational data.

The user's later video feedback supersedes the earlier low-poly/open-frame requirement: original illustrated service scenes may texture the solid cube faces so the object matches the substantial polished rotating-cube presentation, while the cube geometry, perspective, seams, halo and motion must still read as a coherent 3D object rather than a flat slideshow. No remote runtime assets or new dependency.

## Exact ownership

Existing files:

- `components/tnp/public/HomeHero.tsx`
- `components/tnp/public/PavilionScene.tsx`

New files only:

- `components/tnp/public/HospitalityCube.module.css`
- `components/tnp/public/HospitalityCubeFallback.tsx`
- `components/tnp/public/hospitality-cube-motion.ts`
- `components/tnp/public/hospitality-cube-motion.test.mjs`
- `public/images/hospitality-cube-worlds.webp`

The single WebP is an original four-quadrant texture atlas generated after the user's direct video feedback superseded the sparse open-frame miniature art direction. Quadrant order is Venue, Workforce, RSVP, Planner; the Planner quadrant must feature a clearly male lead planner, while Workforce and RSVP retain their distinct female leads. It may be derived only from the generated source recorded by P/author, not copied from video frames; retain illustrative provenance in the consuming UI. Optimize it from the generated PNG without adding a dependency or silently degrading legibility. No second image asset is authorized.

Every other path is frozen, including `components/tnp/public/Home.module.css`, `components/tnp/HomeExperience.tsx`, `components/tnp/public/useHomeMotion.ts`, `components/tnp/public/motion-policy.ts`, `components/tnp/public/webgl.ts`, AppShell/global CSS, routes, content/data/media, packages/lockfiles, all portals, server/platform/provider code and project registers. Stop and return an exact follow-up need rather than widening scope.

## Interaction and motion

- Default camera is a right-weighted elevated three-quarter view showing most of the active side, a sliver of the next side and some interior/top depth.
- Start on Venue. Hold each service for 4–5 seconds, rotate exactly 90 degrees in one consistent direction over 1.2–1.8 seconds with cinematic easing, hold again and loop. Never continuously spin.
- Fine-pointer horizontal drag and touch horizontal swipe pause auto rotation, allow inspection and resume after 5–7 seconds of inactivity from the current orientation without snapping.
- Preserve vertical page scrolling: use a horizontal-intent threshold and never capture ordinary vertical touch movement.
- Show only the active service title above the cube with a restrained fade/slide transition. Provide a compact keyboard-equivalent service selector with visible focus; the WebGL canvas remains decorative/aria-hidden.
- Keep gentle float, subtle internal character/light movement, limited golden particles and a small frame-to-side pulse. No bouncing, particle storm or gaming motion.
- Manual pause, offscreen/background suspension and live reduced-motion changes must freeze expensive animation predictably while preserving current orientation and controls.

## Visual and responsive constraints

- Do not change, overlay or approximate the existing hero background. The canvas stays transparent.
- The white halo is local, soft and naturally diffused; it must not become a visible disk, full-section gradient or new background.
- Use brushed/polished champagne gold, warm-white light and restrained amber highlights; avoid yellow-gold, neon, sci-fi HUD and excessive bloom.
- Desktop keeps existing left/right layout with the cube slightly right of center and breathing room. Tablet reduces scale. Mobile follows the existing stacked composition without horizontal overflow.
- Capable mobile may receive a simplified interactive tier at DPR <= 1; constrained or reduced-motion mobile receives the matching premium static three-quarter SVG/CSS fallback.
- Existing desktop DPR remains <= 1.5. Target <= 100 draw calls / 100k triangles desktop and <= 60 draw calls / 50k triangles mobile. Use shared geometry/materials and instancing; no real-time shadows or postprocessing.

## Required checks

- Focused unit tests for service order, 4–5 second holds, 1.2–1.8 second quarter turns, angle normalization, drag/swipe horizontal intent, inactivity resume, pause/suspension and reduced-motion/static policy.
- Existing public, WebGL, motion, enquiry, palette and link/route regressions; independently discover the relevant tests rather than hard-coding a stale count.
- `npm run lint`, `npx --no-install tsc --noEmit --incremental false`, `npm run build:vercel`, `git diff --check` and exact allowlist audit.
- Browser evidence at `1440x900`, `1100x900`, `390x844` and `320x844`: baseline/final hero comparison; all four service states; timing; drag; swipe; keyboard selector; inactivity resume; manual pause; background/offscreen; reduced motion; touch/coarse pointer; unavailable/thrown/context-lost WebGL; one canvas; transparent background; exact computed hero teal; unchanged text/CTAs/navbar/section geometry; no overflow, hydration or console error.
- Record bundle delta, renderer draw calls/triangles and an honest frame-time sample. Do not claim physical-device 60 FPS, Android/iOS Safari, Core Web Vitals or production readiness unless actually measured.

Checkpoint after the deterministic motion/controller/fallback foundation, then complete visual scene and browser evidence in the same lease. Push one immutable final candidate and stop. Fresh Claude review and Kartik exact-SHA acceptance precede P-controlled integration. No deployment.

## Immutable candidate — 2026-09-20

- final: `36e5b7938df7ff79aad4905b288f0348e3a67f1d`;
- chain: source `f1952eb2...` -> launch `b80d881...` -> checkpoint `97157d5e...` -> final;
- branch is clean, ordinarily pushed and remote-equal; cumulative delta is exactly the seven authorized paths;
- original 1254x1254 atlas WebP is 268,216 bytes with SHA-256 `b2d799252eed9daf74f1476d2f32a7aa0af30bad92ed95ccd87a83e96ae73020`; no reference-video pixels/logos/text were used;
- author reports 125/125 tracked tests, lint with three inherited warnings, explicit TypeScript, first-attempt build, four-viewport browser matrix and free ports3120/3220;
- P independently verified ancestry/scope/remote/clean state and rendered desktop/mobile/service faces, then reproduced 125/125, lint, TypeScript and first-attempt Vercel build.

Fresh review packet: `docs/dispatch/2026-09-20/HOME-CUBE-M2-CLAUDE-FIXED-SHA-REVIEW.md`. No integration or deployment before fresh Claude disposition and Kartik exact-SHA acceptance.

## Claude findings and bounded correction hold — 2026-09-20

Fresh Claude Opus 5 independently reproduced provenance, 125/125 tests, lint/TypeScript/diff checks and an eventual unchanged-source build. It verified exact `#008080`, one transparent canvas, 6 draw calls, 20 triangles, all four original illustrated service faces including the male Planner lead, 90-degree motion, 6.1-second inactivity resume, drag/touch behavior and static/WebGL failure fallbacks. The candidate remains blocked on:

1. At 390x844 the fixed workspace trigger intercepts the pause control; at 320x844 it intercepts the Planner selector and pause control and occludes disclaimer text.
2. `.sample` and `.number` composite to 3.90:1 and 3.64:1 on teal, below 4.5:1 for their 9px text.
3. The focused motion test compares behavior to imported timing constants, so mutations `4500 -> 4000`, `1500 -> 1200` and `6000 -> 5000` still pass.

Correction baseline is exact clean pushed remote-equal `36e5b7938df7ff79aad4905b288f0348e3a67f1d`. The later correction reuses task/session `01a0bf1e-e769-7bb1-b30e-b2cf0f5d431a` at verified `gpt-6-astra` / low, branch/worktree `codex/tnp-home-cube-m2` / `D:\TNP-worktrees\TNP-HOME-CUBE-M2`, and ports `3120`/`3220`. It is a reservation only until P explicitly activates it after the UX Foundation author lease closes.

Exact writable paths are only:

- `components/tnp/public/HospitalityCube.module.css`
- `components/tnp/public/hospitality-cube-motion.test.mjs`

The successor must keep all five 44px controls and the complete disclaimer pointer-visible and unobscured at 390x844 and 320x844, including hit-testing against the fixed workspace trigger; bring all cube text to at least 4.5:1 computed contrast; and assert exact literal timing contracts so each of the three reviewer mutations fails. Within those same files, consolidate the duplicate selector/pause rules, strengthen the focus-visible indicator against both teal and ivory and add the missing 1.25 vertical-bias boundary case if this can be done without widening behavior. All other code, asset, content, hero, shared shell, package and register paths are frozen in the feature worktree. Prepared dispatch: `docs/dispatch/2026-09-20/HOME-CUBE-M2-MOBILE-CONTRAST-TEST-CORRECTION.md`.

## Corrected immutable successor — 2026-09-20

- final: `0c480d73d518ba8e15ebab50ce3c43c1d2c5765a`;
- provenance: one direct-successor commit whose parent is exactly reviewed `36e5b7938df7ff79aad4905b288f0348e3a67f1d`;
- scope: exactly `components/tnp/public/HospitalityCube.module.css` and `components/tnp/public/hospitality-cube-motion.test.mjs`; branch is clean, ordinarily pushed and remote-equal;
- mobile evidence: at 390x844 and 320x844 all five 44px controls pass centre plus representative-edge hit testing, and the entire disclaimer passes three-point glyph hit testing without workspace-trigger interception;
- contrast evidence: actual composited `.sample` is 4.7734:1 and `.number` is 4.5831:1;
- regression evidence: literal `4500`, `1500` and `6000` timing mutations fail; `1.25 -> 1.0` and `1.25 -> 1.5` intent-bias mutations fail;
- author passes 8 focused, 51 relevant and 126/126 tracked tests, lint with three inherited warnings, TypeScript, Vercel build, exact diff/scope audit and four-viewport browser evidence;
- P independently confirms the exact ancestry/scope/remote/clean state, visually inspects 1440x900, 390x844 and 320x844 evidence, and reproduces 126/126, lint with the same three inherited warnings, TypeScript and first-attempt Vercel build;
- preserved limitation: the prior CDP lifecycle-freeze claim is not reproducible because that harness continued delivering animation frames. The actual hidden-document handler freezes for the measured 1200ms and offscreen suspension passes; no broader motion source was changed in this two-file correction. Software-rendered frame sampling is not physical-device/GPU evidence;
- separate observation outside this fixed two-file scope: the existing 320px header overlaps/clips the hero heading. It is not introduced by this correction and must be handled by a later homepage-specific task rather than silently widening this patch.

Focused same-reviewer packet: `docs/dispatch/2026-09-20/HOME-CUBE-M2-CLAUDE-CORRECTION-REREVIEW.md`. No integration, next H1/B writer or deployment before the reviewer disposition and Kartik exact-SHA acceptance.

## Same-Claude round-two disposition — 2026-09-20

- reviewer session: `local_ded7975d-09ff-4ae0-9da9-8c06f0a1d72a`, same Claude Opus 5 session as round one;
- exact SHA/provenance/scope: pass; all 126 tests, focused/relevant tests, lint, TypeScript, first-attempt Vercel build and diff/allowlist checks pass;
- contrast: `.number` and `.sample` both measured 4.77:1; exact timing and 1.25 intent mutants all fail;
- desktop/1100: one transparent canvas, 6 draw calls/20 triangles, unchanged hero/cube geometry and four illustrated faces pass;
- blocking P1: at 320x844, the fixed `.workspace-explorer` covers Planner and Pause during scrollY 30–90; at scrollY 50 a real tap on Pause opens the workspace drawer and leaves cube motion running. The obstruction was relocated rather than removed;
- P3 carried: cube title is about 4.45:1 at 19px/500 but unchanged from the parent; 320px header/hero overlap is unchanged and outside the cube delta; inherited warnings remain disclosed.

Disposition: `CHANGES REQUESTED`.

Resolution strategy: ADR-0008 removes the obsolete fixed public pill and replaces it with a two-role launcher that enters normal mobile layout rather than covering content. The cube stays unintegrated. After `TNP-FRONTEND-COMPLETION-M3` produces its final source candidate, P creates one isolated aggregate staging candidate containing both branches and requires a full independent review, including every scroll position at 320x844. No further scene-local offset correction is authorized unless the aggregate still fails without the old pill.
