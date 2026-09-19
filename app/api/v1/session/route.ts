import {
  loadPlatformEnvironment,
  type PlatformEnvironment,
} from '../../../../server/config/env.ts';
import type { PlatformRepository } from '../../../../server/data/repository.ts';
import {
  executeProtectedMutation,
  replayProtectedMutation,
  requireIdempotencyKey,
  type JsonValue,
} from '../../../../server/idempotency/service.ts';
import {
  emptyResponse,
  handleApiRequest,
  jsonResponse,
} from '../../../../server/http/api.ts';
import {
  authorizeActor,
  type ActorContext,
} from '../../../../server/security/authorization.ts';
import {
  authenticateRequest,
  clearSessionCookie,
  readSessionToken,
  requireCsrf,
  SessionError,
  type SessionDocument,
  validateRevokedLogoutReplay,
} from '../../../../server/security/session.ts';

export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<Response> {
  return handleApiRequest(request, async (context) => {
    const environment = loadPlatformEnvironment();
    readSessionToken(request, environment.sessionCookieName);
    const { getMongoRepository } =
      await import('../../../../server/data/mongo.ts');
    const repository = await getMongoRepository(environment);
    const authenticated = await authenticateRequest(
      request,
      environment,
      repository,
    );
    const actor = authorizeActor(authenticated.actor);
    return jsonResponse(
      {
        session: {
          userId: actor.userId,
          organizationId: actor.organizationId,
          role: actor.role,
          membershipStatus: actor.membershipStatus,
          expiresAt: authenticated.session.expiresAt.toISOString(),
        },
      },
      200,
      context.requestId,
    );
  });
}

export async function DELETE(request: Request): Promise<Response> {
  return handleApiRequest(request, async (context) => {
    const environment = loadPlatformEnvironment();
    readSessionToken(request, environment.sessionCookieName);
    const { getMongoRepository } =
      await import('../../../../server/data/mongo.ts');
    const repository = await getMongoRepository(environment);
    return deleteSessionWithRepository(
      request,
      environment,
      repository,
      context.requestId,
    );
  });
}

function isExactLogoutResponse(
  response: JsonValue,
  responseStatus: number,
): boolean {
  return (
    responseStatus === 204 &&
    typeof response === 'object' &&
    response !== null &&
    !Array.isArray(response) &&
    'revoked' in response &&
    Object.keys(response).length === 1 &&
    response.revoked === true
  );
}

export async function deleteSessionWithRepository(
  request: Request,
  environment: PlatformEnvironment,
  repository: PlatformRepository,
  requestId: string,
  now = new Date(),
): Promise<Response> {
  let actor: ActorContext;
  let session: SessionDocument;
  let revokedReplay = false;
  try {
    const authenticated = await authenticateRequest(
      request,
      environment,
      repository,
      now,
    );
    actor = authorizeActor(authenticated.actor);
    session = authenticated.session;
    requireCsrf(request, session, environment);
  } catch (error) {
    if (!(error instanceof SessionError) || error.code !== 'SESSION_REVOKED') {
      throw error;
    }
    const replayContext = await validateRevokedLogoutReplay(
      request,
      environment,
      repository,
      now,
    );
    actor = replayContext.actor;
    session = replayContext.session;
    revokedReplay = true;
  }

  const idempotencyKey = requireIdempotencyKey(request);
  const mutationInput = {
    actor,
    requestId,
    idempotencyKey,
    action: 'session.revoke',
    payload: { sessionId: actor.sessionId },
    target: { type: 'session', id: actor.sessionId },
    now,
  } as const;

  const result = revokedReplay
    ? await replayProtectedMutation<{ readonly revoked: true }>(repository, {
        ...mutationInput,
        responseValidator: isExactLogoutResponse,
      })
    : await executeProtectedMutation(repository, {
        ...mutationInput,
        responseStatus: 204,
        effect: async (transaction) => {
          const revoked = await repository.revokeSession(
            actor.organizationId,
            session.id,
            actor.userId,
            'self_logout',
            now,
            transaction,
          );
          if (!revoked) throw new SessionError('SESSION_REVOKED', 401);
          return { value: { revoked: true as const } };
        },
      });

  return emptyResponse(result.responseStatus, requestId, {
    'set-cookie': clearSessionCookie(environment.sessionCookieName),
    'idempotency-replayed': String(result.replayed),
  });
}
