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
 *  - A physical device (either OS): a genuinely separate machine on the network — it needs the
 *    host's real LAN IP (e.g. run `ipconfig`/`Get-NetIPAddress` and swap ANDROID_URL below). This
 *    can't be auto-detected without a native module (e.g. expo-device's Device.isDevice), and that
 *    module isn't linked into the current dev-client build — using it crashes on import before
 *    any JS code even runs. Linking it would need a full `npx expo run:android` native rebuild.
 */
const ANDROID_URL = 'http://10.0.2.2:8000';
const API_BASE_URL = Platform.OS === 'android' ? ANDROID_URL : 'http://127.0.0.1:8000';

/**
 * Reads a local file URI (from expo-document-picker etc.) into a genuine native-backed Blob, for
 * attaching to a multipart FormData upload. Deliberately uses XMLHttpRequest, not the global
 * fetch() — Expo SDK 57's global fetch is its own WinterCG-compliant runtime ("winter"), and its
 * Response.blob() builds a Blob from a raw ArrayBuffer via React Native's *legacy* Blob class,
 * which explicitly does not support constructing from ArrayBuffer/ArrayBufferView data
 * (BlobManager.js throws "Creating blobs from 'ArrayBuffer'... are not supported"). XHR's
 * `responseType: 'blob'`, by contrast, produces a Blob backed by a native blobId (RN's original,
 * working mechanism), which is exactly what the multipart encoder (expo/src/winter/FormData.ts's
 * patched FormData.append/entries) expects — it reads bytes back out via
 * FileReader.readAsArrayBuffer(blob), the supported legacy path for that kind of Blob.
 */
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
   
    throw new ApiError(response.status, text, `Unexpected response (${response.status}): ${text.slice(0, 200)}`);
  }

  if (!response.ok) {
    throw new ApiError(response.status, body, extractErrorMessage(body, `Request failed (${response.status})`));
  }

  return body as T;
}
