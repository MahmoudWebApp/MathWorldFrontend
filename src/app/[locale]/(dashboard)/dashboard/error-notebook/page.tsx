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
import {
  type ErrorNotebookProblem,
  useGetErrorNotebookQuery,
  useSetErrorNotebookArchiveMutation,
} from '@/store/api/usersApi';

type NotebookTab = 'active' | 'archived';

export default function ErrorNotebookPage() {
  const t = useTranslations();
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const [activeTab, setActiveTab] = useState<NotebookTab>('active');
  const [updatingProblemId, setUpdatingProblemId] = useState<number | null>(null);

  const {
    data: problems = [],
    isLoading,
    isError,
    refetch,
  } = useGetErrorNotebookQuery({ IncludeArchived: true });

  const [setArchiveStatus] = useSetErrorNotebookArchiveMutation();

  const visibleProblems = useMemo(
    () =>
      problems.filter((problem) =>
        activeTab === 'archived' ? problem.IsArchived : !problem.IsArchived,
      ),
    [problems, activeTab],
  );

  const activeCount = problems.filter((problem) => !problem.IsArchived).length;
  const archivedCount = problems.length - activeCount;

  function getMasteryLabel(status: ErrorNotebookProblem['MasteryStatus']) {
    return t(`problem.mastery.${status}`);
  }

  function formatReviewDate(value: string | null | undefined) {
    if (!value) {
      return t('errorNotebook.noReviewDate');
    }

    return new Intl.DateTimeFormat(locale, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  }

  async function handleArchive(problem: ErrorNotebookProblem) {
    setUpdatingProblemId(problem.Id);

    try {
      await setArchiveStatus({
        ProblemId: problem.Id,
        IsArchived: !problem.IsArchived,
      }).unwrap();
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

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-56 animate-pulse rounded-2xl border bg-muted/40"
            />
          ))}
        </div>
      ) : isError ? (
        <Card className="border-destructive/30">
          <CardContent className="p-10 text-center">
            <CircleAlert className="mx-auto mb-3 h-10 w-10 text-destructive" />
            <p className="mb-4 text-muted-foreground">
              {t('common.errorLoadingData')}
            </p>
            <Button onClick={() => refetch()}>{t('common.retry')}</Button>
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
              {activeTab === 'active'
                ? t('errorNotebook.emptyActiveTitle')
                : t('errorNotebook.emptyArchivedTitle')}
            </h2>
            <p className="mx-auto mb-5 max-w-lg text-muted-foreground">
              {activeTab === 'active'
                ? t('errorNotebook.emptyActiveDescription')
                : t('errorNotebook.emptyArchivedDescription')}
            </p>
            {activeTab === 'active' && (
              <Button asChild>
                <Link href="/stages">{t('hero.browseStages')}</Link>
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
                    <Badge variant="secondary">{problem.StageName}</Badge>
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
                    href={`/problems/${problem.Id}`}
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
                    <Link href={`/problems/${problem.Id}`}>
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
