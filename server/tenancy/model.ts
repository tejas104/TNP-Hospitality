export const PLATFORM_ROLES = [
  'platform_admin',
  'organization_admin',
  'operations',
  'finance',
  'planner',
  'client',
  'vendor_operator',
  'worker',
] as const;

export type PlatformRole = (typeof PLATFORM_ROLES)[number];

export const MEMBERSHIP_STATUSES = [
  'invited',
  'active',
  'suspended',
  'revoked',
] as const;
export type MembershipStatus = (typeof MEMBERSHIP_STATUSES)[number];

export type OrganizationStatus = 'active' | 'suspended' | 'revoked';
export type OrganizationKind = 'tnp' | 'vendor' | 'customer';
export type UserStatus = 'active' | 'suspended' | 'revoked';
export type VendorStatus = 'invited' | 'active' | 'suspended' | 'revoked';

export interface OrganizationDocument {
  readonly id: string;
  readonly schemaVersion: 1;
  readonly kind: OrganizationKind;
  readonly displayName: string;
  readonly status: OrganizationStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface VendorDocument {
  readonly id: string;
  readonly schemaVersion: 1;
  readonly organizationId: string;
  readonly status: VendorStatus;
  readonly entitlementKeys: readonly string[];
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface UserDocument {
  readonly id: string;
  readonly schemaVersion: 1;
  readonly normalizedEmail: string;
  readonly displayName: string;
  readonly status: UserStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface MembershipDocument {
  readonly id: string;
  readonly schemaVersion: 1;
  readonly organizationId: string;
  readonly userId: string;
  readonly role: PlatformRole;
  readonly status: MembershipStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

const IDENTIFIER_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,127}$/;

export function isPlatformRole(value: unknown): value is PlatformRole {
  return (
    typeof value === 'string' && PLATFORM_ROLES.includes(value as PlatformRole)
  );
}

export function isMembershipStatus(value: unknown): value is MembershipStatus {
  return (
    typeof value === 'string' &&
    MEMBERSHIP_STATUSES.includes(value as MembershipStatus)
  );
}

export function isValidIdentifier(value: unknown): value is string {
  return typeof value === 'string' && IDENTIFIER_PATTERN.test(value);
}
