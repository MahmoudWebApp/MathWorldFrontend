'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Search, SlidersHorizontal, Users, BarChart3, Crown } from 'lucide-react';
import { useGetAdminLearnersQuery, useGrantAnnualPremiumMutation, type AdminLearnerFilters } from '@/store/api/usersApi';
import { useGetAdminStagesQuery } from '@/store/api/stagesApi';
import { DirectionalArrow } from '@/components/ui/DirectionalNavigation';

export default function AdminUsersPage() {
  const ar = useLocale() === 'ar';
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [stageId, setStageId] = useState<number | undefined>();
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [tier, setTier] = useState<'' | 'Free' | 'Premium'>('');
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [grantMessage, setGrantMessage] = useState('');
  const [grantError, setGrantError] = useState('');
  const [grantAnnualPremium, { isLoading: granting }] = useGrantAnnualPremiumMutation();

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
    Search: search || undefined,
    StageId: stageId,
    IsActive: status === 'all' ? undefined : status === 'active',
    Subscription: tier || undefined,
    Page: page, PageSize: 10,
  };
  const { currentData: data, isLoading, isFetching, isError, refetch } = useGetAdminLearnersQuery(filters, {
    refetchOnMountOrArgChange: true,
  });
  const { data: stages, isError: stagesError, refetch: retryStages } = useGetAdminStagesQuery();
  const label = ar ? {
    title: 'إدارة الطلاب', sub: 'ملفات المتعلمين وتقدمهم ونشاطهم حسب المرحلة',
    search: 'بحث باسم الطالب أو البريد الإلكتروني', allStages: 'كل المراحل',
    allStatus: 'كل الحالات', active: 'نشط', disabled: 'معطّل',
    allTiers: 'كل الاشتراكات', stage: 'المرحلة', status: 'الحالة',
    tier: 'الاشتراك', name: 'الطالب', solved: 'محلولة', points: 'نقاط',
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
  } : {
    title: 'Student management', sub: 'Learner profiles, progress and activity by stage',
    search: 'Search by name or email', allStages: 'All stages',
    allStatus: 'All statuses', active: 'Active', disabled: 'Disabled',
    allTiers: 'All subscriptions', stage: 'Stage', status: 'Status',
    tier: 'Plan', name: 'Learner', solved: 'Solved', points: 'Points',
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
  };
  const eligibleIds = (data?.Learners ?? []).filter(u => u.IsActive).map(u => u.Id);
  const selectedVisible = selectedIds.filter(id => eligibleIds.includes(id));
  const allVisibleSelected = eligibleIds.length > 0 && eligibleIds.every(id => selectedVisible.includes(id));
  const toggleId = (id: number) =>
    setSelectedIds(current => current.includes(id) ? current.filter(x => x !== id) : [...current, id]);
  const toggleAllVisible = () =>
    setSelectedIds(allVisibleSelected ? [] : eligibleIds);

  const activateYear = async (ids: number[]) => {
    if (granting || !ids.length) return;
    setGrantMessage('');
    setGrantError('');
    try {
      const result = await grantAnnualPremium(ids).unwrap();
      setSelectedIds([]);
      await refetch().unwrap();
      const done = result.Updated;
      const skipped = result.SkippedIndefiniteIds.length;
      setGrantMessage(ar
        ? `تم تفعيل أو تجديد Premium لمدة سنة لـ ${done} طالب${skipped ? `، و${skipped} لديهم Premium بلا انتهاء ولم تتغير صلاحياتهم` : ''}.`
        : `One-year Premium updated for ${done} learners${skipped ? `; ${skipped} indefinite accounts unchanged` : ''}.`);
    } catch {
      setGrantError(label.grantError);
    }
  };

  // Actual timestamps from server, not guessed log-out or session duration.
  const fmt = (value: string | null | undefined, absent = label.noActivity) =>
    value ? new Date(value).toLocaleString(ar ? 'ar' : 'en', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }) : absent;

  return (
    <main className="container mx-auto max-w-7xl px-4 py-8 md:px-10">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="brand-display-title text-gradient-math text-3xl font-bold">{label.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{label.sub}</p>
        </div>
        <Link href="/admin/analytics" className="inline-flex items-center gap-2 rounded-xl border border-primary/20 px-4 py-2 text-sm text-primary hover:bg-primary/5">
          <BarChart3 className="h-4 w-4" aria-hidden />{label.analytics}
        </Link>
      </div>
      <section aria-label={label.search} className="math-card mb-6 rounded-2xl border border-border p-4 md:p-5">
        {stagesError && (
          <div role="alert" className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-destructive/30 p-3 text-sm text-destructive">
            <span>{ar ? 'تعذر تحميل قائمة المراحل؛ بقية الفلاتر لا تزال متاحة.' : 'Could not load stages; the other filters remain available.'}</span>
            <button type="button" onClick={() => void retryStages()} className="rounded-lg border border-current px-3 py-1.5 font-semibold">
              {label.retry}
            </button>
          </div>
        )}
        <div className="mb-3 flex items-center gap-2 font-semibold">
          <SlidersHorizontal className="h-5 w-5 text-primary" aria-hidden />
          {label.title}
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="relative block">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <span className="sr-only">{label.search}</span>
            <input type="search" maxLength={100} value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)} placeholder={label.search}
              className="w-full rounded-xl border border-border bg-card py-2.5 pe-3 ps-10 text-sm outline-none focus:border-primary" />
          </label>
          <label>
            <span className="sr-only">{label.stage}</span>
            <select value={stageId ?? ''} onChange={(e) => {setStageId(e.target.value ? Number(e.target.value) : undefined); setPage(1);}}
              className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm">
              <option value="">{label.allStages}</option>
              {(stages ?? []).map((stage) =>
                <option key={stage.Id} value={stage.Id}>{ar ? stage.NameAr : stage.NameEn}</option>)}
            </select>
          </label>
          <label>
            <span className="sr-only">{label.status}</span>
            <select value={status} onChange={(e) => {setStatus(e.target.value as typeof status); setPage(1);}}
              className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm">
              <option value="all">{label.allStatus}</option>
              <option value="active">{label.active}</option>
              <option value="inactive">{label.disabled}</option>
            </select>
          </label>
          <label>
            <span className="sr-only">{label.tier}</span>
            <select value={tier} onChange={(e) => {setTier(e.target.value as typeof tier); setPage(1);}}
              className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm">
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
                onChange={toggleAllVisible} disabled={!eligibleIds.length || granting}
                aria-label={label.selectAll}
                className="h-4 w-4 accent-primary" />
              <span className="font-medium">{label.selected}: {selectedVisible.length}</span>
            </label>
            <button type="button" disabled={!selectedVisible.length || granting}
              onClick={() => void activateYear(selectedVisible)}
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
          {isFetching && !isLoading && <span role="status" className="text-muted-foreground">{label.loading}</span>}
        </div>
        {isError ? (
          <div role="alert" className="p-10 text-center">
            <p className="text-destructive">{label.error}</p>
            <button type="button" onClick={() => refetch()} className="mt-3 rounded-xl border border-primary/30 px-4 py-2 text-primary">{label.retry}</button>
          </div>
        ) : isLoading ? (
          <div role="status" className="p-10 text-center text-muted-foreground">{label.loading}</div>
        ) : !data?.Learners.length ? (
          <div className="p-12 text-center text-muted-foreground">{label.empty}</div>
        ) : (
          <>
            <div className="grid gap-3 p-3 sm:grid-cols-2 md:hidden">
              {data.Learners.map(u => (
                <article key={u.Id} className="min-w-0 space-y-3 rounded-xl border border-border bg-card p-4">
                  <div className="flex items-start gap-2">
                    <input type="checkbox" checked={selectedVisible.includes(u.Id)}
                      disabled={!u.IsActive || granting} onChange={() => toggleId(u.Id)}
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
                      u.IsActive ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'
                    }`}>{u.IsActive ? label.active : label.disabled}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="rounded-lg bg-muted px-2 py-1">{(ar ? u.StageNameAr : u.StageNameEn) || label.noStage}</span>
                    <span className="rounded-lg bg-muted px-2 py-1">{u.SubscriptionType}</span>
                  </div>
                  <dl className="grid grid-cols-2 gap-3 rounded-lg bg-muted/30 p-3 text-sm">
                    <div><dt className="text-xs text-muted-foreground">{label.solved}</dt><dd className="font-semibold tabular-nums">{u.SolvedProblems}</dd></div>
                    <div><dt className="text-xs text-muted-foreground">{label.points}</dt><dd className="font-semibold tabular-nums">{u.TotalAwardedPoints}</dd></div>
                    <div className="col-span-2"><dt className="text-xs text-muted-foreground">{label.recent}</dt><dd>{fmt(u.LastAttemptAt)}</dd></div>
                  </dl>
                    </div>
                  </div>
                  <button type="button" disabled={!u.IsActive || granting} onClick={() => void activateYear([u.Id])}
                    className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-primary/30 px-3 py-2 text-sm font-semibold text-primary disabled:opacity-40">
                    <Crown className="h-4 w-4" aria-hidden />
                    {u.SubscriptionType === 'Premium' ? label.renew : label.annual}
                  </button>
                  <Link href={`/admin/users/${u.Id}`} className="inline-flex items-center gap-2 rounded-lg border border-primary/20 px-3 py-2 text-sm font-semibold text-primary hover:bg-primary/5">
                    {label.detail}<DirectionalArrow direction="forward" className="h-4 w-4" />
                  </Link>
                </article>
              ))}
            </div>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[770px] text-sm">
                <thead className="bg-muted/40 text-muted-foreground">
                  <tr>
                    <th scope="col" className="px-3 py-3">
                      <span className="sr-only">{label.selectAll}</span>
                    </th>
                    {[label.name, label.stage, label.status, label.tier, label.solved,
                      label.points, label.lastLogin, label.recent, label.detail].map((heading) =>
                      <th className="px-4 py-3 text-start font-semibold" key={heading}>{heading}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {data.Learners.map((u) => (
                    <tr key={u.Id} className="border-t border-border hover:bg-muted/20">
                      <td className="px-3 py-3">
                        <input type="checkbox" checked={selectedVisible.includes(u.Id)}
                          disabled={!u.IsActive || granting} onChange={() => toggleId(u.Id)}
                          aria-label={`${label.select}: ${u.FullName}`} className="h-4 w-4 accent-primary" />
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/users/${u.Id}`} className="font-semibold text-primary hover:underline">{u.FullName}</Link>
                        <p className="mt-1 max-w-[230px] truncate text-xs text-muted-foreground" dir="ltr">{u.Email}</p>
                      </td>
                      <td className="px-4 py-3">{(ar ? u.StageNameAr : u.StageNameEn) || label.noStage}</td>
                      <td className="px-4 py-3"><span className={`rounded-lg px-2 py-1 text-xs ${
                        u.IsActive ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'
                      }`}>{u.IsActive ? label.active : label.disabled}</span></td>
                      <td className="px-4 py-3">{u.SubscriptionType}</td>
                      <td className="px-4 py-3 tabular-nums">{u.SolvedProblems}</td>
                      <td className="px-4 py-3 tabular-nums">{u.TotalAwardedPoints}</td>
                      <td className="px-4 py-3 text-muted-foreground">{fmt(u.LastLoginAt, label.noLogin)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{fmt(u.LastAttemptAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col items-start gap-2">
                          <Link href={`/admin/users/${u.Id}`} className="font-semibold text-primary hover:underline">{label.detail}</Link>
                          <button type="button" disabled={!u.IsActive || granting} onClick={() => void activateYear([u.Id])}
                            className="text-xs font-semibold text-primary underline-offset-2 hover:underline disabled:opacity-40">
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
    </main>
  );
}
