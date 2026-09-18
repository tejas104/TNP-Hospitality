# Platform foundation runbook

Status: development/staging foundation only. This runbook does not authorize provider mutation, production data, deployment, DNS changes, or migration. The temporary Atlas cluster and linked Vercel project are user-confirmed but were not reachable through a verified connector during this milestone.

## Boundary and current capabilities

The application remains one Vinext modular monolith:

`HTTP route -> request parsing -> opaque session lookup -> role/tenant authorization -> application operation -> repository transaction -> domain effect + idempotency receipt + audit`

- `/api/health` proves only that the process can answer.
- `/api/ready` validates required configuration and proves a MongoDB `ping`; it returns unavailable if either fails.
- `/api/v1/session` is the first versioned business boundary. `GET` returns server-derived session context. `DELETE` requires the authenticated cookie, CSRF token, and idempotency key, then revokes the database-backed session.
- Session cookies are `Secure`, `HttpOnly`, `SameSite=Lax`, and contain a random opaque credential. Only a keyed digest is persisted. Current user, membership, organization, expiry, and revocation state are checked on every authenticated request.
- Role or organization headers/body fields never authorize access. Repository lookups remain organization-scoped, including direct-ID access.
- Email, WhatsApp, payment, document upload, KYC, GPS, and other external adapters are disabled. Their absence must surface as unavailable capability in future feature work, never synthetic success.

## Environment inventory

Configure values only in the relevant provider's secret controls. Do not place values in source, Git, tickets, screenshots, chat, logs, or this runbook.

| Name                  | Purpose                                                             |
| --------------------- | ------------------------------------------------------------------- |
| `MONGODB_URI`         | MongoDB connection string for the current environment               |
| `MONGODB_DB_NAME`     | Environment-specific database name                                  |
| `SESSION_SECRET`      | High-entropy server secret used to derive stored credential digests |
| `SESSION_COOKIE_NAME` | Host cookie name used by the web client                             |
| `APP_BASE_URL`        | Canonical base URL for the environment                              |
| `TNP_ENVIRONMENT`     | One of `development`, `staging`, `production`, or `test`            |

Missing or invalid configuration fails readiness and authenticated endpoints closed. Rotating `SESSION_SECRET` invalidates existing session and CSRF credentials; plan a coordinated sign-out and do not rotate it as an unannounced routine deploy.

### Local Vercel-config development

Use the standard `npm run dev` command for ordinary frontend work. To exercise API routes through the same Vinext/Nitro configuration used by the Vercel build, supply the six variables above in the local process environment and run:

```powershell
npm run dev:vercel -- --host 127.0.0.1 --port 3105
```

The command uses `vite.config.vercel.ts` and inherits `MONGODB_URI`, `MONGODB_DB_NAME`, `SESSION_SECRET`, `SESSION_COOKIE_NAME`, `APP_BASE_URL`, and `TNP_ENVIRONMENT` through `process.env`. Obtain development values through the approved provider/secret owner and do not paste them into the command, an `.env` file, source, test output, or this runbook. Leaving the names absent is the safe missing-configuration probe: `/api/health` stays live while `/api/ready` and authenticated routes fail closed. Do not use production values for local development and do not use this command as permission to contact Atlas.

## Staging bring-up and verification

1. Confirm a named staging owner, separate staging database, secret owner, network policy, budget alerts, and synthetic-only data.
2. Set all six environment variables through the staging provider without displaying their values in terminal output or logs.
3. Deploy an exact reviewed SHA to staging only after authorization.
4. Confirm `/api/health` returns `200` and `status: live`.
5. Confirm `/api/ready` returns `200` and both `configuration` and `database` are ready. A `503` is a stop condition, not a bypass.
6. Apply the reviewed index manifest from `server/data/indexes.ts` through a separately authorized migration operation. Index creation is deliberately not automatic at request startup.
7. Run tenant-isolation, suspended/revoked membership, session revocation/expiry, CSRF, idempotency replay/conflict, and audit redaction probes with synthetic identities.
8. Verify the database deployment supports transactions. Protected mutations must not fall back to non-atomic writes when transactions are unavailable.

