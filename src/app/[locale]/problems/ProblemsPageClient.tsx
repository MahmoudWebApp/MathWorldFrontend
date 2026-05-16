// File: app/[locale]/problems/ProblemsPageClient.tsx

"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/Button";
import { useGetCategoriesQuery } from "@/store/api/categoriesApi";
import { useGetTagsQuery } from "@/store/api/tagsApi";
import { useSearchProblemsQuery } from "@/store/api/problemsApi";
import {useGetStagesQuery,} from "@/store/api/stagesApi";
import type { ProblemPreview } from "@/store/api/types";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Search,
  Filter,
  RotateCcw,
} from "lucide-react";
import { ProblemCard } from "@/components/problems/ProblemCard";

const DEFAULT_PAGE_SIZE = 5;
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

  // ── State ───────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [inputValue, setInputValue] = useState(searchParams.get("q") || "");
  const debouncedSearch = useDebounce(inputValue, DEBOUNCE_DELAY);

  // ✅ Replace old difficulty state with stageId (numeric string)
  const [stageId, setStageId] = useState(searchParams.get("stageId") || "");
  const [categoryId, setCategoryId] = useState(
    searchParams.get("category") || "",
  );
  const [tagId, setTagId] = useState(searchParams.get("tagId") || "");
  const [showFilters, setShowFilters] = useState(false);
  const [engine] = useState<"meilisearch" | "postgresql">("meilisearch");

  // ── API queries ─────────────────────────────────────────
  const { data: categories, isLoading: categoriesLoading } =
    useGetCategoriesQuery();
  const { data: tags, isLoading: tagsLoading } = useGetTagsQuery();
  const { data: stages, isLoading: stagesLoading } = useGetStagesQuery();

  const {
    data: searchResults,
    isLoading: searchLoading,
    error: searchError,
    isFetching,
  } = useSearchProblemsQuery(
    {
      Q: debouncedSearch || undefined,
      CategoryId: categoryId ? parseInt(categoryId) : undefined,
      TagId: tagId ? parseInt(tagId) : undefined,
      StageId: stageId ? parseInt(stageId) : undefined, // ✅ Send stageId instead of Difficulty
      Engine: engine,
      Page: page,
      PageSize: DEFAULT_PAGE_SIZE,
    },
    { skip: false },
  );

  // ── Derived data ────────────────────────────────────────
  const problems: ProblemPreview[] = searchResults?.Data?.Results || [];
  const totalResults = searchResults?.Data?.Total || 0;
  const totalPages = searchResults?.Data?.TotalPages || 0;
  const currentPage = searchResults?.Data?.Page || page;
  const activeFiltersCount = [
    stageId,
    categoryId,
    tagId,
    debouncedSearch,
  ].filter(Boolean).length;

  // Reset page when any filter changes
  useEffect(() => {
    setPage(1);
  }, [stageId, categoryId, tagId, debouncedSearch]);

  // ── Helper functions ────────────────────────────────────
  const clearFilters = () => {
    setStageId("");
    setCategoryId("");
    setTagId("");
    setInputValue("");
    setPage(1);
  };

  const removeFilter = (filter: "stage" | "category" | "tag" | "search") => {
    if (filter === "stage") setStageId("");
    if (filter === "category") setCategoryId("");
    if (filter === "tag") setTagId("");
    if (filter === "search") setInputValue("");
    setPage(1);
  };

  const getCategoryName = (id: string): string => {
    const cat = categories?.find((c) => c.Id === parseInt(id));
    return cat ? (locale === "ar" ? cat.NameAr : cat.NameEn) : "";
  };

  const getTagName = (id: string): string => {
    const tag = tags?.find((t) => t.Id === parseInt(id));
    return tag ? (locale === "ar" ? tag.TextAr : tag.TextEn) : "";
  };

  const getStageName = (id: string): string => {
    const stage = stages?.find((s) => s.Id === parseInt(id));
    return stage ? (locale === "ar" ? stage.NameAr : stage.NameEn) : "";
  };

  // Options for stage filter buttons
  const stageOptions = stages || [];

  const isLoading =
    searchLoading ||
    isFetching ||
    categoriesLoading ||
    tagsLoading ||
    stagesLoading;

  // ── Early return: full page loader ───────────────────────
  if (isLoading && !searchResults && !categories && !tags && !stages) {
    return (
      <div className="container mx-auto  lg:px-24 md:px-16 px-4 py-20 flex flex-col justify-center items-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">
          {t("common.loading") || "Loading..."}
        </p>
      </div>
    );
  }

  // ── Main render ─────────────────────────────────────────
  return (
    <div className="container mx-auto  lg:px-24 md:px-16 px-4 py-12">
      {/* Page header */}
      <div className="mb-10 text-center md:text-start">
        <h1 className="text-4xl md:text-5xl/[65px] font-extrabold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          {t("problems.title")}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          {t("search.subtitle")}
        </p>
      </div>

      {/* Search bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute start-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />

          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={t("search.placeholder")}
            className="w-full rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm py-4 ps-12 pe-10 text-base outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 shadow-sm"
          />

          <div className="absolute inset-y-0 end-3 flex items-center gap-1">
            {inputValue !== debouncedSearch && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
            {inputValue && (
              <button
                type="button"
                onClick={() => removeFilter("search")}
                className="p-1 rounded-full hover:bg-muted transition-colors"
                aria-label="Clear search"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter controls */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* ✅ Stage filter buttons (replaced difficulty) */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setStageId("");
                setPage(1);
              }}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                stageId === ""
                  ? "bg-primary text-primary-foreground shadow-md scale-105"
                  : "bg-background border border-border text-muted-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-foreground"
              }`}
            >
              {t("problems.filters.all")}
            </button>
            {stageOptions.map((stage) => (
              <button
                key={stage.Id}
                onClick={() => {
                  setStageId(stage.Id.toString());
                  setPage(1);
                }}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                  stageId === stage.Id.toString()
                    ? "bg-primary/15 text-primary scale-105"
                    : "bg-background border border-border text-muted-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-foreground"
                }`}
              >
                {locale === "ar" ? stage.NameAr : stage.NameEn}
              </button>
            ))}
          </div>

          <Button
            variant={showFilters ? "default" : "outline"}
            onClick={() => setShowFilters(!showFilters)}
            className="rounded-full gap-2 px-6"
          >
            <Filter className="h-4 w-4" />
            {t("search.filters")}
            {activeFiltersCount > 0 && (
              <span className="ms-2 h-5 w-5 rounded-full bg-background text-foreground text-xs flex items-center justify-center font-bold">
                {activeFiltersCount}
              </span>
            )}
          </Button>
        </div>

        {/* Active filter badges */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 p-3 bg-muted/40 border border-border/50 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
            <span className="text-sm font-medium text-muted-foreground me-1">
              {t("problems.activeFilters") || "Active:"}
            </span>

            {debouncedSearch && (
              <BadgeFilter
                label={`"${debouncedSearch}"`}
                onRemove={() => removeFilter("search")}
              />
            )}
            {stageId && (
              <BadgeFilter
                label={getStageName(stageId)}
                onRemove={() => removeFilter("stage")}
              />
            )}
            {categoryId && (
              <BadgeFilter
                label={getCategoryName(categoryId)}
                onRemove={() => removeFilter("category")}
              />
            )}
            {tagId && (
              <BadgeFilter
                label={getTagName(tagId)}
                onRemove={() => removeFilter("tag")}
              />
            )}

            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 text-sm text-destructive hover:text-destructive/80 font-semibold ms-2 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {t("common.clearAll") || "Clear all"}
            </button>
          </div>
        )}
      </div>

      {/* Advanced filters dropdown (category & tag) */}
      <div
        className={`grid transition-all duration-300 ease-in-out ${showFilters ? "grid-rows-[1fr] opacity-100 mb-8" : "grid-rows-[0fr] opacity-0"}`}
      >
        <div className="overflow-hidden">
          <div className="p-6 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-md shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground/80 ms-1">
                {t("search.categoryLabel")}
              </label>
              <select
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-xl border border-border/50 bg-background px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
              >
                <option value="">{t("search.allCategories")}</option>
                {categories?.map((cat) => (
                  <option key={cat.Id} value={cat.Id}>
                    {locale === "ar" ? cat.NameAr : cat.NameEn}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground/80 ms-1">
                {t("tags.title")}
              </label>
              <select
                value={tagId}
                onChange={(e) => {
                  setTagId(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-xl border border-border/50 bg-background px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
              >
                <option value="">{t("common.all") || "All Tags"}</option>
                {tags?.map((tag) => (
                  <option key={tag.Id} value={tag.Id}>
                    {locale === "ar" ? tag.TextAr : tag.TextEn}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm font-medium text-muted-foreground mb-6 flex items-center gap-2">
        <span className="h-px bg-border flex-1"></span>
        {t("search.resultsFound", { count: totalResults })}
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
              {activeFiltersCount > 0 && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="mt-6 gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  {t("common.clearAll") || "Reset filters"}
                </Button>
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

// Small component for removable filter badges
function BadgeFilter({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium animate-in fade-in zoom-in duration-200">
      {label}
      <button
        onClick={onRemove}
        className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
        aria-label="Remove filter"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </span>
  );
}
