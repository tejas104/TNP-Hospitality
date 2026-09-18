import test from 'node:test';
import assert from 'node:assert/strict';

import {
  loadPlatformEnvironment,
  ConfigurationError,
} from '../server/config/env.ts';
import {
  PLATFORM_INDEXES,
  SCHEMA_EVOLUTION_POLICY,
} from '../server/data/indexes.ts';
import { RepositoryConflictError } from '../server/data/repository.ts';
import { liveness, readiness } from '../server/health/readiness.ts';
import { parseJsonObject } from '../server/http/api.ts';
import {
  canonicalFingerprint,
  executeProtectedMutation,
  requireIdempotencyKey,
} from '../server/idempotency/service.ts';
import {
  assertTenantRecord,
  authorizeActor,
  AuthorizationError,
} from '../server/security/authorization.ts';
import {
  authenticateRequest,
  issueSession,
  requireCsrf,
  SessionError,
} from '../server/security/session.ts';

const NOW = new Date('2026-09-18T08:00:00.000Z');

function environmentSource(overrides = {}) {
  return {
    MONGODB_URI: 'mongodb://127.0.0.1:27017',
    MONGODB_DB_NAME: 'tnp_test',
    SESSION_SECRET: 'synthetic-test-material-32-bytes-minimum',
    SESSION_COOKIE_NAME: 'tnp_session',
    APP_BASE_URL: 'http://localhost:3105',
    TNP_ENVIRONMENT: 'test',
    ...overrides,
  };
}

function organization(id, status = 'active', kind = 'vendor') {
  return {
    id,
    schemaVersion: 1,
    kind,
    displayName: `Synthetic ${id}`,
    status,
    createdAt: NOW,
    updatedAt: NOW,
  };
}

function user(id, status = 'active') {
  return {
    id,
    schemaVersion: 1,
    normalizedEmail: `${id}@example.test`,
    displayName: `Synthetic ${id}`,
    status,
    createdAt: NOW,
    updatedAt: NOW,
  };
}

function membership(
  id,
  organizationId,
  userId,
  role = 'vendor_operator',
  status = 'active',
) {
  return {
    id,
    schemaVersion: 1,
    organizationId,
    userId,
    role,
    status,
    createdAt: NOW,
    updatedAt: NOW,
  };
}

function vendor(id, organizationId, status = 'active') {
  return {
    id,
    schemaVersion: 1,
    organizationId,
    status,
    entitlementKeys: ['rsvp'],
    createdAt: NOW,
    updatedAt: NOW,
  };
}

class MemoryRepository {
  organizations = new Map();
  vendors = new Map();
  users = new Map();
  memberships = new Map();
  sessionsByHash = new Map();
  sessionsById = new Map();
  receipts = new Map();
  audits = [];
  domainEffects = 0;
  connectionFailure = false;
  #transactionNumber = 0;

  constructor() {
    for (const id of ['vendor-a', 'vendor-b'])
      this.organizations.set(id, organization(id));
    this.vendors.set('vendor-a', vendor('profile-a', 'vendor-a'));
    this.vendors.set('vendor-b', vendor('profile-b', 'vendor-b'));
    this.users.set('user-a', user('user-a'));
    this.users.set('user-b', user('user-b'));
    this.memberships.set(
      'vendor-a:membership-a',
      membership('membership-a', 'vendor-a', 'user-a'),
    );
    this.memberships.set(
      'vendor-b:membership-b',
      membership('membership-b', 'vendor-b', 'user-b'),
    );
  }

