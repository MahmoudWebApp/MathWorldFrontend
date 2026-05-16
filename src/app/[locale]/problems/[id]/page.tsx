'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useGetProblemQuery, useSubmitAnswerMutation } from '@/store/api/problemsApi';
import { useToggleFavoriteMutation, useCheckFavoriteQuery } from '@/store/api/usersApi';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LatexPreview } from '@/components/ui/LatexPreview';
import type { ProblemDetail, ProblemForStudent, ProblemForPublic, ProblemAdminDetail } from '@/store/api/problemsApi';

import {
  ArrowLeft,
  Heart,
  BookOpen,
  CheckCircle,
  XCircle,
  Send,
  Loader2,
  GraduationCap,
  Lock,
  PlayCircle,
  Star,
} from 'lucide-react';

/* ────────────────────────────────────────────
   TYPE GUARDS
   ──────────────────────────────────────────── */

function isStudentProblem(problem: ProblemDetail | undefined): problem is ProblemForStudent {
  return !!problem && 'Options' in problem && 'IsSolved' in problem;
}

function isPublicProblem(problem: ProblemDetail | undefined): problem is ProblemForPublic {
  return !!problem && 'Message' in problem && !('Options' in problem);
}

function isAdminProblem(problem: ProblemDetail | undefined): problem is ProblemAdminDetail {
  return (
    !!problem &&
    'TitleAr' in problem &&
    'TitleEn' in problem &&
    'Options' in problem &&
    Array.isArray((problem as ProblemAdminDetail).Options)
  );
}

/* ────────────────────────────────────────────
   YOUTUBE EMBED COMPONENT
   ──────────────────────────────────────────── */

function YoutubeEmbed({ url }: { url: string }) {
  const getVideoId = (youtubeUrl: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
    ];
    for (const pattern of patterns) {
      const match = youtubeUrl.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const videoId = getVideoId(url);
  if (!videoId) return null;

  return (
    <div className="aspect-video w-full rounded-xl overflow-hidden bg-black">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
      />
    </div>
  );
}

/* ────────────────────────────────────────────
   SOLUTION TEXT HELPER
   ──────────────────────────────────────────── */

function SolutionText({ text, isArabic }: { text: string; isArabic: boolean }) {
  const TOKEN = /(\$\$[\s\S]+?\$\$|\$[^\n$]+?\$)/g
  const parts = text.split(TOKEN)

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className={`prose max-w-none text-lg leading-loose ${
        isArabic ? 'text-right' : 'text-left'
      }`}
    >
      {parts.map((part, i) => {
        if (part.startsWith('$$') && part.endsWith('$$')) {
          return <LatexPreview key={i} latex={part.slice(2, -2).trim()} block />
        }
        if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
          return <LatexPreview key={i} latex={part.slice(1, -1).trim()} />
        }
        return <span key={i}>{part}</span>
      })}
    </div>
  )
}

/* ────────────────────────────────────────────
   MAIN COMPONENT
   ──────────────────────────────────────────── */

