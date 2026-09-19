# Preserve the approved TNP design

## Latest user homepage direction (2026-09-17)
The user now requests homepage reorganization, retaining approximately75% of current images/removing25%, and a prominent3Danimated visual. This supersedes the older public-homepage composition/gallery preservation instructions below. Preserve brand colours/type identity and the separate Operations layout. Use a clear service hierarchy, one primary scene, measured performance, responsive layout, reduced-motion and WebGL fallbacks. See HOMEPAGE-REDESIGN-BRIEF.md for the proposed bounded milestone; no writer lease is granted by this note.

## Evidence
Source baseline 9d58061f2d36514ebc932fa94bb3dc90f4b97a97: components/tnp/HomeExperience.tsx, AppShell.tsx, PortalPages.tsx, TeamOrbit.tsx, app/globals.css and data/media.ts.
Public and /admin reference pages were opened on 2026-09-16. Operations desktop screenshot was visually inspected in-session; no screenshot file or immutable deployed commit was captured. Deployed SHA is unknown. Do not equate the URL with local HEAD.

## Preserve
Client-selected primary teal `#008080`, ivory `#f5f1e7` and champagne `#bba879`; existing Georgia display and Manrope/Inter system body stack. The 2026-09-19 client direction makes `#008080` both the semantic primary/action colour and the visible brand surface replacing former dark-green/dark-teal treatments across homepage and platform. Do not use `#062b29` or another green substitute as a brand surface. Use neutral charcoal/black for accessible text, shadow and image-overlay needs, and `#006b6b` only as the same-family hover/contrast variant. Migrate through shared tokens plus an audited literal sweep and regression guard.
Preserve public photography composition and editorial hierarchy while refining motion, transitions and the existing 3D language. Preserve the Operations sidebar, large cream heading, metrics, light verification cards and event-control composition inside the authenticated Operations workspace, but use the client-selected `#008080` teal for the former dark-green/dark-teal brand surfaces. On the public homepage, this visual language may inform a non-interactive "how TNP operates" story; do not surface the synthetic Operations preview or internal controls as public product content. All 3D/motion work needs reduced-motion behavior, mobile fallbacks and a non-WebGL fallback.
Fix dense detail heading sizes selectively. Worker layouts should be compact and phone-friendly. Client discovery and the four-step wizard should retain a distinct editorial experience.
Use existing components/ui primitives when useful; do not replace the design system or delete apparently unused primitives speculatively.

## Shared ownership
S0 alone owns AppShell, global CSS, PortalPages extraction, shared helpers and route wiring. Then freeze those paths for parallel slices. Any further shared change is a serialized prerequisite.
Feature CSS is local to each extracted portal directory; do not race on globals.css.
S0 uses current styling; it does not implement all incomplete business workflows or redesign Operations.

## Truthful preview
S0 adds this visible label: “Synthetic preview data. Do not enter real personal information. No live verification, tracking or payments.” S1 later supplies explicit reset controls as defined in its contract.
S0 performs the copy-only replacement of misleading live/geofence/verification/distance claims specified in S0-SHARED-UI.md; later feature tasks implement the actual preview workflows. GPS missing and outside-radius are distinct. Decorative QR is a preview pass until a real attendance task is approved.
Ratings trigger review, not automatic permanent deactivation. Document counters and stock media must not imply approved launch behavior or supplied TNP assets.
No dead primary actions, unexplained placeholders or links to nonexistent destinations earn readiness credit.

## Evidence required per set
Record actual commit/origin, viewport (at least 1440x900 and 390x844), keyboard/focus result, primary journey, relevant states, refresh/reset and human review.
Capture before/after desktop/mobile evidence before shared extraction. Check reduced motion and navigation after anchor-to-Link repairs. Browser assertions must follow rendered behavior.
