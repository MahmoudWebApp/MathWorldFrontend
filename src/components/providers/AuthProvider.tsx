'use client';

import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { setCredentials, logout, setLoading } from '@/store/slices/authSlice';
import { authApi } from '@/store/api/authApi';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const [getMe] = authApi.useLazyGetMeQuery();

  // Ref flag prevents the effect from running twice in React Strict Mode
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const initializeAuth = async () => {
      /**
       * Helper: read a cookie value by name from document.cookie.
       * Returns null if the cookie doesn't exist.
       */
      const getCookie = (name: string): string | null => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
        return null;
      };

      const token = getCookie('token');

      /**
       * Extra client-side token sanity check.
       * The middleware already blocks invalid tokens server-side,
       * but we repeat it here to keep Redux state clean on hydration.
       */
      const isValidToken =
        token &&
        token !== 'undefined' &&
        token !== 'null' &&
        token.trim().length >= 10;

      if (isValidToken) {
        try {
          // Fetch the current user's profile using the stored token
          const result = await getMe().unwrap();

          // API may wrap data inside a "Data" key — handle both shapes
          const userData = (result as any).Data || result;

          const user = {
            Id: userData.Id,
            FullName: userData.FullName,
            Email: userData.Email,
            Role: userData.Role,
            Token: token,
            SubscriptionType: userData.SubscriptionType,
          };

          // Hydrate Redux auth state
          dispatch(setCredentials({ user, token }));

          // Keep the userRole cookie in sync with the server-confirmed role
          // (7 days expiry, same as the token cookie set at login)
          document.cookie = `userRole=${user.Role}; path=/; max-age=604800; SameSite=Lax`;

        } catch (error) {
          // Token exists but the server rejected it (expired, tampered, etc.)
          // Clear everything so the middleware redirects correctly on next navigation
          console.error('Auth init failed — clearing session:', error);
          dispatch(logout());
          document.cookie = 'token=; path=/; max-age=0; SameSite=Lax';
          document.cookie = 'userRole=; path=/; max-age=0; SameSite=Lax';
        }
      } else {
        // No valid token found — mark auth as done (not loading) without a user
        dispatch(setLoading(false));

        // Clean up any leftover junk cookies to prevent false positives
        if (token !== null) {
          document.cookie = 'token=; path=/; max-age=0; SameSite=Lax';
          document.cookie = 'userRole=; path=/; max-age=0; SameSite=Lax';
        }
      }
    };

    initializeAuth();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps — intentionally runs once

  return <>{children}</>;
}