SESSION TYPE: OLD SESSION — 01a0b368-5c6d-7751-ae69-7565418d8cd6
DO NOT OPEN A NEW TNP ARCHITECT, REVIEWER OR DEVELOPER SESSION.

# TNP-B-M1 Astra hero-only seam correction

User finding against fixed Prompt7 SHA `117a9c1b64be7c4ca74f456a634a5aedff3bc4ed`: the section-continuity gradient must appear only at the end of the hero, cover the final approximately 15%, and be removed from every other section. Continue using the existing images and motion, and keep final 3D deferred.

Writer: same verified `/root/b_astra_builder`, actual `gpt-6-astra` / high, DESKTOP-DL9FDM7.
Branch/worktree: `codex/tnp-b-m1` / `D:\TNP-worktrees\TNP-B-M1`.
SOURCE_SHA: clean pushed remote-equal `117a9c1b64be7c4ca74f456a634a5aedff3bc4ed`.
LAUNCH_SHA: this dispatch commit; P supplies its exact full hash after normal push.
Port 3102: free after P stopped the user preview; recheck before binding.

Implement only this visual correction:

- Keep one continuity surface blend: dark-teal hero through 85%, then blend across the final 15% into the following ivory section.
- Remove the Prompt7 continuity-gradient treatment and related per-section surface declarations from intro, services, RSVP, events, destinations, process, people, final CTA and footer.
- Do not remove intentional image/3D lighting, masking or localized decorative gradients that are unrelated to section-to-section continuity.
- Preserve all Prompt7 destination motion, six destination images, Explore/Compass drawer behavior, routes, copy, reduced-motion/mobile/fallback behavior and current temporary 3D byte-for-byte unless an import cleanup is unavoidable outside the scene.
- Keep content and focus indicators above the hero blend and maintain readable contrast.

Owned only: `components/tnp/HomeExperience.tsx`, `components/tnp/public/Home.module.css`, `components/tnp/public/destination-motion.ts`, `components/tnp/public/destination-motion.test.mjs`, and `components/tnp/public/useHomeMotion.ts` only if cleanup is genuinely required. No portal, route, AppShell/global CSS, media/data, enquiry, package, platform/provider or 3D scene/hero implementation changes.

Run the existing public/shared/focused tests, lint, explicit non-incremental TypeScript, Vercel build and source-range diff check. Browser-verify 1440x900 and 390x844: hero final-15% transition, no continuity blends on later section seams, destination motion unchanged, Explore unchanged, no overflow and zero new console/hydration errors. Commit one immutable final, live-compare and normal non-force push only this branch, stop server/browser, report evidence and pause. No main integration, deployment or next-portal implementation in this correction.
