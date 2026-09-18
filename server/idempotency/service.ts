import { createHash, randomUUID } from 'node:crypto';

import { createAuditRecord, type AuditTarget } from '../audit/model.ts';
import {
  RepositoryConflictError,
  type PlatformRepository,
  type RepositoryTransaction,
} from '../data/repository.ts';
import type { ActorContext } from '../security/authorization.ts';

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue =
  | JsonPrimitive
  | readonly JsonValue[]
  | { readonly [key: string]: JsonValue };

export interface IdempotencyReceipt {
  readonly id: string;
  readonly schemaVersion: 1;
  readonly organizationId: string;
  readonly key: string;
  readonly fingerprint: string;
  readonly action: string;
  readonly requestId: string;
  readonly actorId: string;
  readonly responseStatus: number;
  readonly response: JsonValue;
  readonly createdAt: Date;
}

export class IdempotencyError extends Error {
  readonly code:
    | 'IDEMPOTENCY_KEY_REQUIRED'
    | 'IDEMPOTENCY_KEY_INVALID'
    | 'IDEMPOTENCY_CONFLICT';
  readonly status: 400 | 409 | 428;

  constructor(
    code:
      | 'IDEMPOTENCY_KEY_REQUIRED'
      | 'IDEMPOTENCY_KEY_INVALID'
      | 'IDEMPOTENCY_CONFLICT',
    status: 400 | 409 | 428,
  ) {
    super(code);
    this.name = 'IdempotencyError';
    this.code = code;
    this.status = status;
  }
}

export interface ProtectedMutationResult<T extends JsonValue> {
  readonly value: T;
  readonly responseStatus: number;
  readonly replayed: boolean;
}

const IDEMPOTENCY_KEY_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_.:-]{7,127}$/;

export function requireIdempotencyKey(request: Request): string {
  const value = request.headers.get('idempotency-key')?.trim();
  if (!value) throw new IdempotencyError('IDEMPOTENCY_KEY_REQUIRED', 428);
  if (!IDEMPOTENCY_KEY_PATTERN.test(value)) {
    throw new IdempotencyError('IDEMPOTENCY_KEY_INVALID', 400);
  }
  return value;
}

function canonicalize(value: JsonValue): string {
  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'boolean'
  ) {
    return JSON.stringify(value);
  }
  if (typeof value === 'number') {
    if (!Number.isFinite(value))
      throw new TypeError('Fingerprint values must be finite JSON numbers.');
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(',')}]`;
  const record = value as Readonly<Record<string, JsonValue>>;
  const entries = Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalize(record[key]!)}`);
  return `{${entries.join(',')}}`;
}

export function canonicalFingerprint(
  action: string,
  payload: JsonValue,
): string {
  return createHash('sha256')
    .update(canonicalize({ action, payload }), 'utf8')
    .digest('base64url');
}

async function recordOutcomeAudit(
  repository: PlatformRepository,
  input: {
    actor: ActorContext;
    requestId: string;
    idempotencyKey: string;
    action: string;
    target: AuditTarget;
    occurredAt: Date;
    reasonCode: string;
    outcome: 'rejected' | 'failed';
  },
): Promise<void> {
  await repository.withTransaction(async (transaction) => {
    await repository.appendAudit(
      createAuditRecord({
        organizationId: input.actor.organizationId,
        actorId: input.actor.userId,
        actorRole: input.actor.role,
        requestId: input.requestId,
        idempotencyKey: input.idempotencyKey,
        action: input.action,
        target: input.target,
        occurredAt: input.occurredAt,
        outcome: input.outcome,
        reasonCode: input.reasonCode,
      }),
      transaction,
    );
  });
}

