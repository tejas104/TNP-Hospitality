# TNP-BRAND-TEAL-M1 — client-selected teal platform sweep

Status: ROUND-4 SOL/XHIGH PREFLIGHT — NO ACTIVE WRITER LEASE. Same Claude Opus 5/xhigh session `local_caafefbd-0c4e-46b4-a5e8-a9a989d8b7bf` returned `CHANGES REQUESTED` on exact clean live-remote-equal `1c5204f0894775292b633824118c58a5df9454b7`. The Client kicker correction passes at 4.773:1, but cumulative round-two changes retain one P1 and two P2 visual defects. Kartik explicitly gives full acceptance to exact `1c5204f...`; that closes the human gate for this candidate but cannot waive the failed independent-review gate. No integration occurred. The user supersedes the prior Astra requirement and now mandates only `gpt-5.6-sol`: xhigh for complex, high for regular and medium for minimal work. `/root/brand_teal_sol_round4`, requested Sol/xhigh, is limited to read-only preflight until architect activation.

Responsible human/product decision owner and sole fixed-SHA human acceptance reviewer: Kartik. Client decision evidence: user instruction on 2026-09-19, recorded in `docs/decisions/CLIENT-DECISIONS.md` and `docs/DESIGN.md` at Source.

Source SHA: `4859b2e63246eb7aae83a36ba1863b9b250ea326`.

Launch SHA: the commit carrying this Ready task and matching `docs/STATUS.md` / `docs/LANES.md` entries, supplied externally after commit creation. Initial worktree HEAD must equal Launch and Source must be its ancestor. `SOURCE_SHA..LAUNCH_SHA` may contain only those three files.

Branch/worktree/port:

- `codex/tnp-brand-teal-m1`
- `D:\TNP-worktrees\TNP-BRAND-TEAL-M1`
- `3111` / `http://localhost:3111`

Preflight: branch/worktree were absent and port3111 had no listener before Ready. Exclusive writer lease is reserved for `/root/brand_teal_builder` after exact startup verification and ends at fixed-SHA handoff or P revocation. Ordinary non-force push only to the named feature branch is authorized. No main push/merge, deployment, provider action or force-push.

Review appointment: fresh external Claude fixed-SHA source/browser review after Sol authorship, plus Kartik exact-SHA acceptance. Any later adoption needed for not-yet-integrated RSVP, Freelancer correction or Operations Reports code must be a separately reviewed integration delta; this task must not edit their frozen branches or pretend they are already on Source.

Mode/risk: shared visual design-system correction across the currently integrated responsive frontend. No domain, service, state, contract, routing, copy meaning, data, provider or production behavior change.

## Superseding visual decision

Client-selected `#008080` now replaces visible dark-green/dark-teal brand surfaces across the homepage and platform. The former surface family—including `#062b29`, `#061c1b`, `#084c49`, `#0f6b68`, `#083d36`, `#073f3d`, `#052b29`, `#071c1b` and `#061615`—must not remain in active production presentation source or be replaced by another green.

Use:

- `#008080` for visible brand surfaces, primary actions, rails, hero sections and teal accents;
- `#006b6b` only for same-family hover/pressed states or small text where the primary teal misses contrast;
- neutral charcoal/black, not dark green, for body text, shadows and image overlays where contrast requires it;
- ivory `#f5f1e7`, champagne `#bba879`, white and existing neutral soft surfaces as supporting colors.

Semantic success must use teal plus text/icon/state wording rather than a separate green surface or color-only meaning.

## Writable paths

- `app/globals.css`
- `components/tnp/public/**`
- current integrated portal style files under `components/tnp/portals/{client,planner,operations}/**/*.module.css`
- `components/three/EventOrbit.tsx`
- `data/tnp.ts`
- a new focused guard such as `tests/brand-teal-palette.test.mjs`

Do not edit TSX/logic outside `EventOrbit.tsx`, except a source-only test/fixture helper strictly needed for the palette guard. Do not edit active RSVP/Freelancer/Operations-Reports feature branches, shared contracts/services/fixtures, packages/lockfiles, route behavior, providers, server code or docs/registers from the builder branch.

