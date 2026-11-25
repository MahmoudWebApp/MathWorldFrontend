'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { useDispatch, useSelector } from 'react-redux';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { Globe, LogOut, PanelRightClose, PanelRightOpen, ShieldCheck } from 'lucide-react';
import type { AppDispatch, RootState } from '@/store';
import { logout } from '@/store/slices/authSlice';
import { clearAuthSession } from '@/lib/authSession';
import { API_BASE_URL } from '@/store/api/baseQuery';
import { authApi } from '@/store/api/authApi';
import { categoriesApi } from '@/store/api/categoriesApi';
import { problemsApi } from '@/store/api/problemsApi';
import { stagesApi } from '@/store/api/stagesApi';
import { statsApi } from '@/store/api/statsApi';
import { usersApi } from '@/store/api/usersApi';
import { notificationsApi } from '@/store/api/notificationsApi';
import { WorkspaceBreadcrumbs } from '@/components/ui/WorkspaceBreadcrumbs';
import { AdminWorkspaceNavigation } from '@/components/admin/AdminNavigation';

/**
 * Admin and students share one website but never share a mixed workspace.
 * This wrapper lives at the locale level so it also covers legacy admin
 * routes outside the (dashboard) route group, e.g. /admin/free-categories.
 */
export function AdminWorkspaceShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const adminRoute = pathname === '/admin' || pathname.startsWith('/admin/');
  const ar = useLocale() === 'ar';
  const [collapsed, setCollapsed] = useState(false);
  const { isLoading, isAuthenticated, token, user } =
    useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const signOut = async () => {
    try {
      if (token) {
        const controller = new AbortController();
        const timeout = window.setTimeout(() => controller.abort(), 1200);
        try {
          await fetch(`${API_BASE_URL}/users/session/sign-out`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
            signal: controller.signal,
          });
        } finally {
          window.clearTimeout(timeout);
        }
      }
    } catch {
      // Network failure must not block local sign-out.
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

  if (!adminRoute) return <>{children}</>;

  if (isLoading) {
    return (
      <div role="status" aria-busy="true" className="relative z-10 mx-auto w-full max-w-7xl flex-1 animate-pulse space-y-5 p-6">
        <div className="h-10 w-56 rounded-xl bg-muted" />
        <div className="h-60 rounded-3xl bg-muted" />
      </div>
    );
  }

  // This is a UX guard; admin APIs must continue enforcing role-based access.
  if (!isAuthenticated || user?.Role !== 'Admin') {
    return (
      <div className="relative z-10 mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
        <ShieldCheck className="h-11 w-11 text-muted-foreground" aria-hidden="true" />
        <h1 className="text-xl font-extrabold">
          {ar ? 'لوحة الإدارة مخصصة للمسؤولين فقط' : 'Administrator access required'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {ar ? 'سجّل الدخول بحساب مسؤول للمتابعة.' : 'Sign in with an administrator account to continue.'}
        </p>
        <Link href={isAuthenticated ? '/' : '/login'}
          className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground">
          {isAuthenticated ? (ar ? 'الموقع العام' : 'Public website') : (ar ? 'تسجيل الدخول' : 'Sign in')}
        </Link>
      </div>
    );
  }

  return (
    <div className="relative z-10 mx-auto flex w-full max-w-[1600px] flex-1 items-start">
      <aside className={`sticky top-16 hidden h-[calc(100dvh-4rem)] shrink-0 flex-col overflow-y-auto border-e border-border/70 bg-card/55 py-4 transition-[width,padding] duration-200 lg:flex ${collapsed ? 'w-[76px] px-2' : 'w-64 px-3'}`}>
        <div className={`mb-3 flex items-center gap-2 px-2 ${collapsed ? 'justify-center' : ''}`}>
          <ShieldCheck className="h-6 w-6 shrink-0 text-primary" aria-hidden="true" />
          <strong className={collapsed ? 'sr-only' : 'text-sm'}>
            {ar ? 'إدارة MathWorld' : 'MathWorld Admin'}
          </strong>
        </div>
        <button type="button"
          onClick={() => setCollapsed(value => !value)}
          aria-expanded={!collapsed}
          aria-label={collapsed
            ? (ar ? 'فتح القائمة الجانبية' : 'Expand sidebar')
            : (ar ? 'طي القائمة الجانبية' : 'Collapse sidebar')}
          title={collapsed ? (ar ? 'فتح القائمة' : 'Expand menu') : (ar ? 'طي القائمة' : 'Collapse menu')}
          className="mb-4 flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-border/70 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          {collapsed
            ? <PanelRightOpen className="h-5 w-5" aria-hidden="true" />
            : <PanelRightClose className="h-5 w-5" aria-hidden="true" />}
          {!collapsed && <span className="text-xs font-bold">{ar ? 'طي القائمة' : 'Collapse'}</span>}
        </button>
        <AdminWorkspaceNavigation collapsed={collapsed} />
        <div className="mt-auto space-y-1 border-t border-border/70 pt-3">
          <Link href="/" title={ar ? 'الموقع العام' : 'Public website'}
            aria-label={ar ? 'الموقع العام' : 'Public website'}
            className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-muted-foreground hover:bg-muted ${collapsed ? 'justify-center px-2' : ''}`}>
            <Globe className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span className={collapsed ? 'sr-only' : ''}>{ar ? 'الموقع العام' : 'Public website'}</span>
          </Link>
          <button type="button" onClick={() => void signOut()}
            title={ar ? 'تسجيل الخروج' : 'Sign out'}
            aria-label={ar ? 'تسجيل الخروج' : 'Sign out'}
            className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-start text-sm font-semibold text-destructive hover:bg-destructive/10 ${collapsed ? 'justify-center px-2' : ''}`}>
            <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span className={collapsed ? 'sr-only' : ''}>{ar ? 'تسجيل الخروج' : 'Sign out'}</span>
          </button>
        </div>
      </aside>
      <div className="min-w-0 flex-1"><WorkspaceBreadcrumbs/>{children}</div>
    </div>
  );
}
