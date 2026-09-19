# TNP platform UX completion brief

Status: canonical product/design direction recorded 2026-09-19. This brief defines acceptance and sequencing; it is not a writer lease. Homepage visual/content refinement stays last.

## Outcome

Complete the responsive frontend so a first-time visitor can identify their role, enter a truthful demo, understand the current state, see the next action, complete a task and move to another task without guessing what is clickable or where navigation leads.

Preserve TNP's editorial hospitality character. Improve usability through hierarchy, density, evidence and predictable interaction—not generic dashboard styling, excessive cards or copied competitor layouts.

## Observed problems

1. The multicolour custom cursor is mounted by the shared shell on portal routes and hides the native pointer.
2. Portal header `Login` navigates to Planner and `Let's Talk` navigates to Client, so labels do not describe destinations.
3. Desktop portal heroes and section intros consume too much height before useful tasks.
4. Planner slogans visually outrank `Planner registration` and `Workforce requirement`.
5. Some metrics use oversized serif or monospace numbers with tiny labels, creating an artificial dashboard feel.
6. Clickable metrics/cards often reveal affordance only on hover.
7. Fixed preview controls, warning chrome and the portal switcher compete with task controls; live browser evidence shows the bottom controls can obscure the Planner submit area.
8. `/login` is a truthful workspace directory, but not a coherent named demo-identity/session experience.
9. Current workspace navigation omits RSVP/Operations demo entry, duplicates some mobile links and has no typed route/surface model.
10. Partner/venue/planner discovery lacks a consistent evidence-rich listing pattern; current contracts cannot truthfully support marketplace stars or verified partner photos.

## Role entry model

Each workspace starts with a compact orientation block:

- named synthetic identity and truthful demo status;
- current state in one sentence;
- one primary `Next best action`;
- two or three remaining destinations;
- `Switch demo profile`, `All workspaces` and `Exit demo` as secondary/tertiary actions.

Recommended first actions:

- Client: start/resume the guided event builder, review an Admin quotation, or manage an existing event/product order.
- TNP Planner candidate: complete experience evidence or review the Admin decision. Approved TNP Planner: open the assigned event's next approval/resource action.
- Freelancer: finish application/assessment, browse eligible opportunities, or respond to the next assignment.
- RSVP: open needs-attention/today queue before summary metrics.
- Operations: open pending reviews/attendance exceptions before aggregate metrics.

## Shared design contract

### Actions

- `primary`: filled, high contrast, concrete verb, always visibly clickable;
- `secondary`: outlined/tonal, equally focusable;
- `tertiary`: underlined/text action with icon or arrow where direction matters;
- `danger`: explicit destructive language and confirmation behavior;
- disabled: reason shown adjacent or discoverable; never opacity-only ambiguity.

All actions preserve 44px targets, visible focus, Enter/Space semantics and coarse-pointer behavior.

### Typography

- Editorial page intro: Georgia, short and restrained.
- Workspace/task title: body or Georgia according to context, 24–40px.
- Body/forms: Manrope/Inter/system, 14–16px.
- Metadata: 12–13px, never the only source of meaning.
- Metrics/money/dates/percentages: body type, weight 600–700, tabular numerals, 24–36px maximum for headline counts.
- Avoid monospace except machine/reference IDs, and never use IDs as the primary human label.

### Density

- Workspace hero is compact enough that a next action or task navigation is visible in the first desktop viewport.
- Use 24–48px desktop section spacing and 16–32px mobile spacing; larger editorial spacing requires a storytelling purpose.
- Prefer grouped rows/list-detail layouts for operational work. Do not turn every value into an equal card.

### Navigation

- One typed route manifest supplies desktop, mobile, portal switcher, active state, transition label and demo catalogue.
- Public: Home sections, Contact, and one clear Workspaces action.
- Workspace: Home, Workspaces, complete portal switcher, active identity, switch and exit.
- Guest invitation: minimal RSVP identity only.
- Internal routes use framework links and preserve Back/Forward behavior.

## Demo access contract

Use tab-scoped `sessionStorage` key `tnp-demo-session-v1` containing only non-secret fixture IDs. Storage denial falls back to memory with a visible reload-warning.

Workspaces: `client`, `tnp-planner`, `freelancer`, `operations`, `rsvp`. A client-appointed planner is a scoped Client-organization identity, not a second TNP Planner profile.

