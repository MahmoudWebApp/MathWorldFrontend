'use client';

import { MathWorldLoading } from '@/components/ui/MathWorldLoading';
import { useLocale } from 'next-intl';
import { CheckCircle2, LockKeyhole, Medal, RefreshCw, Sparkles } from 'lucide-react';
import { useGetAchievementsQuery } from '@/store/api/usersApi';
import { LockedPremiumDialog } from '@/components/premium/LockedPremiumDialog';
import { Link } from '@/i18n/routing';

export function StudentAchievementsPanel({ compact = false }: { compact?: boolean }) {
  const ar = useLocale() === 'ar';
  const { data, isLoading, isError, refetch } = useGetAchievementsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  // The API sends all badges. Availability is an entitlement, not visibility:
  // Free learners must still see Premium milestones, but cannot earn them.
  const available = data?.Badges.filter(badge => badge.IsAvailable) ?? [];
  const premiumLocked = data?.Badges.filter(badge => !badge.IsAvailable) ?? [];
  const displayed = compact
    ? [...available.slice(0, 2), ...premiumLocked.slice(0, 2)]
    : (data?.Badges ?? []);

  return (
    <section className="space-y-4 rounded-3xl border border-primary/15 bg-card p-5 sm:p-6">
      <header className="flex items-center justify-between gap-3 border-b border-border/60 pb-4">
        {compact?<h2 className="text-lg font-extrabold">{ar?'الشارات والإنجازات':'Badges & achievements'}</h2>:<h1 className="text-gradient-math text-2xl font-extrabold sm:text-3xl">{ar?'الشارات والإنجازات':'Badges & achievements'}</h1>}
        <span className="flex shrink-0 items-center gap-2 rounded-xl bg-reward-gold/10 px-3 py-2 mw-reward">
          {data&&<strong dir="ltr" className="tabular-nums" aria-label={ar?'الشارات المكتسبة من المتاحة':'Earned out of available badges'}>{data.EarnedCount} / {available.length}</strong>}
          <Medal className="h-6 w-6 mw-reward-icon" aria-hidden="true"/>
        </span>
      </header>

      {isLoading ? (
        <MathWorldLoading compact mode="tab"/>
      ) : isError || !data ? (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4 text-sm">
          {ar ? 'تعذّر تحميل الشارات.' : 'Could not load badges.'}
          <button type="button" className="font-semibold text-primary" onClick={() => void refetch()}>
            <RefreshCw className="me-2 inline h-4 w-4" />{ar ? 'إعادة المحاولة' : 'Retry'}
          </button>
        </div>
      ) : (
        <>
          {!compact && data.NextMilestone !== null && <p className="text-sm text-muted-foreground">
            <Sparkles className="me-2 inline h-4 w-4 text-primary" aria-hidden="true" />
            {ar ? `الشارة القادمة عند حل ${data.NextMilestone} مسألة مختلفة.`
              : `Your next badge unlocks at ${data.NextMilestone} unique solved problems.`}
          </p>}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {displayed.map(badge => {
              const name = ar ? badge.TitleAr : badge.TitleEn;
              const locked = !badge.IsAvailable;
              const card = (
                <div className={`flex h-full min-h-32 flex-col items-center rounded-2xl border p-3 text-center ${locked
                  ? 'border-border bg-muted/20 text-muted-foreground'
                  : badge.Earned
                    ? 'border-reward-gold/60 bg-reward-gold/5'
                    : 'border-border bg-card'}`}>
                  <span className={`mb-2 flex h-10 w-10 items-center justify-center rounded-full ${badge.Earned && !locked
                    ? 'bg-reward-gold/15 mw-reward'
                    : 'bg-reward-gold/10 mw-reward'}`}>
                    {locked ? <LockKeyhole className="h-5 w-5 mw-reward-icon" aria-hidden="true" />
                      : badge.Earned ? <CheckCircle2 className="h-5 w-5 mw-reward-icon" aria-hidden="true" />
                      : <Medal className="h-5 w-5 mw-reward-icon" aria-hidden="true" />}
                  </span>
                  <strong className="text-sm">{name}</strong>
                  {locked ? (
                    <span className="mt-auto pt-2 text-xs font-semibold text-primary">
                      {ar ? 'Premium · مقفولة' : 'Premium · Locked'}
                    </span>
                  ) : (
                    <>
                      <span dir="ltr" className="mt-auto pt-2 text-xs tabular-nums">{badge.CurrentProgress} / {badge.RequiredSolved}</span>
                      <div role="progressbar" aria-label={name}
                        aria-valuemin={0} aria-valuemax={badge.RequiredSolved}
                        aria-valuenow={badge.CurrentProgress}
                        className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div className={'h-full rounded-full '+(badge.Earned?'bg-emerald-500':'bg-amber-500')}
                          style={{ width: `${badge.RequiredSolved > 0 ? Math.min(100, 100 * badge.CurrentProgress / badge.RequiredSolved) : 0}%` }} />
                      </div>
                    </>
                  )}
                </div>
              );
              return locked ? (
                <LockedPremiumDialog key={badge.Key} featureName={name}>
                  <button type="button" className="block h-full w-full rounded-2xl text-start focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    aria-label={ar ? `${name} — شارة Premium مقفولة` : `${name} — locked Premium badge`}>
                    {card}
                  </button>
                </LockedPremiumDialog>
              ) : <article key={badge.Key}>{card}</article>;
            })}
          </div>
          {compact && <Link href="/dashboard/achievements" className="inline-flex min-h-10 items-center text-sm font-bold text-primary hover:underline">
            {ar ? 'عرض جميع الشارات' : 'View all badges'}
          </Link>}
          {!compact && premiumLocked.length > 0 && <p className="text-xs text-muted-foreground">
            {ar ? 'يمكنك رؤية شارات Premium قبل الترقية، لكنها لا تُحتسب ضمن إنجازاتك المتاحة.'
              : 'Premium badges stay visible before upgrading but do not count as available achievements.'}
          </p>}
        </>
      )}
    </section>
  );
}
