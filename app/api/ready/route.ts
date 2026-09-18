import { loadPlatformEnvironment } from '../../../server/config/env.ts';
import { readiness } from '../../../server/health/readiness.ts';
import { handleApiRequest, jsonResponse } from '../../../server/http/api.ts';

export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<Response> {
  return handleApiRequest(request, async (context) => {
    const result = await readiness(loadPlatformEnvironment, (environment) => [
      {
        name: 'database',
        check: async () => {
          const { getMongoRepository } =
            await import('../../../server/data/mongo.ts');
          await (await getMongoRepository(environment)).checkConnection();
        },
      },
    ]);
    return jsonResponse(
      result,
      result.status === 'ready' ? 200 : 503,
      context.requestId,
    );
  });
}
