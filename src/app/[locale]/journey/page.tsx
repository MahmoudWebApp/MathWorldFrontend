'use client';

import { useLocale } from 'next-intl';
import { useSelector } from 'react-redux';
import { Link } from '@/i18n/routing';
import { useGetLearningJourneyQuery } from '@/store/api/stagesApi';

export default function JourneyPage() {
  const ar = useLocale() === 'ar';
  const student = useSelector((state: { auth: { isAuthenticated: boolean; user: { role?: string } | null } }) =>
    state.auth.isAuthenticated && state.auth.user?.role === 'Student');
  const { data, isLoading, isError, refetch } = useGetLearningJourneyQuery(undefined, {
    skip: !student,
    refetchOnMountOrArgChange: true,
  });

  return (
    <main className="container mx-auto max-w-5xl px-4 py-12" dir={ar ? 'rtl' : 'ltr'}>
      <h1 className="mb-3 text-3xl font-bold">{ar ? 'رحلتي في الرياضيات' : 'My mathematics journey'}</h1>
      {!student && <p>{ar ? 'سجّل الدخول كطالب لمتابعة رحلتك.' : 'Sign in as a student to view your journey.'}</p>}
      {student && isLoading && <p role="status">{ar ? 'جاري تحميل التقدم…' : 'Loading progress…'}</p>}
      {student && isError && <div role="alert" className="space-y-3">
        <p>{ar ? 'تعذّر تحميل الرحلة. تأكد من اختيار المرحلة التعليمية.' : 'Unable to load your journey. Choose a learning stage first.'}</p>
        <button type="button" onClick={() => void refetch()} className="rounded-lg border px-4 py-2">{ar ? 'إعادة المحاولة' : 'Retry'}</button>
        <Link href="/stages" className="ms-3 underline">{ar ? 'المراحل' : 'Stages'}</Link>
      </div>}
      {data && (
        <>
          <p className="mb-6 text-muted-foreground">{ar ? data.NameAr : data.NameEn}</p>
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border bg-card p-5"><div className="text-sm text-muted-foreground">{ar ? 'النقاط' : 'Points'}</div><strong className="text-3xl">{data.TotalPoints}</strong></div>
            <div className="rounded-2xl border bg-card p-5"><div className="text-sm text-muted-foreground">{ar ? 'مسائل محلولة' : 'Solved problems'}</div><strong className="text-3xl">{data.SolvedProblems} / {data.TotalProblems}</strong></div>
            <div className="rounded-2xl border bg-card p-5"><div className="text-sm text-muted-foreground">{ar ? 'إنجاز المرحلة' : 'Stage completion'}</div><strong className="text-3xl">{data.CompletionPercent}%</strong></div>
          </div>
          <h2 className="mb-4 text-xl font-bold">{ar ? 'تقدم الفئات' : 'Category progress'}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {data.Categories.map((category) => (
              <div key={category.CategoryId} className="rounded-2xl border bg-card p-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="font-bold">{ar ? category.NameAr : category.NameEn}</h3>
                  <span className="text-xs">{category.IsLocked ? (ar ? 'مقفلة' : 'Locked') : `${category.CompletionPercent}%`}</span>
                </div>
                <div role="progressbar" aria-valuenow={category.CompletionPercent} aria-valuemin={0} aria-valuemax={100} aria-label={ar ? category.NameAr : category.NameEn} className="mb-3 h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-primary" style={{ width: `${Math.max(0, Math.min(100, category.CompletionPercent))}%` }} />
                </div>
                <p className="mb-4 text-sm text-muted-foreground">{category.SolvedProblems} / {category.TotalProblems} · {ar ? 'متقنة' : 'Mastered'}: {category.MasteredProblems}</p>
                <Link className="text-sm font-semibold text-primary underline" href={category.IsLocked ? '/premium' : `/problems?stageId=${data.StageId}&categoryId=${category.CategoryId}`}>
                  {category.IsLocked ? 'Premium' : (ar ? 'تابع الحل' : 'Continue practicing')}
                </Link>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
