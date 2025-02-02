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

export async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  try {
    const response = await fetch('/api' + url, {
      credentials: 'include',
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

    const data: T = await response.json();
    return { data };
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
