# TNP-BRAND-AGGREGATE-M2 — Claude round-2 focused re-review

Disposition: **CHANGES REQUESTED**

Reviewed 2026-09-20 by resumed Claude Code desktop session `cdd20a88-eed6-465c-908d-4b7496afbff1`, reported `claude-opus-5` / default effort, on DESKTOP-DL9FDM7. The session remained read-only, used and removed a clean detached review worktree, stopped its server and reported review/writer ports free.

Immutable target:

- reviewed parent: `d5c15be0be3acf984206a0a29c3f16dabe522bdf`;
- candidate: `497145220636ae4fe4cbda9bb984f7d9691d3e20`;
- exact round-2 delta: Freelancer CSS and palette guard;
- cumulative launch delta: unchanged original three-file allowlist; Operations CSS byte-identical to the reviewed parent.

## Cleared evidence

- remote equality, direct parent, clean checkout, scope and diff checks: PASS;
- focused guard 6/6 and independently discovered 18 files / 118 tests: PASS;
- lint with the three inherited warnings, explicit TypeScript and first-attempt Vercel build: PASS;
- static panel text: 4.77:1; static icons/borders/separators: 4.23:1;
- actual beige-token mutation, `data-*` negative cases and `.color.set(...)` positive case: load-bearing probes PASS;
- responsive geometry, zero horizontal overflow, empty warn/error console and cleanup: PASS.

## Remaining actionable finding

**P1 — panel-local keyboard focus is invisible.** The unchanged workspace focus rule uses `#008080`. Under genuine Tab modality, the close-detail button receives a 2.4px teal outline with 4px offset against an exact-teal panel, producing 1.00:1 contrast at 1440x900, 1100x900 and 390x844. Add a panel-local focus colour with at least 3:1 contrast while preserving the existing teal focus ring on ivory surfaces.

## Recorded non-blocking observations

- Panel colour hierarchy is flatter because small labels now share white; this is compliant. The architect accepts the bounded result because non-colour typography and spacing retain hierarchy; future nuance requires separate portal-local ownership.
- The `.color.set` guard also matches material variables. Round three narrows that matcher to light-named variables and adds a material negative probe without touching material or 3D source.

Kartik exact-SHA acceptance remains held until the corrected successor passes the same Claude session's focused re-review.
