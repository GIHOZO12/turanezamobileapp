import { Platform } from 'react-native';

import { getCachedAccessToken, getCachedRefreshToken, setTokens } from '@/api/token-store';


const ANDROID_URL = 'http://10.0.2.2:8000';
const LOCAL_API_BASE_URL = Platform.OS === 'android' ? ANDROID_URL : 'http://127.0.0.1:8000';


const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? LOCAL_API_BASE_URL;



export function resolveMediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

export function readFileAsBlob(uri: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.responseType = 'blob';
    xhr.onload = () => resolve(xhr.response as Blob);
    xhr.onerror = () => reject(new Error('Could not read the selected file.'));
    xhr.open('GET', uri, true);
    xhr.send();
  });
}

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, body: unknown, message: string) {
    super(message);
    this.status = status;
    this.body = body;
  }
}


function extractErrorMessage(body: unknown, fallback: string): string {
  if (body && typeof body === 'object') {
    const record = body as Record<string, unknown>;
    if (typeof record.error === 'string') return record.error;
    if (typeof record.detail === 'string') return record.detail;
    const firstKey = Object.keys(record)[0];
    if (firstKey) {
      const value = record[firstKey];
      if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
      if (typeof value === 'string') return value;
    }
  }
  return fallback;
}


const REFRESH_PATH = '/api/v1/users/token/refresh-mobile/';

// Access tokens live 60 minutes; refresh tokens live 2 days. Without this, every request
// made after the access token expires would just 401 forever even though the refresh token
// is still perfectly valid — which is exactly why sessions used to die after ~an hour instead
// of lasting the full 2 days. Concurrent 401s share one in-flight refresh instead of each
// firing their own (ROTATE_REFRESH_TOKENS means only the first refresh token is still valid).
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshToken = getCachedRefreshToken();
      if (!refreshToken) return null;
      try {
        const response = await fetch(`${API_BASE_URL}${REFRESH_PATH}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ refresh: refreshToken }),
        });
        if (!response.ok) return null;
        const data = (await response.json()) as { access: string; refresh: string };
        await setTokens(data.access, data.refresh);
        return data.access;
      } catch {
        return null;
      }
    })();
  }

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit, _isRetry = false): Promise<T> {
  const accessToken = getCachedAccessToken();

  const isFormData = typeof FormData !== 'undefined' && init?.body instanceof FormData;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      Accept: 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...init?.headers,
    },
  });

  if (response.status === 401 && !_isRetry && path !== REFRESH_PATH) {
    const newAccessToken = await refreshAccessToken();
    if (newAccessToken) {
      return apiFetch<T>(path, init, true);
    }
  }

  const text = await response.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {

    throw new ApiError(response.status, text, `Unexpected response (${response.status}): ${text.slice(0, 200)}`);
  }

  if (!response.ok) {
    throw new ApiError(response.status, body, extractErrorMessage(body, `Request failed (${response.status})`));
  }

  return body as T;
}