If an in-scope page needs a non-color structural or behavior change to meet this request, stop and escalate rather than widening the task.

## Implementation requirements

1. Refactor the existing global semantic color block so legacy aliases used by current screens resolve to the new client teal rather than dark green. Add/use a neutral ink/overlay token where the old black-teal was serving text/shadow contrast rather than brand color.
2. Replace literal former dark-green/dark-teal surfaces in the homepage hero, public content, login/access surfaces, current Client/Planner/Operations styles, data tints and legacy 3D accent with `#008080` or a documented neutral/hover exception.
3. The homepage hero must visibly read as `#008080`, including desktop, phone, reduced-motion/mobile fallback and non-WebGL fallback. Remove the current green cast; do not hide it behind an almost-identical gradient.
4. Preserve hierarchy through opacity, ivory/champagne/white, borders, elevation and neutral overlays—not by reintroducing another green. Preserve all layout, imagery, motion and interaction behavior.
5. Update status/success styling so no separate green surface remains and meaning is retained by label/icon/text.
6. Add a focused palette regression test that scans the active production presentation sources in scope for the forbidden former green literals/aliases and asserts the hero/current semantic tokens use `#008080`. Exclude the guard file's own forbidden-list constants from self-matching.
7. Inventory not-yet-integrated feature candidates in the handoff: RSVP, Freelancer Round 2 and Operations Reports. Identify every future adoption file/literal by fixed SHA without editing those reviewed branches. Their later integration cannot be called platform-color complete until the guard passes on the aggregate SHA.

## Accessibility and visual acceptance

- Verify WCAG AA for normal text, 3:1 for large text/UI/focus and visible keyboard focus on every changed surface. White or ivory on `#008080` must be measured rather than assumed; use white/neutral or the accessible teal variant as needed without another green surface.
- No text, icon, boundary or focus indicator may disappear after removing deep contrast. Preserve non-color status meaning.
- Browser-verify `/`, `/contact`, representative service and department detail, `/login`, `/client`, `/planner`, `/freelancer` if present at Source, and `/admin` at 1440x900, 1100x900 and 390x844. Check desktop/mobile navigation, drawers, forms, cards, hover/pressed/focus, loading/error/success samples, reduced motion, no horizontal overflow and no console/hydration errors.
- Inspect the homepage hero/fallback visually, not only by source. Report computed background colors for hero, public navigation/drawer and portal rail/surface.

## Required checks and handoff

Run the focused palette guard plus all existing public/shared/portal tests affected by the source range, lint, explicit non-incremental TypeScript, Vercel build and `git diff --check`. Use the one unchanged Nitro `EBUSY` retry rule only after stopping task-owned processes.

Create one immutable final commit, ordinary non-force push, stop browser/server, prove port3111 free and clean remote equality. Report exact changed files, literal/token inventory before/after, commands/results, viewport/keyboard/contrast/computed-color evidence, remaining candidate-branch adoption list and limitations. Then pause for fresh Claude and Kartik review. No self-certification, integration, deployment or provider mutation.

## Fixed-SHA handoff

Final candidate: `fc7746e06601ca670b09dc8dd47895c543dfec58` on `origin/codex/tnp-brand-teal-m1`, exactly one commit after Launch. P independently confirmed clean remote equality, Launch ancestry, the exact fourteen-file allowlist, `git diff --check`, 40 focused palette/public/shared tests and explicit non-incremental TypeScript.

Builder evidence reports the palette guard 3/3, affected tests 73/73, lint with three unchanged inherited warnings, TypeScript, first-attempt Vercel build, browser matrices across nine routes at 1440/1100/390, keyboard navigation, no overflow/console errors, mobile no-canvas fallback and measured contrast all pass. The visible hero and sampled portal surfaces compute to `rgb(0, 128, 128)`. Reduced-motion and WebGL-loss policy were covered by focused tests; the available browser tooling could not force those two OS/runtime conditions. This limitation must remain explicit.

