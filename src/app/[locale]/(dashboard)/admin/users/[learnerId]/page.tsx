'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { DirectionalArrow, DirectionalChevron } from '@/components/ui/DirectionalNavigation';
import { getApiErrorMessage } from '@/lib/authSession';
import {
  BarChart3, BookOpen, CheckCircle2, Clock3, ListChecks,
  Star, Users, AlertCircle,
} from 'lucide-react';
import {
  useGetAdminLearnerDetailQuery,
  useGetAdminLearnerAttemptsQuery,
  useUpdateAdminLearnerSubscriptionMutation,
  useGetAdminLearnerSubscriptionHistoryQuery,
  useGrantAnnualPremiumMutation,
} from '@/store/api/usersApi';

export default function AdminLearnerDetailPage() {
  const ar = useLocale() === 'ar';
  const params = useParams<{ learnerId: string }>();
  const learnerId = Number(params.learnerId);
  const validId = Number.isSafeInteger(learnerId) && learnerId > 0;
  const [stageId, setStageId] = useState<number | undefined>();
  const [page, setPage] = useState(1);
  const [tierMessage, setTierMessage] = useState('');
  const [tierError, setTierError] = useState('');
  const [tierHistoryPage, setTierHistoryPage] = useState(1);
  const [setSubscription, { isLoading: revokingTier }] =
    useUpdateAdminLearnerSubscriptionMutation();
  const [grantAnnualPremium, { isLoading: grantingTier }] = useGrantAnnualPremiumMutation();


  const { data, isLoading, isError, refetch } = useGetAdminLearnerDetailQuery(
    { LearnerId: learnerId, StageId: stageId }, { skip: !validId, refetchOnMountOrArgChange: true },
  );
  const { data: attemptData, isLoading: attemptsLoading, isError: attemptsError } =
    useGetAdminLearnerAttemptsQuery(
      { LearnerId: learnerId, StageId: stageId ?? data?.Learner.CurrentStageId ?? undefined, Page: page },
      { skip: !validId || isError, refetchOnMountOrArgChange: true },
    );

  const tierHistory = useGetAdminLearnerSubscriptionHistoryQuery(
    { LearnerId: learnerId, Page: tierHistoryPage, PageSize: 10 },
    { skip: !validId, refetchOnMountOrArgChange: true },
  );

  const label = ar ? {
    back: 'العودة إلى الطلاب', title: 'ملف الطالب', active: 'نشط', disabled: 'معطّل',
    stage: 'المرحلة الحالية', noStage: 'لم يحدد المرحلة', joined: 'تاريخ التسجيل',
    login: 'آخر تسجيل دخول', activity: 'آخر محاولة', never: 'لا يوجد نشاط',
    plan: 'نوع الحساب', solved: 'مسائل محلولة', attempts: 'إجمالي المحاولات',
    points: 'النقاط المكتسبة', accuracy: 'دقة الإجابات',
    firstTry: 'صحيحة من أول مرة', favorites: 'المفضلة',
    errors: 'مسائل بدفتر الأخطاء', time: 'وقت حل المسائل',
    stages: 'تقدم الطالب في كل مرحلة', categories: 'التقدم حسب التصنيف',
    history: 'سجل الإجابات', allStages: 'كل المراحل',
    question: 'المسألة', result: 'النتيجة', attempt: 'نوع المحاولة',
    correct: 'صحيحة', incorrect: 'خاطئة', official: 'رسمية', training: 'تدريبية',
    pointsAwarded: 'النقاط', spent: 'المدة', date: 'التاريخ', hinted: 'استخدم تلميح',
    started: 'المحاولة', complete: 'الإنجاز', mastered: 'الأخطاء المفتوحة',
    loading: 'جاري تحميل ملف الطالب...', errorLoading: 'تعذر تحميل ملف الطالب.',
    retry: 'إعادة المحاولة', empty: 'لا توجد محاولات لهذه المرحلة.',
    prev: 'السابق', next: 'التالي', page: 'صفحة', noCategories: 'لم تُحدد مرحلة لعرض التصنيفات.',
    noAttempts: 'لا يوجد سجل محاولات.',
    manageTier: 'إدارة اشتراك الطالب', saveTier: 'حفظ الاشتراك',
    tierHint: 'التغيير يطبّق فوراً على صلاحيات الطالب دون دفع إلكتروني.',
    tierConfirm: 'هل تريد تغيير اشتراك الطالب الآن؟',
    tierSuccess: 'تم تحديث الاشتراك. يُفضّل أن يحدّث الطالب صفحته لرؤية المميزات.',
    tierError: 'تعذر تغيير اشتراك الطالب.',

  } : {
    back: 'Back to students', title: 'Learner profile', active: 'Active', disabled: 'Disabled',
    stage: 'Current stage', noStage: 'Not selected', joined: 'Joined',
    login: 'Last login', activity: 'Last attempt', never: 'No activity',
    plan: 'Plan', solved: 'Solved problems', attempts: 'Attempts',
    points: 'Earned points', accuracy: 'Answer accuracy',
    firstTry: 'First-try correct', favorites: 'Favorites',
    errors: 'Open error notebook', time: 'Total solving time',
    stages: 'Progress by stage', categories: 'Category progress',
    history: 'Answer history', allStages: 'All stages',
    question: 'Problem', result: 'Result', attempt: 'Attempt type',
    correct: 'Correct', incorrect: 'Incorrect', official: 'Official', training: 'Practice',
    pointsAwarded: 'Points', spent: 'Time', date: 'Date', hinted: 'Hint used',
    started: 'Attempted', complete: 'Completion', mastered: 'Open errors',
    loading: 'Loading learner profile...', errorLoading: 'Could not load the learner.',
    retry: 'Retry', empty: 'No attempts recorded in this stage.',
    prev: 'Previous', next: 'Next', page: 'Page', noCategories: 'Select a stage to see categories.',
    noAttempts: 'No recorded attempts.',
    manageTier: 'Manage learner subscription', saveTier: 'Save plan',
    tierHint: 'Changes take effect on the server immediately; no payment is charged.',
    tierConfirm: 'Change this learner subscription now?',
    tierSuccess: 'Plan updated. The learner should refresh to see the latest benefits.',
    tierError: 'Could not update this learner subscription.',

  };

  const currentTier = data?.Learner.SubscriptionType === 'Premium'
    ? 'Premium' : 'Free';

  const grantYear = async () => {
    if (!validId || grantingTier || revokingTier) return;
    setTierMessage('');
    setTierError('');
    try {
      const result = await grantAnnualPremium([learnerId]).unwrap();
      // Both detail and directory refetch automatically via RTK tags;
      // wait for this detail here so the status changes without page refresh.
      await refetch().unwrap();
      void tierHistory.refetch();
      setTierMessage(result.SkippedIndefiniteIds.length
        ? (ar ? 'الطالب Premium بلا تاريخ انتهاء، ولم يتم تقصير اشتراكه.' : 'Learner already has indefinite Premium access; no term was shortened.')
        : (ar ? 'تم تفعيل أو تجديد Premium لمدة سنة بنجاح.' : 'One year of Premium was granted or renewed.'));
    } catch (error) {
      setTierError(getApiErrorMessage(error, label.tierError));
    }
  };

  const revokePremium = async () => {
    if (!validId || grantingTier || revokingTier || currentTier !== 'Premium') return;
    setTierMessage('');
    setTierError('');
    try {
      await setSubscription({
        LearnerId: learnerId,
        Change: {
          SubscriptionType: 'Free',
          PremiumExpiresAtUtc: null,
          Reason: 'AdminPremiumRevocation',
        },
      }).unwrap();
      await refetch().unwrap();
      void tierHistory.refetch();
      setTierMessage(ar ? 'تم إلغاء Premium وأصبح الحساب Free.' : 'Premium revoked; the account is now Free.');
    } catch (error) {
      setTierError(getApiErrorMessage(error, label.tierError));
    }
  };

  const nf = (n: number) => new Intl.NumberFormat(ar ? 'ar' : 'en').format(n);
  const date = (value?: string | null) =>
    value ? new Date(value).toLocaleString(ar ? 'ar' : 'en', {
      dateStyle: 'medium', timeStyle: 'short',
    }) : label.never;
  const stageName = (stage: { NameAr: string; NameEn: string }) => ar ? stage.NameAr : stage.NameEn;
  const selectedStage = stageId ?? data?.Learner.CurrentStageId;
  const timeDisplay = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remaining = seconds % 60;
    return minutes > 0
      ? `${nf(minutes)} ${ar ? 'د' : 'min'} ${remaining ? `${nf(remaining)} ${ar ? 'ث' : 'sec'}` : ''}`
      : `${nf(remaining)} ${ar ? 'ث' : 'sec'}`;
  };
  const summary = data ? [
    { label: label.solved, value: nf(data.Learner.SolvedProblems), Icon: BookOpen },
    { label: label.attempts, value: nf(data.TotalAttempts), Icon: ListChecks },
    { label: label.points, value: nf(data.Learner.TotalAwardedPoints), Icon: Star },
    { label: label.accuracy, value: `${data.CorrectRatePercent}%`, Icon: CheckCircle2 },
    { label: label.firstTry, value: nf(data.FirstTryCorrect), Icon: BarChart3 },
    { label: label.favorites, value: nf(data.FavoriteProblems), Icon: Users },
    { label: label.errors, value: nf(data.OpenErrorNotebookProblems), Icon: AlertCircle },
    { label: label.time, value: timeDisplay(data.TotalTimeSpentSeconds), Icon: Clock3 },
  ] : [];

  return (
    <main className="container mx-auto max-w-7xl px-4 py-8 md:px-10">
      <Link href="/admin/users" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
        <DirectionalArrow direction="back" className="h-4 w-4" />{label.back}
      </Link>
      {!validId || isError ? (
        <div role="alert" className="math-card rounded-2xl border border-destructive/30 p-8 text-center">
          <p>{label.errorLoading}</p>
          {validId && <button type="button" onClick={() => refetch()} className="mt-3 rounded-xl border border-primary/30 px-4 py-2">{label.retry}</button>}
        </div>
      ) : isLoading || !data ? (
        <div role="status" className="math-card rounded-2xl border border-border p-10 text-center">{label.loading}</div>
      ) : (
        <>
          <header className="math-card mb-6 rounded-2xl border border-border p-5 md:p-7">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="mb-2 text-sm text-muted-foreground">{label.title} #{data.Learner.Id}</p>
                <h1 className="brand-display-title text-gradient-math text-2xl font-bold md:text-3xl">{data.Learner.FullName}</h1>
                <p className="mt-2 text-sm text-muted-foreground" dir="ltr">{data.Learner.Email}</p>
              </div>
              <div className="flex gap-2">
                <span className={`rounded-xl px-3 py-2 text-sm font-medium ${
                  data.Learner.IsActive ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'
                }`}>{data.Learner.IsActive ? label.active : label.disabled}</span>
                <span className="rounded-xl border border-border px-3 py-2 text-sm">{data.Learner.SubscriptionType}</span>
              </div>
            </div>
            <div className="mt-5 space-y-3 rounded-xl border border-border bg-muted/20 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold">{label.manageTier}</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {ar ? 'Premium لمدة سنة من تاريخ التفعيل. التجديد يضيف سنة إلى المدة المتبقية.'
                      : 'Premium for one year. Renewals add one year to the remaining term.'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" disabled={grantingTier || revokingTier || !data.Learner.IsActive}
                    onClick={() => void grantYear()}
                    className="min-h-11 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-50">
                    {grantingTier ? label.loading : currentTier === 'Premium'
                      ? (ar ? 'تجديد Premium سنة' : 'Renew Premium for 1 year')
                      : (ar ? 'تفعيل Premium سنة' : 'Activate Premium for 1 year')}
                  </button>
                  {currentTier === 'Premium' && (
                    <button type="button" disabled={grantingTier || revokingTier}
                      onClick={() => void revokePremium()}
                      className="min-h-11 rounded-xl border border-destructive/40 px-4 py-2 text-sm font-semibold text-destructive hover:bg-destructive/10 disabled:opacity-50">
                      {revokingTier ? label.loading : ar ? 'إلغاء Premium' : 'Revoke Premium'}
                    </button>
                  )}
                </div>
              </div>
              {currentTier === 'Premium' && data.Learner.PremiumExpiresAtUtc && (
                <p className="text-xs text-muted-foreground">{ar ? 'ينتهي في: ' : 'Expires: '}{new Date(data.Learner.PremiumExpiresAtUtc).toLocaleDateString(ar ? 'ar' : 'en')}</p>
              )}
              {tierMessage && <p role="status" className="text-sm font-semibold text-primary">{tierMessage}</p>}
              {tierError && <p role="alert" className="text-sm text-destructive">{tierError}</p>}
            </div>
            <dl className="mt-5 grid gap-3 border-t border-border pt-4 text-sm md:grid-cols-3 xl:grid-cols-4">
              {[
                [label.stage, (ar ? data.Learner.StageNameAr : data.Learner.StageNameEn) || label.noStage],
                [label.joined, date(data.Learner.CreatedAt)],
                [label.login, date(data.Learner.LastLoginAt)],
                [label.activity, date(data.Learner.LastAttemptAt)],
              ].map(([title, value]) => (
                <div key={title}><dt className="text-xs text-muted-foreground">{title}</dt><dd className="mt-1 font-medium">{value}</dd></div>
              ))}
            </dl>
          </header>

          <section className="mb-7 rounded-2xl border border-border bg-card p-4 sm:p-5"
            aria-label={ar ? 'سجل تغييرات اشتراك الطالب' : 'Learner subscription change history'}>
            <h2 className="mb-3 text-lg font-bold">{ar ? 'سجل تغييرات الاشتراك' : 'Subscription change history'}</h2>
            {tierHistory.isFetching && (
              <p role="status" className="text-sm text-muted-foreground">{ar ? 'جارٍ تحميل السجل…' : 'Loading change history…'}</p>
            )}
            {tierHistory.isError && (
              <div role="alert" className="space-y-2 text-sm text-destructive">
                <p>{ar ? 'تعذّر تحميل سجل الاشتراك.' : 'Could not load subscription history.'}</p>
                <button type="button" className="font-semibold underline" onClick={() => void tierHistory.refetch()}>
                  {label.retry}
                </button>
              </div>
            )}
            {!tierHistory.isFetching && !tierHistory.isError && tierHistory.data?.Records.length === 0 && (
              <p className="text-sm text-muted-foreground">{ar ? 'لا توجد تغييرات مسجلة.' : 'No recorded changes.'}</p>
            )}
            {!tierHistory.isError && (
              <ol className="space-y-2">
                {tierHistory.data?.Records.map(record => (
                  <li key={record.Id} className="rounded-xl border border-border/70 p-3 text-sm">
                    <div className="font-semibold" dir="ltr">{record.PreviousType} → {record.NewType}</div>
                    <p className="mt-1 break-words">{record.Reason}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {date(record.ChangedAtUtc)}
                      {record.NewExpiresAtUtc && ` · ${ar ? 'ينتهي' : 'Expires'}: ${date(record.NewExpiresAtUtc)}`}
                    </p>
                  </li>
                ))}
              </ol>
            )}
            {!tierHistory.isError && (tierHistory.data?.Total ?? 0) > 10 && (
              <div className="mt-3 flex items-center gap-3 text-sm">
                <button type="button" disabled={tierHistoryPage <= 1 || tierHistory.isFetching}
                  className="rounded-lg border px-3 py-1.5 disabled:opacity-40"
                  onClick={() => setTierHistoryPage(p => Math.max(1, p - 1))}>{label.prev}</button>
                <span>{tierHistoryPage}</span>
                <button type="button" disabled={tierHistory.isFetching || tierHistoryPage * 10 >= (tierHistory.data?.Total ?? 0)}
                  className="rounded-lg border px-3 py-1.5 disabled:opacity-40"
                  onClick={() => setTierHistoryPage(p => p + 1)}>{label.next}</button>
              </div>
            )}
          </section>

          <section aria-label={label.title} className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {summary.map(({ label: title, value, Icon }) => (
              <div key={title} className="math-card rounded-2xl border border-border p-4">
                <Icon className="mb-2 h-5 w-5 text-primary" aria-hidden />
                <p className="text-2xl font-bold tabular-nums">{value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{title}</p>
              </div>
            ))}
          </section>

          <section aria-label={label.stages}>
            <h2 className="mb-4 text-xl font-bold">{label.stages}</h2>
            <div className="mb-8 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {data.Stages.map((stage) => (
                <button type="button" key={stage.StageId}
                  aria-pressed={selectedStage === stage.StageId}
                  onClick={() => {setStageId(stage.StageId); setPage(1);}}
                  className={`math-card rounded-2xl border p-4 text-start ${
                    selectedStage === stage.StageId ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
                  }`}>
                  <h3 className="mb-3 font-bold">{stageName(stage)}</h3>
                  <div className="flex items-center justify-between text-sm">
                    <span>{label.solved}: {nf(stage.SolvedProblems)} / {nf(stage.TotalProblems)}</span>
                    <strong className="text-primary">{stage.CompletionPercent}%</strong>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, stage.CompletionPercent)}%` }} />
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">{label.points}: {nf(stage.AwardedPoints)} · {label.firstTry}: {nf(stage.FirstTryCorrect)}</p>
                </button>
              ))}
            </div>
          </section>

          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold">{label.categories}</h2>
            <label className="flex items-center gap-2 text-sm">
              <span>{label.stage}</span>
              <select value={stageId ?? selectedStage ?? ''} onChange={(e) => {
                setStageId(e.target.value ? Number(e.target.value) : undefined);
                setPage(1);
              }} className="rounded-xl border border-border bg-card px-3 py-2">
                {!selectedStage && <option value="">{label.allStages}</option>}
                {data.Stages.map((stage) =>
                  <option key={stage.StageId} value={stage.StageId}>{stageName(stage)}</option>)}
              </select>
            </label>
          </div>

          <section className="math-card mb-7 overflow-x-auto rounded-2xl border border-border">
            {!data.Categories.length ? (
              <p className="p-10 text-center text-muted-foreground">{label.noCategories}</p>
            ) : (
              <table className="w-full min-w-[560px] text-sm">
                <thead className="bg-muted/40"><tr>
                  {[label.categories, label.solved, label.started, label.firstTry, label.errors].map((col) =>
                    <th key={col} className="px-4 py-3 text-start font-medium">{col}</th>)}
                </tr></thead>
                <tbody>{data.Categories.map((cat) => (
                  <tr className="border-t border-border" key={cat.CategoryId}>
                    <td className="px-4 py-3 font-medium">{stageName(cat)}</td>
                    <td className="px-4 py-3">{nf(cat.SolvedProblems)} / {nf(cat.TotalProblems)}</td>
                    <td className="px-4 py-3">{nf(cat.AttemptedProblems)}</td>
                    <td className="px-4 py-3">{nf(cat.FirstTryCorrect)}</td>
                    <td className="px-4 py-3">{nf(cat.InErrorNotebook)}</td>
                  </tr>
                ))}</tbody>
              </table>
            )}
          </section>

          <section className="math-card overflow-hidden rounded-2xl border border-border">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-5 py-4">
              <h2 className="text-xl font-bold">{label.history}</h2>
              <p className="text-sm text-muted-foreground">{attemptData?.Total ?? 0} {label.attempts}</p>
            </div>
            {attemptsLoading ? <p role="status" className="p-10 text-center">{label.loading}</p>
              : attemptsError ? <p role="alert" className="p-10 text-center text-destructive">{label.errorLoading}</p>
              : !attemptData?.Attempts.length ? <p className="p-10 text-center text-muted-foreground">{label.noAttempts}</p>
              : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] text-sm">
                      <thead className="bg-muted/40"><tr>
                        {[label.question, label.result, label.attempt, label.pointsAwarded,
                          label.spent, label.date].map((col) =>
                          <th className="px-4 py-3 text-start font-medium" key={col}>{col}</th>)}
                      </tr></thead>
                      <tbody>{attemptData.Attempts.map((attempt) => (
                        <tr key={attempt.Id} className="border-t border-border">
                          <td className="max-w-[250px] px-4 py-3">
                            <p className="font-medium">{ar ? attempt.TitleAr : attempt.TitleEn}</p>
                            <p className="mt-1 text-xs text-muted-foreground">#{attempt.ProblemId}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className={attempt.IsCorrect ? 'text-primary' : 'text-destructive'}>
                              {attempt.IsCorrect ? label.correct : label.incorrect}
                            </span>
                          </td>
                          <td className="px-4 py-3">{attempt.IsOfficial ? label.official : label.training} #{attempt.AttemptNumber}{attempt.UsedHint ? ` · ${label.hinted}` : ''}</td>
                          <td className="px-4 py-3 tabular-nums">{nf(attempt.PointsEarned)}</td>
                          <td className="px-4 py-3 tabular-nums">{nf(attempt.TimeSpentSeconds)}s</td>
                          <td className="px-4 py-3 text-muted-foreground">{date(attempt.SubmittedAt)}</td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                  <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3 text-sm">
                    <span>{label.page} {attemptData.Page} / {Math.max(1, attemptData.TotalPages)}</span>
                    <div className="flex gap-2">
                      <button type="button" disabled={page <= 1} onClick={() => setPage(v => v - 1)}
                        className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 disabled:opacity-40"><DirectionalChevron direction="back" className="h-4 w-4" />{label.prev}</button>
                      <button type="button" disabled={page >= attemptData.TotalPages} onClick={() => setPage(v => v + 1)}
                        className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 disabled:opacity-40">{label.next}<DirectionalChevron direction="forward" className="h-4 w-4" /></button>
                    </div>
                  </div>
                </>
              )}
          </section>
        </>
      )}
    </main>
  );
}
