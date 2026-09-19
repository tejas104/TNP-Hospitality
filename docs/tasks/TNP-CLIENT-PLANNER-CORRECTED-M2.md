# TNP-CLIENT-PLANNER-CORRECTED-M2 — corrected Client and TNP Planner frontend

Status: DRAFT — no writer, branch, worktree, port or lease. This is the clean successor to the paused `TNP-CLIENT-ASTRA-M1` branch and must not reuse its unfinished Planner WIP. It depends on accepted/integrated Brand Teal, Freelancer M1 and corrected Operations Reports candidates, the aggregate palette/regression gate, and reviewed/integrated `TNP-UX-FOUNDATION-M1`. Product decisions DEC-17 through DEC-20 remain explicit preview assumptions until the client records them.

Responsible product/visual owner: Anjaneya. Sole human fixed-SHA acceptance reviewer: Kartik. Proposed UI author: fresh verified `gpt-6-astra` / medium. Fresh external Claude fixed-SHA review follows Astra authorship. Any shared contract, authorization, allocation, quotation or rating change requires a separate owner and specialist review.

Client visual direction: `docs/CLIENT-WISPR-INSPIRED-REDESIGN-BRIEF.md`. Kartik rejects the current full-teal poster hero and fixed side dial. The replacement uses a calm ivory product-led first view, concise outcome copy and an interactive four-product brief preview while preserving TNP's own identity. The shared switcher is supplied by the integrated UX foundation; this task must not reimplement it locally.

## Result

Deliver a responsive, task-first Client workspace and TNP Planner experience that implement the corrected product model without confusing a client's own representative with a TNP Planner or granting authority in the browser.

The UI must make these truths obvious:

- TNP sells four product families: workforce people, TNP Planner, Venue and RSVP.
- A client-appointed planner is a scoped member of the Client organization. They may request products for that client but are not a TNP Planner.
- A TNP Planner is an experienced TNP professional whose application and approval are controlled by Admin.
- A request is not a booking, assignment or entitlement. Only Admin issues an official quotation and fulfillment grant.
- After a grant, the assigned TNP Planner may propose/select venue and workforce only inside that grant; server allocation remains authoritative.

## Proposed exact ownership

- `app/client/**`
- `app/planner/**`
- `components/tnp/portals/client/**`
- `components/tnp/portals/planner/**`
- feature-local presentation adapters, fixtures, styles and tests inside those directories

Freeze AppShell/global CSS, shared contracts/services/fixtures, Operations, Freelancer, RSVP, homepage/public surfaces, packages, server/provider configuration and production data. Shared route, demo, PartnerCard, action, number and density primitives must be consumed from the integrated UX foundation rather than copied.

## Client workspace

### Entry and guidance

- Open with the client's event goal, current order/quotation state and one dominant next action.
- Replace the current palace-led full-teal hero with the compact product-led composition in `CLIENT-WISPR-INSPIRED-REDESIGN-BRIEF`: promise, primary action and truthful interactive four-product brief preview in the first viewport. Move supporting photography into evidence/story contexts with provenance.
- Offer a guided event builder for event basics, service selection and review. Avoid asking users to understand internal TNP terminology before selecting a need.
- Present each workforce role separately: Event Coordinator, Event Executive, Hostess, Volunteer and Porter. Never hide them behind a generic `freelancers` card.
- Present TNP Planner, Venue and RSVP as distinct products with clear inclusions, exclusions, current state and one primary action.
- Let the client explicitly choose `I have my own planner` or `I need a TNP Planner`; explain the permission and service difference before submission.
- Permit every product family alone or in combination. Provide explicit `Not needed`, `I already have a venue` and `I have my own planner` paths; Venue and TNP Planner must never be mandatory merely to submit a request.
- Preserve requester and billing organization as separate identities so an invited client-appointed planner may prepare the request without becoming the buyer or a TNP Planner.

### Order, quotation and grant states

