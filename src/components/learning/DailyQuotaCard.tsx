'use client';

import { useLocale } from 'next-intl';
import { Crown, Infinity } from 'lucide-react';
import { useGetStudentEntitlementQuery } from '@/store/api/usersApi';

/** Legacy component name retained for existing imports. There is no daily cap. */
export function DailyQuotaCard({
  stageId,
  compact = false,
}: {
  stageId: number | null | undefined;
  compact?: boolean;
}) {
  const ar = useLocale() === 'ar';
  // Legacy component name, but access comes from the real subscription
  // endpoint. A daily quota must never block Free practice.
  const { data, isLoading } = useGetStudentEntitlementQuery(undefined, {
    skip: stageId == null || stageId <= 0,
  });
  if (stageId == null || stageId <= 0) return null;

  const premium = data?.IsPremium === true;
  const title = ar ? 'الممارسة بلا حد يومي' : 'Unlimited daily practice';

  return (
    <section
      aria-label={title}
      className={`rounded-2xl border border-primary/20 bg-primary/5 ${compact ? 'p-4' : 'p-5'}`}
    >
      <div className="flex items-start gap-3">
        <span className="rounded-xl bg-primary/10 p-2.5 text-primary">
          {premium ? <Crown className="h-5 w-5" aria-hidden /> : <Infinity className="h-5 w-5" aria-hidden />}
        </span>
        <div className="space-y-2">
          <h3 className="font-bold">{title}</h3>
          {isLoading && <p role="status" className="text-sm text-muted-foreground">
            {ar ? 'جارٍ التحقق من صلاحياتك…' : 'Checking your access…'}
          </p>}
          <p className="text-sm">
            {premium
              ? (ar ? 'Premium: جميع الفئات مفتوحة، ويمكنك حل أي عدد من المسائل.'
                : 'Premium: every category is unlocked with unlimited questions.')
              : (ar ? 'مجاني: يمكنك حل أي عدد من المسائل ضمن الفئتين المفتوحتين بهذه المرحلة.'
                : 'Free: solve unlimited questions in two unlocked categories in this stage.')}
          </p>
        </div>
      </div>
    </section>
  );
}
