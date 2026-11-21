'use client';

import { useLocale } from 'next-intl';
import { useState } from 'react';
import { RichText } from '@/components/ui/RichText';
import { LatexPreview } from '@/components/ui/LatexPreview';
import {
  useGetCurriculumDraftTopicQuestionsQuery,
  useGetCurriculumTopicProposalsQuery,
  type CurriculumStageCoverage,
} from '@/store/api/curriculumApi';

/**
 * Unpublished topic proposals, so no empty learner-facing categories are created.
 * This is an editor-only view, with zero claims of official accreditation.
 */
export function CurriculumTopicProposalsPanel({ stages }: { stages: CurriculumStageCoverage[] }) {
  const ar = useLocale() === 'ar';
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const {
    data: questionData,
    isLoading: questionsLoading,
    error: questionsError,
  } = useGetCurriculumDraftTopicQuestionsQuery(selectedTopic ?? '', {
    skip: selectedTopic === null,
  });
  const { data, isLoading, error, refetch } = useGetCurriculumTopicProposalsQuery();
  const stageNames = new Map<number, string>(stages.map(x => [x.StageId, ar ? x.NameAr : x.NameEn] as const));

  return (
    <section className="space-y-3 rounded-xl border bg-card p-4 sm:p-5" aria-labelledby="curriculum-topic-proposals-title">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="curriculum-topic-proposals-title" className="text-lg font-bold">
            {ar ? 'فئات المنهج الجديدة وحالة نشرها' : 'New curriculum topics and publication status'}
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {ar
              ? 'نعرض هنا فئات المنهج المقترحة والمنشورة، وتفاصيل تدقيق المسائل والتصنيف.'
              : 'Review proposed and published curriculum topics, including their questions, classifications and icons.'}
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
            <span className="font-semibold text-foreground">{data.TotalDraftProblems}</span> {ar ? 'مسائل تنتظر المراجعة' : 'pending-review questions'}
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
                    {topic.EditorialStatus === 'Published'
                      ? (ar ? 'منشورة' : 'Published')
                      : (ar ? 'مسودة' : 'Draft')}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {ar ? topic.DescriptionAr : topic.DescriptionEn}
                </p>
                <div className="mt-3 border-t pt-2 text-xs text-muted-foreground">
                  {topic.ProposedQuestionCount} {topic.EditorialStatus === 'Published'
                    ? (ar ? 'مسائل منشورة' : 'published questions')
                    : (ar ? 'مسائل تنتظر مراجعة المحتوى' : 'questions pending content review')}
                  {' · '}{topic.DomainKey}
                </div>
                <button
                  type="button"
                  className="mt-3 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary"
                  onClick={() => setSelectedTopic(previous => previous === topic.StableKey ? null : topic.StableKey)}
                  aria-expanded={selectedTopic === topic.StableKey}
                >
                  {selectedTopic === topic.StableKey
                    ? (ar ? 'إغلاق تفاصيل المسائل' : 'Close question details')
                    : (ar ? 'مراجعة المسائل والحلول' : 'Review questions and solutions')}
                </button>
              </div>
            ))}
          </div>
          {selectedTopic && (
            <div className="rounded-xl border border-border/80 p-4">
              {questionsLoading && <p role="status">{ar ? 'جارٍ تحميل المسائل...' : 'Loading draft questions...'}</p>}
              {questionsError && <p role="alert" className="text-sm text-red-600">
                {ar ? 'تعذر تحميل تفاصيل المسائل.' : 'Unable to load draft question details.'}
              </p>}
              {questionData && questionData.TopicKey === selectedTopic && (
                <>
                  <h3 className="text-base font-bold">
                    {ar ? questionData.TopicNameAr : questionData.TopicNameEn}
                    <span className="ms-2 text-sm font-normal text-muted-foreground">
                      ({questionData.Total} {ar ? 'مسائل مسودة' : 'draft questions'})
                    </span>
                  </h3>
                  <div className="mt-3 space-y-3">
                    {questionData.Questions.map((item, index) => (
                      <details key={item.ContentKey} className="rounded-lg border border-border/80 p-3">
                        <summary className="cursor-pointer text-sm font-semibold">
                          {index + 1}. {ar ? item.LearningObjectiveAr : item.LearningObjectiveEn}
                          <span className="ms-2 text-xs font-normal text-muted-foreground">
                            {ar ? 'صعوبة' : 'Difficulty'} {item.DifficultyLevel}/5
                          </span>
                        </summary>
                        <div className="mt-3 space-y-3 text-sm">
                          <RichText text={ar ? item.QuestionTextAr : item.QuestionTextEn} isArabic={ar} className="text-sm" />
                          <div className="grid gap-2 sm:grid-cols-2">
                            {item.Options.map(option => (
                              <div key={option.Order} className={`rounded-lg border p-2 ${option.IsCorrect ? 'border-emerald-500/50' : 'border-border/80'}`}>
                                <span className="me-2 text-xs text-muted-foreground">{option.Order}.</span>
                                <LatexPreview latex={option.LatexCode} />
                                {option.IsCorrect && <span className="ms-2 text-xs font-medium text-emerald-600">
                                  {ar ? 'الإجابة الصحيحة' : 'Correct answer'}
                                </span>}
                              </div>
                            ))}
                          </div>
                          <p className="text-xs font-semibold text-muted-foreground">{ar ? 'الحل المفسّر' : 'Worked explanation'}</p>
                          <RichText text={ar ? item.DetailedSolutionAr : item.DetailedSolutionEn} isArabic={ar} className="text-sm" />
                          <div className="text-xs text-muted-foreground">
                            {ar ? 'المهارة' : 'Skill'}: {item.PrimarySkillKey}
                            {' · '}{ar ? 'الحالة' : 'Status'}: {item.EditorialStatus}
                          </div>
                        </div>
                      </details>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            {ar
              ? 'أعداد المسائل المعروضة ليست حصصاً ثابتة للفئات ولا دليلاً على إتقان الطالب.'
              : 'Question counts are neither fixed quotas nor proof of learner mastery.'}
          </p>
        </>
      )}
    </section>
  );
}
