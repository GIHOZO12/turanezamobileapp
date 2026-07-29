import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'turaneza_access_token';
const REFRESH_TOKEN_KEY = 'turaneza_refresh_token';

let cachedAccessToken: string | null = null;

export async function loadAccessToken(): Promise<string | null> {
  cachedAccessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  return cachedAccessToken;
}

export function getCachedAccessToken(): string | null {
  return cachedAccessToken;
}

export async function setTokens(access: string, refresh: string): Promise<void> {
  cachedAccessToken = access;
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, access);
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refresh);
}

export async function clearTokens(): Promise<void> {
  cachedAccessToken = null;
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}
