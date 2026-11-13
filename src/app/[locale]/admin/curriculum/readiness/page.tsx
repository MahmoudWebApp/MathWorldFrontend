'use client';

import { useGetCurriculumReadinessQuery } from '@/store/api/curriculumApi';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { CurriculumImportPreviewPanel } from '@/components/admin/CurriculumImportPreviewPanel';

export default function CurriculumReadinessPage() {
  const locale = useLocale();
  const ar = locale === 'ar';
  const { data, isLoading, error, refetch } = useGetCurriculumReadinessQuery();
  return (
    <main dir={ar ? 'rtl' : 'ltr'} className="mx-auto max-w-6xl space-y-6 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{ar ? 'جاهزية المحتوى التعليمي' : 'Curriculum readiness'}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{ar ? 'تقرير قراءة فقط: لا ينشر ولا يغيّر أي مسألة.' : 'Read-only audit: no problems are published or modified.'}</p>
        </div>
        <button type="button" onClick={() => refetch()} className="rounded-lg border px-4 py-2">
          {ar ? 'تحديث التقرير' : 'Refresh report'}
        </button>
      </div>
      {isLoading && <p role="status">{ar ? 'جارٍ تحميل التقرير...' : 'Loading report...'}</p>}
      {error && <p role="alert" className="text-red-600">{ar ? 'تعذر جلب التقرير. تأكد من تسجيل الدخول كأدمن.' : 'Could not load report. Admin access is required.'}</p>}
      {data && <>
        <CurriculumImportPreviewPanel />
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            [ar ? 'المراحل' : 'Stages', data.StageCount],
            [ar ? 'المسائل' : 'Problems', data.TotalProblems],
            [ar ? 'مسائل ناقصة للحد الأدنى' : 'Missing problems to minimum', data.TotalMissingToMinimum],
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-xl border bg-card p-4">
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="text-3xl font-bold">{value}</p>
            </div>
          ))}
        </div>
        {data.OrphanProblemCount > 0 && (
          <section className="rounded-xl border border-red-300 p-4">
            <h2 className="font-semibold text-red-600">{ar ? 'مسائل مرتبطة بمراحل غير موجودة' : 'Problems referencing missing stages'}: {data.OrphanProblemCount}</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {data.OrphanProblemIds.map(id => <Link key={id} href={`/problems/${id}`} className="rounded border px-2 py-1 text-sm underline">#{id}</Link>)}
            </div>
          </section>
        )}
        <div className="space-y-4">
          {data.Stages.map(stage => (
            <section key={stage.StageId} className="rounded-xl border bg-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-semibold">{ar ? stage.NameAr : stage.NameEn}</h2>
                <span className={stage.MeetsMinimum && stage.InvalidProblemCount === 0 ? 'text-emerald-600' : 'text-amber-600'}>
                  {stage.MeetsMinimum && stage.InvalidProblemCount === 0 ? (ar ? 'مستوفية للحد الأدنى' : 'Minimum met') : (ar ? 'تحتاج مراجعة' : 'Needs review')}
                </span>
              </div>
              <p className="mt-2 text-sm">{ar ? 'عدد المسائل' : 'Problems'}: {stage.ProblemCount} / {stage.RequiredMinimum}</p>
              <p className="text-sm">{ar ? 'المسائل الناقصة' : 'Missing'}: {stage.MissingToMinimum} · {ar ? 'مسائل تحتاج تدقيق' : 'Problems needing review'}: {stage.InvalidProblemCount}</p>
              {stage.InvalidProblemIds?.length > 0 && (
                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                  <span>{ar ? 'مسائل تحتاج مراجعة:' : 'Flagged problems:'}</span>
                  {stage.InvalidProblemIds.map(id => (
                    <Link key={id} href={`/problems/${id}`} className="rounded-md border px-2 py-1 underline">#{id}</Link>
                  ))}
                </div>
              )}
              {stage.Categories.length === 0 && <p className="mt-2 text-sm text-amber-600">{ar ? 'لا توجد فئات لهذه المرحلة' : 'No categories assigned to this stage'}</p>}
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {stage.Categories.map(category => (
                  <div key={category.CategoryId} className="rounded-lg border p-3 text-sm">
                    <span aria-hidden="true">{category.Icon}</span> {ar ? category.NameAr : category.NameEn}
                    <span className="ms-2 text-muted-foreground">({category.ProblemCount})</span>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </>}
    </main>
  );
}
