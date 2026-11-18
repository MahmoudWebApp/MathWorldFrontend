'use client';

import { useLocale } from 'next-intl';
import { useSelector } from 'react-redux';
import { Link } from '@/i18n/routing';
import { RichText } from '@/components/ui/RichText';
import { useGetDailyChallengeQuery, useGetLearningJourneyQuery } from '@/store/api/stagesApi';

export default function JourneyPage() {
  const ar = useLocale() === 'ar';
  const student = useSelector((state: { auth: { isAuthenticated: boolean; user: { Role?: string } | null } }) =>
    state.auth.isAuthenticated && state.auth.user?.Role === 'Student');
  const { data, isLoading, isError, refetch } = useGetLearningJourneyQuery(undefined, {
    skip: !student,
    refetchOnMountOrArgChange: true,
  });
  const daily = useGetDailyChallengeQuery(data?.StageId ?? 0, {
    skip: !student || !data?.StageId,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
  });

  // Both web and Flutter recommend only categories unlocked by the API.
  // A formerly-Premium topic may still have history but must never be offered
  // as an actionable Free practice recommendation after entitlement expiry.
  const available = (data?.Categories ?? [])
    .filter(c => !c.IsLocked && c.TotalProblems > 0);
  const nextSteps = available
    .filter(c => c.SolvedProblems < c.TotalProblems)
    .sort((a, b) => {
      // Resume unfinished work first; then choose the least-completed topic.
      const started = Number(b.AttemptedProblems > 0) - Number(a.AttemptedProblems > 0);
      if (started !== 0) return started;
      return a.CompletionPercent - b.CompletionPercent || a.CategoryId - b.CategoryId;
    })
    .slice(0, 3);
  const recommended = nextSteps[0];
  const reviewNeeded = available.filter(c => c.AttemptedProblems > c.SolvedProblems);

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
          <section className="mb-8 rounded-2xl border bg-card p-5" aria-labelledby="daily-practice-title">
            <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 id="daily-practice-title" className="text-lg font-bold">
                  {ar ? 'تحدّي اليوم الاختياري' : 'Optional daily practice'}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {ar ? 'حتى 5 مسائل من فئاتك المفتوحة. هذا اقتراح للممارسة، وليس حدّاً يومياً للحل.'
                    : 'Up to five questions from your unlocked topics. This is a suggestion, not a daily problem limit.'}
                </p>
              </div>
              {daily.data && <span className="rounded-lg bg-primary/10 px-3 py-1 text-sm font-bold text-primary" aria-live="polite">
                {daily.data.Completed} / {daily.data.Total}
              </span>}
            </div>
            {daily.isLoading && <p role="status" className="text-sm text-muted-foreground">
              {ar ? 'جارٍ تجهيز مسائل اليوم…' : "Loading today's practice…"}
            </p>}
            {daily.isError && <div role="alert" className="flex flex-wrap items-center gap-3 text-sm">
              <p>{ar ? 'تعذّر تحميل مسائل اليوم.' : "Couldn't load today's questions."}</p>
              <button type="button" onClick={() => void daily.refetch()}
                className="font-semibold text-primary underline">{ar ? 'إعادة المحاولة' : 'Retry'}</button>
            </div>}
            {daily.data?.Total === 0 && <p className="text-sm text-muted-foreground">
              {ar ? 'ما في مسائل منشورة ضمن فئاتك المفتوحة حالياً. فيك ترجع للمراحل وتراجع تقدّمك.'
                : 'No published questions in your unlocked topics yet. You can browse stages or review your progress.'}
            </p>}
            {daily.data && daily.data.Total > 0 && <ol className="grid gap-2 sm:grid-cols-2">
              {daily.data.Problems.map(problem => (
                <li key={problem.Id} className="min-w-0 rounded-xl border bg-background/60 p-3">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="text-xs text-muted-foreground">
                      {ar ? 'مسألة' : 'Problem'} #{problem.Id}
                    </span>
                    <span className={problem.IsSolved
                      ? 'text-xs font-semibold text-emerald-700 dark:text-emerald-300'
                      : 'text-xs text-muted-foreground'}>
                      {problem.IsSolved
                        ? (ar ? 'تم حلّها' : 'Solved')
                        : (ar ? 'بانتظار الحل' : 'To practice')}
                    </span>
                  </div>
                  <RichText
                    text={ar ? problem.TitleAr : problem.TitleEn}
                    isArabic={ar}
                    inline
                    className="mb-3 line-clamp-2 text-sm font-medium"
                  />
                  <Link href={`/problems/${problem.Id}`}
                    className="inline-flex min-h-9 items-center rounded-lg text-sm font-semibold text-primary underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
                    {ar ? 'افتح المسألة' : 'Open problem'}
                  </Link>
                </li>
              ))}
            </ol>}
          </section>
          {recommended && (
            <section className="mb-8 rounded-2xl border border-primary/25 bg-primary/5 p-5">
              <h2 className="text-lg font-bold">{ar ? 'الخطوة المقترحة لك' : 'Suggested next step'}</h2>
              <p className="mt-2 font-semibold">{ar ? recommended.NameAr : recommended.NameEn}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {recommended.AttemptedProblems > 0
                  ? (ar ? 'كمّل الفئة اللي بلّشت فيها لتحسّن تقدّمك.' :
                    'Continue an unfinished category to improve your progress.')
                  : (ar ? 'اكتشف فئة جديدة ومفتوحة ضمن حسابك.' :
                    'Discover a new category already unlocked for your account.')}
              </p>
              <Link className="mt-4 inline-flex rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
                href={`/problems?stageId=${data.StageId}&categoryId=${recommended.CategoryId}`}>
                {ar ? 'تابع حل المسائل' : 'Practice this category'}
              </Link>
            </section>
          )}
          {reviewNeeded.length > 0 && (
            <section className="mb-8 rounded-2xl border bg-card p-5">
              <h2 className="text-lg font-bold">{ar ? 'راجع محاولاتك لتحسّن مستواك' : 'Review previous attempts'}</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {ar
                  ? `عندك ${reviewNeeded.length} فئة مفتوحة فيها مسائل جرّبتها ولم تحلّها بعد. دفتر الأخطاء بيساعدك تتدرّب عليها من جديد.`
                  : `You have ${reviewNeeded.length} accessible topic(s) with attempted but unsolved problems. Use the error notebook to revisit them.`}
              </p>
              <Link href="/dashboard/error-notebook"
                className="mt-4 inline-flex rounded-xl border border-primary/20 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
                {ar ? 'افتح دفتر الأخطاء' : 'Open error notebook'}
              </Link>
            </section>
          )}
          {available.length > 0 && nextSteps.length === 0 && (
            <section className="mb-8 rounded-2xl border border-primary/20 bg-primary/5 p-5" role="status">
              <h2 className="text-lg font-bold">{ar ? 'أكملت الفئات المفتوحة!' : 'All unlocked topics completed!'}</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {ar ? 'ما في فئات مفتوحة غير مكتملة حالياً. فيك تراجع حلولك أو تختار مرحلة ثانية.' : 'There are no unfinished unlocked topics. Review your solutions or explore another stage.'}
              </p>
              <Link href="/dashboard/solved" className="mt-3 inline-flex font-semibold text-primary underline">
                {ar ? 'راجع المسائل المحلولة' : 'Review solved problems'}
              </Link>
            </section>
          )}
          {data.Categories.length === 0 && (
            <section role="status" className="mb-8 rounded-2xl border bg-card p-5">
              <p>{ar ? 'ما في فئات متاحة لهذه المرحلة بعد. ارجع للمراحل أو حاول لاحقاً.' : 'There are no topics in this stage yet. Explore stages or try again later.'}</p>
              <Link href="/stages" className="mt-3 inline-flex font-semibold text-primary underline">{ar ? 'عرض المراحل' : 'Browse stages'}</Link>
            </section>
          )}
          <h2 className="mb-4 text-xl font-bold">{ar ? 'تقدم الفئات' : 'Category progress'}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {data.Categories.map((category) => (
              <div key={category.CategoryId} className="rounded-2xl border bg-card p-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="font-bold">{ar ? category.NameAr : category.NameEn}</h3>
                  <span className="shrink-0 text-xs text-muted-foreground">{category.IsLocked ? (ar ? 'Premium · مقفلة' : 'Premium · Locked') : category.TotalProblems === 0 ? (ar ? 'قريباً' : 'Coming soon') : `${category.CompletionPercent}%`}</span>
                </div>
                <div role="progressbar" aria-valuenow={category.CompletionPercent} aria-valuemin={0} aria-valuemax={100} aria-label={ar ? category.NameAr : category.NameEn} className="mb-3 h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-primary" style={{ width: `${Math.max(0, Math.min(100, category.CompletionPercent))}%` }} />
                </div>
                <p className="mb-4 text-sm text-muted-foreground">{category.SolvedProblems} / {category.TotalProblems} · {ar ? 'متقنة' : 'Mastered'}: {category.MasteredProblems}</p>
                {category.TotalProblems === 0 && !category.IsLocked ? (
                  <span className="text-sm text-muted-foreground">{ar ? 'لم تُنشر مسائل لهذه الفئة بعد' : 'No published problems in this topic yet'}</span>
                ) : (
                  <Link className="inline-flex rounded-lg text-sm font-semibold text-primary underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                    href={category.IsLocked ? '/premium' : `/problems?stageId=${data.StageId}&categoryId=${category.CategoryId}`}>
                    {category.IsLocked ? (ar ? 'مزايا Premium' : 'Premium access') : category.SolvedProblems >= category.TotalProblems ? (ar ? 'راجع المسائل' : 'Review problems') : (ar ? 'تابع الحل' : 'Continue practicing')}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
