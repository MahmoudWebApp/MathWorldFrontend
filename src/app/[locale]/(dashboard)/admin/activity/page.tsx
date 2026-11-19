'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { CalendarDays, Search, UserRoundSearch, History, ArrowLeft, Clock3 } from 'lucide-react';
import {
  useGetAdminEngagementOverviewQuery,
  useGetAdminEngagementStudentsQuery,
} from '@/store/api/statsApi';

export default function AdminLearnerActivityPage() {
  const ar = useLocale() === 'ar';
  const [stageId, setStageId] = useState<number | undefined>();
  const [searchText, setSearchText] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const overview = useGetAdminEngagementOverviewQuery(30);
  const students = useGetAdminEngagementStudentsQuery({page, stageId, search}, {
    refetchOnMountOrArgChange: true,
  });
  const n = (value: number) => new Intl.NumberFormat(ar ? 'ar' : 'en').format(value);
  const timestamp = (value: string | null | undefined) => {
    if (!value) return ar ? 'غير مسجّل' : 'Not recorded';
    const parsed = new Date(value);
    return Number.isFinite(parsed.getTime())
      ? new Intl.DateTimeFormat(ar ? 'ar' : 'en', {dateStyle: 'medium', timeStyle: 'short'}).format(parsed)
      : '—';
  };
  const stageName = (id: number | null) => {
    if (id == null) return ar ? 'لم يحدد' : 'Not chosen';
    const found = overview.data?.Stages.find(s => s.StageId === id);
    return found ? (ar ? found.NameAr : found.NameEn) : `#${id}`;
  };

  return <main dir={ar ? 'rtl' : 'ltr'} className="mx-auto max-w-6xl space-y-7 px-4 py-8 sm:px-6">
    <header className="space-y-2">
      <Link href="/admin" className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" />{ar ? 'لوحة المراقبة' : 'Monitoring home'}
      </Link>
      <h1 className="flex items-center gap-3 text-2xl font-extrabold tracking-tight sm:text-3xl"><UserRoundSearch className="h-6 w-6 shrink-0 text-primary sm:h-7 sm:w-7" />
        {ar ? 'نشاط الطلاب' : 'Learner activity'}
      </h1>
      <p className="text-sm leading-7 text-muted-foreground">
        {ar ? 'تاريخ التسجيل وآخر دخول وحل للمسائل والمرحلة الحالية لكل طالب.'
          : 'Registration, latest sign-in, practice and learning stage for each student.'}
      </p>
    </header>

    <section className="grid gap-4 rounded-2xl border bg-card p-4 sm:grid-cols-[1fr_1fr_auto] sm:p-5">
      <form onSubmit={event => { event.preventDefault(); setSearch(searchText.trim()); setPage(1); }} className="space-y-1">
        <label htmlFor="student-activity-search" className="block text-sm font-bold">
          {ar ? 'اسم الطالب' : 'Student name'}
        </label>
        <div className="flex gap-2">
          <input id="student-activity-search" value={searchText}
            maxLength={80} onChange={event => setSearchText(event.target.value)}
            placeholder={ar ? 'ابحث عن طالب…' : 'Search students…'}
            className="min-w-0 flex-1 rounded-xl border bg-background px-3 py-2 text-sm" />
          <button type="submit" className="rounded-xl bg-primary px-3 py-2 text-primary-foreground" aria-label={ar ? 'بحث' : 'Search'}>
            <Search className="h-5 w-5" />
          </button>
        </div>
      </form>
      <label className="space-y-1">
        <span className="block text-sm font-bold">{ar ? 'المستوى' : 'Stage'}</span>
        <select value={stageId ?? ''} onChange={event => {
          setStageId(event.target.value ? Number(event.target.value) : undefined); setPage(1);
        }} className="w-full rounded-xl border bg-background px-3 py-2 text-sm">
          <option value="">{ar ? 'كل المستويات' : 'All stages'}</option>
          {overview.data?.Stages.map(stage => <option key={stage.StageId} value={stage.StageId}>
            {ar ? stage.NameAr : stage.NameEn}
          </option>)}
        </select>
      </label>
      <div className="flex items-end">
        <button type="button" onClick={() => {void students.refetch();void overview.refetch();}}
          className="w-full rounded-xl border px-4 py-2 text-sm font-bold hover:bg-muted sm:w-auto">
          {ar ? 'تحديث' : 'Refresh'}
        </button>
      </div>
    </section>

    {students.isLoading ? <p role="status" className="rounded-xl border p-6">
      {ar ? 'جارٍ تحميل الطلاب…' : 'Loading learners…'}
    </p> : students.isError ? <div role="alert" className="rounded-xl border p-6">
      {ar ? 'تعذّر تحميل سجل نشاط الطلاب.' : 'Could not load learner activity.'}
      <button type="button" onClick={() => void students.refetch()} className="ms-2 text-primary underline">
        {ar ? 'إعادة المحاولة' : 'Retry'}
      </button>
    </div> : <>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">{ar ? 'حسابات الطلاب' : 'Learners'}</h2>
        <p className="text-sm text-muted-foreground">{n(students.data?.Total ?? 0)} {ar ? 'طالب' : 'students'}</p>
      </div>
      {!students.data?.Students.length && <p className="rounded-xl border p-8 text-center text-muted-foreground">
        {ar ? 'لا يوجد طلاب ضمن التصفية.' : 'No learners match the filters.'}
      </p>}
      <div className="grid gap-3 md:grid-cols-2">
        {students.data?.Students.map(student => {
          const lastPractice = student.LastPracticeAt ? new Date(student.LastPracticeAt) : null;
          const activeToday = lastPractice && lastPractice.getTime() >= Date.now() - 24 * 60 * 60 * 1000;
          return <article key={student.Id} className="space-y-4 rounded-2xl border bg-card p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate text-base font-bold">{student.FullName}</h3>
                <p className="text-xs text-muted-foreground">#{student.Id} · {stageName(student.CurrentStageId)}</p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${!student.IsActive ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300' : activeToday ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'bg-muted text-muted-foreground'}`}>
                {!student.IsActive ? (ar ? 'حساب معطل' : 'Account inactive')
                  : activeToday ? (ar ? 'حلّ خلال 24 ساعة' : 'Practiced in 24h')
                  : (ar ? 'لا يوجد حل حديث' : 'No recent practice')}
              </span>
            </div>
            <dl className="space-y-2 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <dt className="flex items-center gap-2 text-muted-foreground"><CalendarDays className="h-4 w-4" />{ar ? 'سجّل بالمنصة' : 'Signed up'}</dt>
                <dd className="font-medium">{timestamp(student.CreatedAt)}</dd>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <dt className="flex items-center gap-2 text-muted-foreground"><Clock3 className="h-4 w-4" />{ar ? 'آخر دخول' : 'Last sign-in'}</dt>
                <dd className="font-medium">{timestamp(student.LastLoginAt)}</dd>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <dt className="flex items-center gap-2 text-muted-foreground"><Clock3 className="h-4 w-4" />{ar ? 'آخر حل' : 'Last practice'}</dt>
                <dd className="font-medium">{timestamp(student.LastPracticeAt)}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">{ar ? 'مجموع المحاولات' : 'Recorded attempts'}</dt>
                <dd className="font-bold">{n(student.Attempts)}</dd>
              </div>
            </dl>
            <Link href={`/admin/audit?userId=${student.Id}`}
              className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline">
              <History className="h-4 w-4" />{ar ? 'عرض سجل عمليات الطالب' : 'View student action history'}
            </Link>
          </article>;
        })}
      </div>
      <div className="flex items-center justify-between border-t pt-4 text-sm">
        <button type="button" disabled={page <= 1 || students.isFetching}
          onClick={() => setPage(value => Math.max(1,value-1))}
          className="rounded-xl border px-4 py-2 font-bold disabled:opacity-40">{ar ? 'السابق' : 'Previous'}</button>
        <span>{page} / {Math.max(1,Math.ceil((students.data?.Total ?? 0) / 20))}</span>
        <button type="button" disabled={!students.data || students.isFetching || page * 20 >= students.data.Total}
          onClick={() => setPage(value => value+1)}
          className="rounded-xl border px-4 py-2 font-bold disabled:opacity-40">{ar ? 'التالي' : 'Next'}</button>
      </div>
    </>}
    <p className="text-xs text-muted-foreground">
      {ar ? 'ما منعرض وقت خروج لأن JWT لا يثبت إمتى المستخدم أغلق المتصفح أو التطبيق. ممكن نضيف جلسات Heartbeat لاحقاً لتقدير آخر ظهور.'
        : 'JWT does not reliably detect browser/app shutdown. Sign-out time is intentionally not invented; heartbeat sessions can provide approximate presence later.'}
    </p>
  </main>;
}
