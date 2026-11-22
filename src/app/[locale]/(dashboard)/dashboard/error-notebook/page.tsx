'use client';

import { useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import {
  Archive,
  ArchiveRestore,
  BookOpen,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Loader2,
  NotebookTabs,
  RefreshCcw,
} from 'lucide-react';

import { Link } from '@/i18n/routing';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { RichText } from '@/components/ui/RichText';
import { StageIconBadge } from '@/components/stages/StageIconBadge';
import {
  type ErrorNotebookProblem,
  useGetErrorNotebookQuery,
  useGetLearningStageQuery,
  useSetErrorNotebookArchiveMutation,
} from '@/store/api/usersApi';

type NotebookTab = 'active' | 'archived';

// Never treat malformed or absent review dates as overdue.
function reviewTimestamp(problem: ErrorNotebookProblem) {
  const parsed = problem.NextReviewAt ? Date.parse(problem.NextReviewAt) : Number.NaN;
  return Number.isFinite(parsed) ? parsed : Number.POSITIVE_INFINITY;
}

function isReviewDue(problem: ErrorNotebookProblem, now: number) {
  return reviewTimestamp(problem) <= now;
}

export default function ErrorNotebookPage() {
  const t = useTranslations();
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const [activeTab, setActiveTab] = useState<NotebookTab>('active');
  const [updatingProblemId, setUpdatingProblemId] = useState<number | null>(null);
  const [dueOnly, setDueOnly] = useState(false);
  const [archiveError, setArchiveError] = useState<string | null>(null);

  const {
    data: problems = [],
    isLoading,
    isError,
    refetch,
  } = useGetErrorNotebookQuery(
    { IncludeArchived: true, Locale: locale },
    { refetchOnMountOrArgChange: true },
  );

  const { data: selectedStage, isLoading: stageLoading, isError: stageError, refetch: reloadStage } = useGetLearningStageQuery();
  const stageId = selectedStage?.StageId ?? 0;

  const [setArchiveStatus] = useSetErrorNotebookArchiveMutation();

  // Past-stage history remains in the database; the workspace shows only
  // the active stage and never offers an all-stages notebook selector.
  const stageProblems = useMemo(() =>
    problems.filter(problem => stageId > 0 && problem.StageId === stageId),
  [problems, stageId]);
  const visibleProblems = useMemo(() => {
    const now = Date.now();
    return stageProblems.filter(problem =>
      problem.IsArchived === (activeTab === 'archived') &&
      (!dueOnly || isReviewDue(problem, now))
    ).sort((a, b) => reviewTimestamp(a) - reviewTimestamp(b) ||
      Date.parse(b.LastAttemptAt) - Date.parse(a.LastAttemptAt) || a.Id - b.Id);
  }, [stageProblems, activeTab, dueOnly]);

  const activeCount = stageProblems.filter(problem => !problem.IsArchived).length;
  const archivedCount = stageProblems.length - activeCount;
  const dueCount = stageProblems.filter(problem => !problem.IsArchived &&
    isReviewDue(problem, Date.now())).length;
  const filtersActive = dueOnly;

  function getMasteryLabel(status: ErrorNotebookProblem['MasteryStatus']) {
    return t(`problem.mastery.${status}`);
  }

  function formatReviewDate(value: string | null | undefined) {
    if (!value) {
      return t('errorNotebook.noReviewDate');
    }

    const parsed = new Date(value);
    if (!Number.isFinite(parsed.getTime())) return t('errorNotebook.noReviewDate');
    return new Intl.DateTimeFormat(locale, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(parsed);
  }

  async function handleArchive(problem: ErrorNotebookProblem) {
    if (updatingProblemId !== null) return;
    setArchiveError(null);
    setUpdatingProblemId(problem.Id);

    try {
      await setArchiveStatus({
        ProblemId: problem.Id,
        IsArchived: !problem.IsArchived,
      }).unwrap();
    } catch {
      setArchiveError(isArabic
        ? 'ما قدرنا نحفظ حالة المسألة. جرّب مرة ثانية.'
        : 'Could not save the problem status. Please retry.');
    } finally {
      setUpdatingProblemId(null);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 md:px-16 lg:px-24">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2 text-primary">
            <NotebookTabs className="h-6 w-6" />
            <span className="text-sm font-semibold uppercase tracking-wide">
              {t('errorNotebook.learningTool')}
            </span>
          </div>
          <h1 className="text-3xl font-bold">{t('errorNotebook.title')}</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            {t('errorNotebook.description')}
          </p>
        </div>

        <Button variant="outline" className="gap-2" onClick={() => refetch()}>
          <RefreshCcw className="h-4 w-4" />
          {t('common.retry')}
        </Button>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setActiveTab('active')}
          className={`rounded-xl border p-4 text-start transition-colors ${
            activeTab === 'active'
              ? 'border-primary bg-primary/5 text-primary'
              : 'bg-card hover:bg-muted/40'
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 font-semibold">
              <CircleAlert className="h-5 w-5" />
              {t('errorNotebook.active')}
            </span>
            <Badge variant="secondary">{activeCount}</Badge>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('archived')}
          className={`rounded-xl border p-4 text-start transition-colors ${
            activeTab === 'archived'
              ? 'border-primary bg-primary/5 text-primary'
              : 'bg-card hover:bg-muted/40'
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 font-semibold">
              <Archive className="h-5 w-5" />
              {t('errorNotebook.archived')}
            </span>
            <Badge variant="secondary">{archivedCount}</Badge>
          </div>
        </button>
      </div>

      <div className="mb-5 flex flex-wrap items-end gap-3 rounded-xl border bg-card p-4">
        <button type="button" aria-pressed={dueOnly} onClick={() => setDueOnly(value => !value)}
          className={`min-h-10 rounded-lg border px-4 py-2 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${dueOnly ? 'border-primary bg-primary/10 text-primary' : 'bg-background hover:bg-muted/50'}`}>
          {isArabic ? `المراجعة المستحقة (${dueCount})` : `Due for review (${dueCount})`}
        </button>
        {filtersActive && <button type="button" onClick={() => setDueOnly(false)}
          className="min-h-10 rounded-lg px-3 text-sm font-semibold text-primary underline">
          {isArabic ? 'إلغاء التصفية' : 'Clear filters'}
        </button>}
      </div>
      {archiveError && <p role="alert" className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{archiveError}</p>}

      {isLoading || stageLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-56 animate-pulse rounded-2xl border bg-muted/40"
            />
          ))}
        </div>
      ) : isError || stageError ? (
        <Card className="border-destructive/30">
          <CardContent className="p-10 text-center">
            <CircleAlert className="mx-auto mb-3 h-10 w-10 text-destructive" />
            <p className="mb-4 text-muted-foreground">
              {t('common.errorLoadingData')}
            </p>
            <Button onClick={() => { void refetch(); void reloadStage(); }}>{t('common.retry')}</Button>
          </CardContent>
        </Card>
      ) : visibleProblems.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            {activeTab === 'active' ? (
              <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-green-500" />
            ) : (
              <Archive className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            )}
            <h2 className="mb-2 text-xl font-semibold">
              {filtersActive ? (isArabic ? 'لا توجد مسائل مطابقة للتصفية' : 'No matching problems') : activeTab === 'active'
                ? t('errorNotebook.emptyActiveTitle')
                : t('errorNotebook.emptyArchivedTitle')}
            </h2>
            <p className="mx-auto mb-5 max-w-lg text-muted-foreground">
              {filtersActive ? (isArabic ? 'ألغِ تصفية المراجعة المستحقة لعرض بقية أخطاء مرحلتك.' : 'Clear the due-review filter to see the other problems in your stage.') : activeTab === 'active'
                ? t('errorNotebook.emptyActiveDescription')
                : t('errorNotebook.emptyArchivedDescription')}
            </p>
            {filtersActive ? (
              <Button variant="outline" onClick={() => setDueOnly(false)}>
                {isArabic ? 'عرض كل المسائل' : 'Show all problems'}
              </Button>
            ) : activeTab === 'active' && (
              <Button asChild>
                <Link href="/dashboard/categories">{locale === 'ar' ? 'استكشف الفئات' : 'Explore categories'}</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {visibleProblems.map((problem) => (
            <Card key={problem.Id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-5">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="gap-1.5">
                      <StageIconBadge
                        stage={{ Id: problem.StageId, Name: problem.StageName }}
                        size="xs"
                        className="border-0 bg-background/35 shadow-none"
                      />
                      {problem.StageName}
                    </Badge>
                    <Badge variant="outline">{problem.CategoryName}</Badge>
                    <Badge
                      className={
                        problem.MasteryStatus === 'Mastered'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                      }
                    >
                      {getMasteryLabel(problem.MasteryStatus)}
                    </Badge>
                  </div>

                  <Link
                    href={`/dashboard/problems/${problem.Id}?review=1`}
                    className="block text-lg font-semibold transition-colors hover:text-primary"
                  >
                    <RichText text={problem.Title} isArabic={isArabic} />
                  </Link>

                  <div className="mt-5 grid grid-cols-3 gap-2 text-center text-sm">
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-xl font-bold">{problem.AttemptCount}</p>
                      <p className="text-xs text-muted-foreground">
                        {t('errorNotebook.attempts')}
                      </p>
                    </div>
                    <div className="rounded-lg bg-red-50 p-3 dark:bg-red-900/10">
                      <p className="text-xl font-bold text-red-600">
                        {problem.IncorrectAttempts}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t('errorNotebook.incorrect')}
                      </p>
                    </div>
                    <div className="rounded-lg bg-green-50 p-3 dark:bg-green-900/10">
                      <p className="text-xl font-bold text-green-600">
                        {problem.CorrectAttempts}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t('errorNotebook.correct')}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-start gap-2 rounded-lg bg-muted/40 p-3 text-sm">
                    <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <div>
                      <p className="font-medium">{t('errorNotebook.nextReview')}</p>
                      <p className="text-muted-foreground">
                        {formatReviewDate(problem.NextReviewAt)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-muted/20 p-4">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/problems/${problem.Id}?review=1`}>
                      <BookOpen className="me-2 h-4 w-4" />
                      {t('errorNotebook.practiceNow')}
                    </Link>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                    disabled={updatingProblemId === problem.Id}
                    onClick={() => handleArchive(problem)}
                  >
                    {updatingProblemId === problem.Id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : problem.IsArchived ? (
                      <ArchiveRestore className="h-4 w-4" />
                    ) : (
                      <Archive className="h-4 w-4" />
                    )}
                    {problem.IsArchived
                      ? t('errorNotebook.restore')
                      : t('errorNotebook.archive')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