  async findOrganizationById(id) {
    return this.organizations.get(id) ?? null;
  }
  async findVendorByOrganizationId(id) {
    return this.vendors.get(id) ?? null;
  }
  async findUserById(id) {
    return this.users.get(id) ?? null;
  }
  async findMembershipById(organizationId, id) {
    return this.memberships.get(`${organizationId}:${id}`) ?? null;
  }
  async findSessionByTokenHash(hash) {
    return this.sessionsByHash.get(hash) ?? null;
  }
  async insertSession(session) {
    if (this.sessionsByHash.has(session.tokenHash))
      throw new RepositoryConflictError();
    this.sessionsByHash.set(session.tokenHash, session);
    this.sessionsById.set(session.id, session);
  }
  async revokeSession(organizationId, sessionId, revokedBy, reason, revokedAt) {
    const current = this.sessionsById.get(sessionId);
    if (
      !current ||
      current.organizationId !== organizationId ||
      current.revokedAt
    )
      return false;
    const next = { ...current, revokedAt, revokedBy, revocationReason: reason };
    this.sessionsById.set(sessionId, next);
    this.sessionsByHash.set(current.tokenHash, next);
    return true;
  }
  async findIdempotencyReceipt(organizationId, key) {
    return this.receipts.get(`${organizationId}:${key}`) ?? null;
  }
  async insertIdempotencyReceipt(receipt) {
    const key = `${receipt.organizationId}:${receipt.key}`;
    if (this.receipts.has(key)) throw new RepositoryConflictError();
    this.receipts.set(key, receipt);
  }
  async appendAudit(record) {
    this.audits.push(record);
  }
  async checkConnection() {
    if (this.connectionFailure) throw new Error('synthetic connection failure');
  }
  async withTransaction(work) {
    const snapshot = structuredClone({
      sessionsByHash: this.sessionsByHash,
      sessionsById: this.sessionsById,
      receipts: this.receipts,
      audits: this.audits,
      domainEffects: this.domainEffects,
    });
    try {
      return await work({
        transactionId: `memory-${++this.#transactionNumber}`,
      });
    } catch (error) {
      this.sessionsByHash = snapshot.sessionsByHash;
      this.sessionsById = snapshot.sessionsById;
      this.receipts = snapshot.receipts;
      this.audits = snapshot.audits;
      this.domainEffects = snapshot.domainEffects;
      throw error;
    }
  }
}

function actor(overrides = {}) {
  return {
    sessionId: 'session-a',
    userId: 'user-a',
    membershipId: 'membership-a',
    organizationId: 'vendor-a',
    role: 'vendor_operator',
    membershipStatus: 'active',
    ...overrides,
  };
}

async function issuedFixture(
  repository = new MemoryRepository(),
  overrides = {},
) {
  const environment = loadPlatformEnvironment(environmentSource());
  const issued = issueSession(environment, {
    organizationId: 'vendor-a',
    userId: 'user-a',
    membershipId: 'membership-a',
    createdAt: NOW,
    expiresAt: new Date(NOW.getTime() + 60 * 60 * 1000),
    ...overrides,
  });
  await repository.insertSession(issued.session);
  const cookie = issued.cookie.split(';', 1)[0];
  return { repository, environment, issued, cookie };
}

test('configuration validates names without disclosing values', () => {
  assert.throws(
    () =>
      loadPlatformEnvironment(
        environmentSource({
          MONGODB_URI: 'secret-value',
          SESSION_SECRET: 'short',
        }),
      ),
    (error) => {
      assert.equal(error instanceof ConfigurationError, true);
      assert.deepEqual(
        error.issues.map((issue) => issue.name),
        ['MONGODB_URI', 'SESSION_SECRET'],
      );
      assert.equal(error.message.includes('secret-value'), false);
      return true;
    },
  );
  assert.throws(() => loadPlatformEnvironment({}), ConfigurationError);
  assert.throws(
    () =>
      loadPlatformEnvironment(
        environmentSource({ TNP_ENVIRONMENT: 'production' }),
      ),
    (error) =>
      error instanceof ConfigurationError &&
      error.issues.some((issue) => issue.name === 'APP_BASE_URL'),
  );
});

