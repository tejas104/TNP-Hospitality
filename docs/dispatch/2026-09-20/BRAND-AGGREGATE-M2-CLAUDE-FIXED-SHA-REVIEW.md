SESSION TYPE: NEW SESSION

DO NOT OPEN OR REUSE ANY OLD TNP CLAUDE SESSION. Start one fresh Claude Code desktop review session for this exact fixed-SHA review only.

# TNP-BRAND-AGGREGATE-M2 — fresh independent fixed-SHA review

READ-ONLY REVIEW ONLY — DO NOT IMPLEMENT.

Review exact immutable candidate:

- source before the launch record: `14fa826cee42612b54ffb339219eb9b6a195226c`;
- launch/direct parent: `99b4c98c0888ea1b3703830356386b71b7152149`;
- candidate: `d5c15be0be3acf984206a0a29c3f16dabe522bdf`;
- branch: `codex/tnp-brand-aggregate-m2`;
- writer worktree: `D:\TNP-worktrees\TNP-BRAND-AGGREGATE-M2`;
- review server: use a new free review-only port, never 3117.

First report the actual Claude session ID, model, effort, host/account and PWD. Verify that live `origin/codex/tnp-brand-aggregate-m2` equals the full candidate, its direct parent equals the launch SHA, the candidate checkout is clean, and the delta contains exactly the three files below. Create a clean detached review worktree. Do not edit, commit, push, merge, deploy, change providers or change production.

## Exact changed-file allowlist

- `components/tnp/portals/freelancer/FreelancerPortal.module.css`
- `components/tnp/portals/operations/AdminOperations.module.css`
- `tests/brand-teal-palette.test.mjs`

No TSX, route, copy, domain/data/state, service, contract, fixture, package, shared shell, homepage, Client/Planner/RSVP, provider or production behavior change is authorized.

## Requirements to review

1. Freelancer's local `--deep` brand alias is exact `#008080`. Text, forms and borders formerly coupled to the dark-green alias use a neutral ink token. True dark branded panels remain teal and keep readable foregrounds. The `.updated` state uses a legible neutral overlay rather than another green literal.
2. Operations Reports `.exportStatus:not(:empty)` uses exact-teal alpha `rgb(0 128 128 / 9%)`; error treatment and CSV behavior remain unchanged.
3. The palette guard rejects disallowed green literals in JS style-object values, JSX `fill` and `stroke`, and hexadecimal numeric colours in supported Three.js light constructors, while avoiding prose/class-name false positives.
4. Beige-card contrast is measured against actual `#e5e1cd`, not ivory. Every added parser case has a mutation probe.
5. The change must not reopen the intentionally excluded 3D material-flatness, disabled/pressed redesign, Client redesign, fixed PreviewControls or workspace-switcher work.

## Required independent verification

- Independently discover and run every `*.test.mjs` file in the exact candidate checkout. Also run `node --test tests/brand-teal-palette.test.mjs` and inspect every mutation probe.
- Run `npm ci`, `npm run lint`, `npx --no-install tsc --noEmit --incremental false`, `npm run build:vercel`, and `git diff --check 99b4c98c0888ea1b3703830356386b71b7152149..d5c15be0be3acf984206a0a29c3f16dabe522bdf`.
- Browser-check `/freelancer` and `/admin` at 1440x900, 1100x900 and 390x844. In Operations open `Reports & audit`, trigger the synthetic CSV export and inspect the live status output.
- Verify actual computed colours, readable contrast, responsive wrapping, keyboard focus, no horizontal overflow, no hydration/console warnings or errors, and cleanup/free review and writer ports.
- Treat all preview records as labelled synthetic data. Do not enter real personal information and do not treat preview export, verification, tracking or payment UI as production proof.

## Builder evidence to reproduce, not inherit

The inline architect reports:

- clean pushed remote equality at exact `d5c15be0be3acf984206a0a29c3f16dabe522bdf`;
- direct parent `99b4c98c0888ea1b3703830356386b71b7152149` and exact three-file scope;
- focused palette guard 6/6 PASS;
- 18 discovered test files / 118 tests PASS;
- lint PASS with three unchanged inherited React-compiler warnings at `hooks/use-mobile.ts:16` and `components/tnp/AppShell.tsx:79,116`;
- explicit non-incremental TypeScript PASS;
- first-attempt Vercel build PASS with existing non-blocking chunk/dynamic-import/nf3 warnings only;
- `/freelancer` and `/admin` Reports checked at all three required viewports with no horizontal overflow and an empty warn/error console;
- Operations export status computed as `rgba(0, 128, 128, 0.09)` with `rgb(32, 36, 35)` text; at mobile it wrapped inside a 307.2px-wide box within the 375.2px document client width;
- visible keyboard focus on Freelancer navigation; development server stopped and port3117 free.

The fixed synthetic PreviewControls and right-edge workspace control are inherited shared-shell concerns reserved for the later UX Foundation task. Report them only if this candidate regresses them; do not expand this review into that redesign.

Return findings ordered P0-P3 with exact file/line references, commands/results, rendered evidence and limitations. End with exactly one disposition: `APPROVE FOR ARCHITECT-CONTROLLED INTEGRATION` or `CHANGES REQUESTED`. Then stop. Kartik's exact-SHA acceptance is a separate gate, and no main push, deployment, provider or production action is authorized.
