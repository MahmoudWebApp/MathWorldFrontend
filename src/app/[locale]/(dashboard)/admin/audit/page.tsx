'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { History, ShieldCheck, Users, RefreshCw } from 'lucide-react';
import { useGetAdminAuditEventsQuery, useGetAdminAuditSummaryQuery } from '@/store/api/statsApi';
import { StageGeometry } from '@/components/math/StageGeometry';

export default function AdminAuditPage() {
  const ar = useLocale() === 'ar';
  const [role, setRole] = useState<'' | 'Admin' | 'Student'>('');
  const [days, setDays] = useState<7 | 30 | 90>(30);
  const [page, setPage] = useState(1);
  const [userId, setUserId] = useState('');
  const [action, setAction] = useState('');
  useEffect(() => {
    // Both links are accepted for backwards compatibility with the learner directory.
    const params = new URLSearchParams(window.location.search);
    const requested = params.get('actorId') ?? params.get('userId') ?? '';
    if (/^[1-9]\d*$/.test(requested) && Number.isSafeInteger(Number(requested))) {
      setUserId(requested);
    }
  }, []);
  const actorId = /^\d+$/.test(userId) && Number(userId) > 0 ? Number(userId) : undefined;
  const filter = { page, days, ...(role ? { role } : {}), ...(actorId ? { actorId } : {}),
    ...(action ? { action } : {}) };
  const events = useGetAdminAuditEventsQuery(filter, { refetchOnMountOrArgChange: true });
  const summary = useGetAdminAuditSummaryQuery(days, { refetchOnMountOrArgChange: true });
  const n = (value: number) => new Intl.NumberFormat(ar ? 'ar' : 'en').format(value);
  const dt = (value: string) => {
    const date = new Date(value);
    return Number.isFinite(date.getTime())
      ? new Intl.DateTimeFormat(ar ? 'ar' : 'en', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
      : '—';
  };
  const actionOptions = Array.from(new Set((summary.data?.ByAction ?? []).map(row => row.Action)))
    .filter(Boolean).sort();
  const actionName = (action: string) => {
    if (!ar) return action;
    const names: Record<string, string> = {
      LoggedIn: 'تسجيل دخول',
      LoggedInGoogle: 'تسجيل دخول بقوقل',
      LoggedInFacebook: 'تسجيل دخول بفيسبوك',
      Registered: 'إنشاء حساب',
      CreateOrSubmit: 'إضافة أو إرسال',
      Update: 'تعديل', Delete: 'حذف', Publish: 'نشر مسألة',
      Approve: 'اعتماد', Reject: 'رفض', Redeem: 'استرداد كود',
      Grant: 'منح صلاحية', Revoke: 'إلغاء صلاحية',
      Disable: 'تعطيل', Notify: 'إرسال إشعار',
      ExplicitSignOut: 'تسجيل خروج صريح',

    };
    return names[action] ?? action;
  };
  return <main dir={ar ? 'rtl' : 'ltr'} className="mx-auto max-w-6xl space-y-7 px-4 py-8">
    <header className="space-y-2">
      <Link href="/admin" className="text-sm font-semibold text-primary underline">
        {ar ? 'العودة للمراقبة' : 'Back to monitoring'}
      </Link>
      <h1 className="flex items-center gap-2 text-3xl font-black">
        <History className="h-7 w-7 text-primary" />
        {ar ? 'سجل نشاط الطلاب والأدمن' : 'Student and admin activity log'}
      </h1>
      <p className="max-w-3xl text-sm text-muted-foreground">
        {ar ? 'أحداث موثّقة بعد العمليات الناجحة على السيرفر. السجل لا يخمّن متى أغلق الطالب المتصفح أو غادر التطبيق، ولا يحتوي كلمات مرور أو نص إجابات.'
          : 'Server-observed events after successful actions. Closing a browser is not a verified logout. Passwords and answer contents are never included.'}
      </p>
    </header>
    <section className="grid gap-3 sm:grid-cols-3">
      {[
        { text: ar ? 'عمليات مسجلة' : 'Recorded actions', value: summary.data?.RecordedEvents, icon: History },
        { text: ar ? 'طلاب ظهر نشاطهم بالسجل' : 'Students appearing in log', value: summary.data?.UniqueStudents, icon: Users },
        { text: ar ? 'مدراء ظهر نشاطهم بالسجل' : 'Admins appearing in log', value: summary.data?.UniqueAdmins, icon: ShieldCheck },
      ].map((metric,index) => {
        const Icon = metric.icon;
        return <div key={metric.text} className="relative overflow-hidden rounded-2xl border bg-card p-5">
          <StageGeometry variant={index} className="pointer-events-none absolute -end-6 -top-6 h-24 w-24 text-primary/10" />
          <Icon className="mb-3 h-5 w-5 text-primary" />
          <strong className="block text-3xl font-black tabular-nums">
            {metric.value === undefined ? '—' : n(metric.value)}
          </strong>
          <span className="text-sm text-muted-foreground">{metric.text}</span>
        </div>;
      })}
    </section>
    <section className="space-y-4 rounded-2xl border bg-card p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold">{ar ? 'تصفية الأحداث' : 'Filter actions'}</h2>
        <button type="button" onClick={() => { void events.refetch(); void summary.refetch(); }}
          className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold text-primary">
          <RefreshCw className="h-4 w-4" />{ar ? 'تحديث' : 'Refresh'}
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block space-y-1">
          <span className="block text-sm font-semibold">{ar ? 'نوع الحساب' : 'Account type'}</span>
          <select value={role} onChange={e => { setRole(e.target.value as '' | 'Admin' | 'Student'); setPage(1); }}
            className="w-full rounded-xl border bg-background px-3 py-2">
            <option value="">{ar ? 'الكل' : 'All'}</option>
            <option value="Student">{ar ? 'طالب' : 'Student'}</option>
            <option value="Admin">{ar ? 'أدمن' : 'Admin'}</option>
          </select>
        </label>
        <label className="block space-y-1">
          <span className="block text-sm font-semibold">{ar ? 'المستخدم (رقم ID)' : 'User ID'}</span>
          <input type="number" min="1" step="1" placeholder={ar ? 'كل المستخدمين' : 'All users'}
            value={userId} onChange={e => { setUserId(e.target.value); setPage(1); }}
            className="w-full rounded-xl border bg-background px-3 py-2" />
        </label>
        <label className="block space-y-1">
          <span className="block text-sm font-semibold">{ar ? 'نوع العملية' : 'Action'}</span>
          <select value={action} onChange={e => { setAction(e.target.value); setPage(1); }}
            className="w-full rounded-xl border bg-background px-3 py-2">
            <option value="">{ar ? 'جميع العمليات' : 'All actions'}</option>
            {actionOptions.map(value => <option key={value} value={value}>{actionName(value)}</option>)}
          </select>
        </label>
        <label className="block space-y-1">
          <span className="block text-sm font-semibold">{ar ? 'الفترة' : 'Date range'}</span>
          <select value={days} onChange={e => { setDays(Number(e.target.value) as 7 | 30 | 90); setPage(1); }}
            className="w-full rounded-xl border bg-background px-3 py-2">
            <option value={7}>{ar ? 'آخر 7 أيام' : 'Last 7 days'}</option>
            <option value={30}>{ar ? 'آخر 30 يوماً' : 'Last 30 days'}</option>
            <option value={90}>{ar ? 'آخر 90 يوماً' : 'Last 90 days'}</option>
          </select>
        </label>
      </div>
      {userId.trim() && !actorId && <p role="alert" className="text-sm text-destructive">
        {ar ? 'أدخل رقم مستخدم صحيحاً.' : 'Enter a valid user ID.'}
      </p>}
    </section>
    <section className="space-y-4 rounded-2xl border bg-card p-4 sm:p-6">
      <h2 className="text-lg font-bold">{ar ? 'تسلسل الأحداث' : 'Timeline of actions'}</h2>
      {events.isError || summary.isError
        ? <p role="alert">{ar ? 'تعذّر جلب السجل.' : 'Could not load activity log.'}</p>
        : events.isLoading
          ? <p role="status">{ar ? 'جارٍ تحميل الأحداث…' : 'Loading events…'}</p>
          : !events.data?.Entries.length
            ? <p className="py-10 text-center text-muted-foreground">
              {ar ? 'لا يوجد نشاط مسجّل ضمن عوامل التصفية.' : 'No recorded events for these filters.'}
            </p>
            : <ol className="divide-y">
              {events.data.Entries.map(item =>
                <li key={item.Id} className="flex gap-3 py-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    {item.ActorRole === 'Admin' ? <ShieldCheck className="h-5 w-5" /> : <Users className="h-5 w-5" />}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <strong className="text-sm">{item.ActorName || `#${item.ActorUserId}`}
                        {' · '}{item.ActorRole === 'Admin' ? (ar ? 'أدمن' : 'Admin') : (ar ? 'طالب' : 'Student')}
                      </strong>
                      <time dateTime={item.CreatedAtUtc} className="text-xs text-muted-foreground">{dt(item.CreatedAtUtc)}</time>
                    </div>
                    <p className="text-sm font-semibold text-primary">{actionName(item.Action)}</p>
                    <p dir="ltr" className="break-all text-xs text-muted-foreground">
                      {item.Resource}{item.ResourceId ? ` · ID: ${item.ResourceId}` : ''}
                    </p>
                  </div>
                </li>)}
            </ol>}
      <div className="flex items-center justify-between gap-3 border-t pt-3 text-sm">
        <button type="button" disabled={page <= 1 || events.isFetching}
          onClick={() => setPage(x => Math.max(1, x - 1))}
          className="font-semibold text-primary disabled:opacity-40">
          {ar ? 'السابق' : 'Previous'}
        </button>
        <span>{ar ? 'صفحة' : 'Page'} {page} / {Math.max(1, Math.ceil((events.data?.Total ?? 0) / 30))}</span>
        <button type="button" disabled={!events.data?.HasMore || events.isFetching}
          onClick={() => setPage(x => x + 1)}
          className="font-semibold text-primary disabled:opacity-40">
          {ar ? 'التالي' : 'Next'}
        </button>
      </div>
      <p className="text-xs text-muted-foreground">
        {ar ? 'السجلات تبدأ من تاريخ تفعيل التتبّع فقط. لا يمكن استعادة العمليات القديمة أو استنتاج وقت الخروج من آخر نشاط.'
          : 'Events start when tracking is deployed. Older actions and exact logout times cannot be reconstructed.'}
      </p>
    </section>
  </main>;
}
