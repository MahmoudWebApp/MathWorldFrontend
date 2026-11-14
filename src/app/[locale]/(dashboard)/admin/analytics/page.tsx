'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { DirectionalArrow } from '@/components/ui/DirectionalNavigation';
import { Activity, AlertTriangle, CheckCircle2, Users, Trophy, ShieldCheck } from 'lucide-react';
import { AdminActivityChart, AdminCategoryMistakesChart } from '@/components/admin/AdminActivityCharts';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis,
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
    title: 'مركز إحصائيات MathWorld',
    subtitle: 'مراقبة الطلاب وجودة المحتوى والأداء الحقيقي حسب المرحلة التعليمية',
    admin: 'وضع الإدارة — لا تُحتسب لك نقاط أو حلول',
    back: 'العودة للإدارة',
    days: 'آخر {days} يوم',
    students: 'الطلاب', active: 'الطلاب النشطون', problems: 'المسائل',
    mistakes: 'الإجابات الخاطئة بالفترة', globalTrend: 'النشاط اليومي لكل الطلاب', highestErrors: 'التصنيفات الأكثر إجابات خاطئة', missedQuestions: 'المسائل الأكثر أخطاءً', noMistakes: 'لا توجد أخطاء مسجلة ضمن الفترة', wrong: 'خاطئة', right: 'صحيحة', directory: 'إدارة الطلاب',
    solved: 'حلول فريدة (كل الوقت)', attempts: 'المحاولات', accuracy: 'دقة الإجابات',
    stages: 'أداء المراحل', categories: 'التصنيفات في المرحلة', activity: 'النشاط اليومي',
    leaders: 'المتفوقون في المرحلة', noActivity: 'ما في نشاط خلال الفترة المختارة.',
    total: 'الإجمالي', selected: 'اختاروا المرحلة', attempt: 'محاولة',
    correct: 'إجابة صحيحة', points: 'نقطة', firstTry: 'صحيح من أول مرة',
    learner: 'الطالب', score: 'النقاط المحفوظة', error: 'تعذر تحميل بيانات الإدارة.',
    retry: 'إعادة المحاولة', loading: 'جاري تحميل الإحصائيات...',
    empty: 'لا توجد بيانات لهذه المرحلة بعد.',
  } : {
    title: 'MathWorld Analytics Center',
    subtitle: 'Monitor student engagement and content quality at every educational stage',
    admin: 'Admin mode — your account does not earn solutions or points',
    back: 'Back to admin',
    days: 'Last {days} days',
    students: 'Students', active: 'Active students', problems: 'Problems',
    mistakes: 'Incorrect answers in period', globalTrend: 'Daily activity across all learners', highestErrors: 'Categories with most incorrect answers', missedQuestions: 'Most frequently missed questions', noMistakes: 'No mistakes recorded in this period', wrong: 'Incorrect', right: 'Correct', directory: 'Student management',
    solved: 'Unique solves (all time)', attempts: 'Attempts', accuracy: 'Answer accuracy',
    stages: 'Stage performance', categories: 'Stage categories', activity: 'Daily activity',
    leaders: 'Top learners', noActivity: 'No recorded activity in this period.',
    total: 'Total', selected: 'Selected this stage', attempt: 'Attempts',
    correct: 'Correct', points: 'Points', firstTry: 'First try',
    learner: 'Learner', score: 'Recorded points', error: 'Could not load admin analytics.',
    retry: 'Retry', loading: 'Loading analytics...',
    empty: 'No data for this stage yet.',
  };

  const stageComparison = overview?.Stages.map((stage) => ({
    stage: isArabic ? stage.NameAr : stage.NameEn,
    attempts: stage.AttemptsInWindow,
    correct: stage.CorrectAttemptsInWindow,
  })) ?? [];
  const weakCategories = detail?.Categories.map((category) => ({
    category: isArabic ? category.NameAr : category.NameEn,
    wrong: Math.max(0, category.AttemptsInWindow - category.CorrectAttemptsInWindow),
  })).filter(item => item.wrong > 0).sort((a, b) => b.wrong - a.wrong).slice(0, 8) ?? [];

  const cards = overview ? [
    { label: labels.students, value: n(overview.TotalStudents), icon: Users },
    { label: labels.active, value: n(overview.ActiveStudentsInWindow), icon: Activity },
    { label: labels.mistakes, value: n(overview.AttemptsInWindow - overview.CorrectAttemptsInWindow), icon: AlertTriangle },
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
          <DirectionalArrow direction="back" className="h-4 w-4" />{labels.back}
        </Link>
      </div>

      <div className="mb-5">
        <Link href="/admin/users" className="inline-flex items-center gap-2 rounded-xl border border-primary/20 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/5">
          <Users className="h-4 w-4" aria-hidden />{labels.directory}
          <DirectionalArrow direction="forward" className="h-4 w-4" />
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
          <section aria-label={labels.total} className="mb-8 grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
            {cards.map(({ label, value, icon: Icon }) => (
              <div key={label} className="math-card min-w-0 rounded-2xl border border-border p-4">
                <Icon className="mb-3 h-6 w-6 text-primary" aria-hidden />
                <p className="break-words text-2xl font-bold tabular-nums">{value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </section>

          <div className="mb-8 grid gap-5 xl:grid-cols-2">
            <section className="math-card min-w-0 rounded-2xl border border-border p-5">
              <h2 className="mb-4 text-lg font-bold">{labels.globalTrend}</h2>
              <AdminActivityChart data={overview.DailyActivity ?? []} arabic={isArabic} height={280} />
            </section>
            <section className="math-card min-w-0 rounded-2xl border border-border p-5">
              <h2 className="mb-4 text-lg font-bold">{labels.highestErrors}</h2>
              <AdminCategoryMistakesChart categories={overview.MostMissedCategories ?? []} arabic={isArabic} height={280} />
            </section>
          </div>
          <section className="math-card mb-8 rounded-2xl border border-border p-5">
            <h2 className="mb-4 text-lg font-bold">{labels.missedQuestions}</h2>
            {(overview.MostMissedProblems ?? []).length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">{labels.noMistakes}</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {overview.MostMissedProblems.map(item => (
                  <div key={item.ProblemId} className="rounded-xl border border-border/70 bg-muted/20 p-4">
                    <h3 className="font-semibold">{isArabic ? item.TitleAr : item.TitleEn}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">#{item.ProblemId}</p>
                    <p className="mt-3 flex gap-4 text-sm">
                      <span className="text-destructive">{n(item.IncorrectAttemptsInWindow)} {labels.wrong}</span>
                      <span className="text-primary">{n(item.CorrectAttemptsInWindow)} {labels.right}</span>
                    </p>
                  </div>
                ))}
              </div>
            )}
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

          <section className="math-card mb-8 rounded-2xl border border-border p-5 md:p-6" aria-label={isArabic ? 'مقارنة نشاط المراحل' : 'Stage engagement comparison'}>
            <h2 className="mb-1 text-lg font-bold">{isArabic ? 'مقارنة نشاط الطلاب عبر المراحل' : 'Student engagement across stages'}</h2>
            <p className="mb-5 text-xs text-muted-foreground">{isArabic ? 'مقارنة المحاولات والإجابات الصحيحة خلال الفترة المختارة، بدل مقارنة عدد محتويات الموقع' : 'Actual student attempts and correct answers, not content inventory'}</p>
            {overview.AttemptsInWindow === 0 ? (
              <p className="py-12 text-center text-muted-foreground">{labels.noActivity}</p>
            ) : (
              <div className="w-full overflow-x-auto" role="region"
                aria-label={isArabic ? 'مقارنة مراحل قابلة للتمرير أفقياً' : 'Scrollable stage comparison chart'}>
                <div className="h-64 min-w-[580px]" dir="ltr">
                  <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stageComparison} margin={{top: 8,right: 12,bottom: 12,left: -15}}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2}/>
                    <XAxis dataKey="stage" tick={{fontSize: 11}} interval={0} />
                    <YAxis allowDecimals={false} tick={{fontSize: 11}} />
                    <Tooltip/><Legend/>
                    <Bar dataKey="attempts" name={labels.attempts} fill="var(--color-brand-primary)" radius={[6,6,0,0]} maxBarSize={50}/>
                    <Bar dataKey="correct" name={labels.correct} fill="var(--color-brand-secondary)" radius={[6,6,0,0]} maxBarSize={50}/>
                  </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
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
                <h2 className="mb-2 text-lg font-bold">{isArabic ? 'التصنيفات الأعلى بالأخطاء' : 'Categories with the most errors'}</h2>
                <p className="mb-4 text-xs text-muted-foreground">{isArabic ? 'تساعدك تحدد وين يحتاج الطلاب دعم ومراجعة' : 'Identify where learners need extra support'}</p>
                {!weakCategories.length ? (
                  <p className="py-24 text-center text-muted-foreground">{labels.noActivity}</p>
                ) : (
                  <div className="h-64 w-full" dir="ltr">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weakCategories} layout="vertical" margin={{left: 8,right: 12}}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.2}/>
                        <XAxis type="number" allowDecimals={false}/>
                        <YAxis type="category" dataKey="category" width={100} tick={{fontSize: 11}}/>
                        <Tooltip/>
                        <Bar dataKey="wrong" name={isArabic ? 'إجابات خاطئة' : 'Wrong attempts'} fill="var(--color-brand-secondary)" radius={[0,6,6,0]} maxBarSize={22}/>
                      </BarChart>
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
