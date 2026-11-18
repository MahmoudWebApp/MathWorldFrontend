'use client';

import { useLocale } from 'next-intl';
import { CheckCircle2, LockKeyhole, Medal, RefreshCw, Sparkles } from 'lucide-react';
import { useGetAchievementsQuery } from '@/store/api/usersApi';

export function StudentAchievementsPanel() {
  const ar = useLocale() === 'ar';
  const { data, isLoading, isError, refetch } = useGetAchievementsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  return (
    <section className="mb-8 space-y-4 rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/5 via-card to-pink-500/5 p-5 sm:p-7">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="rounded-2xl bg-primary/10 p-3 text-primary">
            <Medal className="h-6 w-6" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-xl font-extrabold">{ar ? 'شارات إنجازاتي' : 'My math badges'}</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {ar ? 'تُحتسب من المسائل المختلفة المحلولة فعلياً.' : 'Earned from uniquely solved math questions.'}
            </p>
          </div>
        </div>
        {data && <span className="rounded-full border border-primary/20 bg-background px-3 py-2 text-sm font-bold text-primary">
          {data.EarnedCount} / {data.TotalBadges}
        </span>}
      </header>
      {isLoading ? (
        <p role="status" className="py-5 text-center text-muted-foreground">
          {ar ? 'جارٍ تحميل الشارات…' : 'Loading badges…'}
        </p>
      ) : isError || !data ? (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4 text-sm">
          {ar ? 'تعذّر تحميل الشارات.' : 'Could not load badges.'}
          <button type="button" className="font-semibold text-primary" onClick={() => void refetch()}>
            <RefreshCw className="me-2 inline h-4 w-4" />{ar ? 'إعادة المحاولة' : 'Retry'}
          </button>
        </div>
      ) : (
        <>
          {data.NextMilestone !== null && <p className="text-sm text-muted-foreground">
            <Sparkles className="me-2 inline h-4 w-4 text-primary" aria-hidden="true" />
            {ar ? `حللت ${data.UniqueSolved} مسألة. الشارة القادمة عند ${data.NextMilestone}.`
              : `You have solved ${data.UniqueSolved} unique problems. Next badge at ${data.NextMilestone}.`}
          </p>}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {data.Badges.map(badge => (
              <article key={badge.Key}
                className={`rounded-2xl border p-3 text-center transition-colors ${badge.Earned ? 'border-primary/25 bg-primary/10' : 'border-border bg-muted/20'}`}>
                <span className={`mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full ${badge.Earned ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  {badge.Earned ? <CheckCircle2 className="h-6 w-6" aria-label={ar ? 'مكتسبة' : 'Earned'} />
                    : <LockKeyhole className="h-5 w-5" aria-label={ar ? 'مقفلة' : 'Locked'} />}
                </span>
                <strong className="block text-sm">{ar ? badge.TitleAr : badge.TitleEn}</strong>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {badge.CurrentProgress} / {badge.RequiredSolved}
                </span>
                <div role="progressbar" aria-label={ar ? badge.TitleAr : badge.TitleEn}
                  aria-valuemin={0} aria-valuemax={badge.RequiredSolved}
                  aria-valuenow={badge.CurrentProgress}
                  className="mt-2 h-1.5 overflow-hidden rounded-full bg-primary/10">
                  <div className="h-full rounded-full bg-primary"
                    style={{ width: `${100 * badge.CurrentProgress / badge.RequiredSolved}%` }} />
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
