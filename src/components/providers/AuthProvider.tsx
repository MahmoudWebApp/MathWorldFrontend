'use client';

import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';

import type { AppDispatch } from '@/store';
import { authApi } from '@/store/api/authApi';
import { logout, setCredentials, setLoading } from '@/store/slices/authSlice';
import {
  clearAuthSession,
  getClientCookie,
} from '@/lib/authSession';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  const [getMe] = authApi.useLazyGetMeQuery();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) {
      return;
    }

    initialized.current = true;

    async function initializeAuth() {
      const token = getClientCookie('token');

      if (!token || token === 'undefined' || token === 'null') {
        clearAuthSession();
        dispatch(setLoading(false));
        return;
      }

      try {
        const profile = await getMe().unwrap();
        const user = {
          ...profile,
          Token: token,
        };

        dispatch(setCredentials({ user, token }));
      } catch {
        clearAuthSession();
        dispatch(logout());
      }
    }

    void initializeAuth();
  }, [dispatch, getMe]);

  return <>{children}</>;
}
