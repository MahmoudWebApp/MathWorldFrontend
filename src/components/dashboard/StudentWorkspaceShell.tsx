'use client';

import { useState } from 'react';

import { useLocale } from 'next-intl';
import { usePathname, useRouter, Link } from '@/i18n/routing';
import { useDispatch, useSelector } from 'react-redux';
import { Globe, LogOut, PanelRightClose, PanelRightOpen } from 'lucide-react';
import type { AppDispatch, RootState } from '@/store';
import { logout } from '@/store/slices/authSlice';
import { clearAuthSession } from '@/lib/authSession';
import { API_BASE_URL } from '@/store/api/baseQuery';
import { authApi } from '@/store/api/authApi';
import { platformBrandApi } from '@/store/api/platformBrandApi';
import { categoriesApi, useGetStudentSubscriptionQuery } from '@/store/api/categoriesApi';
import { problemsApi } from '@/store/api/problemsApi';
import { stagesApi } from '@/store/api/stagesApi';
import { statsApi } from '@/store/api/statsApi';
import { usersApi } from '@/store/api/usersApi';
import { notificationsApi } from '@/store/api/notificationsApi';
import { StudentWorkspaceNavigation } from './StudentWorkspaceNavigation';
import { MathWorldLoading } from '@/components/ui/MathWorldLoading';

export function StudentWorkspaceShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const dispatch = useDispatch<AppDispatch>();
  const token = useSelector((state: RootState) => state.auth.token);
  const sessionLoading = useSelector((state: RootState) => state.auth.isLoading);
  const sessionUnavailable = useSelector((state: RootState) => state.auth.sessionUnavailable);
  const isStudent = useSelector((state: RootState) => state.auth.isAuthenticated && state.auth.user?.Role === 'Student');
  const learnerRoute = pathname === '/dashboard' || pathname.startsWith('/dashboard/') ||
    pathname === '/learning-stage' || pathname === '/social-accounts' || pathname === '/notifications';
  const securedRoute = learnerRoute || pathname === '/admin' || pathname.startsWith('/admin/') ||
    pathname === '/supervisor' || pathname.startsWith('/supervisor/');
  const { data: subscription, isLoading: membershipLoading, isFetching: membershipFetching,
    isError: membershipError, refetch: reloadMembership } =
    useGetStudentSubscriptionQuery(undefined, { skip: !isStudent || !learnerRoute });

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
    dispatch(platformBrandApi.util.resetApiState());
    dispatch(problemsApi.util.resetApiState());
    dispatch(categoriesApi.util.resetApiState());
    dispatch(stagesApi.util.resetApiState());
    dispatch(statsApi.util.resetApiState());
    dispatch(usersApi.util.resetApiState());
    dispatch(notificationsApi.util.resetApiState());
    router.push('/');
  };

  // AuthProvider restores the cookie session asynchronously. Until the API
  // confirms it, never render temporary "Sign in" or fake account data.
  if (securedRoute && sessionLoading) {
    return <main className="mx-auto max-w-6xl px-4 py-8"><MathWorldLoading skeleton /></main>;
  }
  if (securedRoute && sessionUnavailable) {
    return (
      <main className="mx-auto max-w-3xl space-y-4 px-4 py-10 text-center">
        <MathWorldLoading compact message={locale === 'ar'
          ? 'تعذّر الاتصال بالخادم للتحقق من الجلسة'
          : 'Could not verify your session with the server'} />
        <button type="button"
          onClick={() => window.dispatchEvent(new Event('mathworld:retry-auth'))}
          className="min-h-11 rounded-xl bg-primary px-5 py-2 font-semibold text-primary-foreground">
          {locale === 'ar' ? 'إعادة المحاولة' : 'Retry'}
        </button>
      </main>
    );
  }
  if (!isStudent || !learnerRoute) return <>{children}</>;

  return (
    <div className="mx-auto flex w-full max-w-[1600px] items-start">
      <aside className={`sticky top-16 hidden h-[calc(100dvh-4rem)] shrink-0 flex-col overflow-y-auto border-e border-border/70 bg-card/55 py-4 transition-[width,padding] duration-200 lg:flex ${collapsed ? 'w-[76px] px-2' : 'w-64 px-3'}`}>
        <button
          type="button"
          onClick={() => setCollapsed(value => !value)}
          aria-expanded={!collapsed}
          aria-label={locale === 'ar' ? (collapsed ? 'فتح القائمة الجانبية' : 'طي القائمة الجانبية') : (collapsed ? 'Expand sidebar' : 'Collapse sidebar')}
          title={locale === 'ar' ? (collapsed ? 'فتح القائمة' : 'طي القائمة') : (collapsed ? 'Expand menu' : 'Collapse menu')}
          className="mb-3 flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-border/70 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {collapsed ? <PanelRightOpen className="h-5 w-5" /> : <PanelRightClose className="h-5 w-5" />}
          {!collapsed && <span className="text-xs font-bold">{locale === 'ar' ? 'طي القائمة' : 'Collapse'}</span>}
        </button>
        {membershipLoading || (membershipFetching && !subscription) ? (
          <div className="space-y-2" role="status" aria-label={locale === 'ar' ? 'جارٍ تحميل صلاحيات القائمة' : 'Loading navigation access'}>
            <MathWorldLoading compact />
            {Array.from({ length: 6 }, (_, index) => <div key={index} className="h-10 animate-pulse rounded-xl bg-muted" />)}
          </div>
        ) : membershipError || !subscription ? (
          <div role="alert" className="space-y-3 rounded-xl border border-destructive/20 p-3 text-sm">
            <p>{locale === 'ar' ? 'تعذّر التحقق من صلاحيات حسابك.' : 'Could not verify account permissions.'}</p>
            <button type="button" onClick={() => void reloadMembership()}
              className="font-semibold text-primary underline">
              {locale === 'ar' ? 'إعادة المحاولة' : 'Retry'}
            </button>
          </div>
        ) : <StudentWorkspaceNavigation isPremium={subscription.IsPremium} collapsed={collapsed} />}
        <div className="mt-auto space-y-1 border-t border-border/70 pt-4">
          <Link href="/" title={locale === "ar" ? "الموقع العام" : "Public website"} aria-label={locale === "ar" ? "الموقع العام" : "Public website"} className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-muted-foreground hover:bg-muted ${collapsed ? "justify-center px-2" : ""}`}>
            <Globe className="h-5 w-5 shrink-0" /><span className={collapsed ? "sr-only" : ""}>{locale === 'ar' ? 'الموقع العام' : 'Public website'}</span>
          </Link>
          <button type="button" onClick={() => void signOut()} title={locale === "ar" ? "تسجيل الخروج" : "Sign out"} aria-label={locale === "ar" ? "تسجيل الخروج" : "Sign out"} className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-start text-sm font-semibold text-destructive hover:bg-destructive/10 ${collapsed ? "justify-center px-2" : ""}`}>
            <LogOut className="h-5 w-5 shrink-0" /><span className={collapsed ? "sr-only" : ""}>{locale === 'ar' ? 'تسجيل الخروج' : 'Sign out'}</span>
          </button>
        </div>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
