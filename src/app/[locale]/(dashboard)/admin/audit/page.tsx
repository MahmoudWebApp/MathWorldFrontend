'use client';
import { Pagination } from '@/components/ui/Pagination';
import { MathWorldLoading } from '@/components/ui/MathWorldLoading';
import {WorkspacePageHeader} from '@/components/ui/WorkspacePageHeader';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { History, ShieldCheck, Download } from 'lucide-react';
import { useGetAdminAuditEventsQuery, useGetAdminAuditSummaryQuery } from '@/store/api/statsApi';
import { StageGeometry } from '@/components/math/StageGeometry';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { API_BASE_URL } from '@/store/api/baseQuery';

export default function AdminAuditPage() {
  const ar = useLocale() === 'ar';
  const [days, setDays] = useState<7 | 30 | 90>(30);
  const [page, setPage] = useState(1);
  const [userId, setUserId] = useState('');
  const [action, setAction] = useState('');
  const token = useSelector((state: RootState) => state.auth.token);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState('');
  useEffect(() => {
    // Both links are accepted for backwards compatibility with the learner directory.
    const params = new URLSearchParams(window.location.search);
    const requested = params.get('actorId') ?? params.get('userId') ?? '';
    if (/^[1-9]\d*$/.test(requested) && Number.isSafeInteger(Number(requested))) {
      setUserId(requested);
    }
  }, []);
  const actorId = /^\d+$/.test(userId) && Number(userId) > 0 ? Number(userId) : undefined;
  const filter = { page, days, role: 'Admin' as const, ...(actorId ? { actorId } : {}),
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
  const actionOptions = Array.from(new Set((summary.data?.ByAction ?? []).filter(row => row.ActorRole === 'Admin').map(row => row.Action)))
    .filter(Boolean).sort();
  const downloadAudit = async () => {
    if (exporting || !token || (userId.trim() && !actorId)) return;
    setExporting(true);
    setExportError('');
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 20000);
    try {
      const url = new URL(API_BASE_URL + '/admin/activity-audit/export.csv');
      url.searchParams.set('days', String(days));
      url.searchParams.set('role', 'Admin');
      if (actorId) url.searchParams.set('actorId', String(actorId));
      if (action) url.searchParams.set('action', action);
      const response = await fetch(url, {
        headers: { Authorization: 'Bearer ' + token, Accept: 'text/csv' },
        cache: 'no-store',
        signal: controller.signal,
      });
      if (!response.ok) throw new Error('Export failed');
      const blob = await response.blob();
      if (!blob.size || blob.size > 15 * 1024 * 1024) {
        throw new Error('Invalid audit export');
      }
      const localUrl = URL.createObjectURL(blob);
      try {
        const link = document.createElement('a');
        link.href = localUrl;
        link.download = 'mathworld-activity-audit.csv';
        document.body.appendChild(link);
        link.click();
        link.remove();
      } finally {
        window.setTimeout(() => URL.revokeObjectURL(localUrl), 10000);
      }
    } catch {
      setExportError(ar
        ? 'تعذّر تصدير السجل. تحقق من الاتصال والصلاحيات وأعد المحاولة.'
        : 'Could not export the audit log. Check your connection and permissions.');
    } finally {
      window.clearTimeout(timeout);
      setExporting(false);
    }
  };

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
      
      <WorkspacePageHeader title={ar?'سجل الإدارة':'Admin activity'} icon={History}/>
      
    </header>
    <section className="grid gap-3 sm:grid-cols-2">
      {[
        { text: ar ? 'عمليات الإدارة المسجلة' : 'Recorded admin operations',
          value: summary.data?.ByAction.filter(row => row.ActorRole === 'Admin').reduce((total, row) => total + row.Count, 0),
          icon: History },
        { text: ar ? 'مسؤولون لديهم نشاط مسجل' : 'Admins with recorded activity', value: summary.data?.UniqueAdmins, icon: ShieldCheck },
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
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={!token || exporting || Boolean(userId.trim() && !actorId)}
            onClick={() => void downloadAudit()}
            className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold text-primary disabled:cursor-not-allowed disabled:opacity-50">
            <Download className="h-4 w-4" />
            {exporting ? (ar ? 'جارٍ التصدير…' : 'Exporting…') :
              (ar ? 'تصدير CSV' : 'Export CSV')}
          </button>
          
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <label className="block space-y-1">
          <span className="block text-sm font-semibold">{ar ? 'المستخدم (رقم ID)' : 'User ID'}</span>
          <input type="number" min="1" step="1" placeholder={ar ? 'جميع المسؤولين' : 'All administrators'}
            value={userId} onChange={e => { setUserId(e.target.value); setPage(1); }}
            className="mw-filter-field" />
        </label>
        <label className="block space-y-1">
          <span className="block text-sm font-semibold">{ar ? 'نوع العملية' : 'Action'}</span>
          <select value={action} onChange={e => { setAction(e.target.value); setPage(1); }}
            className="mw-filter-field">
            <option value="">{ar ? 'جميع العمليات' : 'All actions'}</option>
            {actionOptions.map(value => <option key={value} value={value}>{actionName(value)}</option>)}
          </select>
        </label>
        <label className="block space-y-1">
          <span className="block text-sm font-semibold">{ar ? 'الفترة' : 'Date range'}</span>
          <select value={days} onChange={e => { setDays(Number(e.target.value) as 7 | 30 | 90); setPage(1); }}
            className="mw-filter-field">
            <option value={7}>{ar ? 'آخر 7 أيام' : 'Last 7 days'}</option>
            <option value={30}>{ar ? 'آخر 30 يوماً' : 'Last 30 days'}</option>
            <option value={90}>{ar ? 'آخر 90 يوماً' : 'Last 90 days'}</option>
          </select>
        </label>
      </div>
      {exportError && <p role="alert" className="text-sm text-destructive">{exportError}</p>}
      <p className="text-xs text-muted-foreground">
        {ar ? 'التصدير يلتزم بعوامل التصفية، ويقتصر على أحدث 10,000 حدث في الملف الواحد. لا يتضمن كلمات مرور أو محتوى الإجابات.'
          : 'Export respects the filters and includes at most 10,000 recent events. Passwords and answer contents are never included.'}
      </p>
      {userId.trim() && !actorId && <p role="alert" className="text-sm text-destructive">
        {ar ? 'أدخل رقم مستخدم صحيحاً.' : 'Enter a valid user ID.'}
      </p>}
    </section>
    <section className="space-y-4 rounded-2xl border bg-card p-4 sm:p-6">
      <h2 className="text-lg font-bold">{ar ? 'تسلسل الأحداث' : 'Timeline of actions'}</h2>
      {events.isError || summary.isError
        ? <div role="alert">{ar ? 'تعذّر جلب السجل.' : 'Could not load activity log.'} <button className="underline text-primary" onClick={()=>{void events.refetch();void summary.refetch();}}>{ar?'إعادة المحاولة':'Retry'}</button></div>
        : events.isLoading || (events.isFetching&&!events.currentData)
          ? <MathWorldLoading compact mode="filter"/>
          : !events.currentData?.Entries.length
            ? <p className="py-10 text-center text-muted-foreground">
              {ar ? 'لا يوجد نشاط مسجّل ضمن عوامل التصفية.' : 'No recorded events for these filters.'}
            </p>
            : <ol className="divide-y">
              {events.currentData.Entries.map(item =>
                <li key={item.Id} className="flex gap-3 py-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <strong className="text-sm">{item.ActorName || `#${item.ActorUserId}`}
                        {' · '}{ar ? 'أدمن' : 'Admin'}
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
      <Pagination page={page} pageSize={30} total={events.currentData?.Total??0} onPageChange={setPage} disabled={events.isFetching||!events.currentData}/>
      <p className="text-xs text-muted-foreground">
        {ar ? 'السجلات تبدأ من تاريخ تفعيل التتبّع فقط. لا يمكن استعادة العمليات القديمة أو استنتاج وقت الخروج من آخر نشاط.'
          : 'Events start when tracking is deployed. Older actions and exact logout times cannot be reconstructed.'}
      </p>
    </section>
  </main>;
}
