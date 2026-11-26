'use client';
import { WorkspacePageHeader } from '@/components/ui/WorkspacePageHeader';
import { MathWorldLoading } from '@/components/ui/MathWorldLoading';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Search, Users, Crown, Trash2 } from 'lucide-react';
import { useGetAdminLearnersQuery, useDeleteAdminLearnerMutation, useGrantAnnualPremiumMutation, type AdminLearnerFilters, type AdminLearnerSummary } from '@/store/api/usersApi';
import { useGetAdminStagesQuery } from '@/store/api/stagesApi';
import { DirectionalArrow } from '@/components/ui/DirectionalNavigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog';

export default function AdminUsersPage() {
  const ar = useLocale() === 'ar';
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const searching=searchInput.trim()!==search;
  const [stageId, setStageId] = useState<number | undefined>();
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [tier, setTier] = useState<'' | 'Free' | 'Premium'>('');
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [grantMessage, setGrantMessage] = useState('');
  const [grantError, setGrantError] = useState('');
  const [pendingLearners, setPendingLearners] = useState<AdminLearnerSummary[]>([]);
  const [confirmedPeriods, setConfirmedPeriods] = useState<Array<{ name: string; from: string; to: string }>>([]);
  const [previewNow, setPreviewNow] = useState<Date>(new Date());
  const [grantAnnualPremium, { isLoading: granting }] = useGrantAnnualPremiumMutation();
  const [deleteLearner,{isLoading:deleting}]=useDeleteAdminLearnerMutation();
  const [deleteTarget,setDeleteTarget]=useState<AdminLearnerSummary|null>(null);
  const [deleteError,setDeleteError]=useState('');
  const [deleteNotice,setDeleteNotice]=useState('');
  const openDelete=(u:AdminLearnerSummary)=>{setDeleteError('');setDeleteNotice('');setDeleteTarget(u);};
  async function confirmDelete(){
    if(!deleteTarget||deleting)return;
    try{
      const result=await deleteLearner(deleteTarget.Id).unwrap();
      if(!result.Deleted)throw Error('DeletionFailed');
      setSelectedIds(ids=>ids.filter(id=>id!==deleteTarget.Id));
      setDeleteTarget(null);
      setDeleteNotice(ar?'تم حذف حساب الطالب نهائياً':'Learner account permanently deleted');
      if(data?.Learners.length===1&&page>1)setPage(p=>p-1);else void refetch();
    }catch(e){
      const code=(e as {data?:{Message?:string;message?:string}})?.data;
      const reason=code?.Message??code?.message;
      setDeleteError(reason==='LearnerHasProtectedBillingHistory'||reason==='LearnerHasProtectedHistory'?(ar?'لا يمكن حذف الحساب لارتباطه بسجلات محمية أو مالية.':'This account has protected or billing history.'):(ar?'تعذّر حذف الحساب. لم يتم تأكيد الحذف.':'Deletion could not be confirmed.'));
    }
  }

  // Selection is limited to the visible page, never silently grant hidden
  // learners from a previous search or stage filter.
  useEffect(() => { setSelectedIds([]); }, [search, stageId, status, tier, page]);

  useEffect(() => {
    const handle = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(handle);
  }, [searchInput]);

  const filters: AdminLearnerFilters = {
    IncludeActivity: false,
    Search: search || undefined,
    StageId: stageId,
    IsActive: status === 'all' ? undefined : status === 'active',
    Subscription: tier || undefined,
    Page: page, PageSize: 10,
  };
  const { currentData: data, isLoading, isFetching, isError, refetch } = useGetAdminLearnersQuery(filters, {
    refetchOnMountOrArgChange: 60,
  });
  const { data: stages, isError: stagesError, refetch: retryStages } = useGetAdminStagesQuery();
  const label = ar ? {
    title: 'إدارة الطلاب والاشتراكات', sub: 'الحسابات والمراحل والاشتراكات وتواريخ انتهاء Premium',
    search: 'بحث باسم الطالب أو البريد الإلكتروني', allStages: 'كل المراحل',
    allStatus: 'كل الحالات', active: 'نشط', disabled: 'معطّل',
    allTiers: 'كل الاشتراكات', stage: 'المرحلة', status: 'الحالة',
    tier: 'الاشتراك', name: 'الطالب', expires: 'انتهاء Premium', indefinite: 'غير محدد', notSubscribed: 'لا يوجد اشتراك', expired: 'انتهى',
    recent: 'آخر محاولة', lastLogin: 'آخر دخول', noActivity: 'لا توجد محاولات', noLogin: 'لم يسجّل دخولاً',
    noStage: 'لم يحدد المرحلة', detail: 'ملف الطالب', total: 'طالب',
    empty: 'ما في طلاب مطابقين للبحث الحالي.', error: 'تعذر تحميل الطلاب.',
    retry: 'إعادة المحاولة', loading: 'جاري تحميل الطلاب...',
    previous: 'السابق', next: 'التالي', page: 'صفحة',
    analytics: 'إحصائيات المراحل',
    select: 'اختيار الطالب', selectAll: 'اختيار الطلاب النشطين في الصفحة',
    annual: 'تفعيل Premium سنة', renew: 'تجديد سنة', selected: 'محدد',
    grantSuccess: 'تم تفعيل أو تجديد Premium للطلاب المحددين لمدة سنة.',
    grantError: 'تعذر تفعيل Premium. لم يتم تطبيق أي تغيير جزئي.',
    confirmation: 'هل تريد تفعيل Premium للطلاب التاليين لمدة سنة؟',
    estimated: 'تواريخ متوقعة. سيعرض النظام التواريخ الفعلية بعد نجاح التفعيل.',
    from: 'من', until: 'حتى', cancel: 'إلغاء', confirm: 'تأكيد التفعيل',
  } : {
    title: 'Learners & subscriptions', sub: 'Learner accounts, stages, subscriptions and Premium expiry',
    search: 'Search by name or email', allStages: 'All stages',
    allStatus: 'All statuses', active: 'Active', disabled: 'Disabled',
    allTiers: 'All subscriptions', stage: 'Stage', status: 'Status',
    tier: 'Plan', name: 'Learner', expires: 'Premium expires', indefinite: 'No expiration', notSubscribed: 'Not subscribed', expired: 'Expired',
    recent: 'Last attempt', lastLogin: 'Last login', noActivity: 'No attempts', noLogin: 'Never logged in',
    noStage: 'No stage selected', detail: 'View learner', total: 'students',
    empty: 'No learners match these filters.', error: 'Could not load learners.',
    retry: 'Retry', loading: 'Loading learners...',
    previous: 'Previous', next: 'Next', page: 'Page',
    analytics: 'Stage analytics',
    select: 'Select learner', selectAll: 'Select active learners on this page',
    annual: 'Activate 1-year Premium', renew: 'Renew 1 year', selected: 'selected',
    grantSuccess: 'One year of Premium granted or renewed for selected learners.',
    grantError: 'Could not activate Premium. No partial batch changes were made.',
    confirmation: 'Activate annual Premium for these learners?',
    estimated: 'Estimated dates. The actual periods will appear after activation.',
    from: 'From', until: 'Until', cancel: 'Cancel', confirm: 'Confirm activation',
  };
  const eligibleIds = (data?.Learners ?? []).filter(u => u.IsActive).map(u => u.Id);
  const selectedVisible = selectedIds.filter(id => eligibleIds.includes(id));
  const allVisibleSelected = eligibleIds.length > 0 && eligibleIds.every(id => selectedVisible.includes(id));
  const toggleId = (id: number) =>
    setSelectedIds(current => current.includes(id) ? current.filter(x => x !== id) : [...current, id]);
  const toggleAllVisible = () =>
    setSelectedIds(allVisibleSelected ? [] : eligibleIds);

  const fmt = (value: string | Date | null | undefined) => {
    if (!value) return '—';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '—' :
      date.toLocaleDateString(ar ? 'ar-SY-u-nu-latn' : 'en-GB', {
        year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
      });
  };
  const expiry = (learner: AdminLearnerSummary) => {
    if (!learner.PremiumExpiresAtUtc)
      return learner.SubscriptionType === 'Premium' ? label.indefinite : label.notSubscribed;
    const when = new Date(learner.PremiumExpiresAtUtc);
    return when.getTime() <= Date.now() ? label.expired + ': ' + fmt(when) : fmt(when);
  };
  const projectedPeriod = (learner: AdminLearnerSummary) => {
    if (learner.SubscriptionType === 'Premium' && !learner.PremiumExpiresAtUtc) return null;
    const currentExpiry = learner.PremiumExpiresAtUtc ? new Date(learner.PremiumExpiresAtUtc) : null;
    const start = learner.SubscriptionType === 'Premium' && currentExpiry &&
      !Number.isNaN(currentExpiry.getTime()) && currentExpiry > previewNow ? currentExpiry : previewNow;
    const end = new Date(start);
    end.setUTCFullYear(start.getUTCFullYear() + 1);
    if (end.getUTCMonth() !== start.getUTCMonth()) end.setUTCDate(0);
    return { start, end };
  };
  const openGrant = (ids: number[]) => {
    if (granting || searching || isFetching || !data) return;
    const currentRows = data.Learners.filter(u => u.IsActive && ids.includes(u.Id));
    if (!currentRows.length) return;
    setGrantMessage('');
    setGrantError('');
    setConfirmedPeriods([]);
    setPreviewNow(new Date());
    setPendingLearners(currentRows);
  };
  const confirmGrant = async () => {
    if (granting || !pendingLearners.length) return;
    const rows = [...pendingLearners];
    setGrantError('');
    try {
      const result = await grantAnnualPremium(rows.map(u => u.Id)).unwrap();
      const actual = (result.Periods ?? []).map(period => ({
        name: rows.find(u => u.Id === period.LearnerId)?.FullName ?? String(period.LearnerId),
        from: period.StartAtUtc,
        to: period.EndAtUtc,
      }));
      setConfirmedPeriods(actual);
      setGrantMessage(ar ?
        'تم تفعيل Premium لـ ' + result.Updated + ' طالب' +
          (result.SkippedIndefiniteIds.length ? '، دون تغيير الاشتراكات غير محددة المدة: ' + result.SkippedIndefiniteIds.length : '') :
        'Premium updated for ' + result.Updated + ' learners' +
          (result.SkippedIndefiniteIds.length ? '; indefinite memberships unchanged: ' + result.SkippedIndefiniteIds.length : ''));
      setPendingLearners([]);
      setSelectedIds([]);
      void refetch();
    } catch {
      setGrantError(label.grantError);
    }
  };

  return (
    <main className="container mx-auto max-w-7xl px-4 py-8 md:px-10">
      <WorkspacePageHeader title={label.title} icon={Users}/>
      {deleteNotice&&<p role="status" className="text-sm text-primary">{deleteNotice}</p>}
      <section aria-label={label.search} className="math-card mb-6 rounded-2xl border border-border p-4 md:p-5">
        {stagesError && (
          <div role="alert" className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-destructive/30 p-3 text-sm text-destructive">
            <span>{ar ? 'تعذر تحميل قائمة المراحل؛ بقية الفلاتر لا تزال متاحة.' : 'Could not load stages; the other filters remain available.'}</span>
            <button type="button" onClick={() => void retryStages()} className="rounded-lg border border-current px-3 py-1.5 font-semibold">
              {label.retry}
            </button>
          </div>
        )}
        
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="relative block">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <span className="sr-only">{label.search}</span>
            <input type="search" maxLength={100} value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)} placeholder={label.search}
              className="mw-filter-field mw-filter-search" />
          </label>
          <label>
            <span className="sr-only">{label.stage}</span>
            <select value={stageId ?? ''} onChange={(e) => {setStageId(e.target.value ? Number(e.target.value) : undefined); setPage(1);}}
              className="mw-filter-field">
              <option value="">{label.allStages}</option>
              {(stages ?? []).map((stage) =>
                <option key={stage.Id} value={stage.Id}>{ar ? stage.NameAr : stage.NameEn}</option>)}
            </select>
          </label>
          <label>
            <span className="sr-only">{label.status}</span>
            <select value={status} onChange={(e) => {setStatus(e.target.value as typeof status); setPage(1);}}
              className="mw-filter-field">
              <option value="all">{label.allStatus}</option>
              <option value="active">{label.active}</option>
              <option value="inactive">{label.disabled}</option>
            </select>
          </label>
          <label>
            <span className="sr-only">{label.tier}</span>
            <select value={tier} onChange={(e) => {setTier(e.target.value as typeof tier); setPage(1);}}
              className="mw-filter-field">
              <option value="">{label.allTiers}</option>
              <option value="Free">Free</option>
              <option value="Premium">Premium</option>
            </select>
          </label>
        </div>
      </section>

      <section className="math-card overflow-hidden rounded-2xl border border-border">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 text-sm">
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex cursor-pointer items-center gap-2">
              <input type="checkbox" checked={allVisibleSelected}
                onChange={toggleAllVisible} disabled={searching || isFetching || !eligibleIds.length || granting}
                aria-label={label.selectAll}
                className="h-4 w-4 accent-primary" />
              <span className="font-medium">{label.selected}: {selectedVisible.length}</span>
            </label>
            <button type="button" disabled={!selectedVisible.length || granting}
              onClick={() => openGrant(selectedVisible)}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-primary px-3 py-2 font-semibold text-primary-foreground disabled:opacity-50">
              <Crown className="h-4 w-4" aria-hidden />
              {granting ? label.loading : label.annual}
            </button>
          </div>
          {grantMessage && <p role="status" className="text-sm font-semibold text-primary">{grantMessage}</p>}
          {grantError && <p role="alert" className="text-sm text-destructive">{grantError}</p>}
        </div>
        <div className="flex items-center justify-between border-b border-border px-5 py-3 text-sm">
          <span className="inline-flex items-center gap-2 font-medium"><Users className="h-4 w-4 text-primary" aria-hidden />
            {label.total}: {data?.Total ?? '—'}
          </span>

        </div>
        {confirmedPeriods.length > 0 && (
          <div role="status" className="border-b border-border bg-emerald-500/5 p-4 text-sm text-foreground">
            <strong className="block">{grantMessage}</strong>
            <ul className="mt-2 space-y-1">
              {confirmedPeriods.map(row => <li key={row.name + row.from} className="break-words">
                <strong>{row.name}</strong>: {label.from} {fmt(row.from)} — {label.until} {fmt(row.to)}
              </li>)}
            </ul>
          </div>
        )}
        {isError ? (
          <div role="alert" className="p-10 text-center">
            <p className="text-destructive">{label.error}</p>
            <button type="button" onClick={() => refetch()} className="mt-3 rounded-xl border border-primary/30 px-4 py-2 text-primary">{label.retry}</button>
          </div>
        ) : searching || isLoading || isFetching ? (
          <MathWorldLoading compact mode={searching||search?'search':'filter'}/>
        ) : !data?.Learners.length ? (
          <div className="p-12 text-center text-muted-foreground">{label.empty}</div>
        ) : (
          <>
            <div className="grid gap-3 p-3 sm:grid-cols-2 md:hidden">
              {data.Learners.map(u => (
                <article key={u.Id} className="min-w-0 space-y-3 rounded-xl border border-border bg-card p-4">
                  <div className="flex items-start gap-2">
                    <input type="checkbox" checked={selectedVisible.includes(u.Id)}
                      disabled={!u.IsActive || granting || searching || isFetching} onChange={() => toggleId(u.Id)}
                      aria-label={`${label.select}: ${u.FullName}`}
                      className="mt-1 h-4 w-4 accent-primary" />
                    <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link href={`/admin/users/${u.Id}`} className="block break-words font-semibold text-primary hover:underline">
                        {u.FullName}
                      </Link>
                      <p className="mt-1 break-all text-xs text-muted-foreground" dir="ltr">{u.Email}</p>
                    </div>
                    <span className={`shrink-0 rounded-md px-2 py-1 text-xs ${
                      u.IsActive ? 'mw-status-active' : 'bg-destructive/10 text-destructive'
                    }`}>{u.IsActive ? label.active : label.disabled}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="rounded-lg bg-muted px-2 py-1">{(ar ? u.StageNameAr : u.StageNameEn) || label.noStage}</span>
                    <span className="rounded-lg bg-muted px-2 py-1">{u.SubscriptionType}</span>
                  </div>
                  <dl className="grid grid-cols-2 gap-3 rounded-lg bg-muted/30 p-3 text-sm">
                    <div><dt className="text-xs text-muted-foreground">{label.expires}</dt><dd className="font-semibold">{expiry(u)}</dd></div>
                  </dl>
                    </div>
                  </div>
                  <button type="button" disabled={!u.IsActive || granting || searching || isFetching} onClick={() => openGrant([u.Id])}
                    className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-primary/30 px-3 py-2 text-sm font-semibold text-primary disabled:opacity-40">
                    <Crown className="h-4 w-4" aria-hidden />
                    {u.SubscriptionType === 'Premium' ? label.renew : label.annual}
                  </button>
                  <Link href={`/admin/users/${u.Id}`} className="inline-flex items-center gap-2 rounded-lg border border-primary/20 px-3 py-2 text-sm font-semibold text-primary hover:bg-primary/5">
                    {label.detail}<DirectionalArrow direction="forward" className="h-4 w-4" />
                  </Link>
                  <button type="button" disabled={deleting||granting||searching||isFetching} onClick={()=>openDelete(u)} className="inline-flex items-center gap-2 rounded-lg border border-destructive/30 px-3 py-2 text-sm font-semibold text-destructive disabled:opacity-50"><Trash2 className="h-4 w-4" aria-hidden/>{ar?'حذف الطالب':'Delete learner'}</button>
                </article>
              ))}
            </div>
            <div className="hidden overflow-x-auto md:block">
              <table className="mw-workspace-table w-full min-w-[680px] text-sm">
                <thead className="bg-muted/40 text-muted-foreground">
                  <tr>
                    <th scope="col" className="px-3 py-3">
                      <span className="sr-only">{label.selectAll}</span>
                    </th>
                    {[label.name, label.stage, label.status, label.tier, label.expires, label.detail].map((heading) =>
                      <th className="px-4 py-3 text-start font-semibold" key={heading}>{heading}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {data.Learners.map((u) => (
                    <tr key={u.Id} className="border-t border-border hover:bg-muted/20">
                      <td className="px-3 py-3">
                        <input type="checkbox" checked={selectedVisible.includes(u.Id)}
                          disabled={!u.IsActive || granting || searching || isFetching} onChange={() => toggleId(u.Id)}
                          aria-label={`${label.select}: ${u.FullName}`} className="h-4 w-4 accent-primary" />
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/users/${u.Id}`} className="font-semibold text-primary hover:underline">{u.FullName}</Link>
                        <p className="mt-1 max-w-[230px] truncate text-xs text-muted-foreground" dir="ltr">{u.Email}</p>
                      </td>
                      <td className="px-4 py-3">{(ar ? u.StageNameAr : u.StageNameEn) || label.noStage}</td>
                      <td className="px-4 py-3"><span className={`rounded-lg px-2 py-1 text-xs ${
                        u.IsActive ? 'mw-status-active' : 'bg-destructive/10 text-destructive'
                      }`}>{u.IsActive ? label.active : label.disabled}</span></td>
                      <td className="px-4 py-3"><span className={u.SubscriptionType==='Premium'?'mw-status-active rounded-lg px-2 py-1 text-xs font-bold':'rounded-lg border px-2 py-1 text-xs font-semibold'}>{u.SubscriptionType}</span></td>
                      <td className="px-4 py-3 text-muted-foreground">{expiry(u)}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col items-start gap-2">
                          <Link href={`/admin/users/${u.Id}`} className="mw-admin-action">{label.detail}</Link>
                          <button type="button" disabled={deleting||granting||searching||isFetching} onClick={()=>openDelete(u)} className="inline-flex items-center gap-2 rounded-lg border border-destructive/30 px-3 py-2 text-sm font-semibold text-destructive disabled:opacity-50"><Trash2 className="h-4 w-4" aria-hidden/>{ar?'حذف الطالب':'Delete learner'}</button>
                          <button type="button" disabled={!u.IsActive || granting || searching || isFetching} onClick={() => openGrant([u.Id])}
                            className="mw-admin-action mw-admin-action-primary disabled:opacity-40">
                            {u.SubscriptionType === 'Premium' ? label.renew : label.annual}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-border p-4 text-sm">
              <span className="text-muted-foreground">{label.page} {data.Page} / {Math.max(data.TotalPages, 1)}</span>
              <div className="flex gap-2">
                <button type="button" disabled={isFetching || page <= 1} onClick={() => setPage((v) => v - 1)}
                  className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 disabled:opacity-40">
                  <DirectionalArrow direction="back" className="h-4 w-4" />{label.previous}
                </button>
                <button type="button" disabled={isFetching || page >= data.TotalPages} onClick={() => setPage((v) => v + 1)}
                  className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 disabled:opacity-40">
                  {label.next}<DirectionalArrow direction="forward" className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </section>
      <Dialog open={deleteTarget!==null} onOpenChange={open=>{if(!open&&!deleting)setDeleteTarget(null)}}>
        <DialogContent><DialogHeader><DialogTitle>{ar?'حذف حساب الطالب نهائياً':'Permanently delete learner account'}</DialogTitle><DialogDescription>{ar?'سيحذف الحساب وتقدمه ومحاولاته وإشعاراته ومنحه اليدوية. لا يمكن التراجع. الحسابات المرتبطة بسجل مالي محمي لا تُحذف.':'This deletes the account, progress, attempts, notifications and manual grants. This cannot be undone. Protected billing records prevent deletion.'}</DialogDescription></DialogHeader>
        <p className="font-bold break-words">{deleteTarget?.FullName} · #{deleteTarget?.Id}</p><p dir="ltr" className="text-sm break-all">{deleteTarget?.Email}</p>
        {deleteError&&<p role="alert" className="text-destructive text-sm">{deleteError}</p>}
        <DialogFooter><button type="button" disabled={deleting} className="rounded-lg border px-3 py-2" onClick={()=>setDeleteTarget(null)}>{label.cancel}</button><button type="button" disabled={deleting} onClick={()=>void confirmDelete()} className="rounded-lg border border-destructive bg-destructive/10 text-destructive px-3 py-2 font-bold">{deleting?label.loading:(ar?'تأكيد الحذف النهائي':'Confirm permanent deletion')}</button></DialogFooter></DialogContent>
      </Dialog>
      <Dialog open={pendingLearners.length > 0} onOpenChange={open => { if (!open && !granting) setPendingLearners([]); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{label.confirmation}</DialogTitle>
            <DialogDescription>{label.estimated}</DialogDescription>
          </DialogHeader>
          <div className="max-h-[46vh] space-y-2 overflow-y-auto">
            {pendingLearners.map(u => {
              const period = projectedPeriod(u);
              return <div key={u.Id} className="rounded-xl border bg-muted/20 p-3 text-sm">
                <strong className="block break-words">{u.FullName}</strong>
                <span className="block break-all text-xs text-muted-foreground" dir="ltr">{u.Email}</span>
                <p className="mt-2">{period
                  ? label.from + ' ' + fmt(period.start) + ' — ' + label.until + ' ' + fmt(period.end)
                  : (ar ? 'Premium غير محدد المدة — سيبقى كما هو' : 'Indefinite Premium — unchanged')}</p>
              </div>;
            })}
          </div>
          {grantError && <p role="alert" className="text-sm text-destructive">{grantError}</p>}
          <DialogFooter>
            <button type="button" disabled={granting} onClick={() => setPendingLearners([])}
              className="min-h-11 rounded-xl border px-5 py-2.5 font-semibold disabled:opacity-40">{label.cancel}</button>
            <button type="button" disabled={granting} onClick={() => void confirmGrant()}
              className="min-h-11 rounded-xl bg-primary px-5 py-2.5 font-bold text-primary-foreground disabled:opacity-40">
              {granting ? label.loading : label.confirm}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
