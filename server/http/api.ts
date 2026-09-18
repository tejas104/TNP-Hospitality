import { randomUUID } from 'node:crypto';

import { ConfigurationError } from '../config/env.ts';
import { AuthorizationError } from '../security/authorization.ts';
import { SessionError } from '../security/session.ts';

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly publicMessage: string;

  constructor(status: number, code: string, publicMessage: string) {
    super(code);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.publicMessage = publicMessage;
  }
}

export interface ApiRequestContext {
  readonly requestId: string;
  readonly method: string;
  readonly pathname: string;
}

const REQUEST_ID_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,127}$/;

export function createRequestContext(request: Request): ApiRequestContext {
  const supplied = request.headers.get('x-request-id')?.trim();
  return Object.freeze({
    requestId:
      supplied && REQUEST_ID_PATTERN.test(supplied) ? supplied : randomUUID(),
    method: request.method.toUpperCase(),
    pathname: new URL(request.url).pathname,
  });
}

export function jsonResponse(
  body: unknown,
  status = 200,
  requestId?: string,
  headers?: HeadersInit,
): Response {
  const responseHeaders = new Headers(headers);
  responseHeaders.set('content-type', 'application/json; charset=utf-8');
  responseHeaders.set('cache-control', 'no-store');
  if (requestId) responseHeaders.set('x-request-id', requestId);
  return new Response(JSON.stringify(body), {
    status,
    headers: responseHeaders,
  });
}

export function emptyResponse(
  status: number,
  requestId: string,
  headers?: HeadersInit,
): Response {
  const responseHeaders = new Headers(headers);
  responseHeaders.set('cache-control', 'no-store');
  responseHeaders.set('x-request-id', requestId);
  return new Response(null, { status, headers: responseHeaders });
}

export async function parseJsonObject(
  request: Request,
  maximumBytes = 32_768,
): Promise<Record<string, unknown>> {
  const contentType = request.headers
    .get('content-type')
    ?.split(';', 1)[0]
    .trim()
    .toLowerCase();
  if (contentType !== 'application/json') {
    throw new ApiError(
      415,
      'UNSUPPORTED_MEDIA_TYPE',
      'Expected an application/json request body.',
    );
  }
  const contentLength = Number(request.headers.get('content-length') ?? 0);
  if (Number.isFinite(contentLength) && contentLength > maximumBytes) {
    throw new ApiError(413, 'PAYLOAD_TOO_LARGE', 'Request body is too large.');
  }
  const text = await request.text();
  if (Buffer.byteLength(text, 'utf8') > maximumBytes) {
    throw new ApiError(413, 'PAYLOAD_TOO_LARGE', 'Request body is too large.');
  }
  try {
    const value: unknown = JSON.parse(text);
    if (!value || typeof value !== 'object' || Array.isArray(value))
      throw new TypeError();
    return value as Record<string, unknown>;
  } catch {
    throw new ApiError(
      400,
      'MALFORMED_JSON',
      'Request body must be a valid JSON object.',
    );
  }
}

function normalizeError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (error instanceof SessionError || error instanceof AuthorizationError) {
    return new ApiError(
      error.status,
      error.code,
      error.status === 401 ? 'Authentication required.' : 'Request forbidden.',
    );
  }
  if (error instanceof ConfigurationError) {
    return new ApiError(
      503,
      error.code,
      'Required platform configuration is unavailable.',
    );
  }
  if (
    error &&
    typeof error === 'object' &&
    'status' in error &&
    'code' in error &&
    typeof error.status === 'number' &&
    typeof error.code === 'string'
  ) {
    return new ApiError(
      error.status,
      error.code,
      'Request could not be completed.',
    );
  }
  return new ApiError(500, 'INTERNAL_ERROR', 'Request could not be completed.');
}

export async function handleApiRequest(
  request: Request,
  handler: (context: ApiRequestContext) => Promise<Response>,
): Promise<Response> {
  const context = createRequestContext(request);
  try {
    return await handler(context);
  } catch (error) {
    const normalized = normalizeError(error);
    return jsonResponse(
      {
        error: {
          code: normalized.code,
          message: normalized.publicMessage,
          requestId: context.requestId,
        },
      },
      normalized.status,
      context.requestId,
    );
  }
}
