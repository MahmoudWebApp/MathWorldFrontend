'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { useSelector } from 'react-redux';
import { Link } from '@/i18n/routing';
import { AlertCircle, ChevronLeft, ChevronRight, Medal, RefreshCw, ShieldCheck, Trophy, Users } from 'lucide-react';
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
  const { data, isLoading, isError, refetch } = useGetStageLeaderboardQuery(
    { stageId: stageId ?? 0, period, page },
    { skip: !isStudent || !stageId, refetchOnMountOrArgChange: true }
  );

  const periodLabel = (value: StageLeaderboardFilter['period']) => {
    if (value === 'all') return ar ? 'كل الوقت' : 'All time';
    if (value === 'weekly') return ar ? 'آخر 7 أيام' : 'Last 7 days';
    return ar ? 'آخر 30 يوماً' : 'Last 30 days';
  };
  const stageTitle = data
    ? (ar ? data.NameAr : data.NameEn)
    : (ar ? stage?.NameAr : stage?.NameEn);
  const pages = data ? Math.max(1, Math.ceil(data.TotalLearners / data.PageSize)) : 1;

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-10" dir={ar ? 'rtl' : 'ltr'}>
      <Link href="/dashboard" className="text-sm font-semibold text-primary hover:underline">
        {ar ? 'العودة للوحة الطالب' : 'Back to dashboard'}
      </Link>
      <header className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-pink-500/10 p-6 sm:p-8">
        <div className="relative z-10 flex flex-wrap items-center gap-4">
          <span className="rounded-2xl bg-primary/10 p-4 text-primary">
            <Trophy className="h-8 w-8" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-3xl font-extrabold">{ar ? 'لوحة المتصدرين' : 'Stage leaderboard'}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
              {ar ? 'ترتيب بحسب المسائل التي تم حلها، ثم النقاط والمحاولات الأولى الصحيحة. هوية الطلاب الآخرين محمية.'
                : 'Ranked by unique solved questions, earned points and first-try accuracy. Other learners remain anonymous.'}
            </p>
          </div>
        </div>
      </header>

      {!isStudent ? (
        <section className="space-y-3 rounded-2xl border bg-card p-6">
          <p>{ar ? 'سجّل الدخول كطالب لرؤية ترتيب مرحلتك.' : 'Sign in as a student to see your stage ranking.'}</p>
          <Link href="/login" className="font-semibold text-primary underline">{ar ? 'تسجيل الدخول' : 'Sign in'}</Link>
        </section>
      ) : loadingStage ? (
        <p role="status" className="py-12 text-center text-muted-foreground">{ar ? 'جارٍ جلب مرحلتك…' : 'Loading your stage…'}</p>
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

          {isLoading ? (
            <p role="status" className="py-12 text-center text-muted-foreground">{ar ? 'جارٍ جلب الترتيب…' : 'Loading rankings…'}</p>
          ) : isError || !data ? (
            <section role="alert" className="space-y-3 rounded-2xl border p-6">
              <p className="text-destructive">{ar ? 'تعذّر جلب الترتيب.' : 'Could not load rankings.'}</p>
              <button onClick={() => void refetch()} className="font-semibold text-primary">{ar ? 'إعادة المحاولة' : 'Retry'}</button>
            </section>
          ) : (
            <section className="overflow-hidden rounded-2xl border bg-card">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b p-5">
                <div className="flex items-center gap-2">
                  <Medal className="h-5 w-5 text-primary" aria-hidden="true" />
                  <h2 className="font-bold">{ar ? 'ترتيب الطلاب' : 'Learner rankings'}</h2>
                </div>
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  <span><Users className="me-1 inline h-4 w-4" aria-hidden="true" />{ar ? 'المشاركون:' : 'Participants:'} {data.TotalLearners}</span>
                  <strong className="text-primary">{ar ? 'ترتيبك:' : 'Your rank:'} {data.MyRank ?? '—'}</strong>
                </div>
              </div>
              {data.Entries.length === 0 ? (
                <div className="px-6 py-16 text-center text-muted-foreground">
                  <Trophy className="mx-auto mb-4 h-9 w-9 opacity-40" aria-hidden="true" />
                  {ar ? 'ما في نتائج لهذه الفترة. حلّ مسائل حتى تظهر بالقائمة.'
                    : 'No results for this period. Solve questions to appear here.'}
                </div>
              ) : (
                <ol className="divide-y">
                  {data.Entries.map(entry => (
                    <li key={entry.Rank} className={`flex flex-wrap items-center gap-3 px-4 py-4 sm:gap-5 sm:px-6 ${entry.IsCurrentUser ? 'bg-primary/5' : ''}`}>
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border bg-muted/50 text-lg font-extrabold tabular-nums">
                        {entry.Rank <= 3 ? <Medal className="h-6 w-6 text-primary" aria-hidden="true" /> : entry.Rank}
                      </span>
                      <div className="min-w-0 flex-1">
                        <strong className="block truncate text-base">{entry.IsCurrentUser
                          ? (ar ? 'أنت' : 'You')
                          : (ar ? `طالب #${entry.Rank}` : `Learner #${entry.Rank}`)}</strong>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {ar ? 'صحيحة من أول محاولة:' : 'First-try correct:'} {entry.FirstTryCorrect}
                        </p>
                      </div>
                      <div className="text-end">
                        <strong className="block text-sm text-primary">{entry.SolvedProblems} {ar ? 'مسألة' : 'solved'}</strong>
                        <span className="text-xs text-muted-foreground">{entry.Points} {ar ? 'نقطة' : 'points'}</span>
                      </div>
                    </li>
                  ))}
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
              <p className="flex items-center gap-2 border-t bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
                {ar ? 'لا نعرض أسماء أو بريد الطلاب الآخرين. الترتيب يتحدد من محاولات مسجلة على الخادم.'
                  : 'Other learners’ names and emails are never shown. Scores come from server-recorded attempts.'}
              </p>
            </section>
          )}
        </>
      )}
    </main>
  );
}
