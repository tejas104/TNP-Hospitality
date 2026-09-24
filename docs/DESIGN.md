# Preserve the approved TNP design

## Draft two-theme direction (2026-09-24)

The user confirms Teal/Beige as the main default, using exact #008080, beige/ivory #f5f1e7, champagne #bba879 and restrained supporting accents. Gradient is a second selectable theme. Site-wide tokens across public pages and workspaces are the working scope; DEC-37 records final coverage, gradient stops and accent mapping before a Ready UI lease. Keep text and controls on solid contrast-safe surfaces, with gradients limited to large visual surfaces. Theme choice contains no personal information, applies before first paint, and respects keyboard focus and reduced motion. The older prohibition on a full-section gradient still governs the Teal default and the current approved hero until a reviewed Gradient-theme design explicitly changes that surface.

The Claude M5 client-demo branch currently shows four public dock choices and replaces the homepage cube. These are observed demo deviations, not accepted changes to ADR-0008 or the cube exception. DEC-38 requires product disposition before integrating M5.

## Platform usability direction (2026-09-19)

The platform now follows a task-first hierarchy. Keep the established TNP editorial character, `#008080`/ivory/champagne palette and restrained motion, but ensure each role sees current state, next action and navigation before secondary storytelling. The homepage is excluded from the 19/19 non-homepage completion metric and remains frozen outside the bounded cube task.

## Public access and launcher correction (2026-09-20)

ADR-0008 supersedes the Client-workspace and five-role public demo-switcher direction below. There is no Client login or Client portal. Clients use public information pages and `/contact`, whether they have a defined event need or simply want to speak with TNP. The public side launcher exposes only TNP Planner and Freelancer.

The launcher should feel like a refined desktop app transition adapted to the web: measure the initiating icon, expand a contained TNP window from that source, reveal content after the container establishes spatial context, and reverse to the same source on Close or Escape. Use transform and opacity, an immediate responsive start, controlled ease-out/in-out motion, focus management and an interruptible close. Desktop may use a subtle source-proximate side/dock affordance; mobile must move into normal header/layout flow so it never covers page content. Under `prefers-reduced-motion`, replace scale/travel/blur with an immediate or short opacity/state change. Do not copy Apple assets, traffic-light branding, proprietary symbols or exact macOS choreography.

Operations/Admin remains visually rich but internal. Remove `Operations Demo` and Operations from public marketing/access selection without deleting the internal workspace implementation. RSVP public actions remain informational/contact-led until its dedicated vendor access milestone is accepted.

## Client product-led redesign direction (2026-09-20 — superseded by ADR-0008)

The earlier redesign analysis remains useful as visual research for the public Contact/request experience, but its `/client` workspace and shared five-role switcher are no longer product requirements. See ADR-0008 and the superseded-status note in `CLIENT-WISPR-INSPIRED-REDESIGN-BRIEF.md`.

## Existing-hero hospitality cube exception (2026-09-20)

The homepage remains outside the non-homepage 90% program, but Kartik separately authorizes one bounded right-side hero-scene replacement. The current teal hero is the approved composition and must not be redesigned: retain exact `#008080`, left-side content, typography, actions, navbar, proportions and surrounding page. Add no card, panel, canvas fill or full-section gradient. The new transparent-canvas centerpiece is a champagne-gold hollow architectural cube with a diffused local white backlight and four miniature service worlds: Venue, Hire Workforce, RSVP and Hire Planner. Use premium present-rotate-present motion rather than continuous product spin; allow damped horizontal drag/swipe, resume after inactivity without snapping and preserve vertical page scrolling.

Each side must read through genuine low-poly spatial geometry, lighting, characters/objects and depth rather than flat face textures. The hollow center carries a restrained platform-connection constellation. Only the active service title is emphasized. RSVP messages and counts are illustrative; no production WhatsApp delivery or live operational state is implied. One canvas, capped DPR, bounded draw calls/triangles, no postprocessing bloom, no real-time shadows, offscreen/background suspension, reduced-motion and WebGL failure remain mandatory. Capable mobile may receive a simplified interactive tier; constrained/reduced-motion mobile receives a matching static three-quarter view without overflow.

## Non-homepage product typography and reference direction (2026-09-20)

The user now requires 100% frontend/UI completion for all non-homepage screen sets, using current category-leading products as reference points. Apply principles, not trade dress: Wise contributes functional clarity and confident action hierarchy; Wispr Flow contributes concise outcome-led copy, calm whitespace and friendly bold sans hierarchy; Miro and Linear contribute dense but legible navigation and workflow hierarchy; Tripleseat contributes hospitality inquiry/booking/task ownership; Cvent and Eventbrite contribute registration, check-in and reporting clarity; Paperless Post contributes elegant guest status, reminders and event detail grouping; When I Work and Deel contribute scheduling, attendance and payroll-state presentation; Stripe contributes financial lifecycle/status clarity. Do not copy competitor colours, assets, layouts, wording, motion signatures or proprietary fonts.

