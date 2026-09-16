# Preserve the approved TNP design

## Evidence
Source baseline 9d58061f2d36514ebc932fa94bb3dc90f4b97a97: components/tnp/HomeExperience.tsx, AppShell.tsx, PortalPages.tsx, TeamOrbit.tsx, app/globals.css and data/media.ts.
Public and /admin reference pages were opened on 2026-09-16. Operations desktop screenshot was visually inspected in-session; no screenshot file or immutable deployed commit was captured. Deployed SHA is unknown. Do not equate the URL with local HEAD.

## Preserve
Deep teal #084c49, dark teal #062b29, ivory #f5f1e7, champagne #bba879; existing Georgia display and Manrope/Inter system body stack.
Preserve public photography composition, editorial gallery and functioning motion. Preserve Operations dark sidebar, large cream heading, metrics, light verification cards and event-control panel composition.
Fix dense detail heading sizes selectively. Worker layouts should be compact and phone-friendly. Client discovery and the four-step wizard should retain a distinct editorial experience.
Use existing components/ui primitives when useful; do not replace the design system or delete apparently unused primitives speculatively.

## Shared ownership
S0 alone owns AppShell, global CSS, PortalPages extraction, shared helpers and route wiring. Then freeze those paths for parallel slices. Any further shared change is a serialized prerequisite.
Feature CSS is local to each extracted portal directory; do not race on globals.css.
S0 uses current styling; it does not implement all incomplete business workflows or redesign Operations.

## Truthful preview
Use a visible “Client review preview — sample data” label and explicit reset behavior.
Replace misleading geofence demonstration language with venue context/attendance exceptions in its assigned feature task. GPS missing and outside-radius are distinct. Decorative QR is a preview pass until a real attendance task is approved.
Ratings trigger review, not automatic permanent deactivation. Document counters and stock media must not imply approved launch behavior or supplied TNP assets.
No dead primary actions, unexplained placeholders or links to nonexistent destinations earn readiness credit.

## Evidence required per set
Record actual commit/origin, viewport (at least 1440x900 and 390x844), keyboard/focus result, primary journey, relevant states, refresh/reset and human review.
Capture before/after desktop/mobile evidence before shared extraction. Check reduced motion and navigation after anchor-to-Link repairs. Browser assertions must follow rendered behavior.
