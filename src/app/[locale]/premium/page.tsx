'use client';

import { useLocale } from 'next-intl';
import { useSelector } from 'react-redux';
import { Link } from '@/i18n/routing';
import { useGetStudentSubscriptionQuery } from '@/store/api/categoriesApi';

export default function PremiumInformationPage() {
  const locale = useLocale();
  const ar = locale === 'ar';
  const authenticated = useSelector(
    (state: { auth: { isAuthenticated: boolean; user: { role?: string } | null } }) =>
      state.auth.isAuthenticated && state.auth.user?.role === 'Student',
  );
  const { data: entitlement, isLoading, isError, refetch } = useGetStudentSubscriptionQuery(undefined, {
    skip: !authenticated,
    refetchOnMountOrArgChange: true,
  });

  return (
    <main className="container mx-auto max-w-3xl px-6 py-20" dir={ar ? 'rtl' : 'ltr'}>
      <h1 className="mb-5 text-3xl font-bold">MathWorld Premium</h1>
      <div className="space-y-5 rounded-2xl border bg-card p-7">
        {authenticated && isLoading && (
          <p role="status">{ar ? 'جاري التحقق من الاشتراك…' : 'Checking subscription…'}</p>
        )}
        {authenticated && isError && (
          <div role="alert" className="space-y-2">
            <p>{ar ? 'تعذّر التحقق من اشتراكك حالياً.' : 'Unable to verify your subscription right now.'}</p>
            <button type="button" onClick={() => void refetch()} className="rounded-lg border px-4 py-2">
              {ar ? 'إعادة المحاولة' : 'Retry'}
            </button>
          </div>
        )}
        {entitlement?.IsPremium && (
          <p role="status" className="font-bold text-primary">
            {ar ? 'اشتراك Premium مفعّل على حسابك.' : 'Premium is active on your account.'}
          </p>
        )}
        {entitlement && !entitlement.IsPremium && (
          <p role="status">{ar ? 'حسابك الحالي مجاني.' : 'Your current plan is Free.'}</p>
        )}
        <h2 className="text-xl font-semibold">{ar ? 'مميزات الاشتراك' : 'Subscription benefits'}</h2>
        <ul className="list-disc space-y-2 ps-5">
          <li>{ar ? 'فتح جميع الفئات في كل مرحلة تعليمية' : 'Access every category in every stage'}</li>
          <li>{ar ? 'حل عدد غير محدود من المسائل' : 'Unlimited practice problems'}</li>
          <li>{ar ? 'إظهار الحل قبل الإجابة' : 'Reveal solutions before answering'}</li>
          <li>{ar ? 'تصدير الإحصائيات المتقدمة عند إطلاقها' : 'Advanced analytics exports when released'}</li>
          <li>{ar ? 'بدون إعلانات عند تفعيل نظام الإعلانات' : 'Ad-free when advertising launches'}</li>
        </ul>
        <p className="text-sm text-muted-foreground">
          {ar
            ? 'الدفع الإلكتروني غير متاح حالياً. يمكن للإدارة تفعيل Premium مؤقتاً حتى إطلاق الاشتراكات المدفوعة.'
            : 'Online checkout is not available yet. Administrators can grant Premium until payments launch.'}
        </p>
        <Link href="/stages" className="inline-flex rounded-lg border px-4 py-2">
          {ar ? 'تصفح المراحل' : 'Browse stages'}
        </Link>
      </div>
    </main>
  );
}
