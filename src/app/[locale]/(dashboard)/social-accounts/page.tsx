'use client';

import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { LockKeyhole, ShieldCheck } from 'lucide-react';
import { DirectionalArrow } from '@/components/ui/DirectionalArrow';
import { SocialAuthButtons } from '@/components/auth/SocialAuthButtons';

const localized = {
  ar: {
    title: 'ربط حسابات الدخول',
    description:
      'للحفاظ على نقاطك ومسائلك، سجّل الدخول إلى MathWorld أولاً ثم اربط حساب Google أو Facebook من هنا. لن ننشئ حسابًا ثانيًا ولن ننقل تقدمك.',
    note: 'إذا كان حساب اجتماعي مربوطًا بحساب MathWorld آخر، لا يمكن نقله تلقائيًا.',
    inactive: 'ستظهر خيارات الربط بعد تجهيز حسابات Google وFacebook الرسمية وتفعيل الخدمة.',
    back: 'العودة إلى لوحة الطالب',
  },
  en: {
    title: 'Connect your sign-in accounts',
    description:
      'To keep all your MathWorld points and progress, sign in to your original account first and link Google or Facebook here. We never transfer progress to another user automatically.',
    note: 'An identity already linked to a different MathWorld account cannot be moved automatically.',
    inactive: 'Connection options become available after official Google and Meta app setup.',
    back: 'Return to dashboard',
  },
};

export default function SocialAccountsPage() {
  const locale = useLocale();
  const copy = locale === 'en' ? localized.en : localized.ar;
  const enabled = process.env.NEXT_PUBLIC_SOCIAL_LOGIN_ENABLED === 'true';

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
          <SocialAuthButtons mode="link" />
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
