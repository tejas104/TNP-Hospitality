import { randomUUID } from 'node:crypto';

import {
  MongoClient,
  MongoServerError,
  type ClientSession,
  type Collection,
  type CreateIndexesOptions,
  type Db,
} from 'mongodb';

import type { AuditRecord } from '../audit/model.ts';
import type { PlatformEnvironment } from '../config/env.ts';
import type { IdempotencyReceipt } from '../idempotency/service.ts';
import type { SessionDocument } from '../security/session.ts';
import type {
  MembershipDocument,
  OrganizationDocument,
  UserDocument,
  VendorDocument,
} from '../tenancy/model.ts';
import { PLATFORM_INDEXES } from './indexes.ts';
import {
  RepositoryConflictError,
  type PlatformRepository,
  type RepositoryTransaction,
} from './repository.ts';

export class DatabaseUnavailableError extends Error {
  readonly code = 'DATABASE_UNAVAILABLE';
  readonly status = 503;

  constructor() {
    super('Database dependency is unavailable.');
    this.name = 'DatabaseUnavailableError';
  }
}

class MongoRepositoryTransaction implements RepositoryTransaction {
  readonly transactionId = randomUUID();
  readonly session: ClientSession;

  constructor(session: ClientSession) {
    this.session = session;
  }
}

interface Collections {
  readonly organizations: Collection<OrganizationDocument>;
  readonly vendors: Collection<VendorDocument>;
  readonly users: Collection<UserDocument>;
  readonly memberships: Collection<MembershipDocument>;
  readonly sessions: Collection<SessionDocument>;
  readonly idempotencyReceipts: Collection<IdempotencyReceipt>;
  readonly auditRecords: Collection<AuditRecord>;
}

function collections(database: Db): Collections {
  return {
    organizations: database.collection<OrganizationDocument>('organizations'),
    vendors: database.collection<VendorDocument>('vendors'),
    users: database.collection<UserDocument>('users'),
    memberships: database.collection<MembershipDocument>('memberships'),
    sessions: database.collection<SessionDocument>('sessions'),
    idempotencyReceipts: database.collection<IdempotencyReceipt>(
      'idempotencyReceipts',
    ),
    auditRecords: database.collection<AuditRecord>('auditRecords'),
  };
}

function mongoSession(
  transaction?: RepositoryTransaction,
): ClientSession | undefined {
  if (!transaction) return undefined;
  if (!(transaction instanceof MongoRepositoryTransaction)) {
    throw new TypeError('Repository transaction belongs to another adapter.');
  }
  return transaction.session;
}

function translateWriteError(error: unknown): never {
  if (error instanceof MongoServerError && error.code === 11000) {
    throw new RepositoryConflictError();
  }
  throw error;
}

export class MongoPlatformRepository implements PlatformRepository {
  readonly #collections: Collections;
  private readonly client: MongoClient;
  private readonly database: Db;

  constructor(client: MongoClient, database: Db) {
    this.client = client;
    this.database = database;
    this.#collections = collections(database);
  }

  async checkConnection(): Promise<void> {
    try {
      await this.database.command({ ping: 1 });
    } catch {
      throw new DatabaseUnavailableError();
    }
  }