States: `active`, `invited`, `suspended`, `expired`, `revoked`, `forbidden`.

Rules:

- selecting a profile is an explicit action;
- direct workspace entry without a selected profile returns to the relevant chooser;
- switching profile never resets records;
- exit clears only demo identity;
- connected preview reset is labelled cross-portal and remains separate from RSVP-local reset;
- production login/recovery is separate and stays disabled until reviewed auth contracts exist;
- RSVP guest invitation tokens are not demo staff profiles.

Canonical access routes are `/login`, `/login?workspace=<allowlisted-workspace>`, `/client`, `/planner`, `/freelancer`, `/operations`, `/rsvp/login` and `/rsvp/workspace`. Retain `/admin` only as a compatibility redirect until all references/tests migrate.

## Partner discovery contract

Use a reusable presentation-only `PartnerCard` for proven comparison consumers. It does not create a new domain entity.

Required model categories:

- identity: stable ID, kind, name;
- context: location/service areas and short summary;
- media: source, alt, provenance, relationship (`partner-photo`, `destination-context`, `illustrative`) and fallback;
- price: INR minor units, qualifier, unit, scope and provenance;
- social proof: either verified rating with review count/source/verifier, or clearly labelled recommendation/match score;
- qualifications: state plus issuer where verification is claimed;
- one primary selection/link action and truthful disclosure.

First consumers:

- Client venue selection: display name, city, capacity, sample budget range, recommendation, TNP-owned/sample-partner distinction and explicitly illustrative destination context.
- Client TNP Planner selection: approved senior TNP member, specialties/cities, `Preview match`, and sample availability/approval state. A client-appointed planner is managed through organization membership, not this talent card. No stars, price or portrait until supplied by a reviewed contract.

Do not force this abstraction onto Freelancer opportunities, Planner requirements, RSVP organization access, hotel inventory, Operations workers/rosters or reports.

## Implementation sequence

1. Close and integrate the fixed-SHA gates for RSVP, Freelancer, corrected Operations Reports and Brand Teal.
2. Run the aggregate `#008080` adoption guard after those candidates are combined.
3. Execute serialized `TNP-UX-FOUNDATION-M1`: cursor isolation, surface classifier, route manifest, destination-accurate navigation, demo catalogue/session, non-obscuring preview chrome, action/numeric/density primitives.
4. Client/Planner presentation pass: task-first hierarchy, compact spacing, obvious actions and PartnerCard adoption.
5. Freelancer M2: attendance, pass, earnings, payout, ratings and standing using reviewed contracts, plus the shared demo/UX primitives.
6. Operations finance/admin/maintenance frontend and corrected Reports adoption.
7. RSVP shared-shell/demo/palette adoption without weakening its existing persona/access semantics.
8. Public/access M2: approved content, access/recovery states, cross-portal polish and asset replacement.
9. Integrated desktop/mobile/keyboard/touch/reduced-motion/performance regression.
10. Homepage navigation, visual storytelling and final 3D/cursor refinement last.

## Acceptance matrix

- Viewports: 1440x900, 1100x900, 390x844; 320px for Freelancer/dense RSVP views.
- Keyboard: Tab/Shift+Tab/Enter/Space/Escape, visible focus, focus return, skip links and logical order.
- Demo: activate profile, refresh persistence, switch, exit, blocked state, two-tab isolation and storage denial.
- Navigation: every manifest destination resolves; active route is visible; no duplicates; Back/Forward works; RSVP invitation never exposes staff nav.
- Content hierarchy: role/task title, current state and next action are visible without reading machine IDs.
- Actions: primary/secondary/tertiary remain distinguishable without hover; no fixed chrome covers a task control.
- Partner cards: long names, missing image, illustrative image, no rating, verified rating, budget range, missing price, selected/disabled/loading/empty/error states.
- Visual/accessibility: WCAG contrast, 200% zoom, no horizontal overflow, reduced-motion parity and no unexplained console/hydration errors.
- Truth: no demo password, production-auth claim, invented rating/review, fake verified badge, misleading partner photo or unqualified price.

## Benchmark principles

Review official Airbnb, Notion, ChatGPT and Apple experiences only for interaction principles: explicit task entry, evidence near choices, restrained progressive disclosure, dominant action and predictable navigation. Do not copy their trade dress, layouts, proprietary assets or content.
