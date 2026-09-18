import type { MembershipStatus, PlatformRole } from "../tenancy/model.ts";

export interface ActorContext {
  readonly sessionId: string;
  readonly userId: string;
  readonly membershipId: string;
  readonly organizationId: string;
  readonly role: PlatformRole;
  readonly membershipStatus: MembershipStatus;
}

export class AuthorizationError extends Error {
  constructor(
    readonly code:
      | "AUTHENTICATION_REQUIRED"
      | "ROLE_FORBIDDEN"
      | "MEMBERSHIP_INACTIVE"
      | "TENANT_FORBIDDEN",
    readonly status: 401 | 403,
  ) {
    super(code);
    this.name = "AuthorizationError";
  }
}

export interface AuthorizationRequirement {
  readonly roles?: readonly PlatformRole[];
  readonly organizationId?: string;
}

export function authorizeActor(
  actor: ActorContext | null,
  requirement: AuthorizationRequirement = {},
): ActorContext {
  if (!actor) {
    throw new AuthorizationError("AUTHENTICATION_REQUIRED", 401);
  }
  if (actor.membershipStatus !== "active") {
    throw new AuthorizationError("MEMBERSHIP_INACTIVE", 403);
  }
  if (requirement.organizationId && actor.organizationId !== requirement.organizationId) {
    throw new AuthorizationError("TENANT_FORBIDDEN", 403);
  }
  if (requirement.roles && !requirement.roles.includes(actor.role)) {
    throw new AuthorizationError("ROLE_FORBIDDEN", 403);
  }
  return actor;
}

export function assertTenantRecord<T extends { readonly organizationId: string }>(
  actor: ActorContext,
  record: T | null,
): T {
  if (!record || record.organizationId !== actor.organizationId) {
    throw new AuthorizationError("TENANT_FORBIDDEN", 403);
  }
  return record;
}

