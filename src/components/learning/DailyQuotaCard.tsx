'use client';

import { useLocale } from 'next-intl';
import { Infinity } from 'lucide-react';
import { useGetDailyQuotaQuery } from '@/store/api/usersApi';

/** Daily limits were retired: every account can practice without a daily cap. */
export function DailyQuotaCard({
  stageId,
  compact = false,
}: {
  stageId: number | null | undefined;
  compact?: boolean;
}) {
  const ar = useLocale() === 'ar';
  const { data } = useGetDailyQuotaQuery(stageId ?? 0, {
    skip: stageId == null || stageId <= 0,
    refetchOnMountOrArgChange: true,
  });

  if (stageId == null || stageId <= 0) return null;

  return (
    <section
      className={`rounded-2xl border border-primary/20 bg-primary/5 ${compact ? 'p-4' : 'p-5'}`}
      aria-label={ar ? 'حل مسائل بلا حدود' : 'Unlimited practice'}
    >
      <div className="flex items-center gap-3">
        <span className="rounded-xl bg-primary/10 p-2.5 text-primary">
          <Infinity className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <h3 className="font-bold">
            {ar ? 'حل مسائل بلا حدود' : 'Unlimited practice'}
          </h3>
          {data && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {ar ? data.NameAr : data.NameEn}
            </p>
          )}
          <p className="mt-1 text-sm text-muted-foreground">
            {ar
              ? 'حل أي عدد من المسائل في الفئات المتاحة لحسابك، بدون حد يومي.'
              : 'Solve as many problems as you like in your available categories, with no daily limit.'}
          </p>
        </div>
      </div>
    </section>
  );
}
