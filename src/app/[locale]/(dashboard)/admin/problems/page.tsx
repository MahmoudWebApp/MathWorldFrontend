"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import {
  useLazyGetAdminProblemsQuery,
  useCreateProblemMutation,
  useUpdateProblemMutation,
  useDeleteProblemMutation,
  type CreateProblemRequest,
  type ProblemAdminDetail,
} from "@/store/api/problemsApi";
import { useGetAdminCategoriesQuery } from "@/store/api/categoriesApi";
import { useGetAdminStagesQuery } from "@/store/api/stagesApi";
import { LatexPreview } from "@/components/ui/LatexPreview";

import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  RotateCcw,
  AlertCircle,
  BookOpen,
  ListChecks,
  HelpCircle,
  Lightbulb,
  ArrowLeft,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { PopoverConfirm } from "@/components/ui/PopoverConfirm";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Textarea } from "@/components/ui/Textarea";
import { LatexToolbarAdvanced } from "@/components/problems/Latextoolbaradvanced";
import { RichText } from "@/components/ui/RichText";
// TooltipProvider is configured at the application provider level.
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/Tooltip";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

/* ────────────────────────────────────────────
   TYPES
   ──────────────────────────────────────────── */

type FormErrors = Record<string, string>;

type ActiveField =
  | "questionAr"
  | "questionEn"
  | "solutionAr"
  | "solutionEn"
  | `opt_${number}`
  | null;

type ExtendedCreateProblemRequest = CreateProblemRequest;

/* ────────────────────────────────────────────
   CONSTANTS
   ──────────────────────────────────────────── */

const emptyForm: ExtendedCreateProblemRequest = {
  QuestionTextAr: "",
  QuestionTextEn: "",
  DetailedSolutionAr: "",
  DetailedSolutionEn: "",
  YoutubeSolutionUrl: "",
  StageId: 0,
  Points: 10,
  CategoryId: 0,
  Options: [
    { LatexCode: "", IsCorrect: false, Order: 1 },
    { LatexCode: "", IsCorrect: false, Order: 2 },
    { LatexCode: "", IsCorrect: false, Order: 3 },
    { LatexCode: "", IsCorrect: false, Order: 4 },
  ],
};

const defaultFilters = {
  CategoryId: undefined as number | undefined,
  StageId: undefined as number | undefined,
  Page: 1,
  PageSize: 10,
};

/* ────────────────────────────────────────────
   MAIN COMPONENT
   ──────────────────────────────────────────── */