export default function ProblemPage() {
  const { id } = useParams();
  const t = useTranslations();
  const locale = useLocale();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const problemId = parseInt(id as string);
  const solutionRef = useRef<HTMLDivElement>(null);

  // ── API hooks ──────────────────────────────
  const { data: problem, isLoading, error, refetch: refetchProblem } = useGetProblemQuery(problemId, {
    skip: isNaN(problemId),
  });

  const { data: favoriteData, refetch: refetchFavorite } = useCheckFavoriteQuery(problemId, {
    skip: !isAuthenticated || isNaN(problemId),
  });

  const [toggleFavorite] = useToggleFavoriteMutation();
  const [submitAnswer, { isLoading: isSubmitting, data: answerResult }] = useSubmitAnswerMutation();

  // ── Local state ────────────────────────────
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [submissionDone, setSubmissionDone] = useState(false);

  const [activeTab, setActiveTab] = useState<'question' | 'video'>('question');
  const [startTime] = useState(Date.now());

  // ── Auto-scroll to solution ──
  useEffect(() => {
    if (answerResult?.IsCorrect || (isStudentProblem(problem) && problem.IsSolved)) {
      setTimeout(() => {
        solutionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
    }
  }, [answerResult, problem]);

  // ── Derived data ───────────────────────────
  const problemData = useMemo(() => {
    if (!problem) return null;
    let title: string;
    let questionText: string;
    let categoryName: string;
    let tags: string[] = [];
    let points: number = 0;

    if (isAdminProblem(problem)) {
      title = locale === 'ar' ? problem.TitleAr : problem.TitleEn;
      questionText = locale === 'ar' ? problem.QuestionTextAr : problem.QuestionTextEn;
      categoryName = '';
      tags = problem.Tags.map((tag: any) => locale === 'ar' ? tag.TextAr : tag.TextEn);
    } else if (isStudentProblem(problem)) {
      title = problem.Title;
      questionText = problem.QuestionText;
      categoryName = problem.CategoryName;
      tags = problem.Tags;
    } else {
      const pub = problem as ProblemForPublic;
      title = pub.Title;
      questionText = pub.QuestionText;
      categoryName = pub.CategoryName;
      tags = pub.Tags;
    }

    if ('Points' in problem) {
      points = (problem as any).Points;
    }

    return { title, questionText, categoryName, tags, points };
  }, [problem, locale]);

  const stageName = useMemo(() => {
    if (!problem) return '';
    if ('StageName' in problem) return (problem as any).StageName;
    if ('StageId' in problem) return `Stage ${(problem as any).StageId}`;
    return '';
  }, [problem]);

  const solutionText = useMemo(() => {
    if (answerResult?.DetailedSolution) return answerResult.DetailedSolution;
    if (isStudentProblem(problem)) return problem.DetailedSolution;
    if (isAdminProblem(problem)) {
      return locale === 'ar' ? problem.DetailedSolutionAr : problem.DetailedSolutionEn;
    }
    return null;
  }, [problem, answerResult, locale]);

  const youtubeUrl = useMemo(() => {
    const url =
      answerResult?.YoutubeSolutionUrl ||
      (isStudentProblem(problem) ? problem.YoutubeSolutionUrl : null) ||
      (isAdminProblem(problem) ? problem.YoutubeSolutionUrl : null);

    if (!url) return null;
    if (!url.includes('youtube') && !url.includes('youtu.be')) return null;
    return url;
  }, [problem, answerResult]);

  // ── Safe access ──
  const problemIsSolved = isStudentProblem(problem) ? problem.IsSolved : false;
  const canAnswer =
    isAuthenticated &&
    isStudentProblem(problem) &&
    !problemIsSolved &&
    !submissionDone &&
    !answerResult;

  const showResult = !!(answerResult || problemIsSolved);
  const isCorrect = answerResult?.IsCorrect ?? problemIsSolved;

  const showSolutionSection =
    (solutionText || youtubeUrl) && (isCorrect || isAdminProblem(problem));

  const showVideoTab = isAuthenticated && !!youtubeUrl;

  // ── Handlers ───────────────────────────────

  /**
   * Toggle favorite status for the current problem.
   * The optimistic update in usersApi.ts handles instant UI feedback.
   * No need for manual refetch here since the cache is already updated.
   */
  const handleFavorite = async () => {
    if (!problem) return;
    try {
      // Toggle favorite - the optimistic update in usersApi.ts will
      // update the cache immediately, so the heart icon changes color right away
      await toggleFavorite({
        ProblemId: problem.Id,
        IsFavorite: !favoriteData?.IsFavorite,
      }).unwrap();

      // Optional: refetch problem to sync any related data (e.g., favorite count)
      // This is non-blocking and won't affect the instant UI feedback
      refetchProblem();
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
      // If the mutation fails, the optimistic update is automatically
      // rolled back by onQueryStarted in usersApi.ts
    }
  };

  const handleSubmit = async () => {
    if (!selectedOptionId || !problem || submissionDone) return;
    const timeSpentSeconds = Math.floor((Date.now() - startTime) / 1000);
    setSubmissionDone(true);
    try {
      await submitAnswer({
        ProblemId: problem.Id,
        SelectedOptionId: selectedOptionId,
        TimeSpentSeconds: timeSpentSeconds,
      }).unwrap();
    } catch (err) {
      console.error('Submit failed:', err);
      setSubmissionDone(false);
    }
  };

  // ── Early returns ──────────────────────────
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 md:px-16 lg:px-24 animate-pulse">
        <div className="h-6 w-48 bg-muted rounded mb-8" />
        <div className="h-10 w-3/4 bg-muted rounded mb-4" />
        <div className="flex gap-2 mb-8">
          <div className="h-6 w-16 bg-muted rounded-full" />
          <div className="h-6 w-24 bg-muted rounded-full" />
        </div>
        <div className="h-40 bg-muted rounded-xl" />
      </div>
    );
  }

  if (error || !problem || !problemData) {
    return (
      <div className="container mx-auto px-4 py-8 text-center md:px-16 lg:px-24">
        <XCircle className="mx-auto h-12 w-12 text-destructive/70 mb-4" />
        <p className="text-muted-foreground text-lg mb-4">{t('errors.problemNotFound')}</p>
        <Link href="/problems" className="inline-flex items-center gap-1 text-primary font-medium hover:underline">
          <ArrowLeft className="h-4 w-4" />
          {t('problem.backToProblems')}
        </Link>
      </div>
    );
  }

  const { title, questionText, categoryName, tags, points } = problemData;
  const isArabic = locale === 'ar';

  const getOptionState = (option: { Id: number; Text: string; IsCorrect?: boolean }) => {
    const isSelected = selectedOptionId === option.Id;
    const showCorrectness = submissionDone || problemIsSolved;

    if (!showCorrectness) return isSelected ? 'selected' : 'idle';

    const isCorrectOption =
      option.IsCorrect === true ||
      (answerResult?.CorrectOptionText === option.Text);

    if (isCorrectOption) return 'correct';
    if (isSelected && !isCorrect) return 'wrong';
    return 'idle';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/problems" className="flex items-center gap-1 hover:text-primary transition-colors">
          <ArrowLeft className="h-4 w-4" />
          {t('problem.backToProblems')}
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium truncate max-w-[200px]">{title}</span>
      </div>

      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className={`text-3xl sm:text-4xl font-bold mb-3 ${isArabic ? 'text-right' : 'text-left'}`}>
            {title}
          </h1>
          <div className={`flex flex-wrap items-center gap-2 ${isArabic ? 'justify-end' : 'justify-start'}`}>
            {points > 0 && (
              <Badge variant="outline" className="gap-1 border-primary/30 bg-primary/5 text-primary">
                <Star className="h-4 w-4 text-primary/70 fill-primary/20" />
                <span className="font-semibold">{points}</span>
              </Badge>
            )}
            {stageName && (
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 gap-1">
                <GraduationCap className="h-3.5 w-3.5" />
                {stageName}
              </Badge>
            )}
            {categoryName && <Badge variant="secondary">{categoryName}</Badge>}
            {tags.map((tag, idx) => (
              <Badge key={idx} variant="outline">{tag}</Badge>
            ))}
          </div>
        </div>

        {isAuthenticated && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleFavorite}
            className={favoriteData?.IsFavorite ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-foreground'}
          >
            <Heart className={`h-5 w-5 transition-transform ${favoriteData?.IsFavorite ? 'fill-current scale-110' : ''}`} />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* ═══════════════════════════
            TABS: Question | Video
            ═══════════════════════════ */}
        <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">

          {showVideoTab && (
            <div className="flex border-b">
              <button
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

          {/* ── Question Tab ── */}
          {activeTab === 'question' && (
            <div className="p-6">
              <div className={`prose max-w-none leading-relaxed dark:prose-invert mb-6 ${isArabic ? 'text-right' : 'text-left'}`}>
                <p className="text-lg">{questionText}</p>
                {'LatexCode' in problem && problem.LatexCode && (
                  <div className="mt-4">
                    <LatexPreview latex={problem.LatexCode} block />
                  </div>
                )}
              </div>


              {!isAuthenticated && isPublicProblem(problem) && (
                <div className="text-center py-8 border-t">
                  <Lock className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground mb-4">
                    {(problem as ProblemForPublic).Message || t('problem.loginToSolve')}
                  </p>
                  <Button asChild>
                    <Link href="/login">{t('nav.login')}</Link>
                  </Button>
                </div>
              )}

              {isAuthenticated && isStudentProblem(problem) && (
                <>
                  <div className="space-y-3 mb-6">
                    {problem.Options.map((option) => {
                      const state = getOptionState(option);
                      return (
                        <label
                          key={option.Id}
                          className={`flex items-start gap-3 rounded-xl border p-4 transition-all ${
                            state === 'correct'
                              ? 'bg-green-50 border-green-300 dark:bg-green-900/20 dark:border-green-800'
                              : state === 'wrong'
                              ? 'bg-red-50 border-red-300 dark:bg-red-900/20 dark:border-red-800'
                              : state === 'selected'
                              ? 'border-primary bg-primary/5'
                              : 'hover:border-primary/50 cursor-pointer'
                          } ${!canAnswer ? 'cursor-default' : ''}`}
                        >
                          {canAnswer && (
                            <input
                              type="radio"
                              name="option"
                              value={option.Id}
                              checked={selectedOptionId === option.Id}
                              onChange={() => setSelectedOptionId(option.Id)}
                              className="mt-1.5 accent-primary"
                            />
                          )}
                          {state === 'correct' && (
                            <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                          )}
                          {state === 'wrong' && (
                            <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <div className="text-base">{option.Text}</div>
                            {option.LatexCode && (
                              <LatexPreview latex={option.LatexCode} className="mt-1" />
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>

                  {canAnswer && (
                    <div className="flex justify-end">
                      <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !selectedOptionId}
                        className="gap-2"
                        size="lg"
                      >
                        {isSubmitting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            {t('problem.submit')}
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {showResult && (
                    <div className={`mt-6 rounded-xl p-5 ${
                      isCorrect
                        ? 'bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800'
                        : 'bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        {isCorrect
                          ? <CheckCircle className="h-5 w-5 text-green-600" />
                          : <XCircle className="h-5 w-5 text-red-600" />}
                        <span className="font-semibold">
                          {isCorrect ? t('problem.correct') : t('problem.wrong')}
                        </span>
                      </div>
                      {!isCorrect && answerResult?.CorrectOptionText && (
                        <p className="text-sm text-red-700 dark:text-red-300">
                          {t('problem.correctAnswerWas')}: {answerResult.CorrectOptionText}
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}


          {activeTab === 'video' && showVideoTab && youtubeUrl && (
            <div className="p-6">
              <h3 className={`text-lg font-semibold flex items-center gap-2 mb-4 ${isArabic ? 'flex-row-reverse' : ''}`}>
                <PlayCircle className="h-5 w-5" />
                {t('problem.videoSolution')}
              </h3>
              <YoutubeEmbed url={youtubeUrl} />
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════
            SOLUTION SECTION
            ═══════════════════════════════════════ */}
        {showSolutionSection && solutionText && (
          <div
            ref={solutionRef}
            id="solution-section"
            className="rounded-2xl border border-green-200 bg-green-50/30 dark:bg-green-900/10 shadow-sm p-6 scroll-mt-20"
          >
            <h3 className={`text-lg font-semibold flex items-center gap-2 mb-4 text-green-800 dark:text-green-300 `}>
              <CheckCircle className="h-5 w-5" />
              {t('problem.solution')}
            </h3>
            <SolutionText text={solutionText} isArabic={isArabic} />
          </div>
        )}
      </div>
    </div>
  );
}
