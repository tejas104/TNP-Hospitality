# TNP-BRAND-AGGREGATE-M2 — integrated palette adoption and guard closure

Status: INTEGRATED LOCALLY / GATE CLOSED. Kartik explicitly accepted exact `d70d2e2315ab56e6b248879354aef2a6d4ea3067`, and P integrated that immutable candidate into local `main` with merge commit `bb2297da4b72d032aac57322be0f319352a892cb`. Clean-checkout post-integration verification passed, exact candidate blob identity and ancestry were proven, and all writer/reviewer/integration leases are closed. This does not authorize a main push, deployment, provider/production action or UX Foundation/Client source work.

Responsible product decision owner and sole human fixed-SHA acceptance reviewer: Kartik. Round-3 writer: current architect task `01a0bcc2-a3c0-7750-8bd9-edcabd621d62` on DESKTOP-DL9FDM7, inline only per the user's no-subagent direction. Fresh focused re-review remains assigned to the same independent Claude session above.

Source SHA: `14fa826cee42612b54ffb339219eb9b6a195226c`, the current local main after accepted Brand integration `b56ad987735a8a3ad909c35ede974a2e7353f8b3` and its serialized integration record.

Launch SHA: the commit carrying this Ready task and matching `docs/STATUS.md` / `docs/LANES.md`. Initial worktree HEAD must equal Launch and Source must be its ancestor; `SOURCE_SHA..LAUNCH_SHA` may contain only this task and those two registers.

Branch/worktree/port:

- `codex/tnp-brand-aggregate-m2`
- `D:\TNP-worktrees\TNP-BRAND-AGGREGATE-M2`
- `3117` / `http://localhost:3117`

Ordinary non-force push only to the named feature branch is authorized for fixed-SHA review sharing. No main push, deployment, provider or production action.

## Exact writable paths

- `components/tnp/portals/freelancer/FreelancerPortal.module.css`
- `components/tnp/portals/operations/AdminOperations.module.css`
- `tests/brand-teal-palette.test.mjs`

All TSX/behavior/domain/service/contract/fixture, public/homepage, Client/Planner/RSVP, shared shell, package/lockfile, provider, production and documentation paths are frozen in the writer branch.

## Required correction

1. Replace the Freelancer-local `--deep: #062b29` brand alias with exact `#008080`. Introduce/use neutral ink for text/form/border uses that previously depended on `--deep`; keep actual dark branded panels teal. Replace `.updated`'s `#26493c` with a neutral overlay that remains legible on teal.
2. Replace Operations Reports `.exportStatus` legacy `rgb(8 76 73 / 9%)` with exact-teal alpha while preserving error styling and behavior.
3. Extend the guard for the review's non-live P3 gaps: JS style-object named colours, JSX `fill`/`stroke` named colours, and hexadecimal colours inside supported Three.js light constructors. Measure beige-card contrast against actual `#e5e1cd`, not ivory. Add mutation probes for every new case and avoid prose/class-name false positives.
4. Do not address 3D material flatness, disabled/pressed visual redesign, Client redesign or workspace-switcher work in this task.

## Verification and handoff

- focused palette guard and mutation probes;
- every discovered test file on the integrated source;
- lint, explicit non-incremental TypeScript, Vercel build and diff check;
- browser-check Freelancer and Operations Reports at 1440x900, 1100x900 and 390x844, including updated/status contrast, keyboard focus, no overflow and clean console;
- stop the server, prove port3117 free, return one clean pushed immutable SHA for fresh Claude and Kartik review.

No self-certification or integration before those reviews.

## Immutable candidate returned 2026-09-20

