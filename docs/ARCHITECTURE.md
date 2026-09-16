# Architecture: observed and proposed

## Observed at 9d58061f2d36514ebc932fa94bb3dc90f4b97a97
Single frontend package. React 19.2.6; Vinext 1.0.0-beta.5; Vite 8.0.13; Nitro ^3.0.260903-beta; TypeScript 5.9.3; npm lockfile.
Five route entries: app/page.tsx, app/client/page.tsx, app/planner/page.tsx, app/freelancer/page.tsx, app/admin/page.tsx.
Root layout wraps AppShell and global CSS. Four route files import components/tnp/PortalPages.tsx (ClientExperience, PlannerPortal, FreelancerPortal, AdminOperations); three helper functions also live there.
data/tnp.ts and data/media.ts are presentation data. Portal actions use component-local React state. No API routes, database, auth server, durable jobs or production provider services are tracked.
vite.config.vercel.ts uses Vinext + Nitro; build:vercel sets NITRO_PRESET=vercel. vite.config.ts uses Sites/Cloudflare plugins and .openai/hosting.json. These are two existing build configurations, not proof of two production deployments. start uses Wrangler dist/server/wrangler.json.
No apps/* or packages/* monorepo exists. Do not create one simply to match the PDF.

## First frontend boundary (Draft until reviewed)
Existing routes -> extracted portal components -> typed feature service interfaces -> one synthetic preview adapter/store.
S0 owns extraction/theme/route glue; S1 owns contracts, fixture schema and shared preview adapter. A/B/C/D then own disjoint views. Exact paths and transitions: contracts/S0-SHARED-UI.md and contracts/S1-PREVIEW-INTERFACES.md.
No production rule moves into browser storage. Preview can model specified outcomes; it cannot certify allocation, KYC, attendance or finance.

## Production direction (proposal, not implemented)
Responsive web -> versioned HTTPS API -> Node domain/application modules -> MongoDB Atlas and private object storage -> durable jobs/provider adapters.
Prefer a modular backend rather than multiple services for two humans. Express and Mongo are the source direction; hosting, auth/session implementation, contract tooling, job persistence and deployment remain reviewed decisions.
Domain boundaries: identity/permissions; demand (enquiry/booking/planner); events/positions/single allocation; attendance/ratings; finance (collections separate from payouts); guests/basic RSVP.
H1 owns demand and presentation; H2 owns platform/workforce/finance. This is a concentrated H2 bottleneck, not four independent domain engineers.

## Future mobile
Reuse domain rules, server authorization and API DTOs. Use stable IDs, ISO timestamps/timezones, integer paise, structured errors/pagination and idempotent mutations. Keep provider secrets/server models off clients.
No native UI, mobile endpoints without a current use, background geofence promise or premature framework migration.
See architecture/decisions/ADR-0001-web-preview-boundary.md. Independent Sol review is pending; this architect cannot approve its own boundary proposal.
