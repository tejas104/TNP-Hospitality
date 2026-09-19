# TNP interactive surface and dashboard design contract

Status: accepted visual direction recorded 2026-09-19; implementation is part of the serialized shared UX foundation and later portal-local adoption tasks. This file is not a writer lease.

## Intent

Raise the responsive web platform to a modern product-dashboard standard while preserving TNP's editorial hospitality identity. Depth must communicate hierarchy, interactivity, selection and attention—not decorate every rectangle.

The flat workspace card shown in the 2026-09-19 Client access screenshot is the first reference problem: the role name, explanation and action read as separate strips rather than one confident interactive destination. The corrected pattern makes the role card a composed raised surface with clear state and motion while retaining an explicit labelled action.

## Semantic surface levels

- `canvas`: ivory/neutral page background; no shadow.
- `section`: large layout grouping using spacing, divider or tonal shift; normally no floating shadow.
- `panel`: contained passive information or form region; subtle border/tonal separation, optional low elevation.
- `raised`: actionable card, queue item, partner choice or role destination; visible border plus soft ambient shadow.
- `overlay`: drawer, popover, dialog or sticky command surface; stronger shadow and backdrop separation.
- `selected`: raised surface with teal accent ring/rail and checked/selected semantics; never color alone.
- `critical`: warning/failed/reconciliation surface using status color, icon and text; elevation does not communicate severity by itself.

Proposed shared semantic tokens after the final aggregate palette is available:

```css
--surface-canvas: var(--ivory);
--surface-panel: #fffdf8;
--surface-raised: #ffffff;
--surface-border: rgb(23 59 54 / 14%);
--surface-border-strong: rgb(0 128 128 / 36%);
--elevation-1: 0 8px 24px rgb(18 48 45 / 7%);
--elevation-2: 0 18px 48px rgb(18 48 45 / 12%);
--elevation-overlay: 0 28px 80px rgb(8 34 32 / 18%);
--radius-panel: 14px;
--radius-action: 12px;
```

Exact token values must be contrast/browser verified on the integrated `#008080` palette before acceptance. Shadows stay neutral/teal-black, never multicolour cursor glow outside the homepage.

## Interactive card contract

Use an interactive card only when the whole surface represents one destination/selection or contains one unambiguous primary action.

- Name/task title is dominant; state and evidence sit beside it; supporting text is secondary.
- The card has a visible resting border and elevation, not a hover-only affordance.
- Fine-pointer hover may translate `-3px` to `-5px`, strengthen border/shadow and move a directional icon slightly. It must not cause surrounding layout shift.
- Keyboard focus uses a high-contrast external ring and the same raised state. Enter/Space behavior follows the semantic link/button element.
- Active/pressed state returns toward the canvas and gives immediate tactile feedback.
- Selected state uses `aria-current`, `aria-pressed` or form semantics as appropriate plus icon/text; never rely only on shadow or teal.
- Disabled state retains readable contrast, explains why it is unavailable and removes hover/lift motion.
- Loading keeps dimensions stable; error/retry stays inside the same identity rather than replacing it with a generic card.
- Coarse pointers do not depend on hover. Reduced motion removes transforms/parallax and keeps instantaneous border/shadow/state feedback.

Do not nest multiple competing links/buttons inside a card-wide link. If a dashboard item needs several commands, make the card an article with one primary action and clearly separated secondary controls.

## Workspace access card — first adoption

Each Client, TNP Planner, Freelancer, Operations and RSVP entry is one raised role card:

- icon inside a restrained teal-tinted tile;
- role name at 28–34px;
- truthful demo/access badge near the name, not floating far across the card;
- short outcome statement followed by current availability;
- full-width or bottom-aligned concrete action with arrow motion;
- subtle accent wash/rail unique to state, not a generic gradient background;
- entire card composition responds to hover/focus, while the explicit action remains the semantic link target unless the whole card is safely one link.

At `1440px`, use a balanced two-column grid without excessive vertical whitespace. At mobile width, use one column, preserve 44px targets and reduce shadow spread.

## Dashboard composition

Every authenticated workspace should feel like a modern command centre without becoming a grid of equal statistic cards:

1. **Orientation bar:** identity, role/state, event/organization context and switch/exit controls.
2. **Next-action surface:** one prominent raised card with task title, reason, deadline/state and primary action.
3. **Attention queue:** 2–4 actionable items using compact raised rows/cards and severity/status evidence.
4. **Operational body:** list-detail, timeline, calendar, form or table suited to the workflow; use panels, not decorative card duplication.
5. **Supporting metrics:** compact tabular-numeric strips or grouped tiles; metrics never outrank the next task.

Dashboard microinteractions may include queue-item lift, filter/result cross-fade, selection rail animation, count interpolation only when truthful, drawer continuity, skeleton-to-content dissolve and server-confirmed success emphasis. No perpetual bobbing, scroll-jacking, dramatic blur, glassmorphism or motion that implies an unsaved action succeeded.

## Required consumers and boundaries

The shared foundation may create elevation/action tokens only after proving at least three consumers:

1. workspace/login role cards;
2. shared next-action/orientation surface;
3. one reusable actionable queue/card pattern.

Portal-local tasks then adopt the system where semantics match:

- Client: product choices, Venue/TNP Planner partner cards, quotation attention;
- TNP Planner: assigned-event next action, grant/resource queue, professional evidence cards;
- Freelancer: eligible opportunity and next-assignment action, not every earnings row;
- Operations: review/exception/quotation/grant queues and selected work item;
- RSVP: Today attention/event cards and ambiguous/failed message queues, not travel/stay inventory.

Homepage editorial film/portrait cards remain homepage-local and final-homepage work remains last.

## Verification

- Rest, hover, keyboard focus, active, selected, disabled, loading, empty, error and retry states.
- Fine pointer, coarse pointer, `prefers-reduced-motion`, forced-colors/high-contrast where supported and 200% zoom.
- Viewports `1440x900`, `1100x900`, `390x844` and `320px` on dense queues.
- WCAG AA text/non-text contrast; focus ring is not hidden by shadow/overflow.
- No layout shift on lift, no clipped shadow in scrolling containers, no overlay covering a primary action and no horizontal overflow.
- Performance review limits large blurred shadows in long virtual/list surfaces and disables expensive per-row effects where measured.
