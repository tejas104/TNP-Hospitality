# TNP Client workspace redesign — product-led calm, TNP identity

Status: canonical visual direction recorded 2026-09-20. This is a design/ownership brief, not a writer lease. Source implementation remains gated by accepted/integrated Brand Teal, the aggregate palette regression, and reviewed/integrated `TNP-UX-FOUNDATION-M1`. Homepage remains excluded and last.

## User direction and benchmark boundary

Kartik rejects the current `/client` composition and the fixed right-edge semicircle portal control. Redesign the Client page and the workspace-switching experience using the product-led clarity of the official Wispr Flow website as a benchmark: calm ivory canvas, framed navigation, a short direct promise, one unmistakable primary action, an immediately understandable interactive product demonstration, generous but controlled whitespace, soft outlined surfaces and purposeful motion.

This is inspiration, not imitation. Do not copy Wispr Flow's brand, logo, exact layout, text, lavender action colour, illustrations, assets, animation choreography or trade dress. Preserve TNP's exact `#008080` primary teal, ivory `#f5f1e7`, champagne `#bba879`, neutral ink, Georgia display accent and body/interface font.

## Problems to remove

- The full-width teal hero reads as a static campaign poster before it reads as a useful Client product.
- Three large slogan lines and the palace image dominate the first viewport while the actual event builder starts below the fold.
- The copy implies Venue and Planner as a sequential default even though the corrected product model permits Hospitality, Venue, TNP Planner and RSVP alone or in any combination.
- The fixed white semicircle button is visually unrelated to the shell, obscures content, opens on pointer hover and expands into an oversized dial.
- Local section navigation, global workspace navigation, preview chrome and the primary task compete for attention.
- The four-step Venue -> Planner -> Details -> Review flow cannot remain the sole Client entry because Venue and Planner are optional products.

## First-view composition

Use a warm ivory page canvas with a compact framed workspace header. The first desktop viewport must show the promise, one primary action and a real preview of product selection; it must not be another full-height editorial hero.

### Copy hierarchy

- Eyebrow: `TNP CLIENT STUDIO · SYNTHETIC PREVIEW`.
- Working headline: `Tell us what you need. We'll bring the event together.` Keep it to two or three visual lines. Use Georgia or italic display treatment only on the outcome phrase, not every line.
- Supporting copy: one sentence naming the four product families in plain language: Hospitality workforce, Venue, a TNP Planner and RSVP.
- Primary action: `Build my event brief`.
- Secondary action: `Review an existing request` when a truthful sample state is available; otherwise use `See how it works` and scroll to the builder.
- Put the synthetic/no-live-booking notice adjacent to the actions in quiet but legible text.

### Interactive hero product moment

Replace the standalone palace hero image with a live-looking but truthful event-brief preview derived from the actual local draft state. It should demonstrate the product without submitting anything:

- event name/date/location summary;
- four large product-choice chips/cards: `Hospitality`, `Venue`, `TNP Planner`, `RSVP`;
- selected count and a concise `Your brief` summary;
- an animated, reduced-motion-safe response when a product is selected;
- `Not needed`, `I already have a venue`, and `I have my own planner` paths in the real builder, not hidden assumptions;
- labelled synthetic/sample content, never a fake confirmed booking, price, availability or verification.

Keep a strong hospitality photograph later in the page as a supporting story/provenance card or within evidence-rich Venue results. Do not make destination photography the product itself.

## Page rhythm

1. Compact product-led hero with the interactive brief preview.
2. Four-product chooser explaining what each option includes and what happens next.
3. Guided event basics and product-specific questions with progressive disclosure.
4. Evidence-rich Venue/TNP Planner choices only if selected, using the shared `PartnerCard`.
5. Review/submission with truthful request, quotation and fulfillment-grant boundaries.
6. Existing request/status area with one next action, not a decorative metrics wall.
7. Short trust/support section and concise FAQ only where content is approved.

Use alternating ivory/white/very-soft teal panels, 20–28px radii, thin neutral/champagne borders and restrained shadows. Use teal for action and state emphasis, not as a full-screen backdrop. Avoid glassmorphism, giant ornamental copy, nested card walls and looping decorative animation.

## Workspace switcher replacement

The current fixed `.portal-switcher` / `.portal-trigger` / `.portal-dial` is removed across workspace routes by `TNP-UX-FOUNDATION-M1`, not patched only on `/client`.

- Place an explicit `Client workspace` or `Switch workspace` pill in the workspace header beside the active synthetic identity.
- Open only on click/keyboard activation; no hover auto-open.
- Desktop opens a compact anchored popover (roughly 300–340px) listing every available workspace with icon, name, one-line purpose and visible current state.
- Mobile opens a bottom sheet or menu-contained workspace list that respects safe areas and never covers the primary task action.
- Current workspace is textually identified and non-ambiguous. Every destination comes from the typed route manifest.
- Escape closes and returns focus. Clicking away closes. Tab order remains contained and logical without creating a modal trap for a non-modal popover.
- Provide 44px targets, visible focus, active/pressed states, reduced-motion parity and no content overlap at 320–390px.
- Preview scenario/reset controls remain separate and clearly labelled; they do not live inside the workspace switcher.

## Motion

Use motion to explain selection and progress: a subtle preview card response, product-chip selection, step completion and saved/submitted state. Prefer 180–320ms opacity/translate/scale transitions with no layout shift. Disable transforms under reduced motion. Do not animate the whole background, auto-cycle choices or use an always-floating side control.

## Responsive requirements

- At 1440x900 the headline, primary action and at least two product choices are visible without scrolling.
- At 1100x900 the hero may use a balanced 5/7 or 1/1 split without clipping.
- At 390x844 and 320px the hero becomes one column; actions remain visible before the product preview, no fixed control covers content and horizontal overflow is zero.
- iOS Safari safe areas, dynamic viewport height, virtual keyboard behavior, 44px targets and Android Chrome are first-class.
- Lighthouse mobile performance remains above 80 on production-build evidence; avoid adding a hero canvas, autoplay video or new heavy dependency.

## Ownership and sequencing

Shared shell stage (`TNP-UX-FOUNDATION-M1`) owns the workspace switcher, typed route manifest, identity placement, non-obscuring preview chrome and shared action/surface primitives through `AppShell.tsx`, global CSS and shared access components.

Client stage (`TNP-CLIENT-PLANNER-CORRECTED-M2`) owns the Client hero, interactive brief preview, four-product chooser, progressive builder, Client-local copy, local illustrations, status composition and feature tests inside `app/client/**` and `components/tnp/portals/client/**`. It consumes the integrated shell and shared primitives without editing them.

Homepage, public marketing sections, Operations, Freelancer, RSVP, shared domain/services/contracts, server/provider configuration and production data remain frozen in both stages unless separately contracted.

## Acceptance evidence

- Before/after screenshots at 1440x900, 1100x900, 390x844 and 320px.
- Keyboard proof for skip link, workspace switcher, product choices, step navigation, dialogs/sheets, Escape and focus return.
- Touch/coarse-pointer, reduced-motion, 200% zoom, long copy, empty/error/loading/disabled/saved/submitted states.
- No forced Venue or Planner, no false price/availability/booking/assignment language, and all four product families usable alone or together.
- No horizontal overflow, obscured actions, console/hydration errors or regression in draft/retry/generation/reset behavior.
- Focused tests, aggregate preview tests, lint, non-incremental TypeScript, Vercel build, diff check and production-build Lighthouse mobile evidence.
