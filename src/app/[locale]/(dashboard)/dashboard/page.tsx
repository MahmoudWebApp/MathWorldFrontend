"use client";

import { useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";

import { ProblemCard } from "@/components/problems/ProblemCard";
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
  const { data: dashboard, isLoading, isError } = useGetDashboardQuery(locale, {
    refetchOnMountOrArgChange: true,
  });
  const stageId = dashboard?.CurrentStageId;
  const { data: journey, isLoading: loadingJourney } = useGetLearningJourneyQuery(
    stageId ?? 0,
    { skip: stageId == null || stageId <= 0 },
  );

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
        practice: "تصفح مسائل المرحلة",
      }
    : {
        title: "My learning journey",
        progress: "Stage completion",
        attempted: "Problems attempted",
        solved: "Problems solved",
        points: "Stage points",
        categories: "Progress by topic",
        change: "Change stage",
        practice: "Explore stage problems",
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
              <h3 className="mb-3 text-sm font-semibold">{journeyLabels.categories}</h3>
              <div className="mb-5 grid gap-2 sm:grid-cols-2">
                {journey.Categories.map((category) => (
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
                {journeyLabels.practice}
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
        {isArabic ? 'تقريري المتقدم وتصدير النتائج (Premium)' : 'My analytics and report exports (Premium)'}
      </Link>

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
