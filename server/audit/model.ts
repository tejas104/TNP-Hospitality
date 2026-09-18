import { randomUUID } from "node:crypto";

import type { PlatformRole } from "../tenancy/model.ts";

export type AuditOutcome = "succeeded" | "rejected" | "failed";

export interface AuditTarget {
  readonly type: string;
  readonly id: string;
}

export interface AuditRecord {
  readonly id: string;
  readonly schemaVersion: 1;
  readonly organizationId: string;
  readonly actorId: string;
  readonly actorRole: PlatformRole;
  readonly requestId: string;
  readonly idempotencyKey: string;
  readonly action: string;
  readonly target: AuditTarget;
  readonly occurredAt: Date;
  readonly outcome: AuditOutcome;
  readonly reasonCode?: string;
}

export interface CreateAuditRecordInput extends Omit<AuditRecord, "id" | "schemaVersion"> {
  readonly id?: string;
}

const SAFE_LABEL = /^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,127}$/;

export function createAuditRecord(input: CreateAuditRecordInput): AuditRecord {
  for (const [field, value] of [
    ["organizationId", input.organizationId],
    ["actorId", input.actorId],
    ["requestId", input.requestId],
    ["action", input.action],
    ["target.type", input.target.type],
    ["target.id", input.target.id],
  ] as const) {
    if (!SAFE_LABEL.test(value)) {
      throw new TypeError(`Audit ${field} is malformed.`);
    }
  }

  return Object.freeze({
    ...input,
    id: input.id ?? randomUUID(),
    schemaVersion: 1 as const,
    target: Object.freeze({ ...input.target }),
  });
}

