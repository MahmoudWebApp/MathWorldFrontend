'use client';

import { useCallback, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useDispatch } from 'react-redux';

import type { AppDispatch } from '@/store';
import { authApi } from '@/store/api/authApi';
import { logout, setCredentials, setLoading } from '@/store/slices/authSlice';
import { clearAuthSession, getClientCookie } from '@/lib/authSession';

function isUnauthorized(error: unknown): boolean {
  return typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    (error as { status?: unknown }).status === 401;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  const pathname = usePathname();
  const [getMe] = authApi.useLazyGetMeQuery();
  const initialized = useRef(false);
  const lastPath = useRef(pathname);

  // Subscription and selected stage are DB-owned and can change while
  // another administrator is managing this learner's account.
  const refreshProfile = useCallback(async () => {
    const token = getClientCookie('token');
    if (!token || token === 'undefined' || token === 'null') {
      return;
    }

    try {
      const profile = await getMe().unwrap();
      // Do not resurrect a session after logout or account switch.
      if (getClientCookie('token') !== token) return;
      dispatch(setCredentials({ user: { ...profile, Token: token }, token }));
    } catch (error) {
      if (getClientCookie('token') !== token) return;
      if (isUnauthorized(error)) {
        clearAuthSession();
        dispatch(logout());
      } else {
        // Network failures must not destroy a valid login cookie.
        // Retry when the user focuses the app or navigates.
        dispatch(setLoading(false));
      }
    }
  }, [dispatch, getMe]);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const token = getClientCookie('token');
    if (!token || token === 'undefined' || token === 'null') {
      clearAuthSession();
      dispatch(setLoading(false));
      return;
    }
    void refreshProfile();
  }, [dispatch, refreshProfile]);

  useEffect(() => {
    const onFocus = () => { void refreshProfile(); };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [refreshProfile]);

  useEffect(() => {
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    if (initialized.current) void refreshProfile();
  }, [pathname, refreshProfile]);

  return <>{children}</>;
}
