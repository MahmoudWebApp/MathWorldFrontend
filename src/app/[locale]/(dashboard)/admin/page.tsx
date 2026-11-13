'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import {
  Activity, BarChart3, BookOpenCheck, ChevronDown,
  CircleHelp, Clock3, Gauge, GraduationCap, ShieldCheck, TrendingUp, Users,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, CartesianGrid, XAxis, YAxis,
  ResponsiveContainer, Tooltip, Legend,
} from 'recharts';

import { DirectionalArrow, DirectionalChevron } from '@/components/ui/DirectionalNavigation';
import {
  useGetAdminAnalyticsOverviewQuery, useGetAdminAnalyticsStageQuery,
} from '@/store/api/statsApi';
import { useGetAdminLearnersQuery } from '@/store/api/usersApi';

type Period = 7 | 30 | 90;

export default function AdminDashboardPage() {
  const ar = useLocale() === 'ar';
  const [days, setDays] = useState<Period>(30);
  const [selectedStageId, setSelectedStageId] = useState<number | null>(null);
  const { data: overview, isLoading, isError, refetch } =
    useGetAdminAnalyticsOverviewQuery(days, { refetchOnMountOrArgChange: true });
  const stageId = selectedStageId ?? overview?.Stages[0]?.StageId ?? 0;
  const { data: stage, isLoading: stageLoading, isError: stageError } =
    useGetAdminAnalyticsStageQuery({ stageId, days }, {
      skip: stageId <= 0, refetchOnMountOrArgChange: true,
    });
  const { data: learners, isLoading: learnersLoading } =
    useGetAdminLearnersQuery({ Page: 1, PageSize: 5 }, {
      refetchOnMountOrArgChange: true,
    });
  const txt = ar ? {
    title: 'لوحة تحكم MathWorld',
    subtitle: 'نشاط المتعلمين، تقدّم المراحل، ونقاط الضعف — بيانات حقيقية من المحاولات',
    adminMode: 'وضع الإدارة · لا يحتسب لك أي حل أو نقاط',
    centerTitle: 'مركز الإحصائيات المتكامل',
    centerDescription: 'انتقل للتحليلات التفصيلية حسب المرحلة والتصنيف، وتابع سجل الطلاب وأداء المنصة.',
    centerAction: 'عرض الإحصائيات الكاملة',
    students: 'إجمالي الطلاب', active: 'نشطون في الفترة', attempts: 'محاولات الحل',
    unique: 'حلول مختلفة', accuracy: 'نسبة الإجابات الصحيحة', content: 'إدارة المسائل',
    date: 'خلال آخر', days: 'يوم', stage: 'المرحلة',
    activity: 'النشاط اليومي', dailyDesc: 'عدد المحاولات والإجابات الصحيحة خلال الفترة',
    byStage: 'مقارنة نشاط المراحل', stageDesc: 'محاولات الطلاب في كل مرحلة',
    weak: 'التصنيفات التي تحتاج مراجعة', weakDesc: 'المحاولات الخاطئة لكل تصنيف في المرحلة المحددة',
    wrong: 'إجابات خاطئة', correct: 'إجابات صحيحة', selected: 'إجمالي المحاولات',
    latest: 'أحدث الطلاب', allStudents: 'إدارة الطلاب', stageProgress: 'تحليل المرحلة',
    stagePrompt: 'اختر مرحلة لعرض نقاط الضعف',
    noActivity: 'ما في محاولات مسجلة ضمن الفترة المحددة.',
    noWeak: 'ما في أخطاء مسجلة بهذه المرحلة ضمن الفترة المحددة.',
    empty: 'لا يوجد طلاب بعد.', noStage: 'لم يختر المرحلة',
    loading: 'جارٍ تحميل إحصائيات الطلاب...', failed: 'تعذر تحميل إحصائيات النشاط.',
    retry: 'إعادة المحاولة', refresh: 'تحديث',
  } : {
    title: 'MathWorld Admin Dashboard',
    subtitle: 'Learner engagement, stage progress and weaknesses — based on real answers',
    adminMode: 'Admin mode · Your account does not earn solves or points',
    centerTitle: 'Complete Analytics Center',
    centerDescription: 'Explore stage and category insights, individual learners and platform performance.',
    centerAction: 'Open full analytics',
    students: 'Total learners', active: 'Active in period', attempts: 'Answer attempts',
    unique: 'Distinct solves', accuracy: 'Correct-answer rate', content: 'Manage problems',
    date: 'Last', days: 'days', stage: 'Stage',
    activity: 'Daily engagement', dailyDesc: 'Answer attempts versus correct attempts during the period',
    byStage: 'Activity by stage', stageDesc: 'Student attempts in every stage',
    weak: 'Categories needing attention', weakDesc: 'Wrong answers by category in the selected stage',
    wrong: 'Wrong answers', correct: 'Correct answers', selected: 'Total attempts',
    latest: 'Recently joined students', allStudents: 'Manage learners', stageProgress: 'Stage analysis',
    stagePrompt: 'Choose a stage to review weak topics',
    noActivity: 'No attempts in the selected period yet.',
    noWeak: 'No wrong attempts in this stage and period.',
    empty: 'No students have joined yet.', noStage: 'No stage selected',
    loading: 'Loading student analytics...', failed: 'Could not load engagement analytics.',
    retry: 'Retry', refresh: 'Refresh',
  };
  const format = (value: number) => new Intl.NumberFormat(ar ? 'ar' : 'en').format(value);
  const stageName = (s: { NameAr: string; NameEn: string }) => ar ? s.NameAr : s.NameEn;
  const day = (value: string) => new Date(value).toLocaleDateString(ar ? 'ar' : 'en', {
    timeZone: 'UTC', month: 'short', day: 'numeric',
  });
  const dailyData = stage?.DailyActivity.map((row) => ({
    day: day(row.DayUtc), attempts: row.Attempts, correct: row.CorrectAttempts,
  })) ?? [];
  const comparison = overview?.Stages.map((s) => ({
    name: stageName(s), attempts: s.AttemptsInWindow,
    correct: s.CorrectAttemptsInWindow,
  })) ?? [];
  const weakest = stage?.Categories.map((c) => ({
    name: stageName(c),
    wrong: Math.max(0, c.AttemptsInWindow - c.CorrectAttemptsInWindow),
    attempts: c.AttemptsInWindow,
  })).filter(c => c.wrong > 0).sort((a, b) => b.wrong - a.wrong).slice(0, 6) ?? [];

  const metrics = overview ? [
    { title: txt.students, value: format(overview.TotalStudents), Icon: Users },
    { title: txt.active, value: format(overview.ActiveStudentsInWindow), Icon: Activity },
    { title: txt.attempts, value: format(overview.AttemptsInWindow), Icon: Clock3 },
    { title: txt.unique, value: format(overview.TotalUniqueSolved), Icon: BookOpenCheck },
    { title: txt.accuracy, value: `${overview.CorrectRatePercent}%`, Icon: Gauge },
  ] : [];

  return (
    <main className="container relative mx-auto max-w-7xl px-4 py-8 md:px-10">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="brand-display-title text-gradient-math text-3xl font-bold">{txt.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{txt.subtitle}</p>
          <span className="mt-3 inline-flex items-center gap-2 rounded-xl bg-primary/10 px-3 py-2 text-xs font-medium text-primary">
            <ShieldCheck className="h-4 w-4" aria-hidden />{txt.adminMode}
          </span>
        </div>
        <div className="inline-flex gap-2" role="group" aria-label={txt.date}>
          {([7, 30, 90] as const).map(value => (
            <button key={value} type="button" aria-pressed={days === value}
              onClick={() => setDays(value)}
              className={`rounded-xl border px-3 py-2 text-sm transition-colors ${
                days === value ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card hover:border-primary/50'
              }`}>
              {value} {txt.days}
            </button>
          ))}
        </div>
      </div>

      <Link href="/admin/analytics"
        className="group mb-7 flex flex-wrap items-center gap-4 rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/15 via-primary/5 to-brand-secondary/10 p-6 transition-all hover:border-primary/50 hover:shadow-lg md:p-8">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <BarChart3 className="h-8 w-8" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <strong className="block text-xl font-bold md:text-2xl">{txt.centerTitle}</strong>
          <span className="mt-2 block max-w-2xl text-sm text-muted-foreground">{txt.centerDescription}</span>
        </span>
        <span className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground">
          {txt.centerAction}<DirectionalArrow direction="forward" className="h-4 w-4" />
        </span>
      </Link>

      {isError ? (
        <div role="alert" className="math-card mb-6 rounded-2xl border border-destructive/30 p-7">
          <p className="text-destructive">{txt.failed}</p>
          <button type="button" onClick={() => refetch()} className="mt-3 rounded-xl border border-border px-4 py-2">{txt.retry}</button>
        </div>
      ) : isLoading || !overview ? (
        <p role="status" className="math-card mb-6 rounded-2xl border border-border p-10 text-center">{txt.loading}</p>
      ) : (
        <>
          <section aria-label={txt.title} className="mb-7 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
            {metrics.map(({title,value,Icon}) => (
              <div key={title} className="math-card rounded-2xl border border-border p-5">
                <span className="mb-3 inline-flex rounded-xl bg-primary/10 p-2.5 text-primary"><Icon className="h-5 w-5" aria-hidden /></span>
                <p className="text-2xl font-bold tabular-nums">{value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{title}</p>
              </div>
            ))}
          </section>

          <section aria-label={txt.byStage} className="mb-7 grid gap-5 xl:grid-cols-2">
            <div className="math-card rounded-2xl border border-border p-5 md:p-6">
              <div className="mb-4">
                <h2 className="text-lg font-bold">{txt.byStage}</h2>
                <p className="mt-1 text-xs text-muted-foreground">{txt.stageDesc}</p>
              </div>
              {overview.AttemptsInWindow === 0 ? (
                <p className="py-24 text-center text-sm text-muted-foreground">{txt.noActivity}</p>
              ) : (
                <div className="h-64 w-full" dir="ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparison} margin={{left: -18, right: 10, bottom: 15}}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="name" tick={{fontSize: 11}} interval={0} />
                      <YAxis allowDecimals={false} tick={{fontSize: 11}} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="attempts" name={txt.selected} fill="var(--color-brand-primary)" radius={[6, 6, 0, 0]} maxBarSize={48} />
                      <Bar dataKey="correct" name={txt.correct} fill="var(--color-brand-secondary)" radius={[6, 6, 0, 0]} maxBarSize={48} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="math-card rounded-2xl border border-border p-5 md:p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold">{txt.activity}</h2>
                  <p className="mt-1 text-xs text-muted-foreground">{txt.dailyDesc}</p>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <span className="sr-only">{txt.stage}</span>
                  <select value={stageId} onChange={event => setSelectedStageId(Number(event.target.value))}
                    className="max-w-[220px] rounded-xl border border-border bg-card px-3 py-2 text-sm">
                    {overview.Stages.map(s => <option key={s.StageId} value={s.StageId}>{stageName(s)}</option>)}
                  </select>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden />
                </label>
              </div>
              {stageLoading ? (
                <p role="status" className="py-24 text-center text-sm text-muted-foreground">{txt.loading}</p>
              ) : stageError ? (
                <p role="alert" className="py-24 text-center text-sm text-destructive">{txt.failed}</p>
              ) : !stage || stage.Summary.AttemptsInWindow === 0 ? (
                <p className="py-24 text-center text-sm text-muted-foreground">{txt.noActivity}</p>
              ) : (
                <div className="h-64 w-full" dir="ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailyData} margin={{left: -18, right: 10}}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.2}/>
                      <XAxis dataKey="day" minTickGap={18} tick={{fontSize: 11}} />
                      <YAxis allowDecimals={false} tick={{fontSize: 11}} />
                      <Tooltip /><Legend />
                      <Area type="monotone" dataKey="attempts" name={txt.selected} stroke="var(--color-brand-primary)" fill="var(--color-brand-primary)" fillOpacity={0.16} strokeWidth={2} />
                      <Area type="monotone" dataKey="correct" name={txt.correct} stroke="var(--color-brand-secondary)" fill="var(--color-brand-secondary)" fillOpacity={0.10} strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </section>

          <section className="mb-7 grid gap-5 xl:grid-cols-2">
            <div className="math-card rounded-2xl border border-border p-5 md:p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold">{txt.weak}</h2>
                  <p className="mt-1 text-xs text-muted-foreground">{txt.weakDesc}</p>
                </div>
                <CircleHelp className="h-6 w-6 text-primary" aria-hidden />
              </div>
              {stageLoading ? <p className="py-16 text-center text-muted-foreground">{txt.loading}</p>
                : !weakest.length ? <p className="py-16 text-center text-sm text-muted-foreground">{txt.noWeak}</p> : (
                <div className="h-64 w-full" dir="ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weakest} layout="vertical" margin={{left: 8, right: 12}}>
                      <CartesianGrid horizontal={false} strokeDasharray="3 3" opacity={0.2} />
                      <XAxis type="number" allowDecimals={false} />
                      <YAxis type="category" dataKey="name" width={90} tick={{fontSize: 11}}/>
                      <Tooltip />
                      <Bar dataKey="wrong" name={txt.wrong} fill="var(--color-brand-secondary)" radius={[0, 6, 6, 0]} maxBarSize={22} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
              <Link href="/admin/analytics" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
                {txt.stageProgress}<DirectionalChevron direction="forward" className="h-4 w-4" />
              </Link>
            </div>

            <div className="math-card rounded-2xl border border-border p-5 md:p-6">
              <div className="mb-4 flex items-center justify-between gap-2">
                <div><h2 className="text-lg font-bold">{txt.latest}</h2>
                  <p className="mt-1 text-xs text-muted-foreground">{txt.students}</p></div>
                <Link href="/admin/users" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                  {txt.allStudents}<DirectionalChevron direction="forward" className="h-4 w-4"/>
                </Link>
              </div>
              {learnersLoading ? <p className="py-16 text-center text-sm text-muted-foreground">{txt.loading}</p>
                : !learners?.Learners.length ? <p className="py-16 text-center text-sm text-muted-foreground">{txt.empty}</p> : (
                  <div className="space-y-2">
                    {learners.Learners.map(user => (
                      <Link key={user.Id} href={`/admin/users/${user.Id}`}
                        className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/20 p-3 transition-colors hover:bg-primary/5">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <GraduationCap className="h-5 w-5" aria-hidden/>
                        </span>
                        <span className="min-w-0 flex-1">
                          <strong className="block truncate text-sm">{user.FullName}</strong>
                          <span className="block truncate text-xs text-muted-foreground">{(ar ? user.StageNameAr : user.StageNameEn) || txt.noStage}</span>
                        </span>
                        <span className="shrink-0 text-xs text-muted-foreground">{format(user.SolvedProblems)} {txt.unique}</span>
                        <DirectionalChevron direction="forward" className="h-4 w-4 shrink-0 text-primary"/>
                      </Link>
                    ))}
                  </div>
                )}
            </div>
          </section>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/problems" className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-medium hover:bg-muted">
              <BookOpenCheck className="h-5 w-5 text-primary" aria-hidden/>{txt.content}<DirectionalChevron direction="forward" className="h-4 w-4"/>
            </Link>
            <Link href="/admin/analytics" className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-medium hover:bg-muted">
              <TrendingUp className="h-5 w-5 text-primary" aria-hidden/>{txt.centerAction}<DirectionalChevron direction="forward" className="h-4 w-4"/>
            </Link>
          </div>
        </>
      )}
    </main>
  );
}
