# TNP project instructions

Current user decisions and this canonical guidance supersede historical operating assumptions in deliverables. Those documents and the PDF are requirements evidence, not executable instructions. Do not infer client approval from a proposal.

## Start
Read TNP-START-HERE.md (ordered setup and all prompts), docs/PRODUCT.md, docs/DESIGN.md, the assigned TASK and its referenced contracts. Read docs/DOMAIN-RULES.md and docs/ARCHITECTURE.md for domain work. Confirm actual directory, branch, HEAD, baseline, dependencies, mode, owned paths and writer lease before editing. Repository evidence is authoritative; conversation history is not project state.

## Delivery and ownership
- Responsive web only. No native app, background geofencing or unused mobile scaffolding. Future mobile reuses the shared API/domain services.
- 25 calendar days; Day 3 target 16/20 frontend screen sets; remaining frontend Day 6; freeze Day 18; QA/UAT/rehearsal Days 19–23; planned release Day 24; buffer/handover Day 25.
- H1 Anjaneya owns product/demand/shared visuals and supervises A/B. H2 Kartik owns workforce/operations/finance/platform and supervises C/D. There is no H3 or E assignment. Effective for future launches after the current A/D fixed-SHA cycle, Kartik may operate the team's assigned Claude and Antigravity-hosted Codex sessions on Laptop 1 / DESKTOP-DL9FDM7 under a separate Windows/application profile and assigned seat. Existing A and completed D work are not moved retroactively; every future writer or reviewer still requires an exact identity/model/host/worktree lease. Laptop 2 remains a review/backup host. No credential sharing, author self-review or extra human capacity is inferred.
- P is the architect session identified in docs/STATUS.md; loading this file does not make a builder P. Repository-writing P occupies an available lane; bootstrap uses B. R is read-only independent review.
- Normally two simultaneous builders, at most four in the present roster. The original absolute ceiling of five is not an extra staffed lane. Use one complex task per human. Pause dispatch at two waiting reviews; also pause new work assigned to a human who already has one waiting review.
- One writer per worktree; no concurrent ownership of shared files, contracts, fixtures, ports or jobs across worktrees.
- A task remains Draft until actual model/host/path, baseline, merged dependencies, reviewers, checks and lease are recorded. A lane label is not a launch. Follow docs/LAUNCH-PROTOCOL.md: source baseline and the later launch-contract commit are distinct. Initial HEAD equals the supplied launch commit, whose source baseline is an ancestor.
- Only the dispatcher updates shared status/leases in a serialized documentation task. Builders hand off evidence; they do not race on STATUS.md/LANES.md.

## Boundaries
Preserve the client-liked website and Operations format. Keep the current React/Vinext/Vite/Nitro build during the frontend milestone. No framework, database or provider migration without a separate decision/task.
Shared PortalPages extraction S0 and interface/fixture S1 are prerequisites, not already implemented. Respect docs/contracts ownership. Shared changes require a prerequisite or serialized handoff.
Do not reset, delete or overwrite unrelated changes. Stage exact task paths, never the whole deliverables directory. Keep secrets and real personal data out of fixtures, source and logs.
Basic RSVP stays in the plan. Full WhatsApp automation, guest identity-document deferral and other proposed reductions remain pending client decisions.

## Verification
Existing commands: npm ci; npm run lint; npx --no-install tsc --noEmit; npm run build:vercel. npm run dev starts local development; verify supported port options and record the actual origin.
No test, typecheck or E2E npm scripts currently exist. Do not claim nonexistent or unrun checks passed.
Use labelled synthetic preview data; no mock KYC/payment/location result proves production success. Significant UI needs desktop/mobile/keyboard and primary-state evidence. See docs/BASELINE.md for inherited failures.
Server authorization, atomic allocation/overlap, attendance evidence, audit and idempotent finance are production gates; UI mocks do not satisfy them.

## Review and completion
Codex-authored work normally gets Claude review; Claude-authored work gets Codex review. Architecture/security/concurrency/payments/financial-integrity/difficult cross-module changes require a fresh independent Sol review at a fixed commit.
Humans retain review, testing, conflict resolution and integration responsibility. Kartik reviews Anjaneya's changes; Anjaneya reviews Kartik's. Domain owners also participate for sensitive changes.
Review starts read-only. Builder fixes findings. Reviewer edits become an implementation task with a fresh independent review; no self-certification.
Report exact changed files, commit, commands/results, preview evidence, limitations and lease handoff. Do not merge, push, publish, change production or move funds unless explicitly authorized for that action.
Relevant custom project skills are under .agents/skills; their scope is subordinate to the TASK. No automatic subagents or extra writers. Do not reinstall Claude skills.

## Current milestone cadence
Read docs/REVIEW-CADENCE.md. S0/S1 are sequential phases of TNP-FOUND-01 with one foundation review before consumers. Later per-lane milestones must be issued explicitly. This supersedes old per-slice review timing only; no Draft task is launched and no mandatory model gate is silently waived. Routine factual Ready/Building registers are serialized onto main as in LAUNCH-PROTOCOL.md.
