# Baseline evidence — 2026-09-16

Source commit: 9d58061f2d36514ebc932fa94bb3dc90f4b97a97.
Original D:\TNP Hospitality on main; remote verified https://github.com/tejas104/TNP-Hospitality.git. Local origin/main same SHA; no remote fetch, merge or push.
Tracked source/index initially clean. Untracked deliverables/ and tmp/ include unrelated user work; preserved.
No applicable AGENTS.md/CLAUDE.md found in original root/ancestor or tracked subtree before bootstrap; none in new worktree ancestors.
Only original Git worktree existed before creation of D:\TNP-worktrees\TNP-BOOT-01, branch codex/tnp-bootstrap. Local app listed only this active TNP session; external Claude/Laptop 2 activity not observable.

## Actual isolated checks
Node v22.23.2; npm 11.8.0; Git 2.47.1.windows.2.
| Command | Result | Evidence / interpretation |
|---|---|---|
| npm ci --no-audit --no-fund | PASS, exit 0, 634 packages | Clean lockfile install in new worktree; audit intentionally not run |
| npm run lint | FAIL, exit 1 | evidence/lint.log: 8 errors, 3 warnings inherited from baseline |
| npx --no-install tsc --noEmit | PASS, exit 0 | evidence/typecheck.log is empty; success exit observed |
| npm run build:vercel | PASS, exit 0 | evidence/build-vercel.log; generated .vercel/output/nitro.json |
| npm run dev -- --help | PASS, exit 0 | Supports -p/--port, -H/--hostname; default localhost:3000 |
| python docs/checks/verify_bootstrap.py | PASS after correcting a missing Astra field | 21 provenance entries, 20 screen rows, 12 TASKs, docs-only scope |
| git diff --cached --check | PASS after evidence-log whitespace normalization | No application source changed |

Earlier original-root npm lint/typecheck attempts were blocked by sandbox D:\ lstat EPERM. Approved elevated runs reached actual tools. Earlier read-only typecheck with --incremental false also passed. No bypass or source change was used to fix sandbox access.
Sibling worktree commands required filesystem escalation; an initial sandbox workdir invocation landed outside the intended folder and failed reads without mutation. Subsequent commands explicitly Set-Location and verified path.

## Inherited lint findings
Eight next(no-html-link-for-pages) errors: HomeExperience.tsx lines 148,397,477,480; AppShell.tsx 164,176,179; PortalPages.tsx 542.
Three react-compiler EffectSetState warnings: hooks/use-mobile.ts 16; AppShell.tsx 58,92.
S0 owns narrowly scoped navigation repairs; no lint configuration weakening. Warnings are recorded, not silently fixed in bootstrap.
Build also reports ineffective dynamic import of app/layout.tsx and plugin-timing information; it exits successfully. No performance budget has been demonstrated.

## Architecture and browser evidence
Five page routes; portal exports at PortalPages.tsx 23,116,209,358; shared helpers 523,550,568. No tracked production API/persistence/auth/provider modules.
Reference homepage and /admin inspected via browser on 2026-09-16. Operations desktop screenshot inspected in-session; screenshot not saved and deployed SHA unknown.
Browser interaction/mobile/keyboard acceptance, real-device testing, Lighthouse/performance, concurrency/security/finance suites, CI protection and production/provider checks are UNRUN. No test npm script exists.
A successful local Vercel build is not a deployment. No dev server left running by bootstrap.

## Final diff expectation
Only canonical docs/root instructions, eight selected TNP references, source PDF and nine reviewed skills. Application/package/framework/config tracked blobs must match source baseline.
Independent review remains pending; no main green-gate waiver is claimed.

Documentation validation initially caught a missing explicit Astra gate field and staging caught trailing whitespace in a raw tool log; both corrected. Source reference/skill hashes remain exact. A clean detached-checkout provenance check will be reported in the final handoff.
