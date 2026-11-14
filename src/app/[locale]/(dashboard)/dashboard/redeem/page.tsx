'use client';

import { useState, type FormEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { CheckCircle2, Gift, ShieldCheck } from 'lucide-react';
import { categoriesApi } from '@/store/api/categoriesApi';
import { notificationsApi } from '@/store/api/notificationsApi';
import { useRedeemPremiumCodeMutation, type PremiumGiftRedemption } from '@/store/api/usersApi';

export default function RedeemPremiumGiftPage() {
  const ar = useLocale() === 'ar';
  const dispatch = useDispatch();
  const student = useSelector(
    (state: { auth: { isAuthenticated: boolean; user: { Role?: string } | null } }) =>
      state.auth.isAuthenticated && state.auth.user?.Role === 'Student'
  );
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [redemption, setRedemption] = useState<PremiumGiftRedemption | null>(null);
  const [redeem, { isLoading }] = useRedeemPremiumCodeMutation();

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setRedemption(null);
    const text = code.trim();
    if (!text || text.length > 100) {
      setError(ar ? 'أدخل كود هدية صحيح.' : 'Enter a valid gift code.');
      return;
    }
    try {
      const result = await redeem(text).unwrap();
      setRedemption(result);
      setCode('');
      // The access cache lives in another RTK Query API slice.
      dispatch(categoriesApi.util.invalidateTags(['StageAccess', 'Category']));
      dispatch(notificationsApi.util.invalidateTags(['Inbox']));
    } catch {
      setError(ar
        ? 'تعذر تفعيل الكود. قد يكون مستخدماً أو منتهي الصلاحية، أو حسابك Premium بلا تاريخ انتهاء.'
        : 'Could not redeem. The code may be used/expired, or your Premium is already indefinite.');
    }
  };

  return (
    <main className="mx-auto max-w-2xl space-y-7 px-4 py-12" dir={ar ? 'rtl' : 'ltr'}>
      <Link href="/premium" className="text-sm font-semibold text-primary hover:underline">
        {ar ? 'العودة لمزايا الاشتراك' : 'Back to membership benefits'}
      </Link>
      <header className="space-y-4 text-center">
        <span className="mx-auto inline-flex rounded-2xl bg-primary/10 p-4 text-primary">
          <Gift className="h-9 w-9" aria-hidden="true" />
        </span>
        <h1 className="text-3xl font-extrabold sm:text-4xl">
          {ar ? 'تفعيل هدية Premium' : 'Redeem your Premium gift'}
        </h1>
        <p className="text-muted-foreground">
          {ar ? 'عندك كود هدية من إدارة MathWorld؟ فعّله حتى تُفتح لك مزايا Premium.'
            : 'Have a gift code from MathWorld? Activate it to unlock Premium learning.'}
        </p>
      </header>
      {!student ? (
        <section className="space-y-3 rounded-2xl border p-6">
          <p>{ar ? 'سجّل دخولك بحساب طالب أولاً لتفعيل الكود.' : 'Sign in with a student account to redeem a code.'}</p>
          <Link href="/login" className="font-semibold text-primary underline">{ar ? 'تسجيل الدخول' : 'Sign in'}</Link>
        </section>
      ) : (
        <section className="space-y-5 rounded-2xl border bg-card p-5 sm:p-7">
          <form onSubmit={(event) => void submit(event)} className="space-y-4">
            <label className="block space-y-2">
              <span className="text-sm font-semibold">{ar ? 'كود الهدية' : 'Gift code'}</span>
              <input value={code} onChange={e => setCode(e.target.value)}
                autoComplete="off" spellCheck={false} maxLength={100} required
                dir="ltr" placeholder="MW-XXXXXXXXXXXX-XXXXXXXXXXXX-XXXXXXXXXXXX"
                className="w-full rounded-xl border bg-background px-4 py-3 font-mono text-sm uppercase outline-none focus:ring-2 focus:ring-primary" />
            </label>
            <button type="submit" disabled={isLoading}
              className="w-full rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground disabled:opacity-50">
              {isLoading ? (ar ? 'جارٍ التفعيل…' : 'Activating…') : (ar ? 'تفعيل كود Premium' : 'Activate Premium gift')}
            </button>
          </form>
          {error && <p role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
          {redemption && <div role="status" className="space-y-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
            <h2 className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="h-5 w-5" />{ar ? 'تم تفعيل Premium بنجاح!' : 'Premium activated!'}
            </h2>
            <p className="text-sm">
              {ar ? 'مدة الهدية:' : 'Gift duration:'} {redemption.GrantedDays}
              {' '}{ar ? 'يوماً' : 'days'}
            </p>
            <p className="text-sm">
              {ar ? 'تاريخ انتهاء الاشتراك:' : 'Membership expires:'}
              {' '}{new Intl.DateTimeFormat(ar ? 'ar' : 'en', {dateStyle:'long'}).format(new Date(redemption.PremiumExpiresAtUtc))}
            </p>
            <Link href="/stages" className="inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
              {ar ? 'ابدأ حل المسائل' : 'Start learning'}
            </Link>
          </div>}
          <p className="flex items-start gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true"/>
            {ar ? 'كود الهدية للاستخدام مرة واحدة فقط. لا توجد عملية دفع أو بطاقة مصرفية.'
              : 'Gift codes are single-use. No payment card or checkout is involved.'}
          </p>
        </section>
      )}
    </main>
  );
}
