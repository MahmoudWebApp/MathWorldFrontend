'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { LeaderboardPanel } from '@/components/leaderboard/LeaderboardPanel';
import {
  useGetDashboardQuery,
  useGetStudentLeaderboardQuery,
  type LeaderboardQuery,
} from '@/store/api/usersApi';

export default function StudentLeaderboardPage() {
  const locale = useLocale();
  const ar = locale === 'ar';
  const [period, setPeriod] = useState<LeaderboardQuery['Period']>('all');
  const [page, setPage] = useState(1);
  const { data: dashboard, isLoading: loadingDashboard } = useGetDashboardQuery(locale);
  const stageId = dashboard?.CurrentStageId;
  const { data, isLoading, isError } = useGetStudentLeaderboardQuery(
    { StageId: stageId ?? 0, Period: period, Page: page },
    { skip: stageId == null || stageId <= 0, refetchOnMountOrArgChange: true },
  );

  return (
    <main className="container mx-auto max-w-6xl px-4 py-10 md:px-10">
      <h1 className="brand-display-title text-gradient-math mb-5 text-3xl font-bold">
        {ar ? 'المتفوقون في مرحلتك' : 'Top learners in your stage'}
      </h1>
      {stageId == null && !loadingDashboard ? (
        <div className="math-card rounded-2xl border border-border p-6">
          <p>{ar ? 'اختر مرحلتك أولًا لعرض الترتيب.' : 'Select your stage first to see rankings.'}</p>
          <Link href="/learning-stage" className="mt-3 inline-block font-semibold text-primary">
            {ar ? 'اختيار المرحلة' : 'Choose your stage'}
          </Link>
        </div>
      ) : (
        <LeaderboardPanel
          data={data}
          isLoading={loadingDashboard || isLoading}
          isError={isError}
          period={period}
          setPeriod={setPeriod}
          page={page}
          setPage={setPage}
        />
      )}
    </main>
  );
}
