# TNP-PLATFORM-M1 independent Sol fixed-SHA review

## CHANGES REQUESTED

- Reviewer: fresh `/root/platform_fixed_sha_review`, assigned `gpt-5.6-sol` / high; separate runtime metadata was not exposed
- Review target: `ce64172eff2e96bc0fdfeb4384d93ebd197712ce..f0bb13590aab37c9bae69d3e1c727cfb8f20daf5`
- Remote: live `origin/codex/tnp-platform-m1` equalled the exact detached clean target
- Ownership and ancestry: PASS

## Findings

1. **P1 — idempotency replay is not actor-bound and replay lacks audit evidence.** `server/idempotency/service.ts:156-169` accepts a same-organization receipt by key and payload fingerprint without checking `existing.actorId`; the replay path returns without a new actor/request audit record. `server/data/indexes.ts:125-130` intentionally makes organization/key unique, so another same-tenant user can collide. The reviewer reproduced user B receiving user A's cached actor-specific response while B's effect did not run and the audit trail named only A. Bind replay to the original actor or membership, reject cross-actor reuse, and append safe replay audit evidence without repeating the effect.
2. **P2 — a successful logout is not HTTP-idempotent on retry.** `app/api/v1/session/route.ts:57-64` authenticates before receipt lookup and `server/security/session.ts:159` rejects the already revoked session. The reviewer reproduced first logout `204`, followed by exact retry `401 SESSION_REVOKED` instead of stored `204` plus `idempotency-replayed: true`. Add a narrowly scoped revoked-session replay path that validates the same token/session/action/actor/key/CSRF and can only return the prior logout result and clear the cookie.
3. **P2 — the standard local-development command cannot consume the platform environment.** `package.json:9` starts default Vinext with `vite.config.ts`, whose Sites/Cloudflare runtime does not populate the `process.env` boundary read by `server/config/env.ts:45-47`. With all six synthetic variables supplied, default `/api/ready` still reported configuration unavailable; the same inputs worked with `vite.config.vercel.ts`, correctly reaching database-unavailable against a deliberately dead localhost URI and returning `401` for missing/malformed session cookies. Add and document an explicit approved Vercel-config development command, or raise a serialized shared-runtime prerequisite; do not silently weaken environment validation.

## Independent verification

- `npm ci`: PASS, 647 packages; 11 existing advisories.
- Platform tests: 14/14 PASS.
- Shared preview tests: 15/15 PASS.
- Lint: exit 0 with three inherited warnings.
- Explicit non-incremental TypeScript: PASS.
- Vercel build: PASS with inherited Vinext/Nitro warnings.
- Diff check: PASS.
- Missing-config probes: health 200, readiness 503, session 503 without secret leakage.
- Synthetic Vercel-config probes: readiness distinguished configuration ready/database unavailable; forged role/tenant headers did not authenticate; missing/malformed cookies returned 401.
- Ports 3105–3107 were stopped and the review worktree remained clean.

No real Atlas/provider access, production data, deployment, live index/transaction proof or provider mutation was used. External Claude and Kartik fixed-SHA review remain mandatory after correction.
