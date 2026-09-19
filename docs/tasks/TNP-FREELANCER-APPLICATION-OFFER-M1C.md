# TNP-FREELANCER-APPLICATION-OFFER-M1C — non-reserving applications and assignment offers

Status: DRAFT — no writer, branch, worktree, port or lease. The integrated Freelancer M1 remains accepted synthetic preview work, but its `claimOpportunity` operation reserves a position and returns an assignment. That behavior does not satisfy the corrected product rule that a Freelancer may apply to multiple non-overlapping events and that applying does not reserve capacity. Do not relabel the existing action. Launch only after a reviewed shared workforce application/allocation contract and integrated UX Foundation.

Required UI author: verified `gpt-6-astra` / medium. Human owner and fixed-SHA acceptance reviewer: Kartik. Fresh Claude review is required; the shared application/allocation and overlap contract requires independent Sol review before this UI task launches.

## Result

Refine the Freelancer workspace into a truthful sequence:

1. role/profile approval;
2. non-reserving event opportunity application;
3. Admin/authorized allocation and offer;
4. Coming/Not Coming offer response;
5. separate pre-event reconfirmation;
6. cancellation/replacement and immutable history.

The worker may retain multiple non-overlapping applications. Once allocated/selected for one event, overlapping applications show a privacy-safe conflict without revealing the other customer or event. Applications for future or non-overlapping work remain active.

## Proposed exact ownership

- existing `components/tnp/portals/freelancer/FreelancerPortal.tsx`
- existing `components/tnp/portals/freelancer/OpportunityWorkspace.tsx`
- existing `components/tnp/portals/freelancer/freelancerState.ts`
- existing `components/tnp/portals/freelancer/useFreelancer.ts`
- existing `components/tnp/portals/freelancer/FreelancerPortal.module.css`
- Freelancer-local application/offer/instruction presentation helpers and focused tests under `components/tnp/portals/freelancer/**`

Shared contracts/services/fixtures, AppShell/global CSS, all other portals, public/homepage files, providers and production state remain frozen. Consume the reviewed role catalogue and workforce adapters; do not recreate them locally.

## Required UI

- Compact first viewport with named identity, approval/standing, current application/offer/reconfirmation state and one recommended action.
- Approved role catalogue including Event Coordinator, Event Executive, Hostess, Volunteer and Porter as supplied by the authoritative contract.
- Opportunity application list/detail with schedule/timezone, role, quantity/rate evidence where supplied, deadline and eligibility explanation.
- Application statuses distinct from offer/assignment statuses. Applying never decrements or reserves filled capacity.
- Offer detail with allocation identity, response deadline and Coming/Not Coming. Reconfirmation is a later action with its own deadline/version and reminder evidence.
- Worker/role-team/event-team instructions with author, revision, audience and read/acknowledged status. Staff-only notes are a separate inaccessible model.
- Reschedule, expiry, cancellation and replacement cannot revive stale response or reconfirmation actions.
- No bank/KYC, another worker's application, other-customer conflict detail or allocation/admin control.

## Required verification

- Two workers, two organizations, overlapping and non-overlapping events, repeated labels and distinct identities.
- Multiple applications persist; Apply does not reserve; successful allocation flags only overlaps; future/non-overlap applications remain active.
- Duplicate, lost-response, exact retry, changed-payload conflict, stale version, generation reset and storage-denial behavior.
- Offer response and reconfirmation are distinct; reschedule invalidates old deadline/jobs; expired/replaced records cannot reactivate.
- Instruction audience isolation and no internal-note exposure.
- 1440x900, 1100x900, 390x844 and 320px; keyboard, touch, focus return, 200% zoom and reduced motion.
- Focused Freelancer/shared contract tests, relevant integrated regressions, lint, explicit non-incremental TypeScript, Vercel build, diff check and browser console/hydration review.

One immutable fixed SHA, fresh reviews and Kartik acceptance precede P-controlled integration. No main push, deployment, provider or production change.
