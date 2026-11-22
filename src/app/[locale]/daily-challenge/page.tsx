'use client';

import { useLocale } from 'next-intl';
import { useSelector } from 'react-redux';
import { Link } from '@/i18n/routing';
import { LockKeyhole } from 'lucide-react';
import { LockedPremiumDialog } from '@/components/premium/LockedPremiumDialog';
import { useGetDailyChallengeQuery } from '@/store/api/stagesApi';
import { useGetStudentSubscriptionQuery } from '@/store/api/categoriesApi';
import { useGetLearningStageQuery } from '@/store/api/usersApi';

export default function DailyChallengePage() {
  const ar = useLocale() === 'ar';
  const student = useSelector((state: { auth: { isAuthenticated: boolean; user: { Role?: string } | null } }) =>
    state.auth.isAuthenticated && state.auth.user?.Role === 'Student');
  const { data: membership, isLoading: checking, isError: checkError,
    refetch: retryMembership } = useGetStudentSubscriptionQuery(undefined, {
    skip: !student,
    refetchOnMountOrArgChange: true,
  });
  const upgraded = membership?.IsPremium === true;
  const { data: selectedStage, isLoading: stageLoading } = useGetLearningStageQuery(undefined, { skip: !student });
  const stageId = selectedStage?.StageId ?? 0;
  const { data, isLoading, isError, refetch } = useGetDailyChallengeQuery(stageId, {
    skip: !student || !upgraded || stageId <= 0,
    refetchOnMountOrArgChange: true,
  });

  return <main className="container mx-auto max-w-4xl px-4 py-12" dir={ar ? 'rtl' : 'ltr'}>
    <h1 className="brand-display-title text-gradient-math mb-3 text-3xl font-bold">{ar ? 'تحدي اليوم' : 'Daily challenge'}</h1>
    <p className="mb-7 text-muted-foreground">{ar ? 'خمس مسائل من فئات مرحلتك، مع تنويع الموضوعات قدر الإمكان. تتجدد منتصف الليل بتوقيت UTC، ولا تحدّ عدد مسائل التدريب العادي.' : 'Five questions across your selected stage topics where possible, refreshed at UTC midnight. Regular practice stays unlimited.'}</p>
    {!student && <p>{ar ? 'سجّل الدخول كطالب لتبدأ التحدي.' : 'Sign in as a student to start.'}</p>}
    {student && checking && <p role="status">{ar ? 'عم نتحقق من مزايا حسابك…' : 'Checking account benefits…'}</p>}
    {student && checkError && <div role="alert" className="space-y-3">
      <p>{ar ? 'ما قدرنا نتحقق من مزايا حسابك.' : 'We could not verify account benefits.'}</p>
      <button type="button" onClick={() => void retryMembership()} className="rounded-lg border px-4 py-2">
        {ar ? 'إعادة المحاولة' : 'Retry'}
      </button>
    </div>}
    {student && membership && !upgraded && <div className="rounded-2xl border border-fuchsia-400/20 bg-fuchsia-500/5 p-6">
      <LockKeyhole className="mb-3 h-7 w-7 text-primary" aria-hidden="true" />
      <p className="mb-3 font-semibold">{ar
        ? 'تحديات اليوم بتنفتح لما ترقّي حسابك. حل المسائل المفتوحة بيضل متاح بلا حد.'
        : 'Daily challenges unlock when you upgrade your account. Regular practice remains unlimited in your available topics.'}
      </p>
      <LockedPremiumDialog>
        <button type="button" className="inline-flex min-h-11 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 px-5 py-2.5 font-bold text-white">
          {ar ? 'عرض المميزات والترقية' : 'Benefits & upgrade'}
        </button>
      </LockedPremiumDialog>
    </div>}
    {upgraded && stageLoading && <p role="status">{ar ? 'جارٍ تحديد مرحلتك…' : 'Loading your stage…'}</p>}
    {upgraded && !stageLoading && stageId <= 0 && <Link href="/learning-stage" className="font-bold text-primary underline">{ar ? 'اختر مرحلتك لبدء التحدي' : 'Choose your stage to begin'}</Link>}
    {upgraded && isLoading && <p role="status">{ar ? 'جاري تحميل التحدي…' : 'Loading challenge…'}</p>}
    {upgraded && isError && <div role="alert" className="space-y-3">
      <p>{ar ? 'تعذّر تحميل التحدي. تأكد من اختيار مرحلتك التعليمية.' : 'Could not load the challenge. Check your learning stage.'}</p>
      <button type="button" onClick={() => void refetch()} className="rounded-lg border px-4 py-2">{ar ? 'إعادة المحاولة' : 'Retry'}</button>
      <Link href="/learning-stage" className="ms-3 underline">{ar ? 'اختيار المرحلة' : 'Choose stage'}</Link>
    </div>}
    {upgraded && data && <>
      <div className="mb-7 rounded-2xl border bg-card p-6">
        <p className="text-sm text-muted-foreground">{data.DateUtc} · UTC</p>
        <p className="mt-2 text-2xl font-bold">{data.Completed} / {data.Total}</p>
        <div role="progressbar" aria-valuenow={data.Completed} aria-valuemin={0} aria-valuemax={data.Total} aria-label={ar ? 'إنجاز التحدي' : 'Challenge completion'} className="mt-3 h-3 overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500" style={{ width: `${data.Total ? (100 * data.Completed / data.Total) : 0}%` }} />
        </div>
      </div>
      {data.Completed === data.Total && data.Total > 0 && <p role="status" className="mb-5 rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-4 text-sm font-semibold text-emerald-700 dark:text-emerald-300">{ar ? 'أكملت تحدي اليوم! ارجع بكرا لتحدٍّ جديد.' : 'You completed today’s challenge! Come back tomorrow for fresh problems.'}</p>}
      {data.Total === 0 && <p>{ar ? 'لا توجد مسائل متاحة لهذه المرحلة حالياً.' : 'No eligible problems are available for this stage yet.'}</p>}
      <div className="space-y-3">
        {data.Problems.map((problem, index) => <div key={problem.Id} className="flex items-center justify-between gap-4 rounded-2xl border bg-card p-5">
          <div><p className="text-xs text-muted-foreground">{ar ? 'مسألة' : 'Problem'} {index + 1} · {problem.Points} XP</p>
            <h2 className="mt-1 font-semibold">{ar ? problem.TitleAr : problem.TitleEn}</h2>
            <p className="mt-1 text-sm">{problem.IsSolved ? (ar ? 'تم الحل ✓' : 'Solved ✓') : (ar ? 'بانتظار الحل' : 'Not solved yet')}</p>
          </div>
          <Link href={`/dashboard/problems/${problem.Id}`} className="shrink-0 rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-muted">{ar ? 'افتح المسألة' : 'Open problem'}</Link>
        </div>)}
      </div>
    </>}
  </main>;
}