test('opaque sessions use hardened cookies and derive the actor from persistence', async () => {
  const { repository, environment, issued, cookie } = await issuedFixture();
  assert.match(issued.cookie, /; Secure; HttpOnly; SameSite=Lax$/);
  assert.equal(issued.cookie.includes(issued.session.tokenHash), false);
  const request = new Request('http://localhost:3105/api/v1/session', {
    headers: {
      cookie,
      'x-organization-id': 'vendor-b',
      'x-role': 'platform_admin',
    },
  });
  const authenticated = await authenticateRequest(
    request,
    environment,
    repository,
    NOW,
  );
  assert.deepEqual(
    [authenticated.actor.organizationId, authenticated.actor.role],
    ['vendor-a', 'vendor_operator'],
  );
});

test('unauthenticated and malformed cookie requests fail closed', async () => {
  const repository = new MemoryRepository();
  const environment = loadPlatformEnvironment(environmentSource());
  await assert.rejects(
    authenticateRequest(
      new Request('http://localhost:3105/api/v1/session'),
      environment,
      repository,
      NOW,
    ),
    (error) =>
      error instanceof SessionError &&
      error.code === 'AUTHENTICATION_REQUIRED' &&
      error.status === 401,
  );
  await assert.rejects(
    authenticateRequest(
      new Request('http://localhost:3105/api/v1/session', {
        headers: { cookie: 'tnp_session=bad' },
      }),
      environment,
      repository,
      NOW,
    ),
    (error) =>
      error instanceof SessionError && error.code === 'SESSION_INVALID',
  );
});

test('CSRF protection rejects missing and wrong tokens for browser mutations', async () => {
  const { environment, issued } = await issuedFixture();
  const missing = new Request('http://localhost:3105/api/v1/session', {
    method: 'DELETE',
  });
  assert.throws(
    () => requireCsrf(missing, issued.session, environment),
    (error) => error instanceof SessionError && error.code === 'CSRF_REJECTED',
  );
  const wrong = new Request('http://localhost:3105/api/v1/session', {
    method: 'DELETE',
    headers: { 'x-csrf-token': 'not-the-token' },
  });
  assert.throws(
    () => requireCsrf(wrong, issued.session, environment),
    (error) => error instanceof SessionError && error.code === 'CSRF_REJECTED',
  );
  const valid = new Request('http://localhost:3105/api/v1/session', {
    method: 'DELETE',
    headers: { 'x-csrf-token': issued.csrfToken },
  });
  assert.doesNotThrow(() => requireCsrf(valid, issued.session, environment));
});

test('wrong roles and non-active memberships are rejected', () => {
  assert.throws(
    () => authorizeActor(actor(), { roles: ['finance'] }),
    (error) =>
      error instanceof AuthorizationError && error.code === 'ROLE_FORBIDDEN',
  );
  for (const status of ['invited', 'suspended', 'revoked']) {
    assert.throws(
      () => authorizeActor(actor({ membershipStatus: status })),
      (error) =>
        error instanceof AuthorizationError &&
        error.code === 'MEMBERSHIP_INACTIVE',
    );
  }
});

test('suspended and revoked persisted memberships invalidate existing sessions', async () => {
  for (const status of ['suspended', 'revoked']) {
    const fixture = await issuedFixture();
    fixture.repository.memberships.set(
      'vendor-a:membership-a',
      membership(
        'membership-a',
        'vendor-a',
        'user-a',
        'vendor_operator',
        status,
      ),
    );
    const request = new Request('http://localhost:3105/api/v1/session', {
      headers: { cookie: fixture.cookie },
    });
    await assert.rejects(
      authenticateRequest(
        request,
        fixture.environment,
        fixture.repository,
        NOW,
      ),
      (error) =>
        error instanceof SessionError && error.code === 'MEMBERSHIP_INACTIVE',
    );
  }
});

