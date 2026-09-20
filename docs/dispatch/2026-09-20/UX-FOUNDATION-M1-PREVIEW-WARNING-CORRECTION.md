SESSION TYPE: OLD SESSION `01a0bee6-65ab-73c2-a0c6-60eb83111347`

DO NOT OPEN A NEW TASK. Resume this exact Codex task only for the bounded correction below. Use `gpt-5.6-luna` / low for this small, localized correction; do not spend Astra on it.

# TNP-UX-FOUNDATION-M1 — PreviewControls visible-warning correction

Fresh independent Claude Opus 5 session `0959ee97-bf48-4129-962d-3eab2fdf7b62` returned `CHANGES REQUESTED` on exact clean pushed candidate `653da55991363f910dbeddc3773d55ee507f7491`.

The sole blocking finding is that the mandatory synthetic-preview safety sentence is currently inside the closed `PreviewControls` disclosure on data-entry routes. The sentence must remain visible at rest while the scenario and reset controls may remain collapsed.

## Exact baseline and location

- baseline and current branch HEAD: `653da55991363f910dbeddc3773d55ee507f7491`;
- branch: `codex/tnp-ux-foundation-m1`;
- worktree: `D:\TNP-worktrees\TNP-UX-FOUNDATION-M1`;
- reserved port: `3118`, fallback `3218`;
- expected branch and remote must be clean and equal before editing.

## Exact writable paths

- `components/tnp/shared/PreviewControls.tsx`
- `tests/ux-foundation.test.mjs`
- `tests/ux-foundation.browser.mjs`

Every other source, test, asset, package, route, homepage, portal-local feature, provider, production and documentation path is frozen in the feature worktree.

## Required correction

1. Preserve the compact disclosure and existing scenario/reset behavior.
2. Render the mandatory synthetic-data safety sentence outside the collapsible content so it is visible when the disclosure is closed on every route where PreviewControls appears.
3. Keep semantics, accessible naming, keyboard behavior, responsive clearance and reset truth intact. Do not duplicate the warning for assistive technology.
4. Add focused static/browser regression that proves the warning is visible before opening the disclosure at desktop, 390px mobile and 200% zoom, while the scenario/reset controls remain collapsed.

Do not address the homepage chooser-label mismatch in this correction; it belongs to the later public/access milestone. Do not clean dead exports, dial CSS or unrelated AppShell/Suspense behavior here.

## Verification and handoff

Run the focused UX tests, every tracked project test affected by the candidate, lint, explicit non-incremental TypeScript, Vercel build and diff check. Browser-check the closed warning at desktop, 390px mobile, 200% zoom, keyboard navigation, reduced motion, no overlap/overflow and clean console. Stop the server and prove ports `3118` and `3218` free.

Commit and ordinarily push one clean immutable successor whose direct parent is `653da55991363f910dbeddc3773d55ee507f7491`. Return exact SHA, changed files, commands/results, browser evidence, limitations, clean/remote equality and free-port evidence. The same Claude session must then perform focused fixed-SHA re-review, followed by Kartik exact-successor acceptance and architect-controlled integration. No self-certification, main integration, deployment or provider/production action.
