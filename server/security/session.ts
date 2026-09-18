import {
  createHmac,
  randomBytes,
  randomUUID,
  timingSafeEqual,
} from 'node:crypto';

import type { PlatformEnvironment } from '../config/env.ts';
import type { RepositoryTransaction } from '../data/repository.ts';
import type {
  MembershipDocument,
  OrganizationDocument,
  UserDocument,
} from '../tenancy/model.ts';
import type { ActorContext } from './authorization.ts';

export interface SessionDocument {
  readonly id: string;
  readonly schemaVersion: 1;
  readonly organizationId: string;
  readonly userId: string;
  readonly membershipId: string;
  readonly tokenHash: string;
  readonly csrfTokenHash: string;
  readonly createdAt: Date;
  readonly expiresAt: Date;
  readonly revokedAt: Date | null;
  readonly revokedBy: string | null;
  readonly revocationReason: string | null;
}

export interface SessionRepository {
  findSessionByTokenHash(
    tokenHash: string,
    transaction?: RepositoryTransaction,
  ): Promise<SessionDocument | null>;
  findOrganizationById(
    organizationId: string,
    transaction?: RepositoryTransaction,
  ): Promise<OrganizationDocument | null>;
  findUserById(
    userId: string,
    transaction?: RepositoryTransaction,
  ): Promise<UserDocument | null>;
  findMembershipById(
    organizationId: string,
    membershipId: string,
    transaction?: RepositoryTransaction,
  ): Promise<MembershipDocument | null>;
  insertSession(
    session: SessionDocument,
    transaction?: RepositoryTransaction,
  ): Promise<void>;
  revokeSession(
    organizationId: string,
    sessionId: string,
    revokedBy: string,
    reason: string,
    revokedAt: Date,
    transaction?: RepositoryTransaction,
  ): Promise<boolean>;
}

export class SessionError extends Error {
  readonly code:
    | 'AUTHENTICATION_REQUIRED'
    | 'SESSION_INVALID'
    | 'SESSION_EXPIRED'
    | 'SESSION_REVOKED'
    | 'IDENTITY_INACTIVE'
    | 'MEMBERSHIP_INACTIVE'
    | 'ORGANIZATION_INACTIVE'
    | 'CSRF_REJECTED';
  readonly status: 401 | 403;

  constructor(
    code:
      | 'AUTHENTICATION_REQUIRED'
      | 'SESSION_INVALID'
      | 'SESSION_EXPIRED'
      | 'SESSION_REVOKED'
      | 'IDENTITY_INACTIVE'
      | 'MEMBERSHIP_INACTIVE'
      | 'ORGANIZATION_INACTIVE'
      | 'CSRF_REJECTED',
    status: 401 | 403,
  ) {
    super(code);
    this.name = 'SessionError';
    this.code = code;
    this.status = status;
  }
}

export interface AuthenticatedSession {
  readonly actor: ActorContext;
  readonly session: SessionDocument;
}

export interface IssuedSession {
  readonly session: SessionDocument;
  readonly cookie: string;
  readonly csrfToken: string;
}

function digest(secret: string, value: string): string {
  return createHmac('sha256', secret).update(value, 'utf8').digest('base64url');
}

function secureEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left, 'utf8');
  const rightBuffer = Buffer.from(right, 'utf8');
  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

function parseCookieHeader(header: string | null): ReadonlyMap<string, string> {
  const values = new Map<string, string>();
  if (!header) return values;

  for (const pair of header.split(';')) {
    const separator = pair.indexOf('=');
    if (separator <= 0) continue;
    const name = pair.slice(0, separator).trim();
    const value = pair.slice(separator + 1).trim();
    if (values.has(name)) throw new SessionError('SESSION_INVALID', 401);
    try {
      values.set(name, decodeURIComponent(value));
    } catch {
      throw new SessionError('SESSION_INVALID', 401);
    }
  }
  return values;
}

