'use client';
import {WorkspacePageHeader} from '@/components/ui/WorkspacePageHeader';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Trophy, UsersRound, Shapes, ChevronDown, RefreshCw } from 'lucide-react';
import { DirectionalArrow } from '@/components/ui/DirectionalNavigation';
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  useGetAdminEngagementOverviewQuery,
  useGetAdminEngagementStageQuery,
} from '@/store/api/statsApi';
import { StageGeometry } from '@/components/math/StageGeometry';

const variants = [
  { border: 'border-cyan-400/35', surface: 'bg-cyan-500/10', text: 'text-cyan-700 dark:text-cyan-300', chart: '#0891b2' },
  { border: 'border-amber-400/35', surface: 'bg-orange-500/10', text: 'text-amber-700 dark:text-amber-300', chart: '#ea580c' },
  { border: 'border-emerald-400/35', surface: 'bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-300', chart: '#059669' },
  { border: 'border-violet-400/35', surface: 'bg-violet-500/10', text: 'text-violet-700 dark:text-violet-300', chart: '#8b5cf6' },
] as const;

export default function AdminEngagementPage() {
  const ar = useLocale() === 'ar';
  const [days, setDays] = useState<7 | 30 | 90>(30);
  const [stageId, setStageId] = useState<number | null>(null);
  const [showAllCategories, setShowAllCategories] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedDays = Number(params.get('days'));
    const requestedStage = Number(params.get('stageId'));
    if (requestedDays === 7 || requestedDays === 30 || requestedDays === 90) setDays(requestedDays);
    if (Number.isSafeInteger(requestedStage) && requestedStage > 0) setStageId(requestedStage);
  }, []);

  const overview = useGetAdminEngagementOverviewQuery(days, {
    refetchOnMountOrArgChange: 90, refetchOnFocus: false,
    refetchOnReconnect: true, pollingInterval: 120_000,
    skipPollingIfUnfocused: true,
  });
  const resolvedId = stageId && overview.data?.Stages.some(s => s.StageId === stageId)
    ? stageId : (overview.data?.Stages[0]?.StageId ?? 0);
  const stage = useGetAdminEngagementStageQuery({stageId: resolvedId, days}, {
    skip: resolvedId <= 0, refetchOnMountOrArgChange: 90,
    refetchOnFocus: true, refetchOnReconnect: true,
  });
  const n = (value: number) => new Intl.NumberFormat(ar ? 'ar' : 'en').format(value);

  // A stage with dozens of topics must not produce an unreadable 72px/row
  // chart, nor bury the leaderboard below an endless list of cards.
  const selectedStage = stage.currentData?.StageId === resolvedId &&
    stage.currentData?.WindowDays === days ? stage.currentData : undefined;
  const rankedCategories = [...(selectedStage?.Categories ?? [])]
    .sort((a, b) => b.ActiveSolvers - a.ActiveSolvers ||
      b.AttemptsInWindow - a.AttemptsInWindow || a.CategoryId - b.CategoryId);
  const chartCategories = rankedCategories.slice(0, 8);
  const categoryChart = chartCategories.map(category => ({
    id: category.CategoryId,
    name: ar ? category.NameAr : category.NameEn,
    learners: category.ActiveSolvers,
  }));
  const categoryCards = showAllCategories
    ? rankedCategories : rankedCategories.slice(0, 6);
  const hasOverflowCategories = rankedCategories.length > 6;
  const chartHeight = Math.max(220, chartCategories.length * 42);
  const stageVisualIndex = Math.max(0, overview.data?.Stages.findIndex(x =>
    x.StageId === resolvedId) ?? 0);
  const chartColor = variants[stageVisualIndex % variants.length].chart;

  return <main dir={ar ? 'rtl' : 'ltr'} className="mx-auto max-w-6xl space-y-7 px-4 py-8 sm:px-6">
    <header className="space-y-2">
      
      <WorkspacePageHeader title={ar?'نشاط المراحل والفئات':'Stage and topic activity'} icon={Shapes}/>
      
    </header>

    <div className="grid gap-3 sm:grid-cols-2">
      <Link href="/admin/engagement/students" className="rounded-2xl border border-primary/20 bg-card/80 p-4 transition-colors hover:bg-primary/5 hover:border-primary/40">
        <strong className="block font-bold">{ar ? 'التسجيل والدخول وسجل الطلاب' : 'Student sign-ins and event log'}</strong>
        <span className="mt-1 block text-xs text-muted-foreground">{ar
          ? 'التسجيل والدخول والخروج الصريح وآخر نشاط وسجل العمليات لكل طالب'
          : 'Registrations, sign-ins, explicit sign-outs and individual student activity; no admin events'}</span>
      </Link>
      <Link href="/admin/analytics" className="rounded-2xl border border-primary/20 bg-card/80 p-4 transition-colors hover:bg-primary/5 hover:border-primary/40">
        <strong className="block font-bold">{ar ? 'إحصائيات التعلّم والتفاعل' : 'Learning and engagement analytics'}</strong>
        <span className="mt-1 block text-xs text-muted-foreground">{ar
          ? 'المتفوقون والأكثر حلاً والدقة والأخطاء حسب المرحلة والفئة'
          : 'Top solvers, accuracy and mistakes across stages and topics'}</span>
      </Link>
    </div>

    <div className="flex flex-wrap gap-2" role="group" aria-label={ar ? 'الفترة الزمنية' : 'Time window'}>
      {([7,30,90] as const).map(value => <button key={value} type="button" onClick={() => { setDays(value); setShowAllCategories(false); }}
        aria-pressed={days === value} className={`rounded-xl border px-4 py-2 text-sm font-semibold ${days === value ? 'bg-primary text-primary-foreground' : 'bg-card'}`}>
        {value} {ar ? 'يوم' : 'days'}
      </button>)}
    </div>

    {overview.isError && <div role="alert" className="rounded-2xl border p-5">
      {ar ? 'تعذّر تحميل المستويات.' : 'Could not load stages.'}
      <button type="button" onClick={() => void overview.refetch()} className="ms-3 text-primary underline">
        {ar ? 'إعادة المحاولة' : 'Retry'}
      </button>
    </div>}
    {!overview.data && !overview.isError && <div role="status" aria-busy="true" aria-label={ar ? 'تحميل مستويات الإدارة' : 'Loading stages'} className="animate-pulse space-y-3">
      {Array.from({ length: 4 }, (_, i) => <div key={i} className="h-16 rounded-xl bg-muted/60" />)}
    </div>}

    {overview.data && overview.data.Stages.length === 0 && (
      <section role="status" className="rounded-2xl border bg-card p-5 text-sm text-muted-foreground">
        {ar ? 'لا توجد مراحل تعليمية تعرض إحصائياتها بعد. يمكنك مراجعة إعداد المراحل من الإدارة.'
          : 'No educational stages are available for analytics yet. Check stage configuration in Admin.'}
      </section>
    )}

    <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 lg:grid-cols-4">
      {(overview.data?.Stages ?? []).map((item, index) => {
        const style = variants[index % variants.length];
        return <button key={item.StageId} type="button" onClick={() => { setStageId(item.StageId); setShowAllCategories(false); }}
          aria-pressed={item.StageId === resolvedId}
          className={`relative min-w-0 overflow-hidden rounded-2xl border p-4 text-start transition-all hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${style.surface} ${item.StageId === resolvedId ? style.border + ' ring-2 ring-primary/40' : 'border-border'}`}>
          <StageGeometry variant={index} className={`pointer-events-none absolute -end-6 -top-8 h-24 w-24 opacity-20 ${style.text}`} />
          <span className="relative block break-words text-sm font-bold">{ar ? item.NameAr : item.NameEn}</span>
          <strong className={`relative mt-4 block text-2xl font-black ${style.text}`}>{n(item.ActiveSolvers)}</strong>
          <span className="relative block text-xs text-muted-foreground">{ar ? 'تدرّبوا خلال الفترة' : 'Practiced in period'}</span>
          <span className="relative mt-2 block text-xs font-semibold text-foreground/80">
            {n(item.OnlineLearners)} {ar ? 'اتصلوا آخر 5 دقائق' : 'Seen in last 5 minutes'}
          </span>
        </button>;
      })}
    </div>

    {stage.isError && <div role="alert" className="rounded-2xl border p-5">
      <RefreshCw aria-hidden="true" className="mb-2 h-5 w-5 text-primary" />
      {ar ? 'تعذّر تحميل إحصائيات هذا المستوى.' : 'Could not load stage details.'}
      <button type="button" onClick={() => void stage.refetch()} className="ms-3 text-primary underline">
        {ar ? 'إعادة المحاولة' : 'Retry'}
      </button>
    </div>}
    {(stage.isFetching && !selectedStage) && <p role="status" className="rounded-2xl border bg-card p-5">
      {ar ? 'جارٍ تحميل نشاط المستوى المختار…' : 'Loading the selected stage…'}
    </p>}
    {selectedStage && <>
      <section className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <div className="min-w-0 space-y-3 rounded-3xl border bg-card p-4 sm:p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold"><Shapes className="h-5 w-5 text-primary" />
            {ar ? 'الطلاب النشطون حسب الفئة' : 'Active learners by category'}
          </h2>
          <p className="text-xs text-muted-foreground">
            {ar ? 'أكثر 8 فئات نشاطاً حسب عدد الطلاب المختلفين خلال الفترة المحددة.' : 'Top 8 categories by distinct learners practicing in the selected period.'}
          </p>
          {categoryChart.every(x => x.learners === 0) ? <p className="py-16 text-center text-sm text-muted-foreground">
            {ar ? 'ما في نشاط مسجّل خلال هالفترة.' : 'No practice recorded for this time window.'}
          </p> :
            <div className="w-full min-w-0" style={{ height: chartHeight }} role="img" aria-label={ar ? 'مقارنة نشاط أكثر ثماني فئات' : 'Chart of eight most active categories'}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChart} layout="vertical" margin={{ top: 4, right: 6, bottom: 4, left: 12 }}>
                  <CartesianGrid strokeDasharray="3 5" horizontal={false} opacity={0.18} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} />
                  <YAxis dataKey="name" type="category" width={ar ? 108 : 116} tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }}
                    tickFormatter={label => String(label).length > 14 ? String(label).slice(0, 13) + '…' : String(label)} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--color-card)', color: 'var(--color-foreground)', border: '1px solid var(--color-border)', borderRadius: 12 }} labelStyle={{ color: 'var(--color-foreground)' }} itemStyle={{ color: 'var(--color-foreground)' }} />
                  <Bar name={ar ? 'طلاب نشطون' : 'Active learners'} dataKey="learners" fill={chartColor} radius={[0,6,6,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>}
        </div>
        <div className="rounded-3xl border bg-card p-4 sm:p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold"><Trophy className="h-5 w-5 text-amber-500" />
            {ar ? 'الأكثر حلّاً في المستوى (كل الوقت)' : 'Top solvers in stage (all time)'}
          </h2>
          {selectedStage.TopStudents.length === 0 ? <p className="text-sm text-muted-foreground">
            {ar ? 'ما في حلول مسجّلة بعد.' : 'No solved problems yet.'}
          </p> : <ol className="space-y-2">
            {selectedStage.TopStudents.slice(0,10).map(item => <li key={item.UserId}
              className="flex items-center gap-3 rounded-xl bg-muted/40 p-3">
              <span className="w-7 shrink-0 text-center text-sm font-extrabold text-primary">{item.Rank}</span>
              <span className="min-w-0 flex-1 truncate text-sm font-semibold">{item.FullName}</span>
              <span className="shrink-0 text-xs font-bold">{n(item.Solved)} {ar ? 'مسألة' : 'solved'}</span>
            </li>)}
          </ol>}
        </div>
      </section>

      <section className="space-y-4">
        <div><h2 className="text-xl font-bold">{ar ? 'أفضل الطلاب بكل فئة (كل الوقت)' : 'Top students per category (all time)'}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {ar ? 'الترتيب مبني على عدد المسائل المختلفة المحلولة في كل فئة، خلال كامل سجل المنصة.'
              : 'Ranked by unique problems solved per category, across all recorded history.'}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {ar ? 'نعرض أول 6 فئات لتبقى الصفحة مرتبة؛ يمكن توسيع القائمة.' :
              'Showing the top six topics to keep this page readable; expand for all categories.'}
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {categoryCards.map((cat,index) => {
            const color = variants[index % variants.length];
            return <article key={cat.CategoryId} className={`rounded-2xl border bg-card p-4 sm:p-5 ${color.border}`}>
              <div className="flex items-center gap-3">
                <StageGeometry variant={index} className={`h-10 w-10 shrink-0 ${color.text}`} />
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-bold">{ar ? cat.NameAr : cat.NameEn}</h3>
                  <p className="text-xs text-muted-foreground">{n(cat.ActiveSolvers)} {ar ? 'طالب نشط بالفترة' : 'active in period'} · {n(cat.TotalSolved)} {ar ? 'حل مختلف' : 'unique solves'}</p>
                </div>
              </div>
              {cat.TopStudents.length === 0 ? <p className="mt-4 text-sm text-muted-foreground">
                {ar ? 'لسه ما في طلاب حلّوا ضمن هاي الفئة.' : 'No solved problems in this category yet.'}
              </p> : <ol className="mt-4 space-y-2">
                {cat.TopStudents.map(student => <li key={student.UserId} className="flex items-center justify-between gap-2 text-sm">
                  <span className="min-w-0 truncate"><span className={`me-2 font-extrabold ${color.text}`}>{student.Rank}.</span>{student.FullName}</span>
                  <span className="shrink-0 tabular-nums font-bold">{n(student.Solved)}</span>
                </li>)}
              </ol>}
            </article>;
          })}
        </div>
        {hasOverflowCategories && (
          <button type="button" aria-expanded={showAllCategories}
            onClick={() => setShowAllCategories(value => !value)}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border bg-card px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
            {showAllCategories
              ? (ar ? 'عرض عدد أقل من الفئات' : 'Show fewer categories')
              : (ar ? `عرض جميع الفئات (${n(rankedCategories.length)})` :
                `Show all categories (${n(rankedCategories.length)})`)}
            <ChevronDown aria-hidden="true" className={`h-4 w-4 transition-transform ${showAllCategories ? 'rotate-180' : ''}`} />
          </button>
        )}
      </section>
    </>}
    <div className="flex flex-wrap gap-3 border-t pt-5">
      <Link href="/admin/engagement/students" className="rounded-xl border px-4 py-2 text-sm font-bold hover:bg-muted">
        <UsersRound className="me-2 inline h-4 w-4" />{ar ? 'متابعة الطلاب وسجلهم' : 'Student monitoring and log'}
      </Link>
    </div>
  </main>;
}
