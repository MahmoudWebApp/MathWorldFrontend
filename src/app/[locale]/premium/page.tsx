'use client';

import { useLocale } from 'next-intl';
import { useSelector } from 'react-redux';
import { CheckCircle2, Clock3, Crown, GraduationCap, LockOpen, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from '@/i18n/routing';
import type { RootState } from '@/store';

export default function PremiumBenefitsPage() {
  const ar = useLocale() === 'ar';
  const plan = useSelector((state: RootState) => state.auth.user?.SubscriptionType);
  const premium = plan?.toLowerCase() === 'premium';
  const benefits = [
    {
      icon: LockOpen,
      arTitle: 'جميع الفئات التعليمية',
      enTitle: 'Every learning category',
      arText: 'Free يفتح أول فئتين من كل مرحلة. Premium يفتح كل الفئات.',
      enText: 'Free opens the first two categories per stage; Premium opens all categories.',
      upcoming: false,
    },
    {
      icon: GraduationCap,
      arTitle: 'شاهد الحل قبل الإجابة',
      enTitle: 'Preview before answering',
      arText: 'راجع الحل عند الحاجة قبل إرسال إجابتك؛ بدون احتساب محاولة.',
      enText: 'Request the solution before submitting, without using an attempt.',
      upcoming: false,
    },
    {
      icon: ShieldCheck,
      arTitle: 'بدون إعلانات',
      enTitle: 'No ads',
      arText: 'عند إطلاق الإعلانات مستقبلاً، لن تظهر لمشتركي Premium.',
      enText: 'When ads launch, Premium accounts will remain ad-free.',
      upcoming: true,
    },
    {
      icon: Sparkles,
      arTitle: 'تقارير التقدم وتصدير CSV',
      enTitle: 'Progress reports and CSV export',
      arText: 'تقرير مفصل حسب الفئة وتصدير CSV يفتح في Excel. تصدير PDF وXLSX قريباً.',
      enText: 'Category progress and CSV for Excel. Native PDF and XLSX are coming later.',
      upcoming: false,
    },
    {
      icon: Clock3,
      arTitle: 'التواصل مع مدرس رياضيات',
      enTitle: 'Connect with math tutors',
      arText: 'ميزة قادمة بعد تجهيز شبكة المدرسين.',
      enText: 'Coming after the tutor network is ready.',
      upcoming: true,
    },
  ];

  return (
    <main className="container mx-auto max-w-4xl px-4 py-8 md:px-8">
      <div className="mb-6">
        <Link href="/dashboard" className="text-sm font-semibold text-primary hover:underline">
          {ar ? 'العودة إلى رحلتي' : 'Back to my journey'}
        </Link>
      </div>
      <header className="math-card rounded-3xl border border-primary/20 bg-primary/5 p-6 md:p-9">
        <div className="mb-3 inline-flex items-center gap-2 text-primary">
          <Crown className="h-6 w-6" aria-hidden />
          <span className="font-bold">MathWorld Premium</span>
        </div>
        <h1 className="brand-display-title mb-3 text-2xl font-bold md:text-4xl">
          {ar ? 'اعرف مميزات حسابك المدفوع' : 'Explore Premium benefits'}
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
          {ar
            ? 'التدرب على المسائل بلا حد يومي متاح للجميع، والفرق في الفئات والمزايا الإضافية.'
            : 'Unlimited daily practice is free for everyone. Premium unlocks more categories and extra tools.'}
        </p>
        <p className="mt-4 inline-flex rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold">
          {premium
            ? ar ? 'حسابك Premium مفعل' : 'Your Premium plan is active'
            : ar ? 'حسابك الحالي Free' : 'Your current plan is Free'}
        </p>
      </header>

      {premium && (
        <Link href="/premium/report"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground hover:opacity-90">
          <Sparkles className="h-5 w-5" aria-hidden="true" />
          {ar ? 'عرض تقريري التعليمي' : 'View my learning report'}
        </Link>
      )}

      <section className="my-7">
        <h2 className="mb-4 text-xl font-bold">
          {ar ? 'شو بتحصل مع Premium؟' : 'What does Premium include?'}
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          {benefits.map(({ icon: Icon, arTitle, enTitle, arText, enText, upcoming }) => (
            <article key={enTitle} className="math-card rounded-2xl border border-border p-5">
              <div className="mb-3 flex items-center justify-between gap-2">
                <Icon className="h-6 w-6 text-primary" aria-hidden />
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${upcoming
                  ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'}`}>
                  {upcoming ? ar ? 'قريباً' : 'Coming soon' : ar ? 'متاحة الآن' : 'Available now'}
                </span>
              </div>
              <h3 className="font-bold">{ar ? arTitle : enTitle}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{ar ? arText : enText}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="math-card rounded-2xl border border-border p-5 md:p-6">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <CheckCircle2 className="h-5 w-5 text-primary" aria-hidden />
          {ar ? 'شو متاح مع Free؟' : 'What does Free include?'}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {ar
            ? 'أول فئتين من كل مرحلة، وحل أي عدد من المسائل المتاحة لك؛ بدون حد يومي.'
            : 'The first two categories of every stage, with unlimited problems in available categories.'}
        </p>
      </section>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        {ar
          ? 'السعر السنوي المخطط 5 دولارات. الدفع الإلكتروني وأكواد الخصم لم يتفعّلا بعد؛ يمكن للإدارة تفعيل Premium حالياً.'
          : 'Planned annual price: $5. Online payments and discount codes are not yet active; admins can activate Premium manually.'}
      </p>
    </main>
  );
}
