import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

const ADMIN_PATHS = ['/admin'];
const AUTH_PATHS = ['/login', '/register'];
const AUTH_REQUIRED_PATHS = ['/dashboard', '/profile'];

function isValidToken(token: string | undefined): boolean {
  if (!token) return false;
  if (token === 'undefined' || token === 'null') return false;
  if (token.trim().length < 10) return false;
  return true;
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Extract locale from URL
  const segments = pathname.split('/');
  const locale = routing.locales.includes(segments[1] as any)
    ? segments[1]
    : routing.defaultLocale;

  // Get path without locale prefix
  const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/';

  // Read auth cookies
  const token = request.cookies.get('token')?.value;
  const userRole = request.cookies.get('userRole')?.value;
  const authenticated = isValidToken(token);
  
  console.log('=== MIDDLEWARE ===');
  console.log('pathname:', pathname);
  console.log('pathWithoutLocale:', pathWithoutLocale);
  console.log('token:', token);
  console.log('userRole:', userRole);
  console.log('isAdmin path:', ADMIN_PATHS.some(path => pathWithoutLocale.startsWith(path)));
  // Guard 1: Redirect authenticated users away from login/register
  if (authenticated && AUTH_PATHS.includes(pathWithoutLocale)) {
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
  }

  // Guard 2: Admin-only paths
  if (ADMIN_PATHS.some(path => pathWithoutLocale.startsWith(path))) {
    if (!authenticated) {
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }
    if (userRole !== 'Admin') {
      return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
    }
  }

  // Guard 3: Auth-required paths
  if (AUTH_REQUIRED_PATHS.some(path => pathWithoutLocale.startsWith(path))) {
    if (!authenticated) {
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }
  }

  // All checks passed — run intl middleware
  return intlMiddleware(request);
}

export const config = {
matcher: ['/((?!api|_next|_vercel|favicon.ico|.*\\..*).*)'],
};