  async findOrganizationById(
    organizationId: string,
    transaction?: RepositoryTransaction,
  ): Promise<OrganizationDocument | null> {
    return this.#collections.organizations.findOne(
      { id: organizationId },
      { session: mongoSession(transaction) },
    );
  }

  async findVendorByOrganizationId(
    organizationId: string,
    transaction?: RepositoryTransaction,
  ): Promise<VendorDocument | null> {
    return this.#collections.vendors.findOne(
      { organizationId },
      { session: mongoSession(transaction) },
    );
  }

  async findUserById(
    userId: string,
    transaction?: RepositoryTransaction,
  ): Promise<UserDocument | null> {
    return this.#collections.users.findOne(
      { id: userId },
      { session: mongoSession(transaction) },
    );
  }

  async findMembershipById(
    organizationId: string,
    membershipId: string,
    transaction?: RepositoryTransaction,
  ): Promise<MembershipDocument | null> {
    return this.#collections.memberships.findOne(
      { organizationId, id: membershipId },
      { session: mongoSession(transaction) },
    );
  }

  async findSessionByTokenHash(
    tokenHash: string,
    transaction?: RepositoryTransaction,
  ): Promise<SessionDocument | null> {
    return this.#collections.sessions.findOne(
      { tokenHash },
      { session: mongoSession(transaction) },
    );
  }

  async insertSession(
    session: SessionDocument,
    transaction?: RepositoryTransaction,
  ): Promise<void> {
    try {
      await this.#collections.sessions.insertOne(session, {
        session: mongoSession(transaction),
      });
    } catch (error) {
      translateWriteError(error);
    }
  }

  async revokeSession(
    organizationId: string,
    sessionId: string,
    revokedBy: string,
    reason: string,
    revokedAt: Date,
    transaction?: RepositoryTransaction,
  ): Promise<boolean> {
    const result = await this.#collections.sessions.updateOne(
      { organizationId, id: sessionId, revokedAt: null },
      { $set: { revokedAt, revokedBy, revocationReason: reason } },
      { session: mongoSession(transaction) },
    );
    return result.modifiedCount === 1;
  }

  async findIdempotencyReceipt(
    organizationId: string,
    key: string,
    transaction?: RepositoryTransaction,
  ): Promise<IdempotencyReceipt | null> {
    return this.#collections.idempotencyReceipts.findOne(
      { organizationId, key },
      { session: mongoSession(transaction) },
    );
  }

  async insertIdempotencyReceipt(
    receipt: IdempotencyReceipt,
    transaction: RepositoryTransaction,
  ): Promise<void> {
    try {
      await this.#collections.idempotencyReceipts.insertOne(receipt, {
        session: mongoSession(transaction),
      });
    } catch (error) {
      translateWriteError(error);
    }
  }

  async appendAudit(
    record: AuditRecord,
    transaction?: RepositoryTransaction,
  ): Promise<void> {
    try {
      await this.#collections.auditRecords.insertOne(record, {
        session: mongoSession(transaction),
      });
    } catch (error) {
      translateWriteError(error);
    }
  }

  async withTransaction<T>(
    work: (transaction: RepositoryTransaction) => Promise<T>,
  ): Promise<T> {
    const session = this.client.startSession();
    let result!: T;
    let completed = false;
    try {
      await session.withTransaction(async () => {
        result = await work(new MongoRepositoryTransaction(session));
        completed = true;
      });
      if (!completed) throw new Error('Transaction callback did not complete.');
      return result;
    } finally {
      await session.endSession();
    }
  }
}

let repositoryPromise: Promise<MongoPlatformRepository> | undefined;

export function getMongoRepository(
  environment: PlatformEnvironment,
): Promise<MongoPlatformRepository> {
  repositoryPromise ??= (async () => {
    const client = new MongoClient(environment.mongodbUri, {
      appName: 'tnp-hospitality-platform',
      connectTimeoutMS: 3_000,
      serverSelectionTimeoutMS: 3_000,
      retryWrites: true,
    });
    try {
      await client.connect();
      return new MongoPlatformRepository(
        client,
        client.db(environment.mongodbDatabaseName),
      );
    } catch {
      await client.close().catch(() => undefined);
      repositoryPromise = undefined;
      throw new DatabaseUnavailableError();
    }
  })();
  return repositoryPromise;
}

export async function applyPlatformIndexes(database: Db): Promise<void> {
  const platformCollections = collections(database);
  for (const specification of PLATFORM_INDEXES) {
    const options: CreateIndexesOptions = { name: specification.name };
    if (specification.unique !== undefined)
      options.unique = specification.unique;
    if (specification.expireAfterSeconds !== undefined)
      options.expireAfterSeconds = specification.expireAfterSeconds;
    await platformCollections[specification.collection].createIndex(
      specification.keys,
      options,
    );
  }
}
