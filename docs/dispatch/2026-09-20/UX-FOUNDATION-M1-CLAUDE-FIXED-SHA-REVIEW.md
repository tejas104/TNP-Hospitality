SESSION TYPE: NEW SESSION

DO NOT OPEN, RESUME OR REUSE ANY OLD TNP CLAUDE/CODEX SESSION. Start one fresh Claude Code desktop review session for this exact fixed-SHA review only.

# TNP-UX-FOUNDATION-M1 — fresh independent fixed-SHA review

READ-ONLY REVIEW ONLY — DO NOT IMPLEMENT.

Review exact immutable candidate:

- source before the launch record: `d8fe3ec39c5d8d9fe540e384529688810c5b2973`;
- launch: `1c2b8d570a7d62f52c01710f190bdb054fdbf632`;
- checkpoint 1: `a06f1b749de22f780b203272ed64bfec410e6dbd`;
- candidate: `653da55991363f910dbeddc3773d55ee507f7491`;
- expected chain: Launch -> checkpoint 1 -> Candidate, with Candidate's direct parent equal to checkpoint 1;
- branch: `codex/tnp-ux-foundation-m1`;
- writer worktree: `D:\TNP-worktrees\TNP-UX-FOUNDATION-M1`;
- detached review worktree: `D:\TNP-review\TNP-UX-FOUNDATION-M1-CLAUDE`;
- review server port: `3119`, only after proving it is free.

First report the actual Claude session ID, model, effort, host/account and PWD. If any runtime field is unavailable, state that honestly. Verify that live `origin/codex/tnp-ux-foundation-m1` equals the full candidate, the parent chain is exact, the candidate checkout is clean and the delta contains exactly the 27 allowlisted files below. Create a clean detached review worktree at the candidate. Do not inspect or alter `D:\TNP Hospitality\output\` or `D:\TNP Hospitality\tmp\`. Stop on any SHA, ancestry, cleanliness, scope or port mismatch.

Read completely before reviewing:

- `AGENTS.md`
- `TNP-START-HERE.md`
- `docs/PRODUCT.md`
- `docs/DESIGN.md`
- `docs/BASELINE.md`
- `docs/REVIEW-CADENCE.md`
- `docs/UX-COMPLETION-BRIEF.md`
- `docs/CLIENT-WISPR-INSPIRED-REDESIGN-BRIEF.md`
- `docs/contracts/UX-SURFACE-ELEVATION.md`
- `docs/tasks/TNP-UX-FOUNDATION-M1.md`
- `docs/decisions/CLIENT-DECISIONS.md`

The current program explicitly excludes the homepage. This candidate may change shared shell behavior only to enforce the homepage-only cursor boundary and preserve inherited homepage chrome. Homepage page/section/3D source and behavior must not be redesigned. This milestone is a shared synthetic frontend foundation; it does not implement production authentication, authorization, persistence, providers, finance, database changes or the broader 18/19 non-homepage completion target.

## Exact changed-file allowlist

Candidate may differ from Launch only in these paths:

1. `app/admin/page.tsx`
2. `app/globals.css`
3. `app/login/page.tsx`
4. `app/operations/page.tsx`
5. `components/tnp/AppShell.tsx`
6. `components/tnp/access/DemoAccess.tsx`
7. `components/tnp/access/ProductPrimitives.tsx`
8. `components/tnp/access/partner-evidence.ts`
9. `components/tnp/access/routes.ts`
10. `components/tnp/access/session.ts`
11. `components/tnp/public/WorkspaceAccess.module.css`
12. `components/tnp/public/WorkspaceAccess.tsx`
13. `components/tnp/public/access-content.test.mjs`
14. `components/tnp/public/access-content.ts`
15. `components/tnp/shared/PartnerCard.module.css`
16. `components/tnp/shared/PartnerCard.tsx`
17. `components/tnp/shared/PreviewControls.tsx`
18. `data/tnp.ts`
19. `public/fonts/INTER-OFL.txt`
20. `public/fonts/InterVariable.woff2`
21. `tests/brand-teal-palette.test.mjs`
22. `tests/ux-components.html`
23. `tests/ux-components.tsx`
24. `tests/ux-foundation.browser.mjs`
25. `tests/ux-foundation.test.mjs`
26. `tests/ux-illustration.svg`
27. `tests/ux-partner-evidence.test.mjs`

Treat any other changed path, portal-local feature edit, homepage page/section/3D edit, package/lockfile change, server/provider change, hidden generated artifact or docs/register edit as blocking.

## Risk-first review

Review in this order and report actionable findings with exact file/line evidence:

1. Requirements and route truth: prove the typed manifest classifies marketing, access, workspace and guest routes exactly; `/operations` is canonical; `/admin` redirects compatibly; RSVP remains an honest unavailable adapter with no missing link; and no false production-authentication claim is introduced.
2. Correctness and state isolation: adversarially test parser allowlisting, corrupt/blocked records, sessionStorage denial, memory fallback, explicit switching/exit/reset, refresh, Back/Forward and two-tab independence. Shell identity must not erase feature records, retries, generations or feature-local persona state.
3. Navigation and accessibility: desktop popover and mobile in-flow menu must share one manifest, never auto-open on hover, close on Escape/outside selection with correct focus return, preserve skip-link order and avoid overlap with task actions or preview controls.
4. Homepage exclusion: inspect the shared shell diff and browser behavior on `/`. The custom cursor must mount only on `/`, clean up across transitions and remain safe for coarse pointer/reduced motion. Existing homepage preloader/drawer/navigation must not be removed or redesigned. Product typography must not leak onto homepage presentation.
5. Typography and visual system: verify the bundled Inter asset and OFL record, semantic tokens, functional weight/leading hierarchy, tabular numerals, exact `#008080` palette, forced-colors behavior, 200% reflow and no competitor trade-dress or proprietary-font copying.
6. Shared primitives and PartnerCard: verify at least three genuine shared consumers; passive/dense records are not decorative card spam; evidence fields never fabricate price/rating/availability/verification; media failures fall back safely; selected/loading/unavailable/error/retry states remain keyboard/touch/reduced-motion usable. Confirm the dev harness is not exposed as a production route or production static artifact.
7. Responsive/runtime regression: inspect access/login, Client, Planner, Freelancer, Operations and homepage shared chrome at `1440x900`, `1100x900`, `390x844` and `320x844`. Check overflow, safe areas, focus visibility, overlays, touch, reduced motion, forced colors, 200% reflow, console and hydration errors.
8. Security/data/architecture: this is synthetic preview access only. Ensure storage contains allowlisted fixture identifiers rather than credentials/PII/claims; no client-side control is presented as server authorization; shared route/session/presentation concerns remain separate from domain eligibility or provider behavior.
9. Tests and maintainability: inspect assertions for real behavior rather than self-matching source strings, mutation gaps or a browser runner that can silently skip. Confirm any alternate Vercel dev error was not masked by source/config changes.

