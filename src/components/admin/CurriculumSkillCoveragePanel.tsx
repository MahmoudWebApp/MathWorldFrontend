'use client';

import { useLocale } from 'next-intl';
import { useGetCurriculumSkillCoverageQuery } from '@/store/api/curriculumApi';

/**
 * Admin-only editorial coverage, based on real question-skill links.
 * Draft classifications are NOT an official standards mapping or mastery result.
 */
export function CurriculumSkillCoveragePanel() {
  const ar = useLocale() === 'ar';
  const { data, isLoading, error, refetch } = useGetCurriculumSkillCoverageQuery();

  return (
    <section className="space-y-4 rounded-xl border bg-card p-4 sm:p-5" aria-labelledby="curriculum-skill-coverage-title">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="curriculum-skill-coverage-title" className="text-lg font-bold">
            {ar ? 'تغطية المهارات التعليمية' : 'Learning skill coverage'}
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {ar
              ? 'تقرير إداري من بيانات المسائل الحالية. التصنيف مبدئي ولا يُثبت صحة المسائل أو إتقان الطالب.'
              : 'Live editorial inventory. Draft classification does not prove problem correctness or learner mastery.'}
          </p>
        </div>
        <button type="button" className="rounded-lg border px-3 py-2 text-sm" onClick={() => refetch()}>
          {ar ? 'تحديث المهارات' : 'Refresh skills'}
        </button>
      </div>

      {isLoading && <p role="status">{ar ? 'جارٍ تحميل المهارات...' : 'Loading skills...'}</p>}
      {error && <p role="alert" className="text-sm text-red-600">
        {ar ? 'تعذر تحميل تغطية المهارات. تأكد من تحديث Backend وصلاحيات الإدارة.' : 'Skill coverage is unavailable. Check backend deployment and admin access.'}
      </p>}
      {data && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              [ar ? 'المهارات' : 'Skills', data.TotalSkills],
              [ar ? 'المسائل المصنفة' : 'Tagged problems', data.MappedProblems],
              [ar ? 'المسائل غير المصنفة' : 'Untagged problems', data.UnmappedProblems],
              [ar ? 'المهارات قيد المراجعة' : 'Draft skills', data.DraftSkills],
            ].map(([label, count]) => (
              <div key={String(label)} className="rounded-lg border border-border/70 p-3">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="mt-1 text-2xl font-bold tabular-nums">{count}</p>
              </div>
            ))}
          </div>
          {(data.InvalidPrimaryLinks > 0 || data.UnmappedProblems > 0) && (
            <p role="alert" className="rounded-lg border border-amber-400/50 p-3 text-sm">
              {ar
                ? `يلزم إصلاح ${data.InvalidPrimaryLinks} ربط غير صحيح و${data.UnmappedProblems} مسألة غير مصنفة قبل النشر.`
                : `Review ${data.InvalidPrimaryLinks} invalid skill links and ${data.UnmappedProblems} untagged problems before publishing.`}
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            {ar
              ? `المهارات المنشورة: ${data.PublishedSkills} · مهارات لها ربط مرجعي: ${data.StandardsMappedSkills}. لا نعرض نسب إتقان حتى يكتمل اعتماد المهارات وربط المعايير.`
              : `Published skills: ${data.PublishedSkills} · Skills with framework references: ${data.StandardsMappedSkills}. Mastery percentages remain unavailable until expert validation.`}
          </p>
          <div className="grid gap-2 lg:grid-cols-2">
            {data.Categories.map(category => (
              <details key={category.CategoryId} className="group rounded-lg border border-border/70 p-3">
                <summary className="cursor-pointer text-sm font-semibold">
                  {ar ? category.NameAr : category.NameEn}
                  <span className="ms-2 font-normal text-muted-foreground">
                    {category.SkillCount} {ar ? 'مهارات' : 'skills'} · {category.MappedProblemCount}/{category.ProblemCount}
                  </span>
                </summary>
                <ul className="mt-3 space-y-2">
                  {category.Skills.map(skill => (
                    <li key={skill.StableKey} className="rounded-md bg-muted/50 p-2 text-xs">
                      <div className="font-semibold">{ar ? skill.NameAr : skill.NameEn}</div>
                      <div className="mt-1 text-muted-foreground">
                        {skill.ProblemCount} {ar ? 'مسائل' : 'problems'} · {skill.DomainKey} ·{' '}
                        {skill.IsPublished ? (ar ? 'منشورة' : 'Published') : (ar ? 'مسودة' : 'Draft')}
                      </div>
                    </li>
                  ))}
                  {category.SkillCount === 0 && (
                    <li className="text-xs text-amber-600">{ar ? 'هذه الفئة غير مصنفة بعد' : 'No skills tagged for this topic yet'}</li>
                  )}
                </ul>
              </details>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
