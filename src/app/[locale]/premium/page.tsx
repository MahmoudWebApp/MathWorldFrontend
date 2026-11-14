'use client';

import { useLocale } from 'next-intl';
import { useSelector } from 'react-redux';
import { CheckCircle2, Crown, Infinity, LockKeyhole, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useGetStudentSubscriptionQuery } from '@/store/api/categoriesApi';

const freeAr = [
  'فئتان مفتوحتان بكل مرحلة تعليمية',
  'حل غير محدود ضمن الفئات المفتوحة',
  'نتائج أساسية وتقدم الطالب',
  'تظهر الحلول بعد المحاولة وفق قواعد المسألة',
];
const freeEn = [
  'Two unlocked categories per educational stage',
  'Unlimited practice within unlocked categories',
  'Basic results and student progress',
  'Solutions after attempting, according to question rules',
];
const premiumAr = [
  'فتح جميع الفئات في كل مرحلة',
  'حل غير محدود دون حصة يومية',
  'معاينة الحل قبل الإجابة',
  'بدون إعلانات عند تشغيل نظام الإعلانات',
];
const premiumEn = [
  'Unlock every category in every stage',
  'Unlimited practice with no daily allowance',
  'Preview solutions before answering',
  'Ad-free once advertising is enabled',
];

export default function PremiumInformationPage() {
  const locale = useLocale();
  const ar = locale === 'ar';
  const authenticated = useSelector(
    (state: { auth: { isAuthenticated: boolean; user: { Role?: string } | null } }) =>
      state.auth.isAuthenticated && state.auth.user?.Role === 'Student',
  );
  const { data: entitlement, isLoading, isError, refetch } = useGetStudentSubscriptionQuery(undefined, {
    skip: !authenticated,
    refetchOnMountOrArgChange: true,
  });

  const hasPremium = entitlement?.IsPremium === true;
  const endsAt = entitlement?.PremiumExpiresAtUtc
    ? new Date(entitlement.PremiumExpiresAtUtc) : null;
  const expires = endsAt && Number.isFinite(endsAt.getTime())
    ? new Intl.DateTimeFormat(ar ? 'ar' : 'en', { dateStyle: 'long' }).format(endsAt)
    : null;

  return (
    <main className="container mx-auto max-w-6xl space-y-8 px-4 py-12 lg:py-20" dir={ar ? 'rtl' : 'ltr'}>
      <header className="mx-auto max-w-3xl space-y-4 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-bold text-primary">
          <Sparkles className="h-4 w-4" /> MathWorld
        </span>
        <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
          {ar ? 'تعلّم بالطريقة اللي تناسبك' : 'Learn at your own pace'}
        </h1>
        <p className="text-base leading-8 text-muted-foreground sm:text-lg">
          {ar ? 'المجاني يتيح حل عدد غير محدود من المسائل ضمن فئتين بكل مرحلة. Premium يفتح بقية الفئات ومزايا التعلم الإضافية.'
            : 'Free lets you practice unlimited questions in two categories per stage. Premium unlocks the rest and adds learning tools.'}
        </p>
      </header>

      {authenticated && (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-center text-sm">
          {isLoading ? (ar ? 'جارٍ التحقق من اشتراكك…' : 'Checking your subscription…') :
            isError ? (
              <>
                {ar ? 'تعذّر التحقق من الاشتراك حالياً.' : 'Unable to verify your subscription.'}{' '}
                <button type="button" className="font-semibold text-primary underline" onClick={() => void refetch()}>
                  {ar ? 'إعادة المحاولة' : 'Retry'}
                </button>
              </>
            ) : hasPremium ? (
              <span className="inline-flex items-center gap-2 font-bold text-primary">
                <CheckCircle2 className="h-5 w-5" aria-hidden />
                {ar ? 'اشتراك Premium مفعّل' : 'Premium active'}
                {expires ? ` · ${ar ? 'ينتهي' : 'Expires'} ${expires}` : ''}
              </span>
            ) : (ar ? 'حسابك الحالي مجاني — بإمكانك متابعة الحل ضمن الفئتين المفتوحتين.'
              : 'Your account is Free — continue solving in your unlocked categories.')}
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <section className="flex h-full flex-col rounded-3xl border bg-card p-6 shadow-sm sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="rounded-2xl bg-muted p-3 text-muted-foreground">
                <Infinity className="h-6 w-6" />
              </span>
              <div>
                <h2 className="text-2xl font-extrabold">{ar ? 'مجاني' : 'Free'}</h2>
                <p className="text-sm text-muted-foreground">{ar ? 'ابدأ التعلم الآن' : 'Start learning today'}</p>
              </div>
            </div>
            <span className="text-2xl font-black">$0</span>
          </div>
          <div className="my-6 border-t" />
          <ul className="flex-1 space-y-4">
            {(ar ? freeAr : freeEn).map(text => (
              <li className="flex items-start gap-3 text-sm leading-7" key={text}>
                <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
                <span>{text}</span>
              </li>
            ))}
          </ul>
          <Link href="/stages"
            className="mt-8 inline-flex justify-center rounded-xl border border-primary/30 px-5 py-3 font-bold text-primary hover:bg-primary/5">
            {ar ? 'تصفح المراحل' : 'Browse stages'}
          </Link>
        </section>

        <section className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-pink-500/10 p-6 shadow-lg sm:p-8">
          <span aria-hidden className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-700 via-purple-500 to-pink-500" />
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="rounded-2xl bg-primary/10 p-3 text-primary">
                <Crown className="h-6 w-6" />
              </span>
              <div>
                <h2 className="text-2xl font-extrabold">Premium</h2>
                <p className="text-sm text-muted-foreground">{ar ? 'الخطة الكاملة' : 'Full learning access'}</p>
              </div>
            </div>
            <div className="text-end">
              <p className="text-2xl font-black text-primary">$5</p>
              <p className="text-xs text-muted-foreground">{ar ? 'سنوياً — السعر المستهدف' : 'per year — planned price'}</p>
            </div>
          </div>
          <div className="my-6 border-t border-primary/20" />
          <ul className="flex-1 space-y-4">
            {(ar ? premiumAr : premiumEn).map(text => (
              <li className="flex items-start gap-3 text-sm leading-7" key={text}>
                <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-primary" aria-hidden />
                <span>{text}</span>
              </li>
            ))}
            <li className="flex items-start gap-3 text-sm leading-7 text-muted-foreground">
              <LockKeyhole className="mt-1 h-5 w-5 shrink-0" aria-hidden />
              <span>{ar ? 'تقرير شخصي وتصدير CSV لـ Excel، والحفظ PDF عبر الطباعة. التواصل مع المدرسين لاحقاً.'
                : 'Personal report, Excel-ready CSV and print-to-PDF. Teacher connections are planned.'}</span>
            </li>
          </ul>
          <Link href="/dashboard/redeem" className="mt-8 inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground hover:opacity-90">
            {ar ? 'عندي كود هدية Premium' : 'Redeem a Premium gift'}
          </Link>
          <Link href="/dashboard/analytics" className="mt-3 inline-flex items-center justify-center rounded-xl border border-primary/30 bg-background px-5 py-3 text-sm font-bold text-primary hover:bg-primary/5">
            {ar ? 'عرض تقريري الشخصي' : 'View my progress report'}
          </Link>
          <p className="mt-8 rounded-xl border border-primary/20 bg-background/70 px-4 py-3 text-center text-sm font-medium">
            <ShieldCheck className="me-2 inline h-4 w-4 text-primary" aria-hidden />
            {ar ? 'الدفع الإلكتروني غير مفعّل حالياً. يمكن للأدمن تفعيل الاشتراك مؤقتاً.'
              : 'Online checkout is not enabled. An administrator can grant temporary access.'}
          </p>
        </section>
      </div>
    </main>
  );
}
