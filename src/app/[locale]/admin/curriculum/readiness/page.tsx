'use client';

import { useGetCurriculumReadinessQuery } from '@/store/api/curriculumApi';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { CurriculumImportPreviewPanel } from '@/components/admin/CurriculumImportPreviewPanel';
import { CurriculumSkillCoveragePanel } from '@/components/admin/CurriculumSkillCoveragePanel';

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
        <p className="rounded-xl border border-primary/20 bg-card p-4 text-sm leading-7 text-muted-foreground">
          {ar
            ? 'التصنيف يتوسع حسب المهارات الرياضية وأهداف التعلم، بلا عدد ثابت للفئات أو المسائل. تشابه القوالب مؤشر لمراجعة التنوع وليس حكماً على صحة السؤال. لا يمكن قياس إتقان المهارات بدقة قبل اعتماد ربط الأسئلة بالمهارات.'
            : 'Topics expand by mathematical learning objectives, with no fixed topic or problem quota. Template similarity is a review signal, not proof of a bad question. Skill mastery cannot be estimated reliably until question-to-skill tagging is reviewed.'}
        </p>
        <CurriculumImportPreviewPanel stages={data.Stages} />
        <CurriculumSkillCoveragePanel />
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            [ar ? 'المراحل' : 'Stages', data.StageCount],
            [ar ? 'المسائل' : 'Problems', data.TotalProblems],
            [ar ? 'فئات تحتاج مراجعة تنوع الأسئلة' : 'Topics with repeated templates', data.CategoriesWithRepeatedTemplates],
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
                <span className={stage.InvalidProblemCount === 0 && stage.EmptyCategoryCount === 0 ? 'text-emerald-600' : 'text-amber-600'}>
                  {stage.InvalidProblemCount === 0 && stage.EmptyCategoryCount === 0
                    ? (ar ? 'المحتوى المنشور سليم بنيوياً' : 'Published content passes structural checks')
                    : (ar ? 'تحتاج مراجعة المحتوى' : 'Content review required')}
                </span>
              </div>
              <p className="mt-2 text-sm">{ar ? 'الفئات المنشورة' : 'Published topics'}: {stage.CategoryCount} · {ar ? 'المسائل المنشورة' : 'Published questions'}: {stage.ProblemCount}</p>
              <p className="text-sm">{ar ? 'فئات فارغة' : 'Empty topics'}: {stage.EmptyCategoryCount} · {ar ? 'مسائل تحتاج تدقيق' : 'Invalid questions'}: {stage.InvalidProblemCount} · {ar ? 'فئات فيها قوالب متشابهة' : 'Topics with similar templates'}: {stage.CategoriesWithRepeatedTemplates}</p>
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
                    <p className="mt-1 text-xs text-muted-foreground">
                      {ar ? 'عائلات نماذج مختلفة' : 'Distinct question templates'}: {category.DistinctTemplateFamilies}
                      {' · '}
                      {ar ? 'قوالب متكررة' : 'Repeated templates'}: {category.RepeatedTemplateFamilies}
                    </p>
                    {category.ExactDuplicateProblemIds.length > 0 && (
                      <p className="mt-1 text-xs font-semibold text-amber-600">
                        {ar ? 'مسائل متطابقة تحتاج مراجعة' : 'Exact duplicates to review'}:
                        {' '}{category.ExactDuplicateProblemIds.map(id => `#${id}`).join('، ')}
                      </p>
                    )}
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
