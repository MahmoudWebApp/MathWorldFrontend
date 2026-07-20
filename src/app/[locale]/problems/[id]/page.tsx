'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useSelector } from 'react-redux';
import {
  ArrowLeft,
  BookOpen,
  CalendarClock,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock3,
  GraduationCap,
  Heart,
  History,
  Loader2,
  Lock,
  NotebookTabs,
  PlayCircle,
  RotateCcw,
  Send,
  Star,
  Target,
  XCircle,
} from 'lucide-react';

import { Link } from '@/i18n/routing';
import type { RootState } from '@/store';
import {
  type AdminProblemOption,
  type AnswerResult,
  type MasteryStatus,
  type OptionForStudent,
  type ProblemAdminDetail,
  type ProblemDetail,
  type ProblemForPublic,
  type ProblemForStudent,
  useGetProblemAttemptsQuery,
  useGetProblemQuery,
  useSubmitAnswerMutation,
} from '@/store/api/problemsApi';
import {
  useCheckFavoriteQuery,
  useToggleFavoriteMutation,
} from '@/store/api/usersApi';
import { Badge } from '@/components/ui/Badge';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { LatexPreview } from '@/components/ui/LatexPreview';
import { RichText } from '@/components/ui/RichText';

function isStudentProblem(
  problem: ProblemDetail | undefined,
): problem is ProblemForStudent {
  return !!problem && 'HasAttempted' in problem && 'Options' in problem;
}

function isPublicProblem(
  problem: ProblemDetail | undefined,
): problem is ProblemForPublic {
  return !!problem && 'Message' in problem && !('Options' in problem);
}

function isAdminProblem(
  problem: ProblemDetail | undefined,
): problem is ProblemAdminDetail {
  return !!problem && 'TitleAr' in problem && 'TitleEn' in problem;
}

function getYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

function YoutubeEmbed({ url }: { url: string }) {
  const videoId = getYouTubeVideoId(url);

  if (!videoId) {
    return null;
  }

  return (
    <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="h-full w-full"
      />
    </div>
  );
}

type OptionState = 'idle' | 'selected' | 'correct' | 'wrong';

