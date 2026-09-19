# TNP homepage redesign and frontend sequence

Status: canonical final-homepage direction, updated 2026-09-19. The homepage is implemented last, after the full responsive frontend and integrated regression gates. No current writer, branch, worktree, port or lease is granted by this brief. Keep approximately75% of the strongest photographic placements unless final evidence supports a better bounded ratio; preserve TNP identity and the separate Operations composition.

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

## Final-homepage motion direction (accepted 2026-09-19; implementation last)

The public homepage is the final responsive-frontend design milestone. Do not start it while shared UX, Client/Planner, Freelancer, Operations, corrected RSVP, public/access and aggregate responsive/accessibility gates remain open. At Ready, use a fresh verified `gpt-6-astra` session and one isolated worktree; this brief is not a lease.

The governing principle is: **motion makes TNP appear coordinated**. Every movement should communicate arrival, assignment, progression, connection, confirmation or transformation. Do not animate merely to display technical capability. At most one dominant and one supporting motion compete within a viewport; useful content and actions render before animation code or WebGL is ready.

### One motion language

Use a small shared token set rather than section-specific timing inventions:

| Token | Range | Typical use |
|---|---:|---|
| micro | 120–180ms | press, icon, underline, selection feedback |
| fast UI | 180–260ms | menu, pill, form state |
| standard UI | 260–360ms | accordion, card, navigation container |
| section entrance | 500–700ms | heading, image, major reveal |
| hero cinematic | 700–1100ms | initial headline and primary scene |
| route transition | 250–400ms | shared-element transition or fallback fade |

Prefer three curves across the site: `cubic-bezier(.16,1,.3,1)`, `cubic-bezier(.22,1,.36,1)` and `cubic-bezier(.2,.8,.2,1)`. Default to transforms and opacity. Use clip paths, filters and measured layout animation only for isolated high-value interactions; never run expensive filters, layout animation or large blurred shadows continuously.

Marketing and portal motion are deliberately different. Marketing may use 400–900ms cinematic reveals, native-scroll storytelling, image transitions and subtle depth. Portals use 120–300ms predictable state feedback, 4–12px movement, almost no parallax and no cinematic route delays. Homepage effects must never leak into transactional workspaces.

### Interaction priorities and arbitration

Implement in this order because it improves comprehension and conversion before decoration:

1. header/navigation behavior;
2. Services interaction;
3. RSVP/product workflow story;
4. Occasions carousel;
5. hero/canopy polish;
6. illustrative coordination pulse;
7. trust evidence;
8. page transitions;
9. enquiry/booking micro-feedback;
10. WhatsApp entry;
11. decorative effects.

The header uses scroll hysteresis: ignore approximately 8–12px noise, hide after sustained downward intent, reveal on meaningful upward movement, remain visible near the top and never hide while navigation is open. Active sections use `IntersectionObserver`, not per-frame scroll calculations. Services navigation uses one moving/resizing container with content crossfade rather than independent popovers reopening.

Services rows visibly support hover, click, Enter and Space. Fine-pointer hover may shift the label about 8px, fill a rule, rotate the affordance and show an illustrative preview. Stable expansion is click/keyboard controlled and uses grid `0fr→1fr`, FLIP or measured height rather than naive `height:auto`. Pointer previews require both `hover:hover` and `pointer:fine`.

The Occasions carousel has explicit control states. Page scroll may add a subtle pre-interaction translation. Once the user grabs/drags, scroll influence turns off and drag momentum/snap owns the transform for the rest of that interaction; do not make two systems fight. Touch retains native horizontal browsing or scroll snap, visible controls and no scroll interception.

### Attention-ranked hero

Sequence attention rather than moving everything at once: hero surface, headline lines, emphasized word, canopy settle, role indicators, primary CTA, then explore cue. The exact milliseconds may tune during visual QA, but the hierarchy must remain. Fine-pointer canopy response is damped and bounded around `rotateX ±2°`, `rotateY ±3°` and a few pixels of translation. No gaming-card motion.

Background light makes one slow entrance pass, then becomes nearly static; any later change follows subtle pointer response. Do not loop shimmer beside readable text. Word illumination in editorial copy uses one scroll-progress value, keeps inactive words readable and has a static reduced-motion state.

