/* global RequestInit */
import { enqueueSnackbar } from 'notistack';
import { text } from './util.ts';

interface errorType {
  message: string;
  status: number;
  reference: string;
}

interface ApiResponse<T> {
  data?: T;
  error?: errorType;
}

async function apiFetchResponse(url: string, options: RequestInit = {}): Promise<ApiResponse<Response>> {
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
          message: text('An unexpected error occurred', 'Er is een onverwachte fout opgetreden'),
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

export async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const { data, error } = await apiFetchResponse(url, options);
  if (error || !data) {
    if (error?.status === 401 || error?.status === 403) {
      await apiFetchVoid('/logout');
    }
    return { error };
  }
  const content: T = await data.json();
  return { data: content };
}

export async function apiFetchVoid(url: string, options: RequestInit = {}): Promise<ApiResponse<void>> {
  const { data, error } = await apiFetchResponse(url, options);
  if (error || !data) {
    return { error };
  }
  return {};
}