export async function executeProtectedMutation<T extends JsonValue>(
  repository: PlatformRepository,
  input: {
    readonly actor: ActorContext;
    readonly requestId: string;
    readonly idempotencyKey: string;
    readonly action: string;
    readonly payload: JsonValue;
    readonly target: AuditTarget;
    readonly responseStatus: number;
    readonly now?: Date;
    readonly effect: (
      transaction: RepositoryTransaction,
    ) => Promise<{ readonly value: T; readonly target?: AuditTarget }>;
  },
): Promise<ProtectedMutationResult<T>> {
  if (!IDEMPOTENCY_KEY_PATTERN.test(input.idempotencyKey)) {
    throw new IdempotencyError('IDEMPOTENCY_KEY_INVALID', 400);
  }
  const now = input.now ?? new Date();
  const fingerprint = canonicalFingerprint(input.action, input.payload);

  const run = async (
    transaction: RepositoryTransaction,
  ): Promise<ProtectedMutationResult<T>> => {
    const existing = await repository.findIdempotencyReceipt(
      input.actor.organizationId,
      input.idempotencyKey,
      transaction,
    );
    if (existing) {
      if (existing.fingerprint !== fingerprint) {
        throw new IdempotencyError('IDEMPOTENCY_CONFLICT', 409);
      }
      return {
        value: existing.response as T,
        responseStatus: existing.responseStatus,
        replayed: true,
      };
    }

    const effect = await input.effect(transaction);
    const target = effect.target ?? input.target;
    const receipt: IdempotencyReceipt = Object.freeze({
      id: randomUUID(),
      schemaVersion: 1,
      organizationId: input.actor.organizationId,
      key: input.idempotencyKey,
      fingerprint,
      action: input.action,
      requestId: input.requestId,
      actorId: input.actor.userId,
      responseStatus: input.responseStatus,
      response: effect.value,
      createdAt: now,
    });
    await repository.appendAudit(
      createAuditRecord({
        organizationId: input.actor.organizationId,
        actorId: input.actor.userId,
        actorRole: input.actor.role,
        requestId: input.requestId,
        idempotencyKey: input.idempotencyKey,
        action: input.action,
        target,
        occurredAt: now,
        outcome: 'succeeded',
      }),
      transaction,
    );
    await repository.insertIdempotencyReceipt(receipt, transaction);
    return {
      value: effect.value,
      responseStatus: input.responseStatus,
      replayed: false,
    };
  };

  try {
    return await repository.withTransaction(run);
  } catch (error) {
    let normalizedError = error;
    if (error instanceof RepositoryConflictError) {
      const receipt = await repository.findIdempotencyReceipt(
        input.actor.organizationId,
        input.idempotencyKey,
      );
      if (receipt?.fingerprint === fingerprint) {
        return {
          value: receipt.response as T,
          responseStatus: receipt.responseStatus,
          replayed: true,
        };
      }
      normalizedError = new IdempotencyError('IDEMPOTENCY_CONFLICT', 409);
    }
    if (
      normalizedError instanceof IdempotencyError &&
      normalizedError.code === 'IDEMPOTENCY_CONFLICT'
    ) {
      await recordOutcomeAudit(repository, {
        actor: input.actor,
        requestId: input.requestId,
        idempotencyKey: input.idempotencyKey,
        action: input.action,
        target: input.target,
        occurredAt: now,
        reasonCode: normalizedError.code,
        outcome: 'rejected',
      });
    } else {
      const candidateCode =
        normalizedError &&
        typeof normalizedError === 'object' &&
        'code' in normalizedError &&
        typeof normalizedError.code === 'string' &&
        /^[A-Z][A-Z0-9_]{1,63}$/.test(normalizedError.code)
          ? normalizedError.code
          : 'MUTATION_FAILED';
      await recordOutcomeAudit(repository, {
        actor: input.actor,
        requestId: input.requestId,
        idempotencyKey: input.idempotencyKey,
        action: input.action,
        target: input.target,
        occurredAt: now,
        reasonCode: candidateCode,
        outcome: 'failed',
      });
    }
    throw normalizedError;
  }
}