## Required independent verification

From the clean detached candidate, run and report exact commands/results:

- provenance, live remote equality, parent chain, commit count, exact changed-file allowlist and `git diff --check`;
- independently discover and run every `*.test.mjs` below `tests/` and `components/`;
- `npm run lint`;
- `npx --no-install tsc --noEmit --incremental false`;
- `npm run build:vercel` under the documented single unchanged `EBUSY` retry rule only;
- the checked-in browser runner plus fresh manual browser inspection at the four required widths.

Use the canonical `npm run dev -- --hostname 127.0.0.1 --port 3119` browser origin unless repository instructions prove otherwise. Do not change application/dependency/config source to make review tooling work. If the checked-in runner needs an existing Playwright module path, report the exact external path/version used and keep it out of application dependencies.

Browser evidence must cover direct entry, chooser selection, blocked profile, refresh, switching, exit, Back/Forward, two tabs, storage denial, cross-portal reset, keyboard Enter/Space/Escape/outside dismissal/focus return, touch/coarse pointer, reduced motion, forced colors, 200% reflow, overlay clearance and PartnerCard long/missing/broken/illustrative/evidence/loading/error/unavailable/selected cases. Check `/`, `/login`, `/client`, `/planner`, `/freelancer`, `/operations` and `/admin`. Record runtime/hydration/console results and stop the browser/server afterward; prove ports 3118 and 3119 free.

## Builder and architect evidence to reproduce, not inherit

- Author reports clean non-force-pushed remote equality at candidate `653da559...`, 27-path scope, 128/128 tests, lint with one inherited `hooks/use-mobile.ts:16` warning, explicit TypeScript, first-attempt Vercel build and 16 browser scenarios PASS.
- Author reports the initial alternate `npm run dev:vercel` path produced a Vite RSC `environment.runner.import` error; canonical `npm run dev` clean runs passed without source/config workaround.
- Author reports mobile evidence uses Chromium emulation, and 200% evidence uses CSS zoom/reflow rather than a physical browser-toolbar measurement. No physical Android/iOS Safari or Lighthouse certification is claimed.
- Architect independently reverified remote equality, clean worktree, exact chain/scope/diff, all 128 discovered tests, lint with the single inherited warning, explicit non-incremental TypeScript and a first-attempt Vercel build PASS.
- Font provenance reported by author: official Inter 4.1 release `https://github.com/rsms/inter/releases/download/v4.1/Inter-4.1.zip`; WOFF2 SHA256 `693b77d4f32ee9b8bfc995589b5fad5e99adf2832738661f5402f9978429a8e3`; SIL OFL 1.1 license retained.

## Response contract

Return findings first, ordered P0 to P3, with exact file/line references, reproduction and evidence. Then state one disposition: `APPROVE FOR KARTIK FIXED-SHA ACCEPTANCE` or `CHANGES REQUESTED`. A PASS must explicitly confirm candidate SHA, parent chain, scope, homepage exclusion, route/session correctness, accessibility/responsive/browser results, font/license provenance, commands, limitations, clean checkout and free ports. If there are no findings, say `No findings.`

Do not fix anything. Do not provide a replacement implementation. Do not edit, commit, push, merge, deploy, change providers or call this production. Kartik remains the sole human exact-SHA acceptance reviewer after this independent review.