test('session revocation and absolute expiry are enforced', async () => {
  const revoked = await issuedFixture();
  await revoked.repository.revokeSession(
    'vendor-a',
    revoked.issued.session.id,
    'user-a',
    'test',
    NOW,
  );
  await assert.rejects(
    authenticateRequest(
      new Request('http://localhost:3105/api/v1/session', {
        headers: { cookie: revoked.cookie },
      }),
      revoked.environment,
      revoked.repository,
      NOW,
    ),
    (error) =>
      error instanceof SessionError && error.code === 'SESSION_REVOKED',
  );

  const expired = await issuedFixture(new MemoryRepository(), {
    createdAt: new Date(NOW.getTime() - 2_000),
    expiresAt: new Date(NOW.getTime() - 1_000),
  });
  await assert.rejects(
    authenticateRequest(
      new Request('http://localhost:3105/api/v1/session', {
        headers: { cookie: expired.cookie },
      }),
      expired.environment,
      expired.repository,
      NOW,
    ),
    (error) =>
      error instanceof SessionError && error.code === 'SESSION_EXPIRED',
  );
});

test('direct-id access is tenant scoped and two vendors remain isolated', async () => {
  const repository = new MemoryRepository();
  assert.equal(
    await repository.findMembershipById('vendor-b', 'membership-a'),
    null,
  );
  assert.equal(
    (await repository.findVendorByOrganizationId('vendor-a')).id,
    'profile-a',
  );
  assert.equal(
    (await repository.findVendorByOrganizationId('vendor-b')).id,
    'profile-b',
  );
  assert.throws(
    () => authorizeActor(actor(), { organizationId: 'vendor-b' }),
    (error) =>
      error instanceof AuthorizationError && error.code === 'TENANT_FORBIDDEN',
  );
  const vendorB = await repository.findVendorByOrganizationId('vendor-b');
  assert.throws(
    () => assertTenantRecord(actor(), vendorB),
    (error) =>
      error instanceof AuthorizationError && error.code === 'TENANT_FORBIDDEN',
  );
});

test('malformed JSON, media types and idempotency headers are rejected', async () => {
  await assert.rejects(
    parseJsonObject(
      new Request('http://localhost/mutate', {
        method: 'POST',
        body: '{',
        headers: { 'content-type': 'application/json' },
      }),
    ),
    (error) => error.code === 'MALFORMED_JSON' && error.status === 400,
  );
  await assert.rejects(
    parseJsonObject(
      new Request('http://localhost/mutate', {
        method: 'POST',
        body: 'ok',
        headers: { 'content-type': 'text/plain' },
      }),
    ),
    (error) => error.code === 'UNSUPPORTED_MEDIA_TYPE' && error.status === 415,
  );
  assert.throws(
    () =>
      requireIdempotencyKey(
        new Request('http://localhost/mutate', { method: 'POST' }),
      ),
    (error) => error.code === 'IDEMPOTENCY_KEY_REQUIRED',
  );
});

test('canonical fingerprints are stable across property order', () => {
  assert.equal(
    canonicalFingerprint('guest.update', {
      nested: { b: 2, a: 1 },
      list: [true, null],
    }),
    canonicalFingerprint('guest.update', {
      list: [true, null],
      nested: { a: 1, b: 2 },
    }),
  );
});

test('idempotent mutations replay, conflict, audit, and never retain request secrets', async () => {
  const repository = new MemoryRepository();
  const input = {
    actor: actor(),
    requestId: 'request-001',
    idempotencyKey: 'mutation-key-001',
    action: 'guest.update',
    payload: { guestId: 'guest-1', privateInput: 'super-secret-request-value' },
    target: { type: 'guest', id: 'guest-1' },
    responseStatus: 200,
    now: NOW,
    effect: async () => {
      repository.domainEffects += 1;
      return { value: { updated: true } };
    },
  };
  const first = await executeProtectedMutation(repository, input);
  const replay = await executeProtectedMutation(repository, input);
  assert.deepEqual(
    [first.replayed, replay.replayed, repository.domainEffects],
    [false, true, 1],
  );
  assert.equal(repository.audits[0].outcome, 'succeeded');
  assert.equal(
    JSON.stringify(repository.audits).includes('super-secret-request-value'),
    false,
  );
  assert.equal(
    JSON.stringify([...repository.receipts.values()]).includes(
      'super-secret-request-value',
    ),
    false,
  );

  await assert.rejects(
    executeProtectedMutation(repository, {
      ...input,
      payload: { guestId: 'guest-1', privateInput: 'different' },
    }),
    (error) => error.code === 'IDEMPOTENCY_CONFLICT' && error.status === 409,
  );
  assert.equal(repository.domainEffects, 1);
  assert.equal(repository.audits.at(-1).outcome, 'rejected');
});

