# TNP-FREELANCER-ASTRA-M1 — onboarding, opportunity and notification frontend

Status: DRAFT — no writer lease. Prepared from the user's 2026-09-18 instruction to complete all remaining non-3D frontend pages and workflows.

## Result

Use verified `gpt-6-astra` / high to replace the current static Freelancer shell with complete mobile-first synthetic application, assessment, opportunity, claim, assignment response and notification-centre workflows backed by reviewed contracts.

## Proposed ownership

- `app/freelancer/**`
- `components/tnp/portals/freelancer/**`
- local Freelancer presentation helpers/styles/tests only

Freeze AppShell/global CSS, other portals, shared contracts/services/fixtures, packages, server allocation/notification code and providers.

## Prompt 1 — application and assessment

- Editable application steps for personal details, experience, skills, availability and preferred role using synthetic-safe fields.
- Assessment questions/results, validation, previous/next, loading/error/retry/recovery and submitted reference.
- Application tracking by reference without login.
- KYC status presentation only; no real identity document or live verification claim.
- Admin-review pending/approved/rejected/change-requested states and truthful portal-access gating.

## Prompt 2 — opportunities, assignment and notifications

- Eligible opportunity feed/detail filtered by role, schedule, location and availability; full/ineligible/overlap/unavailable states come from the service.
- Claim action, live filled/required counts, duplicate/retry/conflict handling and exact assignment identity.
- Distinct initial claim, Coming, Not Coming, no-response, released, cancelled and replaced states with briefing acknowledgement.
- Notification centre UI for opportunity publication and assigned pre-event confirmation prompts. It must display synthetic delivery state unless the production notification service is integrated.
- Server-owned recipient eligibility is mandatory. Never show an unrestricted client-side broadcast to all accounts.

## Gates

Requires reviewed/integrated platform auth and workforce/allocation/notification contracts plus an exact source/launch/lease/reviewer packet. Verify 1440/1100/390, real keyboard/touch, application recovery, two opportunities/assignments, capacity/eligibility/overlap errors, refresh/reset and notification read/expiry behavior. Real FCM/device tokens/jobs/provider delivery are separate backend work.
