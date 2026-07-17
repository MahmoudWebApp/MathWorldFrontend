import type { User } from '@/store/api/types';

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export function getClientCookie(name: string): string | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const prefix = `${name}=`;
  const cookie = document.cookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix));

  if (!cookie) {
    return null;
  }

  try {
    return decodeURIComponent(cookie.slice(prefix.length));
  } catch {
    return cookie.slice(prefix.length);
  }
}

export function persistAuthSession(user: User): void {
  if (typeof document === 'undefined') {
    return;
  }

  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `token=${encodeURIComponent(user.Token)}; path=/; max-age=${SESSION_MAX_AGE_SECONDS}; SameSite=Lax${secure}`;

  // Remove the legacy role cookie. Middleware reads the role from the JWT.
  document.cookie = 'userRole=; path=/; max-age=0; SameSite=Lax';
}

export function clearAuthSession(): void {
  if (typeof document === 'undefined') {
    return;
  }

  document.cookie = 'token=; path=/; max-age=0; SameSite=Lax';
  document.cookie = 'userRole=; path=/; max-age=0; SameSite=Lax';
}

export function getApiErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (typeof error !== 'object' || error === null) {
    return fallback;
  }

  const data = (error as { data?: unknown }).data;
  if (typeof data !== 'object' || data === null) {
    return fallback;
  }

  const record = data as Record<string, unknown>;
  const message = record.message ?? record.Message;

  return typeof message === 'string' && message.trim()
    ? message
    : fallback;
}