### Product storytelling that remains truthful

The RSVP signature moment runs once when roughly 40–50% visible, then stays completed. It may demonstrate: guest imported, event/function identified, WhatsApp reply received, attendance intent categorized, pickup/stay information requested or received, ambiguity flagged/resolved and an information report becoming ready. It must not show driver assignment, ticket/hotel/room booking, vehicle dispatch, table allocation, payment or provider delivery unless those capabilities later exist under an accepted contract. Counts are labelled illustrative preview data.

Add one public coordination pulse near workforce/RSVP to explain how TNP connects planners, people, venues and operations. It may show illustrative coverage by event zone and one one-shot reassignment/confirmation transition. Never label synthetic numbers as live, expose internal controls or reproduce the Operations workspace publicly.

Destination itinerary lines and one travelling marker provide the motion; pins drop/settle once and never bounce continuously. Process steps use structural `01→02→03` progression. People cards use image zoom, rising information and a secondary-image crossfade rather than a literal 180-degree flip. Testimonials use manual control or a restrained slow crossfade; readable quotes do not run in a perpetual marquee.

WhatsApp entry may spring in once and nudge once after approximately 15–25 seconds only if the visitor has not interacted with it. It is reduced or absent inside portals so it never competes with a transaction.

### Progressive enhancement and adaptive tiers

View Transitions are optional enhancement only: supported browsers may use a shared-element morph; unsupported browsers use normal navigation plus a 150–250ms fade. Total route transition stays under about 400ms and never delays destination content or duplicates the route label.

Do not claim to detect battery/low-power mode. Classify motion using observable signals: `prefers-reduced-motion`, `hover`, `pointer`, `saveData`, viewport, WebGL capability, and cautiously `deviceMemory`/`hardwareConcurrency` where available.

- Tier A: capable fine-pointer desktop; full optimized experience.
- Tier B: normal mobile/coarse pointer; no custom-cursor effects, simplified 3D and minimal parallax.
- Tier C: reduced motion, save-data, constrained or non-WebGL; static composition and basic state fades.

The custom multicolour cursor remains homepage-only and never replaces the native cursor on touch/coarse/reduced-motion contexts.

### 3D and performance gates

Keep exactly one scene/canvas. Lazy-load it after useful hero content, cap DPR, compress/reuse textures and geometry, reuse/instance materials, avoid unnecessary real-time shadows and pause rendering when off-screen, backgrounded or manually paused. Mobile may receive a designed static or simplified fallback. First paint, headline and primary CTA never depend on WebGL.

Record the current production-build scene chunk as a baseline and explain any increase. Test loading, interaction and fallback on agreed representative desktop and Android-class mobile hardware; measure rather than infer LCP, interaction responsiveness, layout shift, memory and long tasks. No new motion dependency without a separate reviewed decision.

### Final verification

Verify at 1440x900, 1100x900, 390x844 and 320px where dense content appears: mouse, keyboard, touch, hover-capability changes, reduced-motion live changes, save-data/tier fallback, no-View-Transition fallback, WebGL unavailable/thrown/context-loss, background/off-screen pause, Back/Forward, no content hidden without JavaScript, no focus movement/clipping, no horizontal overflow and no new console/hydration errors. Browser evidence must cover the primary enquiry path as well as the cinematic states. Final review includes exact image/media provenance, bundle/runtime measurements and a fresh independent fixed-SHA accessibility/performance/design gate.

## When frontend work happens

The current 2026-09-19 user direction supersedes the historical homepage-first exception: complete the responsive platform frontend and its integrated regression first, then create the final homepage. Portal-local visual and state work still ships with each module; only the public homepage's final navigation, storytelling, motion, 3D and cursor refinement waits until last.

Final sequence: shared UX/access foundation; corrected Client/Planner; Freelancer; Operations commercial/finance/maintenance; corrected message-only RSVP; public/access content and cross-portal polish; integrated responsive/accessibility/performance regression; final homepage. Vendor identity/tenancy and real WhatsApp remain provider- and platform-gated. The release conditions in `docs/DELIVERY-PLAN.md` still control; this brief does not authorize deployment.
