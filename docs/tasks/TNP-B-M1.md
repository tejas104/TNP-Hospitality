# TNP-B-M1 — two-prompt frontend milestone for B

Status: DRAFT, NOT DISPATCHED. Writer lease NONE.
Human owner: Anjaneya / H1 for product/content/visual inputs. Sole human fixed-SHA reviewer: Kartik.
Host: Laptop 1 / DESKTOP-DL9FDM7.
Tool/model: Codex gpt-6-astra / high for the homepage motion/3D design milestone, per the user's 2026-09-17 instruction; confirm the actual session/model/effort at Ready.
Branch: codex/tnp-b-m1 (proposed; not created).
Worktree: D:\TNP-worktrees\TNP-B-M1 (proposed; not created).
Source and integrated foundation SHA: PENDING approved integration.
Launch SHA: PENDING future Ready commit, supplied externally by P.
Dependencies: integrated TNP-FOUND-01; TNP-B-01, split into two implementation checkpoints within the same existing scope. The second phase's first-phase dependency is an internal checked checkpoint in this grouped milestone, not a separate integration.
Owned paths: `components/tnp/HomeExperience.tsx`; `components/tnp/public/**`; `components/tnp/AppShell.tsx` and `app/globals.css` only for the serialized public-shell/skip-link correction; `app/services/[slug]/page.tsx`; `app/departments/[slug]/page.tsx`; `app/contact/page.tsx`; `data/public-content.ts`; `data/media.ts` only for documented client-supplied replacements.
Mode: local labelled synthetic responsive-web preview.
Resource proposal: port 3102, http://localhost:3102; check free before binding. Dedicated synthetic profile; no current reservation.
Risk: Public-facing motion/3D and navigation. Content approval remains separate; reduced-motion, mobile performance, non-WebGL fallback and truthful separation from the synthetic Operations preview are acceptance gates.
Review appointment: fresh external Claude fixed-SHA review after Astra authorship, plus Kartik as sole human reviewer. Independent Sol is added if implementation crosses architecture/security/data boundaries. Anjaneya/client still supply content and visual decisions but are not a second code-review gate. Actual appointments PENDING.
Sharing: proposed original builder-only non-force push to codex/tnp-b-m1; effective only in the Ready contract. No current push or write lease.

## Shared execution rules
This is a prepared draft, not a launch instruction. P will issue the Ready version only after reviewed foundation integration, actual appointments and capacity are recorded. Do not send a developer into a missing prerequisite. SOURCE_SHA, dependency integration SHA, LAUNCH_SHA and exclusive lease are deliberately PENDING; candidate c53e13149be79f3b97aea4ef9fd3b7c8e82d2423 is not an integrated baseline.

At activation read AGENTS.md, TNP-START-HERE.md, docs/PRODUCT.md, docs/DESIGN.md, docs/DOMAIN-RULES.md, docs/ARCHITECTURE.md, docs/LAUNCH-PROTOCOL.md, docs/REVIEW-CADENCE.md, both foundation contracts and the referenced phase specifications. This grouped TASK supersedes their separate per-slice launch branches only when Ready. Verify actual host/model/session, clean initial HEAD=LAUNCH_SHA, SOURCE_SHA ancestry, integrated dependency ancestry and the launch three-file allowlist. Preserve unrelated changes; never reset to make a check pass.

Work through Prompt 1 then Prompt 2 within ONE branch/worktree and ONE lease. After Prompt 1, run its applicable checks, commit and non-force push the named branch once authorized by the Ready contract. Send P the checkpoint SHA, then continue Prompt 2 without waiting for formal review. Pause early only for a shared-contract gap, ownership conflict, failing prerequisite or material security/financial issue. No other task, implementation subagent or writer is authorized.

For every mutation capture expectedGeneration at invocation and retain requestKey for retries of that same action. Handle structured errors and STALE_GENERATION without overwriting newer state. Consume shared services; no local competing shared fixtures, adapter bypass, fabricated success or production authority. Local view/draft state may remain in the owned feature directory, with clearly scoped synthetic-only persistence and reset behavior; raise any missing shared contract to P before inventing a cross-portal representation.

Forbidden: PortalPages barrel, PortalHero, PreviewControls implementation, existing portal route glue, other shared components, lib/contracts, lib/demo, lib/services, package/lockfiles, framework/provider/auth/database config, docs/registers, other lane views, unrelated deliverables/tmp. The explicitly listed AppShell/global-CSS public-shell correction and new public routes are the only shared/route exceptions. Preserve portal preview controls inside labelled portal routes while removing them from the public homepage/service/contact experience. Responsive web only. No live provider calls, real personal data, native app or deployment.

## Checks and final handoff
At both checkpoints run npm run lint; npx --no-install tsc --noEmit; node --experimental-strip-types --test tests/preview-contract.test.mjs; npm run build:vercel; git diff --check. Use npm ci for the initial clean install; reuse this worktree's dependencies afterward unless repair is necessary. Never copy another worktree's node_modules. One heavy build per laptop at a time. No npm test/typecheck/E2E script is assumed to exist.

Verify affected routes at 1440x900 and 390x844 with actual keyboard Tab/Enter/Space, visible focus, primary actions, loading/empty/error/success, refresh/reset, correct record identity and no footer obstruction/overflow. Retain the synthetic warning. Record exact SHA, origin, steps, results and screenshots/assertions outside tracked source. Do not equate a screenshot with interaction proof.

Before final push, self-check the whole two-prompt milestone against both acceptance lists and resolve failures in owned paths. Report both checkpoint SHAs, final fixed HEAD, changed paths, exact commands/results, inherited warnings, browser evidence, known gaps and actual model/session/host. Pause the lease. P fetches the named ref, verifies remote/fixed SHA and ownership, then obtains one consolidated milestone review at that fixed commit. Original builder handles consolidated findings, followed by delta/regression re-review. No force-push, main merge/push or deployment.

Foundation is a prerequisite; TNP-I01 remains the later integrated cross-portal browser gate. A lane's completion does not certify other portals or production behavior.

## Prompt 1
This is the public-site milestone, not permission to change platform/domain behavior. Build F01 readiness within B-01 using `gpt-6-astra`: preserve the strong photography and editorial hierarchy, then deliberately refine motion, transitions and depth. Replace the current pavilion with a materially different single purposeful 3D guest-journey/venue-choreography model—not a recolour—while preserving one-canvas, capped-DPR, offscreen pause, manual pause, reduced-motion, mobile and non-WebGL fallbacks. Resolve the external review findings: AA body-text contrast, 3:1 focus indication on light surfaces, a truthful vendor-interest enquiry action, and a useful first-focus skip link. In the bounded AppShell scope, remove public Login/Operations Demo/PreviewControls/portal-switcher exposure from public homepage/service/contact routes while preserving clearly labelled portal previews on portal routes. Do not add another photo wall; retain roughly 75% of placements with transparent accounting. Make anchors and primary actions work. Inventory missing approved copy/assets as gaps; never invent client approval. Commit/push checkpoint 1 after checks and continue Prompt 2.

## Prompt 2
Complete F02 within B-01: reusable service/department detail pages with valid/invalid slug handling and enquiry entry/receipt through submitEnquiry. Validate synthetic name/email/message, display pending/error/retry and persisted receipt, and replay a repeated request safely without claiming an email was sent. Recheck every homepage link created in Prompt 1 against the final destinations. Use documented content provenance; missing three-service/twelve-department approved copy or TNP imagery prevents content certification even if the preview UI works. Do not fill empty screens just to count them as ready. Run final desktop/mobile/keyboard and shared checks, push final checkpoint and pause.
