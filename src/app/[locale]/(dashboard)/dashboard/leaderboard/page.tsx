'use client';

import { WorkspacePageHeader } from '@/components/ui/WorkspacePageHeader';
import { MathWorldLoading } from '@/components/ui/MathWorldLoading';
import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { useSelector } from 'react-redux';
import { Link } from '@/i18n/routing';
import { AlertCircle, ChevronLeft, ChevronRight, Medal, RefreshCw, Trophy, Users } from 'lucide-react';
import {
  useGetLearningStageQuery,
  useGetStageLeaderboardQuery,
  type StageLeaderboardFilter,
} from '@/store/api/usersApi';

const PERIODS: StageLeaderboardFilter['period'][] = ['all', 'weekly', 'monthly'];

export default function StudentLeaderboardPage() {
  const ar = useLocale() === 'ar';
  const isStudent = useSelector(
    (state: { auth: { isAuthenticated: boolean; user: { Role?: string } | null } }) =>
      state.auth.isAuthenticated && state.auth.user?.Role === 'Student'
  );
  const [period, setPeriod] = useState<StageLeaderboardFilter['period']>('all');
  const [page, setPage] = useState(1);
  const { data: stage, isLoading: loadingStage, isError: stageError, refetch: reloadStage } =
    useGetLearningStageQuery(undefined, { skip: !isStudent });
  const stageId = stage?.StageId;
  const { currentData: data, isLoading, isFetching, isError, refetch } = useGetStageLeaderboardQuery(
    { stageId: stageId ?? 0, period, page },
    { skip: !isStudent || !stageId, refetchOnMountOrArgChange: 45,
      refetchOnFocus: true, refetchOnReconnect: true }
  );

  const periodLabel = (value: StageLeaderboardFilter['period']) => {
    if (value === 'all') return ar ? 'كل الوقت' : 'All time';
    if (value === 'weekly') return ar ? 'آخر 7 أيام' : 'Last 7 days';
    return ar ? 'آخر 30 يوماً' : 'Last 30 days';
  };
  const stageTitle = data
    ? (ar ? data.NameAr : data.NameEn)
    : (ar ? stage?.NameAr : stage?.NameEn);
  const pages = data ? Math.max(1, Math.ceil(data.TotalLearners / Math.max(1, data.PageSize))) : 1;

  // A previously valid page can become empty after a period change or
  // updated ranking. Recover instead of telling the learner no one ranked.
  useEffect(() => {
    if (data && data.TotalLearners > 0 && page > pages) {
      setPage(1);
    }
  }, [data, page, pages]);

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-10" dir={ar ? 'rtl' : 'ltr'}>
      <WorkspacePageHeader title={ar?'المتفوقون':'Leaderboard'} icon={Trophy}/>

      {!isStudent ? (
        <section className="space-y-3 rounded-2xl border bg-card p-6">
          <p>{ar ? 'سجّل الدخول كطالب لرؤية ترتيب مرحلتك.' : 'Sign in as a student to see your stage ranking.'}</p>
          <Link href="/login" className="font-semibold text-primary underline">{ar ? 'تسجيل الدخول' : 'Sign in'}</Link>
        </section>
      ) : loadingStage ? (
        <MathWorldLoading compact />
      ) : stageError ? (
        <section role="alert" className="rounded-2xl border p-6">
          <AlertCircle className="mb-2 h-6 w-6 text-destructive" />
          <p>{ar ? 'تعذّر تحميل المرحلة التعليمية.' : 'Could not load your learning stage.'}</p>
          <button className="mt-3 font-semibold text-primary" onClick={() => void reloadStage()}>
            <RefreshCw className="me-2 inline h-4 w-4" />{ar ? 'إعادة المحاولة' : 'Retry'}
          </button>
        </section>
      ) : !stageId ? (
        <section className="space-y-3 rounded-2xl border p-6">
          <p>{ar ? 'اختَر مرحلتك التعليمية أولاً حتى يظهر ترتيب الطلاب بنفس المرحلة.'
            : 'Choose your learning stage first to see classmates in that stage.'}</p>
          <Link href="/learning-stage" className="font-semibold text-primary underline">
            {ar ? 'اختيار المرحلة' : 'Choose a stage'}
          </Link>
        </section>
      ) : (
        <>
          <section className="rounded-2xl border bg-card p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-muted-foreground">{ar ? 'مرحلتك الحالية' : 'Your selected stage'}</p>
                <h2 className="mt-1 text-xl font-extrabold">{stageTitle}</h2>
              </div>
              <div className="flex flex-wrap gap-2" role="group" aria-label={ar ? 'فترة الترتيب' : 'Ranking period'}>
                {PERIODS.map(value => (
                  <button key={value} type="button" aria-pressed={period === value}
                    onClick={() => { setPeriod(value); setPage(1); }}
                    className={`rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${period === value ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:bg-muted'}`}>
                    {periodLabel(value)}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {isLoading || (isFetching && !data) ? (
            <MathWorldLoading compact />
          ) : isError || !data ? (
            <section role="alert" className="space-y-3 rounded-2xl border p-6">
              <p className="text-destructive">{ar ? 'تعذّر جلب الترتيب.' : 'Could not load rankings.'}</p>
              <button onClick={() => void refetch()} className="font-semibold text-primary">{ar ? 'إعادة المحاولة' : 'Retry'}</button>
            </section>
          ) : (
            <section className="overflow-hidden rounded-2xl border bg-card">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b p-5">
                <div className="flex items-center gap-2">
                  <Medal className="h-5 w-5 mw-reward-icon" aria-hidden="true" />
                  <h2 className="font-bold">{ar ? 'ترتيب الطلاب' : 'Learner rankings'}</h2>
                </div>
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  <span><Users className="me-1 inline h-4 w-4" aria-hidden="true" />{ar ? 'طلاب حلّوا:' : 'Ranked solvers:'} {data.TotalLearners}</span>
                  {data.StageParticipants != null && (
                    <span>{ar ? 'طلاب المرحلة:' : 'Stage learners:'} {data.StageParticipants}</span>
                  )}
                  <strong className="text-primary">{ar ? 'ترتيبك:' : 'Your rank:'} {data.MyRank ?? '—'}</strong>

                </div>
              </div>
              {data.Entries.length === 0 ? (
                <div className="px-6 py-16 text-center text-muted-foreground">
                  <Trophy className="mx-auto mb-4 h-9 w-9 opacity-40" aria-hidden="true" />
                  <p>{data.StageParticipants != null && data.StageParticipants > 0
                    ? (ar
                      ? `يوجد ${data.StageParticipants} طالب في مرحلتك، لكن لا توجد حلول مسجلة بهذه الفترة. حلّ مسألة لتظهر ضمن المتفوقين.`
                      : `${data.StageParticipants} learners have selected this stage, but nobody has a recorded solve in this period. Solve a question to join the rankings.`)
                    : (ar
                      ? 'ما في نتائج لهذه الفترة. حلّ مسائل حتى تظهر بالقائمة.'
                      : 'No results for this period. Solve questions to appear here.')}</p>
                  <Link href="/dashboard/categories"
                    className="mt-4 inline-flex min-h-10 items-center rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
                    {ar ? 'انتقل لفئات مرحلتي' : 'Browse my stage topics'}
                  </Link>
                </div>
              ) : (
                <ol className="space-y-2 p-3 sm:p-4">
                  {data.Entries.map(entry => {
                    const podium =
                      entry.Rank === 1 ? {
                        row: 'border-reward-gold/50 bg-reward-gold/10',
                        badge: 'border-reward-gold/50 bg-reward-gold/20 mw-reward',
                        label: ar ? 'المركز الأول' : 'First place',
                      } : entry.Rank === 2 ? {
                        row: 'border-slate-300 bg-slate-100 dark:border-slate-400/40 dark:bg-slate-300/10',
                        badge: 'border-slate-400/40 bg-slate-200 text-slate-800 dark:bg-slate-300/25 dark:text-slate-100',
                        label: ar ? 'المركز الثاني' : 'Second place',
                      } : entry.Rank === 3 ? {
                        row: 'border-orange-500/40 bg-orange-50 dark:border-orange-500/40 dark:bg-orange-500/10',
                        badge: 'border-orange-600/40 bg-orange-200 text-orange-900 dark:bg-orange-500/25 dark:text-orange-200',
                        label: ar ? 'المركز الثالث' : 'Third place',
                      } : {
                        row: 'border-border/70 bg-muted/20',
                        badge: 'border-border bg-muted/60 text-foreground',
                        label: ar ? `المركز ${entry.Rank}` : `Rank ${entry.Rank}`,
                      };
                    return (
                      <li key={entry.Rank}
                        aria-label={`${podium.label}، ${entry.IsCurrentUser ? (ar ? 'ترتيبك' : 'Your ranking') : entry.DisplayName}`}
                        className={`flex flex-wrap items-center gap-3 rounded-2xl border px-3 py-4 transition-colors sm:gap-5 sm:px-5 ${entry.IsCurrentUser
                          ? 'border-violet-500/60 bg-violet-100 ring-2 ring-violet-500/20 dark:border-violet-400/60 dark:bg-violet-400/15 dark:ring-violet-300/20'
                          : podium.row}`}>
                        <span className={`flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl border font-extrabold tabular-nums ${podium.badge}`}
                          title={podium.label}>
                          {entry.Rank <= 3 && <Medal className="h-5 w-5" aria-hidden="true" />}
                          <span className={entry.Rank <= 3 ? 'text-xs leading-4' : 'text-lg'}>{entry.Rank}</span>
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <strong className="min-w-0 break-words text-base">{entry.DisplayName}</strong>
                            {entry.IsCurrentUser && (
                              <span className="shrink-0 rounded-full bg-violet-700 px-2.5 py-0.5 text-xs font-bold text-white dark:bg-violet-300 dark:text-violet-950">
                                {ar ? 'ترتيبك' : 'Your ranking'}
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {ar ? 'صحيحة من أول محاولة:' : 'First-try correct:'} {entry.FirstTryCorrect}
                          </p>
                        </div>
                        <div className="text-end">
                          <strong className="block text-sm text-foreground">{entry.SolvedProblems} {ar ? 'مسألة' : 'solved'}</strong>
                          <span className="text-xs font-semibold mw-reward">{entry.Points} {ar ? 'نقطة' : 'points'}</span>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}
              <div className="flex items-center justify-between gap-3 border-t p-4 text-sm">
                <button disabled={page <= 1} onClick={() => setPage(n => n - 1)}
                  className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 font-semibold disabled:opacity-40">
                  {ar ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                  {ar ? 'السابق' : 'Previous'}
                </button>
                <span className="font-semibold">{page} / {pages}</span>
                <button disabled={page >= pages} onClick={() => setPage(n => n + 1)}
                  className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 font-semibold disabled:opacity-40">
                  {ar ? 'التالي' : 'Next'}
                  {ar ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
              </div>

            </section>
          )}
        </>
      )}
    </main>
  );
}