export function readSessionToken(request: Request, cookieName: string): string {
  const token = parseCookieHeader(request.headers.get('cookie')).get(
    cookieName,
  );
  if (!token) throw new SessionError('AUTHENTICATION_REQUIRED', 401);
  if (!/^[A-Za-z0-9_-]{43}$/.test(token))
    throw new SessionError('SESSION_INVALID', 401);
  return token;
}

export async function authenticateRequest(
  request: Request,
  environment: PlatformEnvironment,
  repository: SessionRepository,
  now = new Date(),
): Promise<AuthenticatedSession> {
  const token = readSessionToken(request, environment.sessionCookieName);
  const session = await repository.findSessionByTokenHash(
    digest(environment.sessionSecret, token),
  );
  if (!session) throw new SessionError('SESSION_INVALID', 401);
  if (session.revokedAt) throw new SessionError('SESSION_REVOKED', 401);
  if (session.expiresAt.getTime() <= now.getTime())
    throw new SessionError('SESSION_EXPIRED', 401);

  const [organization, user, membership] = await Promise.all([
    repository.findOrganizationById(session.organizationId),
    repository.findUserById(session.userId),
    repository.findMembershipById(session.organizationId, session.membershipId),
  ]);

  if (!organization || organization.status !== 'active') {
    throw new SessionError('ORGANIZATION_INACTIVE', 403);
  }
  if (!user || user.status !== 'active')
    throw new SessionError('IDENTITY_INACTIVE', 403);
  if (
    !membership ||
    membership.organizationId !== session.organizationId ||
    membership.userId !== session.userId ||
    membership.status !== 'active'
  ) {
    throw new SessionError('MEMBERSHIP_INACTIVE', 403);
  }

  return {
    session,
    actor: Object.freeze({
      sessionId: session.id,
      userId: user.id,
      membershipId: membership.id,
      organizationId: membership.organizationId,
      role: membership.role,
      membershipStatus: membership.status,
    }),
  };
}

export function requireCsrf(
  request: Request,
  session: SessionDocument,
  environment: PlatformEnvironment,
): void {
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method.toUpperCase())) return;
  const token = request.headers.get('x-csrf-token')?.trim();
  if (!token || token.length > 256)
    throw new SessionError('CSRF_REJECTED', 403);
  const candidate = digest(environment.sessionSecret, token);
  if (!secureEqual(candidate, session.csrfTokenHash)) {
    throw new SessionError('CSRF_REJECTED', 403);
  }
}

export function issueSession(
  environment: PlatformEnvironment,
  input: {
    readonly organizationId: string;
    readonly userId: string;
    readonly membershipId: string;
    readonly createdAt: Date;
    readonly expiresAt: Date;
  },
): IssuedSession {
  if (input.expiresAt.getTime() <= input.createdAt.getTime()) {
    throw new TypeError('Session expiry must be after creation.');
  }
  const token = randomBytes(32).toString('base64url');
  const csrfToken = randomBytes(32).toString('base64url');
  const session: SessionDocument = Object.freeze({
    id: randomUUID(),
    schemaVersion: 1,
    organizationId: input.organizationId,
    userId: input.userId,
    membershipId: input.membershipId,
    tokenHash: digest(environment.sessionSecret, token),
    csrfTokenHash: digest(environment.sessionSecret, csrfToken),
    createdAt: input.createdAt,
    expiresAt: input.expiresAt,
    revokedAt: null,
    revokedBy: null,
    revocationReason: null,
  });
  const maxAge = Math.max(
    0,
    Math.floor((input.expiresAt.getTime() - input.createdAt.getTime()) / 1000),
  );
  const cookie = `${environment.sessionCookieName}=${encodeURIComponent(token)}; Path=/; Max-Age=${maxAge}; Secure; HttpOnly; SameSite=Lax`;
  return { session, cookie, csrfToken };
}

export function clearSessionCookie(cookieName: string): string {
  return `${cookieName}=; Path=/; Max-Age=0; Secure; HttpOnly; SameSite=Lax`;
}
