'use client';

import { useLocale } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { LockKeyhole, ShieldCheck } from 'lucide-react';
import { DirectionalArrow } from '@/components/ui/DirectionalNavigation';
import { MathWorldLoading } from '@/components/ui/MathWorldLoading';
import { SocialAuthButtons } from '@/components/auth/SocialAuthButtons';
import { useGetSocialLinkStatusQuery } from '@/store/api/authApi';

const localized = {
  ar: {
    title: 'إعدادات الحساب',
    description:
      'اربط Google بنفس حساب MathWorld لتحافظ على نقاطك وتقدّمك. إذا كان حساب Google مربوطاً مسبقاً، يختفي زر الربط.',
    note: 'إذا كان حساب اجتماعي مربوطًا بحساب MathWorld آخر، لا يمكن نقله تلقائيًا.',
    inactive: 'سيظهر ربط Google بعد تفعيل إعداداته الرسمية.',
    back: 'العودة إلى لوحة الطالب',
  },
  en: {
    title: 'Account settings',
    description:
      'Connect Google to your existing MathWorld account without losing points or progress. The button disappears once connected.',
    note: 'An identity already linked to a different MathWorld account cannot be moved automatically.',
    inactive: 'Google linking becomes available when its official configuration is enabled.',
    back: 'Return to dashboard',
  },
};

export default function SocialAccountsPage() {
  const locale = useLocale();
  const withinSettings = usePathname() === '/dashboard/settings';
  const copy = locale === 'en' ? localized.en : localized.ar;
  const enabled = process.env.NEXT_PUBLIC_SOCIAL_LOGIN_ENABLED === 'true';
  const { data: linkStatus, isLoading: checkingLink, isError: linkError, refetch: retryLink } = useGetSocialLinkStatusQuery(undefined, {
    skip: !enabled,
    refetchOnMountOrArgChange: true,
  });
  const alreadyLinked = linkStatus?.GoogleLinked === true;

  return (
    <main className="container mx-auto min-h-[70vh] max-w-3xl px-4 py-12">
      <section className="brand-surface math-card rounded-3xl p-6 md:p-10">
        <div className="mb-6 flex items-center gap-3 text-primary">
          <ShieldCheck size={27} />
          <h1 className="text-2xl font-bold">{copy.title}</h1>
        </div>
        <p className="mb-6 leading-relaxed text-muted-foreground">
          {copy.description}
        </p>
        {withinSettings && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/15 bg-card p-4">
            <div>
              <h2 className="font-bold">{locale === 'ar' ? 'المرحلة التعليمية' : 'Learning stage'}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{locale === 'ar' ? 'يمكنك تغيير مرحلتك من هنا دون حذف تقدمك السابق.' : 'Change your stage here without losing earlier progress.'}</p>
            </div>
            <Link href="/learning-stage" className="rounded-xl border border-primary/25 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/10">
              {locale === 'ar' ? 'تغيير المرحلة' : 'Change stage'}
            </Link>
          </div>
        )}
        <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4 text-sm">
          <div className="flex items-start gap-2">
            <LockKeyhole size={18} className="shrink-0 text-primary" />
            <p>{copy.note}</p>
          </div>
        </div>
        {enabled ? (
          checkingLink ? <MathWorldLoading compact /> :
          linkError || !linkStatus ? (
            <div role="alert" className="mt-6 space-y-3 rounded-xl border border-destructive/25 bg-card p-4">
              <p>{locale === 'ar' ? 'تعذّر التحقق من ربط Google. ما رح نظهر زر الربط قبل التأكد من حالة حسابك.'
                : 'Google link status could not be verified. The connect action is hidden until verified.'}</p>
              <button type="button" onClick={() => void retryLink()}
                className="rounded-xl bg-primary px-4 py-2 font-semibold text-primary-foreground">
                {locale === 'ar' ? 'إعادة المحاولة' : 'Retry'}
              </button>
            </div>
          ) : alreadyLinked ? (
            <p role="status" className="mt-6 text-sm text-muted-foreground">
              {locale === 'ar' ? 'حسابك مرتبط بـ Google.' : 'Your Google account is connected.'}
            </p>
          ) : (
            <div className="mt-6">
              <h2 className="text-gradient-math text-lg font-bold">{locale === 'ar' ? 'ربط حساب Google' : 'Connect your Google account'}</h2>
              <SocialAuthButtons mode="link" />
            </div>
          )
        ) : (
          <p className="mt-6 text-sm text-muted-foreground">{copy.inactive}</p>
        )}
        <Link
          href="/dashboard"
          className="mt-9 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <DirectionalArrow direction="back" />
          {copy.back}
        </Link>
      </section>
    </main>
  );
}
