# TNP-BRAND-AGGREGATE-M2 — Claude round-3 focused re-review

Disposition: **CHANGES REQUESTED**

Reviewed 2026-09-20 by resumed Claude Code desktop session `cdd20a88-eed6-465c-908d-4b7496afbff1`, reported `claude-opus-5` / default effort, on DESKTOP-DL9FDM7. The session remained read-only, used and removed a clean detached review worktree, stopped its server and reported ports 3117, 3211, 3213 and 3215 free.

Immutable target:

- reviewed parent: `497145220636ae4fe4cbda9bb984f7d9691d3e20`;
- candidate: `71212ea57ada4447ff34a6ffebd14e439e2dc0da`;
- exact round-3 delta: Freelancer CSS and palette guard;
- Operations CSS byte-identical to the reviewed parent.

## Cleared evidence

- remote equality, direct parent, clean checkout, scope and diff checks: PASS;
- genuine-Tab close-detail focus: ivory on exact teal, 4.23:1 at 1440x900, 1100x900 and 390x844;
- workspace focus: preserved teal on ivory, 4.23:1;
- line width/style/offset, overflow, console, detector boundary and all round-2 contrast gains: PASS;
- lint with three inherited warnings, explicit TypeScript and first-attempt Vercel build: PASS;
- review worktree/server cleanup: PASS.

## Remaining actionable finding

**P1 — multiline selector lookup is not CRLF-portable.** `panelFocusSelector` contains LF, while a standard Windows checkout under the repository's `core.autocrlf=true` contains CRLF in the CSS. `block()` uses exact `indexOf`, so focused execution stops before the panel contrast assertion: 5/6 focused and 117/118 full. The same candidate with CR bytes stripped passes 6/6. Normalize line endings before lookup and pin the CRLF case in the guard.

## Recorded non-blocking observation

The panel override and base focus rule have equal specificity and the override wins by later source order. This is deterministic in the current single file and is P3 only; it is frozen for the one-file portability correction.

Kartik exact-SHA acceptance remains held until a corrected successor passes the same Claude session's focused re-review.
