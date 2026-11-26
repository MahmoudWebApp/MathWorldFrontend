'use client';
import {ProblemTitle} from '@/components/problems/ProblemTitle';

import { MathWorldLoading } from '@/components/ui/MathWorldLoading';
import { useLocale } from 'next-intl';
import { useSelector } from 'react-redux';
import { Link } from '@/i18n/routing';
import { BookOpen, CheckCircle2, CircleAlert, Circle, Crown, LockKeyhole, Target, XCircle } from 'lucide-react';
import { LockedPremiumDialog } from '@/components/premium/LockedPremiumDialog';
import { useGetDailyChallengeQuery } from '@/store/api/stagesApi';
import { useGetStudentSubscriptionQuery } from '@/store/api/categoriesApi';
import { useGetLearningStageQuery } from '@/store/api/usersApi';

/** A stable guided five-question session. Only the next unanswered question opens. */
export default function DailyChallengePage() {
  const ar = useLocale() === 'ar';
  const student = useSelector((state: { auth: { isAuthenticated: boolean; user: { Role?: string } | null } }) =>
    state.auth.isAuthenticated && state.auth.user?.Role === 'Student');
  const { data: membership, isLoading: checking, isError: membershipError, refetch: retryMembership } =
    useGetStudentSubscriptionQuery(undefined, { skip: !student, refetchOnMountOrArgChange: 45 });
  const isPremium = membership?.IsPremium === true;
  const { data: selectedStage, isLoading: stageLoading, isError: stageError, refetch: retryStage } =
    useGetLearningStageQuery(undefined, { skip: !student || !isPremium });
  const stageId = selectedStage?.StageId ?? 0;
  const { currentData: data, isLoading, isFetching, isError, refetch } = useGetDailyChallengeQuery(stageId, {
    skip: !student || !isPremium || stageId <= 0,
    refetchOnMountOrArgChange: 30,
  });
  const nextIndex = data?.Problems.findIndex(problem => !problem.IsAnswered) ?? -1;
  const next = nextIndex >= 0 ? data?.Problems[nextIndex] : undefined;
  const total = data?.Total ?? 0;
  const completed = data?.Completed ?? 0;
  const correct = data?.Correct ?? 0;
  const challengeDate = data?.DateUtc
    ? new Date(data.DateUtc + 'T12:00:00Z').toLocaleDateString(ar ? 'ar-SY-u-nu-latn' : 'en-GB', {
      day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
    }) : '';
  const questionUrl = next
    ? '/dashboard/problems/' + next.Id + '?daily=' + encodeURIComponent(data?.DateUtc ?? '') +
      '&stageId=' + stageId + '&step=' + nextIndex
    : '/dashboard/daily-challenge';
  const loading = student && (checking || (isPremium && (stageLoading || (stageId > 0 && (isLoading || (isFetching && data === undefined))))));

  return (
    <main className="mx-auto w-full max-w-3xl space-y-6 px-4 py-7 sm:px-6" dir={ar ? 'rtl' : 'ltr'}>
      <header className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/5 px-3 py-1.5 text-xs font-bold text-primary">
          <Crown className="h-4 w-4" aria-hidden="true" /> Premium
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">{ar ? 'تحدي اليوم' : 'Daily challenge'}</h1>
        <p className="max-w-2xl text-sm leading-7 text-muted-foreground">{ar
          ? 'خمس مسائل من مرحلتك، بتحلّها واحدة وراء الثانية. بعد كل إجابة بتشوف النتيجة وطريقة الحل، وبتنتقل للمسألة التالية تلقائياً أو بزر التالي.'
          : 'Five questions from your stage in a guided sequence. Read the answer and solution after each submission, then advance automatically or use Next.'}</p>
      </header>

      {!student && <div className="rounded-2xl border bg-card p-6 text-sm">
        {ar ? 'سجّل الدخول بحساب طالب لتبدأ التحدي.' : 'Sign in as a learner to start the challenge.'}
      </div>}

      {loading && <div role="status" aria-busy="true" aria-label={ar ? 'تحميل تحدي اليوم' : 'Loading daily challenge'}
        className="animate-pulse space-y-4">
        <MathWorldLoading compact />
        <div className="h-32 rounded-2xl bg-muted/70" />
        <div className="grid grid-cols-5 gap-2">{Array.from({ length: 5 }, (_, i) =>
          <div key={i} className="h-16 rounded-xl bg-muted/60" />)}</div>
        <div className="h-52 rounded-2xl bg-muted/70" />
      </div>}

      {student && !checking && membershipError && <div role="alert" className="space-y-3 rounded-2xl border border-destructive/30 p-5">
        <p>{ar ? 'تعذّر التحقق من اشتراكك.' : 'Could not verify your subscription.'}</p>
        <button type="button" onClick={() => void retryMembership()} className="rounded-xl border px-4 py-2 font-bold text-primary">
          {ar ? 'إعادة المحاولة' : 'Retry'}
        </button>
      </div>}

      {student && membership && !isPremium && <section className="space-y-4 rounded-2xl border border-primary/20 bg-card p-6">
        <LockKeyhole className="h-7 w-7 text-primary" aria-hidden="true" />
        <h2 className="text-xl font-extrabold">{ar ? 'التحدي من مزايا Premium' : 'A Premium challenge'}</h2>
        <p className="text-sm leading-7 text-muted-foreground">{ar
          ? 'التدريب في فئات Free المفتوحة بيضل متاح، والتحدي المتسلسل ميزة للحساب المدفوع.'
          : 'You can still practise freely in your unlocked topics. The guided daily challenge is a Premium feature.'}</p>
        <LockedPremiumDialog featureName={ar ? 'تحدي اليوم' : 'Daily challenge'}>
          <button type="button" className="min-h-11 rounded-xl bg-primary px-5 py-2.5 font-bold text-primary-foreground">
            {ar ? 'عرض مميزات Premium' : 'Explore Premium benefits'}
          </button>
        </LockedPremiumDialog>
      </section>}

      {isPremium && !stageLoading && stageError && <div role="alert" className="rounded-2xl border p-5">
        <p>{ar ? 'تعذّر تحميل مرحلتك.' : 'Could not load your stage.'}</p>
        <button type="button" onClick={() => void retryStage()} className="mt-3 text-sm font-bold text-primary underline">
          {ar ? 'إعادة المحاولة' : 'Retry'}
        </button>
      </div>}
      {isPremium && !stageLoading && !stageError && stageId <= 0 &&
        <Link href="/learning-stage" className="inline-flex rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground">
          {ar ? 'اختيار مرحلتي' : 'Choose my stage'}
        </Link>}

      {isPremium && stageId > 0 && isError && !loading && <div role="alert" className="rounded-2xl border border-destructive/30 p-5">
        <p>{ar ? 'تعذر تحميل تحدي اليوم.' : 'Daily challenge could not load.'}</p>
        <button type="button" onClick={() => void refetch()} className="mt-3 rounded-xl border px-4 py-2 font-bold text-primary">
          {ar ? 'إعادة المحاولة' : 'Retry'}
        </button>
      </div>}

      {isPremium && data && !loading && !isError && <>
        <section className="rounded-2xl border border-primary/20 bg-card p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-muted-foreground">{challengeDate}</p>
              <h2 className="mt-1 text-lg font-extrabold">{ar ? 'تقدّم التحدي' : 'Challenge progress'}</h2>
            </div>
            <strong className="rounded-xl bg-primary/10 px-3 py-2 text-lg tabular-nums text-primary" dir="ltr">{completed} / {total}</strong>
          </div>
          <div className="mt-4 grid grid-cols-5 gap-2">
            {data.Problems.map((item, index) => (
              <div key={item.Id} aria-label={(ar ? 'المسألة ' : 'Question ') + (index + 1) + ': ' +
                (item.IsAnswered ? (item.IsSolved ? (ar ? 'صحيحة' : 'Correct') : (ar ? 'تحتاج مراجعة' : 'Review'))
                  : index === nextIndex ? (ar ? 'الحالية' : 'Current') : (ar ? 'قادم' : 'Upcoming'))}
                className={'flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl border text-xs font-extrabold ' +
                  (item.IsAnswered ? item.IsSolved
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                    : 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300'
                    : index === nextIndex ? 'border-primary/60 bg-primary/10 text-primary' : 'border-border bg-muted/20 text-muted-foreground')}>
                <span>{index + 1}</span>
                {item.IsAnswered ? item.IsSolved
                  ? <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  : <XCircle className="h-4 w-4" aria-hidden="true" />
                  : <Circle className="h-3.5 w-3.5" aria-hidden="true" />}
              </div>
            ))}
          </div>
          {isFetching && <span role="status" className="mt-2 block text-xs text-muted-foreground">
            {ar ? 'تحديث النتائج…' : 'Refreshing progress…'}
          </span>}
        </section>

        {total === 0 ? <section className="space-y-4 rounded-2xl border bg-card p-6">
          <CircleAlert className="h-8 w-8 text-primary" aria-hidden="true" />
          <h2 className="text-xl font-extrabold">{ar ? 'ما في مسائل جديدة للتحدي' : 'No new eligible questions'}</h2>
          <p className="text-sm text-muted-foreground">{ar
            ? 'جرب فئات مرحلتك أو ابدأ دورة تدريب جديدة من إحدى الفئات.'
            : 'Explore your stage topics or restart a topic practice cycle.'}</p>
          <Link href="/dashboard/categories" className="inline-flex rounded-xl bg-primary px-5 py-2.5 font-bold text-primary-foreground">
            {ar ? 'الذهاب للفئات' : 'Explore topics'}
          </Link>
        </section> : next ? <section className="space-y-4 rounded-2xl border bg-card p-5 sm:p-6">
          <span className="inline-flex items-center gap-2 text-sm font-bold text-primary">
            <Target className="h-4 w-4" aria-hidden="true" />
            {ar ? 'المسألة ' + (nextIndex + 1) + ' من ' + total : 'Question ' + (nextIndex + 1) + ' of ' + total}
          </span>
          <h2 className="text-xl font-extrabold leading-8"><ProblemTitle text={ar ? next.TitleAr : next.TitleEn}/></h2>
          <p className="text-sm leading-7 text-muted-foreground">{ar
            ? 'اضغط ابدأ لفتح السؤال. بعد الإجابة بنعرض النتيجة والحل، وبيكون الانتقال للسؤال التالي متاح مباشرة.'
            : 'Open the question, submit an answer, review its solution, and move to the next question.'}</p>
          <div className="flex flex-wrap gap-3">
            <Link href={questionUrl} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground">
              <BookOpen className="h-5 w-5" aria-hidden="true" />
              {completed ? (ar ? 'متابعة التحدي' : 'Continue challenge') : (ar ? 'ابدأ التحدي' : 'Start challenge')}
            </Link>
            <Link href="/dashboard/categories" className="inline-flex min-h-12 items-center gap-2 rounded-xl border px-5 py-3 text-sm font-bold">
              {ar ? 'فئات مرحلتي' : 'My topics'}
            </Link>
          </div>
        </section> : <section className="space-y-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6">
          <CheckCircle2 className="h-10 w-10 text-emerald-600" aria-hidden="true" />
          <h2 className="text-2xl font-extrabold">{ar ? 'أنهيت تحدي اليوم!' : 'Challenge complete!'}</h2>
          <p className="font-bold">{ar
            ? correct + ' إجابات صحيحة · ' + (completed - correct) + ' تحتاج مراجعة'
            : correct + ' correct · ' + (completed - correct) + ' to review'}</p>
          <p className="text-sm text-muted-foreground">{ar
            ? 'المسائل اللي أخطأت فيها بتلاقيها بدفتر الأخطاء. تحدي جديد باليوم التالي بتوقيت UTC.'
            : 'Review incorrect questions in your error notebook. A new challenge arrives the next UTC day.'}</p>
          <div className="flex flex-wrap gap-2">
            <Link href="/dashboard/error-notebook" className="inline-flex min-h-11 items-center rounded-xl border px-4 py-2 font-bold">
              {ar ? 'دفتر الأخطاء' : 'Error notebook'}
            </Link>
            <Link href="/dashboard/categories" className="inline-flex min-h-11 items-center rounded-xl bg-primary px-4 py-2 font-bold text-primary-foreground">
              {ar ? 'تابع التدريب' : 'Keep practising'}
            </Link>
          </div>
        </section>}
      </>}
    </main>
  );
}