- Shared access/workspace UI uses a locally served, license-recorded open-source Inter variable font when verified, with `Noto Sans`, `Segoe UI`, system UI and sans-serif fallbacks. Never import or imitate proprietary Wise Sans.
- Define semantic product typography tokens for display, workspace title, section title, body, label, caption, button and tabular numerals. Prefer 400/500/600/700 weights, comfortable body leading and tight-but-readable headings.
- Georgia remains a sparse TNP editorial accent for short hospitality/public storytelling. It must not own dashboard titles, forms, tables, metrics, navigation, buttons, login/workspace cards or routine status copy.
- Access pages and dashboards use compact role orientation, one dominant next action, visible attention queues and polished loading/empty/error/disabled states. Typography must remain usable at 200% zoom and across current Android/iOS browsers.
- Shared foundation establishes tokens and shared consumers. Each later portal milestone migrates its own explicit font declarations and verifies hierarchy in its real workflows; no cross-portal bulk rewrite bypasses ownership.
- Every action must be visually identifiable before hover. Use shape, border/fill, label and spacing to distinguish controls from text. On hover-capable devices, apply a clearly visible light-colour hover surface with readable foreground contrast; provide equally strong `:focus-visible`, pressed, disabled and loading treatments, and never make hover the only affordance.

### Android, iOS, performance and print

- Treat current Android Chrome and iOS Safari as first-class responsive-web targets. Respect safe areas, dynamic viewport height, touch/virtual-keyboard behavior, 44px targets and reduced-motion/low-capability fallbacks.
- Representative production-like mobile routes must record Lighthouse performance above 80 (minimum passing integer score 81). Target accessibility and best practices >=90 where the category applies; public routes also retain useful SEO. Record the median of three comparable cold production-build runs with route/build/tool/profile evidence rather than one unrepeatable run.
- Keep Admin dense but not desktop-only: tables collapse into labelled records or horizontal regions with explicit affordances; primary task actions remain visible without covering content; filters use drawers/sheets with focus return.
- Invoice and payment-receipt views need dedicated A4 print CSS. Remove application chrome, preserve document identity/version and line-item readability, repeat table headers, control page breaks and show truthful draft/sample/void marks.
- The earlier Admin-only `gpt-6-astra` / medium assignment is superseded for the consolidated 2026-09-20 frontend tranche by Kartik's later instruction to use Astra light for complex frontend work. `TNP-FRONTEND-COMPLETION-M3` therefore uses the verified `gpt-6-astra` / low author after an exact Ready contract; this statement is not itself a writer lease and does not relax Admin security/finance truthfulness or review gates.

Kartik's accepted visual refinement requires a stronger modern product-dashboard layer across workspace entry and authenticated portals. Use semantic raised surfaces, soft neutral/teal-black shadows, visible resting borders, deliberate corner radii and responsive hover/focus/pressed/selected motion for genuinely actionable cards. Do not apply shadows to every section: passive copy, dense tables, routine forms and secondary metrics stay flatter so actionable depth remains meaningful. The exact reusable contract and adoption boundaries are in `contracts/UX-SURFACE-ELEVATION.md`.

### Shared interaction hierarchy

- Primary actions are visibly filled and labelled with a concrete verb. On ivory use teal; on teal use ivory with teal/neutral text. Secondary actions use a clear border; tertiary actions remain text links. Do not rely on hover alone.
- Interactive cards use either one card-wide button/link or an article with one explicit action; never create ambiguous nested click targets. Minimum target size is 44px with visible focus.
- Actionable cards are visibly raised at rest and may lift 3–5px on fine-pointer hover/focus without layout shift. Keyboard, touch and reduced-motion users receive equivalent state feedback without depending on transform animation.
- Workspace task titles are 24–32px and visually outrank step numbers/kickers. Supporting copy is 14–16px. Reserve very large Georgia display type for short introductions, never routine forms or dense tables.
- Operational numerals use the body type stack with `font-variant-numeric: tabular-nums`, normal tracking and readable labels. Avoid oversized serif, monospace or digital-dashboard treatments for counts, money, dates, ratings and percentages.
- Portal sections normally use 24–48px vertical rhythm on desktop and 16–32px on mobile. Do not force empty full-height panels. Keep the first useful task/action visible within the initial workspace view where practical.
- Every workspace begins with a compact role orientation: current demo identity/state, one recommended next action and the remaining task destinations.

### Navigation and demo surfaces

- The multicolour circular custom cursor mounts only on `/`; all other routes keep the native cursor.
- Classify routes explicitly as `marketing`, `access`, `workspace` or `guest-invitation`. RSVP staff/customer workspaces must not receive marketing navigation; guest invitation routes must not expose staff switching.
- Derive desktop navigation, mobile navigation, active states and portal switching from one typed route manifest. No duplicated portal links or misleading destinations.
- Public demo access contains only TNP Planner and Freelancer named synthetic profiles. Internal Operations/Admin and dedicated RSVP access are not public launcher destinations; there is no Client demo identity or login. All preview state remains visibly separate from production authentication.
- Consolidate synthetic warning, preview state and reset controls into non-obscuring demo chrome. Scenario controls must never cover a primary action. Reset copy must state its real scope.

### Partner discovery pattern

- Image first, then prominent partner/venue/planner name, location or service area, verified evidence, price qualifier and primary action.
- Show a star rating only when value, scale, review count, source and verifier exist. Otherwise show truthful recommendation/match language or no rating.
- `Sample budget band`, `sample rate`, `starting at`, `per event/day/hour/guest/room-night` are distinct labels and cannot be interchanged.
- Illustrative/destination images retain a visible provenance caption and cannot masquerade as partner photography. Provide stable aspect ratio, accessible alt text and a branded fallback.
- First adoption is Client venue/TNP-Planner selection. Freelancer opportunities, RSVP organization/event workspaces and information-only travel/stay needs, requirements and worker rows keep separate semantics. RSVP must not use partner cards to imply hotel/vehicle inventory or booking.

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
