SESSION TYPE: OLD SESSION — /root/platform_builder
DO NOT OPEN A NEW TNP WRITER, ARCHITECT OR REVIEWER SESSION.

# TNP-PLATFORM-M1 — bounded fixed-SHA correction

Status: READY for the original `/root/platform_builder`, assigned `gpt-5.6-sol` / high on DESKTOP-DL9FDM7.

- Worktree/branch: `D:\TNP-worktrees\TNP-PLATFORM-M1` / `codex/tnp-platform-m1`
- SOURCE_SHA: `f0bb13590aab37c9bae69d3e1c727cfb8f20daf5`
- LAUNCH_SHA: the commit carrying this file; P supplies its exact full SHA after commit
- Port: 3105, recheck before binding
- Re-review: focused fresh Sol/high, separate external Claude, then Kartik sole human fixed-SHA disposition

Resolve only the three independently reproduced findings:

1. In `server/idempotency/service.ts`, bind receipt replay to the original actor or membership. Cross-actor same-tenant reuse must reject without exposing the cached response or running the effect. Append safe replay audit evidence for the current actor/request without repeating the domain effect, including the concurrent-conflict replay path.
2. In `server/security/session.ts` and `app/api/v1/session/route.ts`, add a narrowly scoped revoked-session logout replay. It must validate the same opaque token/session/action/actor/idempotency key and CSRF, return only the prior stored logout result, set the clearing cookie and replay header, and never authorize a new mutation or any other route. Missing/mismatched receipt, key, payload/action or CSRF must fail closed.
3. In `package.json` and `docs/runbooks/PLATFORM-FOUNDATION.md`, add and document an explicit Vercel-config local-development command that supplies the existing six-name `process.env` boundary. Preserve the standard frontend dev command and fail-closed environment validation. No Vite/shared runtime edit is authorized.

Writable files only:

- `server/idempotency/service.ts`
- `server/security/session.ts`
- `app/api/v1/session/route.ts`
- `tests/platform-foundation.test.mjs`
- `docs/runbooks/PLATFORM-FOUNDATION.md`
- `package.json`

Everything else is frozen, including `server/data/indexes.ts`, Mongo repository code, lockfile, UI/domain/preview files and provider resources. No dependency or external connection.

Add deterministic tests for cross-actor rejection/no leak, same-actor replay audit, concurrent replay audit, exact logout replay, revoked-session missing/mismatched receipt rejection, wrong CSRF/key/action rejection, and the documented command. Re-run npm ci, full platform/shared tests, lint, explicit non-incremental TypeScript, Vercel build, diff check, and safe synthetic/missing-config API probes through the documented Vercel-config command. Do not contact Atlas. Make one checked non-force final push after live remote comparison, stop all servers and return exact SHA/evidence. No integration, main push, deployment or provider mutation.
