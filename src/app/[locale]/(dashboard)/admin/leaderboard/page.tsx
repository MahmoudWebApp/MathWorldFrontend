'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { LeaderboardPanel } from '@/components/leaderboard/LeaderboardPanel';
import { useGetAdminStagesQuery } from '@/store/api/stagesApi';
import {
  useGetStageAdminLeaderboardQuery,
  type LeaderboardQuery,
} from '@/store/api/usersApi';

export default function AdminLeaderboardPage() {
  const ar = useLocale() === 'ar';
  const [selectedStageId, setStageId] = useState<number | null>(null);
  const [period, setPeriod] = useState<LeaderboardQuery['Period']>('all');
  const [page, setPage] = useState(1);
  const { data: stages, isLoading: loadingStages, isError: stagesError } = useGetAdminStagesQuery();
  const stageId = selectedStageId ?? stages?.[0]?.Id ?? 0;
  const { data, isLoading, isError } = useGetStageAdminLeaderboardQuery(
    { StageId: stageId, Period: period, Page: page },
    { skip: stageId <= 0, refetchOnMountOrArgChange: true },
  );

  return (
    <main className="container mx-auto max-w-6xl px-4 py-10 md:px-10">
      <h1 className="brand-display-title text-gradient-math mb-3 text-3xl font-bold">
        {ar ? 'المتفوقون حسب المرحلة' : 'Learner rankings by stage'}
      </h1>
      <p className="mb-6 text-sm text-muted-foreground">
        {ar ? 'لوحة الإدارة: ترتيب الطلاب وفق الحلول والنقاط الموثقة.' :
          'Admin dashboard: ranks based on recorded solving credits.'}
      </p>
      <label htmlFor="stage-select" className="mb-2 block font-semibold">
        {ar ? 'المرحلة التعليمية' : 'Educational stage'}
      </label>
      <select
        id="stage-select"
        value={stageId}
        disabled={loadingStages || !stages?.length}
        onChange={(event) => { setStageId(Number(event.target.value)); setPage(1); }}
        className="mb-6 w-full max-w-sm rounded-xl border border-border bg-card px-4 py-3"
      >
        {(stages ?? []).map((stage) => (
          <option key={stage.Id} value={stage.Id}>
            {ar ? stage.NameAr : stage.NameEn}
          </option>
        ))}
      </select>
      {(stagesError || (!loadingStages && !stages?.length)) ? (
        <p role="alert" className="text-destructive">
          {ar ? 'تعذر تحميل المراحل التعليمية.' : 'Unable to load educational stages.'}
        </p>
      ) : (
        <LeaderboardPanel
          data={data}
          isLoading={loadingStages || isLoading}
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