- candidate: `d5c15be0be3acf984206a0a29c3f16dabe522bdf`;
- branch: `codex/tnp-brand-aggregate-m2`;
- remote equality: verified after ordinary non-force push;
- exact delta: the three writable paths above, with 28 insertions and 21 deletions;
- focused guard: 6/6 PASS;
- independently discovered project tests: 18 files / 118 tests PASS;
- lint: PASS with the same three inherited React-compiler warnings in `hooks/use-mobile.ts:16` and `components/tnp/AppShell.tsx:79,116`;
- explicit non-incremental TypeScript: PASS;
- Vercel build: PASS on the first attempt, with normal existing chunk/dynamic-import/nf3 warnings only;
- browser: `/freelancer` and `/admin` Reports at 1440x900, 1100x900 and 390x844; no horizontal overflow or console warning/error, visible keyboard focus, readable teal panels and a wrapping export-status output measured as `rgba(0, 128, 128, 0.09)` over neutral ink;
- cleanup: development server stopped and port3117 free.

Fresh review packet: `docs/dispatch/2026-09-20/BRAND-AGGREGATE-M2-CLAUDE-FIXED-SHA-REVIEW.md`. The fixed synthetic PreviewControls and right-edge workspace control are inherited shared-shell concerns reserved for UX Foundation; they are not reopened by this three-file correction.

## Fresh Claude disposition and round-2 lease — 2026-09-20

Review record: `docs/reviews/TNP-BRAND-AGGREGATE-M2-CLAUDE-REVIEW.md`.

The reviewer reproduced remote equality, direct-parent provenance, exact three-file scope, 6/6 focused tests, 18 files / 118 tests, lint with the three inherited warnings, explicit TypeScript, first-attempt Vercel build, required viewport geometry, export styling, keyboard focus and clean ports. The following findings require correction:

1. P0: both Freelancer panels changed to exact teal but retain foregrounds tuned for the former near-black substrate. Small text ranges from 2.74:1 to 3.41:1; inherited ivory body text is 4.23:1. Give every panel text state at least 4.5:1 contrast on exact `#008080` without changing markup or behavior.
2. P1: meaning-bearing icons, the detail close-control boundary and fact separators are below the 3:1 non-text threshold. Give those states at least 3:1 contrast on exact teal with visible resting affordance.
3. P2: derive the Operations beige-card contrast substrate from the actual `--beige` token and assert its required exact value so an ivory substitution cannot survive the focused suite.
4. P3: prevent the named-colour matcher from treating `data-color`, `data-fill` or `data-stroke` as JSX presentation properties; cover the demonstrated false-positive cases. Cover the demonstrated `.color.set(0x...)` numeric-colour gap without widening into Fog, material or excluded 3D redesign work.

Round-2 baseline is exact `d5c15be0be3acf984206a0a29c3f16dabe522bdf`. Branch/worktree/port remain `codex/tnp-brand-aggregate-m2`, `D:\TNP-worktrees\TNP-BRAND-AGGREGATE-M2`, and 3117. The checkout and live feature remote were verified equal and clean and port3117 free before activation.

### Round-2 exact writable paths

- `components/tnp/portals/freelancer/FreelancerPortal.module.css`
- `tests/brand-teal-palette.test.mjs`

The already-cleared Operations CSS and every other source, route, copy, behavior, domain/service/contract/fixture, package, shared-shell, homepage, Client/Planner/RSVP, provider, production and documentation path are frozen in the feature worktree.

Return one clean ordinarily pushed immutable successor. Run the focused guard, independently discovered project tests, lint, explicit non-incremental TypeScript, Vercel build and diff check. Browser-check the corrected Freelancer panels at 1440x900, 1100x900 and 390x844 for computed text/non-text contrast, keyboard focus, overflow and console output; confirm Operations export styling remains byte-identical or smoke it without reopening its source. Stop the server and prove port3117 free. Same-Claude focused re-review and then Kartik exact-successor acceptance remain mandatory before local integration.

## Round-2 immutable successor returned 2026-09-20

