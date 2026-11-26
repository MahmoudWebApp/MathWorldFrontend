'use client';

import { BookOpenCheck, RefreshCw } from 'lucide-react';
import { useLocale } from 'next-intl';

import * as Popover from '@radix-ui/react-popover';
import type { ReactElement,ReactNode } from 'react';
import { MathWorldLoading } from '@/components/ui/MathWorldLoading';
import { useGetPublishedStageSkillsQuery } from '@/store/api/curriculumApi';

/**
 * Same API-owned, published-only learning outcomes in public and learner pages.
 * CurriculumSkills already has CategoryId and both languages; duplicating the
 * relationship in a string field on Categories would create two sources of truth.
 */
export function SkillsPopover({trigger,title,children}:{trigger:ReactElement;title:string;children:ReactNode}){
  const ar=useLocale()==='ar';
  return <Popover.Root modal={false}>
    <Popover.Trigger asChild>{trigger}</Popover.Trigger>
    <Popover.Portal><Popover.Content dir={ar?'rtl':'ltr'} side="bottom" align="start" sideOffset={9} collisionPadding={12} className="z-[70] w-[min(88vw,430px)] max-h-[min(70vh,var(--radix-popover-content-available-height))] overflow-y-auto rounded-2xl border border-border bg-popover p-4 text-popover-foreground shadow-xl outline-none">
      <Popover.Arrow className="fill-popover stroke-border" width={16} height={8}/>
      <div className="mb-3 space-y-1 border-b pb-3"><h3 className="flex items-center gap-2 font-bold text-primary"><BookOpenCheck className="h-5 w-5"/>{ar?'المهارات التعليمية':'Learning skills'}</h3><p className="text-sm text-muted-foreground">{title}</p></div>
      {children}
    </Popover.Content></Popover.Portal>
  </Popover.Root>;
}
export function CategorySkillsPopover({stageId,category,trigger}:{stageId:number;category:{Id:number;NameAr:string;NameEn:string};trigger:ReactElement}){
  const ar=useLocale()==='ar';
  return <SkillsPopover trigger={trigger} title={ar?category.NameAr:category.NameEn}><PublishedSkills stageId={stageId} categoryId={category.Id}/></SkillsPopover>;
}
function PublishedSkills({stageId,categoryId}:{stageId:number;categoryId:number}){
  const ar=useLocale()==='ar';
  const {currentData:skills,isLoading,isFetching,isError,refetch}=useGetPublishedStageSkillsQuery(stageId,{skip:stageId<=0});
  const published=(skills??[]).filter(skill=>skill.CategoryId===categoryId);
  return <div className="space-y-3">
        {isLoading || (isFetching && !skills) ? (
          <MathWorldLoading compact />
        ) : isError || !skills ? (
          <div role="alert" className="space-y-3 text-sm">
            <p>{ar ? 'تعذّر تحميل مهارات هذه الفئة من الخادم.' : 'Could not load skills for this topic.'}</p>
            <button type="button" onClick={() => void refetch()}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-primary px-4 font-bold text-primary-foreground">
              <RefreshCw className="h-4 w-4" />
              {ar ? 'إعادة المحاولة' : 'Retry'}
            </button>
          </div>
        ) : published.length ? (
          <div className="max-h-[55vh] space-y-3 overflow-y-auto">
            {published.map((skill, index) => (
              <div key={skill.StableKey} className="rounded-xl border border-border/80 bg-muted/25 px-4 py-3">
                <div className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-bold text-foreground">{ar ? skill.NameAr : skill.NameEn}</h3>
                    {(ar ? skill.DescriptionAr : skill.DescriptionEn)?.trim() &&
                      (ar ? skill.DescriptionAr : skill.DescriptionEn).trim() !==
                        (ar ? skill.NameAr : skill.NameEn).trim() && (
                      <p className="mt-1 text-sm leading-7 text-muted-foreground">
                        {ar ? skill.DescriptionAr : skill.DescriptionEn}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
            {ar ? 'مهارات هذه الفئة قيد المراجعة التعليمية، وما منشورة للعرض بعد.' :
              'The learning objectives for this topic are under editorial review and are not published yet.'}
          </p>
        )}
        <p className="text-xs leading-6 text-muted-foreground">
          {ar ? 'المهارات أهداف تعلّم، مو نسب إتقان أو شهادات اعتماد. تقدّمك بينحسب من محاولاتك الفعلية.' :
            'These are learning objectives, not mastery claims or accreditation. Progress uses actual attempts.'}
        </p>
    </div>;
}
