"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/Button";
import { useGetCategoriesQuery, useGetStageCategoryAccessQuery, useGetStudentSubscriptionQuery } from "@/store/api/categoriesApi";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { StudentStageAccessNotice } from "@/components/stages/StudentStageAccessNotice";
import { useGetStagesQuery } from "@/store/api/stagesApi";
import { useSearchProblemsQuery } from "@/store/api/problemsApi";
import type { ProblemPreview } from "@/store/api/types";
import {
  X,
  Loader2,
  AlertCircle,
  Search,
  RotateCcw,
} from "lucide-react";
import { Link, usePathname } from "@/i18n/routing";
import { ProblemCard } from "@/components/problems/ProblemCard";
import { StageIconBadge } from '@/components/stages/StageIconBadge';
import { getStageAccent } from '@/lib/stageVisuals';
import { DirectionalChevron } from '@/components/ui/DirectionalNavigation';

const DEFAULT_PAGE_SIZE = 10;
const DEBOUNCE_DELAY = 500;

// Simple debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// Wrapper to provide Suspense boundary for useSearchParams
function ProblemsLoadingFallback() {
  const t = useTranslations();

  return (
    <div className="mx-auto flex flex-col items-center justify-center gap-4 px-4 py-20 md:px-16 lg:px-24">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="animate-pulse text-muted-foreground">{t('common.loading')}</p>
    </div>
  );
}

export default function ProblemsPageClientWrapper() {
  return (
    <Suspense fallback={<ProblemsLoadingFallback />}>
      <ProblemsPageClient />
    </Suspense>
  );
}