function formatDuration(
  seconds: number | null | undefined,
  fallback: string,
  minuteUnit: string,
  secondUnit: string,
) {
  if (seconds === null || seconds === undefined) {
    return fallback;
  }

  if (seconds < 60) {
    return `${seconds} ${secondUnit}`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes} ${minuteUnit} ${remainingSeconds} ${secondUnit}`;
}

export default function ProblemPage() {
  const params = useParams<{ id: string }>();
  const t = useTranslations();
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const problemId = Number.parseInt(params.id, 10);
  const solutionRef = useRef<HTMLDivElement>(null);
  const questionCardRef = useRef<HTMLDivElement>(null);
  const attemptStartedAtRef = useRef(Date.now());

  const {
    data: problem,
    isLoading,
    error,
    refetch: refetchProblem,
  } = useGetProblemQuery(
    { Id: problemId, locale },
    { skip: Number.isNaN(problemId) },
  );

  const studentProblem = isStudentProblem(problem) ? problem : null;
  const adminProblem = isAdminProblem(problem) ? problem : null;

  const {
    data: attemptHistory,
    isFetching: isAttemptHistoryLoading,
    refetch: refetchAttemptHistory,
  } = useGetProblemAttemptsQuery(problemId, {
    skip:
      !isAuthenticated ||
      Number.isNaN(problemId) ||
      !studentProblem?.HasAttempted,
  });

  const { data: favoriteData } = useCheckFavoriteQuery(problemId, {
    skip: !isAuthenticated || Number.isNaN(problemId),
  });

  const [toggleFavorite] = useToggleFavoriteMutation();
  const [submitAnswer, { isLoading: isSubmitting }] =
    useSubmitAnswerMutation();

  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [localAnswerResult, setLocalAnswerResult] =
    useState<AnswerResult | null>(null);
  const [submissionDone, setSubmissionDone] = useState(false);
  const [retryMode, setRetryMode] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [activeTab, setActiveTab] = useState<'question' | 'video'>('question');
  const [historyExpanded, setHistoryExpanded] = useState(false);

  useEffect(() => {
    if (!studentProblem || retryMode) {
      return;
    }

    if (studentProblem.HasAttempted) {
      setSelectedOptionId(studentProblem.SelectedOptionId ?? null);
      setSubmissionDone(true);
      return;
    }

    if (!localAnswerResult) {
      setSelectedOptionId(null);
      setSubmissionDone(false);
      attemptStartedAtRef.current = Date.now();
    }
  }, [studentProblem, localAnswerResult, retryMode]);

  useEffect(() => {
    if (!localAnswerResult || retryMode) {
      return;
    }

    const timer = window.setTimeout(() => {
      solutionRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 200);

    return () => window.clearTimeout(timer);
  }, [localAnswerResult, retryMode]);

  const problemData = useMemo(() => {
    if (!problem) {
      return null;
    }

    if (isAdminProblem(problem)) {
      return {
        title: locale === 'ar' ? problem.TitleAr : problem.TitleEn,
        questionText:
          locale === 'ar' ? problem.QuestionTextAr : problem.QuestionTextEn,
        categoryId: problem.CategoryId,
        categoryName: problem.CategoryName || '',
        stageId: problem.StageId,
        stageName: problem.StageName || '',
        points: problem.Points,
      };
    }

    return {
      title: problem.Title,
      questionText: problem.QuestionText,
      categoryId: problem.CategoryId,
      categoryName: problem.CategoryName,
      stageId: problem.StageId,
      stageName: problem.StageName,
      points: 'Points' in problem ? problem.Points : 0,
    };
  }, [problem, locale]);

  const hasAttempted =
    !!studentProblem &&
    (studentProblem.HasAttempted || submissionDone || !!localAnswerResult);

  const showResult = hasAttempted && !retryMode;

  const effectiveSelectedOptionId = retryMode
    ? selectedOptionId
    : (localAnswerResult?.SelectedOptionId ??
      selectedOptionId ??
      studentProblem?.SelectedOptionId ??
      null);

  const isCorrect =
    localAnswerResult?.IsCorrect ??
    studentProblem?.WasCorrect ??
    studentProblem?.IsSolved ??
    false;

  const effectiveCorrectOptionId = showResult && isCorrect
    ? (localAnswerResult?.CorrectOptionId ??
      studentProblem?.CorrectOptionId ??
      null)
    : null;

  const canRetry =
    localAnswerResult?.CanRetry ?? studentProblem?.CanRetry ?? false;

  const canAnswer =
    isAuthenticated &&
    !!studentProblem &&
    (!hasAttempted || (retryMode && canRetry));

  const currentMastery =
    localAnswerResult?.MasteryStatus ??
    attemptHistory?.MasteryStatus ??
    studentProblem?.MasteryStatus ??
    'New';

  const currentAttemptCount =
    localAnswerResult?.TotalAttempts ??
    attemptHistory?.TotalAttempts ??
    studentProblem?.AttemptCount ??
    0;

  const bestTime =
    localAnswerResult?.BestTimeSeconds ??
    attemptHistory?.BestTimeSeconds ??
    studentProblem?.BestTimeSeconds ??
    null;

  const averageTime =
    attemptHistory?.AverageTimeSeconds ??
    studentProblem?.AverageTimeSeconds ??
    null;

  const nextReviewAt =
    localAnswerResult?.NextReviewAt ??
    attemptHistory?.NextReviewAt ??
    studentProblem?.NextReviewAt ??
    null;

  const isInErrorNotebook =
    localAnswerResult?.IsInErrorNotebook ??
    attemptHistory?.IsInErrorNotebook ??
    studentProblem?.IsInErrorNotebook ??
    false;

  const solutionText = useMemo(() => {
    if (retryMode) {
      return null;
    }

    if (adminProblem) {
      return locale === 'ar'
        ? adminProblem.DetailedSolutionAr
        : adminProblem.DetailedSolutionEn;
    }

    if (!isCorrect) {
      return null;
    }

    if (localAnswerResult?.DetailedSolution) {
      return localAnswerResult.DetailedSolution;
    }

    return studentProblem?.DetailedSolution ?? null;
  }, [
    localAnswerResult,
    studentProblem,
    adminProblem,
    locale,
    retryMode,
    isCorrect,
  ]);

  const youtubeUrl = useMemo(() => {
    if (retryMode || (!adminProblem && !isCorrect)) {
      return null;
    }

    const value =
      localAnswerResult?.YoutubeSolutionUrl ||
      studentProblem?.YoutubeSolutionUrl ||
      adminProblem?.YoutubeSolutionUrl;

    if (!value || !getYouTubeVideoId(value)) {
      return null;
    }

    return value;
  }, [
    localAnswerResult,
    studentProblem,
    adminProblem,
    retryMode,
    isCorrect,
  ]);

  const showSolutionSection =
    !!solutionText && (showResult || !!adminProblem);
  const showVideoTab = !!youtubeUrl && (showResult || !!adminProblem);
  const isFavorite =
    favoriteData?.IsFavorite ?? studentProblem?.IsFavorite ?? false;

  function getMasteryLabel(status: MasteryStatus) {
    return t(`problem.mastery.${status}`);
  }

  function formatDate(value: string | null | undefined) {
    if (!value) {
      return t('common.unknown');
    }

    return new Intl.DateTimeFormat(locale, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  }

  async function handleFavorite() {
    if (!problem) {
      return;
    }

    try {
      await toggleFavorite({
        ProblemId: problem.Id,
        IsFavorite: !isFavorite,
      }).unwrap();
      await refetchProblem();
    } catch (favoriteError) {
      console.error('Failed to update favorite:', favoriteError);
    }
  }

  function handleStartRetry() {
    if (!canRetry) {
      return;
    }

    setRetryMode(true);
    setSubmissionDone(false);
    setLocalAnswerResult(null);
    setSelectedOptionId(null);
    setSubmitError('');
    setActiveTab('question');
    attemptStartedAtRef.current = Date.now();

    window.setTimeout(() => {
      questionCardRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 50);
  }

  function handleCancelRetry() {
    setRetryMode(false);
    setSubmissionDone(true);
    setLocalAnswerResult(null);
    setSelectedOptionId(studentProblem?.SelectedOptionId ?? null);
    setSubmitError('');
  }

  async function handleSubmit() {
    if (
      !studentProblem ||
      !canAnswer ||
      isSubmitting ||
      effectiveSelectedOptionId === null
    ) {
      return;
    }

    setSubmitError('');

    try {
      const result = await submitAnswer({
        ProblemId: studentProblem.Id,
        SelectedOptionId: effectiveSelectedOptionId,
        TimeSpentSeconds: Math.max(
          0,
          Math.floor((Date.now() - attemptStartedAtRef.current) / 1000),
        ),
      }).unwrap();

      setLocalAnswerResult(result);
      setSelectedOptionId(result.SelectedOptionId);
      setSubmissionDone(true);
      setRetryMode(false);
      setHistoryExpanded(true);

      await refetchProblem();

      if (studentProblem.HasAttempted) {
        await refetchAttemptHistory();
      }
    } catch (submitFailure) {
      const normalized = submitFailure as {
        data?: { message?: string };
      };

      setSubmitError(normalized.data?.message || t('common.error'));
    }
  }

  function getOptionState(option: OptionForStudent): OptionState {
    const isSelected = effectiveSelectedOptionId === option.Id;

    if (!showResult) {
      return isSelected ? 'selected' : 'idle';
    }

    if (effectiveCorrectOptionId === option.Id) {
      return 'correct';
    }

    if (isSelected && !isCorrect) {
      return 'wrong';
    }

    if (isSelected && isCorrect) {
      return 'correct';
    }

    return 'idle';
  }

  if (isLoading) {
    return (
      <div className="container mx-auto animate-pulse px-4 py-8 md:px-16 lg:px-24">
        <div className="mb-8 h-6 w-48 rounded bg-muted" />
        <div className="mb-4 h-10 w-3/4 rounded bg-muted" />
        <div className="mb-8 flex gap-2">
          <div className="h-6 w-16 rounded-full bg-muted" />
          <div className="h-6 w-24 rounded-full bg-muted" />
        </div>
        <div className="h-40 rounded-xl bg-muted" />
      </div>
    );
  }

  if (error || !problem || !problemData) {
    return (
      <div className="container mx-auto px-4 py-8 text-center md:px-16 lg:px-24">
        <XCircle className="mx-auto mb-4 h-12 w-12 text-destructive/70" />
        <p className="mb-4 text-lg text-muted-foreground">
          {t('errors.problemNotFound')}
        </p>
        <Link
          href="/problems"
          className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          {t('problem.backToProblems')}
        </Link>
      </div>
    );
  }

  const {
    title,
    questionText,
    categoryId,
    categoryName,
    stageId,
    stageName,
    points,
  } = problemData;

  return (
    <div className="container mx-auto px-4 py-8 md:px-16 lg:px-24">
      <Breadcrumbs
        surface
        className="mb-6"
        items={[
          { label: t('nav.home'), href: '/' },
          { label: t('nav.stages'), href: '/stages' },
          ...(stageName
            ? [
                {
                  label: stageName,
                  href: `/problems?stageId=${stageId}`,
                },
              ]
            : []),
          ...(categoryName
            ? [
                {
                  label: categoryName,
                  href: `/problems?stageId=${stageId}&categoryId=${categoryId}`,
                },
              ]
            : []),
          { label: title, truncate: true },
        ]}
      />

      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h1
            className={`brand-display-title mb-3 text-3xl font-bold sm:text-4xl ${
              isArabic ? 'text-right' : 'text-left'
            }`}
          >
            <RichText
              text={title}
              isArabic={isArabic}
              className="text-inherit"
            />
          </h1>

          <div
            className={`flex flex-wrap items-center gap-2 ${
              isArabic ? 'justify-end' : 'justify-start'
            }`}
          >
            {points > 0 && (
              <Badge
                variant="outline"
                className="gap-1 border-primary/30 bg-primary/5 text-primary"
              >
                <Star className="h-4 w-4 fill-primary/20 text-primary/70" />
                <span className="font-semibold">{points}</span>
              </Badge>
            )}

            {stageName && (
              <Badge className="gap-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                <GraduationCap className="h-3.5 w-3.5" />
                {stageName}
              </Badge>
            )}

            {categoryName && (
              <Badge variant="secondary">{categoryName}</Badge>
            )}

            {studentProblem?.HasAttempted && (
              <Badge variant="outline" className="gap-1">
                <Target className="h-3.5 w-3.5" />
                {getMasteryLabel(currentMastery)}
              </Badge>
            )}
          </div>
        </div>

        {isAuthenticated && studentProblem && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleFavorite}
            aria-label={
              isFavorite
                ? t('favorites.removeFromFavorites')
                : t('favorites.addToFavorites')
            }
            className={
              isFavorite
                ? 'text-red-500 hover:text-red-600'
                : 'text-muted-foreground hover:text-foreground'
            }
          >
            <Heart
              className={`h-5 w-5 transition-transform ${
                isFavorite ? 'scale-110 fill-current' : ''
              }`}
            />
          </Button>
        )}
      </div>

      {studentProblem?.HasAttempted && (
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="rounded-xl border bg-card p-4">
            <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
              <History className="h-4 w-4" />
              {t('problem.totalAttempts')}
            </div>
            <p className="text-xl font-bold">{currentAttemptCount}</p>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
              <Clock3 className="h-4 w-4" />
              {t('problem.bestTime')}
            </div>
            <p className="text-xl font-bold">
              {formatDuration(
                bestTime,
                t('common.noData'),
                t('problem.minutesShort'),
                t('problem.secondsShort'),
              )}
            </p>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
              <Clock3 className="h-4 w-4" />
              {t('problem.averageTime')}
            </div>
            <p className="text-xl font-bold">
              {formatDuration(
                averageTime,
                t('common.noData'),
                t('problem.minutesShort'),
                t('problem.secondsShort'),
              )}
            </p>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarClock className="h-4 w-4" />
              {t('problem.nextReview')}
            </div>
            <p className="text-sm font-semibold">
              {nextReviewAt ? formatDate(nextReviewAt) : t('problem.noReviewScheduled')}
            </p>
          </div>
        </div>
      )}

      {retryMode && (
        <div className="mb-6 flex flex-col gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-primary">
              {t('problem.trainingModeTitle')}
            </p>
            <p className="text-sm text-muted-foreground">
              {t('problem.trainingModeDescription')}
            </p>
          </div>
          <Button variant="outline" onClick={handleCancelRetry}>
            {t('common.cancel')}
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8">
        <div
          ref={questionCardRef}
          className="scroll-mt-20 overflow-hidden rounded-2xl border bg-card shadow-sm"
        >
          {showVideoTab && (
            <div className="flex border-b">
              <button
                type="button"
                onClick={() => setActiveTab('question')}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'question'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <BookOpen className="h-4 w-4" />
                {t('problem.question')}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('video')}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'video'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <PlayCircle className="h-4 w-4" />
                {t('problem.videoSolution')}
              </button>
            </div>
          )}

          {activeTab === 'question' && (
            <div className="p-6">
              <RichText
                text={questionText}
                isArabic={isArabic}
                className="mb-6 text-lg"
              />

              {!isAuthenticated && isPublicProblem(problem) && (
                <div className="border-t py-8 text-center">
                  <Lock className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                  <p className="mb-4 text-muted-foreground">
                    {problem.Message || t('problem.loginToSolve')}
                  </p>
                  <Button asChild>
                    <Link href="/login">{t('nav.login')}</Link>
                  </Button>
                </div>
              )}

              {studentProblem && (
                <div className="relative" aria-busy={isSubmitting}>
                  <div aria-live="polite" aria-atomic="true">
                    {isSubmitting && (
                      <div
                        role="status"
                        className="mb-5 flex items-center gap-3 rounded-xl border border-[#8FC9E0] bg-[#EAF7FB] p-4 text-[#214F6A] shadow-sm dark:border-[#3C728B] dark:bg-[#102D40] dark:text-[#BFE8F6]"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#53B2D826]">
                          <Loader2 className="h-5 w-5 animate-spin text-[#2F73A3] dark:text-[#78CBE8]" />
                        </div>
                        <div>
                          <p className="font-semibold">
                            {t('problem.checkingAnswer')}
                          </p>
                          <p className="mt-0.5 text-sm opacity-80">
                            {t('problem.checkingAnswerHint')}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mb-6 space-y-3">
                    {studentProblem.Options.map((option) => {
                      const optionState = getOptionState(option);
                      const isOptionDisabled = !canAnswer || isSubmitting;

                      return (
                        <label
                          key={option.Id}
                          className={`flex items-start gap-3 rounded-xl border p-4 transition-all ${
                            optionState === 'correct'
                              ? 'border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                              : optionState === 'wrong'
                                ? 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                                : optionState === 'selected'
                                  ? 'border-primary bg-primary/5'
                                  : 'hover:border-primary/50'
                          } ${
                            isOptionDisabled
                              ? 'cursor-default opacity-90'
                              : 'cursor-pointer'
                          }`}
                        >
                          {canAnswer && (
                            <input
                              type="radio"
                              name="option"
                              value={option.Id}
                              checked={effectiveSelectedOptionId === option.Id}
                              onChange={() => setSelectedOptionId(option.Id)}
                              disabled={isOptionDisabled}
                              className="mt-1.5 accent-primary disabled:opacity-50"
                            />
                          )}

                          {optionState === 'correct' && (
                            <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                          )}
                          {optionState === 'wrong' && (
                            <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                          )}

                          <div className="min-w-0 flex-1">
                            <LatexPreview
                              latex={option.LatexCode}
                              className="mt-1"
                            />
                          </div>
                        </label>
                      );
                    })}
                  </div>

                  {submitError && (
                    <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                      {submitError}
                    </div>
                  )}

                  {canAnswer && (
                    <div className="flex justify-end">
                      <Button
                        onClick={handleSubmit}
                        disabled={
                          isSubmitting || effectiveSelectedOptionId === null
                        }
                        className="gap-2 transition-all"
                        size="lg"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {t('problem.checkingAnswer')}
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 rtl:rotate-180" />
                            {retryMode
                              ? t('problem.submitTrainingAttempt')
                              : t('problem.submit')}
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {showResult && (
                    <div
                      className={`mt-6 animate-in rounded-xl border p-5 duration-300 fade-in zoom-in ${
                        isCorrect
                          ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                          : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                      }`}
                    >
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          {isCorrect ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                          <span className="font-semibold">
                            {isCorrect
                              ? t('problem.correct')
                              : t('problem.wrong')}
                          </span>
                        </div>

                        {localAnswerResult && (
                          <Badge variant="outline">
                            {localAnswerResult.IsOfficialAttempt
                              ? t('problem.officialAttempt')
                              : t('problem.trainingAttempt')}
                          </Badge>
                        )}
                      </div>

                      {!isCorrect && (
                        <p className="mt-2 text-sm leading-relaxed text-red-700 dark:text-red-300">
                          {t('problem.retryWithoutReveal')}
                        </p>
                      )}

                      {localAnswerResult && (
                        <div className="mt-4 flex flex-wrap gap-2 text-sm">
                          <Badge variant="secondary">
                            {t('problem.attemptNumber', {
                              number: localAnswerResult.AttemptNumber,
                            })}
                          </Badge>
                          <Badge variant="secondary">
                            {formatDuration(
                              localAnswerResult.AttemptTimeSeconds,
                              t('common.noData'),
                              t('problem.minutesShort'),
                              t('problem.secondsShort'),
                            )}
                          </Badge>
                          {localAnswerResult.PointsEarned > 0 && (
                            <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                              +{localAnswerResult.PointsEarned}{' '}
                              {t('dashboard.user.totalPoints')}
                            </Badge>
                          )}
                        </div>
                      )}

                      {canRetry && (
                        <div className="mt-5 flex flex-wrap items-center gap-3">
                          <Button
                            variant="outline"
                            className="gap-2"
                            onClick={handleStartRetry}
                          >
                            <RotateCcw className="h-4 w-4" />
                            {t('problem.tryAgain')}
                          </Button>

                          {isInErrorNotebook && (
                            <Link
                              href="/dashboard/error-notebook"
                              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                            >
                              <NotebookTabs className="h-4 w-4" />
                              {t('problem.openErrorNotebook')}
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {adminProblem && (
                <div className="mt-6 space-y-3">
                  {adminProblem.Options.map((option: AdminProblemOption) => (
                    <div
                      key={`${option.Order}-${option.LatexCode}`}
                      className={`flex items-start gap-3 rounded-xl border p-4 ${
                        option.IsCorrect
                          ? 'border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                          : ''
                      }`}
                    >
                      {option.IsCorrect && (
                        <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                      )}
                      <LatexPreview latex={option.LatexCode} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'video' && showVideoTab && youtubeUrl && (
            <div className="p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <PlayCircle className="h-5 w-5" />
                {t('problem.videoSolution')}
              </h3>
              <YoutubeEmbed url={youtubeUrl} />
            </div>
          )}
        </div>

        {showSolutionSection && solutionText && (
          <div
            ref={solutionRef}
            id="solution-section"
            className="scroll-mt-20 animate-in rounded-2xl border border-green-200 bg-green-50/30 p-6 shadow-sm duration-500 fade-in slide-in-from-bottom-4 dark:bg-green-900/10"
          >
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-green-800 dark:text-green-300">
              <CheckCircle className="h-5 w-5" />
              {t('problem.solution')}
            </h3>
            <RichText text={solutionText} isArabic={isArabic} />
          </div>
        )}

        {studentProblem?.HasAttempted && (
          <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
            <button
              type="button"
              onClick={() => setHistoryExpanded((value) => !value)}
              className="flex w-full items-center justify-between gap-3 p-5 text-start hover:bg-muted/40"
            >
              <span className="flex items-center gap-2 font-semibold">
                <History className="h-5 w-5 text-primary" />
                {t('problem.attemptHistory')}
              </span>
              {historyExpanded ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </button>

            {historyExpanded && (
              <div className="border-t p-5">
                {isAttemptHistoryLoading ? (
                  <div className="flex items-center justify-center py-8 text-muted-foreground">
                    <Loader2 className="me-2 h-5 w-5 animate-spin" />
                    {t('common.loading')}
                  </div>
                ) : attemptHistory?.Attempts.length ? (
                  <div className="space-y-3">
                    {attemptHistory.Attempts.map((attempt) => (
                      <div
                        key={attempt.Id}
                        className={`rounded-xl border p-4 ${
                          attempt.IsCorrect
                            ? 'border-green-200 bg-green-50/40 dark:border-green-900 dark:bg-green-900/10'
                            : 'border-red-200 bg-red-50/40 dark:border-red-900 dark:bg-red-900/10'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-2">
                            {attempt.IsCorrect ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-600" />
                            )}
                            <span className="font-semibold">
                              {t('problem.attemptNumber', {
                                number: attempt.AttemptNumber,
                              })}
                            </span>
                            <Badge variant="outline">
                              {attempt.IsOfficial
                                ? t('problem.officialAttempt')
                                : t('problem.trainingAttempt')}
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(attempt.SubmittedAt)}
                          </span>
                        </div>

                        <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                          <div>
                            <span className="text-muted-foreground">
                              {t('problem.selectedAnswer')}:
                            </span>
                            <div className="mt-1">
                              <LatexPreview latex={attempt.SelectedOptionText} />
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                            <Badge variant="secondary">
                              <Clock3 className="me-1 h-3.5 w-3.5" />
                              {formatDuration(
                                attempt.TimeSpentSeconds,
                                t('common.noData'),
                                t('problem.minutesShort'),
                                t('problem.secondsShort'),
                              )}
                            </Badge>
                            {attempt.PointsEarned > 0 && (
                              <Badge variant="secondary">
                                +{attempt.PointsEarned}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="py-6 text-center text-muted-foreground">
                    {t('problem.noAttemptHistory')}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
