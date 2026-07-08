import { Platform } from 'react-native';

import { getCachedAccessToken } from '@/api/token-store';

/**
 * The Django backend runs on the host machine at 127.0.0.1:8000. Every RN runtime reaches
 * "the host machine" at a different address, because "127.0.0.1" inside each runtime means
 * something different:
 *  - Android emulator: 127.0.0.1 is the emulator itself. 10.0.2.2 is Google's documented
 *    alias that routes to the host machine's loopback interface.
 *  - iOS simulator: shares the host's network stack directly, so 127.0.0.1 already works.
 *  - Expo web: literally runs in a browser on the host, so 127.0.0.1 already works.
 *  - A physical device (either OS): neither loopback trick works — it needs the host
 *    machine's real LAN IP (e.g. 192.168.x.x), since the phone is a separate device on the network.
 */
const API_BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://127.0.0.1:8000';

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, body: unknown, message: string) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

/** Pulls a human-readable message out of DRF's various error response shapes. */
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

/**
 * Thin fetch wrapper: builds the full URL, always sends/expects JSON, and throws ApiError
 * with a readable message on non-2xx responses instead of making every caller check `res.ok`.
 *
 * Two auth mechanisms are in play, deliberately:
 *  - Session cookies (sign-in/sign-up/verify/forgot-password): RN's networking layer keeps its
 *    own persistent cookie jar and automatically resends whatever the server set via Set-Cookie,
 *    the same way a browser would — no code needed here for that part.
 *  - Bearer token (everything that mutates data once signed in — applications, payments, etc.):
 *    Django's CSRF protection blocks session-cookie-authenticated POST/PUT/PATCH/DELETE requests,
 *    and RN has no way to read the csrftoken cookie value to satisfy it (no document.cookie, and
 *    the cookie-reading libraries that exist are deprecated / don't support the New Architecture
 *    this project uses). JWT sidesteps that entirely — DRF's JWTAuthentication doesn't enforce
 *    CSRF — so any stored access token is attached here automatically. See api/token-store.ts.
 */
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const accessToken = getCachedAccessToken();
  // FormData (file uploads) must NOT get an explicit Content-Type — fetch generates one itself
  // with the correct multipart boundary string, which we have no way to produce by hand.
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

  const text = await response.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    // The server responded, but not with JSON (an HTML error page, a proxy timeout page, etc.)
    // — that's still a real, reportable error, not a "couldn't reach the server" situation, so
    // it must become an ApiError too instead of letting a raw SyntaxError escape and get
    // misread by callers as a network failure.
    throw new ApiError(response.status, text, `Unexpected response (${response.status}): ${text.slice(0, 200)}`);
  }

  if (!response.ok) {
    throw new ApiError(response.status, body, extractErrorMessage(body, `Request failed (${response.status})`));
  }

  return body as T;
}
