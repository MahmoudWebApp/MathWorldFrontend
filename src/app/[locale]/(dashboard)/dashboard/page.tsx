"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

import { ProblemCard } from "@/components/problems/ProblemCard";
import {
  Heart,
  TrendUp,
  Award,
  Calendar,
  ArrowRight2,
  Warning2,
} from "iconsax-reactjs";
import { Trophy, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { useGetDashboardQuery } from "@/store/api/usersApi";
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
  // Single API call for all dashboard data instead of 3 separate calls
  const { data: dashboard, isLoading, isError } = useGetDashboardQuery();

  const stats = [
    {
      icon: Target,
      label: t("dashboard.user.solvedProblems"),
      value: dashboard?.SolvedProblemsCount ?? 0,
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-900/20",
      isLucide: true,
    },
    {
      icon: Heart,
      label: t("dashboard.user.favoriteProblems"),
      value: dashboard?.FavoriteProblemsCount ?? 0,
      color: "text-red-500",
      bg: "bg-red-50 dark:bg-red-900/20",
      isLucide: false,
    },
    {
      icon: Trophy,
      label: t("dashboard.user.totalPoints"),
      value: dashboard?.TotalPoints ?? 0,
      color: "text-yellow-500",
      bg: "bg-yellow-50 dark:bg-yellow-900/20",
      isLucide: true,
    },
    {
      icon: TrendUp,
      label: t("dashboard.user.successRate"),
      value: `${dashboard?.SuccessRate ?? 0}%`,
      color: "text-green-500",
      bg: "bg-green-50 dark:bg-green-900/20",
      isLucide: false,
    },
  ];

  return (
    <div className="container mx-auto lg:px-24 md:px-16 px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t("dashboard.user.title")}</h1>
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

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="border-0 shadow-sm">
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
                className="border-0 shadow-sm hover:shadow-md transition-shadow"
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
              <ArrowRight2 className="h-4 w-4 rtl:rotate-180" />
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
                    href="/stages"
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
              <ArrowRight2 className="h-4 w-4 rtl:rotate-180" />
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
                    href="/stages"
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
