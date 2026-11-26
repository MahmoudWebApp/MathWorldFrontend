'use client';

import { WorkspacePageHeader } from '@/components/ui/WorkspacePageHeader';
import { LayoutDashboard } from 'lucide-react';
import { MathWorldLoading, MathWorldSkeleton } from '@/components/ui/MathWorldLoading';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { useLocale } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import { BookOpen, ChartNoAxesCombined, Heart, LockKeyhole, NotebookTabs, Target, Trophy } from 'lucide-react';
import { useGetDashboardQuery, useGetLearningJourneyQuery } from '@/store/api/usersApi';
import { useGetStudentSubscriptionQuery } from '@/store/api/categoriesApi';
import { useGetTrackContinueQuery } from '@/store/api/stagesApi';
import { useSearchProblemsQuery } from '@/store/api/problemsApi';
import { LearningSessionCards, SessionBadges } from '@/components/dashboard/LearningSessionCards';
import { StudentAchievementsPanel } from '@/components/dashboard/StudentAchievementsPanel';
import { LockedPremiumDialog } from '@/components/premium/LockedPremiumDialog';
import { ProblemCard } from '@/components/problems/ProblemCard';
import { getStageAccent } from '@/lib/stageVisuals';

export default function UserDashboardPage() {
  const locale = useLocale();
  const ar = locale === 'ar';
  const router = useRouter();
  const user=useSelector((state:RootState)=>state.auth.user);
  const { currentData: dashboardData, isLoading, isFetching, isError, refetch } = useGetDashboardQuery(locale, {
    skip:user?.Role!=='Student',
    refetchOnMountOrArgChange: 45,
    refetchOnReconnect:true,
  });
  const dashboard=dashboardData?.Id===user?.Id?dashboardData:undefined;
  // Start independent learning/entitlement requests immediately, using the
  // authenticated profile until the dashboard confirms the active stage.
  const stageId = dashboard ? (dashboard.CurrentStageId??0) : (user?.CurrentStageId??0);
  const { currentData: journey, isLoading: journeyLoading, isFetching: journeyFetching, isError: progressError, refetch: reloadProgress } = useGetLearningJourneyQuery(stageId, {
    skip: stageId <= 0,
  });
  const { data: subscription, isLoading: planLoading, isError: planError, refetch: reloadPlan } = useGetStudentSubscriptionQuery(undefined, {
    skip: user?.Role !== 'Student',
  });
  const accent = getStageAccent({ Id: stageId, NameAr: journey?.NameAr, NameEn: journey?.NameEn });
  const isPremium = subscription?.IsPremium === true;
  const trackId=journey?.TrackId??null;
  const {currentData:trackNext}=useGetTrackContinueQuery(undefined,{skip:!isPremium||!trackId,refetchOnMountOrArgChange:true});
  const { data: nextUnsolved } = useSearchProblemsQuery(
    { StageId: stageId, HideSolved: true, Page: 1, PageSize: 1 },
    { skip: !isPremium || user?.Role !== 'Student' || stageId <= 0 || !journey || trackId!==null,
      refetchOnMountOrArgChange: 45 },
  );
  const nextProblemId = trackId ? (trackNext?.TrackId===trackId?trackNext.Problem?.Id:undefined) : nextUnsolved?.Results?.[0]?.Id;

  useEffect(() => {
    if (!isLoading && !isError && dashboard && user?.Role === 'Student' && !dashboard.CurrentStageId) {
      router.replace('/learning-stage');
    }
  }, [dashboard, isLoading, isError, router,user?.Role]);

  if (!isLoading && !isFetching && stageId<=0 && (isError || !dashboard)) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12">
        <div className="rounded-3xl border bg-card p-6">
          <h1 className="text-xl font-extrabold">{ar ? 'تعذّر تحميل الرئيسية' : 'Dashboard unavailable'}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{ar ? 'تعذّر الاتصال بالخادم.' : 'Could not connect to the server.'}</p>
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
  if (((isLoading||isFetching)&&!dashboard) || (user?.Role === 'Student' && stageId > 0 &&
      (journeyLoading || (journeyFetching&&!journey) || planLoading))) {
    return <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6" aria-busy="true"><MathWorldSkeleton kind="dashboard"/></main>;
  }

  // A failed/empty API response is unknown, not a zero-progress or Free user.
  if (user?.Role === 'Student' && stageId > 0 &&
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
    { label: ar ? 'نقاط مكتسبة' : 'Earned points', value: (journey?.LearningSessionsEnabled ? journey.PermanentPoints : journey?.TotalPoints) ?? '—', icon: Trophy },
    { label: ar ? 'مسائل مجرّبة' : 'Attempted', value: journey?.AttemptedProblems ?? '—', icon: BookOpen },
  ];

  return (
    <main className="mx-auto w-full max-w-7xl space-y-5 px-4 py-6 sm:px-6">
      <div>
        <WorkspacePageHeader title={ar?'الرئيسية':'Dashboard'} icon={LayoutDashboard}/>
        <p className="mt-2 text-sm text-muted-foreground">
          {ar ? `أهلاً بعودتك${user?.FullName ? `، ${user.FullName}` : ''}` : `Welcome back${user?.FullName ? `, ${user.FullName}` : ''}`}
        </p>
      </div>

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

      {isPremium&&stageId>0&&<Link href="/dashboard/daily-challenge" className="flex items-center justify-between gap-3 rounded-2xl border border-primary/25 bg-card p-4 sm:p-5"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary"><Target className="h-6 w-6"/></span><div><h2 className="font-bold">{ar?'تحدي اليوم':'Daily challenge'}</h2><p className="text-sm text-muted-foreground">{ar?'ابدأ تحدي اليوم أو تابع إنجازك':'Start or continue today’s challenge'}</p></div></div><span className="rounded-xl sr-wave-button px-4 py-2 text-sm font-bold text-white">{ar?'فتح التحدي':'Open challenge'}</span></Link>}
      {journey?.LearningSessionsEnabled === true && stageId > 0 && <LearningSessionCards stageId={stageId} trackId={trackId} premium={isPremium}/>}
      {journey?.CertificatesEnabled===true&&<Link href="/dashboard/certificates" className="flex items-center justify-between rounded-2xl border bg-card p-4 font-semibold"><span>{ar?'شهاداتي التعليمية':'My learning certificates'}</span><span className="text-primary">{ar?'عرض':'View'}</span></Link>}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-4"><StudentAchievementsPanel compact />{journey?.LearningSessionsEnabled === true && <SessionBadges/>}</div>
        <section className="rounded-3xl border bg-card p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-extrabold">{ar ? 'آخر المسائل المحلولة' : 'Recently solved'}</h2>
            <Link href="/dashboard/solved" className="text-sm font-bold text-primary hover:underline">{ar ? 'عرض الكل' : 'View all'}</Link>
          </div>
          <div className="mt-4 space-y-3">
            {!dashboard&&(isLoading||isFetching)?<MathWorldLoading compact/>:!dashboard||isError?<div role="alert" className="rounded-2xl bg-muted/30 p-4 text-sm">{ar?'تعذّر تحميل آخر المسائل.':'Recent problems unavailable.'} <button className="text-primary underline" onClick={()=>void refetch()}>{ar?'إعادة المحاولة':'Retry'}</button></div>:dashboard.RecentSolved?.some(problem => problem.StageId === stageId) ? dashboard.RecentSolved.filter(problem => problem.StageId === stageId).slice(0, 2).map((problem, index) => (
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

      {!isPremium && user?.Role === 'Student' && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/15 bg-primary/5 p-4">
          <p className="text-sm font-semibold">{ar ? 'مميزات Premium' : 'Premium benefits'}</p>
          <Link href="/dashboard/upgrade" className="rounded-xl border border-primary/25 px-4 py-2 text-sm font-bold text-primary">
            {ar ? 'مميزات الحساب' : 'Account benefits'}
          </Link>
        </div>
      )}
    </main>
  );
}
