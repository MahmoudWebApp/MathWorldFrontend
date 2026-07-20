"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/Button";
import { useGetCategoriesQuery } from "@/store/api/categoriesApi";
import { useGetStagesQuery } from "@/store/api/stagesApi";
import { useSearchProblemsQuery } from "@/store/api/problemsApi";
import type { ProblemPreview } from "@/store/api/types";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Search,
  RotateCcw,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { ProblemCard } from "@/components/problems/ProblemCard";

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
export default function ProblemsPageClientWrapper() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto lg:px-24 md:px-16 px-4 py-20 flex flex-col justify-center items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">Loading...</p>
        </div>
      }
    >
      <ProblemsPageClient />
    </Suspense>
  );
}

function ProblemsPageClient() {
  const t = useTranslations();
  const locale = useLocale();
  const searchParams = useSearchParams();

  // ── Get filters from URL params ─────────────────────────
  const urlStageId = searchParams.get("stageId") || "";
  const urlCategoryId = searchParams.get("categoryId") || "";
  const urlSearch = searchParams.get("q") || "";

  // ── State ───────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [inputValue, setInputValue] = useState(urlSearch);
  const debouncedSearch = useDebounce(inputValue, DEBOUNCE_DELAY);

  useEffect(() => {
    setInputValue(urlSearch);
  }, [urlSearch]);

  // These come from URL and are fixed
  const stageId = urlStageId;
  const categoryId = urlCategoryId;

  // ── API queries ─────────────────────────────────────────
  const { data: categories } = useGetCategoriesQuery();
  const { data: stages } = useGetStagesQuery();

  const {
    data: searchResults,
    isLoading: searchLoading,
    error: searchError,
    isFetching,
  } = useSearchProblemsQuery(
    {
      Q: debouncedSearch || "",
      CategoryId: categoryId ? parseInt(categoryId) : undefined,
      StageId: stageId ? parseInt(stageId) : undefined,
      Page: page,
      PageSize: DEFAULT_PAGE_SIZE,
      locale: locale,
    },
    { skip: false },
  );

  // ── Derived data ────────────────────────────────────────
  const problems: ProblemPreview[] = searchResults?.Results || [];
  const totalResults = searchResults?.Total || 0;
  const totalPages = searchResults?.TotalPages || 0;
  const currentPage = searchResults?.Page || page;

  // Get names for display
  const stageName =
    stageId && stages
      ? (locale === "ar"
          ? stages.find((s) => s.Id === parseInt(stageId))?.NameAr
          : stages.find((s) => s.Id === parseInt(stageId))?.NameEn) || ""
      : "";

  const categoryName =
    categoryId && categories
      ? (locale === "ar"
          ? categories.find((c) => c.Id === parseInt(categoryId))?.NameAr
          : categories.find((c) => c.Id === parseInt(categoryId))?.NameEn) || ""
      : "";

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, stageId, categoryId]);

  // ── Helper functions ────────────────────────────────────
  const clearSearch = () => {
    setInputValue("");
    setPage(1);
  };

  const isLoading = searchLoading || isFetching;

  // Build breadcrumb
  const breadcrumbItems: { href: string; label: string }[] = [
    { href: "/stages", label: t("nav.stages") },
  ];
  if (stageId && stageName) {
    breadcrumbItems.push({ href: `/stages/${stageId}`, label: stageName });
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

  // ── Early return: full page loader ───────────────────────
  if (isLoading && !searchResults) {
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
    <div className="container mx-auto lg:px-24 md:px-16 px-4 py-12">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
        <Link href="/" className="hover:text-primary transition-colors">
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
      <div className="mb-10 text-center md:text-start">
        <h1 className="brand-display-title text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          {pageTitle}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          {pageSubtitle}
        </p>
      </div>

      {/* Search bar */}
      <div className="mb-8">
        <div className="relative">
          <Search className="absolute start-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />

          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm py-4 ps-12 pe-10 text-base outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 shadow-sm"
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
                aria-label="Clear search"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>
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
              onClick={clearSearch}
              className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        </div>
      )}

      {/* Context info badge */}
      {(stageName || categoryName) && (
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-sm text-muted-foreground">
            {t("problems.showing")}:
          </span>
          {stageName && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-sm font-medium">
              {stageName}
            </span>
          )}
          {categoryName && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 text-sm font-medium">
              {categoryName}
            </span>
          )}
        </div>
      )}

      {/* Results count */}
      <p className="text-sm font-medium text-muted-foreground mb-6 flex items-center gap-2">
        <span className="h-px bg-border flex-1"></span>
        <span>
          {totalResults > 0
            ? t("search.resultsFound", { count: totalResults })
            : t("search.noResultsFound")}
        </span>
        <span className="h-px bg-border flex-1"></span>
      </p>

      {/* Error state */}
      {searchError ? (
        <div className="text-center py-16 bg-destructive/5 rounded-3xl border border-destructive/10">
          <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4 opacity-80" />
          <p className="text-lg font-semibold text-destructive mb-2">
            {t("common.errorLoadingData")}
          </p>
          <Button
            onClick={() => window.location.reload()}
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
            <div className="grid gap-4">
              {problems.map((problem) => (
                <ProblemCard key={problem.Id} problem={problem} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-muted/20 rounded-3xl border border-border/50">
              <div className="bg-background w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <Search className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <p className="text-xl font-bold mb-2">{t("search.noResults")}</p>
              <p className="text-muted-foreground">
                {t("search.tryDifferent")}
              </p>
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
                    href="/problems"
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
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
              </Button>

              <div className="flex items-center gap-1 bg-card border border-border/50 rounded-full p-1 shadow-sm">
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
                      onClick={() => setPage(pageNum)}
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
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-5 w-5 rtl:rotate-180" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
