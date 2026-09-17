# B — public service/contact read-only preflight result

Status: PREFLIGHT COMPLETE; implementation remains DRAFT and unleased.

## Superseding supplied candidate evidence

The user subsequently supplied another read-only B preflight from task/session `01a0aa5f-c6ee-76e2-93db-6b50e124d174` on DESKTOP-DL9FDM7. Its Draft assignment was gpt-5.6-sol/high, but the runtime did not expose model or reasoning effort. It inspected fetched `origin/main` `fab88ed354ed66ab62bf6f6e17d1de72a2174c6a`, created no worktree/branch/lease/port and preserved the base checkout's untracked `tmp/`.

Use this latest supplied task identity, rather than the earlier candidate below, if B is later considered for a Ready reservation. It is still only identity/preflight evidence: A is waiting review, homepage gates/content approval remain open, current canonical main has advanced, and no B lease exists.

## Observed candidate identity

- Candidate task/session: `01a0ae9b-bcf5-72c3-832e-aab191268ba6`; trusted `CODEX_THREAD_ID` and `CODEX_SESSION_ID` matched.
- Host: DESKTOP-DL9FDM7 / Anjaneya Laptop1.
- Runtime exposed only the GPT-5 family; exact model and effort were not observable. Do not record Sol/high as confirmed from this preflight.
- Read-only checkout: `D:\TNP Hospitality`, local `main` at `00430c7c83e2cb687a72f5c10ba4fdf4bf796cdc`, with fetched `origin/main` at the then-current handoff commit. Existing untracked `tmp/` was preserved.
- Proposed `codex/tnp-b-m1` branch and `D:\TNP-worktrees\TNP-B-M1` worktree did not exist. No port was reserved.

This is a candidate identity only. No source write, worktree creation, branch creation, commit, push, lease claim, server, merge or deployment occurred.

## Content and route inventory

The tracked scope evidence calls for three service subpages and twelve department entries but does not provide a complete approved catalogue. The following are proposed subjects pending Anjaneya/client content acceptance:

### Proposed services

- `/services/event-staffing` — Event Staffing & On-ground Teams.
- `/services/rsvp-guest-hospitality` — RSVP, Guest Hospitality & Logistics, with separate truthful paths for TNP-managed service and vendor access.
- `/services/venue-event-discovery` — Venue & Event Discovery.

### Subjects actually evidenced in current preview data

- `/departments/event-coordinators`
- `/departments/event-executives`
- `/departments/volunteers`
- `/departments/hostesses-guest-hospitality`

The other eight department names, slugs, descriptions and images are absent. They must not be fabricated to satisfy a count; unknown or unaccepted slugs should use an explicit not-found experience until approved content exists. Detailed service copy, official contact details, prices/service levels and client-supplied TNP imagery also remain unavailable. Current Unsplash/local preview media is not approved-content evidence.

RSVP copy must distinguish the two confirmed directions: TNP manages RSVP/guest hospitality for clients with a planned client portal; separately, TNP provisions vendor accounts whose vendors manage their own events/guests while TNP administers access and entitlements. Vendor login, WhatsApp automation, private documents and exports remain planned until implemented. Do not claim a delivered message, approved provider or usable production account.

## Proposed exact future ownership

A Ready contract should name files individually and freeze the existing homepage/shared files:

- `app/services/[slug]/page.tsx`
- `app/services/[slug]/not-found.tsx`
- `app/departments/[slug]/page.tsx`
- `app/departments/[slug]/not-found.tsx`
- `app/contact/page.tsx`
- `data/public-content.ts`
- `components/tnp/public/PublicDetailPage.tsx`
- `components/tnp/public/PublicDetailPage.module.css`
- `components/tnp/public/PublicRouteNotFound.tsx`
- `components/tnp/public/ContactEnquiry.tsx`
- `components/tnp/public/ContactEnquiry.module.css`

Do not wildcard-own `components/tnp/public/**` while the paused homepage candidate owns existing `Home*`, `Pavilion*` and `webgl*` files. Homepage CTA/link changes require a separate serialized handoff after homepage acceptance/integration; B must not edit the moving homepage branch.

## Contract and launch blockers

- `submitEnquiry` supports only name, email and message. The bounded UI can place visible interest context in the message; phone, organization, subject/service fields require a reviewed shared-contract amendment.
- A successful receipt has `sentExternally: false` and must say the synthetic enquiry was saved locally and no email/WhatsApp message was sent.
- B needs a durable generation-scoped local action identity and receipt across retry/reload, matching the correction pattern now under A review.
- `docs/tasks/TNP-SHARED-FIX-01.md` owns the PreviewControls reload collision; no B workaround may change the frozen shared service.
- The accepted homepage candidate must be reviewed, human-approved and integrated into the future B source baseline before B connects its final service/contact CTAs.
- A is waiting review on Anjaneya's lane and the homepage still has separate Sonnet/human gates. Queue/capacity rules therefore prohibit a B implementation launch now.
- Ready still needs an exact model/effort selection, immutable source/launch SHA, actual writer reservation, exact paths, clean worktree, port and reviewer appointments.

## Future verification matrix

At the eventual two checkpoints verify accepted/unknown slugs, truthful/provenance-labelled content, homepage preservation, 1440x900 and 390x844, keyboard/focus/no overflow, enquiry validation, pending/error/retry, persistence failure, reload deduplication, changed payload, reset/stale generation and `sentExternally: false`. Run lint, explicit TypeScript noEmit, shared contract tests, Vercel build and `git diff --check`; then fresh Sol, separate Sonnet, Kartik human review and Anjaneya/client content disposition.

No live provider call, production auth, main merge or deployment is authorized.
