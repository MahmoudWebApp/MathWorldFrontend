'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ArrowLeft, Trophy, UsersRound, Shapes } from 'lucide-react';
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  useGetAdminEngagementOverviewQuery,
  useGetAdminEngagementStageQuery,
} from '@/store/api/statsApi';
import { StageGeometry } from '@/components/math/StageGeometry';

const variants = [
  { border: 'border-cyan-400/35', surface: 'bg-cyan-500/10', text: 'text-cyan-700 dark:text-cyan-300' },
  { border: 'border-amber-400/35', surface: 'bg-orange-500/10', text: 'text-amber-700 dark:text-amber-300' },
  { border: 'border-emerald-400/35', surface: 'bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-300' },
  { border: 'border-violet-400/35', surface: 'bg-violet-500/10', text: 'text-violet-700 dark:text-violet-300' },
] as const;

export default function AdminEngagementPage() {
  const ar = useLocale() === 'ar';
  const [days, setDays] = useState<7 | 30 | 90>(30);
  const [stageId, setStageId] = useState<number | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedDays = Number(params.get('days'));
    const requestedStage = Number(params.get('stageId'));
    if (requestedDays === 7 || requestedDays === 30 || requestedDays === 90) setDays(requestedDays);
    if (Number.isSafeInteger(requestedStage) && requestedStage > 0) setStageId(requestedStage);
  }, []);

  const overview = useGetAdminEngagementOverviewQuery(days, { refetchOnMountOrArgChange: true });
  const resolvedId = stageId && overview.data?.Stages.some(s => s.StageId === stageId)
    ? stageId : (overview.data?.Stages[0]?.StageId ?? 0);
  const stage = useGetAdminEngagementStageQuery({stageId: resolvedId, days}, {
    skip: resolvedId <= 0, refetchOnMountOrArgChange: true,
  });
  const n = (value: number) => new Intl.NumberFormat(ar ? 'ar' : 'en').format(value);
  const currentIndex = overview.data?.Stages.findIndex(s => s.StageId === resolvedId) ?? 0;
  const palette = variants[Math.max(0, currentIndex) % variants.length];
  const categoryChart = stage.data?.Categories.map(category => ({
    name: ar ? category.NameAr : category.NameEn,
    learners: category.ActiveSolvers,
    solves: category.TotalSolved,
  })) ?? [];

  return <main dir={ar ? 'rtl' : 'ltr'} className="mx-auto max-w-6xl space-y-7 px-4 py-8 sm:px-6">
    <header className="space-y-2">
      <Link href="/admin" className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" /> {ar ? 'لوحة الإدارة' : 'Admin overview'}
      </Link>
      <h1 className="text-3xl font-extrabold">{ar ? 'نشاط المستويات والفئات' : 'Stage & category engagement'}</h1>
      <p className="text-sm text-muted-foreground">
        {ar ? 'مين عم يحل أكثر؟ وأي فئة أكثر استخداماً؟ ترتيب الحلول يعتمد على عدد المسائل المختلفة المحلولة، مو نسب الصح والخطأ.'
          : 'Who practices most, and where? Rankings use distinct solved problems, not right/wrong percentages.'}
      </p>
    </header>

    <div className="flex flex-wrap gap-2" role="group" aria-label={ar ? 'الفترة الزمنية' : 'Time window'}>
      {([7,30,90] as const).map(value => <button key={value} type="button" onClick={() => setDays(value)}
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
    {!overview.data && !overview.isError && <p role="status">{ar ? 'جارٍ التحميل…' : 'Loading…'}</p>}

    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {(overview.data?.Stages ?? []).map((item, index) => {
        const style = variants[index % variants.length];
        return <button key={item.StageId} type="button" onClick={() => setStageId(item.StageId)}
          aria-pressed={item.StageId === resolvedId}
          className={`relative overflow-hidden rounded-2xl border p-4 text-start transition-all hover:shadow-md ${style.surface} ${item.StageId === resolvedId ? style.border + ' ring-2 ring-primary/40' : 'border-border'}`}>
          <StageGeometry variant={index} className={`pointer-events-none absolute -end-6 -top-8 h-24 w-24 opacity-20 ${style.text}`} />
          <span className="relative block text-sm font-bold">{ar ? item.NameAr : item.NameEn}</span>
          <strong className={`relative mt-4 block text-2xl font-black ${style.text}`}>{n(item.ActiveSolvers)}</strong>
          <span className="relative text-xs text-muted-foreground">{ar ? 'طلاب نشطون' : 'Active learners'}</span>
        </button>;
      })}
    </div>

    {stage.isError && <div role="alert" className="rounded-2xl border p-5">
      {ar ? 'تعذّر تحميل إحصائيات هذا المستوى.' : 'Could not load stage details.'}
      <button type="button" onClick={() => void stage.refetch()} className="ms-3 text-primary underline">
        {ar ? 'إعادة المحاولة' : 'Retry'}
      </button>
    </div>}
    {stage.isLoading && <p role="status">{ar ? 'جارٍ تحليل نشاط المستوى…' : 'Loading stage engagement…'}</p>}
    {stage.data && <>
      <section className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <div className="min-w-0 space-y-3 rounded-3xl border bg-card p-4 sm:p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold"><Shapes className={`h-5 w-5 ${palette.text}`} />
            {ar ? 'الطلاب النشطون حسب الفئة' : 'Active learners by category'}
          </h2>
          <p className="text-xs text-muted-foreground">
            {ar ? 'طلاب مختلفون حلّوا مسائل في كل فئة خلال الفترة المحددة.' : 'Distinct learners practicing each category in the chosen period.'}
          </p>
          {categoryChart.every(x => x.learners === 0) ? <p className="py-16 text-center text-sm text-muted-foreground">
            {ar ? 'ما في نشاط مسجّل خلال هالفترة.' : 'No practice recorded for this time window.'}
          </p> :
            <div className="h-72 w-full" role="img" aria-label={ar ? 'مقارنة نشاط الفئات' : 'Category activity chart'}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChart} layout="vertical" margin={{ top: 4, right: 6, bottom: 4, left: 12 }}>
                  <CartesianGrid strokeDasharray="3 5" horizontal={false} opacity={0.18} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }}/>
                  <YAxis dataKey="name" type="category" width={105} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar name={ar ? 'طلاب نشطون' : 'Active learners'} dataKey="learners" fill="#06b6d4" radius={[0,6,6,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>}
        </div>
        <div className="rounded-3xl border bg-card p-4 sm:p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold"><Trophy className="h-5 w-5 text-amber-500" />
            {ar ? 'الأكثر حلّاً في المستوى' : 'Top solvers in stage'}
          </h2>
          {stage.data.TopStudents.length === 0 ? <p className="text-sm text-muted-foreground">
            {ar ? 'ما في حلول مسجّلة بعد.' : 'No solved problems yet.'}
          </p> : <ol className="space-y-2">
            {stage.data.TopStudents.slice(0,10).map(item => <li key={item.UserId}
              className="flex items-center gap-3 rounded-xl bg-muted/40 p-3">
              <span className="w-7 shrink-0 text-center text-sm font-extrabold text-primary">{item.Rank}</span>
              <span className="min-w-0 flex-1 truncate text-sm font-semibold">{item.FullName}</span>
              <span className="shrink-0 text-xs font-bold">{n(item.Solved)} {ar ? 'مسألة' : 'solved'}</span>
            </li>)}
          </ol>}
        </div>
      </section>

      <section className="space-y-4">
        <div><h2 className="text-xl font-bold">{ar ? 'أفضل الطلاب بكل فئة' : 'Top students per category'}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {ar ? 'الترتيب مبني على عدد المسائل المختلفة المحلولة في كل فئة، خلال كامل سجل المنصة.'
              : 'Ranked by unique problems solved per category, across all recorded history.'}
          </p></div>
        <div className="grid gap-3 md:grid-cols-2">
          {stage.data.Categories.map((cat,index) => {
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
      </section>
    </>}
    <div className="flex flex-wrap gap-3 border-t pt-5">
      <Link href="/admin/activity" className="rounded-xl border px-4 py-2 text-sm font-bold hover:bg-muted">
        <UsersRound className="me-2 inline h-4 w-4" />{ar ? 'آخر نشاط الطلاب' : 'Learner activity'}
      </Link>
      <Link href="/admin/audit" className="rounded-xl border px-4 py-2 text-sm font-bold hover:bg-muted">
        {ar ? 'سجل عمليات الطلاب والأدمن' : 'Audit trail'}
      </Link>
    </div>
  </main>;
}
