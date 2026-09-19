# TNP-PUBLIC-REQUEST-ACCESS-M3 — four-product discovery, direct requests and access

Status: DRAFT — no writer, branch, worktree, port or lease. Homepage is excluded and remains last. Launch waits for accepted/integrated Brand Teal and UX Foundation plus reviewed public-enquiry/access interfaces.

Proposed frontend author: verified `gpt-6-astra` / low. Human owner and fixed-SHA acceptance reviewer: Kartik, with Anjaneya providing product/content decisions. Fresh Claude review is required.

## Result

Give a non-technical visitor four clear choices—Hospitality, Planner, Venue and RSVP—and let them submit a useful request without login. Hospitality can include several roles and quantities in one request. External planner-business intake stays short and separate from applying to become a TNP Planner. Client workspace access is visibly Admin-approved rather than silently created.

## Proposed ownership

- public service/access routes excluding `/`
- new public request/access components under `components/tnp/public/**`
- feature-local styles, preview adapters, fixtures and tests

Freeze homepage/3D, shared shell/tokens/contracts, authenticated portals, packages, providers and production data unless a later Ready contract grants an exact serialized prerequisite.

## Required pages and states

- Services overview with four product choices and destination-accurate actions.
- Hospitality overview plus individual workforce-role pages.
- Mixed-role request wizard: roles/quantities → event/date/time/location → planner preference → contact → review → reference receipt.
- External planner `Tell us what you need`: name, company, phone, email, optional GST and selectable Hospitality/RSVP/Venue requirements.
- Separate TNP Planner explanation/application entry.
- Client access request, pending, approved/invitation, declined and expired states.
- Loading, validation, retained retry, duplicate submission, permission/access unavailable and offline-safe draft states.

Submission must never claim booking, quotation, payment, grant or assignment. Preview data is labelled synthetic and contains no real personal information.

## Mobile and quality gates

- Current Android Chrome and iOS Safari-sized behavior, safe areas, virtual keyboard, 44px targets and 16px-or-larger form inputs.
- Viewports 1440x900, 1100x900, 390x844 and 320px; keyboard, reduced motion, Back/Forward, refresh and error recovery.
- Representative production-build mobile Lighthouse performance above 80 (minimum integer 81), median of three comparable cold runs with build/tool/profile recorded.
- Focused tests, lint, explicit non-incremental TypeScript, Vercel build, diff check, console/hydration and horizontal-overflow checks.

One immutable fixed SHA, fresh review and Kartik acceptance precede P-controlled integration. No main push, deployment, provider or production change.
