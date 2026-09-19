# TNP-PLATFORM-M1 external Claude fixed-SHA review

## APPROVE FOR ARCHITECT-CONTROLLED INTEGRATION

Received from the user on 2026-09-19 and reconciled live by P against the immutable target. The reviewer reported no blocking issue and independently reproduced closure of all three prior findings. Kartik's exact-SHA human acceptance remains a separate gate.

Received attachment SHA-256: `D2131BCAFFEE8C17EDC20F50A6589145C2EFF164D2AB0CA4D34E86736AAA9B0C` for `pasted-text.txt` before this structured archive was written.

## Reviewer and immutable target

- Fresh Claude Code desktop session; reported model `claude-opus-5`, effort not exposed by the runtime.
- Host: `DESKTOP-DL9FDM7`.
- Detached review worktree: `D:\TNP-claude-review-m1`.
- Source/base/first target/correction launch/final: `1a32c6b0bcb034f3b122f86e7cd57b14553e6ba4` / `ce64172eff2e96bc0fdfeb4384d93ebd197712ce` / `f0bb13590aab37c9bae69d3e1c727cfb8f20daf5` / `56d0b8f8f521ade6a64c0ff96e0c6068831c86cb` / `bc6b5565af1750168b10701955d131c3ec2f2dc4`.
- Reviewer verified ancestry, clean detached state and live remote equality at start and finish.
- P independently rechecked on receipt: `origin/codex/tnp-platform-m1`, the detached review worktree and writer worktree all equal the full final SHA; both worktrees are clean and port 3105 has no listener.
- First implementation range respects the 18-path task allowlist. Correction launch contains only its dispatch record. The correction contains exactly the six authorized files.

The first attempted review worktree on C: could not install dependencies because C: had zero free bytes. The reviewer recreated the clean detached worktree on D:. One later install attempt had a transient `ECONNRESET`; the subsequent locked install passed. An empty locked scratchpad folder may remain on C: and is not repository evidence.

## Independently reported checks

- `npm ci`: PASS on D: using D:-hosted npm cache/temp after the machine failures above.
- Platform tests: PASS, 19/19.
- Shared preview tests: PASS, 15/15.
- `npm run lint`: PASS with three inherited warnings outside platform paths.
- `npx --no-install tsc --noEmit --incremental false`: PASS.
- `npm run build:vercel`: PASS on the fourth unchanged attempt after three inherited Windows `EBUSY` copy-lock failures involving pre-existing nested `content-type@2.1.0` copies.
- Full-range and correction-range `git diff --check`: PASS.
- Five independent reviewer probes outside source: PASS, 5/5.
- Safe `dev:vercel` missing/synthetic configuration probes: PASS; no live provider was contacted and no synthetic secret/URI appeared in server logs.
- Reviewer stopped both servers and confirmed port 3105 free.

## Prior finding closure reproduced by Claude

1. Actor-bound idempotency: same-organization cross-user reuse returns `409 IDEMPOTENCY_CONFLICT`, does not run the effect or expose the cached response, and records a safe `IDEMPOTENCY_ACTOR_MISMATCH` audit. Legitimate same-user sequential/concurrent replay returns the stored result, records replay audit and runs the effect once.
2. Exact self-logout retry: the revoked-session replay validates token/session, CSRF, actor, action, payload fingerprint, key and stored result, returns the stored 204 with cookie clearing and replay header, and cannot authorize another route/mutation. Tampered/missing inputs, different session, Admin revocation and expiry fail closed.
3. Vercel development boundary: `dev:vercel` uses `vite.config.vercel.ts`; default frontend `dev` is unchanged; the runbook names the six approved environment variables. Missing configuration, unreachable synthetic database and unauthenticated/invalid-session probes return the expected safe states.

The reviewer also rechecked server-derived role/organization identity, tenant-filtered lookups, token/CSRF hashing and timing-safe comparison, cookie flags, transaction/audit ordering, Mongo session cleanup, index rationale, liveness/readiness separation, safe error bodies and honest temporary-development documentation.

## Non-blocking findings preserved for hardening

1. P3 documentation: `docs/runbooks/PLATFORM-FOUNDATION.md` says DELETE requires an authenticated session but does not document the narrow exact self-logout replay after revocation.
2. P3 operations/concurrency: concurrent idempotency relies on the unique `idempotency_tenant_key_unique` index, but readiness currently checks connectivity rather than required index presence, and the runbook checks readiness before applying indexes. A deployment could report ready during a window where duplicate concurrent effects are not protected by the intended uniqueness constraint.
3. P3 regression coverage: committed tests cover the concurrent path for the same actor but not the independently verified cross-user concurrent conflict path.

These are not prerequisites for architect-controlled local integration according to the reviewer, but item 2 is a mandatory pre-staging/startup-safety follow-up. All three are bounded in `docs/tasks/TNP-PLATFORM-HARDENING-M1.md` rather than silently assigned to Platform M1 after its fixed review.

## Limitations

- No real Atlas/provider connection; real Mongo transaction, retry and index behavior was code-reviewed, not exercised against Atlas.
- Concurrency was simulated using the in-memory test adapter.
- The build passed only after retries for the inherited Windows file-lock race.
- Claude memory persistence was unavailable and unrelated Neon/Render connectors were unavailable; neither was required for this review.

No reviewer edit, commit, push, provider contact, integration or deployment occurred.