export default function AdminProblemsPage() {
  const t = useTranslations();
  const locale = useLocale();

  const [view, setView] = useState<"list" | "form">("list");
  const [searchText, setSearchText] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [filters, setFilters] = useState(defaultFilters);

  const [
    fetchProblems,
    { data: searchResult, isLoading: isSearching, isFetching },
  ] = useLazyGetAdminProblemsQuery();

  const problems: ProblemAdminDetail[] = searchResult?.Results || [];
  const totalPages = searchResult?.TotalPages || 1;
  const totalProblems = searchResult?.Total || 0;

  const { data: allCategories } = useGetAdminCategoriesQuery();
  const { data: stages } = useGetAdminStagesQuery();

  const [createProblem, { isLoading: isCreating }] = useCreateProblemMutation();
  const [updateProblem, { isLoading: isUpdating }] = useUpdateProblemMutation();
  const [deleteProblem] = useDeleteProblemMutation();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [form, setForm] = useState<ExtendedCreateProblemRequest>(emptyForm);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [viewingProblem, setViewingProblem] =
    useState<ProblemAdminDetail | null>(null);

  const refQuestionAr = useRef<HTMLTextAreaElement>(null);
  const refQuestionEn = useRef<HTMLTextAreaElement>(null);
  const refSolutionAr = useRef<HTMLTextAreaElement>(null);
  const refSolutionEn = useRef<HTMLTextAreaElement>(null);
  const refOptLatex = [
    useRef<HTMLTextAreaElement>(null),
    useRef<HTMLTextAreaElement>(null),
    useRef<HTMLTextAreaElement>(null),
    useRef<HTMLTextAreaElement>(null),
  ] as const;

  const [activeField, setActiveField] = useState<ActiveField>(null);

  const categories =
    allCategories?.filter((c) => !form.StageId || c.StageId === form.StageId) ||
    [];

  const filteredCategoriesForFilter =
    allCategories?.filter(
      (c) => !filters.StageId || c.StageId === filters.StageId,
    ) || [];

  /* ── Validation ── */
  const validateForm = useCallback((): boolean => {
    const errors: FormErrors = {};
    if (!form.QuestionTextAr.trim())
      errors.QuestionTextAr = t("common.required");
    if (!form.QuestionTextEn.trim())
      errors.QuestionTextEn = t("common.required");
    if (!form.DetailedSolutionAr?.trim())
      errors.DetailedSolutionAr = t("common.required");
    if (!form.DetailedSolutionEn?.trim())
      errors.DetailedSolutionEn = t("common.required");
    if (!form.CategoryId || form.CategoryId === 0)
      errors.CategoryId = t("common.required");
    if (!form.StageId || form.StageId === 0)
      errors.StageId = t("admin.problems.stageRequired");
    if (!form.Points || form.Points <= 0)
      errors.Points = t("admin.problems.pointsMustBePositive");

    const correctCount = form.Options.filter((o) => o.IsCorrect).length;
    if (correctCount === 0)
      errors.correctAnswer = t("admin.problems.oneCorrectRequired");
    else if (correctCount > 1)
      errors.correctAnswer = t("admin.problems.onlyOneCorrect");

    form.Options.forEach((opt, idx) => {
      if (!opt.LatexCode.trim())
        errors[`opt_${idx}_Latex`] = t("common.required");
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [form, t]);

  const clearError = (key: string) => {
    setFormErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQ(searchText);
      setFilters((prev) => ({ ...prev, Page: 1 }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    fetchProblems({
      q: debouncedQ,
      categoryId: filters.CategoryId,
      stageId: filters.StageId,
      page: filters.Page,
      pageSize: filters.PageSize,
    });
  }, [debouncedQ, filters, fetchProblems]);

  const handleResetFilters = () => {
    setSearchText("");
    setDebouncedQ("");
    setFilters(defaultFilters);
  };

  const openForm = (problem?: ProblemAdminDetail) => {
    if (problem) {
      setEditingId(problem.Id || null);
      setForm({
        QuestionTextAr: problem.QuestionTextAr,
        QuestionTextEn: problem.QuestionTextEn,
        DetailedSolutionAr: problem.DetailedSolutionAr || "",
        DetailedSolutionEn: problem.DetailedSolutionEn || "",
        YoutubeSolutionUrl: problem.YoutubeSolutionUrl || "",
        StageId: problem.StageId,
        Points: problem.Points,
        CategoryId: problem.CategoryId,
        Options: problem.Options.map((opt) => ({
          LatexCode: opt.LatexCode || "",
          IsCorrect: opt.IsCorrect,
          Order: opt.Order,
        })),
      });
    } else {
      setEditingId(null);
      setForm(emptyForm);
    }
    setFormErrors({});
    setView("form");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeForm = () => {
    setView("list");
    setEditingId(null);
    setForm(emptyForm);
    setFormErrors({});
    setActiveField(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const cleanedForm = {
        ...form,
        DetailedSolutionAr: form.DetailedSolutionAr?.trim() || "",
        DetailedSolutionEn: form.DetailedSolutionEn?.trim() || "",
        YoutubeSolutionUrl: form.YoutubeSolutionUrl?.trim() || "",
        Options: form.Options.map((opt) => ({
          ...opt,
          LatexCode: opt.LatexCode.trim(),
        })),
      };
      if (editingId)
        await updateProblem({
          Id: editingId,
          Data: cleanedForm,
        }).unwrap();
      else await createProblem(cleanedForm).unwrap();
      closeForm();
    } catch (err) {
      console.error("Failed to save problem", err);
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await deleteProblem(id).unwrap();
    } catch (error) {
      console.error(error);
    } finally {
      setDeletingId(null);
    }
  };

  const updateOption = (
    index: number,
    field: "LatexCode" | "IsCorrect",
    value: string | boolean,
  ) => {
    setForm((prev) => {
      const newOpts = prev.Options.map((o) => ({ ...o }));
      if (field === "IsCorrect" && value === true)
        newOpts.forEach((_, i) => {
          newOpts[i].IsCorrect = i === index;
        });
      else if (field === "IsCorrect" && value === false) return prev;
      else newOpts[index] = { ...newOpts[index], [field]: value as string };
      return { ...prev, Options: newOpts };
    });
    if (field === "LatexCode") clearError(`opt_${index}_Latex`);
    if (field === "IsCorrect") clearError("correctAnswer");
  };

  const getStageName = (stageId: number) =>
    stages?.find((s) => s.Id === stageId)?.NameAr || "";
  const getCategoryName = (categoryId: number) =>
    allCategories?.find((c) => c.Id === categoryId)?.NameAr || "-";

  const FieldError = ({ id }: { id: string }) =>
    formErrors[id] ? (
      <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
        <AlertCircle className="h-3 w-3 shrink-0" />
        {formErrors[id]}
      </p>
    ) : null;

  const TextareaWithToolbar = ({
    fieldKey,
    textareaRef,
    value,
    onChange,
    dir,
    rows = 4,
    hasError,
    placeholder,
    compact = false,
  }: {
    fieldKey: ActiveField;
    textareaRef: React.RefObject<HTMLTextAreaElement | null>;
    value: string;
    onChange: (v: string) => void;
    dir?: "rtl" | "ltr";
    rows?: number;
    hasError?: boolean;
    placeholder?: string;
    compact?: boolean;
  }) => {
    const isActive = activeField === fieldKey;
    return (
      <div
        className={cn(
          "rounded-lg border bg-card transition-all duration-200 overflow-hidden",
          isActive
            ? "border-primary ring-2 ring-primary/20 shadow-sm"
            : hasError
              ? "border-red-500"
              : "border-input",
        )}
      >
        <LatexToolbarAdvanced
          textareaRef={textareaRef}
          compact={compact}
          className={cn(
            "border-0 border-b rounded-none",
            isActive
              ? "bg-primary/5 border-primary/20"
              : "bg-muted/30 border-input",
          )}
        />
        <Textarea
          ref={textareaRef}
          dir={dir}
          rows={rows}
          value={value}
          placeholder={placeholder}
          onFocus={() => setActiveField(fieldKey)}
          onChange={(e) => onChange(e.target.value)}
          className="border-0 rounded-none focus-visible:ring-0 resize-y min-h-[80px]"
        />
      </div>
    );
  };

  /* ══════════════════════════════════════════
     RENDER FORM VIEW
     ══════════════════════════════════════════ */
  if (view === "form") {
    return (
      <div className="min-h-screen bg-muted/10 pb-20">
        <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b shadow-sm mb-8">
          <div className="mx-auto lg:px-24 md:px-16 px-4 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={closeForm}
                className="rounded-full"
              >
                <ArrowLeft className="h-5 w-5 rtl:rotate-180" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-primary">
                  {editingId
                    ? t("admin.problems.edit")
                    : t("admin.problems.add")}
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {editingId
                    ? t("admin.problems.editSubtitle")
                    : t("admin.problems.addSubtitle")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href={`/${locale}/admin/problems/guide`} target="_blank">
                <Button
                  variant="ghost"
                  className="gap-2 text-primary hover:bg-primary/10"
                >
                  <BookOpen className="h-5 w-5" />
                  <span className="hidden sm:inline">{t("nav.guide")}</span>
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={closeForm}
                className="px-6 h-11"
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="submit"
                form="problem-form"
                disabled={isCreating || isUpdating}
                className="px-8 h-11 text-base font-semibold shadow-md"
              >
                {isCreating || isUpdating ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  t("common.save")
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="mx-auto lg:px-24 md:px-16 px-4">
          <form
            id="problem-form"
            onSubmit={handleSubmit}
            className="max-w-5xl mx-auto space-y-8"
            noValidate
          >
            {/* ── SECTION 1: Meta Information ── */}
            <div className="bg-background rounded-2xl border shadow-sm p-6 lg:p-8 space-y-6">
              <div className="flex items-center gap-2 border-b pb-3 mb-6">
                <HelpCircle className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-bold">
                  {t("admin.problems.basicInfo")}
                </h3>
              </div>
              <div className="flex flex-col md:flex-row gap-6 bg-muted/20 p-5 rounded-xl border">
                <div id="field-StageId" className="flex-1">
                  <label className="block mb-2 text-sm font-semibold">
                    {t("admin.problems.stage")}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={form.StageId ? form.StageId.toString() : undefined}
                    onValueChange={(v) => {
                      setForm((f) => ({
                        ...f,
                        StageId: Number(v),
                        CategoryId: 0,
                      }));
                      clearError("StageId");
                    }}
                  >
                    <SelectTrigger
                      className={cn(
                        "h-12 bg-background",
                        formErrors.StageId && "border-red-500",
                      )}
                    >
                      <SelectValue placeholder={t("common.select")} />
                    </SelectTrigger>
                    <SelectContent>
                      {stages?.map((s) => (
                        <SelectItem key={s.Id} value={s.Id.toString()}>
                          {locale === "ar" ? s.NameAr : s.NameEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError id="StageId" />
                </div>
                <div id="field-CategoryId" className="flex-1">
                  <label className="block mb-2 text-sm font-semibold">
                    {t("admin.problems.category")}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={
                      form.CategoryId ? form.CategoryId.toString() : undefined
                    }
                    onValueChange={(v) => {
                      setForm((f) => ({ ...f, CategoryId: Number(v) }));
                      clearError("CategoryId");
                    }}
                    disabled={!form.StageId}
                  >
                    <SelectTrigger
                      className={cn(
                        "h-12 bg-background",
                        formErrors.CategoryId && "border-red-500",
                      )}
                    >
                      <SelectValue
                        placeholder={
                          form.StageId
                            ? t("common.select")
                            : t("admin.problems.selectStageFirst")
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.Id} value={c.Id.toString()}>
                          {locale === "ar" ? c.NameAr : c.NameEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError id="CategoryId" />
                </div>
                <div id="field-Points" className="w-full md:w-32">
                  <label className="block mb-2 text-sm font-semibold">
                    {t("admin.problems.points")}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    min={1}
                    value={form.Points}
                    onChange={(e) => {
                      setForm((f) => ({
                        ...f,
                        Points: Number(e.target.value),
                      }));
                      clearError("Points");
                    }}
                    className={cn(
                      "h-12 bg-background",
                      formErrors.Points && "border-red-500",
                    )}
                  />
                  <FieldError id="Points" />
                </div>
              </div>
            </div>

            {/* ── SECTION 2: Question Text (WITH LaTeX TOOLBAR & PREVIEW) ── */}
            <div className="bg-background rounded-2xl border shadow-sm p-6 lg:p-8 space-y-6">
              <div className="flex items-center gap-2 border-b pb-3 mb-6">
                <BookOpen className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-bold">
                  {t("admin.problems.questionDetails")}
                </h3>
              </div>

              <div className="space-y-8">
                {/* Arabic question */}
                <div id="field-QuestionTextAr">
                  <label className="block mb-2 text-sm font-semibold">
                    {t("admin.problems.questionAr")}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <TextareaWithToolbar
                    fieldKey="questionAr"
                    textareaRef={refQuestionAr}
                    value={form.QuestionTextAr}
                    onChange={(v) => {
                      setForm((f) => ({ ...f, QuestionTextAr: v }));
                      clearError("QuestionTextAr");
                    }}
                    dir="rtl"
                    rows={5}
                    hasError={!!formErrors.QuestionTextAr}
                    placeholder={t("admin.problems.questionArPlaceholder")}
                  />
                  <FieldError id="QuestionTextAr" />

                  {/* Arabic question preview */}
                  {form.QuestionTextAr && (
                    <div className="mt-4 p-5 bg-muted/10 rounded-xl border-2 border-dashed border-primary/20">
                      <div className="text-xs font-bold text-muted-foreground mb-3 flex items-center gap-2">
                        <Eye className="w-4 h-4 text-primary" /> {t("admin.problems.questionPreview")}
                      </div>
                      <RichText text={form.QuestionTextAr} isArabic={true} />
                    </div>
                  )}
                </div>

                {/* English question */}
                <div id="field-QuestionTextEn">
                  <label className="block mb-2 text-sm font-semibold">
                    {t("admin.problems.questionEn")}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <TextareaWithToolbar
                    fieldKey="questionEn"
                    textareaRef={refQuestionEn}
                    value={form.QuestionTextEn}
                    onChange={(v) => {
                      setForm((f) => ({ ...f, QuestionTextEn: v }));
                      clearError("QuestionTextEn");
                    }}
                    dir="ltr"
                    rows={5}
                    hasError={!!formErrors.QuestionTextEn}
                    placeholder={t("admin.problems.questionEnPlaceholder")}
                  />
                  <FieldError id="QuestionTextEn" />

                  {/* English question preview */}
                  {form.QuestionTextEn && (
                    <div
                      className="mt-4 p-5 bg-muted/10 rounded-xl border-2 border-dashed border-primary/20"
                      dir="ltr"
                    >
                      <div className="text-xs font-bold text-muted-foreground mb-3 flex items-center gap-2">
                        <Eye className="w-4 h-4 text-primary" /> {t("admin.problems.questionPreview")}
                      </div>
                      <RichText text={form.QuestionTextEn} isArabic={false} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── SECTION 3: Options ── */}
            <div className="bg-background rounded-2xl border shadow-sm p-6 lg:p-8 space-y-6">
              <div className="flex items-center justify-between border-b pb-3 mb-6">
                <div className="flex items-center gap-2">
                  <ListChecks className="w-5 h-5 text-primary" />
                  <h3 className="text-xl font-bold">
                    {t("admin.problems.options")}{" "}
                    <span className="text-red-500">*</span>
                  </h3>
                </div>
                {formErrors.correctAnswer && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {formErrors.correctAnswer}
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {form.Options.map((opt, idx) => (
                  <div
                    key={idx}
                    id={`field-opt_${idx}`}
                    className={cn(
                      "p-6 border-2 rounded-xl flex flex-col gap-5 transition-all duration-300",
                      opt.IsCorrect
                        ? "bg-green-500/5 border-green-500/40 shadow-[0_0_15px_#22C55E1A]"
                        : formErrors[`opt_${idx}_Latex`]
                          ? "bg-red-500/5 border-red-500/40"
                          : "bg-card hover:border-border/80 hover:shadow-sm",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base font-bold text-muted-foreground flex items-center gap-2">
                        <span className="bg-muted px-3 py-1 rounded-md text-foreground">
                          {idx + 1}
                        </span>
                        {t("admin.problems.optionLabel", { number: idx + 1 })}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateOption(idx, "IsCorrect", !opt.IsCorrect)
                        }
                        className={cn(
                          "flex items-center gap-2 text-sm px-4 py-2 rounded-lg transition-all duration-300 border",
                          opt.IsCorrect
                            ? "text-green-700 bg-green-100 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800 font-bold shadow-sm"
                            : "text-muted-foreground hover:bg-muted border-transparent",
                        )}
                      >
                        {opt.IsCorrect ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          <Circle className="h-5 w-5" />
                        )}
                        {opt.IsCorrect
                          ? t("admin.problems.correctAnswer")
                          : t("admin.problems.markAsCorrect")}
                      </button>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-muted-foreground mb-2 block">
                        {t("admin.problems.optionLatexLabel")}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <TextareaWithToolbar
                        fieldKey={`opt_${idx}`}
                        textareaRef={refOptLatex[idx]}
                        value={opt.LatexCode}
                        onChange={(v) => updateOption(idx, "LatexCode", v)}
                        dir="ltr"
                        rows={2}
                        compact
                        placeholder="\\frac{x}{y}"
                        hasError={!!formErrors[`opt_${idx}_Latex`]}
                      />
                      <FieldError id={`opt_${idx}_Latex`} />
                      {opt.LatexCode && (
                        <div className="mt-3 px-4 py-3 bg-background rounded-lg shadow-sm border text-center">
                          <LatexPreview latex={opt.LatexCode} block />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── SECTION 4: Solutions ── */}
            <div className="bg-background rounded-2xl border shadow-sm p-6 lg:p-8 space-y-6 mb-8">
              <div className="flex items-center gap-2 border-b pb-3 mb-6">
                <Lightbulb className="w-5 h-5 text-green-600" />
                <h3 className="text-xl font-bold">
                  {t("admin.problems.detailedSolutionsSection")}{" "}
                  <span className="text-red-500">*</span>
                </h3>
              </div>
              <div className="bg-red-50/50 dark:bg-red-900/10 p-5 rounded-xl border border-red-100 dark:border-red-900/30 mb-6">
                <label className="flex items-center gap-2 mb-2 text-sm font-bold text-red-600 dark:text-red-400">
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-6 h-6"
                  >
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                  {t("admin.problems.youtubeUrlLabel")}
                </label>
                <Input
                  dir="ltr"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={form.YoutubeSolutionUrl || ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      YoutubeSolutionUrl: e.target.value,
                    }))
                  }
                  className="h-11 bg-background"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {t("admin.problems.youtubeUrlDescription")}
                </p>
              </div>
              <div className="space-y-8">
                {/* Arabic solution */}
                <div id="field-DetailedSolutionAr">
                  <label className="block mb-2 text-sm font-semibold">
                    {t("admin.problems.detailedSolutionAr")}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <TextareaWithToolbar
                    fieldKey="solutionAr"
                    textareaRef={refSolutionAr}
                    value={form.DetailedSolutionAr || ""}
                    onChange={(v) => {
                      setForm((f) => ({ ...f, DetailedSolutionAr: v }));
                      clearError("DetailedSolutionAr");
                    }}
                    dir="rtl"
                    rows={6}
                    hasError={!!formErrors.DetailedSolutionAr}
                  />
                  <FieldError id="DetailedSolutionAr" />

                  {/* Arabic solution preview */}
                  {form.DetailedSolutionAr && (
                    <div className="mt-4 p-5 bg-muted/10 rounded-xl border-2 border-dashed border-green-500/30">
                      <div className="text-xs font-bold text-green-600 dark:text-green-500 mb-3 flex items-center gap-2">
                        <Eye className="w-4 h-4" /> {t("admin.problems.solutionPreview")}
                      </div>
                      <RichText
                        text={form.DetailedSolutionAr}
                        isArabic={true}
                      />
                    </div>
                  )}
                </div>

                {/* English solution */}
                <div id="field-DetailedSolutionEn">
                  <label className="block mb-2 text-sm font-semibold">
                    {t("admin.problems.detailedSolutionEn")}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <TextareaWithToolbar
                    fieldKey="solutionEn"
                    textareaRef={refSolutionEn}
                    value={form.DetailedSolutionEn || ""}
                    onChange={(v) => {
                      setForm((f) => ({ ...f, DetailedSolutionEn: v }));
                      clearError("DetailedSolutionEn");
                    }}
                    dir="ltr"
                    rows={6}
                    hasError={!!formErrors.DetailedSolutionEn}
                  />
                  <FieldError id="DetailedSolutionEn" />

                  {/* English solution preview */}
                  {form.DetailedSolutionEn && (
                    <div
                      className="mt-4 p-5 bg-muted/10 rounded-xl border-2 border-dashed border-green-500/30"
                      dir="ltr"
                    >
                      <div className="text-xs font-bold text-green-600 dark:text-green-500 mb-3 flex items-center gap-2">
                        <Eye className="w-4 h-4" /> Preview
                      </div>
                      <RichText
                        text={form.DetailedSolutionEn}
                        isArabic={false}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════
     RENDER LIST VIEW
     ══════════════════════════════════════════ */
  return (
    // TooltipProvider is configured globally.
    <div className="mx-auto lg:px-24 md:px-16 px-4 py-8 space-y-6">
      <Breadcrumbs
        items={[
          { label: t("nav.admin"), href: "/admin" },
          { label: t("admin.problems.title") },
        ]}
        className="mb-6"
      />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t("admin.problems.title")}</h1>
          <p className="text-muted-foreground mt-1">
            {t("admin.problems.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {!isSearching && totalProblems > 0 && (
            <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium">
              {t("admin.problems.total")}: {totalProblems}
            </span>
          )}
          <Link href={`/${locale}/admin/problems/guide`}>
            <Button variant="outline" className="gap-2 shadow-sm" size="lg">
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="hidden sm:inline">{t("nav.guide")}</span>
            </Button>
          </Link>
          <Button
            onClick={() => openForm()}
            className="gap-2 shadow-md"
            size="lg"
          >
            <Plus className="h-5 w-5" />
            {t("admin.problems.addNew")}
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 w-full md:w-auto">
              <Input
                placeholder={t("admin.problems.searchPlaceholder")}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="h-11 bg-muted/50"
              />
            </div>
            <Select
              value={filters.StageId?.toString() ?? ""}
              onValueChange={(v) =>
                setFilters((prev) => ({
                  ...prev,
                  StageId: v === "all" ? undefined : Number(v),
                  CategoryId: undefined,
                  Page: 1,
                }))
              }
            >
              <SelectTrigger className="h-11 w-full md:w-[160px] bg-muted/50">
                <SelectValue placeholder={t("admin.problems.stage")} />
              </SelectTrigger>
              <SelectContent>
                {stages?.map((s) => (
                  <SelectItem key={s.Id} value={s.Id.toString()}>
                    {locale === "ar" ? s.NameAr : s.NameEn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.CategoryId?.toString() ?? ""}
              onValueChange={(v) =>
                setFilters((prev) => ({
                  ...prev,
                  CategoryId: v === "all" ? undefined : Number(v),
                  Page: 1,
                }))
              }
              disabled={!filters.StageId}
            >
              <SelectTrigger className="h-11 w-full md:w-[180px] bg-muted/50">
                <SelectValue
                  placeholder={
                    filters.StageId
                      ? t("admin.problems.category")
                      : t("admin.problems.selectStageFirst")
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {filteredCategoriesForFilter.map((c) => (
                  <SelectItem key={c.Id} value={c.Id.toString()}>
                    {locale === "ar" ? c.NameAr : c.NameEn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              className="h-11 w-11 shrink-0"
              onClick={handleResetFilters}
            >
              <RotateCcw className="h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0 relative">
          {isFetching && !isSearching && (
            <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10 backdrop-blur-sm">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-center">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="p-5 font-semibold">ID</th>
                  <th className="p-5 font-semibold text-start">
                    {t("admin.problems.titleAr")}
                  </th>
                  <th className="p-5 font-semibold">
                    {t("admin.problems.stage")}
                  </th>
                  <th className="p-5 font-semibold">
                    {t("admin.problems.category")}
                  </th>
                  <th className="p-5 font-semibold">
                    {t("admin.problems.points")}
                  </th>
                  <th className="p-5 font-semibold">{t("common.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {isSearching ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-12 text-center text-muted-foreground"
                    >
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        <span className="font-medium">
                          {t("common.loading")}
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : problems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-16 text-center text-muted-foreground bg-muted/10"
                    >
                      <div className="flex flex-col items-center justify-center gap-3">
                        <HelpCircle className="h-10 w-10 text-muted-foreground/40" />
                        <p className="text-lg">
                          {t("admin.problems.noProblems")}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  problems.map((p) => (
                    <tr
                      key={p.Id}
                      className="border-b hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-5 font-mono text-sm text-muted-foreground">
                        #{p.Id}
                      </td>
                      <td className="p-5 text-start max-w-[300px]">
                        <div className="line-clamp-2 font-semibold">
                          <RichText
                            text={p.TitleAr || ""}
                            isArabic={true}
                            className="m-0 p-0 text-sm prose-p:m-0 prose-p:inline"
                          />
                        </div>
                      </td>
                      <td className="p-5">
                        <Badge className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
                          {getStageName(p.StageId)}
                        </Badge>
                      </td>
                      <td className="p-5 text-muted-foreground font-medium">
                        {getCategoryName(p.CategoryId)}
                      </td>
                      <td className="p-5">
                        <Badge
                          variant="secondary"
                          className="font-bold text-sm px-3 py-1"
                        >
                          {p.Points ?? "-"}
                        </Badge>
                      </td>
                      <td className="p-5 space-x-2 rtl:space-x-reverse">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setViewingProblem(p)}
                              className="hover:text-primary hover:bg-primary/10"
                            >
                              <Eye className="h-4 w-4 text-blue-500" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent
                            side="top"
                            className="shadow-md rounded-lg border-0"
                          >
                            <p>{t("common.view")}</p>
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openForm(p)}
                              className="hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            >
                              <Pencil className="h-4 w-4 text-green-500" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent
                            side="top"
                            className="shadow-md rounded-lg border-0"
                          >
                            <p>{t("common.edit")}</p>
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-block">
                              <PopoverConfirm
                                onConfirm={() => handleDelete(p.Id!)}
                                title={t("common.confirmDeleteTitle")}
                                description={t("admin.problems.confirmDelete")}
                                confirmText={t("common.delete")}
                                cancelText={t("common.cancel")}
                                isLoading={deletingId === p.Id}
                                trigger={
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    disabled={deletingId === p.Id}
                                    className="hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                }
                              />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent
                            side="top"
                            className="shadow-md rounded-lg border-0"
                          >
                            <p>{t("common.delete")}</p>
                          </TooltipContent>
                        </Tooltip>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/20">
            <span className="text-sm text-muted-foreground font-medium">
              {t("common.page")} {filters.Page} {t("common.of")} {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={filters.Page <= 1}
                onClick={() =>
                  setFilters((prev) => ({ ...prev, Page: prev.Page - 1 }))
                }
              >
                <ChevronLeft className="me-1 h-4 w-4 rtl:rotate-180" />
                {t("common.previous")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={filters.Page >= totalPages}
                onClick={() =>
                  setFilters((prev) => ({ ...prev, Page: prev.Page + 1 }))
                }
              >
                {t("common.next")}
                <ChevronRight className="ms-1 h-4 w-4 rtl:rotate-180" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Problem details dialog */}
      <Dialog
        open={!!viewingProblem}
        onOpenChange={() => setViewingProblem(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="sr-only">
              {viewingProblem?.TitleAr || t("admin.problems.viewDetails")}
            </DialogTitle>

            <div className="flex flex-wrap items-center gap-3 pb-4 border-b">
              <Badge className="px-4 py-2 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-base font-semibold flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                {getStageName(viewingProblem?.StageId || 0)}
              </Badge>
              <Badge className="px-4 py-2 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 text-base font-semibold flex items-center gap-2">
                <ListChecks className="h-4 w-4" />
                {getCategoryName(viewingProblem?.CategoryId || 0)}
              </Badge>
              <Badge className="px-4 py-2 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 text-base font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                {viewingProblem?.Points} {t("admin.problems.points")}
              </Badge>
            </div>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-primary flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  {t("admin.problems.questionAr")}
                </label>
                <div className="bg-muted/20 p-4 rounded-xl border">
                  <RichText
                    text={viewingProblem?.QuestionTextAr || ""}
                    isArabic
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-primary flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  {t("admin.problems.questionEn")}
                </label>
                <div className="bg-muted/20 p-4 rounded-xl border" dir="ltr">
                  <RichText
                    text={viewingProblem?.QuestionTextEn || ""}
                    isArabic={false}
                  />
                </div>
              </div>
            </div>

            {viewingProblem?.YoutubeSolutionUrl && (
              <div className="bg-red-50/50 dark:bg-red-900/10 p-4 rounded-xl border border-red-200 dark:border-red-800/50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-sm">
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-6 h-6"
                  >
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                  {t("admin.problems.youtubeVideoExists")}
                </div>
                <a
                  href={viewingProblem.YoutubeSolutionUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-blue-600 underline"
                >
                  {t("admin.problems.watchVideo")}
                </a>
              </div>
            )}

            <div className="space-y-4">
              {viewingProblem?.DetailedSolutionAr && (
                <div className="space-y-2">
                  <label className="text-sm font-bold text-green-600 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    {t("admin.problems.detailedSolutionAr")}
                  </label>
                  <div className="bg-green-50/50 dark:bg-green-900/10 p-4 rounded-xl border border-green-200 dark:border-green-800/50">
                    <RichText
                      text={viewingProblem.DetailedSolutionAr}
                      isArabic
                    />
                  </div>
                </div>
              )}
              {viewingProblem?.DetailedSolutionEn && (
                <div className="space-y-2">
                  <label className="text-sm font-bold text-green-600 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    {t("admin.problems.detailedSolutionEn")}
                  </label>
                  <div className="bg-green-50/50 dark:bg-green-900/10 p-4 rounded-xl border border-green-200 dark:border-green-800/50">
                    <RichText
                      text={viewingProblem.DetailedSolutionEn}
                      isArabic={false}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-primary flex items-center gap-2">
                <ListChecks className="h-4 w-4" />
                {t("admin.problems.options")}
              </label>
              <div className="space-y-3">
                {[...(viewingProblem?.Options || [])]
                  .sort((a, b) => a.Order - b.Order)
                  .map((opt) => (
                    <div
                      key={opt.Order}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-xl border shadow-sm",
                        opt.IsCorrect
                          ? "bg-green-50/80 border-green-300 dark:bg-green-900/20 dark:border-green-800/80"
                          : "bg-card",
                      )}
                    >
                      {opt.IsCorrect ? (
                        <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0" />
                      ) : (
                        <Circle className="h-6 w-6 text-muted-foreground/30 shrink-0" />
                      )}
                      <div className="flex-1">
                        <LatexPreview latex={opt.LatexCode} />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
