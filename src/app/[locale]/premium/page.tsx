'use client';

import { useState, type FormEvent } from 'react';
import { useLocale } from 'next-intl';
import { useDispatch, useSelector } from 'react-redux';
import { CheckCircle2, Crown, GraduationCap, LockOpen, ShieldCheck, Sparkles, Ticket } from 'lucide-react';
import { Link } from '@/i18n/routing';
import type { RootState, AppDispatch } from '@/store';
import type { User } from '@/store/api/types';
import { setCredentials } from '@/store/slices/authSlice';
import { API_BASE_URL } from '@/store/api/baseQuery';
import { categoriesApi } from '@/store/api/categoriesApi';

export default function PremiumBenefitsPage() {
  const ar = useLocale() === 'ar';
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);
  const premium = user?.SubscriptionType?.toLowerCase() === 'premium';
  const [code, setCode] = useState('');
  const [redeeming, setRedeeming] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const premiumFeatures = [
    { icon: CheckCircle2, ar: 'حل عدد غير محدود من المسائل في جميع الفئات', en: 'Unlimited problems in all categories' },
    { icon: LockOpen, ar: 'فتح كل فئات المرحلة التي يدرسها الطالب', en: 'Unlock every topic in the learner’s selected stage' },
    { icon: GraduationCap, ar: 'مشاهدة الحل قبل إرسال الإجابة', en: 'View solutions before answering' },
    { icon: Sparkles, ar: 'تقارير وإحصائيات شخصية مع تصدير PDF وCSV لبرنامج Excel',
      en: 'Personal analytics with PDF and Excel-compatible CSV exports' },
    { icon: ShieldCheck, ar: 'بدون إعلانات ضمن MathWorld', en: 'Ad-free MathWorld' },
  ];
  const freeFeatures = [
    ar ? 'فئتان مفتوحتان من كل مرحلة' : 'Two unlocked categories per stage',
    ar ? 'حل عدد غير محدود من المسائل المتاحة' : 'Unlimited problems in your open categories',
    ar ? 'الاحتفاظ بالنقاط والتقدم في كل مرحلة' : 'Stage points and progress are preserved',
  ];

  async function redeem(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user || !token || redeeming || !code.trim()) return;
    setRedeeming(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch(`${API_BASE_URL}/users/premium-codes/redeem`, {
        method: 'POST',
        cache: 'no-store',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ Code: code.trim() }),
      });
      if (!response.ok) {
        throw new Error(response.status === 404 || response.status === 503
          ? (ar ? 'خدمة تفعيل الرموز غير متاحة حالياً.' : 'Code activation service is unavailable.')
          : (ar ? 'الرمز غير صالح أو سبق استخدامه.' : 'This code is invalid or has already been used.'));
      }
      // Refresh the profile from the server; never accept a client-issued entitlement.
      const profileResponse = await fetch(`${API_BASE_URL}/users/profile`, {
        cache: 'no-store', headers: { Authorization: `Bearer ${token}` },
      });
      if (!profileResponse.ok) {
        setMessage(ar ? 'تم إرسال رمز التفعيل بنجاح. حدّث صفحتك لتحديث الخطة.'
          : 'Code accepted. Refresh to update your plan.');
        return;
      }
      const payload = await profileResponse.json() as { Data?: Partial<User> };
      if (payload.Data?.SubscriptionType?.toLowerCase() === 'premium') {
        const updated: User = { ...user, ...payload.Data, Token: token };
        dispatch(setCredentials({ user: updated, token }));
        dispatch(categoriesApi.util.invalidateTags(['Category']));
        setCode('');
        setMessage(ar ? 'تم تفعيل Premium على حسابك.' : 'Premium is now active on your account.');
      } else {
        setMessage(ar ? 'تم قبول الرمز. أعد تحميل الصفحة لتحديث الصلاحيات.'
          : 'Code accepted. Reload to refresh your access.');
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message
        : (ar ? 'تعذر تفعيل الرمز.' : 'Unable to redeem this code.'));
    } finally {
      setRedeeming(false);
    }
  }

  return (
    <main className="container mx-auto max-w-5xl px-4 py-8 md:px-8">
      <Link href={user ? "/dashboard" : "/"} className="mb-5 inline-block text-sm font-semibold text-primary hover:underline">
        {user ? (ar ? 'العودة لحسابي' : 'Back to dashboard') : (ar ? 'العودة للرئيسية' : 'Back to home')}
      </Link>
      <header className="mb-6">
        <h1 className="brand-display-title text-3xl font-black md:text-4xl">
          {ar ? 'مقارنة حسابات Free وPremium' : 'Free vs Premium'}
        </h1>
        <p className="mt-3 text-muted-foreground">
          {ar
            ? 'حسابان فقط وبلا أسعار حالياً. تعرف إلى الفئات المتاحة والمزايا، ويمكن للطالب تفعيل Premium بكود تمنحه الإدارة.'
            : 'Two plans, with no prices listed for now. Compare access and benefits; learners can activate Premium using an admin-issued code.'}
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <section className={`math-card rounded-2xl border p-5 md:p-6 ${!premium ? 'border-primary' : 'border-border'}`}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl font-extrabold">Free</h2>
            {!premium && <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              {ar ? 'خطتك الحالية' : 'Current plan'}</span>}
          </div>
          <ul className="mt-5 space-y-3">
            {freeFeatures.map(feature => <li key={feature} className="flex items-start gap-2 text-sm">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
              {feature}</li>)}
          </ul>
        </section>

        <section className={`math-card rounded-2xl border p-5 md:p-6 ${premium ? 'border-primary' : 'border-border'}`}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="inline-flex items-center gap-2 text-2xl font-extrabold">
              <Crown className="h-6 w-6 text-primary" aria-hidden /> Premium</h2>
            {premium && <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              {ar ? 'خطتك الحالية' : 'Current plan'}</span>}
          </div>
          <ul className="mt-5 space-y-3">
            {premiumFeatures.map(({icon: Icon, ar: titleAr, en: titleEn}) => <li
              key={titleEn} className="flex items-start gap-2 text-sm">
              <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
              {ar ? titleAr : titleEn}</li>)}
          </ul>
          {premium && <Link href="/premium/report"
            className="mt-6 inline-flex rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground">
            {ar ? 'عرض تقريري' : 'Open my report'}</Link>}
        </section>
      </div>

      {!premium && user?.Role === 'Student' && (
        <section id="activate-premium" className="math-card mt-6 rounded-2xl border border-border p-5 md:p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <Ticket className="h-5 w-5 text-primary" aria-hidden />
            {ar ? 'تفعيل Premium بكود خصم 100%' : 'Activate Premium with a 100% discount code'}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {ar
              ? 'كود خصم 100% تصدره إدارة MathWorld لتفعيل Premium بالكامل دون دفع. صالح للاستخدام مرة واحدة.'
              : 'An administrator-issued single-use 100% code activates full Premium without payment.'}
          </p>
          <form onSubmit={redeem} className="mt-4 flex flex-col gap-3 sm:flex-row">
            <label className="sr-only" htmlFor="premium-free-code">
              {ar ? 'كود خصم 100%' : '100% access code'}</label>
            <input id="premium-free-code" type="text" value={code}
              onChange={event => { setCode(event.target.value); setError(''); }}
              maxLength={100} autoCapitalize="characters" autoComplete="off"
              dir="ltr" placeholder="MW-XXXXXXXXXXXX-XXXXXXXXXXXX-XXXXXXXXXXXX"
              className="min-w-0 flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm"
            />
            <button type="submit" disabled={redeeming || !code.trim()}
              className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground disabled:opacity-50">
              {redeeming ? (ar ? 'جارٍ التفعيل…' : 'Activating…') : (ar ? 'تفعيل الرمز' : 'Activate code')}
            </button>
          </form>
          {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
          {message && <p role="status" className="mt-3 text-sm text-primary">{message}</p>}
        </section>
      )}
      {!user && (
        <section className="mt-7 rounded-2xl border border-primary/20 bg-primary/5 p-5">
          <p className="text-sm font-semibold">{ar ? 'ابدأ بالحساب المجاني، واستكشف المزايا قبل اتخاذ قرار الترقية.' : 'Start with Free and explore the benefits before upgrading.'}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/register" className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground">
              {ar ? 'إنشاء حساب مجاني' : 'Create a free account'}
            </Link>
            <Link href="/login" className="rounded-xl border border-primary/20 px-5 py-3 text-sm font-bold text-primary">
              {ar ? 'لديّ حساب' : 'I have an account'}
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}
