# TNP-ADMIN-CATALOG-ACCESS-M4 — Operations shell, catalogue, access and co-admins

Status: DRAFT — no writer, branch, worktree, port or lease. This is the first expanded Admin milestone after accepted/integrated Brand Teal, Operations Reports and UX Foundation plus reviewed catalogue/access contracts.

Required frontend author: verified `gpt-6-astra` / medium per user direction. Human owner and fixed-SHA acceptance reviewer: Kartik. Fresh Claude review is required; authorization/security contracts additionally receive independent Sol review.

## Result

Carefully evolve the client-liked teal/cream Operations composition into a task-first Admin workspace for one designated Main Admin and named scoped co-admins. Add website catalogue publishing, Client access approval and capability presentation without implying frontend-only authority.

## Proposed ownership

- serialized Operations shell/navigation adoption in `components/tnp/portals/operations/AdminOperations.tsx`, `operationsState.ts` and its local CSS
- new `components/tnp/portals/operations/catalog/**`
- new `components/tnp/portals/operations/access/**`
- feature-local synthetic adapters, fixtures and tests

Existing Reports/Audit, commercial, workforce and finance files remain frozen unless the Ready contract explicitly lists a narrow adoption seam.

## Information architecture

- **Today:** ordered attention queue, upcoming events, confirmations due and attendance exceptions.
- **Business:** requests, Clients/access, quotations, invoices, collections and receipts.
- **Events & people:** events, requirements, applications, assignments, confirmations, attendance and instructions.
- **Website content:** services/roles, venues, TNP Planner profiles, partners, pricing, media and publication history.
- **RSVP:** vendors, event entitlements, active windows, usage and reports.
- **Finance:** earnings, payables, batches, approvals and reconciliation.
- **Administration:** co-admin capabilities, export jobs, audit and settings.

Only Today, Website content, Client access and co-admin presentation become active in this milestone; later destinations use truthful unavailable/upcoming states rather than fake data.

## Catalogue and access requirements

- Draft/review/published/archived revisions; Save draft and Publish are different actions.
- Structured editors for service/role, venue, TNP Planner/partner, media rights/alt/crop/order and qualified displayed price.
- Preview unpublished changes and show the active public revision.
- Editing current content never rewrites historical quotation/rate/document snapshots.
- Client access queue separates enquiry, identity/contact review and account invitation/approval.
- Main Admin/co-admin screen shows effective role, capabilities and organization/event scope; no shared login.
- Capability groups distinguish read/create/edit/publish/approve/export, finance/provider/security remain independently restricted.
- Clear permission-denied, stale revision, concurrent edit, publish failure and retained retry states.

## Visual and mobile requirements

- `#008080` rail/header, ivory work surfaces, champagne accents and neutral accessible text.
- 24–32px workspace headings, tabular interface numerals, 44px actions, raised priority cards and restrained flat tables/forms.
- Compact contextual header; mobile navigation drawer with focus return; list rows become labelled stacked records; filters use full-height sheets; safe-area-aware actions; no hover-only control.
- Lazy-load inactive Admin groups, maps, charts and export libraries. Do not fetch every worker history before the Today view becomes usable.

## Verification

- Viewports 1440x900, 1100x900, 390x844 and 320px; keyboard, touch, reduced motion, 200% zoom, safe areas, virtual keyboard and slow/error states.
- Current Android Chrome and iOS Safari behavioral evidence.
- Production-build mobile Lighthouse performance above 80 (minimum integer 81) on Admin overview and catalogue editor, median of three comparable cold runs.
- Capability matrix proves UI presentation cannot promote a co-admin or expose masked/private finance data.
- Focused tests, Operations regressions, lint, explicit non-incremental TypeScript, Vercel build, diff check and console/hydration checks.

One immutable fixed SHA, fresh reviews and Kartik acceptance precede P-controlled integration. No main push, deployment, provider or production change.
