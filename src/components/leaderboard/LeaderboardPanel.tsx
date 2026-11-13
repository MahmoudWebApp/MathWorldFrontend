'use client';

import { useLocale } from 'next-intl';
import { Trophy, Medal, UsersRound } from 'lucide-react';
import type { LeaderboardData, LeaderboardQuery } from '@/store/api/usersApi';

type Period = LeaderboardQuery['Period'];

export function LeaderboardPanel({
  data,
  isLoading,
  isError,
  period,
  setPeriod,
  page,
  setPage,
}: {
  data?: LeaderboardData;
  isLoading: boolean;
  isError: boolean;
  period: Period;
  setPeriod: (period: Period) => void;
  page: number;
  setPage: (page: number) => void;
}) {
  const isArabic = useLocale() === 'ar';
  const labels = isArabic
    ? {
        title: 'ترتيب المتفوقين', detail: 'الترتيب حسب عدد المسائل المختلفة المحلولة، ثم النقاط والإجابات الصحيحة من أول محاولة.',
        all: 'كل الوقت', weekly: 'هذا الأسبوع', monthly: 'هذا الشهر',
        rank: 'الترتيب', learner: 'الطالب', solved: 'مسائل محلولة', points: 'النقاط',
        accurate: 'صحيح من أول محاولة', you: 'ترتيبك', empty: 'لا توجد حلول ضمن هذه الفترة بعد.',
        error: 'تعذر تحميل الترتيب. حاول مجددًا.', loading: 'جاري تحميل الترتيب...',
        prev: 'السابق', next: 'التالي', privacy: 'نُخفي أسماء الطلاب احترامًا للخصوصية.',
      }
    : {
        title: 'Stage leaderboard', detail: 'Ranked by distinct solved problems, then earned points and first-try accuracy.',
        all: 'All time', weekly: 'This week', monthly: 'This month',
        rank: 'Rank', learner: 'Learner', solved: 'Solved', points: 'Points',
        accurate: 'First-try correct', you: 'Your rank', empty: 'No awarded solves in this period yet.',
        error: 'Could not load the leaderboard. Please retry.', loading: 'Loading leaderboard...',
        prev: 'Previous', next: 'Next', privacy: 'Learner names are hidden to protect privacy.',
      };
  const tabs: { value: Period; title: string }[] = [
    { value: 'all', title: labels.all },
    { value: 'weekly', title: labels.weekly },
    { value: 'monthly', title: labels.monthly },
  ];
  const maxPage = Math.max(1, Math.ceil((data?.TotalLearners ?? 0) / 20));

  return (
    <section className="math-card rounded-3xl border border-primary/15 bg-card p-5 md:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <Trophy className="h-6 w-6 text-primary" aria-hidden />
            {labels.title}
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{labels.detail}</p>
        </div>
        {data?.MyRank != null && (
          <div className="inline-flex items-center gap-2 rounded-xl bg-primary/10 px-4 py-3 font-bold text-primary">
            <Medal className="h-5 w-5" aria-hidden />
            {labels.you}: #{data.MyRank}
          </div>
        )}
      </div>
      <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label={labels.title}>
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            aria-pressed={period === tab.value}
            onClick={() => { setPage(1); setPeriod(tab.value); }}
            className={`rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
              period === tab.value
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border hover:border-primary/50'
            }`}
          >
            {tab.title}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div role="status" className="mt-8 py-10 text-center text-muted-foreground">{labels.loading}</div>
      ) : isError ? (
        <div role="alert" className="mt-8 rounded-xl border border-destructive/30 p-5 text-center text-destructive">{labels.error}</div>
      ) : !data || data.Entries.length === 0 ? (
        <div className="mt-8 flex flex-col items-center gap-3 py-10 text-muted-foreground">
          <UsersRound className="h-10 w-10" aria-hidden />
          {labels.empty}
        </div>
      ) : (
        <>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-border">
            <table className="w-full min-w-[550px] text-start text-sm">
              <thead className="bg-muted/40">
                <tr>
                  {[labels.rank, labels.learner, labels.solved, labels.points, labels.accurate].map((name) => (
                    <th key={name} scope="col" className="px-4 py-3 text-start font-semibold">{name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.Entries.map((entry) => (
                  <tr
                    key={`${entry.Rank}-${entry.UserId ?? 'anonymous'}`}
                    className={`border-t border-border ${
                      entry.IsCurrentUser ? 'bg-primary/10 font-semibold' : ''
                    }`}
                  >
                    <td className="px-4 py-3 font-bold tabular-nums">#{entry.Rank}</td>
                    <td className="px-4 py-3">{entry.DisplayName}</td>
                    <td className="px-4 py-3 tabular-nums">{entry.SolvedProblems}</td>
                    <td className="px-4 py-3 tabular-nums">{entry.Points}</td>
                    <td className="px-4 py-3 tabular-nums">{entry.FirstTryCorrect}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-center justify-between gap-3 text-sm">
            <span className="text-muted-foreground">{page} / {maxPage}</span>
            <div className="flex gap-2">
              <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)}
                className="rounded-lg border border-border px-3 py-2 disabled:opacity-40">{labels.prev}</button>
              <button type="button" disabled={page >= maxPage} onClick={() => setPage(page + 1)}
                className="rounded-lg border border-border px-3 py-2 disabled:opacity-40">{labels.next}</button>
            </div>
          </div>
        </>
      )}
      {!isLoading && !isError && !data?.Entries.some((entry) => entry.UserId != null) && (
        <p className="mt-5 text-xs text-muted-foreground">{labels.privacy}</p>
      )}
    </section>
  );
}
