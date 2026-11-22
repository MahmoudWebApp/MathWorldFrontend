'use client';

import { useLocale } from 'next-intl';
import { useSelector } from 'react-redux';
import { Link } from '@/i18n/routing';
import { CheckCircle2, CircleAlert, LockKeyhole, Target } from 'lucide-react';
import { LockedPremiumDialog } from '@/components/premium/LockedPremiumDialog';
import { useGetDailyChallengeQuery } from '@/store/api/stagesApi';
import { useGetStudentSubscriptionQuery } from '@/store/api/categoriesApi';
import { useGetLearningStageQuery } from '@/store/api/usersApi';

/** A five-step challenge: only the next unanswered question is offered.
 * Completing an answer (right OR wrong) advances the workflow. */
export default function DailyChallengePage() {
  const ar = useLocale() === 'ar';
  const student = useSelector((state: { auth: { isAuthenticated: boolean; user: { Role?: string } | null } }) =>
    state.auth.isAuthenticated && state.auth.user?.Role === 'Student');
  const { data: membership, isLoading: checking, isError: membershipError, refetch: retryMembership } =
    useGetStudentSubscriptionQuery(undefined, { skip: !student, refetchOnMountOrArgChange: true });
  const upgraded = membership?.IsPremium === true;
  const { data: selectedStage, isLoading: stageLoading } =
    useGetLearningStageQuery(undefined, { skip: !student });
  const stageId = selectedStage?.StageId ?? 0;
  const { data, isLoading, isError, refetch } = useGetDailyChallengeQuery(stageId, {
    skip: !student || !upgraded || stageId <= 0,
    refetchOnMountOrArgChange: true,
  });
  const nextIndex = data?.Problems.findIndex(p => !p.IsAnswered) ?? -1;
  const next = nextIndex >= 0 ? data?.Problems[nextIndex] : undefined;
  const correct = data?.Correct ?? 0;
  const total = data?.Total ?? 0;
  const completed = data?.Completed ?? 0;

  return (
    <main className="mx-auto w-full max-w-3xl space-y-5 px-4 py-6 sm:px-6" dir={ar ? 'rtl' : 'ltr'}>
      <header>
        <h1 className="brand-display-title text-gradient-math text-3xl font-bold">
          {ar ? 'تحدي اليوم' : 'Daily challenge'}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {ar ? 'تحدٍّ من خمس مسائل في مرحلتك. بعد إرسال إجابة كل مسألة تنتقل تلقائياً للتالية، والتدريب العادي بلا حد.'
            : 'Five questions from your stage. Submitting each answer advances to the next, while regular practice remains unlimited.'}
        </p>
      </header>

      {!student && <p>{ar ? 'سجّل الدخول كطالب لبدء التحدي.' : 'Sign in as a learner to start.'}</p>}
      {student && checking && <p role="status">{ar ? 'جارٍ التحقق من حسابك…' : 'Checking account…'}</p>}
      {student && membershipError && (
        <div role="alert" className="space-y-2 rounded-2xl border p-4">
          <p>{ar ? 'تعذر التحقق من صلاحيات حسابك.' : 'Could not check account access.'}</p>
          <button type="button" onClick={() => void retryMembership()} className="rounded-xl border px-4 py-2">
            {ar ? 'إعادة المحاولة' : 'Retry'}
          </button>
        </div>
      )}
      {student && membership && !upgraded && (
        <div className="rounded-2xl border border-fuchsia-400/20 bg-fuchsia-500/5 p-6">
          <LockKeyhole className="mb-3 h-7 w-7 text-primary" aria-hidden="true" />
          <p className="mb-4 font-semibold">{ar ? 'تحدي اليوم ميزة Premium. فئات Free المفتوحة تبقى متاحة للتدريب.'
            : 'The daily challenge is a Premium benefit. Free topics remain available for practice.'}</p>
          <LockedPremiumDialog>
            <button type="button" className="min-h-11 rounded-xl bg-primary px-5 py-2 font-bold text-primary-foreground">
              {ar ? 'عرض المميزات' : 'View benefits'}
            </button>
          </LockedPremiumDialog>
        </div>
      )}
      {upgraded && stageLoading && <p role="status">{ar ? 'جارٍ تحميل مرحلتك…' : 'Loading your stage…'}</p>}
      {upgraded && !stageLoading && stageId <= 0 &&
        <Link href="/learning-stage" className="font-semibold text-primary underline">
          {ar ? 'اختيار المرحلة' : 'Select stage'}
        </Link>}
      {upgraded && isLoading && <p role="status">{ar ? 'جارٍ تحميل التحدي…' : 'Loading challenge…'}</p>}
      {upgraded && isError && (
        <div role="alert" className="space-y-2 rounded-2xl border p-4">
          <p>{ar ? 'تعذر تحميل التحدي.' : 'Could not load the challenge.'}</p>
          <button type="button" onClick={() => void refetch()} className="rounded-xl border px-4 py-2">
            {ar ? 'إعادة المحاولة' : 'Retry'}
          </button>
        </div>
      )}

      {upgraded && data && (
        <>
          <section className="rounded-2xl border bg-card p-5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">{data.DateUtc} · UTC</span>
              <span className="font-extrabold" dir="ltr">{completed} / {total}</span>
            </div>
            <div className="mt-3 grid grid-cols-5 gap-1.5" role="progressbar"
              aria-label={ar ? 'تقدم تحدي اليوم' : 'Daily challenge progress'}
              aria-valuemin={0} aria-valuemax={total} aria-valuenow={completed}>
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className={`h-2 rounded-full ${i < completed
                  ? 'bg-gradient-to-r from-violet-600 to-fuchsia-500' : 'bg-muted'}`} />
              ))}
            </div>
          </section>
          {total === 0 ? (
            <div className="rounded-2xl border bg-card p-6">
              <CircleAlert className="mb-3 h-8 w-8 text-primary" aria-hidden="true" />
              <p>{ar ? 'ما في مسائل جديدة كافية للتحدي اليوم. كمل تدريب الفئات أو ابدأ دورة جديدة من صفحة الفئات.'
                : 'No new eligible challenge questions today. Continue topic practice or restart a topic cycle.'}</p>
              <Link href="/dashboard/categories" className="mt-3 inline-block text-primary underline">
                {ar ? 'اكتشف فئات مرحلتك' : 'Explore your topics'}
              </Link>
            </div>
          ) : next ? (
            <section className="space-y-4 rounded-2xl border bg-card p-6">
              <span className="inline-flex items-center gap-2 text-sm font-bold text-primary">
                <Target className="h-4 w-4" aria-hidden="true" />
                {ar ? `المسألة ${nextIndex + 1} من ${total}` : `Problem ${nextIndex + 1} of ${total}`}
              </span>
              <h2 className="text-xl font-bold">{ar ? next.TitleAr : next.TitleEn}</h2>
              <p className="text-sm text-muted-foreground">{ar
                ? 'حل المسألة وأرسل الإجابة. بعدها يظهر السؤال التالي تلقائياً.'
                : 'Solve and submit your answer. The next question will appear automatically.'}</p>
              <Link href={`/dashboard/problems/${next.Id}?daily=${encodeURIComponent(data.DateUtc)}&stageId=${stageId}&step=${nextIndex}`}
                className="inline-flex min-h-11 items-center rounded-xl bg-primary px-5 py-2.5 font-semibold text-primary-foreground">
                {ar ? 'ابدأ المسألة' : 'Start question'}
              </Link>
            </section>
          ) : (
            <section role="status" className="space-y-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6">
              <CheckCircle2 className="h-10 w-10 text-emerald-600" aria-hidden="true" />
              <h2 className="text-2xl font-extrabold">{ar ? 'أكملت تحدي اليوم!' : 'Daily challenge complete!'}</h2>
              <p className="font-semibold">{ar
                ? `${correct} صحيحة · ${completed - correct} بحاجة مراجعة · ${completed} من ${total} مجابة`
                : `${correct} correct · ${completed - correct} to review · ${completed} of ${total} answered`}</p>
              <p className="text-sm text-muted-foreground">{ar
                ? 'الأسئلة الخاطئة موجودة بدفتر الأخطاء. تحدٍّ جديد غداً بتوقيت UTC.'
                : 'Incorrect answers appear in your error notebook. A fresh challenge arrives tomorrow (UTC).'}</p>
              <Link href="/dashboard/error-notebook" className="inline-flex min-h-11 items-center rounded-xl border px-4 py-2 font-semibold">
                {ar ? 'دفتر الأخطاء' : 'Error notebook'}
              </Link>
            </section>
          )}
        </>
      )}
    </main>
  );
}
