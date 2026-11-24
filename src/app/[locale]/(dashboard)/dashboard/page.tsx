'use client';

import { MathWorldLoading } from '@/components/ui/MathWorldLoading';
import { useEffect } from 'react';
import { useLocale } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import { BookOpen, ChartNoAxesCombined, Heart, LockKeyhole, NotebookTabs, Target, Trophy } from 'lucide-react';
import { useGetDashboardQuery, useGetLearningJourneyQuery } from '@/store/api/usersApi';
import { useGetStudentSubscriptionQuery } from '@/store/api/categoriesApi';
import { useGetTrackContinueQuery } from '@/store/api/stagesApi';
import { useSearchProblemsQuery } from '@/store/api/problemsApi';
import { StudentAchievementsPanel } from '@/components/dashboard/StudentAchievementsPanel';
import { LockedPremiumDialog } from '@/components/premium/LockedPremiumDialog';
import { ProblemCard } from '@/components/problems/ProblemCard';
import { getStageAccent } from '@/lib/stageVisuals';

export default function UserDashboardPage() {
  const locale = useLocale();
  const ar = locale === 'ar';
  const router = useRouter();
  const { data: dashboard, isLoading, isError, refetch } = useGetDashboardQuery(locale, {
    refetchOnMountOrArgChange: 45,
  });
  const stageId = dashboard?.CurrentStageId ?? 0;
  const { data: journey, isLoading: journeyLoading, isError: progressError, refetch: reloadProgress } = useGetLearningJourneyQuery(stageId, {
    skip: stageId <= 0,
  });
  const { data: subscription, isLoading: planLoading, isError: planError, refetch: reloadPlan } = useGetStudentSubscriptionQuery(undefined, {
    skip: dashboard?.Role !== 'Student',
  });
  const accent = getStageAccent({ Id: stageId, NameAr: journey?.NameAr, NameEn: journey?.NameEn });
  const isPremium = subscription?.IsPremium === true;
  const trackId=journey?.TrackId??null;
  const {currentData:trackNext}=useGetTrackContinueQuery(undefined,{skip:!isPremium||!trackId,refetchOnMountOrArgChange:true});
  const { data: nextUnsolved } = useSearchProblemsQuery(
    { StageId: stageId, HideSolved: true, Page: 1, PageSize: 1 },
    { skip: !isPremium || dashboard?.Role !== 'Student' || stageId <= 0 || !journey || trackId!==null,
      refetchOnMountOrArgChange: 45 },
  );
  const nextProblemId = trackId ? (trackNext?.TrackId===trackId?trackNext.Problem?.Id:undefined) : nextUnsolved?.Results?.[0]?.Id;

  useEffect(() => {
    if (!isLoading && !isError && dashboard?.Role === 'Student' && !dashboard.CurrentStageId) {
      router.replace('/learning-stage');
    }
  }, [dashboard, isLoading, isError, router]);

  if (!isLoading && (isError || !dashboard)) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12">
        <div className="rounded-3xl border bg-card p-6">
          <h1 className="text-xl font-extrabold">{ar ? 'تعذّر تحميل الرئيسية' : 'Dashboard unavailable'}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{ar ? 'يمكنك مواصلة التعلم حتى لو تعذّر تحميل الإحصائيات.' : 'You can still practise while your dashboard reconnects.'}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/dashboard/categories" className="rounded-xl bg-primary px-4 py-3 font-bold text-primary-foreground">{ar ? 'ابدأ التعلم' : 'Start learning'}</Link>
            <button type="button" onClick={() => void refetch()} className="rounded-xl border px-4 py-3 font-semibold">{ar ? 'إعادة المحاولة' : 'Retry'}</button>
          </div>
        </div>
      </main>
    );
  }

  // Do not show placeholder statistics or a generic stage before the actual
  // learner stage, progress and entitlement requests have resolved.
  if (isLoading || (dashboard?.Role === 'Student' && stageId > 0 &&
      (journeyLoading || planLoading))) {
    return <main className="mx-auto w-full max-w-7xl animate-pulse space-y-5 px-4 py-6 sm:px-6" aria-busy="true">
      <MathWorldLoading compact />
      <div className="h-9 w-48 rounded-xl bg-muted" />
      <div className="h-52 rounded-3xl border bg-card/75" />
      <div className="grid gap-4 lg:grid-cols-2"><div className="h-72 rounded-3xl border bg-card/75" /><div className="h-72 rounded-3xl border bg-card/75" /></div>
    </main>;
  }

  // A failed/empty API response is unknown, not a zero-progress or Free user.
  if (dashboard?.Role === 'Student' && stageId > 0 &&
      (progressError || !journey || planError || !subscription)) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12">
        <section role="alert" className="space-y-4 rounded-3xl border border-destructive/25 bg-card p-6">
          <h1 className="text-xl font-extrabold">
            {ar ? 'تعذّر التحقق من التقدم أو الاشتراك' : 'Could not verify your progress or subscription'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {ar ? 'ما رح نعرض إحصائيات أو صلاحيات افتراضية. حاول تحميل بياناتك مجدداً.'
              : 'No placeholder statistics or account permissions are shown. Retry loading your data.'}
          </p>
          <button type="button" onClick={() => {
              void reloadProgress(); void reloadPlan();
            }} className="rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground">
            {ar ? 'إعادة المحاولة' : 'Retry'}
          </button>
        </section>
      </main>
    );
  }

  const completion = Math.min(100, Math.max(0, journey?.CompletionPercent ?? 0));
  const stats = [
    { label: ar ? 'مسائل محلولة' : 'Solved', value: journey ? `${journey.SolvedProblems} ${ar ? 'من' : 'of'} ${journey.TotalProblems}` : '—', icon: Target },
    { label: ar ? 'نقاط مكتسبة' : 'Earned points', value: journey?.TotalPoints ?? '—', icon: Trophy },
    { label: ar ? 'مسائل مجرّبة' : 'Attempted', value: journey?.AttemptedProblems ?? '—', icon: BookOpen },
  ];

  return (
    <main className="mx-auto w-full max-w-7xl space-y-5 px-4 py-6 sm:px-6">
      <header>
        <h1 className="text-2xl font-extrabold sm:text-3xl">{ar ? 'الرئيسية' : 'Dashboard'}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {isLoading ? (ar ? 'جارٍ تحميل بياناتك…' : 'Loading…')
            : (ar ? `أهلاً بعودتك${dashboard?.FullName ? `، ${dashboard.FullName}` : ''}` : `Welcome back${dashboard?.FullName ? `, ${dashboard.FullName}` : ''}`)}
        </p>
      </header>

      <section className="rounded-3xl border border-primary/20 bg-card p-5 sm:p-7" aria-label={ar ? 'ملخص التقدم' : 'Progress summary'}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-muted-foreground">{ar ? 'تقدّمك في المرحلة' : 'Your stage progress'}</p>
            <h2 className="mt-1 text-xl font-extrabold" style={{ color: accent }}>
              {(ar ? journey?.NameAr : journey?.NameEn) || '—'}
            </h2>
          </div>
          <strong className="text-3xl font-black tabular-nums" style={{ color: accent }}>{journey ? `${completion}%` : '—'}</strong>
        </div>
        <div role="progressbar" aria-label={ar ? 'إنجاز المرحلة' : 'Stage completion'}
          aria-valuemin={0} aria-valuemax={100} aria-valuenow={completion}
          className="mt-4 h-3 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-emerald-600" style={{ width: `${completion}%` }} />
        </div>
        {progressError && <button type="button" onClick={() => void reloadProgress()} className="mt-3 text-sm font-semibold text-primary">
          {ar ? 'إعادة تحميل التقدم' : 'Reload progress'}
        </button>}
        <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
          {stats.map(item => (
            <div key={item.label} className="min-w-0 rounded-2xl bg-muted/40 p-3 sm:p-4">
              <item.icon className="mb-2 h-5 w-5 text-primary" aria-hidden="true" />
              <p className="text-lg font-extrabold tabular-nums sm:text-2xl">{item.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>
        <Link href={nextProblemId
          ? `/dashboard/problems/${nextProblemId}${trackId?'?trackId='+trackId:''}`
          : stageId > 0 ? '/dashboard/categories' : '/learning-stage'}
          className="mt-4 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-extrabold text-primary-foreground hover:opacity-90">
          <BookOpen className="h-5 w-5" aria-hidden="true" />
          {nextProblemId
            ? (ar ? 'تابع التعلم' : 'Continue learning')
            : stageId > 0 ? (ar ? 'ابدأ التعلم' : 'Start learning')
            : (ar ? 'اختيار المرحلة' : 'Choose stage')}
        </Link>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <StudentAchievementsPanel compact />
        <section className="rounded-3xl border bg-card p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-extrabold">{ar ? 'آخر المسائل المحلولة' : 'Recently solved'}</h2>
            <Link href="/dashboard/solved" className="text-sm font-bold text-primary hover:underline">{ar ? 'عرض الكل' : 'View all'}</Link>
          </div>
          <div className="mt-4 space-y-3">
            {dashboard?.RecentSolved?.some(problem => problem.StageId === stageId) ? dashboard.RecentSolved.filter(problem => problem.StageId === stageId).slice(0, 2).map((problem, index) => (
              <ProblemCard key={problem.Id ?? index} problem={problem} />
            )) : <div className="rounded-2xl bg-muted/30 p-5 text-sm text-muted-foreground">
              {ar ? 'لم تحل مسائل بعد. ابدأ بأول فئة من مرحلتك.' : 'No solved problems yet. Start with a topic in your stage.'}
            </div>}
          </div>
        </section>
      </div>

      <section aria-label={ar ? 'اختصارات' : 'Quick links'} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { href: '/dashboard/favorites', label: ar ? 'المفضلة' : 'Favorites', icon: Heart, premium: false },
          { href: '/dashboard/error-notebook', label: ar ? 'دفتر الأخطاء' : 'Error notebook', icon: NotebookTabs, premium: false },
          { href: '/dashboard/leaderboard', label: ar ? 'المتفوقون' : 'Leaderboard', icon: Trophy, premium: false },
          { href: '/dashboard/analytics', label: ar ? 'التقارير والإحصائيات' : 'Reports & analytics', icon: ChartNoAxesCombined, premium: true },
        ].map(item => {
          const cardClass = "flex min-h-24 w-full flex-col justify-center gap-2 rounded-2xl border bg-card p-4 text-start transition-colors hover:border-primary/40 hover:bg-primary/5";
          const content = <>
            <item.icon className="h-6 w-6 text-primary" aria-hidden="true" />
            <span className="flex items-center gap-2 text-sm font-bold">
              {item.label}
              {item.premium && !isPremium && <LockKeyhole className="h-4 w-4 text-muted-foreground" aria-hidden="true" />}
            </span>
          </>;
          return item.premium && !isPremium
            ? <LockedPremiumDialog key={item.href} featureName={item.label}>
                <button type="button" className={cardClass} aria-label={item.label}>{content}</button>
              </LockedPremiumDialog>
            : <Link key={item.href} href={item.href} className={cardClass}>{content}</Link>;
        })}
      </section>

      {!isPremium && dashboard?.Role === 'Student' && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/15 bg-primary/5 p-4">
          <p className="text-sm font-semibold">{ar ? 'اكتشف مميزات Premium، بدون عرض أسعار.' : 'Explore Premium benefits, with no prices displayed.'}</p>
          <Link href="/dashboard/upgrade" className="rounded-xl border border-primary/25 px-4 py-2 text-sm font-bold text-primary">
            {ar ? 'مميزات الحساب' : 'Account benefits'}
          </Link>
        </div>
      )}
    </main>
  );
}
