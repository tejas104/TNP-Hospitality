import { handleApiRequest, jsonResponse } from '../../../server/http/api.ts';
import { liveness } from '../../../server/health/readiness.ts';

export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<Response> {
  return handleApiRequest(request, async (context) =>
    jsonResponse(liveness(), 200, context.requestId),
  );
}
