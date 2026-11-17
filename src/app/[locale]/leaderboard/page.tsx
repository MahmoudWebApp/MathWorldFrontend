'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { useSelector } from 'react-redux';
import { ChevronLeft, ChevronRight, Medal, RefreshCw, Trophy, Users } from 'lucide-react';

import { Link } from '@/i18n/routing';
import type { RootState } from '@/store';
import { useGetLeaderboardQuery, type LeaderboardPeriod } from '@/store/api/usersApi';

export default function StageLeaderboardPage() {
  const ar = useLocale() === 'ar';
  const stageId = useSelector((state: RootState) => state.auth.user?.CurrentStageId);
  const [period, setPeriod] = useState<LeaderboardPeriod>('all');
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching, isError, refetch } = useGetLeaderboardQuery(
    { StageId: stageId ?? 0, Period: period, Page: page },
    { skip: !stageId, refetchOnMountOrArgChange: true },
  );

  const periodOptions: { key: LeaderboardPeriod; arLabel: string; enLabel: string }[] = [
    { key: 'all', arLabel: 'كل الوقت', enLabel: 'All time' },
    { key: 'weekly', arLabel: 'هذا الأسبوع', enLabel: 'This week' },
    { key: 'monthly', arLabel: 'هذا الشهر', enLabel: 'This month' },
  ];
  const format = (value: number) =>
    new Intl.NumberFormat(ar ? 'ar' : 'en').format(value);

  return (
    <main className="container mx-auto max-w-4xl space-y-6 px-4 py-8 md:px-8">
      <header className="space-y-3">
        <Link href="/dashboard" className="text-sm font-semibold text-primary hover:underline">
          {ar ? 'العودة لرحلتي' : 'Back to my journey'}
        </Link>
        <h1 className="flex items-center gap-3 text-2xl font-bold md:text-3xl">
          <Trophy className="h-7 w-7 text-primary" aria-hidden="true" />
          {ar ? 'متفوقو المرحلة' : 'Stage leaderboard'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {ar
            ? 'ترتيب الطلاب حسب المسائل المحلولة في مرحلتك؛ إعادة المحاولة لا تضيف مسألة جديدة للترتيب.'
            : 'Stage rankings use uniquely solved problems; retries do not add new solved-problem credits.'}
        </p>
      </header>

      {!stageId ? (
        <section className="math-card rounded-2xl border border-border p-6">
          <h2 className="font-bold">
            {ar ? 'اختر مرحلتك لتشوف ترتيبك' : 'Select your stage to see your rank'}
          </h2>
          <p className="my-3 text-sm text-muted-foreground">
            {ar
              ? 'هيك بتقارن تقدمك مع طلاب نفس المرحلة، بدون ما يضيع أي حل سابق.'
              : 'Compare progress with learners in your stage without losing previous work.'}
          </p>
          <Link href="/learning-stage"
            className="inline-flex rounded-xl bg-primary px-4 py-2 font-semibold text-primary-foreground">
            {ar ? 'اختيار المرحلة' : 'Choose a stage'}
          </Link>
        </section>
      ) : (
        <>
          <section className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2" role="group"
              aria-label={ar ? 'فترة الترتيب' : 'Leaderboard period'}>
              {periodOptions.map(option => (
                <button
                  type="button"
                  key={option.key}
                  aria-pressed={period === option.key}
                  onClick={() => { setPeriod(option.key); setPage(1); }}
                  className={`rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${period === option.key
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card hover:bg-muted'}`}
                >
                  {ar ? option.arLabel : option.enLabel}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => void refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm font-semibold disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} aria-hidden="true" />
              {ar ? 'تحديث' : 'Refresh'}
            </button>
          </section>

          {isError && (
            <section role="alert" className="math-card rounded-2xl border border-destructive/30 p-5">
              <p className="text-sm text-destructive">
                {ar ? 'تعذر تحميل ترتيب الطلاب. أعد المحاولة.' : 'Could not load rankings. Please retry.'}
              </p>
              <button onClick={() => void refetch()} type="button"
                className="mt-3 text-sm font-semibold text-primary underline">
                {ar ? 'إعادة المحاولة' : 'Try again'}
              </button>
            </section>
          )}
          {isLoading && !data && (
            <p role="status" className="math-card rounded-2xl border border-border p-6 text-center text-muted-foreground">
              {ar ? 'جارٍ تحميل الترتيب...' : 'Loading rankings...'}
            </p>
          )}

          {data && (
            <>
              <section className="math-card grid gap-4 rounded-2xl border border-border p-5 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {ar ? 'مرحلتي' : 'My learning stage'}
                  </p>
                  <h2 className="mt-1 text-lg font-bold">
                    {ar ? data.NameAr : data.NameEn}
                  </h2>
                </div>
                <div className="flex flex-wrap gap-5 sm:justify-end">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {ar ? 'ترتيبي' : 'My rank'}
                    </p>
                    <strong className="text-2xl font-bold text-primary">
                      {data.MyRank == null ? '—' : format(data.MyRank)}
                    </strong>
                  </div>
                  <div>
                    <p className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" aria-hidden="true" />
                      {ar ? 'عدد الطلاب' : 'Learners'}
                    </p>
                    <strong className="text-2xl font-bold">{format(data.TotalLearners)}</strong>
                  </div>
                </div>
              </section>

              {data.Entries.length === 0 ? (
                <section className="math-card rounded-2xl border border-border p-6 text-center">
                  <Medal className="mx-auto h-9 w-9 text-primary" aria-hidden="true" />
                  <h2 className="mt-3 font-bold">
                    {ar ? 'ما في نتائج ضمن الفترة المختارة' : 'No rankings for this period'}
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {ar
                      ? 'ابدأ بحل مسائل مرحلتك؛ ترتيبك رح يظهر هون.'
                      : 'Solve problems in your stage to build your rank.'}
                  </p>
                  <Link href={`/stages/${stageId}`}
                    className="mt-4 inline-flex rounded-xl bg-primary px-4 py-2 font-semibold text-primary-foreground">
                    {ar ? 'ابدأ حل المسائل' : 'Start solving'}
                  </Link>
                </section>
              ) : (
                <section className="space-y-2" aria-label={ar ? 'قائمة المتفوقين' : 'Ranking list'}>
                  {data.Entries.map(entry => (
                    <article key={entry.Rank}
                      className={`math-card flex items-center gap-3 rounded-2xl border p-4 ${entry.IsCurrentUser
                        ? 'border-primary/50 bg-primary/5' : 'border-border'}`}>
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-bold text-primary">
                        {format(entry.Rank)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-bold">{entry.DisplayName}</h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {format(entry.SolvedProblems)} {ar ? 'مسألة محلولة' : 'solved'}
                          {' · '}{format(entry.Points)} {ar ? 'نقطة' : 'points'}
                        </p>
                      </div>
                      {entry.IsCurrentUser && (
                        <span className="shrink-0 text-sm font-semibold text-primary">
                          {ar ? 'أنت' : 'You'}
                        </span>
                      )}
                    </article>
                  ))}
                </section>
              )}

              {data.TotalLearners > data.PageSize && (
                <nav className="flex items-center justify-center gap-4" aria-label={ar ? 'صفحات الترتيب' : 'Ranking pages'}>
                  <button type="button" onClick={() => setPage(value => Math.max(1, value - 1))}
                    disabled={page === 1}
                    className="inline-flex items-center gap-1 rounded-xl border border-border px-3 py-2 text-sm disabled:opacity-40">
                    <ChevronLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
                    {ar ? 'السابق' : 'Previous'}
                  </button>
                  <span className="text-sm tabular-nums">{format(page)}</span>
                  <button type="button" onClick={() => setPage(value => value + 1)}
                    disabled={page * data.PageSize >= data.TotalLearners}
                    className="inline-flex items-center gap-1 rounded-xl border border-border px-3 py-2 text-sm disabled:opacity-40">
                    {ar ? 'التالي' : 'Next'}
                    <ChevronRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
                  </button>
                </nav>
              )}
            </>
          )}
        </>
      )}
    </main>
  );
}
