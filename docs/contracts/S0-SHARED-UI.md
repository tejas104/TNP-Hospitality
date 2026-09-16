# S0 — Shared portal extraction and theme ownership

Status: Draft; exact intended paths below, implementation baseline is the future integrated bootstrap SHA.
Owner: B / Anjaneya. Review: Claude, Kartik and independent Astra. No parallel owner.

## Existing source and destinations
| Existing export | S0 destination |
|---|---|
| ClientExperience, PortalPages.tsx:23 | components/tnp/portals/client/ClientExperience.tsx |
| PlannerPortal, :116 | components/tnp/portals/planner/PlannerPortal.tsx |
| FreelancerPortal, :209 | components/tnp/portals/freelancer/FreelancerPortal.tsx |
| AdminOperations, :358 | components/tnp/portals/operations/AdminOperations.tsx |
| PortalHero, :523 | components/tnp/shared/PortalHero.tsx |
| Metric, :550 | components/tnp/shared/Metric.tsx |
| StatusPill, :568 | components/tnp/shared/StatusPill.tsx |

Use explicit named exports. Preserve a small compatibility re-export file at components/tnp/PortalPages.tsx during transition. Update the four app portal page imports; no URL changes.
S0 may add the truthful global preview label in AppShell. Preserve theme tokens, selector behavior and approved compositions. Feature-local CSS modules stay within their portal directories after S0.

## Exclusive shared files during S0
components/tnp/PortalPages.tsx, AppShell.tsx, shared/**, the four initial portal component files, app/client/page.tsx, app/planner/page.tsx, app/freelancer/page.tsx, app/admin/page.tsx and app/globals.css.
HomeExperience.tsx is owned ONLY for the four existing no-html-link-for-pages lint errors; preserve imagery/animation/content. AppShell and the extracted PortalHero fix the other four anchor errors. Preserve hash navigation and route transitions.
No broad HomeExperience refactor. hooks/use-mobile.ts warnings are outside scope.

## Freeze/handoff
After S0 integration, feature lanes own only their specified portal directories. Shared shell/helpers/global CSS, all route wiring and compatibility barrel are frozen until another serialized task.
Before separate builders start, verify exported names/imports, every route, desktop/mobile screenshots, focus/reduced-motion and existing local preview actions. Record exact integrated SHA.
S0 does not claim dead buttons are fixed, fixtures shared or production APIs implemented. S1 remains necessary.
