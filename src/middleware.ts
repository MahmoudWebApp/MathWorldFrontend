import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

const ADMIN_PATHS = ['/admin'];
const AUTH_PATHS = ['/login', '/register'];
const AUTH_REQUIRED_PATHS = ['/dashboard', '/profile'];

interface JwtPayload {
  exp?: number;
  role?: string;
  Role?: string;
  [key: string]: unknown;
}

function decodeJwtPayload(token: string): JwtPayload | null {
  const parts = token.split('.');
  if (parts.length !== 3) {
    return null;
  }

  try {
    const normalized = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padding = '='.repeat((4 - (normalized.length % 4)) % 4);
    const decoded = atob(`${normalized}${padding}`);
    return JSON.parse(decoded) as JwtPayload;
  } catch {
    return null;
  }
}

function getTokenState(token: string | undefined) {
  if (!token || token === 'undefined' || token === 'null') {
    return { authenticated: false, role: null as string | null };
  }

  const payload = decodeJwtPayload(token);
  if (!payload) {
    return { authenticated: false, role: null as string | null };
  }

  if (typeof payload.exp !== 'number' || payload.exp * 1000 <= Date.now()) {
    return { authenticated: false, role: null as string | null };
  }

  const roleClaim =
    payload.role ??
    payload.Role ??
    payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

  return {
    authenticated: true,
    role: typeof roleClaim === 'string' ? roleClaim : null,
  };
}

function startsWithAny(pathname: string, paths: string[]) {
  return paths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const segments = pathname.split('/');
  const requestedLocale = segments[1];
  const locale = routing.locales.includes(
    requestedLocale as (typeof routing.locales)[number],
  )
    ? requestedLocale
    : routing.defaultLocale;

  const localePrefix = `/${locale}`;
  const pathWithoutLocale = pathname.startsWith(localePrefix)
    ? pathname.slice(localePrefix.length) || '/'
    : pathname;

  const token = request.cookies.get('token')?.value;
  const { authenticated, role } = getTokenState(token);

  if (authenticated && AUTH_PATHS.includes(pathWithoutLocale)) {
    const destination = role === 'Admin' ? 'admin' : 'dashboard';
    return NextResponse.redirect(
      new URL(`/${locale}/${destination}`, request.url),
    );
  }

  if (startsWithAny(pathWithoutLocale, ADMIN_PATHS)) {
    if (!authenticated) {
      return NextResponse.redirect(
        new URL(`/${locale}/login`, request.url),
      );
    }

    if (role !== 'Admin') {
      return NextResponse.redirect(
        new URL(`/${locale}/dashboard`, request.url),
      );
    }
  }

  if (
    startsWithAny(pathWithoutLocale, AUTH_REQUIRED_PATHS) &&
    !authenticated
  ) {
    return NextResponse.redirect(
      new URL(`/${locale}/login`, request.url),
    );
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|favicon.ico|.*\\..*).*)'],
};
