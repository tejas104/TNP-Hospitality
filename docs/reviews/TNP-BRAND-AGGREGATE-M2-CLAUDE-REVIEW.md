# TNP-BRAND-AGGREGATE-M2 — fresh Claude fixed-SHA review

Disposition: **CHANGES REQUESTED**

Reviewed 2026-09-20 by fresh Claude Code desktop session `cdd20a88-eed6-465c-908d-4b7496afbff1`, reported `claude-opus-5` / default effort, on DESKTOP-DL9FDM7. The session reported read-only operation in a clean detached worktree and removed it after review. The reported claude-mem observer allowance outage affects future memory retention, not the fixed-SHA review evidence returned in this record.

Immutable target:

- launch/direct parent: `99b4c98c0888ea1b3703830356386b71b7152149`;
- candidate: `d5c15be0be3acf984206a0a29c3f16dabe522bdf`;
- branch: `codex/tnp-brand-aggregate-m2`;
- exact delta: Freelancer CSS, Operations CSS and the palette guard only.

## Reproduced evidence

- live remote equality, direct parent, clean writer/review checkouts and exact three-file allowlist: PASS;
- focused guard: 6/6 PASS;
- independently discovered tests: 18 files / 118 tests PASS;
- lint: PASS with the three inherited React-compiler warnings at `hooks/use-mobile.ts:16` and `components/tnp/AppShell.tsx:79,116`;
- explicit non-incremental TypeScript: PASS;
- first-attempt Vercel build: PASS;
- 1440/1100/390 checks: no horizontal overflow; Operations export styling and CSV feedback match the requirement; keyboard focus and port cleanup PASS.

## Actionable findings

1. **P0 — Freelancer teal-panel foreground contrast.** `.journey` and `.opportunityDetail` now use exact `#008080`, but their inherited and explicitly muted foregrounds were not retuned. Reported live ratios range from 2.74:1 to 3.41:1 for small text, and 4.23:1 for inherited ivory body text. This violates the task's readable-foreground requirement.
2. **P1 — Freelancer teal-panel non-text contrast.** Meaning-bearing icons are 2.66:1, the close-control border is 1.59:1 and fact separators are 1.40:1. These require at least 3:1 contrast and a visible resting boundary.
3. **P2 — Beige substrate regression is not mutation-locked.** The guard uses the correct `#e5e1cd`, but substituting ivory still leaves 6/6 passing. The guard must derive/assert the actual `--beige` token so the demonstrated mutation fails.
4. **P3 — Named-colour attribute false positive.** `data-color="limegreen"`, and by extension `data-fill` / `data-stroke`, is incorrectly parsed as a presentation property. Add explicit negative probes and tighten the matcher.
5. **P3 — numeric `.color.set(...)` gap.** `light.color.set(0x154f44)` is missed. Cover that demonstrated case only; Fog, materials and the excluded 3D redesign remain outside this correction.

Operations exact-teal export styling, CSV behavior, `.updated` neutral overlay, scope boundaries and the three required parser additions were otherwise cleared. Kartik exact-SHA acceptance is not requested until a corrected immutable successor passes focused Claude re-review.
