'use client';

import {StageTopicArtwork} from '@/components/stages/StageTopicArtwork';
import { useLocale } from 'next-intl';
import { useSelector } from 'react-redux';
import { BookOpenText, ListChecks, Calculator } from 'lucide-react';

import { Link } from '@/i18n/routing';
import type { RootState } from '@/store';
import { useGetPublishedTracksQuery } from '@/store/api/stagesApi';
import { useGetStageCategoryAccessQuery } from '@/store/api/categoriesApi';
import { getStageAccent } from '@/lib/stageVisuals';
import { PublicTrackCatalog } from '@/components/curriculum/TrackViews';
import { MathWorldLoading } from '@/components/ui/MathWorldLoading';
import { CategorySkillsPopover } from '@/components/curriculum/CategorySkillsDialog';

/**
 * Public stage overview: one server-rendered heading/description, live
 * category cards, a concise objective section, and one login CTA.
 * Actual solving and Premium gates remain in learner routes and the backend.
 */
export default function StageCategoriesClient({ stageId }: { stageId: number }) {
  const ar = useLocale() === 'ar';
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const stageAccent = getStageAccent({ Id: stageId });
  const validStage=Number.isSafeInteger(stageId)&&stageId>0;
  const tracks=useGetPublishedTracksQuery(stageId,{skip:!validStage,refetchOnMountOrArgChange:120});
  const hasTracks=tracks.currentData?.Enabled===true&&tracks.currentData.Items.length>0;
  // Only fetch the legacy topic list after the current stage catalog confirms
  // there are no published tracks. A failed catalog request is not an empty catalog.
  const legacy=validStage&&!!tracks.currentData&&!tracks.isError&&!hasTracks;
  const { currentData:data, isLoading, isFetching, isError, refetch } = useGetStageCategoryAccessQuery(stageId, {
    skip:!legacy,
    refetchOnMountOrArgChange:120,
  });
  const categories = (data?.Categories ?? [])
    .map(category => ({ ...category, StageId: stageId }))
    .sort((a,b)=>Number(data?.FreeCategoryIds.includes(b.Id)??false)-Number(data?.FreeCategoryIds.includes(a.Id)??false)||(a.Order??0)-(b.Order??0)||a.Id-b.Id);

  return (
    <section className="container mx-auto px-4 pb-16 pt-2 sm:px-6 lg:px-12">
      {!validStage?<p role="alert">{ar?'المرحلة غير متاحة.':'Stage unavailable.'}</p>:hasTracks?<PublicTrackCatalog stageId={stageId}/>:tracks.isLoading||(!tracks.currentData&&tracks.isFetching)?<MathWorldLoading compact mode="tab"/>:tracks.isError?<p role="alert">{ar?"تعذّر تحميل الصفوف والمساقات.":"Could not load grades and courses."} <button onClick={()=>void tracks.refetch()} className="underline">{ar?"إعادة المحاولة":"Retry"}</button></p>:<>
      <div className="mb-5">
        <h2 className="text-xl font-extrabold text-foreground sm:text-2xl">
          {ar ? 'فئات هذه المرحلة التعليمية' : 'Mathematics topics in this stage'}
        </h2>

      </div>

      {isLoading || (isFetching&&!data) ? (
        <MathWorldLoading compact/>
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
                className="relative flex min-h-52 flex-col overflow-hidden rounded-2xl border mw-topic-surface p-5 shadow-sm"
                style={{ "--stage-accent": stageAccent } as import("react").CSSProperties}
              >
                <span className="absolute inset-x-0 top-0 h-1" style={{ background: stageAccent }} aria-hidden="true" />
                <div
                  className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border"
                  style={{ backgroundColor: `${stageAccent}20`, borderColor: `${stageAccent}55` }}
                >
                  {iconUrl.startsWith('https://') || iconUrl.startsWith('/') ? (
                    <StageTopicArtwork src={iconUrl} size={44} accent={stageAccent}/>
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
                <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-border/70 pt-4">
                  <span className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-extrabold"
                    style={{ color: stageAccent, backgroundColor: stageAccent + '14' }}>
                    <Calculator className="h-4 w-4" aria-hidden="true" />
                    {category.ProblemsCount ?? 0} {ar ? 'مسألة' : 'problems'}
                  </span>
                  <CategorySkillsPopover stageId={stageId} category={category} trigger={<button type="button"
                    className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border mw-topic-action px-3 py-2 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                    <ListChecks className="h-4 w-4" style={{ color: stageAccent }} aria-hidden="true" />
                    {ar ? 'عرض المهارات' : 'View skills'}
                  </button>}/>
                </div>
              </article>
            );
          })}
        </div>
      )}

      </>}
      {!isAuthenticated && (
        <div className="mt-8 flex justify-center">
          <Link href="/register" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:opacity-90">
            {ar ? 'انضم إلينا' : 'Join us'}
          </Link>
        </div>
      )}
    </section>
  );
}