- candidate: `497145220636ae4fe4cbda9bb984f7d9691d3e20`;
- direct parent: reviewed `d5c15be0be3acf984206a0a29c3f16dabe522bdf`;
- branch: `codex/tnp-brand-aggregate-m2`;
- remote equality and clean writer checkout: verified after ordinary non-force push;
- round-2 delta: exactly Freelancer CSS and the palette guard; cumulative launch delta remains the original three-file allowlist and Operations CSS is byte-identical to `d5c15be...`;
- corrected live text contrast: white on exact teal, 4.77:1 across the two panels;
- corrected live icon/border/separator contrast: ivory on exact teal, 4.23:1;
- guard: actual `--beige` token is exact-value asserted, `data-color` / `data-fill` / `data-stroke` negative probes pass, and `light.color.set(0x154f44)` is detected;
- focused guard: 6/6 PASS;
- independently discovered tests: 18 files / 118 tests PASS;
- lint: PASS with the same three inherited React-compiler warnings;
- explicit non-incremental TypeScript: PASS;
- Vercel build: PASS on the first attempt with the existing non-blocking chunk/dynamic-import/nf3 warnings;
- browser: `/freelancer` at 1440x900, 1100x900 and 390x844; both corrected panels retain exact teal, measured ratios above, no horizontal overflow, visible keyboard focus and empty warn/error console;
- cleanup: browser/server stopped and port3117 free.

Focused re-review packet: `docs/dispatch/2026-09-20/BRAND-AGGREGATE-M2-CLAUDE-ROUND2-REREVIEW.md`. Same Claude session `cdd20a88-eed6-465c-908d-4b7496afbff1` must return one exact-successor disposition. Kartik acceptance remains a separate later gate.

## Round-2 Claude disposition and round-3 lease — 2026-09-20

Review record: `docs/reviews/TNP-BRAND-AGGREGATE-M2-CLAUDE-ROUND2-REREVIEW.md`.

Claude independently cleared the round-2 provenance/scope, text contrast, static non-text contrast, neutral overlay, beige-token mutation, `data-*` false-positive and `.color.set(...)` requirements; all automated/build/viewport evidence was reproduced. One P1 remains: `.workspace :is(button, a, input, select):focus-visible` uses exact teal, so genuine Tab focus on the close-detail button is 1.00:1 against the newly exact-teal panel at all required viewports.

Round-3 baseline is exact `497145220636ae4fe4cbda9bb984f7d9691d3e20`. Branch/worktree/port remain `codex/tnp-brand-aggregate-m2`, `D:\TNP-worktrees\TNP-BRAND-AGGREGATE-M2`, and 3117. The checkout and live remote were verified equal and clean and port3117 free before activation.

Writable paths remain only:

- `components/tnp/portals/freelancer/FreelancerPortal.module.css`
- `tests/brand-teal-palette.test.mjs`

Add a panel-local focus-visible colour override with at least 3:1 contrast on exact teal while preserving the existing teal focus ring on ivory workspace surfaces. Add a load-bearing regression assertion for both contexts. Tighten the round-2 `.color.set(...)` matcher to the demonstrated light-variable case and add a material negative probe; do not edit any material/3D source. The flattened-but-compliant colour hierarchy is accepted for this bounded correction because type, weight, spacing and letter-spacing preserve semantic hierarchy; broader visual nuance belongs to a later explicitly owned Freelancer refinement.

All other findings and all other paths are frozen. Run focused/full tests, lint, explicit non-incremental TypeScript, Vercel build and diff check. In a real browser use genuine Tab input to verify the close-detail focus ring at 1440x900, 1100x900 and 390x844, plus the existing teal-on-ivory workspace focus, overflow and console output. Return one clean ordinarily pushed immutable successor for the same-Claude focused re-review and then Kartik exact-successor acceptance.

## Round-3 immutable successor returned — 2026-09-20

