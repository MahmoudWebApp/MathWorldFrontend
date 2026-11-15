'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Activity, UsersRound, UserPlus, BookCheck, ArrowUpRight, ChartNoAxesCombined, History, UserRoundSearch } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useGetAdminEngagementOverviewQuery } from '@/store/api/statsApi';
import { StageGeometry } from '@/components/math/StageGeometry';

const palettes = [
  { border: 'border-sky-400/30', bg: 'from-sky-500/15 to-cyan-400/5', text: 'text-sky-600 dark:text-sky-300' },
  { border: 'border-amber-400/30', bg: 'from-amber-500/15 to-orange-400/5', text: 'text-amber-700 dark:text-amber-300' },
  { border: 'border-emerald-400/30', bg: 'from-emerald-500/15 to-teal-400/5', text: 'text-emerald-700 dark:text-emerald-300' },
  { border: 'border-violet-400/30', bg: 'from-violet-500/15 to-fuchsia-400/5', text: 'text-violet-700 dark:text-violet-300' },
] as const;

export default function AdminDashboardPage() {
  const ar = useLocale() === 'ar';
  const [days, setDays] = useState<7 | 30 | 90>(30);
  const { data, isFetching, isError, refetch } = useGetAdminEngagementOverviewQuery(days, {
    refetchOnMountOrArgChange: true,
    pollingInterval: 60000,
  });
  const n = (value: number) => new Intl.NumberFormat(ar ? 'ar' : 'en').format(value);
  const metrics = data ? [
    { text: ar ? 'كل الطلاب المسجلين' : 'Registered learners', value: data.TotalStudents, icon: UsersRound },
    { text: ar ? 'تسجيلات جديدة' : 'New sign-ups', value: data.NewStudents, icon: UserPlus },
    { text: ar ? 'طلاب حلّوا مسائل' : 'Learners who practiced', value: data.ActiveSolvers, icon: Activity },
    { text: ar ? 'حلول خلال الفترة' : 'Completed solutions', value: data.SuccessfulSolves, icon: BookCheck },
  ] : [];
  const trends = (data?.DailyActivity ?? []).map(day => ({
    label: new Date(day.DayUtc).toLocaleDateString(ar ? 'ar' : 'en', { day: 'numeric', month: 'short', timeZone: 'UTC' }),
    students: day.ActiveSolvers,
    signups: day.Signups,
  }));

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8" dir={ar ? 'rtl' : 'ltr'}>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs font-bold tracking-wide text-primary">{ar ? 'مراقبة MathWorld' : 'MathWorld operations'}</p>
          <h1 className="text-3xl font-extrabold">{ar ? 'كيف عم تتحرك المنصة؟' : 'How is MathWorld doing?'}</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            {ar ? 'طلاب جدد، نشاط حقيقي، والمستويات اللي عم يشتغلوا عليها. بقية الإدارة موجودة بقائمة الأدمن بالأعلى.'
              : 'New students, actual practice, and the stages they use. All management actions remain in the Admin dropdown.'}
          </p>
        </div>
        <div role="group" aria-label={ar ? 'فترة الإحصائيات' : 'Reporting period'} className="flex gap-1 rounded-xl border bg-card p-1">
          {([7, 30, 90] as const).map(value => (
            <button type="button" key={value} aria-pressed={days === value} onClick={() => setDays(value)}
              className={`rounded-lg px-3 py-2 text-xs font-bold transition-colors ${days === value ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>
              {value} {ar ? 'يوم' : 'days'}
            </button>
          ))}
        </div>
      </header>

      {isError ? <div role="alert" className="rounded-2xl border p-6">
        {ar ? 'تعذّر جلب نشاط المنصة.' : 'Unable to load platform activity.'}
        <button type="button" onClick={() => void refetch()} className="ms-3 font-bold text-primary underline">
          {ar ? 'إعادة المحاولة' : 'Retry'}
        </button>
      </div> : !data ? <div role="status" className="rounded-2xl border p-8 text-center">
        {ar ? 'جارٍ تحميل نشاط المنصة…' : 'Loading platform activity…'}
      </div> : <>
        <div aria-label={ar ? 'المؤشرات الأساسية' : 'Key indicators'} className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            const palette = palettes[index];
            return <section key={metric.text} className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br p-4 sm:p-5 ${palette.border} ${palette.bg}`}>
              <StageGeometry variant={index} className="pointer-events-none absolute -end-8 -top-9 h-28 w-28 opacity-20" />
              <Icon className={`mb-4 h-5 w-5 ${palette.text}`} aria-hidden />
              <strong className="block text-3xl font-black tabular-nums">{n(metric.value)}</strong>
              <span className="mt-1 block text-sm font-semibold">{metric.text}</span>
            </section>;
          })}
        </div>

        <section className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
          <div className="min-w-0 space-y-3 rounded-3xl border bg-card p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold">{ar ? 'نشاط الطلاب يومياً' : 'Daily student activity'}</h2>
                <p className="text-xs text-muted-foreground">
                  {ar ? 'عدد الطلاب الذين حلّوا مسائل، مو نسبة الإجابات الصحيحة' : 'Unique learners practicing, not answer accuracy'}
                </p>
              </div>
              {isFetching && <span className="text-xs text-muted-foreground">{ar ? 'تحديث…' : 'Refreshing…'}</span>}
            </div>
            <div role="img" aria-label={ar ? 'مخطط عدد الطلاب النشطين يومياً' : 'Daily active learners area chart'} className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends} margin={{ top: 8, right: 4, left: -20, bottom: 4 }}>
                  <defs><linearGradient id="activityMathworld" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient></defs>
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} minTickGap={18} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="students" name={ar ? 'طلاب حلّوا' : 'Active learners'}
                    stroke="#0891b2" strokeWidth={2.5} fill="url(#activityMathworld)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-3xl border bg-card p-4 sm:p-6">
            <h2 className="mb-1 text-lg font-bold">{ar ? 'نشاط كل مستوى' : 'Activity by stage'}</h2>
            <p className="mb-5 text-xs text-muted-foreground">
              {ar ? 'اضغط على المستوى لتشوف الطلاب الأكثر نشاطاً والفئات' : 'Open a stage for active learners and category rankings'}
            </p>
            <div className="space-y-3">
              {data.Stages.map((stage, index) => {
                const palette = palettes[index % palettes.length];
                const share = data.ActiveSolvers === 0 ? 0 : Math.min(100, 100 * stage.ActiveSolvers / data.ActiveSolvers);
                return <Link key={stage.StageId} href={`/admin/engagement?stageId=${stage.StageId}&days=${days}`}
                  className="block rounded-xl border border-border/70 p-3 transition-colors hover:bg-muted/50">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-bold">{ar ? stage.NameAr : stage.NameEn}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">{n(stage.ActiveSolvers)} {ar ? 'نشط' : 'active'}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted"><div style={{ width: `${share}%` }}
                    className={`h-full rounded-full ${index % 4 === 0 ? 'bg-cyan-500' : index % 4 === 1 ? 'bg-orange-500' : index % 4 === 2 ? 'bg-emerald-500' : 'bg-violet-500'}`} /></div>
                  <span className={`mt-1 block text-xs ${palette.text}`}>{n(stage.Signups)} {ar ? 'اختاروا هذا المستوى خلال الفترة' : 'new stage selections in period'}</span>
                </Link>;
              })}
            </div>
          </div>
        </section>
      </>}

      <section aria-label={ar ? 'مراكز المتابعة' : 'Monitoring pages'} className="grid gap-3 sm:grid-cols-3">
        {[
          { href: '/admin/engagement', icon: ChartNoAxesCombined, ar: 'نشاط المستويات والفئات', en: 'Stages & categories',
            subAr: 'الأكثر حلاً، ترتيب الطلاب، ومقارنة الفئات', subEn: 'Top solvers, rankings, category usage' },
          { href: '/admin/users', icon: UserRoundSearch, ar: 'الطلاب وحساباتهم', en: 'Learner directory',
            subAr: 'مين سجل وآخر دخول ونشاط', subEn: 'Registration, last login and activity' },
          { href: '/admin/audit', icon: History, ar: 'سجل العمليات', en: 'Activity & audit log',
            subAr: 'شو عمل كل طالب والأدمن داخل المنصة', subEn: 'Student and administrator actions' },
        ].map(item => {
          const Icon = item.icon;
          return <Link key={item.href} href={item.href}
            className="group flex items-start gap-3 rounded-2xl border bg-card p-5 transition-colors hover:border-primary/50 hover:bg-muted/40">
            <span className="rounded-xl bg-primary/10 p-3 text-primary"><Icon className="h-5 w-5" /></span>
            <span className="min-w-0 flex-1"><strong className="block font-bold">{ar ? item.ar : item.en}</strong>
              <span className="mt-1 block text-xs text-muted-foreground">{ar ? item.subAr : item.subEn}</span></span>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </Link>;
        })}
      </section>
    </main>
  );
}
