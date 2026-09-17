# TNP homepage redesign and frontend sequence

Status: user approved publication and priority homepage implementation on 2026-09-17. P occupies B as the sole homepage writer; A and D remain paused. A separate Ready contract records the exact launch and ownership. Keep approximately75% of current homepage photographic placements; remove approximately25%. Preserve TNP identity and the separate Operations composition.

## Design direction

Luxury hospitality with a clear hierarchy: deep teal/ivory/champagne, editorial typography, generous spacing and fewer competing sections. One prominent 3D scene should communicate service coordination: a sculptural hospitality emblem or event pavilion with restrained guest/venue/transport elements, subtle depth, lighting and pointer response. Replace the current photo-tile orbit rather than adding a second image-heavy animated gallery. No generic particle background that obscures the content.

Proposed page order: concise hero with primary enquiry CTA and secondary RSVP/vendor platform CTA; grouped service overview; RSVP offering with separate managed-service and vendor-access explanations; selected event/venue proof; short process; selected team/trust evidence; final enquiry. Consolidate repeated photographic walls and repeated calls to action. Anchor navigation remains meaningful. Actual account links must not imply live vendor login until implemented; enquiries can be the interim real action.

## Image accounting

Capture the baseline rendered homepage at fixed desktop/mobile dimensions and count photographic placements, including repeated images and 3D photo textures. Target remaining placements around round(0.75 x baseline); record baseline and final counts. Assess unique fetched photographic assets separately, so removing visible tiles cannot hide unchanged downloads. Retain the strongest existing photos at appropriate sizes and lazy-load below-fold media. The instruction does not authorize deleting shared media files used by other portals.

## Implementation boundary

Proposed owner: B public milestone, or P occupying that same available lane under an explicit launch. Current B task is Draft with no writer lease. Proposed owned files: components/tnp/HomeExperience.tsx and new components/tnp/public/** scene/local stylesheet. Use existing Three.js/React Three Fiber dependencies. Avoid package changes and broad global-CSS/AppShell edits; any genuinely necessary shared change gets a serialized boundary. A/client, planner and D/Operations implementation stays in its own candidate branches.

Two sequential implementation prompts: (1) homepage information hierarchy, reduced image inventory and responsive layout; checked internal checkpoint; (2) integrated 3D hero, progressive enhancement and interaction polish; one consolidated final review. No intermediate formal review between these two compatible prompts.

## Acceptance

Check desktop1440x900/mobile390x844; no horizontal overflow, clear primary actions, keyboard/focus, usable contrast and readable overlay content. One 3D canvas, lazy loading and capped rendering resolution; pause when offscreen/backgrounded. Reduced-motion mode and unavailable WebGL have a stable designed fallback with all content/actions present. Measure runtime performance before/after on agreed devices; do not claim improved performance from fewer images alone. Existing service/enquiry interactions and routes remain functional. Report exact source SHA, image counts, screenshots, behavior and lint/type/build results.

## When frontend work happens

The user answered "yes" to publishing the revised documentation and starting the homepage as the priority while A/D stay paused. This expressly authorizes the homepage exception to the two-waiting-review dispatch rule and supersedes the earlier publication hold. P is the named writer occupying B. It does not waive final review or authorize application integration/deployment. Frontend implementation starts with this homepage milestone without waiting for every backend feature.

Overall UI sequence: homepage; reusable visual/navigation patterns; client/planner/Operations refinements on corrected candidates; vendor RSVP admin/login/workspace and guest forms; integrated responsive/accessibility walkthrough. Build functional frontend and its states with each module rather than defer all visual work to the end. Vendor identity/tenancy and WhatsApp documents remain provider- and platform-gated scope. The current target and release conditions are defined in `docs/DELIVERY-PLAN.md`; this brief does not independently promise completion or deployment.
