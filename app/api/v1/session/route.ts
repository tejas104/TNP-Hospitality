import { loadPlatformEnvironment } from '../../../../server/config/env.ts';
import {
  executeProtectedMutation,
  requireIdempotencyKey,
} from '../../../../server/idempotency/service.ts';
import {
  emptyResponse,
  handleApiRequest,
  jsonResponse,
} from '../../../../server/http/api.ts';
import { authorizeActor } from '../../../../server/security/authorization.ts';
import {
  authenticateRequest,
  clearSessionCookie,
  readSessionToken,
  requireCsrf,
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
    const authenticated = await authenticateRequest(
      request,
      environment,
      repository,
    );
    const actor = authorizeActor(authenticated.actor);
    requireCsrf(request, authenticated.session, environment);
    const idempotencyKey = requireIdempotencyKey(request);
    const now = new Date();

    const result = await executeProtectedMutation(repository, {
      actor,
      requestId: context.requestId,
      idempotencyKey,
      action: 'session.revoke',
      payload: { sessionId: actor.sessionId },
      target: { type: 'session', id: actor.sessionId },
      responseStatus: 204,
      now,
      effect: async (transaction) => {
        const revoked = await repository.revokeSession(
          actor.organizationId,
          actor.sessionId,
          actor.userId,
          'self_logout',
          now,
          transaction,
        );
        return { value: { revoked } };
      },
    });

    return emptyResponse(result.responseStatus, context.requestId, {
      'set-cookie': clearSessionCookie(environment.sessionCookieName),
      'idempotency-replayed': String(result.replayed),
    });
  });
}