- Compose multiple product order lines for one event and show quantity, date/shift or scope qualifiers without inventing prices.
- Preserve request identity through draft, submitted, clarification requested, quotation issued/revised/expired, client accepted/declined and grant issued/revoked states.
- Official price appears only from an Admin-issued quotation version. Use integer paise presentation and explicit tax/deposit placeholders only when supported by the reviewed contract.
- Acceptance is not payment success; payment is not fulfillment grant; grant is not resource assignment. Display these milestones separately.
- Provide loading, empty, validation, submit failure, retained retry, stale version, permission denied and read-only historical states.

### Evidence-rich choices

- Venue results use the shared partner-card pattern: attributable/illustrative image provenance, name, city, capacity, availability evidence, price qualifier and one selection action.
- TNP Planner choices use approved professional evidence: specialties, cities, experience, relevant rating count, approval/availability state and consented imagery. Never expose identity documents, private contact data or financial information.
- Do not fabricate star ratings, review counts, verified badges, precise prices or availability. Label all preview records synthetic.

## TNP Planner journey and workspace

### Public explanation and application

- Explain the experienced TNP Planner role, responsibility level, evidence required, review process and difference from ordinary workforce roles.
- Provide clear `Apply to become a TNP Planner` and `Sign in to Planner workspace` actions.
- Application covers professional experience, cities, event categories, leadership evidence, availability and consent. It must support saved draft, submitted, under review, revision requested, approved, declined and suspended states.
- Approval remains an Admin decision. The UI must never self-upgrade an applicant or imply that form submission grants Planner authority.
- An approved but unassigned TNP Planner receives a truthful no-assignment workspace and no Client event data. Suspension or revocation removes event actions without erasing historical status evidence.

### Approved Planner dashboard

- Start with assigned events, attention items, today's work and the next permitted action—not decorative totals.
- For each event show the client brief, granted products/limits, quotation/grant version, deadlines and unresolved decisions.
- Resource planning lets the Planner browse eligible venue/workforce evidence, build a proposal and submit an assignment request inside the active grant.
- Selection does not become assignment until the authoritative service succeeds. Surface capacity, overlap, eligibility, changed-grant, stale-data and rejected-assignment states.
- Show workforce applicants/eligible workers with role, verified skills, assignment history, relevant rating count, availability and event-scoped reviews. Keep private KYC/contact/payment data hidden.
- Provide event-scoped Team, Instructions, Reconfirmation, attendance-scan evidence and RSVP status destinations only when the assigned grant and named capability allow them. Internal staff notes remain inaccessible.
- Rating actions are event/assignment scoped. A TNP Planner may rate assigned workforce only under the reviewed hierarchy; no self-rating or unrelated-event rating.

## Interaction, density and motion

- At 1440px, keep the role/task title, current state and primary action in the first viewport; avoid oversized empty panels.
- Make every interactive item recognizable without hover through label, shape, contrast, icon support where useful and visible focus.
- Adopt `docs/contracts/UX-SURFACE-ELEVATION.md`: use raised interactive cards for product choices, Venue/TNP Planner evidence, assigned-event next actions and grant/resource attention queues; keep routine forms, history and dense records flatter.
- Use the body/interface font with tabular numerals for quantities, dates and money; reserve display typography for headings.
- Use motion for route continuity, step progress, saved/submitted state, list-detail selection and successful server-confirmed actions. No looping decoration in dense workspaces.
- Respect reduced motion, keyboard order, focus return, 200% zoom, touch targets and non-obscuring preview chrome.

## Required verification

- Viewports `1440x900`, `1100x900`, `390x844` and `320px` for the order builder.
- Keyboard: skip link, Tab/Shift+Tab, Enter/Space, Escape, dialogs/drawers, focus return and visible focus.
- Two client organizations, two events and two quotation/grant versions preserve exact identity across refresh, list/detail and Back/Forward.
- Prove client-appointed planner cannot enter TNP Planner authority and an unapproved TNP Planner cannot access the approved dashboard.
- Prove a product request cannot display as quoted/granted/assigned without the corresponding adapter state.
- Prove changed grant, allocation rejection and lost-response retry do not create a false assignment or duplicate request.
- Run focused tests, shared preview regressions, lint, explicit non-incremental TypeScript, Vercel build, diff check and browser console/hydration checks.

One immutable fixed SHA, fresh external Claude review and Kartik acceptance precede P-controlled integration. No main push, deployment, provider connection or production mutation.
