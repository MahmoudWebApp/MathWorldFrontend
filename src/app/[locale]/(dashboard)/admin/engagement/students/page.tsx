'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Search, UserRoundSearch, RefreshCw, Download, History } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { API_BASE_URL } from '@/store/api/baseQuery';
import { useGetAdminEngagementOverviewQuery, useGetAdminEngagementStudentsQuery, useGetAdminAuditEventsQuery } from '@/store/api/statsApi';

export default function AdminLearnerActivityPage() {
  const ar = useLocale() === 'ar';
  const [searchInput, setSearchInput] = useState('');
  const [term, setTerm] = useState('');
  const [stageId, setStageId] = useState(0);
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [activityPage, setActivityPage] = useState(1);
  const [days, setDays] = useState<7 | 30 | 90>(30);
  const [action, setAction] = useState('');
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState('');
  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    // Older links to individual student audit records remain supported.
    const params = new URLSearchParams(window.location.search);
    const id = params.get('userId') ?? params.get('actorId');
    if (id && /^[1-9]\\d*$/.test(id) && Number.isSafeInteger(Number(id))) {
      setSelectedStudentId(Number(id));
    }
  }, []);
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
  const events = useGetAdminAuditEventsQuery({
    page: activityPage, days, role: 'Student',
    ...(selectedStudentId ? { actorId: selectedStudentId } : {}),
    ...(action ? { action } : {}),
  }, { refetchOnMountOrArgChange: true });

  const downloadStudentEvents = async () => {
    if (!token || exporting) return;
    setExportError('');
    setExporting(true);
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 20000);
    try {
      const url = new URL(API_BASE_URL + '/admin/activity-audit/export.csv');
      url.searchParams.set('role', 'Student');
      url.searchParams.set('days', String(days));
      if (selectedStudentId) url.searchParams.set('actorId', String(selectedStudentId));
      if (action) url.searchParams.set('action', action);
      const response = await fetch(url, {
        headers: { Authorization: 'Bearer ' + token, Accept: 'text/csv' },
        signal: controller.signal,
        cache: 'no-store',
      });
      if (!response.ok) throw new Error('Audit export failed');
      const blob = await response.blob();
      if (!blob.size || blob.size > 15 * 1024 * 1024) throw new Error('Invalid audit file');
      const downloadUrl = URL.createObjectURL(blob);
      try {
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = 'mathworld-student-activity.csv';
        document.body.appendChild(link);
        link.click();
        link.remove();
      } finally {
        window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 10000);
      }
    } catch {
      setExportError(ar ? 'تعذّر تصدير سجل الطلاب.' : 'Could not export learner activity.');
    } finally {
      window.clearTimeout(timeout);
      setExporting(false);
    }
  };

  const eventLabel = (eventAction: string, resource: string) => {
    const endpoint = resource.toLowerCase();
    if (endpoint.includes('notification') && endpoint.includes('/read'))
      return ar ? 'قراءة إشعار' : 'Read notification';
    if (endpoint.includes('problems/submit'))
      return ar ? 'إرسال إجابة مسألة' : 'Submitted problem answer';
    if (eventAction === 'Update' && endpoint.includes('stage'))
      return ar ? 'تغيير المرحلة التعليمية' : 'Changed learning stage';
    const labels: Record<string, [string, string]> = {
      Registered: ['إنشاء حساب', 'Registered'],
      LoggedIn: ['تسجيل دخول', 'Signed in'],
      LoggedInGoogle: ['تسجيل دخول بغوغل', 'Google sign-in'],
      LoggedInFacebook: ['تسجيل دخول', 'Signed in'],
      ExplicitSignOut: ['تسجيل خروج صريح', 'Explicit sign-out'],
      Redeem: ['تفعيل كود Premium', 'Redeemed Premium code'],
      CreateOrSubmit: ['إرسال نشاط', 'Submitted activity'],
      Update: ['تحديث بيانات', 'Updated information'],
      Grant: ['تفعيل ميزة', 'Access activated'],
    };
    const pair = labels[eventAction];
    return pair ? pair[ar ? 0 : 1] : (ar ? 'نشاط مسجّل' : 'Recorded activity');
  };

  const chooseStudent = (id: number) => {
    setSelectedStudentId(id);
    setActivityPage(1);
  };
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
        {ar ? 'لوحة الإدارة' : 'Admin dashboard'}
      </Link>
      <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
        <UserRoundSearch className="h-6 w-6 shrink-0 text-primary"/>
        {ar ? 'متابعة الطلاب وسجل نشاطهم' : 'Learner monitoring and activity log'}
      </h1>
      <p className="max-w-3xl text-sm text-muted-foreground">
        {ar ? 'مكان واحد لمتابعة تسجيل الطلاب ودخولهم وخروجهم الصريح ونشاطهم، بدون خلطه بعمليات الإدارة.'
          : 'Track student registrations, sign-ins, explicit sign-outs and activity in one place, separate from admin operations.'}
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
                    <button type="button" onClick={() => chooseStudent(student.Id)}
                      className="text-start font-bold text-primary hover:underline">{student.FullName}</button>
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
                    [ar ? 'آخر خروج مؤكد' : 'Last explicit sign-out', date(student.LastExplicitSignOutAtUtc ?? null)],
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
          <table className="w-full min-w-[1040px] text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="p-3 text-start">{ar ? 'الطالب' : 'Learner'}</th>
                <th className="p-3 text-start">{ar ? 'المستوى' : 'Stage'}</th>
                <th className="p-3 text-start">{ar ? 'تاريخ التسجيل' : 'Registered'}</th>
                <th className="p-3 text-start">{ar ? 'آخر دخول' : 'Last login'}</th>
                <th className="p-3 text-start">{ar ? 'آخر خروج مؤكد' : 'Last explicit sign-out'}</th>
                <th className="p-3 text-start">{ar ? 'آخر حل' : 'Last practice'}</th>
                <th className="p-3 text-start">{ar ? 'آخر اتصال' : 'Last heartbeat'}</th>
                <th className="p-3 text-end">{ar ? 'المحاولات' : 'Attempts'}</th>
              </tr>
            </thead>
            <tbody>
              {result.data.Students.map(student => <tr key={student.Id} className="border-t">
                <td className="p-3 font-semibold">
                  <button type="button" onClick={() => chooseStudent(student.Id)} className="text-start text-primary hover:underline">
                    {student.FullName}
                  </button>
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
                <td className="p-3">{date(student.LastExplicitSignOutAtUtc ?? null)}</td>
                <td className="p-3">{date(student.LastPracticeAt)}</td>
                <td className="p-3">{date(student.LastHeartbeatAtUtc)}</td>
                <td className="p-3 text-end font-bold tabular-nums">{n(student.Attempts)}</td>
              </tr>)}
            </tbody>
          </table>
          </div>
        </>}
      <p className="border-t px-4 py-3 text-xs text-muted-foreground">
        {ar ? 'آخر خروج مؤكد يعني أن الطالب ضغط تسجيل الخروج؛ إغلاق التطبيق أو المتصفح لا يثبت خروجه. وجود اتصال حديث لا يضمن أن الطالب يشاهد الصفحة بنفس اللحظة؛ يتوقف التحديث في الخلفية وينتهي اعتباره متصلاً بعد خمس دقائق.'
          : 'A verified sign-out requires an explicit sign-out action; closing the app is not one. Recent connectivity is not a live socket. Backgrounded clients pause heartbeats and are considered offline after five minutes.'}
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

    <section className="space-y-4 rounded-2xl border bg-card p-4 sm:p-6" aria-label={ar ? 'سجل عمليات الطلاب' : 'Learner event log'}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold"><History className="h-5 w-5 text-primary" />
            {ar ? 'سجل عمليات الطلاب' : 'Student activity timeline'}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {selectedStudentId
              ? (ar ? `عمليات الطالب رقم ${selectedStudentId} فقط` : `Events for student #${selectedStudentId}`)
              : (ar ? 'جميع أحداث الطلاب المسجّلة، بدون عمليات حسابات الإدارة.' : 'Recorded student events only, with no administrator operations.')}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {selectedStudentId && <button type="button"
            onClick={() => { setSelectedStudentId(null); setActivityPage(1); }}
            className="rounded-xl border px-3 py-2 text-sm font-semibold">
            {ar ? 'عرض كل الطلاب' : 'All learners'}
          </button>}
          <button type="button" onClick={() => { void events.refetch(); void result.refetch(); }}
            className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold">
            <RefreshCw className="h-4 w-4" />{ar ? 'تحديث' : 'Refresh'}
          </button>
          <button type="button" disabled={exporting || !token}
            onClick={() => void downloadStudentEvents()}
            className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold text-primary disabled:opacity-50">
            <Download className="h-4 w-4" />{exporting ? (ar ? 'جارٍ التصدير…' : 'Exporting…') : (ar ? 'تصدير سجل الطلاب CSV' : 'Export student events CSV')}
          </button>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1 text-sm font-semibold">
          <span className="block">{ar ? 'فترة النشاط' : 'Event period'}</span>
          <select value={days} onChange={e => { setDays(Number(e.target.value) as 7 | 30 | 90); setActivityPage(1); }}
            className="w-full rounded-xl border bg-background px-3 py-2.5">
            <option value={7}>{ar ? 'آخر 7 أيام' : 'Last 7 days'}</option>
            <option value={30}>{ar ? 'آخر 30 يوماً' : 'Last 30 days'}</option>
            <option value={90}>{ar ? 'آخر 90 يوماً' : 'Last 90 days'}</option>
          </select>
        </label>
        <label className="space-y-1 text-sm font-semibold">
          <span className="block">{ar ? 'نوع الحدث' : 'Event type'}</span>
          <select value={action} onChange={e => { setAction(e.target.value); setActivityPage(1); }}
            className="w-full rounded-xl border bg-background px-3 py-2.5">
            <option value="">{ar ? 'كل عمليات الطلاب' : 'All student events'}</option>
            {['Registered','LoggedIn','LoggedInGoogle','ExplicitSignOut','CreateOrSubmit','Update','Redeem'].map(value =>
              <option key={value} value={value}>{eventLabel(value,'')}</option>)}
          </select>
        </label>
      </div>
      {exportError && <p role="alert" className="text-sm text-destructive">{exportError}</p>}
      {events.isLoading ? <p role="status" className="py-8 text-center text-muted-foreground">{ar ? 'جارٍ تحميل سجل الطلاب…' : 'Loading student events…'}</p>
        : events.isError ? <div role="alert" className="space-y-2 rounded-xl border p-4">
            <p>{ar ? 'تعذر تحميل سجل النشاط.' : 'Could not load student event log.'}</p>
            <button type="button" onClick={() => void events.refetch()} className="text-primary underline">{ar ? 'إعادة المحاولة' : 'Retry'}</button>
          </div>
        : !events.data?.Entries.length ? <p className="py-8 text-center text-muted-foreground">
            {ar ? 'لا توجد أحداث طلاب مسجلة لهذه التصفية.' : 'No student events recorded for this filter.'}
          </p> : <ol className="divide-y">
            {events.data.Entries.filter(item => item.ActorRole === 'Student').map(item =>
              <li key={item.Id} className="flex flex-wrap items-start gap-3 py-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <UserRoundSearch className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <strong className="text-sm">{item.ActorName || `#${item.ActorUserId}`}</strong>
                    <time className="text-xs text-muted-foreground" dateTime={item.CreatedAtUtc}>{date(item.CreatedAtUtc)}</time>
                  </div>
                  <p className="mt-1 text-sm font-bold text-primary">{eventLabel(item.Action,item.Resource)}</p>
                  {item.ResourceId && item.Resource.toLowerCase().includes('problem') && (
                    <p className="mt-1 text-xs text-muted-foreground">{ar ? 'المسألة' : 'Problem'} #{item.ResourceId}</p>
                  )}
                </div>
              </li>)}
          </ol>}
      <div className="flex items-center justify-between gap-3 border-t pt-3 text-sm">
        <button type="button" disabled={activityPage <= 1 || events.isFetching}
          onClick={() => setActivityPage(p => Math.max(1, p - 1))}
          className="font-semibold text-primary disabled:opacity-40">{ar ? 'السابق' : 'Previous'}</button>
        <span>{ar ? 'صفحة' : 'Page'} {activityPage} / {Math.max(1, Math.ceil((events.data?.Total ?? 0) / 30))}</span>
        <button type="button" disabled={!events.data?.HasMore || events.isFetching}
          onClick={() => setActivityPage(p => p + 1)}
          className="font-semibold text-primary disabled:opacity-40">{ar ? 'التالي' : 'Next'}</button>
      </div>
      <p className="text-xs text-muted-foreground">
        {ar ? 'هذا سجل أحداث لاحظها السيرفر منذ تفعيل التتبع فقط. إغلاق المتصفح لا يُسجّل خروجاً مؤكداً، ولا يمكن استرجاع أحداث غير مسجلة سابقاً.'
          : 'Only server-recorded events since tracking was enabled are available; closing a browser is not a verified sign-out and older unrecorded events cannot be reconstructed.'}
      </p>
    </section>
  </main>;
}
