import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'turaneza_access_token';
const REFRESH_TOKEN_KEY = 'turaneza_refresh_token';

let cachedAccessToken: string | null = null;
let cachedRefreshToken: string | null = null;

export async function loadAccessToken(): Promise<string | null> {
  [cachedAccessToken, cachedRefreshToken] = await Promise.all([
    SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
  ]);
  return cachedAccessToken;
}

export function getCachedAccessToken(): string | null {
  return cachedAccessToken;
}

export function getCachedRefreshToken(): string | null {
  return cachedRefreshToken;
}

export async function setTokens(access: string, refresh: string): Promise<void> {
  cachedAccessToken = access;
  cachedRefreshToken = refresh;
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, access);
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refresh);
}

export async function clearTokens(): Promise<void> {
  cachedAccessToken = null;
  cachedRefreshToken = null;
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}
