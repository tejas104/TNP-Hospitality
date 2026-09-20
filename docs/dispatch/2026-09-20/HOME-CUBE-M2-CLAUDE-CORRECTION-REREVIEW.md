SESSION TYPE: OLD SESSION — resume the same Claude Opus 5 session that returned `CHANGES REQUESTED` on `36e5b7938df7ff79aad4905b288f0348e3a67f1d`. The prior report did not expose its session ID, so record the actual resumed session ID in the review report before reviewing. DO NOT OPEN A NEW CLAUDE SESSION AND DO NOT REUSE A DIFFERENT SESSION.

# TNP-HOME-CUBE-M2 — focused correction re-review

You are the same independent read-only reviewer. Review exact immutable successor `0c480d73d518ba8e15ebab50ce3c43c1d2c5765a` only. Its direct parent must be the exact candidate you previously reviewed, `36e5b7938df7ff79aad4905b288f0348e3a67f1d`.

Use a fresh detached review worktree. Do not edit, commit, push, merge, integrate main, deploy, or mutate providers/production. Treat repository evidence as authoritative. Preserve the base checkout's untracked `.claude/`, `output/` and `tmp/` trees without reading, moving, deleting or staging them.

## Required provenance and scope proof

Before behavioral review, prove and report:

- full HEAD and direct parent;
- branch/remote object availability and clean detached review worktree;
- `git rev-list --count 36e5b7938df7ff79aad4905b288f0348e3a67f1d..0c480d73d518ba8e15ebab50ce3c43c1d2c5765a` equals one;
- the exact successor delta contains only:
  - `components/tnp/public/HospitalityCube.module.css`
  - `components/tnp/public/hospitality-cube-motion.test.mjs`
- every other tracked blob, including the atlas, cube implementation, hero copy/layout, shared shell, routes, portals, package files and registers, is unchanged from the reviewed parent.

Stop with `CHANGES REQUESTED` if provenance or scope differs.

## Re-review the three blocking findings

1. **Mobile pointer reachability.** At both 390x844 and 320x844, verify all four service selectors and the pause/resume control are fully visible, retain 44px targets and are hit-testable at their centres and representative edges. Verify every disclaimer glyph is visible and representative glyph points resolve to the disclaimer rather than the fixed workspace trigger. Confirm `touch-action: pan-y`, safe-area handling and no horizontal overflow.
2. **Text contrast.** Measure actual composited contrast for `.sample` and `.number` against their rendered teal/background. Each must be at least 4.5:1. Do not accept source-token arithmetic alone.
3. **Load-bearing contracts.** Confirm the focused test asserts the exact literal contracts `HOLD_MS === 4500`, `TURN_MS === 1500` and `RESUME_MS === 6000`. Independently mutate each one to the previously forbidden values `4000`, `1000` and `3000`; every mutation must make the focused test fail, then restore the exact candidate.

Also verify the bounded P3 cleanup: duplicate selector/pause declarations are consolidated, focus-visible remains distinguishable against teal and ivory, and the `1.25` horizontal-intent factor is load-bearing at its exact boundary for both signs. Mutations `1.25 -> 1.0` and `1.25 -> 1.5` must fail.

## Regression and browser evidence

Run focused motion tests, independently discovered relevant public/WebGL/motion/enquiry/palette/link tests, all tracked tests, `npm run lint`, `npx --no-install tsc --noEmit --incremental false`, `npm run build:vercel`, `git diff --check` and the exact two-path allowlist audit.

Re-run the relevant four-viewport matrix at 1440x900, 1100x900, 390x844 and 320x844. Confirm the premium desktop composition and original four illustrated service faces remain intact; hero teal/copy/CTAs/navbar/section geometry are unchanged; selector, pause, keyboard, drag/swipe, inactivity resume, reduced motion, hidden-document handling, offscreen suspension, WebGL failure/fallback, one transparent canvas, 6 draw calls/20 triangles and no console/hydration errors still pass.

The author's earlier CDP lifecycle-freeze assertion was withdrawn because that CDP harness continued delivering animation frames. Do not require that invalid harness result. Instead assess the real hidden-document handler and offscreen behavior. Record software-frame samples honestly and do not claim physical-device/GPU performance, Core Web Vitals, production readiness or mobile-Safari/Android coverage without actual evidence.

Separately record—but do not charge to this exact two-file correction—the existing 320px header/hero-heading overlap visible in the evidence. That observation belongs to a later homepage-specific scope unless you prove this successor introduced or worsened it relative to `36e5b793...`.

## Required report

Return findings first in P0-P3 order with exact file/line evidence. Then report session ID, provenance/scope, commands and exact results, mobile hit testing, contrast numbers, mutation results, browser/fallback/performance evidence, inherited warnings and limitations.

End with exactly one disposition line:

`APPROVE FOR KARTIK FIXED-SHA ACCEPTANCE`

or

`CHANGES REQUESTED`
