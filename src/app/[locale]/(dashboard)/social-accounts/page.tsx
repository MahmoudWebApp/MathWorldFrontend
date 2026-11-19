'use client';

import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { LockKeyhole, ShieldCheck } from 'lucide-react';
import { DirectionalArrow } from '@/components/ui/DirectionalNavigation';
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
  const copy = locale === 'en' ? localized.en : localized.ar;
  const enabled = process.env.NEXT_PUBLIC_SOCIAL_LOGIN_ENABLED === 'true';
  const { data: linkStatus, isLoading: checkingLink } = useGetSocialLinkStatusQuery(undefined, {
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
        <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4 text-sm">
          <div className="flex items-start gap-2">
            <LockKeyhole size={18} className="shrink-0 text-primary" />
            <p>{copy.note}</p>
          </div>
        </div>
        {enabled ? (
          alreadyLinked ? (
            <p role="status" className="mt-6 text-sm text-muted-foreground">
              {locale === 'ar' ? 'حسابك مرتبط بـ Google.' : 'Your Google account is connected.'}
            </p>
          ) : (
            <div className="mt-6">
              {!checkingLink && <h2 className="text-gradient-math text-lg font-bold">{locale === 'ar' ? 'ربط حساب Google' : 'Connect your Google account'}</h2>}
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
