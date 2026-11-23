'use client';

import { MathWorldLoading } from '@/components/ui/MathWorldLoading';
import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Activity, UsersRound, UserPlus, ArrowUpRight, Radio, BookOpen, ClipboardList } from 'lucide-react';
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
    refetchOnMountOrArgChange: 90,
    refetchOnFocus: false,
    refetchOnReconnect: true,
    pollingInterval: 120_000,
    skipPollingIfUnfocused: true,
  });
  const n = (value: number) => new Intl.NumberFormat(ar ? 'ar' : 'en').format(value);
  const metrics = data ? [
    { text: ar ? 'كل الطلاب المسجلين' : 'Registered learners', value: data.TotalStudents, icon: UsersRound },
    { text: ar ? 'تسجيلات جديدة' : 'New sign-ups', value: data.NewStudents, icon: UserPlus },
    { text: ar ? 'طلاب حلّوا مسائل' : 'Learners who practiced', value: data.ActiveSolvers, icon: Activity },
    { text: ar ? 'متصلون خلال آخر 5 دقائق' : 'Seen in last 5 minutes', value: data.OnlineLearners, icon: Radio },
  ] : [];
  const trends = (data?.DailyActivity ?? []).map(day => ({
    label: new Date(day.DayUtc).toLocaleDateString(ar ? 'ar' : 'en', { day: 'numeric', month: 'short', timeZone: 'UTC' }),
    students: day.ActiveSolvers,
    signups: day.Signups,
  }));

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8" dir={ar ? 'rtl' : 'ltr'}>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 space-y-1.5">
          <p className="text-xs font-bold tracking-wide text-primary">{ar ? 'لوحة الإدارة' : 'Admin dashboard'}</p>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{ar ? 'نظرة عامة' : 'Overview'}</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            {ar ? 'ملخص أعداد الطلاب ونشاطهم حسب المرحلة التعليمية خلال الفترة المحددة.'
              : 'Student counts and learning activity by stage for the selected period.'}
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
      </div> : !data ? <div role="status" aria-busy="true" aria-label={ar ? 'تحميل إحصائيات الإدارة' : 'Loading admin analytics'} className="space-y-4 animate-pulse">
        <MathWorldLoading compact />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{Array.from({ length: 4 }, (_, i) => <div key={i} className="h-36 rounded-2xl bg-muted/60" />)}</div>
        <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]"><div className="h-72 rounded-3xl bg-muted/60" /><div className="h-72 rounded-3xl bg-muted/60" /></div>
      </div> : <>
        <div aria-label={ar ? 'المؤشرات الأساسية' : 'Key indicators'} className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            const palette = palettes[index];
            return <section key={metric.text} className={`relative min-w-0 overflow-hidden rounded-2xl border bg-gradient-to-br p-3 sm:p-5 ${palette.border} ${palette.bg}`}>
              <StageGeometry variant={index} className="pointer-events-none absolute -end-8 -top-9 h-28 w-28 opacity-20" />
              <Icon className={`mb-2 h-5 w-5 sm:mb-4 ${palette.text}`} aria-hidden />
              <strong className="block text-2xl font-black tabular-nums sm:text-3xl">{n(metric.value)}</strong>
              <span className="mt-1 block text-xs font-semibold leading-5 sm:text-sm">{metric.text}</span>
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
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} minTickGap={18} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} />
                  <Tooltip contentStyle={{ backgroundColor: "var(--color-card)", color: "var(--color-foreground)", border: "1px solid var(--color-border)", borderRadius: 12 }} labelStyle={{ color: "var(--color-foreground)" }} itemStyle={{ color: "var(--color-foreground)" }} />
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
                    <span className="shrink-0 text-xs text-muted-foreground">{n(stage.ActiveSolvers)} {ar ? 'حلّ خلال الفترة' : 'practiced'} · <span className="text-emerald-700 dark:text-emerald-300">{n(stage.OnlineLearners)} {ar ? 'متصل مؤخراً' : 'recently online'}</span></span>
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

      {/* Exactly three high-level management cards: no redundant destinations. */}
      <section aria-label={ar ? 'إدارة المنصة' : 'Platform management'} className="space-y-3">
        <div>
          <h2 className="text-lg font-bold">{ar ? 'إدارة المنصة' : 'Manage MathWorld'}</h2>
          <p className="text-sm text-muted-foreground">{ar
            ? 'الطلاب والاشتراكات بمكان واحد، والمحتوى يبدأ بالمرحلة ثم الفئة ثم المسألة.'
            : 'Learners and subscriptions share one page; learning content follows stage, category, then question.'}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { href: '/admin/users', icon: UsersRound, ar: 'إدارة الطلاب والاشتراكات', en: 'Learners & subscriptions',
              subAr: 'حسابات الطلاب وتفعيل أو تجديد Premium', subEn: 'Student accounts, Premium activation and renewal' },
            { href: '/admin/stages', icon: BookOpen, ar: 'المحتوى التعليمي', en: 'Learning content',
              subAr: 'المراحل ثم الفئات ثم إدارة المسائل', subEn: 'Stages, categories and problems' },
            { href: '/admin/engagement/students', icon: ClipboardList, ar: 'سجل عمليات الطلاب', en: 'Learner activity log',
              subAr: 'التسجيل والدخول والخروج والأنشطة الفعلية', subEn: 'Registrations, logins, sign-outs and actual activity' },
          ].map(item => {
            const Icon = item.icon;
            return <Link key={item.href} href={item.href}
              className="group flex items-start gap-3 rounded-2xl border bg-card p-5 transition-colors hover:border-primary/50 hover:bg-muted/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
              <span className="rounded-xl bg-primary/10 p-3 text-primary"><Icon className="h-5 w-5" aria-hidden /></span>
              <span className="min-w-0 flex-1">
                <strong className="block text-sm font-bold">{ar ? item.ar : item.en}</strong>
                <span className="mt-1 block text-xs leading-5 text-muted-foreground">{ar ? item.subAr : item.subEn}</span>
              </span>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            </Link>;
          })}
        </div>
      </section>
    </main>
  );
}
