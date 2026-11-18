'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Search, UserRoundSearch, RefreshCw } from 'lucide-react';
import { useGetAdminEngagementOverviewQuery, useGetAdminEngagementStudentsQuery } from '@/store/api/statsApi';

export default function AdminLearnerActivityPage() {
  const ar = useLocale() === 'ar';
  const [searchInput, setSearchInput] = useState('');
  const [term, setTerm] = useState('');
  const [stageId, setStageId] = useState(0);
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [page, setPage] = useState(1);
  const stages = useGetAdminEngagementOverviewQuery(30, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    skipPollingIfUnfocused: true,
    pollingInterval: 60_000,
  });
  const result = useGetAdminEngagementStudentsQuery({
    page, ...(stageId ? { stageId } : {}), ...(term ? { search: term } : {}),
    ...(onlineOnly ? { onlineOnly: true } : {}),
  }, { refetchOnMountOrArgChange: true, pollingInterval: 60_000, skipPollingIfUnfocused: true });
  const n = (value: number) => new Intl.NumberFormat(ar ? 'ar' : 'en').format(value);
  const date = (value: string | null) => {
    if (!value) return ar ? 'غير مسجّل' : 'Not recorded';
    const parsed = new Date(value);
    return Number.isFinite(parsed.getTime()) ? new Intl.DateTimeFormat(ar ? 'ar' : 'en', {
      dateStyle: 'medium', timeStyle: 'short',
    }).format(parsed) : '—';
  };
  const names = new Map(stages.data?.Stages.map(stage => [
    stage.StageId, ar ? stage.NameAr : stage.NameEn,
  ]) ?? []);
  return <main dir={ar ? 'rtl' : 'ltr'} className="mx-auto max-w-6xl space-y-6 px-4 py-8">
    <header className="space-y-2">
      <Link href="/admin" className="text-sm font-semibold text-primary underline">
        {ar ? 'لوحة المراقبة' : 'Monitoring dashboard'}
      </Link>
      <h1 className="flex items-center gap-2 text-3xl font-black">
        <UserRoundSearch className="h-7 w-7 text-primary"/>
        {ar ? 'سجل استخدام الطلاب' : 'Learner activity directory'}
      </h1>
      <p className="max-w-3xl text-sm text-muted-foreground">
        {ar ? 'راقب تسجيل الطلاب ومتى تدرّبوا، وفلتر آخر اتصال موثّق بالسيرفر خلال خمس دقائق. إغلاق المتصفح لا يعني خروجاً مؤكداً.'
          : 'Review registrations and actual practice. Filter learners with a verified heartbeat in the last five minutes; browser closure is not a confirmed logout.'}
      </p>
    </header>
    <section className="grid gap-3 rounded-2xl border bg-card p-4 lg:grid-cols-[minmax(0,1fr)_190px_auto_auto]">
      <form className="flex gap-2" onSubmit={event => {
        event.preventDefault(); setTerm(searchInput.trim()); setPage(1);
      }}>
        <label className="relative block min-w-0 flex-1">
          <span className="sr-only">{ar ? 'اسم الطالب' : 'Learner name'}</span>
          <Search className="pointer-events-none absolute start-3 top-3 h-4 w-4 text-muted-foreground" />
          <input value={searchInput} maxLength={80} onChange={e => setSearchInput(e.target.value)}
            placeholder={ar ? 'ابحث باسم الطالب' : 'Search by learner name'}
            className="w-full rounded-xl border bg-background py-2.5 ps-10 pe-3 text-sm" />
        </label>
        <button type="submit" className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
          {ar ? 'بحث' : 'Search'}
        </button>
      </form>
      <label className="block">
        <span className="sr-only">{ar ? 'تصفية حسب المستوى' : 'Filter by stage'}</span>
        <select className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm" value={stageId}
          onChange={e => { setStageId(Number(e.target.value)); setPage(1); }}>
          <option value={0}>{ar ? 'كل المستويات' : 'All stages'}</option>
          {(stages.data?.Stages ?? []).map(stage => <option key={stage.StageId} value={stage.StageId}>
            {ar ? stage.NameAr : stage.NameEn}
          </option>)}
        </select>
      </label>
      <label className="flex cursor-pointer items-center gap-2 rounded-xl border bg-background px-3 py-2.5 text-sm font-semibold">
        <input type="checkbox" checked={onlineOnly}
          onChange={event => { setOnlineOnly(event.target.checked); setPage(1); }}
          className="h-4 w-4 accent-emerald-600" />
        {ar ? 'متصلون خلال آخر 5 دقائق فقط' : 'Seen in the last 5 minutes only'}
      </label>
      <button type="button" onClick={() => void result.refetch()}
        className="inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold text-primary">
        <RefreshCw className="h-4 w-4"/>{ar ? 'تحديث' : 'Refresh'}
      </button>
    </section>
    <section className="overflow-hidden rounded-2xl border bg-card">
      <div className="flex flex-wrap justify-between gap-2 border-b p-4 text-sm">
        <strong>{ar ? 'الطلاب' : 'Students'}: {result.data ? n(result.data.Total) : '—'}</strong>
        <span className="text-muted-foreground">{ar ? 'الترتيب حسب تاريخ التسجيل' : 'Newest registrations first'}</span>
      </div>
      {result.isLoading ? <p role="status" className="p-8">{ar ? 'جارٍ تحميل الطلاب…' : 'Loading learners…'}</p>
        : result.isError ? <p role="alert" className="p-8">
          {ar ? 'تعذّر جلب البيانات.' : 'Could not load learner activity.'}
        </p> : !result.data?.Students.length ? <p className="p-8 text-center text-muted-foreground">
          {ar ? 'لا يوجد طلاب مطابقون.' : 'No matching students.'}
        </p> : <>
          <div className="space-y-3 p-3 md:hidden">
            {result.data.Students.map(student => (
              <article key={student.Id} className="space-y-3 rounded-xl border bg-background/70 p-4 text-sm">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <Link href={`/admin/audit?actorId=${student.Id}`}
                      className="font-bold text-primary hover:underline">{student.FullName}</Link>
                    <p className="text-xs text-muted-foreground">#{student.Id}
                      {' · '}{student.CurrentStageId ? names.get(student.CurrentStageId) ?? `#${student.CurrentStageId}` : '—'}
                    </p>
                  </div>
                  <span className={student.IsOnline
                    ? 'rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300'
                    : 'rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground'}>
                    {student.IsOnline
                      ? (ar ? 'اتصال حديث' : 'Recently online')
                      : (ar ? 'لا يوجد اتصال حديث' : 'No recent heartbeat')}
                  </span>
                </div>
                <dl className="grid grid-cols-2 gap-x-3 gap-y-2">
                  {[
                    [ar ? 'مسجل منذ' : 'Registered', date(student.CreatedAt)],
                    [ar ? 'آخر دخول' : 'Last login', date(student.LastLoginAt)],
                    [ar ? 'آخر حل' : 'Last practice', date(student.LastPracticeAt)],
                    [ar ? 'آخر اتصال' : 'Last heartbeat', date(student.LastHeartbeatAtUtc)],
                  ].map(([label, value]) => <div key={label} className="min-w-0">
                    <dt className="text-xs text-muted-foreground">{label}</dt>
                    <dd className="font-semibold">{value}</dd>
                  </div>)}
                </dl>
                <p className="border-t pt-2 font-semibold">
                  {ar ? 'محاولات الحل' : 'Practice attempts'}: {n(student.Attempts)}
                </p>
              </article>
            ))}
          </div>
          <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[870px] text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="p-3 text-start">{ar ? 'الطالب' : 'Learner'}</th>
                <th className="p-3 text-start">{ar ? 'المستوى' : 'Stage'}</th>
                <th className="p-3 text-start">{ar ? 'تاريخ التسجيل' : 'Registered'}</th>
                <th className="p-3 text-start">{ar ? 'آخر دخول' : 'Last login'}</th>
                <th className="p-3 text-start">{ar ? 'آخر حل' : 'Last practice'}</th>
                <th className="p-3 text-start">{ar ? 'آخر اتصال' : 'Last heartbeat'}</th>
                <th className="p-3 text-end">{ar ? 'المحاولات' : 'Attempts'}</th>
              </tr>
            </thead>
            <tbody>
              {result.data.Students.map(student => <tr key={student.Id} className="border-t">
                <td className="p-3 font-semibold">
                  <Link href={`/admin/audit?actorId=${student.Id}`} className="text-primary hover:underline">
                    {student.FullName}
                  </Link>
                  <span className="block text-xs font-normal text-muted-foreground">#{student.Id}
                    {' · '}{student.IsActive ? (ar ? 'مفعّل' : 'Active') : (ar ? 'معطّل' : 'Disabled')}
                  </span>
                  {student.IsOnline && <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
                    {ar ? 'اتصل خلال 5 دقائق' : 'Seen within 5 min'}
                  </span>}
                </td>
                <td className="p-3">{student.CurrentStageId ? names.get(student.CurrentStageId) ?? `#${student.CurrentStageId}` : '—'}</td>
                <td className="p-3">{date(student.CreatedAt)}</td>
                <td className="p-3">{date(student.LastLoginAt)}</td>
                <td className="p-3">{date(student.LastPracticeAt)}</td>
                <td className="p-3">{date(student.LastHeartbeatAtUtc)}</td>
                <td className="p-3 text-end font-bold tabular-nums">{n(student.Attempts)}</td>
              </tr>)}
            </tbody>
          </table>
          </div>
        </>}
      <p className="border-t px-4 py-3 text-xs text-muted-foreground">
        {ar ? 'وجود اتصال حديث لا يضمن أن الطالب يشاهد الصفحة بنفس اللحظة؛ يتوقف التحديث في الخلفية وينتهي اعتباره متصلاً بعد خمس دقائق.'
          : 'Recent connectivity is not a live socket. Backgrounded clients pause heartbeats and are considered offline after five minutes.'}
      </p>
      <div className="flex items-center justify-between gap-3 border-t p-4 text-sm">
        <button type="button" disabled={page <= 1 || result.isFetching}
          onClick={() => setPage(x => Math.max(1, x - 1))}
          className="font-semibold text-primary disabled:opacity-40">
          {ar ? 'السابق' : 'Previous'}
        </button>
        <span>{page} / {Math.max(1, Math.ceil((result.data?.Total ?? 0) / 20))}</span>
        <button type="button" disabled={result.isFetching || !result.data || page * 20 >= result.data.Total}
          onClick={() => setPage(x => x + 1)}
          className="font-semibold text-primary disabled:opacity-40">
          {ar ? 'التالي' : 'Next'}
        </button>
      </div>
    </section>
  </main>;
}