test('transaction failure rolls back domain effect and receipt, then records a failure audit', async () => {
  const repository = new MemoryRepository();
  await assert.rejects(
    executeProtectedMutation(repository, {
      actor: actor(),
      requestId: 'request-rollback',
      idempotencyKey: 'rollback-key-001',
      action: 'guest.update',
      payload: { guestId: 'guest-1' },
      target: { type: 'guest', id: 'guest-1' },
      responseStatus: 200,
      effect: async () => {
        repository.domainEffects += 1;
        throw new Error('synthetic effect failure');
      },
    }),
    /synthetic effect failure/,
  );
  assert.deepEqual(
    [
      repository.domainEffects,
      repository.receipts.size,
      repository.audits.length,
    ],
    [0, 0, 1],
  );
  assert.deepEqual(
    [repository.audits[0].outcome, repository.audits[0].reasonCode],
    ['failed', 'MUTATION_FAILED'],
  );
});

test('health is process-only while readiness fails closed for config or connection', async () => {
  assert.equal(liveness(NOW).status, 'live');
  const missing = await readiness(
    () => loadPlatformEnvironment({}),
    () => [],
    NOW,
  );
  assert.deepEqual(
    [missing.status, missing.checks[0].name],
    ['unavailable', 'configuration'],
  );
  const repository = new MemoryRepository();
  repository.connectionFailure = true;
  const disconnected = await readiness(
    () => loadPlatformEnvironment(environmentSource()),
    () => [{ name: 'database', check: () => repository.checkConnection() }],
    NOW,
  );
  assert.deepEqual(
    disconnected.checks.map((check) => [check.name, check.status]),
    [
      ['configuration', 'ready'],
      ['database', 'unavailable'],
    ],
  );
  assert.equal(disconnected.status, 'unavailable');
});

test('every index names its supported query and schema evolution remains additive', () => {
  assert.equal(PLATFORM_INDEXES.length >= 12, true);
  assert.equal(
    new Set(PLATFORM_INDEXES.map((index) => index.name)).size,
    PLATFORM_INDEXES.length,
  );
  assert.equal(
    PLATFORM_INDEXES.every((index) => index.supportsQuery.trim().length > 20),
    true,
  );
  assert.equal(
    PLATFORM_INDEXES.some(
      (index) => index.name === 'session_token_hash_unique' && index.unique,
    ),
    true,
  );
  assert.equal(
    PLATFORM_INDEXES.some(
      (index) =>
        index.name === 'membership_tenant_id_unique' &&
        index.keys.organizationId === 1,
    ),
    true,
  );
  assert.deepEqual(
    [
      SCHEMA_EVOLUTION_POLICY.currentVersion,
      SCHEMA_EVOLUTION_POLICY.compatibility,
      SCHEMA_EVOLUTION_POLICY.destructiveChangesRequireSeparateTask,
    ],
    [1, 'additive', true],
  );
  const futureOrganization = {
    ...organization('vendor-future'),
    optionalFutureField: 'ignored-by-v1-reader',
  };
  assert.equal(futureOrganization.schemaVersion, 1);
  assert.equal(futureOrganization.status, 'active');
});
