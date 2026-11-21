'use client';

import { useLocale } from 'next-intl';
import { BookOpen, ChevronDown } from 'lucide-react';
import type { CategoryDto } from '@/store/api/categoriesApi';
import { useGetPublishedStageSkillsQuery } from '@/store/api/curriculumApi';

/**
 * Shows only explicitly published curriculum objectives from the API.
 * No fabricated mastery percentages; locked topics remain protected by
 * existing categories/probIems access policy.
 */
export function PublishedStageSkillsPanel({
  stageId,
  categories,
}: {
  stageId: number;
  categories: CategoryDto[];
}) {
  const ar = useLocale() === 'ar';
  const { data, isLoading, isError } = useGetPublishedStageSkillsQuery(stageId, {
    skip: stageId <= 0,
  });

  // Curriculum metadata must never break the main category list if the
  // backend has not yet been deployed or the draft skills are unpublished.
  if (isLoading || isError || !data?.length) return null;

  const groups = categories.map(category => ({
    category,
    skills: data.filter(skill => skill.CategoryId === category.Id),
  })).filter(group => group.skills.length > 0);

  if (!groups.length) return null;

  return (
    <details className="group mb-8 rounded-2xl border border-border/70 bg-card/80">
      <summary className="flex cursor-pointer list-none items-center gap-3 p-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary [&::-webkit-details-marker]:hidden sm:p-5">
        <BookOpen className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
        <span className="flex-1">
          <strong className="block text-sm font-extrabold sm:text-base">
            {ar ? 'المهارات الرياضية المنشورة ضمن هذه المرحلة' : 'Published learning skills in this stage'}
          </strong>
          <span className="mt-1 block text-xs leading-6 text-muted-foreground">
            {ar
              ? `استكشف ${data.length} مهارات موزعة حسب فئات واضحة، مع استمرار تطوير تغطية المنهج.`
              : `Explore ${data.length} skills grouped by coherent topics, with more curriculum coverage under development.`}
          </span>
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden="true" />
      </summary>
      <div className="grid gap-3 border-t border-border/70 p-4 sm:grid-cols-2 sm:p-5">
        {groups.map(({ category, skills }) => (
          <section key={category.Id} className="rounded-xl border border-border/70 p-3">
            <h3 className="font-semibold">
              {ar ? category.NameAr : category.NameEn}
            </h3>
            <ul className="mt-3 space-y-2">
              {skills.map(skill => (
                <li key={skill.StableKey} className="rounded-lg bg-muted/50 px-3 py-2">
                  <div className="text-sm font-medium">
                    {ar ? skill.NameAr : skill.NameEn}
                  </div>
                  {(ar ? skill.DescriptionAr : skill.DescriptionEn)?.trim() &&
                    (ar ? skill.DescriptionAr : skill.DescriptionEn) !==
                    (ar ? skill.NameAr : skill.NameEn) && (
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      {ar ? skill.DescriptionAr : skill.DescriptionEn}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <p className="px-4 pb-4 text-xs leading-5 text-muted-foreground sm:px-5">
        {ar
          ? 'هذه أهداف تعليمية وليست شهادات اعتماد أو نسب إتقان؛ نتائج الطالب تُحسب فقط من محاولاته الفعلية.'
          : 'These are learning objectives, not accreditation or mastery scores. Learner results come only from real attempts.'}
      </p>
    </details>
  );
}
