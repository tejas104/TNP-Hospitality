SESSION TYPE: OLD SESSION `0959ee97-bf48-4129-962d-3eab2fdf7b62`

DO NOT OPEN A NEW CLAUDE SESSION. Resume only the same independent Claude Opus 5 session that returned `CHANGES REQUESTED` on `653da55991363f910dbeddc3773d55ee507f7491`.

# TNP-UX-FOUNDATION-M1 — focused fixed-SHA correction re-review

Review exact immutable successor:

- candidate: `bde9e6ba19e86da4476917de7693732251124e68`;
- direct parent / previously reviewed candidate: `653da55991363f910dbeddc3773d55ee507f7491`;
- branch: `codex/tnp-ux-foundation-m1`;
- remote: `origin` / `https://github.com/tejas104/TNP-Hospitality.git`;
- writer worktree: `D:\TNP-worktrees\TNP-UX-FOUNDATION-M1` — read-only evidence only, do not review or edit there;
- detached reviewer worktree: recreate `D:\TNP-review\TNP-UX-FOUNDATION-M1-CLAUDE` at the exact candidate after fetching;
- review ports: prefer `3119`, fallback `3219` after proving them free.

Before review, record actual Claude session/model/effort/host evidence. Verify remote equality, direct-parent provenance, detached exact HEAD, clean status and this exact three-path correction delta:

- `components/tnp/shared/PreviewControls.tsx`
- `tests/ux-foundation.test.mjs`
- `tests/ux-foundation.browser.mjs`

The sole blocking prior finding was that the mandatory synthetic-preview safety sentence was hidden inside the closed `PreviewControls` disclosure. Confirm the successor renders that warning once, outside and before the disclosure, so it remains visible at rest while scenario and reset controls stay collapsed. Verify semantics and assistive output do not duplicate the warning; disclosure keyboard behavior, focus, reset truth and responsive clearance remain correct.

Re-run the focused UX tests and independently discover/run all tracked `*.test.mjs` tests. Run lint, explicit `npx --no-install tsc --noEmit --incremental false`, diff check and `npm run build:vercel`. Follow the repository rule for one unchanged retry only if Nitro/Vercel hits `EBUSY`; record each attempt. Browser-check the closed state at 1440x900, 390x844 and 200% zoom, plus keyboard disclosure activation, reduced motion, no action overlap, no horizontal overflow and console/hydration output.

Prior author evidence, to reproduce rather than trust: 129/129 tracked tests, 17/17 browser scenarios, lint with the inherited `hooks/use-mobile.ts:16` React-compiler warning, TypeScript PASS, and build PASS after one unchanged retry for `EBUSY`. P independently reproduced 129/129, lint, TypeScript and build PASS after one unchanged retry.

Do not widen this re-review into the deferred homepage chooser-label mismatch, dead exports/CSS, AppShell Suspense hardening, the active homepage cube or the new 19/19 frontend program. Report a regression only if this three-path correction introduced it or failed to close the prior blocker.

Return findings first, ordered P0-P3, with exact file/line and reproduction evidence. Then end with exactly one disposition for `bde9e6ba19e86da4476917de7693732251124e68`: `APPROVE FOR KARTIK FIXED-SHA ACCEPTANCE` or `CHANGES REQUESTED`. Stop the server, remove the detached review worktree if safe, prove review ports free and do not edit source, push, merge, deploy or change providers/production. Kartik's exact-SHA acceptance remains a separate gate.
