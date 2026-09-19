import type { AuditRecord } from '../audit/model.ts';
import type { IdempotencyReceipt } from '../idempotency/service.ts';
import type {
  SessionDocument,
  SessionRepository,
} from '../security/session.ts';
import type {
  MembershipDocument,
  OrganizationDocument,
  UserDocument,
  VendorDocument,
} from '../tenancy/model.ts';

export interface RepositoryTransaction {
  readonly transactionId: string;
}

export class RepositoryConflictError extends Error {
  readonly code = 'REPOSITORY_CONFLICT';

  constructor(message = 'A unique repository constraint was violated.') {
    super(message);
    this.name = 'RepositoryConflictError';
  }
}

export interface PlatformRepository extends SessionRepository {
  findOrganizationById(
    organizationId: string,
    transaction?: RepositoryTransaction,
  ): Promise<OrganizationDocument | null>;
  findVendorByOrganizationId(
    organizationId: string,
    transaction?: RepositoryTransaction,
  ): Promise<VendorDocument | null>;
  findUserById(
    userId: string,
    transaction?: RepositoryTransaction,
  ): Promise<UserDocument | null>;
  findMembershipById(
    organizationId: string,
    membershipId: string,
    transaction?: RepositoryTransaction,
  ): Promise<MembershipDocument | null>;
  findSessionByTokenHash(
    tokenHash: string,
    transaction?: RepositoryTransaction,
  ): Promise<SessionDocument | null>;
  findIdempotencyReceipt(
    organizationId: string,
    key: string,
    transaction?: RepositoryTransaction,
  ): Promise<IdempotencyReceipt | null>;
  insertIdempotencyReceipt(
    receipt: IdempotencyReceipt,
    transaction: RepositoryTransaction,
  ): Promise<void>;
  appendAudit(
    record: AuditRecord,
    transaction?: RepositoryTransaction,
  ): Promise<void>;
  withTransaction<T>(
    work: (transaction: RepositoryTransaction) => Promise<T>,
  ): Promise<T>;
  checkConnection(): Promise<void>;
}
