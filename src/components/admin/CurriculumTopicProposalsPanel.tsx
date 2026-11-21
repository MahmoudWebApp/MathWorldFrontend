'use client';

import { useLocale } from 'next-intl';
import {
  useGetCurriculumTopicProposalsQuery,
  type CurriculumStageCoverage,
} from '@/store/api/curriculumApi';

/**
 * Unpublished topic proposals, so no empty learner-facing categories are created.
 * This is an editor-only view, with zero claims of official accreditation.
 */
export function CurriculumTopicProposalsPanel({ stages }: { stages: CurriculumStageCoverage[] }) {
  const ar = useLocale() === 'ar';
  const { data, isLoading, error, refetch } = useGetCurriculumTopicProposalsQuery();
  const stageNames = new Map(stages.map(x => [x.StageId, ar ? x.NameAr : x.NameEn]));

  return (
    <section className="space-y-3 rounded-xl border bg-card p-4 sm:p-5" aria-labelledby="curriculum-topic-proposals-title">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="curriculum-topic-proposals-title" className="text-lg font-bold">
            {ar ? 'فئات جديدة قيد المراجعة' : 'New topics awaiting editorial review'}
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {ar
              ? 'هذه مقترحات غير منشورة. لا تظهر للطلاب قبل تدقيق صحة المسائل والتصنيف والرموز.'
              : 'These are unpublished proposals. Questions, topic scope and icons must pass review before appearing to learners.'}
          </p>
        </div>
        <button type="button" onClick={() => refetch()} className="rounded-lg border px-3 py-2 text-sm">
          {ar ? 'تحديث' : 'Refresh'}
        </button>
      </div>
      {isLoading && <p role="status" className="text-sm">{ar ? 'جارٍ تحميل المقترحات...' : 'Loading proposals...'}</p>}
      {error && <p role="alert" className="text-sm text-red-600">
        {ar ? 'تعذر تحميل المقترحات، تحقق من نشر Backend وصلاحيات الأدمن.' : 'Unable to load proposals. Check backend deployment and admin permissions.'}
      </p>}
      {data && (
        <>
          <div className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{data.Total}</span> {ar ? 'فئات مقترحة' : 'proposed topics'}
            {' · '}
            <span className="font-semibold text-foreground">{data.TotalDraftProblems}</span> {ar ? 'مسائل مسودة' : 'draft questions'}
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {data.Topics.map(topic => (
              <div key={topic.StableKey} className="rounded-xl border border-border/80 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground">{stageNames.get(topic.StageId) ?? `Stage ${topic.StageId}`}</p>
                    <h3 className="mt-1 font-semibold">{ar ? topic.NameAr : topic.NameEn}</h3>
                  </div>
                  <span className="shrink-0 rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                    {ar ? 'مسودة' : 'Draft'}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {ar ? topic.DescriptionAr : topic.DescriptionEn}
                </p>
                <div className="mt-3 border-t pt-2 text-xs text-muted-foreground">
                  {topic.ProposedQuestionCount} {ar ? 'مسائل تنتظر مراجعة المحتوى' : 'questions pending content review'}
                  {' · '}{topic.DomainKey}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {ar
              ? 'أعداد المسائل المعروضة هي أعداد مسودات، وليست هدفاً ثابتاً للفئات ولا مؤشراً لإتقان الطالب.'
              : 'Draft question counts are neither fixed quotas nor proof of learner mastery.'}
          </p>
        </>
      )}
    </section>
  );
}
