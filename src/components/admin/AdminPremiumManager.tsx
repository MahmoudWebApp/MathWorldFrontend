'use client';

import { useState } from 'react';
import {
  useGetAdminLearnerSubscriptionHistoryQuery,
  useUpdateAdminLearnerSubscriptionMutation,
  type AdminSubscriptionChange,
} from '@/store/api/usersApi';

interface Props {
  learnerId: number;
  locale: 'ar' | 'en';
}

/** Embed in an authenticated Admin learner details view only.
 * Backend checks the Admin role, active account and every requested change.
 */
export function AdminPremiumManager({ learnerId, locale }: Props) {
  const ar = locale === 'ar';
  const [subscriptionType, setSubscriptionType] = useState<'Free' | 'Premium'>('Premium');
  const [expiry, setExpiry] = useState('');
  const [reason, setReason] = useState('');
  const [page, setPage] = useState(1);
  const [successMessage, setSuccessMessage] = useState(false);
  const [update, { isLoading, error }] = useUpdateAdminLearnerSubscriptionMutation();
  const { data: history, isFetching, refetch } = useGetAdminLearnerSubscriptionHistoryQuery(
    { LearnerId: learnerId, Page: page, PageSize: 10 },
    { skip: !Number.isSafeInteger(learnerId) || learnerId <= 0 },
  );

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccessMessage(false);
    if (reason.trim().length < 3 || reason.trim().length > 500) return;
    const change: AdminSubscriptionChange = {
      SubscriptionType: subscriptionType,
      Reason: reason.trim(),
      PremiumExpiresAtUtc: null,
    };
    if (subscriptionType === 'Premium' && expiry) {
      const parsed = new Date(expiry);
      if (Number.isNaN(parsed.getTime()) || parsed.getTime() <= Date.now()) return;
      change.PremiumExpiresAtUtc = parsed.toISOString();
    }
    if (!window.confirm(ar ? 'تأكيد تعديل اشتراك هذا الطالب؟' : 'Confirm changing this learner subscription?')) return;
    try {
      await update({ LearnerId: learnerId, Change: change }).unwrap();
      setReason('');
      setSuccessMessage(true);
      refetch();
    } catch {
      // RTK Query exposes the error below.
    }
  };

  return (
    <section dir={ar ? 'rtl' : 'ltr'} className="rounded-2xl border border-slate-200 bg-white p-5 text-slate-900 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white">
      <h2 className="mb-4 text-xl font-bold">{ar ? 'إدارة اشتراك الطالب' : 'Student subscription management'}</h2>
      <form onSubmit={submit} className="grid gap-4">
        <label className="grid gap-1 text-sm font-medium">
          {ar ? 'نوع الحساب' : 'Account type'}
          <select value={subscriptionType} onChange={(e) => setSubscriptionType(e.target.value as 'Free' | 'Premium')}
            className="rounded-lg border border-slate-300 bg-transparent p-2">
            <option value="Premium">Premium</option>
            <option value="Free">Free</option>
          </select>
        </label>
        {subscriptionType === 'Premium' && (
          <label className="grid gap-1 text-sm font-medium">
            {ar ? 'انتهاء الاشتراك (اتركه فارغاً لاشتراك غير محدد)' : 'Expiry (leave blank for unlimited duration)'}
            <input type="datetime-local" value={expiry} onChange={(e) => setExpiry(e.target.value)}
              className="rounded-lg border border-slate-300 bg-transparent p-2" />
          </label>
        )}
        <label className="grid gap-1 text-sm font-medium">
          {ar ? 'سبب التعديل (مطلوب للتدقيق)' : 'Reason (required for audit)'}
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} required minLength={3} maxLength={500}
            className="rounded-lg border border-slate-300 bg-transparent p-2" rows={2} />
        </label>
        <button type="submit" disabled={isLoading || reason.trim().length < 3}
          className="rounded-lg bg-emerald-700 px-4 py-2 font-semibold text-white disabled:opacity-50">
          {isLoading ? (ar ? 'جارٍ الحفظ...' : 'Saving...') : (ar ? 'حفظ الاشتراك' : 'Save subscription')}
        </button>
        {successMessage && <p role="status" className="text-sm text-emerald-600">{ar ? 'تم تحديث الاشتراك' : 'Subscription updated'}</p>}
        {error && <p role="alert" className="text-sm text-red-600">{ar ? 'تعذّر تحديث الاشتراك' : 'Subscription update failed'}</p>}
      </form>
      <h3 className="mb-3 mt-6 font-semibold">{ar ? 'سجل التعديلات' : 'Change history'}</h3>
      {isFetching && <p>{ar ? 'جارٍ التحميل...' : 'Loading...'}</p>}
      {!isFetching && history?.Records.length === 0 && <p className="text-sm opacity-70">{ar ? 'لا توجد تعديلات سابقة' : 'No previous changes'}</p>}
      <ol className="space-y-3">
        {history?.Records.map((record) => (
          <li key={record.Id} className="rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-700">
            <div className="font-semibold">{record.PreviousType} → {record.NewType}</div>
            <div>{record.Reason}</div>
            <time className="text-xs opacity-70" dateTime={record.ChangedAtUtc}>
              {new Date(record.ChangedAtUtc).toLocaleString(ar ? 'ar' : 'en')}
            </time>
          </li>
        ))}
      </ol>
      <div className="mt-4 flex items-center gap-3">
        <button type="button" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="rounded border px-3 py-1 disabled:opacity-40">{ar ? 'السابق' : 'Previous'}</button>
        <span>{page}</span>
        <button type="button" disabled={!history || page * 10 >= history.Total} onClick={() => setPage((p) => p + 1)}
          className="rounded border px-3 py-1 disabled:opacity-40">{ar ? 'التالي' : 'Next'}</button>
      </div>
    </section>
  );
}
