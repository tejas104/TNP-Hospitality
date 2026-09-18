SESSION TYPE: OLD SESSION — 01a0b368-5c6d-7751-ae69-7565418d8cd6
DO NOT OPEN A NEW TNP ARCHITECT, REVIEWER OR DEVELOPER SESSION.

# TNP-B-M1 Astra visual-feedback correction

User authority: restore the client-liked public-homepage interactions from the five screenshots, retain the new localhost typography, use Godly/Recent and OriginKit only as design/motion references, use clearly fake/illustrative imagery until the real client assets arrive, and show the result on localhost before any main integration. The separate future 3D-motion prompt has not been supplied; do not implement it in this correction.

Writer: the same verified `/root/b_astra_builder`, actual `gpt-6-astra` / high, on DESKTOP-DL9FDM7.
Branch/worktree: `codex/tnp-b-m1` / `D:\TNP-worktrees\TNP-B-M1`.
SOURCE_SHA: `712610e17a0858e54d258b4e843210a169b5357b`.
Canonical Ready record: local-main commit `bab521844148146cfef1fea7e92cd1fbc7867828` in `docs/tasks/TNP-B-M1.md`, `docs/STATUS.md` and `docs/LANES.md`.
LAUNCH_SHA: this commit carrying the correction packet; P supplies its exact full hash after commit and push.
Port: 3102, verified free before packet creation; recheck before binding.
Human/product owner: Anjaneya. Sole human fixed-SHA reviewer: Kartik. Fresh external Claude fixed-SHA source/behavior review remains mandatory after handoff.

## Exact owned scope

- `components/tnp/AppShell.tsx`
- `app/globals.css`
- `components/tnp/HomeExperience.tsx`
- `components/tnp/public/Home.module.css`
- `components/tnp/public/useHomeMotion.ts`
- narrowly scoped new helper/test files under `components/tnp/public/**`

Everything else is read-only. In particular, freeze the Celebration Constellation scene/hero implementation, service/contact/detail routes, public content/data/media inventories, enquiry behavior, portal implementations, package/lockfiles, platform/auth/domain/provider code and all project registers. No dependency, provider, database, main, deployment or production mutation.

## Implement

1. Add a curved side-opening **Explore workspaces** control on the public homepage. Reuse the existing portal-switcher interaction where safe. It must link directly to Client `/client`, Planner `/planner`, Freelancer `/freelancer` and **Operations preview** `/admin`; keep the synthetic-preview warning and never imply production login/auth. Do not restore public PreviewControls or a generic public Login. Fine-pointer hover may open it, but click/tap must explicitly toggle it; Escape closes and returns focus, outside dismissal is safe, focus does not get lost, and mobile receives a usable sheet/drawer treatment.
2. Preserve the current editorial hero, font, palette and Celebration Constellation. Make it clear that Experience, Services, RSVP, Events and About are same-page section links, while the workspace items are page links. All anchors and direct route links must work.
3. Restore a scroll-responsive horizontal event/photo filmstrip inspired by the supplied first screenshot. It follows native vertical page scroll without hijacking it, keeps copy/controls readable, and uses only the existing clearly illustrative preview imagery. Touch/mobile uses swipe or scroll snap; reduced motion gets a static/readable fallback.
4. Enhance the services/roles disclosure inspired by the supplied second screenshot. Fine-pointer hover may preview a row, while click and Enter/Space establish stable selection for keyboard/touch. Content must not collapse just because the pointer leaves, focused controls must not move, and reduced motion remains complete.
5. Keep exactly one canvas, capped DPR, the existing pause policies and all mobile/reduced-motion/WebGL failure fallbacks. Add no second 3D scene and do not implement the unsupplied future 3D prompt.
6. Keep every temporary image/data state clearly labelled illustrative/synthetic. Do not claim client approval or supplied assets.

## Verify and hand off

Run the existing lint, explicit non-incremental TypeScript, 15 shared tests, 5 WebGL tests, 4 enquiry tests, 3 motion-policy tests, new focused tests, Vercel build and `git diff --check SOURCE_SHA..HEAD`. Verify at 1440x900 and 390x844 with real mouse hover, click/tap, native scrolling, Tab/Shift+Tab/Enter/Space/Escape, drawer focus return, all four direct portal links, all homepage anchors, mobile/touch filmstrip, reduced motion, WebGL fallback, zero horizontal overflow and zero new console/runtime errors.

Commit one immutable final, compare the live remote immediately before a normal non-force push, push only `codex/tnp-b-m1`, stop the server/browser and return the exact final SHA, changed files, command counts/results, browser evidence, limitations and actual runtime model/effort/session. Pause. Do not merge or integrate. P will run an independent localhost check before presenting it to the user, then obtain fresh Claude and Kartik dispositions.
