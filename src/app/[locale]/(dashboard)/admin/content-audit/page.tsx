'use client';
import {WorkspacePageHeader} from '@/components/ui/WorkspacePageHeader';

import { useMemo, useState } from 'react';
import { useLocale } from 'next-intl';
import { AlertTriangle, BookOpenCheck, ClipboardCheck, FolderOpen, RefreshCw, Users } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useGetAdminContentAuditQuery } from '@/store/api/statsApi';

export default function AdminContentAuditPage() {
  const ar = useLocale() === 'ar';
  const { data, isLoading, isFetching, isError, refetch } =
    useGetAdminContentAuditQuery(undefined, { refetchOnMountOrArgChange: true });
  const [stageFilter, setStageFilter] = useState<number | 'all'>('all');
  const fmt = (value: number) => new Intl.NumberFormat(ar ? 'ar' : 'en').format(value);
  const categories = useMemo(
    () => (data?.Categories ?? []).filter(category =>
      stageFilter === 'all' || category.StageId === stageFilter),
    [data?.Categories, stageFilter],
  );
  const categoryIssueCount = (category: (typeof categories)[number]) =>
    category.MissingArabicSolutionCount +
    category.MissingEnglishSolutionCount +
    category.InvalidOptionsCount;

  const isEmpty = !isLoading && !isError && !data;
  return (
    <main className="container mx-auto max-w-6xl space-y-7 px-4 py-8 md:px-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          
          <WorkspacePageHeader title={ar?'تدقيق المحتوى':'Content audit'} icon={ClipboardCheck}/>
          
        </div>
        
      </header>

      {(isError || isEmpty) && (
        <div role="alert" className="rounded-xl border border-destructive/30 bg-card p-5">
          <p className="font-medium text-destructive">
            {ar ? 'تعذر تحميل التدقيق. تأكد من الاتصال أو أعد المحاولة.' : 'Could not load the audit. Check your connection and try again.'}
          </p><button className="mt-2 text-primary underline" onClick={()=>void refetch()}>{ar?'إعادة المحاولة':'Retry'}</button>
        </div>
      )}
      {isLoading && (
        <div role="status" className="rounded-xl border border-border bg-card p-7 text-center text-muted-foreground">
          {ar ? 'جاري التحقق من بيانات المحتوى...' : 'Checking content inventory...'}
        </div>
      )}
      {data && (
        <>
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label={ar ? 'ملخص المحتوى' : 'Content overview'}>
            {[
              { icon: BookOpenCheck, value: data.Summary.TotalProblems, label: ar ? 'المسائل' : 'Problems' },
              { icon: FolderOpen, value: data.Summary.TotalCategories, label: ar ? 'الفئات' : 'Categories' },
              { icon: AlertTriangle, value: data.Summary.EmptyCategories, label: ar ? 'فئات بدون مسائل' : 'Empty categories' },
              { icon: Users, value: data.Summary.LearnersWithoutStage, label: ar ? 'طلاب بلا مرحلة' : 'Learners without a stage' },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="math-card rounded-2xl border border-border p-5">
                <Icon className="mb-2 h-6 w-6 text-primary" aria-hidden="true" />
                <strong className="block text-2xl tabular-nums">{fmt(value)}</strong>
                <span className="mt-1 block text-sm text-muted-foreground">{label}</span>
              </div>
            ))}
          </section>

          <section className="math-card rounded-2xl border border-border p-5">
            <h2 className="text-lg font-bold">{ar ? 'فحص جودة المسائل' : 'Problem quality checks'}</h2>
            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
              <p>{ar ? 'خيارات الإجابة غير الصحيحة' : 'Invalid answer-option sets'}: <strong>{fmt(data.Summary.ProblemsWithInvalidOptions)}</strong></p>
              <p>{ar ? 'مسائل بلا حل عربي' : 'Missing Arabic solution'}: <strong>{fmt(data.Summary.ProblemsMissingArabicSolution)}</strong></p>
              <p>{ar ? 'مسائل بلا حل إنجليزي' : 'Missing English solution'}: <strong>{fmt(data.Summary.ProblemsMissingEnglishSolution)}</strong></p>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-bold">{ar ? 'الفئات حسب المرحلة' : 'Categories by stage'}</h2>
              <label className="flex items-center gap-2 text-sm">
                <span>{ar ? 'المرحلة' : 'Stage'}</span>
                <select
                  className="rounded-xl border border-border bg-card px-3 py-2"
                  value={stageFilter}
                  onChange={event =>
                    setStageFilter(event.target.value === 'all'
                      ? 'all'
                      : Number(event.target.value))}
                >
                  <option value="all">{ar ? 'كل المراحل' : 'All stages'}</option>
                  {data.Stages.map(stage => (
                    <option key={stage.StageId} value={stage.StageId}>
                      {ar ? stage.NameAr : stage.NameEn}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {categories.length === 0 && (
              <p className="rounded-xl border border-border bg-card p-5 text-muted-foreground">
                {ar ? 'ما في فئات بهذه المرحلة.' : 'No categories in this stage.'}
              </p>
            )}
            <div className="grid gap-3 md:grid-cols-2">
              {categories.map(category => {
                const issues = categoryIssueCount(category);
                const stage = data.Stages.find(item => item.StageId === category.StageId);
                return (
                  <article key={category.Id} className="math-card rounded-2xl border border-border p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold">{ar ? category.NameAr : category.NameEn}</h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {stage ? (ar ? stage.NameAr : stage.NameEn) : category.StageId}
                        </p>
                      </div>
                      <strong className="rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
                        {fmt(category.ProblemsCount)} {ar ? 'مسألة' : 'problems'}
                      </strong>
                    </div>
                    <p className="mt-3 text-sm">
                      {category.ProblemsCount === 0
                        ? ar ? 'هذه الفئة فارغة؛ أضف مسائل قبل توجيه الطلاب إليها.' : 'Empty category; add problems before sending learners here.'
                        : issues > 0
                          ? ar ? `هناك ${fmt(issues)} ملاحظات جودة على الحلول أو الخيارات.`
                            : `${fmt(issues)} answer/solution quality observations.`
                          : ar ? 'لا توجد ملاحظات على خيارات الإجابة والحلول.'
                            : 'No detected answer-option or solution issues.'}
                    </p>
                    <Link href={`/admin/problems?stageId=${category.StageId}&categoryId=${category.Id}`}
                      className="mt-4 inline-flex text-sm font-semibold text-primary hover:underline">
                      {ar ? 'عرض مسائل الفئة' : 'View category problems'}
                    </Link>
                  </article>
                );
              })}
            </div>
          </section>
        </>
      )}
    </main>
  );
}
