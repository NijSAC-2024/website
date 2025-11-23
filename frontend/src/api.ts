/* global RequestInit */
import { enqueueSnackbar } from 'notistack';

interface errorType {
  message: string;
  status: number;
  reference: string;
}

type ApiResponse<T, E = errorType> =
  | { data: T; error?: never }
  | { data?: never; error: E };

async function apiFetchResponse(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<Response>> {
  try {
    const response = await fetch('/api' + url, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      ...options
    });

    if (!response.ok) {
      const errorText = await response.text();
      let error: errorType;

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

    return { data: response };
  } catch (error) {
    const networkError: errorType = {
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
): Promise<ApiResponse<T>> {
  const { data, error } = await apiFetchResponse(url, options);

  if (error) {
    if (error.status === 401 || error.status === 403) {
      await apiFetchVoid('/logout');
    }
    return { error };
  }

  if (data.status === 204 || data.headers.get('Content-Length') === '0') {
    throw Error('Expected API to return content');
  }

  try {
    const content: T = await data.json();
    return { data: content };
  } catch (_parseError) {
    return {
      error: {
        message: 'Failed to parse response',
        reference: 'PARSE_ERROR',
        status: data.status
      }
    };
  }
}

export async function apiFetchVoid(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<void>> {
  const { data, error } = await apiFetchResponse(url, options);
  if (error || !data) {
    return { error };
  }
  return { data: undefined };
}
