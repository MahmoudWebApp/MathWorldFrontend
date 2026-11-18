"use client";

import { useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";

import { ProblemCard } from "@/components/problems/ProblemCard";
import { StudentAchievementsPanel } from "@/components/dashboard/StudentAchievementsPanel";
import {
  Heart,
  Award,
  Calendar,
  Warning2,
} from "iconsax-reactjs";
import { NotebookTabs, Trophy, Target } from "lucide-react";
import { DirectionalArrow } from "@/components/ui/DirectionalNavigation";
import { Card, CardContent } from "@/components/ui/Card";
import { useGetDashboardQuery, useGetLearningJourneyQuery } from "@/store/api/usersApi";
import { RichText } from "@/components/ui/RichText";
import { useGetDailyChallengeQuery } from "@/store/api/stagesApi";

// Helper function to calculate relative time from a date string
function getRelativeTime(
  dateStr: string,
  t: (key: string, params?: Record<string, number>) => string,
): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return t("dashboard.user.justNow");
  if (diffMinutes < 60)
    return t("dashboard.user.minutesAgo", { minutes: diffMinutes });
  if (diffHours < 24) return t("dashboard.user.hoursAgo", { hours: diffHours });
  return t("dashboard.user.daysAgo", { days: diffDays });
}

export default function UserDashboardPage() {
  const t = useTranslations();
  const locale = useLocale();
  const isArabic = locale === "ar";
  const router = useRouter();
  // Single API call for all dashboard data instead of 3 separate calls
  const { data: dashboard, isLoading, isError, refetch: retryDashboard } = useGetDashboardQuery(locale, {
    refetchOnMountOrArgChange: true,
  });
  const stageId = dashboard?.CurrentStageId;
  const { data: journey, isLoading: loadingJourney, isError: journeyError, refetch: retryJourney } = useGetLearningJourneyQuery(
    stageId ?? 0,
    { skip: stageId == null || stageId <= 0 },
  );
  const { data: dailyPractice } = useGetDailyChallengeQuery(stageId ?? 0, {
    skip: !stageId || stageId <= 0 || dashboard?.Role !== "Student",
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
  });

  useEffect(() => {
    if (!isLoading && !isError && dashboard?.Role === "Student" &&
      dashboard.CurrentStageId == null) {
      router.replace("/learning-stage");
    }
  }, [dashboard, isLoading, isError, router]);

  const journeyLabels = isArabic
    ? {
        title: "رحلتي التعليمية",
        progress: "نسبة إنجاز المرحلة",
        attempted: "مسائل تمت تجربتها",
        solved: "مسائل تم حلها",
        points: "نقاط هذه المرحلة",
        categories: "التقدم حسب التصنيف",
        change: "تغيير المرحلة",
        practice: "ابدأ حل المسائل",
      }
    : {
        title: "My learning journey",
        progress: "Stage completion",
        attempted: "Problems attempted",
        solved: "Problems solved",
        points: "Stage points",
        categories: "Progress by topic",
        change: "Change stage",
        practice: "Start solving problems",
      };

  // Web and Flutter show the same stage-based learning journey.
  // A global first-attempt success rate is not a completion percentage.
  const stats = [
    {
      icon: Target,
      label: journeyLabels.solved,
      value: journey ? `${journey.SolvedProblems}/${journey.TotalProblems}` : "—",
      color: "text-primary", bg: "bg-primary/10", isLucide: true,
    },
    {
      icon: NotebookTabs,
      label: journeyLabels.attempted,
      value: journey?.AttemptedProblems ?? "—",
      color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20", isLucide: true,
    },
    {
      icon: Trophy,
      label: journeyLabels.points,
      value: journey?.TotalPoints ?? "—",
      color: "text-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-900/20", isLucide: true,
    },
    {
      icon: Award,
      label: journeyLabels.progress,
      value: journey ? `${journey.CompletionPercent}%` : "—",
      color: "text-green-500", bg: "bg-green-50 dark:bg-green-900/20", isLucide: false,
    },
  ];

  // Statistics and enrollment can fail independently. Don't show a blank
  // dashboard that strands learners when the API is temporarily unavailable.
  if (isError && !dashboard) {
    return (
      <main className="container mx-auto max-w-2xl px-4 py-10">
        <section className="math-card rounded-2xl border border-border p-6">
          <h1 className="text-xl font-bold">
            {isArabic ? "ما قدرنا نحمّل إحصائياتك حالياً" : "Your dashboard stats are unavailable"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {isArabic
              ? "ما في داعي توقف تعلمك. فيك تتابع المسائل أو تختار مرحلتك بينما نحاول إعادة جلب الإحصائيات."
              : "You can continue learning or choose a stage while your stats reconnect."}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/stages"
              className="inline-flex rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">
              {isArabic ? "تابع حل المسائل" : "Continue solving"}
            </Link>
            <Link href="/learning-stage"
              className="inline-flex rounded-xl border border-border px-4 py-2.5 text-sm font-semibold">
              {journeyLabels.change}
            </Link>
            <button type="button" onClick={() => void retryDashboard()}
              className="inline-flex rounded-xl border border-border px-4 py-2.5 text-sm font-semibold">
              {t("common.retry")}
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <div className="container relative mx-auto px-4 py-8 md:px-16 lg:px-24">
      {/* Header */}
      <div className="mb-8">
        <h1 className="brand-display-title text-gradient-math text-3xl font-bold mb-2">{t("dashboard.user.title")}</h1>
        {isLoading ? (
          <div className="h-5 w-48 bg-muted animate-pulse rounded" />
        ) : (
          <p className="text-muted-foreground">
            {t("common.welcome")},{" "}
            <span className="font-medium text-foreground">
              {dashboard?.FullName || ""}
            </span>
          </p>
        )}
      </div>

      {/* The primary learner action is always above statistics and optional tools. */}
      <section aria-label={isArabic ? 'خطوتك التالية' : 'Your next step'}
        className="mb-6 rounded-3xl border border-primary/25 bg-primary/5 p-5 md:p-7">
        <p className="mb-2 text-sm font-bold text-primary">
          {isArabic ? 'الخطوة الأولى' : 'Step one'}
        </p>
        <h2 className="text-2xl font-extrabold">
          {stageId
            ? (isArabic ? 'ابدأ الحل من فئاتك المفتوحة' : 'Start with your unlocked topics')
            : (isArabic ? 'اختَر مرحلتك لتبدأ الرياضيات' : 'Choose your stage to get started')}
        </h2>
        <p className="mb-5 mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
          {stageId
            ? (isArabic
              ? 'رح تشوف الفئتين المفتوحتين لحسابك أولاً، ومع كل فئة زر واضح لبدء حل المسائل بلا حد.'
              : 'Your two Free topics appear first, each with a clear Start solving button and unlimited practice.')
            : (isArabic
              ? 'اختيار المرحلة بيحدد فئاتك ومسائلك، وتقدر تغيّرها لاحقاً بدون خسارة نقاطك.'
              : 'Your stage determines which topics you can practise; you can change it later without losing progress.')}
        </p>
        <Link
          href={stageId ? `/stages/${stageId}` : '/learning-stage'}
          className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-primary px-5 py-3 font-extrabold text-primary-foreground hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          {stageId
            ? (isArabic ? 'افتح فئاتي المفتوحة' : 'Open my unlocked topics')
            : (isArabic ? 'اختيار المرحلة' : 'Choose learning stage')}
          <DirectionalArrow direction="forward" size={18} />
        </Link>
      </section>

      {stageId != null && stageId > 0 && (
        <section className="math-card mb-8 rounded-3xl border border-primary/15 bg-card p-5 md:p-7">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">{journeyLabels.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {journey
                  ? (isArabic ? journey.NameAr : journey.NameEn)
                  : loadingJourney ? "..." : ""}
              </p>
            </div>
            <Link
              href="/learning-stage"
              className="rounded-lg border border-primary/20 px-3 py-2 text-sm text-primary hover:bg-primary/10"
            >
              {journeyLabels.change}
            </Link>
          </div>

          {journeyError && (
            <div role="alert" className="mb-5 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
              <p className="mb-3 text-sm text-foreground">
                {isArabic ? "تعذّر تحميل تقدّم مرحلتك التعليمية. حاول مجدداً." : "We couldn't load your stage progress. Please try again."}
              </p>
              <button type="button" onClick={() => retryJourney()}
                className="rounded-lg border border-primary/30 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                {isArabic ? "إعادة المحاولة" : "Retry"}
              </button>
            </div>
          )}
          {loadingJourney && !journey && (
            <div role="status" className="mb-5 space-y-3" aria-label={isArabic ? "جارٍ تحميل التقدم" : "Loading progress"}>
              <div className="h-3 w-full animate-pulse rounded bg-muted" />
              <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
            </div>
          )}
          {journey && (
            <>
              <div className="mb-3 flex items-end justify-between">
                <span className="text-sm text-muted-foreground">{journeyLabels.progress}</span>
                <strong className="text-2xl text-primary">{journey.CompletionPercent}%</strong>
              </div>
              <div
                role="progressbar"
                aria-label={journeyLabels.progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={journey.CompletionPercent}
                className="mb-6 h-3 overflow-hidden rounded-full bg-primary/10"
              >
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${journey.CompletionPercent}%` }}
                />
              </div>
              <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-primary/5 p-3">
                  <div className="text-xl font-bold">{journey.AttemptedProblems}</div>
                  <div className="text-xs text-muted-foreground">{journeyLabels.attempted}</div>
                </div>
                <div className="rounded-xl bg-primary/5 p-3">
                  <div className="text-xl font-bold">{journey.SolvedProblems} / {journey.TotalProblems}</div>
                  <div className="text-xs text-muted-foreground">{journeyLabels.solved}</div>
                </div>
                <div className="rounded-xl bg-primary/5 p-3">
                  <div className="text-xl font-bold">{journey.TotalPoints}</div>
                  <div className="text-xs text-muted-foreground">{journeyLabels.points}</div>
                </div>
              </div>
              {dailyPractice && dailyPractice.StageId === journey.StageId && (
                <Link href="/journey"
                  className="mb-5 flex min-h-12 flex-wrap items-center justify-between gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm font-semibold text-primary hover:bg-primary/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
                  <span>{isArabic ? "تحدّي اليوم الاختياري — بدون حد يومي للحل" : "Optional daily practice — no daily solving limit"}</span>
                  <span className="tabular-nums">
                    {dailyPractice.Completed}/{dailyPractice.Total}
                    <DirectionalArrow direction="forward" />
                  </span>
                </Link>
              )}
              <h3 className="mb-3 text-sm font-semibold">{journeyLabels.categories}</h3>
              {journey.Categories.every(category => category.IsLocked !== false) && (
                <p className="mb-4 text-sm text-muted-foreground">
                  {isArabic
                    ? 'الفئات المفتوحة مو مؤكدة من بيانات التقدّم الحالية. افتح قائمة مرحلتك لتشوف الفئات المسموحة بدل تخمين صلاحياتك.'
                    : 'Unlocked topics are not verified from this progress response. Open your stage catalogue to see which topics you can use.'}
                </p>
              )}
              <div className="mb-5 grid gap-2 sm:grid-cols-2">
                {journey.Categories.filter(category => category.IsLocked === false).slice(0, 4).map((category) => (
                  <div key={category.CategoryId} className="rounded-xl border border-border p-3">
                    <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                      <span>{isArabic ? category.NameAr : category.NameEn}</span>
                      <span className="font-medium text-primary">{category.SolvedProblems}/{category.TotalProblems}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-primary/10">
                      <div className="h-full rounded-full bg-primary"
                        style={{ width: `${category.CompletionPercent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <Link href={`/stages/${journey.StageId}`}
                className="inline-flex rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">
                {isArabic ? 'عرض كل فئات مرحلتي' : 'See all topics in my stage'}
              </Link>
            </>
          )}
        </section>
      )}

      <Link
        href="/social-accounts"
        className="mb-8 inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
      >
        {isArabic ? 'ربط Google أو Facebook بحسابي' : 'Connect Google or Facebook'}
      </Link>

      <Link
        href="/dashboard/analytics"
        className="mb-8 ms-3 inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
      >
        <NotebookTabs className="h-4 w-4" aria-hidden="true" />
        {isArabic ? 'تقريري الشخصي' : 'My personal report'}
      </Link>

      <Link
        href="/dashboard/leaderboard"
        className="mb-8 ms-3 inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
      >
        <Trophy className="h-4 w-4" aria-hidden="true" />
        {isArabic ? 'ترتيب طلاب مرحلتي' : 'My stage leaderboard'}
      </Link>

      <StudentAchievementsPanel />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="math-card">
                <CardContent className="p-6">
                  <div className="h-10 w-10 rounded-xl bg-muted animate-pulse mb-3" />
                  <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2" />
                  <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                </CardContent>
              </Card>
            ))
          : stats.map((stat, index) => (
              <Card
                key={index}
                className="math-card hover:-translate-y-1 hover:border-brand-secondary/25 hover:shadow-[0_18px_48px_rgba(92,36,255,0.12)] transition-all"
              >
                <CardContent className="p-6">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.bg} mb-3`}
                  >
                    {stat.isLucide ? (
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    ) : (
                      <stat.icon
                        className={`h-5 w-5 ${stat.color}`}
                        variant="Bold"
                      />
                    )}
                  </div>
                  <div className="text-2xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      <Link
        href="/dashboard/error-notebook"
        className="mb-8 flex flex-col gap-4 rounded-2xl border border-amber-200 bg-amber-50/70 p-5 transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-amber-900 dark:bg-amber-900/10 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
            <NotebookTabs className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-semibold">{t("errorNotebook.title")}</h2>
            <p className="text-sm text-muted-foreground">
              {t("errorNotebook.description")}
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
          {t("common.view")}
          <DirectionalArrow direction="forward" />
        </span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Solved Problems */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              {t("dashboard.user.solvedProblems")}
            </h2>
            <Link
              href="/dashboard/solved"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              {t("common.viewAll")}
              <DirectionalArrow direction="forward" />
            </Link>
          </div>

          <div className="space-y-3">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-24 w-full bg-muted/50 animate-pulse rounded-lg"
                />
              ))
            ) : isError ? (
              <div className="p-4 bg-red-50 text-red-500 rounded-lg flex items-center gap-2">
                <Warning2 className="h-5 w-5" />
                <p>{t("common.errorLoadingData")}</p>
              </div>
            ) : dashboard?.RecentSolved && dashboard.RecentSolved.length > 0 ? (
              dashboard.RecentSolved.map((problem, index) => (
                <ProblemCard
                  key={problem.Id ?? `solved-${index}`}
                  problem={problem}
                />
              ))
            ) : (
              <Card className="border-dashed">
                <CardContent className="p-8 text-center text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>{t("dashboard.user.noSolvedYet")}</p>
                  <Link
                    href={stageId ? `/stages/${stageId}` : "/learning-stage"}
                    className="text-primary hover:underline mt-2 inline-block font-medium"
                  >
                    {t("dashboard.user.startSolving")}
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Favorites */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              {t("dashboard.user.favoriteProblems")}
            </h2>
            <Link
              href="/dashboard/favorites"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              {t("common.viewAll")}
              <DirectionalArrow direction="forward" />
            </Link>
          </div>

          <div className="space-y-3">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-24 w-full bg-muted/50 animate-pulse rounded-lg"
                />
              ))
            ) : isError ? (
              <div className="p-4 bg-red-50 text-red-500 rounded-lg flex items-center gap-2">
                <Warning2 className="h-5 w-5" />
                <p>{t("common.errorLoadingData")}</p>
              </div>
            ) : dashboard?.RecentFavorites &&
              dashboard.RecentFavorites.length > 0 ? (
              dashboard.RecentFavorites.map((problem, index) => (
                <ProblemCard
                  key={problem.Id ?? `fav-${index}`}
                  problem={problem}
                />
              ))
            ) : (
              <Card className="border-dashed">
                <CardContent className="p-8 text-center text-muted-foreground">
                  <Heart className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>{t("dashboard.user.noFavoritesYet")}</p>
                  <Link
                    href={stageId ? `/stages/${stageId}` : "/learning-stage"}
                    className="text-primary hover:underline mt-2 inline-block font-medium"
                  >
                      {t("hero.browseStages")}
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">
          {t("dashboard.user.recentActivity")}
        </h2>
        <Card>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-3">
                    <div className="h-10 w-10 rounded-full bg-muted animate-pulse shrink-0" />
                    <div className="flex-1">
                      <div className="h-4 w-48 bg-muted animate-pulse rounded mb-2" />
                      <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : dashboard?.RecentActivities &&
              dashboard.RecentActivities.length > 0 ? (
              <div className="space-y-4">
                {dashboard.RecentActivities.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/60 transition-colors"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 shrink-0">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <RichText
                        text={t("dashboard.user.solvedProblemActivity", {
                          title: activity.Title,
                          category: activity.CategoryName,
                        })}
                           inline
                        isArabic={isArabic}
                        className="font-medium text-foreground truncate"
                      />
                      <p className="text-sm text-muted-foreground">
                        {getRelativeTime(activity.SolvedAt, t)}
                      </p>
                    </div>
                    <Award className="h-5 w-5 text-yellow-500 shrink-0" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>{t("dashboard.user.noActivityYet")}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
