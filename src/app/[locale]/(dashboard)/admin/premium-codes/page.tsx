'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { CheckCheck, Copy, Gift, ShieldCheck, Trash2 } from 'lucide-react';
import {
  useGetAdminPremiumCodesQuery,
  useCreateAdminPremiumCodeMutation,
  useRevokeAdminPremiumCodeMutation,
  type NewlyCreatedPremiumGift,
} from '@/store/api/usersApi';

export default function AdminPremiumGiftCodesPage() {
  const ar = useLocale() === 'ar';
  const [page, setPage] = useState(1);
  const [label, setLabel] = useState('');
  const [premiumDays, setPremiumDays] = useState(365);
  const [expiresInDays, setExpiresInDays] = useState(30);
  const [revealed, setRevealed] = useState<NewlyCreatedPremiumGift | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [revokeId, setRevokeId] = useState<number | null>(null);
  const { data, isLoading, isError } = useGetAdminPremiumCodesQuery(page);
  const [create, { isLoading: creating }] = useCreateAdminPremiumCodeMutation();
  const [revoke, { isLoading: revoking }] = useRevokeAdminPremiumCodeMutation();

  const issue = async () => {
    setError('');
    setMessage('');
    setRevealed(null);
    if (label.trim().length < 3 || label.trim().length > 80 ||
      !Number.isInteger(premiumDays) || premiumDays < 1 || premiumDays > 365 ||
      !Number.isInteger(expiresInDays) || expiresInDays < 1 || expiresInDays > 365) {
      setError(ar ? 'تحقق من الاسم والمدة: من يوم إلى 365 يوماً.'
        : 'Check the label and durations: 1 to 365 days.');
      return;
    }
    try {
      const response = await create({
        Label: label.trim(), PremiumDays: premiumDays, ExpiresInDays: expiresInDays,
      }).unwrap();
      setRevealed(response);
      setLabel('');
      setPage(1);
    } catch {
      setError(ar ? 'لم يتم إنشاء الكود. تحقق من صلاحية الأدمن.'
        : 'Could not create the gift code. Check administrator access.');
    }
  };

  const confirmRevoke = async () => {
    if (revokeId == null) return;
    setError('');
    setMessage('');
    try {
      await revoke(revokeId).unwrap();
      setRevokeId(null);
      setMessage(ar ? 'تم تعطيل الكود غير المستخدم.' : 'The unused code has been revoked.');
    } catch {
      setError(ar ? 'تعذر التعطيل. ربما استُخدم الكود بالفعل.'
        : 'Unable to revoke: the code may already be redeemed.');
      setRevokeId(null);
    }
  };

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <Link href="/admin" className="text-sm font-semibold text-primary hover:underline">
        {ar ? 'العودة للأدمن' : 'Back to admin'}
      </Link>
      <header className="space-y-3">
        <h1 className="flex items-center gap-2 text-3xl font-extrabold">
          <Gift className="h-7 w-7 text-primary" />{ar ? 'أكواد هدية Premium' : 'Premium gift codes'}
        </h1>
        <p className="text-muted-foreground">
          {ar
            ? 'إنشاء أكواد تمنح اشتراكاً مجانياً لمرة واحدة، بدون بوابة دفع إلكتروني.'
            : 'Issue one-use Premium access gifts without a payment checkout.'}
        </p>
        <div className="flex gap-2 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm">
          <ShieldCheck className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
          <p>
            {ar
              ? 'الكود الكامل يظهر مرة واحدة فقط عند الإنشاء. انسخه واحفظه بشكل آمن؛ لن يُعرض مرة ثانية. هذا ليس كوبون خصم على عملية دفع.'
              : 'The full code is shown only once. Copy it securely now; it cannot be retrieved later. This is not a checkout discount.'}
          </p>
        </div>
      </header>

      <section className="space-y-4 rounded-2xl border bg-card p-5">
        <h2 className="text-lg font-bold">{ar ? 'إصدار هدية جديدة' : 'Create a new gift'}</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="space-y-2 sm:col-span-3">
            <span className="block text-sm font-semibold">{ar ? 'وصف داخلي للكود' : 'Internal code label'}</span>
            <input value={label} onChange={e => setLabel(e.target.value)} maxLength={80}
              placeholder={ar ? 'هدية إطلاق المنصة' : 'Launch gift'}
              className="w-full rounded-xl border bg-background px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary" />
          </label>
          <label className="space-y-2">
            <span className="block text-sm font-semibold">{ar ? 'مدة Premium بالأيام' : 'Premium days'}</span>
            <input type="number" value={premiumDays} min={1} max={365}
              onChange={e=>setPremiumDays(Number(e.target.value))}
              className="w-full rounded-xl border bg-background px-3 py-2.5" />
          </label>
          <label className="space-y-2">
            <span className="block text-sm font-semibold">{ar ? 'صلاحية استعمال الكود بالأيام' : 'Redeem within days'}</span>
            <input type="number" value={expiresInDays} min={1} max={365}
              onChange={e=>setExpiresInDays(Number(e.target.value))}
              className="w-full rounded-xl border bg-background px-3 py-2.5" />
          </label>
          <div className="flex items-end">
            <button disabled={creating} type="button" onClick={() => void issue()}
              className="w-full rounded-xl bg-primary px-4 py-2.5 font-semibold text-primary-foreground disabled:opacity-50">
              {creating ? (ar ? 'جارٍ الإنشاء…' : 'Creating…') : (ar ? 'إنشاء الكود' : 'Generate code')}
            </button>
          </div>
        </div>
        {error && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
        {message && <p role="status" className="rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-300">{message}</p>}
        {revealed && (
          <div role="status" className="space-y-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
            <strong className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-300">
              <CheckCheck className="h-5 w-5" />{ar ? 'تم الإنشاء — احفظ الكود الآن' : 'Created — copy this code now'}
            </strong>
            <div className="flex flex-wrap items-center gap-2">
              <code dir="ltr" className="max-w-full break-all rounded-lg border bg-background p-3 text-sm font-bold">{revealed.Code}</code>
              <button type="button" onClick={() => void navigator.clipboard.writeText(revealed.Code)}
                className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold">
                <Copy className="h-4 w-4"/>{ar ? 'نسخ' : 'Copy'}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              {ar ? 'هذا الكود يمنح:' : 'This code grants:'} {revealed.PremiumDays}
              {' '}{ar ? 'يوماً. صالح للتفعيل حتى:' : 'days. Redeem by:'}
              {' '}{new Intl.DateTimeFormat(ar ? 'ar' : 'en', {dateStyle:'medium'}).format(new Date(revealed.ExpiresAtUtc))}
            </p>
          </div>
        )}
      </section>

      <section className="space-y-4 rounded-2xl border bg-card p-5">
        <h2 className="text-lg font-bold">{ar ? 'سجل الأكواد (بدون إظهار النص السري)' : 'Gift history (no plaintext codes)'}</h2>
        {isLoading ? <p className="text-sm text-muted-foreground">{ar ? 'جارٍ التحميل…' : 'Loading…'}</p>
          : isError ? <p role="alert" className="text-sm text-destructive">{ar ? 'تعذر تحميل الأكواد' : 'Could not load codes'}</p>
          : !data?.Codes.length ? <p className="text-sm text-muted-foreground">{ar ? 'ما في أكواد بعد.' : 'No codes yet.'}</p>
          : <div className="space-y-2">
            {data.Codes.map(code => (
              <div key={code.Id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3">
                <div>
                  <strong>{code.Label}</strong>
                  <p className="mt-1 text-xs text-muted-foreground">
                    #{code.Id} · {code.PremiumDays} {ar ? 'يوم' : 'days'}
                    {' · '}{new Intl.DateTimeFormat(ar ? 'ar' : 'en', {dateStyle:'medium'}).format(new Date(code.CreatedAtUtc))}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-lg bg-muted px-2.5 py-1 text-xs font-semibold">{code.Status}</span>
                  {code.Status === 'Available' &&
                    <button type="button" disabled={revoking} onClick={() => setRevokeId(code.Id)}
                      aria-label={ar ? 'تعطيل كود غير مستخدم' : 'Revoke unused code'}
                      className="rounded-lg border p-2 text-destructive hover:bg-destructive/10 disabled:opacity-50">
                      <Trash2 className="h-4 w-4"/>
                    </button>}
                </div>
              </div>
            ))}
          </div>}
        <div className="flex items-center justify-between border-t pt-3 text-sm">
          <button disabled={page <= 1} onClick={() => setPage(p=>p-1)}
            className="font-semibold text-primary disabled:opacity-40">{ar ? 'السابق' : 'Previous'}</button>
          <span>{page} / {Math.max(1,Math.ceil((data?.Total ?? 0)/20))}</span>
          <button disabled={!data || page * 20 >= data.Total} onClick={() => setPage(p=>p+1)}
            className="font-semibold text-primary disabled:opacity-40">{ar ? 'التالي' : 'Next'}</button>
        </div>
      </section>
      {revokeId !== null && <div role="dialog" aria-modal="true"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-sm space-y-4 rounded-2xl bg-card p-6">
          <h2 className="text-lg font-bold">{ar ? 'تأكيد إلغاء الكود' : 'Revoke this code?'}</h2>
          <p className="text-sm">{ar ? 'الكود غير المستخدم لن يعود قابلاً للتفعيل.'
            : 'This unused code will no longer be redeemable.'}</p>
          <div className="flex flex-wrap justify-end gap-2">
            <button className="rounded-lg border px-3 py-2" onClick={()=>setRevokeId(null)}>{ar ? 'إلغاء' : 'Cancel'}</button>
            <button disabled={revoking} className="rounded-lg bg-destructive px-3 py-2 text-destructive-foreground"
              onClick={() => void confirmRevoke()}>{ar ? 'تأكيد التعطيل' : 'Confirm revoke'}</button>
          </div>
        </div>
      </div>}
    </main>
  );
}
