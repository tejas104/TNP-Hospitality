export interface PlatformIndexSpecification {
  readonly collection:
    | 'organizations'
    | 'vendors'
    | 'users'
    | 'memberships'
    | 'sessions'
    | 'idempotencyReceipts'
    | 'auditRecords';
  readonly name: string;
  readonly keys: Readonly<Record<string, 1 | -1>>;
  readonly unique?: boolean;
  readonly expireAfterSeconds?: number;
  readonly supportsQuery: string;
}

function defineIndex(
  specification: PlatformIndexSpecification,
): PlatformIndexSpecification {
  return Object.freeze(specification);
}

export const PLATFORM_INDEXES: readonly PlatformIndexSpecification[] =
  Object.freeze([
    defineIndex({
      collection: 'organizations',
      name: 'organization_id_unique',
      keys: { id: 1 },
      unique: true,
      supportsQuery:
        'Load one organization by stable id for every authorized tenant request.',
    }),
    defineIndex({
      collection: 'organizations',
      name: 'organization_kind_status',
      keys: { kind: 1, status: 1, id: 1 },
      supportsQuery:
        'List active organizations by kind for explicit platform administration.',
    }),
    defineIndex({
      collection: 'vendors',
      name: 'vendor_organization_unique',
      keys: { organizationId: 1 },
      unique: true,
      supportsQuery:
        'Load the vendor profile for the already-authorized organization.',
    }),
    defineIndex({
      collection: 'vendors',
      name: 'vendor_status_organization',
      keys: { status: 1, organizationId: 1 },
      supportsQuery:
        'List vendor organizations by lifecycle status for platform administration.',
    }),
    defineIndex({
      collection: 'users',
      name: 'user_id_unique',
      keys: { id: 1 },
      unique: true,
      supportsQuery: 'Load the server-derived user referenced by a session.',
    }),
    defineIndex({
      collection: 'users',
      name: 'user_normalized_email_unique',
      keys: { normalizedEmail: 1 },
      unique: true,
      supportsQuery:
        'Resolve one identity by normalized email during a future approved sign-in flow.',
    }),
    defineIndex({
      collection: 'memberships',
      name: 'membership_tenant_id_unique',
      keys: { organizationId: 1, id: 1 },
      unique: true,
      supportsQuery:
        'Load a membership by id only inside its server-derived organization.',
    }),
    defineIndex({
      collection: 'memberships',
      name: 'membership_tenant_user_unique',
      keys: { organizationId: 1, userId: 1 },
      unique: true,
      supportsQuery:
        "Resolve a user's one membership in an organization and prevent duplicates.",
    }),
    defineIndex({
      collection: 'memberships',
      name: 'membership_tenant_status_role',
      keys: { organizationId: 1, status: 1, role: 1, id: 1 },
      supportsQuery:
        'List organization memberships by lifecycle status and fixed role.',
    }),
    defineIndex({
      collection: 'sessions',
      name: 'session_token_hash_unique',
      keys: { tokenHash: 1 },
      unique: true,
      supportsQuery:
        'Resolve an opaque cookie credential without storing the raw token.',
    }),
    defineIndex({
      collection: 'sessions',
      name: 'session_tenant_id_unique',
      keys: { organizationId: 1, id: 1 },
      unique: true,
      supportsQuery:
        'Revoke one server-derived session id only inside its organization.',
    }),
    defineIndex({
      collection: 'sessions',
      name: 'session_tenant_user_active',
      keys: { organizationId: 1, userId: 1, revokedAt: 1, expiresAt: 1 },
      supportsQuery:
        'List and revoke active sessions for one user inside an organization.',
    }),
    defineIndex({
      collection: 'sessions',
      name: 'session_expiry_ttl',
      keys: { expiresAt: 1 },
      expireAfterSeconds: 0,
      supportsQuery:
        'Expire session records after their absolute expiry; authorization still checks expiry before TTL cleanup.',
    }),
    defineIndex({
      collection: 'idempotencyReceipts',
      name: 'idempotency_tenant_key_unique',
      keys: { organizationId: 1, key: 1 },
      unique: true,
      supportsQuery:
        'Replay or reject a protected mutation by organization and idempotency key.',
    }),
    defineIndex({
      collection: 'auditRecords',
      name: 'audit_tenant_time',
      keys: { organizationId: 1, occurredAt: -1, id: 1 },
      supportsQuery:
        "Page an organization's audit timeline in stable reverse chronological order.",
    }),
    defineIndex({
      collection: 'auditRecords',
      name: 'audit_tenant_request',
      keys: { organizationId: 1, requestId: 1, occurredAt: 1 },
      supportsQuery:
        'Trace all audit outcomes for one request inside an organization.',
    }),
    defineIndex({
      collection: 'auditRecords',
      name: 'audit_tenant_actor_time',
      keys: { organizationId: 1, actorId: 1, occurredAt: -1 },
      supportsQuery:
        "Investigate an actor's changes inside one organization over time.",
    }),
  ]);

export const SCHEMA_EVOLUTION_POLICY = Object.freeze({
  currentVersion: 1,
  compatibility: 'additive' as const,
  rule: 'Readers must tolerate unknown fields; writers may add optional fields only until a separately reviewed migration authorizes a version change.',
  destructiveChangesRequireSeparateTask: true,
});
