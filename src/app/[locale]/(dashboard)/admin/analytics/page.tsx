'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Activity, BookOpen, CheckCircle2, Users, Trophy, ArrowRight, ShieldCheck } from 'lucide-react';
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import {
  useGetAdminAnalyticsOverviewQuery, useGetAdminAnalyticsStageQuery,
  type AdminStageAnalytics,
} from '@/store/api/statsApi';

const periods = [7, 30, 90] as const;

export default function AdminAnalyticsPage() {
  const isArabic = useLocale() === 'ar';
  const [days, setDays] = useState<(typeof periods)[number]>(30);
  const [chosenStage, setChosenStage] = useState<number | null>(null);
  const { data: overview, isLoading, isError, refetch } =
    useGetAdminAnalyticsOverviewQuery(days, { refetchOnMountOrArgChange: true });
  const stageId = chosenStage ?? overview?.Stages[0]?.StageId ?? 0;
  const { data: detail, isLoading: loadingDetail, isError: detailError } =
    useGetAdminAnalyticsStageQuery({ stageId, days }, {
      skip: stageId <= 0, refetchOnMountOrArgChange: true,
    });
  const n = (value: number) => new Intl.NumberFormat(isArabic ? 'ar' : 'en').format(value);
  const labels = isArabic ? {
    title: 'مركز إدارة MathWorld',
    subtitle: 'مراقبة الطلاب وجودة المحتوى والأداء الحقيقي حسب المرحلة التعليمية',
    admin: 'وضع الإدارة — لا تُحتسب لك نقاط أو حلول',
    back: 'العودة للإدارة',
    days: 'آخر {days} يوم',
    students: 'الطلاب', active: 'الطلاب النشطون', problems: 'المسائل',
    solved: 'حلول فريدة', attempts: 'المحاولات', accuracy: 'دقة الإجابات',
    stages: 'أداء المراحل', categories: 'التصنيفات في المرحلة', activity: 'النشاط اليومي',
    leaders: 'المتفوقون في المرحلة', noActivity: 'ما في نشاط خلال الفترة المختارة.',
    total: 'الإجمالي', selected: 'اختاروا المرحلة', attempt: 'محاولة',
    correct: 'إجابة صحيحة', points: 'نقطة', firstTry: 'صحيح من أول مرة',
    learner: 'الطالب', score: 'النقاط المحفوظة', error: 'تعذر تحميل بيانات الإدارة.',
    retry: 'إعادة المحاولة', loading: 'جاري تحميل الإحصائيات...',
    empty: 'لا توجد بيانات لهذه المرحلة بعد.',
  } : {
    title: 'MathWorld Control Center',
    subtitle: 'Monitor student engagement and content quality at every educational stage',
    admin: 'Admin mode — your account does not earn solutions or points',
    back: 'Back to admin',
    days: 'Last {days} days',
    students: 'Students', active: 'Active students', problems: 'Problems',
    solved: 'Unique solves', attempts: 'Attempts', accuracy: 'Answer accuracy',
    stages: 'Stage performance', categories: 'Stage categories', activity: 'Daily activity',
    leaders: 'Top learners', noActivity: 'No recorded activity in this period.',
    total: 'Total', selected: 'Selected this stage', attempt: 'Attempts',
    correct: 'Correct', points: 'Points', firstTry: 'First try',
    learner: 'Learner', score: 'Recorded points', error: 'Could not load admin analytics.',
    retry: 'Retry', loading: 'Loading analytics...',
    empty: 'No data for this stage yet.',
  };

  const cards = overview ? [
    { label: labels.students, value: n(overview.TotalStudents), icon: Users },
    { label: labels.active, value: n(overview.ActiveStudentsInWindow), icon: Activity },
    { label: labels.problems, value: n(overview.TotalProblems), icon: BookOpen },
    { label: labels.solved, value: n(overview.TotalUniqueSolved), icon: Trophy },
    { label: labels.attempts, value: n(overview.AttemptsInWindow), icon: CheckCircle2 },
    { label: labels.accuracy, value: `${overview.CorrectRatePercent}%`, icon: ShieldCheck },
  ] : [];

  const displayStage = (stage: AdminStageAnalytics) => isArabic ? stage.NameAr : stage.NameEn;
  const activity = detail?.DailyActivity.map((day) => ({
    label: new Date(day.DayUtc).toLocaleDateString(isArabic ? 'ar' : 'en', {
      month: 'short', day: 'numeric', timeZone: 'UTC',
    }),
    attempts: day.Attempts,
    correct: day.CorrectAttempts,
  })) ?? [];

  return (
    <main className="container mx-auto max-w-7xl px-4 py-8 md:px-10">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="brand-display-title text-gradient-math text-3xl font-bold">
            {labels.title}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{labels.subtitle}</p>
          <p className="mt-2 inline-flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-xs font-medium text-primary">
            <ShieldCheck className="h-4 w-4" aria-hidden />{labels.admin}
          </p>
        </div>
        <Link href="/admin" className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm hover:bg-muted">
          <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />{labels.back}
        </Link>
      </div>

      <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label={labels.activity}>
        {periods.map((option) => (
          <button
            type="button" key={option} aria-pressed={days === option}
            onClick={() => setDays(option)}
            className={`rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
              days === option ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border text-foreground hover:border-primary/50'
            }`}
          >
            {labels.days.replace('{days}', String(option))}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p role="status" className="math-card rounded-2xl border border-border p-8 text-center">
          {labels.loading}
        </p>
      ) : isError || !overview ? (
        <div role="alert" className="math-card rounded-2xl border border-destructive/30 p-8">
          <p>{labels.error}</p>
          <button type="button" onClick={() => refetch()} className="mt-3 rounded-xl bg-primary px-4 py-2 text-primary-foreground">
            {labels.retry}
          </button>
        </div>
      ) : (
        <>
          <section aria-label={labels.total} className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            {cards.map(({ label, value, icon: Icon }) => (
              <div key={label} className="math-card rounded-2xl border border-border p-4">
                <Icon className="mb-3 h-6 w-6 text-primary" aria-hidden />
                <p className="text-2xl font-bold tabular-nums">{value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </section>

          <section aria-label={labels.stages}>
            <h2 className="mb-4 text-xl font-bold">{labels.stages}</h2>
            <div className="mb-8 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {overview.Stages.map((stage) => (
                <button type="button" key={stage.StageId}
                  onClick={() => setChosenStage(stage.StageId)}
                  aria-pressed={stageId === stage.StageId}
                  className={`math-card rounded-2xl border p-5 text-start transition-colors ${
                    stageId === stage.StageId ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                  }`}
                >
                  <h3 className="text-lg font-bold">{displayStage(stage)}</h3>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <div><strong className="text-xl">{n(stage.SelectedStudents)}</strong><p className="text-xs text-muted-foreground">{labels.selected}</p></div>
                    <div><strong className="text-xl">{n(stage.ActiveStudentsInWindow)}</strong><p className="text-xs text-muted-foreground">{labels.active}</p></div>
                    <div><strong className="text-xl">{n(stage.UniqueSolved)}</strong><p className="text-xs text-muted-foreground">{labels.solved}</p></div>
                    <div><strong className="text-xl">{n(stage.AttemptsInWindow)}</strong><p className="text-xs text-muted-foreground">{labels.attempts}</p></div>
                  </div>
                  <div className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground">
                    {labels.problems}: {n(stage.Problems)} · {labels.accuracy}: {stage.CorrectRatePercent}%
                  </div>
                </button>
              ))}
            </div>
          </section>

          {loadingDetail ? (
            <div role="status" className="math-card rounded-2xl border border-border p-10 text-center">{labels.loading}</div>
          ) : detailError || !detail ? (
            <p role="alert" className="math-card rounded-2xl border border-destructive/30 p-6">{labels.error}</p>
          ) : (
            <div className="grid gap-6 xl:grid-cols-2">
              <section className="math-card rounded-2xl border border-border p-5">
                <h2 className="mb-4 text-lg font-bold">{labels.activity} — {displayStage(detail.Summary)}</h2>
                {detail.Summary.AttemptsInWindow === 0 ? (
                  <div className="py-20 text-center text-muted-foreground">{labels.noActivity}</div>
                ) : (
                  <div dir="ltr" className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={activity} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="label" minTickGap={20} tick={{ fontSize: 11 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Area type="monotone" dataKey="attempts" name={labels.attempt} stroke="var(--color-brand-primary-strong)" fill="var(--color-brand-primary-strong)" fillOpacity={0.15} />
                        <Area type="monotone" dataKey="correct" name={labels.correct} stroke="var(--color-brand-secondary)" fill="var(--color-brand-secondary)" fillOpacity={0.1} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </section>

              <section className="math-card rounded-2xl border border-border p-5">
                <h2 className="mb-4 text-lg font-bold">{labels.categories}</h2>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[420px] text-sm">
                    <thead><tr className="border-b border-border text-muted-foreground">
                      <th className="px-2 py-3 text-start">{labels.categories}</th>
                      <th className="px-2 py-3 text-end">{labels.problems}</th>
                      <th className="px-2 py-3 text-end">{labels.solved}</th>
                      <th className="px-2 py-3 text-end">{labels.attempts}</th>
                    </tr></thead>
                    <tbody>{detail.Categories.map((cat) => (
                      <tr className="border-b border-border last:border-0" key={cat.CategoryId}>
                        <td className="px-2 py-3">{isArabic ? cat.NameAr : cat.NameEn}</td>
                        <td className="px-2 py-3 text-end tabular-nums">{n(cat.Problems)}</td>
                        <td className="px-2 py-3 text-end tabular-nums">{n(cat.UniqueSolved)}</td>
                        <td className="px-2 py-3 text-end tabular-nums">{n(cat.AttemptsInWindow)}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              </section>

              <section className="math-card rounded-2xl border border-border p-5 xl:col-span-2">
                <h2 className="mb-4 text-lg font-bold">{labels.leaders}</h2>
                {!detail.TopLearners.length ? (
                  <p className="py-8 text-center text-muted-foreground">{labels.empty}</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px] text-sm">
                      <thead><tr className="border-b border-border text-muted-foreground">
                        <th className="px-3 py-3 text-start">#</th>
                        <th className="px-3 py-3 text-start">{labels.learner}</th>
                        <th className="px-3 py-3 text-end">{labels.solved}</th>
                        <th className="px-3 py-3 text-end">{labels.score}</th>
                        <th className="px-3 py-3 text-end">{labels.firstTry}</th>
                      </tr></thead>
                      <tbody>{detail.TopLearners.map((learner) => (
                        <tr key={learner.UserId} className="border-b border-border last:border-0">
                          <td className="px-3 py-3 font-bold">{learner.Rank}</td>
                          <td className="px-3 py-3">{learner.FullName}</td>
                          <td className="px-3 py-3 text-end">{n(learner.UniqueSolved)}</td>
                          <td className="px-3 py-3 text-end">{n(learner.AwardedPoints)}</td>
                          <td className="px-3 py-3 text-end">{n(learner.FirstTryCorrect)}</td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                )}
              </section>
            </div>
          )}
        </>
      )}
    </main>
  );
}
