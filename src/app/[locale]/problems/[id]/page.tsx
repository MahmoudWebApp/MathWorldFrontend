"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useSelector } from "react-redux";
import {
  BookOpen,
  CheckCircle,
  Heart,
  Loader2,
  Lock,
  NotebookTabs,
  PlayCircle,
  RotateCcw,
  Send,
  Star,
  Target,
  XCircle,
} from "lucide-react";

import { Link, usePathname, useRouter } from "@/i18n/routing";
import { useGetDailyChallengeQuery } from "@/store/api/stagesApi";
import type { RootState } from "@/store";
import {
  type AdminProblemOption,
  type AnswerResult,
  type MasteryStatus,
  type OptionForStudent,
  type ProblemAdminDetail,
  type ProblemDetail,
  type ProblemForPublic,
  type ProblemForStudent,
  useGetProblemDiagramQuery,
  useGetProblemQuery,
  useLazyGetPremiumSolutionQuery,
  useLazyGetSolutionPreviewQuery,
  useSubmitAnswerMutation,
} from "@/store/api/problemsApi";
import {
  useCheckFavoriteQuery,
  useToggleFavoriteMutation,
  useGetStudentEntitlementQuery,
} from "@/store/api/usersApi";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { StudentStageAccessNotice } from "@/components/stages/StudentStageAccessNotice";
import { LockedPremiumDialog } from "@/components/premium/LockedPremiumDialog";
import { DirectionalArrow } from "@/components/ui/DirectionalNavigation";
import { Button } from "@/components/ui/Button";
import { LatexPreview } from "@/components/ui/LatexPreview";
import { RichText } from "@/components/ui/RichText";
import { StageIconBadge } from "@/components/stages/StageIconBadge";
import { getStageAccent } from "@/lib/stageVisuals";
import { GeometryDiagram, isGeometryScene } from "@/components/math/GeometryDiagram";
import { AdminGeometryEditor } from "@/components/admin/AdminGeometryEditor";

function isStudentProblem(
  problem: ProblemDetail | undefined,
): problem is ProblemForStudent {
  return !!problem && "HasAttempted" in problem && "Options" in problem;
}

function isPublicProblem(
  problem: ProblemDetail | undefined,
): problem is ProblemForPublic {
  return !!problem && "Message" in problem && !("Options" in problem);
}

