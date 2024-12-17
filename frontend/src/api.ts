/* global RequestInit */
import { enqueueSnackbar } from 'notistack';
import { UserType } from './types.ts';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      credentials: 'include',
      ...options
    });

    if (!response.ok) {
      const error = await response.text();
      return { error };
    }

    const data: T = await response.json();
    return { data };
  } catch (error) {
    enqueueSnackbar(String(error), { variant: 'error' });
    return { error: 'Network error occurred.' };
  }
}

export const checkAuth = () => apiFetch<UserType>('/api/whoami');

export const login = (email: string, password: string) =>
  apiFetch<void>('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

export const logout = () => apiFetch<void>('/api/logout', { method: 'GET' });
