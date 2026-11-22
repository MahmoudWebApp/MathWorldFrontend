'use client';

import Image from 'next/image';
import { useLocale } from 'next-intl';
import { useSelector } from 'react-redux';
import { BookOpenText, Loader2 } from 'lucide-react';

import { Link } from '@/i18n/routing';
import type { RootState } from '@/store';
import { useGetStageCategoryAccessQuery } from '@/store/api/categoriesApi';
import { getStageAccent } from '@/lib/stageVisuals';
import { PublishedStageSkillsPanel } from '@/components/curriculum/PublishedStageSkillsPanel';

/**
 * Public stage overview: one server-rendered heading/description, live
 * category cards, a concise objective section, and one login CTA.
 * Actual solving and Premium gates remain in learner routes and the backend.
 */
export default function StageCategoriesClient({ stageId }: { stageId: number }) {
  const ar = useLocale() === 'ar';
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const stageAccent = getStageAccent({ Id: stageId });
  const { data, isLoading, isError, refetch } = useGetStageCategoryAccessQuery(stageId, {
    skip: stageId <= 0,
    refetchOnMountOrArgChange: true,
  });
  const categories = (data?.Categories ?? [])
    .map(category => ({ ...category, StageId: stageId }))
    .sort((a, b) => (a.Order ?? 0) - (b.Order ?? 0) || a.Id - b.Id);

  return (
    <section className="container mx-auto px-4 pb-16 pt-2 sm:px-6 lg:px-12">
      <div className="mb-5">
        <h2 className="text-xl font-extrabold text-foreground sm:text-2xl">
          {ar ? 'فئات هذه المرحلة التعليمية' : 'Mathematics topics in this stage'}
        </h2>
        <p className="mt-1 text-sm leading-7 text-muted-foreground">
          {ar
            ? 'كل فئة تجمع مهارات مترابطة ومسائل تتدرج في الفهم والتطبيق.'
            : 'Each topic groups related skills and exercises that progress from understanding to application.'}
        </p>
      </div>

      {isLoading ? (
        <div className="flex min-h-36 items-center justify-center" role="status">
          <Loader2 aria-hidden="true" className="h-7 w-7 animate-spin text-primary" />
          <span className="sr-only">{ar ? 'جارٍ تحميل الفئات' : 'Loading topics'}</span>
        </div>
      ) : isError ? (
        <div role="alert" className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
          {ar ? 'تعذر تحميل الفئات حالياً.' : 'Could not load the topics right now.'}
          <button type="button" onClick={() => void refetch()} className="ms-3 font-bold text-primary underline underline-offset-2">
            {ar ? 'إعادة المحاولة' : 'Retry'}
          </button>
        </div>
      ) : categories.length === 0 ? (
        <p className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
          {ar ? 'لا توجد فئات منشورة لهذه المرحلة حالياً.' : 'No topics are currently published for this stage.'}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map(category => {
            const name = ar ? category.NameAr : category.NameEn;
            const description = ar ? category.DescriptionAr : category.DescriptionEn;
            const iconUrl = category.Icon?.trim() ?? '';
            return (
              <article
                key={category.Id}
                className="relative flex min-h-52 flex-col overflow-hidden rounded-2xl border bg-card/90 p-5 shadow-sm"
                style={{ borderColor: `${stageAccent}45` }}
              >
                <span className="absolute inset-x-0 top-0 h-1" style={{ background: stageAccent }} aria-hidden="true" />
                <div
                  className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border"
                  style={{ backgroundColor: `${stageAccent}20`, borderColor: `${stageAccent}55` }}
                >
                  {iconUrl.startsWith('https://') || iconUrl.startsWith('/') ? (
                    <Image src={iconUrl} alt="" unoptimized width={44} height={44} className="h-11 w-11 object-contain" />
                  ) : iconUrl && iconUrl.length <= 4 ? (
                    <span aria-hidden="true" className="text-2xl">{iconUrl}</span>
                  ) : (
                    <BookOpenText aria-hidden="true" className="h-7 w-7" style={{ color: stageAccent }} />
                  )}
                </div>
                <h3 className="text-base font-bold sm:text-lg" style={{ color: stageAccent }}>{name}</h3>
                {description?.trim() && (
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">{description}</p>
                )}
                <p className="mt-auto border-t border-border/70 pt-4 text-xs font-semibold text-muted-foreground">
                  {category.ProblemsCount ?? 0} {ar ? 'مسألة' : 'problems'}
                </p>
              </article>
            );
          })}
        </div>
      )}

      <section className="mt-12 rounded-2xl border border-border/70 bg-card/50 p-4 sm:p-6" aria-labelledby="learning-skills-title">
        <h2 id="learning-skills-title" className="text-xl font-extrabold sm:text-2xl">
          {ar ? 'المهارات التعليمية' : 'Learning skills'}
        </h2>
        <p className="mt-2 mb-5 text-sm leading-7 text-muted-foreground">
          {ar
            ? 'تعرّف إلى أهداف التعلّم المرتبطة بكل فئة. تتوسع تغطية المهارات مع تطور المنهج.'
            : 'Explore the learning objectives behind each topic. Skill coverage grows as the curriculum expands.'}
        </p>
        <PublishedStageSkillsPanel stageId={stageId} categories={categories} />
        {!isAuthenticated && (
          <Link href="/register" className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:opacity-90">
            {ar ? 'انضم إلينا' : 'Join us'}
          </Link>
        )}
      </section>
    </section>
  );
}
