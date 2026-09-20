# ADR-0008: Public Client enquiry and private workspace entry

Status: Accepted by Kartik on 2026-09-20

## Context

The integrated UX foundation exposes a synthetic workspace catalogue containing Client, TNP Planner, Freelancer, Operations and RSVP entries. It also preserves a `/client` workspace and public links to synthetic Operations access. Kartik has now clarified that this is the wrong customer journey: ordinary Clients must not create an account or sign in. They learn about TNP through the public website and submit either a specific event need or a general contact request. The public side launcher is intended only for people entering the TNP Planner and Freelancer journeys. Operations is an internal workspace, not a public demo product.

The website still needs truthful public information about TNP Planner, hospitality Freelancers/workforce, Venue and RSVP. The platform still needs internal Operations/Admin and dedicated RSVP product workspaces, but their implementation does not make them public launcher destinations.

## Decision

1. There is no public Client login, Client demo identity, or Client workspace. `/client` becomes a compatibility redirect to `/contact?interest=event-request`; it must not render a portal or authentication chooser.
2. `/contact` is the single public Client conversion surface. It supports a specific mixed-product event request and a general `I just want to talk` path. A successful submission returns a clearly labelled request reference only; it does not claim booking, quotation, payment, availability, allocation or workspace access.
3. Public service/detail pages explain the four product families and the distinct journeys for TNP Planners, hospitality Freelancers/workforce, Venue and RSVP. They lead Clients to Contact and lead prospective Planners/Freelancers to their own access journeys.
4. The public side launcher contains exactly two destinations: `TNP Planner` and `Freelancer`. It uses a reusable source-to-window transition with a clear reverse close, keyboard/Escape/focus-return behavior, touch-safe placement and a non-scaling reduced-motion alternative. It is macOS-inspired in spatial continuity only; it does not copy Apple assets, branding or exact trade dress.
5. Operations/Admin is retained as an internal authenticated product surface and development implementation, but it is removed from public marketing navigation, the public launcher and public demo-access selection. `/operations` and `/admin` must not be promoted as an Operations Demo.
6. RSVP vendor/team access remains a dedicated product flow and is not included in the public side launcher. Guest invitation routes remain isolated. Until its corrected product milestone is accepted, public RSVP actions lead to information and Contact rather than a generic workspace demo.
7. The previous Client workspace redesign brief and the Client-workspace portions of older role/demo documents are superseded. Reusable visual work may be adapted for Contact or public product education only when it supports this decision.
8. F03/F04 no longer mean an authenticated Client portal. For the frontend-completion program they become the public mixed-product enquiry/confirmation journey and the reference/status/contact-follow-up presentation that requires no Client login.

## Alternatives considered

- Keep the synthetic Client workspace but remove only the word `Login`: rejected because the interaction would still teach the wrong account model.
- Keep all roles in one public demo launcher: rejected because Operations and RSVP staff access are not visitor destinations and expose synthetic internal concepts.
- Delete Operations/Admin implementation: rejected because internal Operations remains required; only its public demo exposure is removed.
- Animate full route navigation directly from every icon: deferred because cross-document shared-element navigation is less reliable than an interruptible in-page launcher window followed by explicit navigation.

## Consequences

- Shared route, session and access tests must remove Client from the public demo catalogue and distinguish public launchable workspaces from internal/dedicated workspaces.
- Existing Client UI code can remain temporarily for provenance while `/client` redirects, but it receives no further product work and should not be counted as a Client-facing deliverable.
- Contact, public detail content and access navigation become the primary client-facing implementation scope.
- The launcher must not reintroduce the fixed pill obstruction that blocked the homepage cube at 320px.
- Production authentication, authorization and private Operations/RSVP access remain separate backend/security work. This ADR changes frontend information architecture, not server authority.

## Evidence and related records

- Kartik's 2026-09-20 instruction in the active architect session.
- `docs/PRODUCT.md`
- `docs/DESIGN.md`
- `docs/PORTAL-ROLE-SCOPE-REFINEMENT.md`
- `docs/UX-COMPLETION-BRIEF.md`
- `docs/architecture/decisions/ADR-0001-web-preview-boundary.md`
