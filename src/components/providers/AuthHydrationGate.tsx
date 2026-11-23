'use client';

import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { MathWorldLoading } from '@/components/ui/MathWorldLoading';

/** Prevents false sign-in prompts on API-dependent account pages.
 * A cookie-backed session is always verified by /auth/me before children
 * can decide whether the visitor is authenticated. Public SEO pages stay public.
 */
export function AuthHydrationGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '';
  const locale = useLocale();
  const loading = useSelector((state: RootState) => state.auth.isLoading);
  const unavailable = useSelector((state: RootState) => state.auth.sessionUnavailable);
  const path = pathname.replace(/^\/(ar|en)(?=\/|$)/, '') || '/';
  const accountPath = /^(\/dashboard(?:\/|$)|\/admin(?:\/|$)|\/journey(?:\/|$)|\/daily-challenge(?:\/|$)|\/learning-stage(?:\/|$)|\/notifications(?:\/|$)|\/social-accounts(?:\/|$)|\/premium\/report(?:\/|$))/.test(path);

  if (!accountPath) return <>{children}</>;
  if (loading) {
    return <main className="mx-auto max-w-6xl px-4 py-9"><MathWorldLoading skeleton /></main>;
  }
  if (unavailable) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10 text-center">
        <MathWorldLoading compact message={locale === 'ar'
          ? 'تعذّر الاتصال بالخادم للتحقق من تسجيل الدخول'
          : 'The server could not verify your session'} />
        <button type="button"
          onClick={() => window.dispatchEvent(new Event('mathworld:retry-auth'))}
          className="mt-3 min-h-11 rounded-xl bg-primary px-6 py-2.5 font-semibold text-primary-foreground">
          {locale === 'ar' ? 'إعادة المحاولة' : 'Retry'}
        </button>
      </main>
    );
  }
  return <>{children}</>;
}