function isAdminProblem(
  problem: ProblemDetail | undefined,
): problem is ProblemAdminDetail {
  return !!problem && "TitleAr" in problem && "TitleEn" in problem;
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

type OptionState = "idle" | "selected" | "correct" | "wrong";

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
  const learnerWorkspace = usePathname().startsWith("/dashboard/");
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const isArabic = locale === "ar";
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const problemId = Number.parseInt(params.id, 10);
  const challengeStageId = Number(searchParams.get('stageId') ?? 0);
  const challengeDate = searchParams.get('daily') ?? '';
  const challengeIndex = Number(searchParams.get('step') ?? -1);
  const challengeRequested = /^\d{4}-\d{2}-\d{2}$/.test(challengeDate) &&
    Number.isSafeInteger(challengeStageId) && challengeStageId > 0 &&
    Number.isSafeInteger(challengeIndex) && challengeIndex >= 0 && challengeIndex < 5;
  const { data: dailyChallenge } = useGetDailyChallengeQuery(challengeStageId, {
    skip: !challengeRequested,
  });
  const inDailyChallenge = challengeRequested &&
    dailyChallenge?.DateUtc === challengeDate &&
    dailyChallenge?.StageId === challengeStageId &&
    dailyChallenge.Problems[challengeIndex]?.Id === problemId;
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
    {
      skip: Number.isNaN(problemId),
      refetchOnMountOrArgChange: true,
    },
  );

  // Optional forward-compatible geometry payload. Older API responses have no diagram.
  const rawDiagram: unknown = problem && "Diagram" in problem ? problem.Diagram : null;
  const embeddedDiagram = isGeometryScene(rawDiagram) ? rawDiagram : null;
  const { data: fetchedDiagram } = useGetProblemDiagramQuery(problemId, {
    skip: !Number.isSafeInteger(problemId) || problemId <= 0,
  });
  const [diagramOverride, setDiagramOverride] = useState<{ problemId: number; scene: unknown } | null>(null);
  const remoteDiagram = diagramOverride?.problemId === problemId
    ? diagramOverride.scene
    : fetchedDiagram;
  const diagram = diagramOverride?.problemId === problemId && diagramOverride.scene === null
    ? null
    : isGeometryScene(remoteDiagram) ? remoteDiagram : embeddedDiagram;
  const studentProblem = isStudentProblem(problem) ? problem : null;
  const adminProblem = isAdminProblem(problem) ? problem : null;


  const { data: favoriteData } = useCheckFavoriteQuery(problemId, {
    skip: !isAuthenticated || Number.isNaN(problemId),
  });

  const { data: entitlement } = useGetStudentEntitlementQuery(undefined, {
    skip: !isAuthenticated || !studentProblem,
  });
  const [loadPremiumSolution, { data: premiumSolution, isFetching: isLoadingPremiumSolution, isError: premiumSolutionError }] = useLazyGetPremiumSolutionQuery();

  const [toggleFavorite] = useToggleFavoriteMutation();
  const [submitAnswer, { isLoading: isSubmitting }] = useSubmitAnswerMutation();
  const [, { data: solutionPreviewData }] = useLazyGetSolutionPreviewQuery();
  const solutionPreview = solutionPreviewData?.ProblemId === problemId
    ? solutionPreviewData : null;

  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [localAnswerResult, setLocalAnswerResult] =
    useState<AnswerResult | null>(null);
  const [submissionDone, setSubmissionDone] = useState(false);
  const [retryMode, setRetryMode] = useState(false);
  const [pauseChallengeAdvance, setPauseChallengeAdvance] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [activeTab, setActiveTab] = useState<"question" | "video">("question");

  // The same dynamic route component can remain mounted when navigating
  // between question IDs. Never expose a previous question's selected answer,
  // result or pre-answer Premium solution in the next question.
  useEffect(() => {
    setSelectedOptionId(null);
    setLocalAnswerResult(null);
    setSubmissionDone(false);
    setRetryMode(false);
    setPauseChallengeAdvance(false);
    setSubmitError("");
    setActiveTab("question");
    attemptStartedAtRef.current = Date.now();
  }, [problemId]);

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
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "start",
      });
    }, 200);

    return () => window.clearTimeout(timer);
  }, [localAnswerResult, retryMode]);

  // Resume the first unanswered question after this step, never revisit
  // already completed items from a resumed session. Questions remain fixed
  // for the UTC day and stage.
  const nextChallengeIndex = inDailyChallenge && dailyChallenge
    ? dailyChallenge.Problems.findIndex((item, index) =>
        index > challengeIndex && !item.IsAnswered)
    : -1;
  const nextChallengeProblem = nextChallengeIndex >= 0
    ? dailyChallenge?.Problems[nextChallengeIndex] : undefined;
  const nextChallengeUrl = nextChallengeProblem
    ? '/dashboard/problems/' + nextChallengeProblem.Id +
      '?daily=' + challengeDate + '&stageId=' + challengeStageId +
      '&step=' + nextChallengeIndex
    : '/dashboard/daily-challenge';

  // Students must have time to read the mathematical rule and explanation.
  // Auto-advance remains enabled by default and can be paused per question.
  useEffect(() => {
    if (!localAnswerResult || !inDailyChallenge || !dailyChallenge ||
        pauseChallengeAdvance) return;
    const timer = window.setTimeout(() => router.replace(nextChallengeUrl), 8000);
    return () => window.clearTimeout(timer);
  }, [localAnswerResult, inDailyChallenge, dailyChallenge, pauseChallengeAdvance,
    nextChallengeUrl, router]);

  const problemData = useMemo(() => {
    if (!problem) {
      return null;
    }

    if (isAdminProblem(problem)) {
      return {
        title: locale === "ar" ? problem.TitleAr : problem.TitleEn,
        questionText:
          locale === "ar" ? problem.QuestionTextAr : problem.QuestionTextEn,
        categoryId: problem.CategoryId,
        categoryName: problem.CategoryName || "",
        stageId: problem.StageId,
        stageName: problem.StageName || "",
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
      points: "Points" in problem ? problem.Points : 0,
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

  const effectiveCorrectOptionId =
    showResult && isCorrect
      ? (localAnswerResult?.CorrectOptionId ??
        studentProblem?.CorrectOptionId ??
        null)
      : null;

  const canRetry = searchParams.get('review') === '1' &&
    (localAnswerResult?.CanRetry ?? studentProblem?.CanRetry ?? false);
  const canAnswer =
    isAuthenticated &&
    !!studentProblem &&
    (!hasAttempted || (retryMode && canRetry));

  const currentMastery =
    localAnswerResult?.MasteryStatus ??
    studentProblem?.MasteryStatus ??
    "New";

  const isInErrorNotebook =
    localAnswerResult?.IsInErrorNotebook ??
    studentProblem?.IsInErrorNotebook ??
    false;

  const solutionText = useMemo(() => {
    if (solutionPreview?.DetailedSolution?.trim()) {
      return solutionPreview.DetailedSolution;
    }
    if (retryMode) {
      return null;
    }

    if (adminProblem) {
      return locale === "ar"
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
    solutionPreview,
  ]);

  const youtubeUrl = useMemo(() => {
    if (solutionPreview?.YoutubeSolutionUrl &&
        getYouTubeVideoId(solutionPreview.YoutubeSolutionUrl)) {
      return solutionPreview.YoutubeSolutionUrl;
    }
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
  }, [localAnswerResult, studentProblem, adminProblem, retryMode, isCorrect, solutionPreview]);

  const showSolutionSection = !!solutionText &&
    (showResult || !!adminProblem || !!solutionPreview);
  const showVideoTab = !!youtubeUrl &&
    (showResult || !!adminProblem || !!solutionPreview);
  const isFavorite =
    favoriteData?.IsFavorite ?? studentProblem?.IsFavorite ?? false;

  function getMasteryLabel(status: MasteryStatus) {
    return t(`problem.mastery.${status}`);
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
      console.error("Failed to update favorite:", favoriteError);
    }
  }

  function handleStartRetry() {
    if (!canRetry || !isInErrorNotebook) return;

    setRetryMode(true);
    setSubmissionDone(false);
    setLocalAnswerResult(null);
    setSelectedOptionId(null);
    setSubmitError("");
    setActiveTab("question");
    attemptStartedAtRef.current = Date.now();

    window.setTimeout(() => {
      questionCardRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  }

  function handleCancelRetry() {
    setRetryMode(false);
    setSubmissionDone(true);
    setLocalAnswerResult(null);
    setSelectedOptionId(studentProblem?.SelectedOptionId ?? null);
    setSubmitError("");
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

    setSubmitError("");

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
      await refetchProblem();

    } catch (submitFailure) {
      const normalized = submitFailure as {
        status?: number;
        data?: { Message?: string; message?: string };
      };
      setSubmitError(
        normalized.data?.Message || normalized.data?.message ||
        (normalized.status === 429
          ? isArabic
            ? "طلبات كثيرة خلال وقت قصير. حاول مرة أخرى بعد قليل."
            : "Too many requests. Please try again shortly."
          : t("common.error")),
      );
    }
  }

  function getOptionState(option: OptionForStudent): OptionState {
    const isSelected = effectiveSelectedOptionId === option.Id;

    if (!showResult) {
      return isSelected ? "selected" : "idle";
    }

    if (effectiveCorrectOptionId === option.Id) {
      return "correct";
    }

    if (isSelected && !isCorrect) {
      return "wrong";
    }

    if (isSelected && isCorrect) {
      return "correct";
    }

    return "idle";
  }
  function getBreadcrumbProblemLabel(text: string): string {
    const superscripts: Record<string, string> = {
      "0": "⁰",
      "1": "¹",
      "2": "²",
      "3": "³",
      "4": "⁴",
      "5": "⁵",
      "6": "⁶",
      "7": "⁷",
      "8": "⁸",
      "9": "⁹",
      "+": "⁺",
      "-": "⁻",
    };

    const toSuperscript = (value: string) =>
      value
        .split("")
        .map((character) => superscripts[character] ?? character)
        .join("");

    const normalized = text
      .replace(/\$\$/g, "")
      .replace(/\$/g, "")
      .replace(/\\text\{([^{}]*)\}/g, "$1")
      .replace(/\\times/g, "×")
      .replace(/\\cdot/g, "·")
      .replace(/\\div/g, "÷")
      .replace(/\\pm/g, "±")
      .replace(/\\neq/g, "≠")
      .replace(/\\leq?/g, "≤")
      .replace(/\\geq?/g, "≥")
      .replace(/\\left|\\right/g, "")
      .replace(/\^\{([0-9+-]+)\}/g, (_, exponent: string) =>
        toSuperscript(exponent),
      )
      .replace(/\^([0-9])/g, (_, exponent: string) =>
        toSuperscript(exponent),
      )
      .replace(/[{}]/g, "")
      .replace(/\\[a-zA-Z]+/g, "")
      .replace(/\s+/g, " ")
      .trim();

    const maxLength = 54;
    return normalized.length > maxLength
      ? `${normalized.slice(0, maxLength - 1).trimEnd()}…`
      : normalized;
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
          {t("errors.problemNotFound")}
        </p>
        <Link
          href={learnerWorkspace ? "/dashboard/problems" : "/problems"}
          className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
        >
          <DirectionalArrow direction="back" />
          {t("problem.backToProblems")}
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
  const stageAccent = getStageAccent({ Id: stageId, Name: stageName });
  if (isAuthenticated && user?.Role === "Student" &&
      (user.CurrentStageId == null || stageId !== user.CurrentStageId)) {
    return <StudentStageAccessNotice selectedStageId={user.CurrentStageId} requestedStageId={stageId} />;
  }

  return (
    <div className="container mx-auto px-4 py-8 md:px-16 lg:px-24">
      <Breadcrumbs
        surface
        className="mb-6"
        items={[
          { label: learnerWorkspace ? (isArabic ? "الرئيسية" : "Home") : t("nav.home"), href: learnerWorkspace ? "/dashboard" : "/" },
          { label: learnerWorkspace ? (isArabic ? "الفئات" : "Topics") : t("nav.stages"), href: learnerWorkspace ? "/dashboard/categories" : "/stages" },
          ...(stageName
            ? [
                {
                  label: stageName,
                  href: `${learnerWorkspace ? "/dashboard" : ""}/problems?stageId=${stageId}`,
                },
              ]
            : []),
          ...(categoryName
            ? [
                {
                  label: categoryName,
                  href: `${learnerWorkspace ? "/dashboard" : ""}/problems?stageId=${stageId}&categoryId=${categoryId}`,
                },
              ]
            : []),
          {
            label: getBreadcrumbProblemLabel(title),
            truncate: true,
          },
        ]}
      />

      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h1
            className={`brand-display-title mb-3 text-3xl font-bold sm:text-4xl ${
              isArabic ? "text-right" : "text-left"
            }`}
            style={{ color: stageAccent }}
          >
            <RichText
              text={title}
              isArabic={isArabic}
              className="text-inherit"
            />
          </h1>

          <div
            className={`flex flex-wrap items-center gap-2 ${
              isArabic ? "justify-end" : "justify-start"
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
              <Badge className="gap-1.5 border bg-background/80" style={{ borderColor: `${stageAccent}34`, color: stageAccent }}>
                <StageIconBadge
                  stage={{ Id: stageId, Name: stageName }}
                  size="xs"
                  className="border-0 bg-background/30 shadow-none"
                />
                {stageName}
              </Badge>
            )}

            {categoryName && <Badge variant="secondary" style={{ borderColor: `${stageAccent}34`, backgroundColor: `${stageAccent}0E`, color: stageAccent }}>{categoryName}</Badge>}

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
                ? t("favorites.removeFromFavorites")
                : t("favorites.addToFavorites")
            }
            className={
              isFavorite
                ? "text-red-500 hover:text-red-600"
                : "text-muted-foreground hover:text-foreground"
            }
          >
            <Heart
              className={`h-5 w-5 transition-transform ${
                isFavorite ? "scale-110 fill-current" : ""
              }`}
            />
          </Button>
        )}
      </div>

      {retryMode && (
        <div className="mb-6 flex flex-col gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-primary">
              {t("problem.trainingModeTitle")}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("problem.trainingModeDescription")}
            </p>
          </div>
          <Button variant="outline" onClick={handleCancelRetry}>
            {t("common.cancel")}
          </Button>
        </div>
      )}

      {studentProblem && entitlement && !entitlement.CanRevealSolutionBeforeAnswer && (
        <section className="mb-5 rounded-2xl border border-primary/20 bg-primary/5 p-4">
          <LockedPremiumDialog>
            <button type="button" className="flex min-h-11 items-center gap-2 rounded-xl border border-primary/30 px-4 py-3 text-sm font-bold text-primary hover:bg-primary/10">
              <Lock aria-hidden="true" className="h-4 w-4" />
              {isArabic ? "طريقة الحل — Premium" : "Solution method — Premium"}
            </button>
          </LockedPremiumDialog>
        </section>
      )}

      {studentProblem && entitlement?.CanRevealSolutionBeforeAnswer && (
        <section className="mb-5 rounded-2xl border border-primary/25 bg-primary/5 p-4">
          <Button
            variant="outline"
            disabled={isLoadingPremiumSolution}
            onClick={() => void loadPremiumSolution(problemId)}
          >
            {isLoadingPremiumSolution
              ? (isArabic ? "جارٍ تحميل الحل..." : "Loading solution...")
              : (isArabic ? "طريقة الحل" : "Solution method")}
          </Button>
          {premiumSolutionError && (
            <p role="alert" className="mt-3 text-sm text-destructive">
              {isArabic ? "تعذّر عرض الحل. حاول مجدداً." : "Could not load the solution. Please retry."}
            </p>
          )}
          {premiumSolution?.ProblemId === problemId && (
            <div className="mt-4 space-y-3">
              {premiumSolution.DetailedSolution && (
                <RichText text={premiumSolution.DetailedSolution} isArabic={isArabic} />
              )}
              {premiumSolution.CorrectOptionId !== null &&
                studentProblem.Options.some(option => option.Id === premiumSolution.CorrectOptionId) && (
                  <div className="rounded-xl border border-primary/15 bg-background p-3">
                    <p className="mb-2 text-sm font-bold">
                      {isArabic ? "الإجابة الصحيحة:" : "Correct answer:"}
                    </p>
                    <LatexPreview
                      latex={studentProblem.Options.find(
                        option => option.Id === premiumSolution.CorrectOptionId,
                      )?.LatexCode ?? ""}
                    />
                  </div>
                )}
              {premiumSolution.YoutubeSolutionUrl && getYouTubeVideoId(premiumSolution.YoutubeSolutionUrl) && (
                <YoutubeEmbed url={premiumSolution.YoutubeSolutionUrl} />
              )}
            </div>
          )}
        </section>
      )}
      <div className="grid grid-cols-1 gap-8">
        <div
          ref={questionCardRef}
          className="brand-surface math-card scroll-mt-20 overflow-hidden rounded-2xl"
        >
          {showVideoTab && (
            <div className="flex border-b">
              <button
                type="button"
                onClick={() => setActiveTab("question")}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === "question"
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <BookOpen className="h-4 w-4" />
                {t("problem.question")}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("video")}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === "video"
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <PlayCircle className="h-4 w-4" />
                {t("problem.videoSolution")}
              </button>
            </div>
          )}

          {activeTab === "question" && (
            <div className="p-6">
              <RichText
                text={questionText}
                isArabic={isArabic}
                className="mb-6 text-lg"
              />
              {diagram && <GeometryDiagram scene={diagram} locale={locale} />}

              {!isAuthenticated && isPublicProblem(problem) && (
                <div className="border-t py-8 text-center">
                  <Lock className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                  <p className="mb-4 text-muted-foreground">
                    {t("problem.loginToSolve")}
                  </p>
                  <Button asChild>
                    <Link href={`/login?returnTo=${encodeURIComponent(`/problems/${problemId}`)}`}>{t("nav.login")}</Link>
                  </Button>
                </div>
              )}

              {studentProblem && (
                <div className="relative" aria-busy={isSubmitting}>
                  <div aria-live="polite" aria-atomic="true">
                    {isSubmitting && (
                      <div
                        role="status"
                        className="math-equation-chip mb-5 flex items-center gap-3 rounded-xl border-brand-primary/20 bg-primary/5 p-4 text-foreground shadow-sm"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                          <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">
                            {t("problem.checkingAnswer")}
                          </p>
                          <p className="mt-0.5 text-sm opacity-80">
                            {t("problem.checkingAnswerHint")}
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
                            optionState === "correct"
                              ? "border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
                              : optionState === "wrong"
                                ? "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
                                : optionState === "selected"
                                  ? "border-primary bg-primary/5"
                                  : "hover:border-primary/50"
                          } ${
                            isOptionDisabled
                              ? "cursor-default opacity-90"
                              : "cursor-pointer"
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

                          {optionState === "correct" && (
                            <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                          )}
                          {optionState === "wrong" && (
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
                    <div role="alert" className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                      {submitError}
                    </div>
                  )}

                  {canAnswer && (
                    <div className="flex justify-end">
                      <Button
                        onClick={handleSubmit}
                        disabled={
                          isSubmitting ||
                          effectiveSelectedOptionId === null
                        }
                        className="gap-2 transition-all"
                        size="lg"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {t("problem.checkingAnswer")}
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 rtl:rotate-180" />
                            {retryMode
                              ? t("problem.submitTrainingAttempt")
                              : t("problem.submit")}
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {showResult && (
                    <div
                      role="status"
                      aria-live="polite"
                      aria-atomic="true"
                      className={`mt-6 animate-in rounded-xl border p-5 duration-300 fade-in zoom-in ${
                        isCorrect
                          ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
                          : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
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
                              ? t("problem.correct")
                              : t("problem.wrong")}
                          </span>
                        </div>


                      </div>

                      {!isCorrect && (
                        <p className="mt-2 text-sm leading-relaxed text-red-700 dark:text-red-300">
                          {t("problem.retryWithoutReveal")}
                        </p>
                      )}

                      {localAnswerResult && (
                        <div className="mt-4 flex flex-wrap gap-2 text-sm">

                          <Badge variant="secondary">
                            {formatDuration(
                              localAnswerResult.AttemptTimeSeconds,
                              t("common.noData"),
                              t("problem.minutesShort"),
                              t("problem.secondsShort"),
                            )}
                          </Badge>
                          {localAnswerResult.PointsEarned > 0 && (
                            <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                              +{localAnswerResult.PointsEarned}{" "}
                              {t("dashboard.user.totalPoints")}
                            </Badge>
                          )}
                        </div>
                      )}

                      {inDailyChallenge && (
                        <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-primary">
                              {isArabic ? 'تحدي اليوم · السؤال ' + (challengeIndex + 1) + ' من ' + dailyChallenge?.Total
                                : 'Daily challenge · Question ' + (challengeIndex + 1) + ' of ' + dailyChallenge?.Total}
                            </p>
                            {localAnswerResult && (
                              <p role="status" className="mt-1 text-xs text-muted-foreground">
                                {pauseChallengeAdvance
                                  ? (isArabic ? 'تم إيقاف الانتقال التلقائي حتى تنتهي من قراءة طريقة الحل.'
                                    : 'Automatic advance paused while you review the solution.')
                                  : (isArabic ? 'الانتقال التلقائي خلال 8 ثوانٍ لقراءة الحل والقانون المستخدم.'
                                    : 'Advancing in 8 seconds so you can read the solution and rule first.')}
                              </p>
                            )}
                          </div>
                          {localAnswerResult && !pauseChallengeAdvance &&
                            <button type="button" onClick={() => setPauseChallengeAdvance(true)}
                              className="min-h-10 rounded-xl border border-border bg-card px-3 py-2 text-xs font-bold">
                              {isArabic ? 'أحتاج وقتاً للحل' : 'Give me time to review'}
                            </button>}
                          <Link href={nextChallengeUrl}
                            className="inline-flex min-h-10 items-center gap-1 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
                            {nextChallengeProblem
                              ? (isArabic ? 'السؤال التالي' : 'Next question')
                              : (isArabic ? 'إنهاء التحدي' : 'Finish challenge')}
                            <DirectionalArrow direction="forward" className="h-4 w-4" />
                          </Link>
                        </div>
                      )}
                      <Link
                        href={inDailyChallenge ? '/dashboard/daily-challenge' : categoryId != null
                          ? `${learnerWorkspace ? "/dashboard" : ""}/problems?categoryId=${categoryId}&stageId=${stageId}`
                          : stageId != null
                            ? `${learnerWorkspace ? "/dashboard" : ""}/problems?stageId=${stageId}`
                            : learnerWorkspace ? "/dashboard/problems" : "/problems"}
                        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90"
                      >
                        <DirectionalArrow direction="back" />
                        {inDailyChallenge ? (isArabic ? 'العودة للتحدي' : 'Back to challenge') :
                          t("problem.backToProblems")}
                      </Link>

                      {isInErrorNotebook && !inDailyChallenge && (
                        <div className="mt-5 flex flex-wrap items-center gap-3">
                          {canRetry && <Button
                            variant="outline"
                            className="gap-2"
                            onClick={handleStartRetry}
                          >
                            <RotateCcw className="h-4 w-4" />
                            {t("problem.tryAgain")}
                          </Button>}

                          {isInErrorNotebook && (
                            <Link
                              href="/dashboard/error-notebook"
                              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                            >
                              <NotebookTabs className="h-4 w-4" />
                              {t("problem.openErrorNotebook")}
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
                          ? "border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
                          : ""
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

          {activeTab === "video" && showVideoTab && youtubeUrl && (
            <div className="p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <PlayCircle className="h-5 w-5" />
                {t("problem.videoSolution")}
              </h3>
              <YoutubeEmbed url={youtubeUrl} />
            </div>
          )}
        </div>

        {adminProblem && (
          <AdminGeometryEditor
            problemId={problemId}
            locale={locale}
            initialScene={diagram}
            onSaved={(scene) => setDiagramOverride({ problemId, scene })}
          />
        )}

        {showSolutionSection && solutionText && (
          <div
            ref={solutionRef}
            id="solution-section"
            className="scroll-mt-20 animate-in rounded-2xl border border-green-200 bg-green-50/30 p-6 shadow-sm duration-500 fade-in slide-in-from-bottom-4 dark:bg-green-900/10"
          >
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-green-800 dark:text-green-300">
              <CheckCircle className="h-5 w-5" />
              {t("problem.solution")}
            </h3>
            <RichText text={solutionText} isArabic={isArabic} />
          </div>
        )}

      </div>
    </div>
  );
}
