import { STORAGE_KEYS } from '../config';
import type { AuthTokens } from '../types';

export function getTokens(): AuthTokens | null {
  const accessToken = localStorage.getItem(STORAGE_KEYS.accessToken);
  const refreshToken = localStorage.getItem(STORAGE_KEYS.refreshToken);
  if (!accessToken || !refreshToken) return null;
  return { accessToken, refreshToken };
}

export function setTokens(tokens: AuthTokens): void {
  localStorage.setItem(STORAGE_KEYS.accessToken, tokens.accessToken);
  localStorage.setItem(STORAGE_KEYS.refreshToken, tokens.refreshToken);
}

export function clearTokens(): void {
  localStorage.removeItem(STORAGE_KEYS.accessToken);
  localStorage.removeItem(STORAGE_KEYS.refreshToken);
}

export function getAccessToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.accessToken);
}
