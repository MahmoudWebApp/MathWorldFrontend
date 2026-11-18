'use client';

import { useLocale } from 'next-intl';
import { useSelector } from 'react-redux';
import { Link } from '@/i18n/routing';
import { useGetDailyChallengeQuery } from '@/store/api/stagesApi';

export default function DailyChallengePage() {
  const ar = useLocale() === 'ar';
  const student = useSelector((state: { auth: { isAuthenticated: boolean; user: { Role?: string } | null } }) =>
    state.auth.isAuthenticated && state.auth.user?.Role === 'Student');
  const { data, isLoading, isError, refetch } = useGetDailyChallengeQuery(undefined, {
    skip: !student,
    refetchOnMountOrArgChange: true,
  });

  return <main className="container mx-auto max-w-4xl px-4 py-12" dir={ar ? 'rtl' : 'ltr'}>
    <h1 className="mb-3 text-3xl font-bold">{ar ? 'تحدي اليوم' : 'Daily challenge'}</h1>
    <p className="mb-7 text-muted-foreground">{ar ? 'خمس مسائل من الفئات المتاحة لك، تتجدد كل يوم بتوقيت UTC. ما في حد يومي لعدد المسائل.' : 'Five problems from your accessible categories, refreshed daily at UTC midnight. Regular practice remains unlimited.'}</p>
    {!student && <p>{ar ? 'سجّل الدخول كطالب لتبدأ التحدي.' : 'Sign in as a student to start.'}</p>}
    {student && isLoading && <p role="status">{ar ? 'جاري تحميل التحدي…' : 'Loading challenge…'}</p>}
    {student && isError && <div role="alert" className="space-y-3">
      <p>{ar ? 'تعذّر تحميل التحدي. تأكد من اختيار مرحلتك التعليمية.' : 'Could not load the challenge. Check your learning stage.'}</p>
      <button type="button" onClick={() => void refetch()} className="rounded-lg border px-4 py-2">{ar ? 'إعادة المحاولة' : 'Retry'}</button>
      <Link href="/learning-stage" className="ms-3 underline">{ar ? 'اختيار المرحلة' : 'Choose stage'}</Link>
    </div>}
    {data && <>
      <div className="mb-7 rounded-2xl border bg-card p-6">
        <p className="text-sm text-muted-foreground">{data.DateUtc} · UTC</p>
        <p className="mt-2 text-2xl font-bold">{data.Completed} / {data.Total}</p>
        <div role="progressbar" aria-valuenow={data.Completed} aria-valuemin={0} aria-valuemax={data.Total} aria-label={ar ? 'إنجاز التحدي' : 'Challenge completion'} className="mt-3 h-3 overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-primary" style={{ width: `${data.Total ? (100 * data.Completed / data.Total) : 0}%` }} />
        </div>
      </div>
      {data.Total === 0 && <p>{ar ? 'لا توجد مسائل متاحة لهذه المرحلة حالياً.' : 'No eligible problems are available for this stage yet.'}</p>}
      <div className="space-y-3">
        {data.Problems.map((problem, index) => <div key={problem.Id} className="flex items-center justify-between gap-4 rounded-2xl border bg-card p-5">
          <div><p className="text-xs text-muted-foreground">{ar ? 'مسألة' : 'Problem'} {index + 1} · {problem.Points} XP</p>
            <h2 className="mt-1 font-semibold">{ar ? problem.TitleAr : problem.TitleEn}</h2>
            <p className="mt-1 text-sm">{problem.IsSolved ? (ar ? 'تم الحل ✓' : 'Solved ✓') : (ar ? 'بانتظار الحل' : 'Not solved yet')}</p>
          </div>
          <Link href={`/problems/${problem.Id}`} className="shrink-0 rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-muted">{ar ? 'افتح المسألة' : 'Open problem'}</Link>
        </div>)}
      </div>
    </>}
  </main>;
}
