'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter, Link } from '@/i18n/routing';
import { useDispatch, useSelector } from 'react-redux';
import { Globe, LogOut } from 'lucide-react';
import type { AppDispatch, RootState } from '@/store';
import { logout } from '@/store/slices/authSlice';
import { clearAuthSession } from '@/lib/authSession';
import { API_BASE_URL } from '@/store/api/baseQuery';
import { authApi } from '@/store/api/authApi';
import { categoriesApi, useGetStudentSubscriptionQuery } from '@/store/api/categoriesApi';
import { problemsApi } from '@/store/api/problemsApi';
import { stagesApi } from '@/store/api/stagesApi';
import { statsApi } from '@/store/api/statsApi';
import { usersApi } from '@/store/api/usersApi';
import { notificationsApi } from '@/store/api/notificationsApi';
import { StudentWorkspaceNavigation } from './StudentWorkspaceNavigation';

export function StudentWorkspaceShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const dispatch = useDispatch<AppDispatch>();
  const token = useSelector((state: RootState) => state.auth.token);
  const isStudent = useSelector((state: RootState) => state.auth.isAuthenticated && state.auth.user?.Role === 'Student');
  const learnerRoute = pathname === '/dashboard' || pathname.startsWith('/dashboard/') ||
    pathname === '/learning-stage' || pathname === '/social-accounts' || pathname === '/notifications';
  const { data: subscription } = useGetStudentSubscriptionQuery(undefined, { skip: !isStudent || !learnerRoute });

  const signOut = async () => {
    try {
      if (token) {
        const controller = new AbortController();
        const timeout = window.setTimeout(() => controller.abort(), 1200);
        try {
          await fetch(`${API_BASE_URL}/users/session/sign-out`, {
            method: 'POST', headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store', signal: controller.signal,
          });
        } finally {
          window.clearTimeout(timeout);
        }
      }
    } catch {
      // Always clear the local session even if the server is unavailable.
    }
    dispatch(logout());
    clearAuthSession();
    dispatch(authApi.util.resetApiState());
    dispatch(problemsApi.util.resetApiState());
    dispatch(categoriesApi.util.resetApiState());
    dispatch(stagesApi.util.resetApiState());
    dispatch(statsApi.util.resetApiState());
    dispatch(usersApi.util.resetApiState());
    dispatch(notificationsApi.util.resetApiState());
    router.push('/');
  };

  if (!isStudent || !learnerRoute) return <>{children}</>;

  return (
    <div className="mx-auto flex w-full max-w-[1600px] items-start">
      <aside className="sticky top-16 hidden h-[calc(100dvh-4rem)] w-64 shrink-0 flex-col overflow-y-auto border-e border-border/70 bg-card/55 px-3 py-6 lg:flex">
        <StudentWorkspaceNavigation isPremium={subscription?.IsPremium === true} />
        <div className="mt-auto space-y-1 border-t border-border/70 pt-4">
          <Link href="/" className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-muted-foreground hover:bg-muted">
            <Globe className="h-5 w-5" />{locale === 'ar' ? 'الموقع العام' : 'Public website'}
          </Link>
          <button type="button" onClick={() => void signOut()} className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-start text-sm font-semibold text-destructive hover:bg-destructive/10">
            <LogOut className="h-5 w-5" />{locale === 'ar' ? 'تسجيل الخروج' : 'Sign out'}
          </button>
        </div>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
