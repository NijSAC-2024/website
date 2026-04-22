/* global RequestInit */
import { enqueueSnackbar } from 'notistack';

export interface ApiError {
  message: string;
  status: number;
  reference: string;
}

export type ApiResponse<T, E = ApiError> =
  | { data: T; error?: never }
  | { data?: never; error: E };

interface CachedGetResponse {
  etag: string;
  body: string;
}

const etagCache = new Map<string, CachedGetResponse>();

async function apiFetchResponse(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<Response>> {
  const method = options.method ?? 'GET';
  const cacheKey = method === 'GET' ? url : null;
  const cachedResponse = cacheKey ? etagCache.get(cacheKey) : undefined;

  try {
    const headers = new Headers(options.headers);
    headers.set('Content-Type', 'application/json');

    if (cacheKey && cachedResponse) {
      headers.set('If-None-Match', cachedResponse.etag);
    }

    const response = await fetch('/api' + url, {
      credentials: 'include',
      headers,
      ...options
    });

    if (response.status === 304 && cachedResponse) {
      return {
        data: new Response(cachedResponse.body, {
          status: 200,
          statusText: 'OK',
          headers: response.headers
        })
      };
    }

    if (!response.ok) {
      const errorText = await response.text();
      let error: ApiError;

      try {
        error = JSON.parse(errorText);
      } catch {
        error = {
          message: 'An unexpected error occurred',
          status: response.status,
          reference: `URL: ${url}`
        };
      }

      return { error };
    }

    if (cacheKey) {
      const etag = response.headers.get('ETag');
      if (etag) {
        const body = await response.clone().text();
        etagCache.set(cacheKey, {etag, body});
      }
    }

    return { data: response };
  } catch (error) {
    const networkError: ApiError = {
      message: String(error),
      status: 0,
      reference: `URL: ${url}`
    };
    enqueueSnackbar(networkError.message, { variant: 'error' });
    return { error: networkError };
  }
}

export async function apiFetch<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const { data, error } = await apiFetchResponse(url, options);

  if (error) {
    if (error.status === 401 || error.status === 403) {
      await apiFetchVoid('/logout');
    }
    throw error;
  }

  if (data.status === 204 || data.headers.get('Content-Length') === '0') {
    throw Error('Expected API to return content');
  }

  try {
    return await data.json() as T;
  } catch {
    throw {
      message: 'Failed to parse response',
      reference: 'PARSE_ERROR',
      status: data.status
    };
  }
}
export async function apiFetchVoid(
  url: string,
  options: RequestInit = {}
): Promise<void> {
  const { data, error } = await apiFetchResponse(url, options);
  if (error) {
    throw error;
  }
  if (!data) {
    throw new Error('No response received');
  }
  if (!data.ok) {
    throw new Error(`Request failed with status ${data.status}`);
  }
}