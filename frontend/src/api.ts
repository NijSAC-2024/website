/* global RequestInit */
import { enqueueSnackbar } from 'notistack';
import { UserError, ApiError } from './error/error.ts';

interface CachedGetResponse {
  etag: string;
  body: string;
}

const etagCache = new Map<string, CachedGetResponse>();

export async function apiFetch<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const method = options.method ?? 'GET';
  const cacheKey = method === 'GET' ? url : null;
  const cached = cacheKey ? etagCache.get(cacheKey) : undefined;

  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  if (cacheKey && cached) {
    headers.set('If-None-Match', cached.etag);
  }

  let response: Response;
  try {
    response = await fetch('/api' + url, {
      credentials: 'include',
      headers,
      ...options
    });
  } catch (err) {
    const networkError = new ApiError(String(err), 0, `URL: ${url}`);
    enqueueSnackbar(networkError.message, { variant: 'error' });
    throw networkError;
  }

  // Handle 304 with cache
  let finalResponse = response;
  if (response.status === 304 && cached) {
    finalResponse = new Response(cached.body, {
      status: 200,
      statusText: 'OK',
      headers: response.headers
    });
  }

  // Handle non-OK responses
  if (!finalResponse.ok) {
    let error: ApiError;
    const text = await finalResponse.text();

    try {
      error = JSON.parse(text);
    } catch {
      error = new ApiError(
        'An unexpected error occurred',
        finalResponse.status,
        `URL: ${url}`
      );
    }

    if (error.status === 401 || error.status === 403) {
      throw new UserError('Unauthorized', error.status, error.reference);
    }

    if (error.status >= 400 && error.status < 500) {
      throw new UserError(error.message, error.status, error.reference);
    }

    throw new ApiError(error.message, error.status, error.reference);
  }

  // Cache GET responses with ETag
  if (cacheKey) {
    const etag = finalResponse.headers.get('ETag');
    if (etag) {
      const body = await finalResponse.clone().text();
      etagCache.set(cacheKey, { etag, body });
    }
  }

  // Handle empty responses
  if (
    finalResponse.status === 204 ||
    finalResponse.headers.get('Content-Length') === '0'
  ) {
    return undefined as T;
  }

  // Parse JSON
  try {
    return (await finalResponse.json()) as T;
  } catch {
    throw new ApiError(
      'Failed to parse response',
      finalResponse.status,
      'PARSE_ERROR'
    );
  }
}