Fresh Claude review must use the packet at `docs/dispatch/2026-09-19/BRAND-TEAL-CLAUDE-FIXED-SHA-REVIEW.md`. Not-yet-integrated RSVP final `0c562341cb97b1a3e1ecc6638677850a6692552f`, Freelancer final `28ecc920ffe055db0495159e90ee1a1ce3ed2226`, and the pending Operations Reports CSV-cleanup successor remain outside this candidate. After their acceptance/integration, a bounded aggregate adoption delta must recolor their old literals and pass the palette guard before the platform can be called fully color-complete.

## Fresh Claude disposition and round-two correction

Claude found remaining green 3D/fallback surfaces, low-contrast teal text/labels/status/errors, nearly invisible Operations focus, cascade-dependent action boundaries, an unreadable Freelancer success pill, dark-green `PreviewControls`, a mismatched Planner legend and an incomplete palette guard. Layout, data/state and behavior are otherwise frozen.

The bounded correction packet is `docs/dispatch/2026-09-19/BRAND-TEAL-ASTRA-ROUND2-CORRECTION.md`. It authorizes only the exact twelve visual/test files listed there from candidate `fc7746e...`. Operations Reports aggregate adoption remains separate. One immutable successor, fresh Claude focused re-review and Kartik acceptance precede P-controlled integration.

Round-two final is `48189e0b8783ef8abf80040997115a67275def57`. P independently confirmed live remote equality, direct parent, clean worktree, exact twelve-file scope, diff check and all 79 discovered tests. P then rendered `/`, `/contact`, Client, Planner, Freelancer and Operations at desktop/mobile sizes and confirmed the main hero, public headings/actions, portal notices, Operations labels and Freelancer status treatment. The remaining Client status-hub kicker defect is bounded in `docs/dispatch/2026-09-19/BRAND-TEAL-ASTRA-ROUND3-CLIENT-KICKER.md`; the prior Claude re-review packet is superseded before use.

## Round-three fixed-SHA handoff

Round-three final is `1c5204f0894775292b633824118c58a5df9454b7`, the clean pushed live-remote-equal direct child of `48189e0...`. Its exact two-file delta is `ClientStatusHub.module.css` plus `brand-teal-palette.test.mjs`: the Client hub kicker is explicitly white, and the guard resolves the hub's `--dark` background and enforces at least 4.5:1.

The writer reports all 79 tests, lint with three inherited warnings, explicit non-incremental TypeScript, first-attempt Vercel build and exact-range diff checks PASS. P independently confirmed provenance, scope, clean remote equality and diff check; rendered `/client` at 1440x900 and 390x844; measured white `rgb(255, 255, 255)` on teal `rgb(0, 128, 128)` at 4.773:1; found no horizontal overflow or browser warning/error logs; and stopped the isolated port3120 server. Same-Claude packet: `docs/dispatch/2026-09-19/BRAND-TEAL-CLAUDE-ROUND3-REREVIEW.md`. No integration, main push, deployment or provider change is authorized.

## Round-three review disposition and round-four correction

Same Claude Opus 5/xhigh session independently returned `CHANGES REQUESTED` after reproducing the cumulative correction in a clean detached worktree. The specific blockers at `1c5204f...` are:

- P1: fourteen Operations `.section-kicker` instances render white on beige at approximately 1.31:1 because the global white rule is broader than its teal-surface exception.
- P2: `RUN SAMPLE WORKER CLAIM` receives a white focus ring on the beige live Operations panel at approximately 1.31:1.
- P2: the live WebGL hero still renders an approximately `#004137` dark-green cast over 11.3% of opaque scene pixels even though source material literals are teal; metalness/lighting interaction is the likely cause.
- P3: palette guard misses `hsl()`, `oklch()`, named CSS colors and Three.js numeric/array color forms; bounded inherited Client skip-link focus, beige secondary text, pressed-state and disabled-nav distinctions remain weak.

The exact correction packet is `docs/dispatch/2026-09-20/BRAND-TEAL-SOL-ROUND4-OPERATIONS-HERO-CORRECTION.md`. It limits the named Sol/xhigh author to five files and requires rendered Operations/WebGL evidence plus guard mutation probes. One immutable successor returns to the same Claude session for focused fixed-SHA review. Kartik's acceptance of `1c5204f...` does not automatically transfer to a successor SHA; exact-successor acceptance remains separate unless Kartik explicitly states otherwise.