- candidate: `71212ea57ada4447ff34a6ffebd14e439e2dc0da`;
- direct parent: reviewed `497145220636ae4fe4cbda9bb984f7d9691d3e20`;
- live feature remote equals candidate and the writer checkout is clean;
- exact delta: Freelancer CSS and palette guard only; Operations CSS remains byte-identical to the reviewed parent;
- panel-local focus: ivory on exact teal, 4.23:1, while the unchanged workspace focus remains teal on ivory, 4.23:1;
- guard: both focus contexts are load-bearing contrast assertions, light-named `.color.set(...)` remains detected, and `material.color.set(...)` is a negative probe;
- focused guard: 6/6 PASS;
- independently discovered tests: 18 files / 118 tests PASS;
- lint: PASS with only the same three inherited React-compiler warnings;
- explicit non-incremental TypeScript: PASS;
- Vercel build: PASS on the first attempt with the existing non-blocking chunk/dynamic-import/nf3 warnings;
- browser: genuine Tab lands on `Close role detail` with a 2.4px solid ivory outline and 4px offset at 1440x900, 1100x900 and 390x844; the workspace `Refresh records` control retains its teal-on-ivory outline; no horizontal overflow and no warn/error console output;
- cleanup: browser/server stopped and port3117 free.

Focused re-review packet: `docs/dispatch/2026-09-20/BRAND-AGGREGATE-M2-CLAUDE-ROUND3-REREVIEW.md`. Same Claude session `cdd20a88-eed6-465c-908d-4b7496afbff1` returned `CHANGES REQUESTED`. Kartik acceptance remains held.

## Round-3 Claude disposition and round-4 lease — 2026-09-20

Review record: `docs/reviews/TNP-BRAND-AGGREGATE-M2-CLAUDE-ROUND3-REREVIEW.md`.

Claude independently confirmed the exact remote/provenance/scope, unchanged Operations CSS, production focus behavior at all three viewports, preserved workspace focus, detector boundary, round-2 contrast gains, lint, TypeScript, first-attempt build, overflow, console and cleanup. The sole P1 is test portability: `block()` searches a multiline selector containing LF, while a normal Windows checkout contains CRLF, so the focused guard fails before the panel contrast assertion executes. Standard checkout evidence is 5/6 focused and 117/118 full; an LF-normalized copy passes 6/6.

Round-4 baseline is exact `71212ea57ada4447ff34a6ffebd14e439e2dc0da`. Branch/worktree/port remain `codex/tnp-brand-aggregate-m2`, `D:\TNP-worktrees\TNP-BRAND-AGGREGATE-M2`, and 3117. Live remote equality, clean checkout and free relevant ports were reverified before activation.

The only writable path is `tests/brand-teal-palette.test.mjs`. Normalize line endings inside the selector-block lookup and add an in-test CRLF probe so the portability requirement is load-bearing even when the executing filesystem uses LF. Preserve both focus-contrast assertions and every cleared detector probe. Freelancer CSS, Operations CSS and every other path are frozen. Claude's equal-specificity/source-order note is recorded as non-blocking P3 and is not reopened in this test-only correction.

Run the focused guard and full discovered suite in the writer checkout, then commit and ordinarily push one immutable successor. Prove the same results again from a fresh detached Windows checkout with CRLF on disk. Run lint, explicit non-incremental TypeScript, Vercel build, diff/scope checks and cleanup. Browser rerun is unnecessary because no production source may change. Return the successor to the same Claude session for a focused portability re-review; Kartik exact-successor acceptance remains a separate later gate.

## Round-4 immutable successor returned — 2026-09-20

- candidate: `d70d2e2315ab56e6b248879354aef2a6d4ea3067`;
- direct parent: reviewed `71212ea57ada4447ff34a6ffebd14e439e2dc0da`;
- live feature remote equals candidate and the writer checkout is clean;
- exact delta: `tests/brand-teal-palette.test.mjs` only; Freelancer and Operations CSS are byte-identical to the parent;
- correction: selector-block lookup normalizes CRLF/lone-CR to LF, while an explicit synthetic CRLF panel-rule probe pins portability independently of checkout format;
- mutation: bypassing normalization reproduces the focused 5/6 selector-anchor failure; restoring it returns 6/6;
- writer checkout: focused 6/6 and full 18 files / 118 tests PASS;
- fresh detached Windows checkout with `core.autocrlf=true`: CSS has 1,492 CRLF pairs, test has 285 CRLF pairs, focused 6/6 and full 118/118 PASS;
- lint: PASS with the same three inherited React-compiler warnings;
- explicit non-incremental TypeScript: PASS;
- Vercel build: PASS on the first attempt with only the existing non-blocking notices;
- cleanup: verification worktree removed, writer checkout clean and ports 3117, 3211, 3213 and 3215 free.