## Index rollout

Every index specification includes the query it supports. Before staging or production application:

1. Capture collection sizes and inspect existing indexes.
2. Check candidate duplicate keys for every unique index (`organizationId + membership id`, `organizationId + userId`, session token digest, and `organizationId + idempotency key`). Abort on duplicates; do not delete or merge records implicitly.
3. Apply indexes in staging and run the named queries with explain plans where data volume is representative.
4. Measure build duration, resource pressure, and application latency. Schedule production creation in the approved maintenance window.
5. Apply one reviewed manifest version. Compare actual index names and key order to the manifest after creation.
6. Abort if duplicate-key discovery, index build failure, material latency, replication lag, or unexpected resource pressure occurs.

The session expiry TTL index is cleanup, not an authorization control; the request path rejects expired sessions even before TTL deletion. Idempotency and audit records have no TTL because retention policy is still a client decision.

## Temporary-to-client production cutover

Production requires a client-controlled Atlas organization/project and Vercel project (or an approved ownership transfer), named individual access, separate production secrets, domain/DNS control, deployment authority, restore operator, and approved RPO/RTO.

1. Inventory the temporary project: exact application SHA, build settings, environment-variable names, domains, database/collection names, indexes, scheduled work, and log/alert configuration. Record names and status only—never secret values.
2. Provision the client-controlled production resources with least-privilege named accounts. Prove network connectivity from staging before the cutover window.
3. Freeze production-bound writes at the approved point. Take a provider backup/snapshot and record its immutable identifier, time, and restore owner in the private operations record.
4. Export/import or migrate through an approved tool. Do not place exports containing personal data in this repository or a general shared drive.
5. Reconcile collection record counts plus approved deterministic business-key/hash samples. Rebuild/verify the reviewed index manifest.
6. Demonstrate a restore into an isolated staging target. Record elapsed recovery time and recovered checkpoint so the client can approve RTO/RPO evidence.
7. Configure production environment values through provider secret controls, deploy the reviewed release SHA, and run readiness, tenant-isolation, auth, idempotency, and core-flow smoke tests.
8. Change DNS only in the approved window after go/no-go. Preserve the prior deployment and database backup for the agreed rollback window.

## Abort and rollback

Abort the cutover on any of these conditions:

- configuration or database readiness is unavailable;
- counts/reconciliation differ beyond an explicitly approved explanation;
- unique-index conflicts or schema-version incompatibility appear;
- tenant-isolation, authorization, CSRF, revocation, idempotency, or audit checks fail;
- backup cannot be verified or the isolated restore drill misses the approved RPO/RTO;
- monitoring, on-call ownership, domain control, or exact-SHA deployment authorization is absent.

Rollback is application-first because schema changes are additive in this milestone:

1. Stop new writes or keep the maintenance page active.
2. Restore routing to the previous exact application SHA and previous environment binding.
3. If writes reached the new production database, do not blindly reverse-copy. The data owner decides whether to reconcile forward or restore the pre-cutover backup based on the written recovery plan.
4. Re-run health/readiness and the minimum auth/tenant smoke tests before reopening traffic.
5. Preserve audit and incident evidence without session tokens, secrets, or personal documents.

No destructive schema contraction is part of rollback. Removing fields, collections, or indexes requires a separate reviewed task after all mixed application versions are retired.

## Monitoring and operational limits

Monitor process liveness separately from readiness, database selection/transaction failures, authentication rejection rates, CSRF rejection rates, idempotency conflicts, session revocations, and audit-write failures. Alerts must carry request IDs and safe reason codes, never raw cookies, CSRF values, connection strings, document payloads, or guest identity documents.

This milestone does not establish login/recovery/MFA policy, rate limiting, provider integrations, production backup automation, final retention, production ownership, or live connectivity evidence. Those remain release gates rather than inferred capabilities.
