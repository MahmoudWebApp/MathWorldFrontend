'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Search, SlidersHorizontal, Users, BarChart3 } from 'lucide-react';
import { useGetAdminLearnersQuery, type AdminLearnerFilters } from '@/store/api/usersApi';
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
  const { data, isLoading, isFetching, isError, refetch } = useGetAdminLearnersQuery(filters, {
    refetchOnMountOrArgChange: true,
  });
  const { data: stages } = useGetAdminStagesQuery();
  const label = ar ? {
    title: 'إدارة الطلاب', sub: 'ملفات المتعلمين وتقدمهم ونشاطهم حسب المرحلة',
    search: 'بحث باسم الطالب أو البريد الإلكتروني', allStages: 'كل المراحل',
    allStatus: 'كل الحالات', active: 'نشط', disabled: 'معطّل',
    allTiers: 'كل الاشتراكات', stage: 'المرحلة', status: 'الحالة',
    tier: 'الاشتراك', name: 'الطالب', solved: 'محلولة', points: 'نقاط',
    recent: 'آخر محاولة', noActivity: 'لا توجد محاولات',
    noStage: 'لم يحدد المرحلة', detail: 'ملف الطالب', total: 'طالب',
    empty: 'ما في طلاب مطابقين للبحث الحالي.', error: 'تعذر تحميل الطلاب.',
    retry: 'إعادة المحاولة', loading: 'جاري تحميل الطلاب...',
    previous: 'السابق', next: 'التالي', page: 'صفحة',
    analytics: 'إحصائيات المراحل',
  } : {
    title: 'Student management', sub: 'Learner profiles, progress and activity by stage',
    search: 'Search by name or email', allStages: 'All stages',
    allStatus: 'All statuses', active: 'Active', disabled: 'Disabled',
    allTiers: 'All subscriptions', stage: 'Stage', status: 'Status',
    tier: 'Plan', name: 'Learner', solved: 'Solved', points: 'Points',
    recent: 'Last attempt', noActivity: 'No attempts',
    noStage: 'No stage selected', detail: 'View learner', total: 'students',
    empty: 'No learners match these filters.', error: 'Could not load learners.',
    retry: 'Retry', loading: 'Loading learners...',
    previous: 'Previous', next: 'Next', page: 'Page',
    analytics: 'Stage analytics',
  };
  const fmt = (value: string | null | undefined) =>
    value ? new Date(value).toLocaleDateString(ar ? 'ar' : 'en', {
      year: 'numeric', month: 'short', day: 'numeric',
    }) : label.noActivity;

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
            <div className="overflow-x-auto">
              <table className="w-full min-w-[770px] text-sm">
                <thead className="bg-muted/40 text-muted-foreground">
                  <tr>
                    {[label.name, label.stage, label.status, label.tier, label.solved,
                      label.points, label.recent, label.detail].map((heading) =>
                      <th className="px-4 py-3 text-start font-semibold" key={heading}>{heading}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {data.Learners.map((u) => (
                    <tr key={u.Id} className="border-t border-border hover:bg-muted/20">
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
                      <td className="px-4 py-3 text-muted-foreground">{fmt(u.LastAttemptAt)}</td>
                      <td className="px-4 py-3"><Link href={`/admin/users/${u.Id}`} className="font-semibold text-primary hover:underline">{label.detail}</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-border p-4 text-sm">
              <span className="text-muted-foreground">{label.page} {data.Page} / {Math.max(data.TotalPages, 1)}</span>
              <div className="flex gap-2">
                <button type="button" disabled={page <= 1} onClick={() => setPage((v) => v - 1)}
                  className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 disabled:opacity-40">
                  <DirectionalArrow direction="back" className="h-4 w-4" />{label.previous}
                </button>
                <button type="button" disabled={page >= data.TotalPages} onClick={() => setPage((v) => v + 1)}
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