Focused portability re-review packet: `docs/dispatch/2026-09-20/BRAND-AGGREGATE-M2-CLAUDE-ROUND4-REREVIEW.md`. Same Claude session `cdd20a88-eed6-465c-908d-4b7496afbff1` must return one exact-candidate disposition. Kartik acceptance remains a separate later gate.

## Round-4 Claude approval — 2026-09-20

Review record: `docs/reviews/TNP-BRAND-AGGREGATE-M2-CLAUDE-ROUND4-REREVIEW.md`.

The same independent Claude session approved exact `d70d2e2315ab56e6b248879354aef2a6d4ea3067` for architect-controlled integration with no P0, P1, P2 or P3 findings. It independently verified live remote equality, direct-parent provenance, a whole-tree one-file blob delta, byte-identical production/CSS blobs, actual CRLF counts, focused 6/6, full 118/118, two mutation failures at the intended selector, lint with only the inherited warnings, TypeScript, first-attempt build, clean worktrees and free ports. No browser rerun was required because round four has no production change and the rendered focus behavior was independently cleared in round three.

The earlier equal-specificity/source-order observation remains non-blocking carry-forward context. It does not prevent acceptance or integration and is not authority for another source correction.

All AI writer/reviewer leases are closed. Kartik exact-SHA acceptance packet: `docs/dispatch/2026-09-20/BRAND-AGGREGATE-M2-KARTIK-ACCEPTANCE.md`. No integration, main push, deployment, provider/production action or UX Foundation/Client source work may begin until Kartik explicitly accepts the exact candidate.

## Kartik exact-SHA acceptance — 2026-09-20

Kartik returned the required explicit disposition verbatim: `I, Kartik, ACCEPT TNP-BRAND-AGGREGATE-M2 at exact SHA d70d2e2315ab56e6b248879354aef2a6d4ea3067 for architect-controlled local integration.`

P reverified before integration that local and live feature remote equal the accepted SHA, the writer worktree is clean, launch `99b4c98c0888ea1b3703830356386b71b7152149` is the exact merge base and ancestor of both histories, current main has no non-documentation changes since launch, and the cumulative candidate scope is exactly Freelancer CSS, Operations CSS and the palette guard. Ports 3117, 3211, 3213 and 3215 are free. Integration authority is local only and retains the latest main documentation history.

## Local integration closure — 2026-09-20

- accepted candidate: `d70d2e2315ab56e6b248879354aef2a6d4ea3067`;
- local merge commit: `bb2297da4b72d032aac57322be0f319352a892cb`, with first parent `4fbb5e190b44c6fdaad7917c51bc5d81c6859f63` and accepted candidate as second parent;
- merge scope: exactly Freelancer CSS, Operations CSS and `tests/brand-teal-palette.test.mjs`;
- provenance: the accepted candidate is an ancestor of the merge, and each of the three merged blobs is byte-identical to the accepted candidate;
- clean detached integration checkout: focused palette guard 6/6 PASS; complete tracked suite 118/118 PASS; lint PASS with only the same three inherited React-compiler warnings; explicit non-incremental TypeScript PASS; `npm run build:vercel` PASS with the existing chunk, dynamic-import and nf3 notices;
- install context: `npm ci` reported 11 existing audit advisories (1 low, 2 moderate, 8 high); this task changed no dependency or lockfile;
- base-checkout distinction: preserved untracked `tmp/` makes base-checkout lint/TypeScript non-authoritative because its home-redesign file imports an absent local module; neither `tmp/` nor `output/` was edited or removed;
- cleanup: the detached verification worktree was removed; the writer worktree remains clean; ports 3117, 3211, 3213 and 3215 are free.

The aggregate palette gate is closed locally. Local `main` may advance only through serialized documentation; `origin/main` remains unchanged. No main push, deployment, provider/production action, UX Foundation work or Client source work was performed or authorized by this acceptance.
