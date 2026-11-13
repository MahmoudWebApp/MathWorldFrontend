'use client';

import { useLocale } from 'next-intl';
import { Clock3, Crown, Infinity, ListChecks } from 'lucide-react';
import { useGetDailyQuotaQuery } from '@/store/api/usersApi';

export function DailyQuotaCard({
  stageId,
  compact = false,
}: {
  stageId: number | null | undefined;
  compact?: boolean;
}) {
  const ar = useLocale() === 'ar';
  const { data, isLoading, isError } = useGetDailyQuotaQuery(stageId ?? 0, {
    skip: stageId == null || stageId <= 0,
    refetchOnMountOrArgChange: true,
  });
  if (stageId == null || stageId <= 0) return null;

  const date = data?.ResetsAtUtc
    ? new Date(data.ResetsAtUtc).toLocaleString(ar ? 'ar' : 'en', {
        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
        timeZone: 'UTC', hour12: false,
      })
    : null;

  const title = ar ? 'مسائلك الجديدة اليوم' : "Today's new problems";
  const stageName = data ? (ar ? data.NameAr : data.NameEn) : '';
  const exhausted = data && !data.Unlimited && data.Remaining === 0;
  return (
    <section className={`rounded-2xl border border-primary/20 bg-primary/5 ${compact ? 'p-4' : 'p-5'}`}
      aria-label={title}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="rounded-xl bg-primary/10 p-2.5 text-primary">
            {data?.Unlimited ? <Crown className="h-5 w-5" aria-hidden />
              : <ListChecks className="h-5 w-5" aria-hidden />}
          </span>
          <div>
            <h3 className="font-bold">{title}</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">{stageName}</p>
          </div>
        </div>
        {data?.Unlimited
          ? <span className="inline-flex items-center gap-2 font-bold text-primary">
              <Infinity className="h-5 w-5" aria-hidden />{ar ? 'غير محدود — Premium' : 'Unlimited — Premium'}
            </span>
          : data && <strong className="text-2xl font-bold tabular-nums text-primary">
              {data.Used}/{data.Limit}
            </strong>
        }
      </div>
      {isLoading && <p role="status" className="mt-3 text-sm text-muted-foreground">
        {ar ? 'جاري تحميل الحصة اليومية...' : 'Loading daily allowance...'}
      </p>}
      {isError && <p role="alert" className="mt-3 text-sm text-destructive">
        {ar ? 'تعذر تحميل الحصة اليومية.' : 'Daily allowance unavailable.'}
      </p>}
      {data && !data.Unlimited && (
        <>
          <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-primary/10"
            role="progressbar" aria-valuemin={0} aria-valuemax={data.Limit}
            aria-valuenow={data.Used} aria-label={title}>
            <div className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${Math.min(100, Math.round(data.Used / Math.max(data.Limit, 1) * 100))}%` }} />
          </div>
          <p className="mt-2 text-sm">
            {exhausted
              ? ar
                ? 'خلصت حصة هذا المستوى اليوم. فيك تعيد حل المسائل السابقة.'
                : 'You have used today’s allowance in this stage. Previous questions remain available for practice.'
              : ar
                ? `باقي ${data.Remaining} مسائل جديدة بهذا المستوى اليوم.`
                : `${data.Remaining} new problems remaining in this stage today.`}
          </p>
          <p className="mt-2 inline-flex items-center gap-2 text-xs text-muted-foreground">
            <Clock3 className="h-4 w-4" aria-hidden />
            {ar ? 'تتجدد الحصة منتصف الليل UTC' : 'Resets at midnight UTC'}
            {date ? ` · ${date} UTC` : ''}
          </p>
          {exhausted && (
            <span className="mt-3 inline-flex rounded-xl border border-primary/30 px-4 py-2 text-sm font-semibold text-primary">
              {ar ? 'Premium قريبًا — تواصل مع إدارة المنصة للتفعيل التجريبي' : 'Premium coming soon — contact the admin for test access'}
            </span>
          )}
        </>
      )}
      {data?.Unlimited && (
        <p className="mt-2 text-sm text-muted-foreground">
          {ar ? 'حساب Premium يتيح لك حل مسائل جديدة بلا حد يومي.'
            : 'Your Premium account can solve unlimited new problems.'}
        </p>
      )}
    </section>
  );
}