function ProblemsPageClient() {
  const t = useTranslations();
  const locale = useLocale();
  const searchParams = useSearchParams();
  const learnerWorkspace = usePathname().startsWith("/dashboard/");

  // ── Get filters from URL params ─────────────────────────
  const urlStageId = searchParams.get("stageId") || "";
  const urlCategoryId = searchParams.get("categoryId") || "";
  const urlSearch = searchParams.get("q") || "";

  // ── State ───────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [hideSolved, setHideSolved] = useState(false);
  const [inputValue, setInputValue] = useState(urlSearch);
  const debouncedSearch = useDebounce(inputValue, DEBOUNCE_DELAY);

  useEffect(() => {
    setInputValue(urlSearch);
  }, [urlSearch]);

  // These come from URL and are fixed
  const auth = useSelector((state: RootState) => state.auth);
  const loggedIn = auth.isAuthenticated;
  const role = loggedIn ? auth.user?.Role : undefined;
  const selectedStageId = loggedIn && role === "Student" ? auth.user?.CurrentStageId : undefined;
  const stageId = loggedIn && role === "Student" && selectedStageId != null
    ? String(selectedStageId) : urlStageId;
  const categoryId = urlCategoryId;
  const wrongStudentStage = loggedIn && role === "Student" &&
    (selectedStageId == null || (urlStageId !== "" && Number(urlStageId) !== selectedStageId));
  const authenticated = loggedIn && role === "Student";
  const isAdmin = role === "Admin";
  const { currentData: access, isLoading: accessLoading, isError: accessError,
    refetch: refetchAccess } = useGetStageCategoryAccessQuery(Number(stageId), { skip: !stageId });
  const { data: subscription, isLoading: subscriptionLoading, isError: subscriptionError,
    refetch: refetchSubscription } = useGetStudentSubscriptionQuery(undefined, { skip: !authenticated });
  const scopedCategory = Boolean(categoryId && stageId);
  const accessUnavailable = scopedCategory && !accessLoading && !accessError && !access;
  const subscriptionUnavailable = authenticated && !subscriptionLoading && !subscriptionError && !subscription;
  const accessPending = scopedCategory && (accessLoading || (authenticated && subscriptionLoading));
  const accessFailed = accessError || accessUnavailable ||
    (authenticated && (subscriptionError || subscriptionUnavailable));
  // A pending Premium lookup is not proof that a category is locked.
  // Wait for the authoritative entitlement answer before rendering a lock.
  const categoryLocked = Boolean(categoryId && stageId && access &&
    !accessPending && !accessFailed &&
    authenticated && !isAdmin && subscription?.IsPremium !== true &&
    !access.FreeCategoryIds.includes(Number(categoryId)));

  // ── API queries ─────────────────────────────────────────
  const { data: categories } = useGetCategoriesQuery(locale, { refetchOnMountOrArgChange: true });
  const { data: stages } = useGetStagesQuery(locale, { refetchOnMountOrArgChange: true });

  const {
    currentData: searchResults,
    isLoading: searchLoading,
    error: searchError,
    isFetching,
    refetch: refetchProblems,
  } = useSearchProblemsQuery(
    {
      Q: debouncedSearch || "",
      CategoryId: categoryId ? parseInt(categoryId) : undefined,
      StageId: stageId ? parseInt(stageId) : undefined,
      HideSolved: learnerWorkspace && authenticated && hideSolved,
      Page: page,
      PageSize: DEFAULT_PAGE_SIZE,
      locale: locale,
    },
    { skip: wrongStudentStage || categoryLocked || accessPending ||
      (scopedCategory && accessFailed) },
  );

  const lockedCategoryError = !!searchError && typeof searchError === 'object' &&
    'status' in searchError && searchError.status === 403;

  // ── Derived data ────────────────────────────────────────
  const problems: ProblemPreview[] = searchResults?.Results || [];
  const totalResults = searchResults?.Total || 0;
  const totalPages = searchResults?.TotalPages || 0;
  const currentPage = searchResults?.Page || page;

  // Get names for display
  const selectedStage =
    stageId && stages
      ? stages.find((stage) => stage.Id === parseInt(stageId))
      : undefined;

  const stageName = selectedStage
    ? locale === "ar"
      ? selectedStage.NameAr
      : selectedStage.NameEn
    : "";
  const stageAccent = selectedStage ? getStageAccent(selectedStage) : undefined;

  const categoryName =
    categoryId && categories
      ? (locale === "ar"
          ? categories.find((c) => c.Id === parseInt(categoryId))?.NameAr
          : categories.find((c) => c.Id === parseInt(categoryId))?.NameEn) || ""
      : "";

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, stageId, categoryId, hideSolved]);

  // ── Helper functions ────────────────────────────────────
  const clearSearch = () => {
    setInputValue("");
    setPage(1);
  };

  const isLoading = searchLoading || (isFetching && !searchResults);

  // Build breadcrumb
  const breadcrumbItems: { href: string; label: string }[] = [
    { href: learnerWorkspace ? "/dashboard/categories" : "/stages", label: learnerWorkspace ? (locale === "ar" ? "الفئات" : "Topics") : t("nav.stages") },
  ];
  if (stageId && stageName) {
    breadcrumbItems.push({ href: learnerWorkspace ? "/dashboard/categories" : `/stages/${stageId}`, label: stageName });
  }
  if (categoryId && categoryName) {
    breadcrumbItems.push({ href: "", label: categoryName });
  }

  // Page title based on context
  const pageTitle = categoryName || stageName || t("problems.title");
  const pageSubtitle = categoryName
    ? t("problems.categorySubtitle", { category: categoryName })
    : stageName
      ? t("problems.stageSubtitle", { stage: stageName })
      : t("search.subtitle");

  // Search placeholder based on context
  const searchPlaceholder = categoryName
    ? t("search.searchInCategory", { category: categoryName })
    : stageName
      ? t("search.searchInStage", { stage: stageName })
      : t("search.placeholder");

  if (wrongStudentStage) {
    return <StudentStageAccessNotice selectedStageId={selectedStageId} requestedStageId={urlStageId ? Number(urlStageId) : undefined} />;
  }
  if (scopedCategory && accessFailed) {
    return (
      <section role="alert" className="container mx-auto max-w-2xl px-4 py-20 text-center">
        <AlertCircle aria-hidden="true" className="mx-auto mb-4 h-10 w-10 text-destructive" />
        <h1 className="mb-3 text-2xl font-bold">
          {locale === 'ar' ? 'تعذّر التحقق من صلاحيات هذه الفئة' : 'Could not verify category access'}
        </h1>
        <p className="mb-6 text-sm text-muted-foreground">
          {locale === 'ar' ? 'ما رح نعرض المحتوى كأنه مقفل حتى نتحقق من حالة الحساب.' :
            'We will not label this content as locked until account access is verified.'}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button type="button" onClick={() => {
            if (accessError || accessUnavailable) void refetchAccess();
            if (authenticated && (subscriptionError || subscriptionUnavailable)) void refetchSubscription();
          }}>
            {t('common.retry')}
          </Button>
          <Link href={learnerWorkspace ? "/dashboard/categories" : `/stages/${stageId}`} className="rounded-xl border px-5 py-3">
            {locale === 'ar' ? 'العودة إلى المرحلة' : 'Back to stage'}
          </Link>
        </div>
      </section>
    );
  }
  if (categoryLocked) {
    return (
      <section className="container mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="mb-6 text-xl font-bold">
          {locale === 'ar' ? 'هذه الفئة غير متاحة لحسابك' : 'This topic is not available to your account'}
        </h1>
        <Link href={learnerWorkspace ? "/dashboard/categories" : `/stages/${stageId}`} className="inline-flex rounded-xl border border-border px-5 py-3 font-semibold">
          {locale === 'ar' ? 'العودة لفئات مرحلتي' : 'Back to stage topics'}
        </Link>
      </section>
    );
  }

  // ── Early return: full page loader ───────────────────────
  // Never expose a previously cached category result while access or
  // subscription status for the newly selected topic is unresolved.
  if (accessPending || isLoading) {
    return (
      <div className="container mx-auto lg:px-24 md:px-16 px-4 py-20 flex flex-col justify-center items-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">
          {t("common.loading") || "Loading..."}
        </p>
      </div>
    );
  }

  // ── Main render ─────────────────────────────────────────
  return (
    <div className="container relative mx-auto px-4 py-5 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
        <Link href={learnerWorkspace ? "/dashboard" : "/"} className="hover:text-primary transition-colors">
          {t("nav.home")}
        </Link>
        {breadcrumbItems.map((item, index) => (
          <span key={index} className="flex items-center gap-2">
            <span className="mx-1">/</span>
            {item.href ? (
              <Link
                href={item.href}
                className="hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground font-medium">{item.label}</span>
            )}
          </span>
        ))}
      </div>

      {/* Page header */}
      <div className="mb-4 text-start">
        <h1 className="brand-display-title text-2xl sm:text-3xl font-extrabold mb-1" style={stageAccent ? { color: stageAccent } : undefined}>
          {pageTitle}
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          {pageSubtitle}
        </p>
      </div>

      {/* Search bar */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute start-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/50 z-10" />

          <input
            type="search"
            aria-label={searchPlaceholder}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-2xl border border-brand-primary/15 bg-card/80 backdrop-blur-xl py-3 ps-12 pe-10 text-base outline-none transition-all focus:border-brand-secondary/50 focus:ring-4 focus:ring-primary/10 shadow-[0_12px_36px_rgba(57,26,84,0.08)]"
          />

          <div className="absolute inset-y-0 end-3 flex items-center gap-1">
            {/* [IMPROVED] Show spinner if typing OR if data is actively fetching from API */}
            {(inputValue !== debouncedSearch || isFetching) && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
            {inputValue && (
              <button
                type="button"
                onClick={clearSearch}
                className="p-1 rounded-full hover:bg-muted transition-colors"
                aria-label={locale === "ar" ? "مسح البحث" : "Clear search"}
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>
        {learnerWorkspace && authenticated && (
          <label className="inline-flex min-h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm font-semibold">
            <input type="checkbox" checked={hideSolved}
              onChange={event => setHideSolved(event.target.checked)}
              className="h-4 w-4 accent-primary" />
            <span>{locale === 'ar' ? 'إخفاء المحلولة' : 'Hide solved'}</span>
          </label>
        )}
      </div>

      {/* Active search badge */}
      {debouncedSearch && (
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-sm text-muted-foreground">
            {t("problems.searchResults")}:
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
            &ldquo;{debouncedSearch}&rdquo;
            <button
              type="button"
              aria-label={locale === "ar" ? "مسح البحث" : "Clear search"}
              onClick={clearSearch}
              className="hover:bg-primary/20 rounded-full p-1 transition-colors"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </span>
        </div>
      )}

      {/* Context info badge */}
      {!learnerWorkspace && (stageName || categoryName) && (
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-sm text-muted-foreground">
            {t("problems.showing")}:
          </span>
          {stageName && selectedStage && (
            <span className="inline-flex items-center gap-1.5 rounded-full border bg-card px-2.5 py-1 text-sm font-medium" style={stageAccent ? { color: stageAccent, borderColor: `${stageAccent}35` } : undefined}>
              <StageIconBadge stage={selectedStage} size="xs" className="border-0 bg-background/30 shadow-none" />
              {stageName}
            </span>
          )}
          {categoryName && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full math-equation-chip border-brand-secondary/20 bg-brand-secondary/10 text-brand-secondary-strong dark:text-brand-secondary-light text-sm font-medium">
              {categoryName}
            </span>
          )}
        </div>
      )}

      {/* Only show an authoritative count for the current query. */}
      {!searchError && searchResults && <p className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
        <span className="h-px bg-border flex-1"></span>
        <span>
          {totalResults > 0
            ? t("search.resultsFound", { count: totalResults })
            : t("search.noResultsFound")}
        </span>
        <span className="h-px bg-border flex-1"></span>
      </p>}

      {/* Error state */}
      {searchError ? (
        <div className="text-center py-16 bg-destructive/5 rounded-3xl border border-destructive/10">
          <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4 opacity-80" />
          <p className="text-lg font-semibold text-destructive mb-2">
            {lockedCategoryError
              ? locale === 'ar' ? 'هذه الفئة مقفلة لحسابك' : 'This category is locked for your account'
              : t("common.errorLoadingData")}
          </p>
          <Button
            onClick={() => void refetchProblems()}
            variant="outline"
            className="mt-4"
          >
            {t("common.retry")}
          </Button>
        </div>
      ) : (
        <>
          {/* Problem cards */}
          {problems.length > 0 ? (
            <div className="grid gap-3">
              {problems.map((problem) => (
                <ProblemCard key={problem.Id} problem={problem} />
              ))}
            </div>
          ) : (
            <div className="brand-surface math-card text-center py-20 rounded-3xl">
              <div className="math-equation-chip bg-background/80 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <Search className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <p className="text-xl font-bold mb-2">{t("search.noResults")}</p>
              <p className="text-muted-foreground">
                {debouncedSearch
                  ? t("search.tryDifferent")
                  : locale === 'ar'
                    ? 'ما ظهرت مسائل بهذه القائمة حالياً. جرّب التحديث أو ارجع للفئات المتاحة.'
                    : 'No problems appeared here. Refresh or return to available categories.'}
              </p>
              {!debouncedSearch && (
                <Button variant="outline" onClick={() => void refetchProblems()} className="mt-6 gap-2">
                  <RotateCcw className="h-4 w-4" />
                  {t("common.retry")}
                </Button>
              )}
              {debouncedSearch && (
                <Button
                  variant="outline"
                  onClick={clearSearch}
                  className="mt-6 gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  {t("common.clearSearch") || "Clear search"}
                </Button>
              )}
              {(stageId || categoryId) && (
                <div className="mt-4">
                  <Link
                    href={learnerWorkspace ? "/dashboard/problems" : "/problems"}
                    className="text-primary hover:underline text-sm"
                  >
                    {t("problems.browseAll")}
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12 mb-8">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                aria-label={locale === 'ar' ? 'الصفحة السابقة' : 'Previous page'}
                disabled={currentPage === 1}
              >
                <DirectionalChevron direction="back" className="h-5 w-5" />
              </Button>

              <div className="flex items-center gap-1 bg-card/90 border border-brand-primary/15 rounded-full p-1 shadow-sm backdrop-blur-xl">
                {(() => {
                  const maxVisiblePages = 5;
                  let pagesToShow: number[];

                  if (totalPages <= maxVisiblePages) {
                    pagesToShow = Array.from(
                      { length: totalPages },
                      (_, i) => i + 1,
                    );
                  } else if (currentPage <= 3) {
                    pagesToShow = [1, 2, 3, 4, 5];
                  } else if (currentPage >= totalPages - 2) {
                    pagesToShow = Array.from(
                      { length: 5 },
                      (_, i) => totalPages - 4 + i,
                    );
                  } else {
                    pagesToShow = [
                      currentPage - 2,
                      currentPage - 1,
                      currentPage,
                      currentPage + 1,
                      currentPage + 2,
                    ];
                  }

                  return pagesToShow.map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setPage(pageNum)}
                      aria-label={locale === 'ar' ? `الصفحة ${pageNum}` : `Page ${pageNum}`}
                      aria-current={currentPage === pageNum ? 'page' : undefined}
                      className={`h-10 w-10 flex items-center justify-center rounded-full text-sm font-medium transition-all ${
                        currentPage === pageNum
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      {pageNum}
                    </button>
                  ));
                })()}
              </div>

              <Button
                variant="outline"
                size="icon"
                className="rounded-full"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                aria-label={locale === 'ar' ? 'الصفحة التالية' : 'Next page'}
                disabled={currentPage === totalPages}
              >
                <DirectionalChevron direction="forward" className="h-5 w-5" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
