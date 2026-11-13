'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import {
  Activity, AlertTriangle, BarChart3, BookOpenCheck, CheckCircle2,
  Medal, ShieldCheck, TrendingUp, Users,
} from 'lucide-react';
import { DirectionalArrow } from '@/components/ui/DirectionalArrow';
import {
  AdminActivityChart, AdminCategoryMistakesChart, AdminStagePerformanceChart,
} from '@/components/admin/AdminActivityCharts';
import {
  useGetAdminAnalyticsOverviewQuery, useGetAdminAnalyticsStageQuery,
} from '@/store/api/statsApi';
import { useGetAdminLearnersQuery } from '@/store/api/usersApi';

const periods = [7, 30, 90] as const;

export default function AdminDashboardPage() {
  const arabic = useLocale() === 'ar';
  const [days, setDays] = useState<(typeof periods)[number]>(30);
  const { data, isLoading, isError, isFetching, refetch } =
    useGetAdminAnalyticsOverviewQuery(days, { refetchOnMountOrArgChange: true });

  // Pick the stage with the most actual attempts for an actionable learner preview.
  // Do not infer rankings from question inventory or from Admin accounts.
  const busiestStage = [...(data?.Stages ?? [])]
    .sort((a, b) => b.AttemptsInWindow - a.AttemptsInWindow || a.StageId - b.StageId)[0];
  const { data: selectedStage } = useGetAdminAnalyticsStageQuery(
    { stageId: busiestStage?.StageId ?? 0, days }, {
      skip: !busiestStage || busiestStage.AttemptsInWindow === 0,
      refetchOnMountOrArgChange: true,
    },
  );
  const { data: learners, isLoading: learnersLoading, isError: learnersError } = useGetAdminLearnersQuery(
    { Page: 1, PageSize: 4 }, { refetchOnMountOrArgChange: true },
  );

  const t = arabic ? {
    title: 'لوحة قيادة MathWorld',
    subtitle: 'مراقبة تفاعل الطلاب ونتائج الحلول وجودة المسائل — بيانات فعلية وليست أعداد محتوى الموقع',
    full: 'مركز الإحصائيات الكامل',
    fullDescription: 'التحليل حسب المرحلة والتصنيف، النشاط اليومي، أخطاء المسائل، وترتيب الطلاب مع فلاتر زمنية',
    explore: 'استعرض الإحصائيات',
    days: (n: number) => `آخر ${n} يوم`,
    student: 'إجمالي الطلاب',
    active: 'الطلاب النشطون',
    attempts: 'المحاولات بالفترة',
    solved: 'حلول فريدة (كل الوقت)',
    accuracy: 'نسبة الإجابات الصحيحة',
    errors: 'الإجابات الخاطئة بالفترة',
    trend: 'النشاط اليومي للطلاب',
    trendSub: 'المحاولات والإجابات الصحيحة بمرور الأيام',
    stage: 'أداء المراحل التعليمية',
    stageSub: 'مقارنة المحاولات الصحيحة والخاطئة لكل مرحلة',
    weak: 'أكثر التصنيفات تسجيلًا للأخطاء',
    weakSub: 'ترتيب حسب عدد الإجابات الخاطئة خلال الفترة، وليس تقييمًا نهائيًا لصعوبة التصنيف',
    problematic: 'المسائل الأكثر إجابات خاطئة',
    problematicSub: 'أولويات لمراجعة المحتوى بناءً على محاولات الطلاب',
    correct: 'صحيحة', wrong: 'خاطئة', noErrors: 'لا توجد أخطاء مسجّلة بالفترة',
    recent: 'أحدث الطلاب', noLearners: 'لا يوجد طلاب بعد',
    all: 'كل الطلاب', details: 'ملف الطالب',
    top: 'طلاب المرحلة الأكثر نشاطًا', noTop: 'لا توجد حلول مسجّلة لهذه الفترة',
    more: 'التفاصيل الكاملة', error: 'تعذر تحميل الإحصائيات',
    retry: 'إعادة المحاولة', loading: 'جاري تحميل بيانات الطلاب...',
    updated: 'تُحتسب الإحصائيات من سجلات الإجابات المحفوظة',
  } : {
    title: 'MathWorld Control Center',
    subtitle: 'Monitor real student engagement, solving outcomes and learning quality — not site inventory totals',
    full: 'Complete analytics center',
    fullDescription: 'Explore stages, categories, daily activity, missed questions and learner rankings with date filters',
    explore: 'Open all analytics',
    days: (n: number) => `Last ${n} days`,
    student: 'Total students',
    active: 'Active learners',
    attempts: 'Attempts in period',
    solved: 'Unique solves (all time)',
    accuracy: 'Correct answer rate',
    errors: 'Incorrect answers in period',
    trend: 'Daily student activity',
    trendSub: 'Recorded attempts and correct answers over time',
    stage: 'Performance by educational stage',
    stageSub: 'Compare correct and incorrect attempts per stage',
    weak: 'Categories with the most incorrect answers',
    weakSub: 'Ranked by incorrect attempts in period; not an absolute measure of difficulty',
    problematic: 'Most frequently missed problems',
    problematicSub: 'Content review priorities based on real student attempts',
    correct: 'Correct', wrong: 'Incorrect', noErrors: 'No incorrect answers in this period',
    recent: 'Recently joined learners', noLearners: 'No learners yet',
    all: 'All learners', details: 'View profile',
    top: 'Learners in the most active stage', noTop: 'No solves recorded in this period',
    more: 'Full details', error: 'Analytics could not be loaded',
    retry: 'Retry', loading: 'Loading student activity...',
    updated: 'All engagement data comes from persisted answer attempts',
  };
  const num = (n: number) => new Intl.NumberFormat(arabic ? 'ar' : 'en').format(n);
  const cards = data ? [
    { name: t.student, count: num(data.TotalStudents), Icon: Users },
    { name: t.active, count: num(data.ActiveStudentsInWindow), Icon: Activity },
    { name: t.attempts, count: num(data.AttemptsInWindow), Icon: TrendingUp },
    { name: t.solved, count: num(data.TotalUniqueSolved), Icon: BookOpenCheck },
    { name: t.accuracy, count: `${num(data.CorrectRatePercent)}%`, Icon: CheckCircle2 },
    { name: t.errors, count: num(data.AttemptsInWindow - data.CorrectAttemptsInWindow), Icon: AlertTriangle },
  ] : [];
  const section = 'math-card min-w-0 rounded-3xl border border-border bg-card/85 p-5 shadow-sm md:p-6';

  return (
    <main className="container relative mx-auto max-w-7xl px-4 py-8 md:px-10">
      <header className="mb-6">
        <h1 className="brand-display-title text-gradient-math text-3xl font-bold">{t.title}</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{t.subtitle}</p>
      </header>

      <Link
        href="/admin/analytics"
        className="group mb-7 flex flex-col justify-between gap-5 rounded-3xl border border-primary/30 bg-gradient-to-br from-brand-primary/15 via-card to-brand-secondary/10 p-6 shadow-sm transition-all hover:border-primary/60 hover:shadow-lg sm:flex-row sm:items-center md:p-8"
      >
        <div className="flex min-w-0 items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <BarChart3 className="h-7 w-7" aria-hidden />
          </span>
          <div>
            <h2 className="text-xl font-bold md:text-2xl">{t.full}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{t.fullDescription}</p>
          </div>
        </div>
        <span className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">
          {t.explore}<DirectionalArrow direction="forward" size={18} />
        </span>
      </Link>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-semibold"><ShieldCheck className="h-5 w-5 text-primary" aria-hidden />{t.updated}</h2>
        <div role="group" className="flex flex-wrap gap-2">
          {periods.map(value => (
            <button key={value} type="button" aria-pressed={days === value}
              onClick={() => setDays(value)}
              className={`rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
                days === value ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card hover:border-primary/40'
              }`}>{t.days(value)}</button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className={section} role="status">{t.loading}</div>
      ) : isError || !data ? (
        <div className={section} role="alert">
          <p className="text-destructive">{t.error}</p>
          <button type="button" onClick={() => refetch()}
            className="mt-3 rounded-xl border border-primary px-4 py-2 text-primary">{t.retry}</button>
        </div>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            {cards.map(({ name, count, Icon }) => (
              <div key={name} className="math-card rounded-2xl border border-border bg-card/80 p-4">
                <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <strong className="block text-2xl tabular-nums">{count}</strong>
                <p className="mt-2 text-xs text-muted-foreground">{name}</p>
              </div>
            ))}
          </div>

          {isFetching && <p className="mb-3 text-xs text-muted-foreground" role="status">{t.loading}</p>}
          <div className="mb-6 grid gap-5 xl:grid-cols-5">
            <section className={section + ' xl:col-span-3'}>
              <h2 className="text-lg font-bold">{t.trend}</h2>
              <p className="mb-4 mt-1 text-xs text-muted-foreground">{t.trendSub}</p>
              <AdminActivityChart data={data.DailyActivity ?? []} arabic={arabic} />
            </section>
            <section className={section + ' xl:col-span-2'}>
              <h2 className="text-lg font-bold">{t.stage}</h2>
              <p className="mb-4 mt-1 text-xs text-muted-foreground">{t.stageSub}</p>
              <AdminStagePerformanceChart stages={data.Stages} arabic={arabic} />
            </section>
          </div>
          <div className="mb-6 grid gap-5 xl:grid-cols-2">
            <section className={section}>
              <h2 className="text-lg font-bold">{t.weak}</h2>
              <p className="mb-4 mt-1 text-xs leading-5 text-muted-foreground">{t.weakSub}</p>
              <AdminCategoryMistakesChart categories={data.MostMissedCategories ?? []} arabic={arabic} />
            </section>
            <section className={section}>
              <h2 className="text-lg font-bold">{t.problematic}</h2>
              <p className="mb-4 mt-1 text-xs text-muted-foreground">{t.problematicSub}</p>
              {!(data.MostMissedProblems ?? []).length ? (
                <div className="flex min-h-52 items-center justify-center text-sm text-muted-foreground">{t.noErrors}</div>
              ) : (
                <div className="space-y-2">
                  {data.MostMissedProblems.map((p, i) => (
                    <div key={p.ProblemId} className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-muted/20 p-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{i + 1}. {arabic ? p.TitleAr : p.TitleEn}</p>
                        <p className="mt-1 text-xs text-muted-foreground">#{p.ProblemId}</p>
                      </div>
                      <div className="shrink-0 text-end text-xs">
                        <p className="font-semibold text-destructive">{num(p.IncorrectAttemptsInWindow)} {t.wrong}</p>
                        <p className="mt-1 text-muted-foreground">{num(p.CorrectAttemptsInWindow)} {t.correct}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Link href="/admin/analytics" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
                {t.more}<DirectionalArrow direction="forward" />
              </Link>
            </section>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <section className={section}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 text-lg font-bold"><Medal className="h-5 w-5 text-primary" aria-hidden />{t.top}</h2>
                <Link href="/admin/analytics" className="text-sm font-semibold text-primary hover:underline">{t.more}</Link>
              </div>
              {!selectedStage?.TopLearners?.length ? <p className="py-10 text-center text-sm text-muted-foreground">{t.noTop}</p> :
                <div className="space-y-2">
                  {selectedStage.TopLearners.slice(0, 4).map((learner) => (
                    <Link key={learner.UserId} href={`/admin/users/${learner.UserId}`}
                      className="flex items-center justify-between gap-3 rounded-xl border border-border/60 p-3 hover:bg-primary/5">
                      <div className="min-w-0"><span className="font-semibold">#{learner.Rank} {learner.FullName}</span></div>
                      <span className="shrink-0 text-sm text-primary">{num(learner.UniqueSolved)} {t.solved.split(' ')[0]}</span>
                    </Link>
                  ))}
                </div>}
            </section>
            <section className={section}>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-bold"><Users className="h-5 w-5 text-primary" aria-hidden />{t.recent}</h2>
                <Link href="/admin/users" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                  {t.all}<DirectionalArrow direction="forward" />
                </Link>
              </div>
              {learnersLoading ? <p role="status" className="py-10 text-center text-sm text-muted-foreground">{t.loading}</p>
                : learnersError ? <p role="alert" className="py-10 text-center text-sm text-destructive">{t.error}</p>
                : !learners?.Learners.length ? <p className="py-10 text-center text-sm text-muted-foreground">{t.noLearners}</p> :
                <div className="space-y-2">
                  {learners.Learners.map(learner => (
                    <Link key={learner.Id} href={`/admin/users/${learner.Id}`}
                      className="flex items-center justify-between gap-3 rounded-xl border border-border/60 p-3 hover:bg-primary/5">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{learner.FullName}</p>
                        <p className="truncate text-xs text-muted-foreground" dir="ltr">{learner.Email}</p>
                      </div>
                      <DirectionalArrow direction="forward" className="shrink-0 text-primary" />
                    </Link>
                  ))}
                </div>}
            </section>
          </div>
        </>
      )}
    </main>
  );
}
