SESSION TYPE: OLD SESSION — 01a0b368-5c6d-7751-ae69-7565418d8cd6
DO NOT OPEN A NEW TNP ARCHITECT, REVIEWER OR DEVELOPER SESSION.

# TNP-B-M1 Astra public navigation, workspace access and primary teal

User direction supersedes the previous fixed review target before review/integration: client-selected primary colour is `#008080`; the public navbar must reveal more of the platform and its services; every visitor must be able to find the right audience page and then a clear workspace/login entry. Continue other non-3D frontend; final 3D stays last.

Writer: same verified `/root/b_astra_builder`, actual `gpt-6-astra` / high, DESKTOP-DL9FDM7.
Branch/worktree: `codex/tnp-b-m1` / `D:\TNP-worktrees\TNP-B-M1`.
SOURCE_SHA: clean pushed remote-equal `dda4ec682903aa56392b75a19d9a3c61b1137544`.
LAUNCH_SHA: this dispatch commit; P supplies its exact full hash after normal push.
Port3102: free after P stopped the prior preview; recheck before binding.

## Implement

1. Establish `#008080` as the shared semantic primary/teal action token in the existing global token block. Retain dark teal `#062b29`, ivory and champagne as supporting surfaces. Do not blindly replace every teal literal or flatten the premium dark/light hierarchy. Verify white text and visible focus/hover states meet contrast requirements.
2. Expand the public desktop/mobile navigation so the platform breadth is legible without overwhelming the header. Required destinations: Services, Events, Destinations, RSVP, People/Work with TNP and About, plus visible workspace/login access and the existing enquiry CTA. Every link must resolve to a real section/page and remain usable at 1440px, 1100px and 390px; group or collapse responsively rather than allowing overlap.
3. Turn the homepage side drawer into one coherent audience finder, visibly named `Your space` or equally explicit rather than generic `Explore`. External audience choices: Client, Planner, Freelancer and RSVP Partner. Remove public Operations-preview promotion. Give each row short explanatory copy and preserve hover, click/tap, Escape, outside-dismissal and focus-return behavior. Include a clear route to the shared access/login gateway.
4. Add a polished responsive `/login` frontend gateway that explains one shared TNP identity system and lets visitors choose Client, Planner, Freelancer or RSVP Partner access context. Because production authentication is not integrated, do not render a fake password form or claim login works. Current role actions may open clearly labelled synthetic Client/Planner/Freelancer previews or RSVP partner enquiry. State that secure production sign-in and TNP Staff access are provisioned separately/not enabled in this local preview. The route must be useful, not a dead placeholder, and must not publicly promote `/admin`.
5. Preserve the exact hero-only final-15% seam, destination motion/images, service disclosure, photography filmstrip, enquiry behavior, temporary 3D and all existing public/detail/portal routes. No final 3D work.

Owned only: `components/tnp/AppShell.tsx`, `app/globals.css` for the bounded nav/token/access styling, `components/tnp/public/WorkspaceDrawer.tsx`, new local public navigation/access helpers/components/styles/tests under `components/tnp/public/**`, and new `app/login/page.tsx`. Do not change HomeExperience/scene/hero unless a narrow anchor ID correction is essential; do not change existing portal components, shared services/contracts/fixtures, data/media, packages, platform/provider code or other routes.

## Notification scope boundary

Do not implement fake push notifications here. The source scope requires: event staffing publication notifies active eligible freelancers; assigned freelancers later receive configurable Coming/Not Coming confirmation prompts. Production delivery needs server-owned audience selection, durable idempotent jobs, retries/deduplication, device-token lifecycle and FCM/provider evidence. This public frontend task may describe capabilities truthfully but may not claim them live.

## Verification and handoff

Run existing public/shared/focused tests plus navigation/access tests, lint, explicit non-incremental TypeScript, Vercel build and source-range diff check. Browser-verify 1440x900, 1100x900 and 390x844: every navbar/mobile-menu link, side drawer mouse/keyboard/touch/dismissal, `/login` gateway, all role actions, focus visibility, `#008080` primary states, no overlap/overflow, no public Operations link, zero new console/hydration errors. Recheck existing homepage, contact, service/department, client/planner/freelancer/admin preview routes and hero/destination behaviors. Commit one immutable final, live-compare and normal non-force push only this branch, stop server/browser, report evidence and pause. No main integration/push, deployment, provider connection, real authentication or notification delivery.
