"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link"; // ✅ تمت إضافة الاستيراد هنا
import {
  useLazyGetAdminProblemsQuery,
  useCreateProblemMutation,
  useUpdateProblemMutation,
  useDeleteProblemMutation,
  type CreateProblemRequest,
  type AdminProblemResponse,
} from "@/store/api/problemsApi";
import { useGetAdminCategoriesQuery } from "@/store/api/categoriesApi";
import { useGetAdminTagsQuery } from "@/store/api/tagsApi";
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
  ArrowRight,
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

/* ────────────────────────────────────────────
   TYPES
   ──────────────────────────────────────────── */

type FormErrors = Record<string, string>;

type ActiveField =
  | "mainLatex"
  | "solutionAr"
  | "solutionEn"
  | `opt_${number}`
  | null;

interface ExtendedCreateProblemRequest extends Omit<
  CreateProblemRequest,
  "YoutubeSolutionUrl"
> {
  YoutubeSolutionUrl?: string;
}

/* ────────────────────────────────────────────
   SOLUTION TEXT
   ──────────────────────────────────────────── */

function SolutionText({ text, isArabic }: { text: string; isArabic: boolean }) {
  if (!text) return null;
  const TOKEN = /(\$\$[\s\S]+?\$\$|\$[^\n$]+?\$)/g;
  const parts = text.split(TOKEN);

  return (
    <div
      dir={isArabic ? "rtl" : "ltr"}
      className={`prose max-w-none text-sm leading-loose ${
        isArabic ? "text-right" : "text-left"
      }`}
    >
      {parts.map((part, i) => {
        if (part.startsWith("$$") && part.endsWith("$$"))
          return (
            <LatexPreview key={i} latex={part.slice(2, -2).trim()} block />
          );
        if (part.startsWith("$") && part.endsWith("$") && part.length > 2)
          return <LatexPreview key={i} latex={part.slice(1, -1).trim()} />;
        return <span key={i}>{part}</span>;
      })}
    </div>
  );
}

/* ────────────────────────────────────────────
   CONSTANTS
   ──────────────────────────────────────────── */

const emptyForm: ExtendedCreateProblemRequest = {
  TitleAr: "",
  TitleEn: "",
  QuestionTextAr: "",
  QuestionTextEn: "",
  LatexCode: "",
  DetailedSolutionAr: "",
  DetailedSolutionEn: "",
  YoutubeSolutionUrl: "",
  StageId: 0,
  Points: 10,
  CategoryId: 0,
  TagIds: [],
  Options: [
    { TextAr: "", TextEn: "", LatexCode: "", IsCorrect: false, Order: 1 },
    { TextAr: "", TextEn: "", LatexCode: "", IsCorrect: false, Order: 2 },
    { TextAr: "", TextEn: "", LatexCode: "", IsCorrect: false, Order: 3 },
    { TextAr: "", TextEn: "", LatexCode: "", IsCorrect: false, Order: 4 },
  ],
};

const defaultFilters = {
  CategoryId: undefined as number | undefined,
  StageId: undefined as number | undefined,
  TagId: undefined as number | undefined,
  Page: 1,
  PageSize: 5,
};

/* ────────────────────────────────────────────
   MAIN COMPONENT
   ──────────────────────────────────────────── */

export default function AdminProblemsPage() {
  const t = useTranslations();
  const locale = useLocale();
  const isRtl = locale === "ar";
  const isAr = locale === "ar";

  /* ── View State ── */
  const [view, setView] = useState<"list" | "form">("list");

  /* ── Search & filter state ── */
  const [searchText, setSearchText] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [filters, setFilters] = useState(defaultFilters);

  /* ── API queries ── */
  const [
    fetchProblems,
    { data: searchResult, isLoading: isSearching, isFetching },
  ] = useLazyGetAdminProblemsQuery();

  const problems = searchResult?.Results || [];
  const totalPages = searchResult?.TotalPages || 1;
  const totalProblems = searchResult?.Total || 0;

  const { data: categories } = useGetAdminCategoriesQuery();
  const { data: tags } = useGetAdminTagsQuery();
  const { data: stages } = useGetAdminStagesQuery();

  const [createProblem, { isLoading: isCreating }] = useCreateProblemMutation();
  const [updateProblem, { isLoading: isUpdating }] = useUpdateProblemMutation();
  const [deleteProblem] = useDeleteProblemMutation();

  /* ── Form state ── */
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [form, setForm] = useState<ExtendedCreateProblemRequest>(emptyForm);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [viewingProblem, setViewingProblem] =
    useState<AdminProblemResponse | null>(null);

  /* ── Toolbar Refs ── */
  const refMainLatex = useRef<HTMLTextAreaElement>(null);
  const refSolutionAr = useRef<HTMLTextAreaElement>(null);
  const refSolutionEn = useRef<HTMLTextAreaElement>(null);
  const refOptLatex = [
    useRef<HTMLTextAreaElement>(null),
    useRef<HTMLTextAreaElement>(null),
    useRef<HTMLTextAreaElement>(null),
    useRef<HTMLTextAreaElement>(null),
  ] as const;

  const [activeField, setActiveField] = useState<ActiveField>(null);

  /* ── Validation ── */
  const validateForm = useCallback((): boolean => {
    const errors: FormErrors = {};

    if (!form.TitleAr.trim()) errors.TitleAr = t("common.required");
    if (!form.TitleEn.trim()) errors.TitleEn = t("common.required");
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
      if (!opt.TextAr.trim())
        errors[`opt_${idx}_TextAr`] = t("common.required");
      if (!opt.TextEn.trim())
        errors[`opt_${idx}_TextEn`] = t("common.required");
    });

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      const firstErrorField = document.getElementById(
        `field-${Object.keys(errors)[0]}`,
      );
      firstErrorField?.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    return Object.keys(errors).length === 0;
  }, [form, t]);

  const clearError = (key: string) => {
    setFormErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  /* ── Effects ── */
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
      tagId: filters.TagId,
      Page: filters.Page,
      PageSize: filters.PageSize,
    });
  }, [debouncedQ, filters, fetchProblems]);

  /* ── Handlers ── */
  const handleResetFilters = () => {
    setSearchText("");
    setDebouncedQ("");
    setFilters(defaultFilters);
  };

  const openForm = (problem?: AdminProblemResponse) => {
    if (problem) {
      setEditingId(problem.Id || null);
      setForm({
        TitleAr: problem.TitleAr,
        TitleEn: problem.TitleEn,
        QuestionTextAr: problem.QuestionTextAr,
        QuestionTextEn: problem.QuestionTextEn,
        LatexCode: problem.LatexCode || "",
        DetailedSolutionAr: problem.DetailedSolutionAr || "",
        DetailedSolutionEn: problem.DetailedSolutionEn || "",
        YoutubeSolutionUrl: (problem as any).YoutubeSolutionUrl || "",
        StageId: problem.StageId,
        Points: problem.Points,
        CategoryId: problem.CategoryId,
        TagIds: problem.TagIds || [],
        Options: problem.Options.map((opt) => ({
          TextAr: opt.TextAr,
          TextEn: opt.TextEn,
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
      const cleanedForm: ExtendedCreateProblemRequest = {
        ...form,
        LatexCode: form.LatexCode?.trim() || "",
        DetailedSolutionAr: form.DetailedSolutionAr?.trim() || "",
        DetailedSolutionEn: form.DetailedSolutionEn?.trim() || "",
        YoutubeSolutionUrl: form.YoutubeSolutionUrl?.trim() || "",
        Options: form.Options.map((opt) => ({
          ...opt,
          TextAr: opt.TextAr.trim(),
          TextEn: opt.TextEn.trim(),
          LatexCode: opt.LatexCode?.trim() || "",
        })),
      };

      if (editingId) {
        await updateProblem({
          Id: editingId,
          Data: cleanedForm as CreateProblemRequest,
        }).unwrap();
      } else {
        await createProblem(cleanedForm as CreateProblemRequest).unwrap();
      }
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
      console.error("Failed to delete problem", error);
    } finally {
      setDeletingId(null);
    }
  };

  const updateOption = <K extends keyof CreateProblemRequest["Options"][0]>(
    index: number,
    field: K,
    value: CreateProblemRequest["Options"][0][K],
  ) => {
    setForm((prev) => {
      const newOpts = prev.Options.map((o) => ({ ...o }));
      if (field === "IsCorrect" && value === true) {
        newOpts.forEach((_, i) => {
          newOpts[i] = { ...newOpts[i], IsCorrect: i === index };
        });
      } else if (field === "IsCorrect" && value === false) {
        return prev;
      } else {
        newOpts[index] = { ...newOpts[index], [field]: value };
      }
      return { ...prev, Options: newOpts };
    });

    if (field === "TextAr") clearError(`opt_${index}_TextAr`);
    if (field === "TextEn") clearError(`opt_${index}_TextEn`);
    if (field === "IsCorrect") clearError("correctAnswer");
  };

  const getStageName = (stageId: number) =>
    stages?.find((s) => s.Id === stageId)?.NameAr || "";

  /* ── Sub-components ── */
  const FieldError = ({ id }: { id: string }) =>
    formErrors[id] ? (
      <p className="mt-1 text-xs text-red-500 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
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
              ? "border-red-500 shadow-sm shadow-red-500/10"
              : "border-input hover:border-border/80",
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
          className={cn(
            "border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 resize-y min-h-[80px]",
            dir === "ltr" && "font-mono text-sm",
          )}
        />
      </div>
    );
  };

  /* ══════════════════════════════════════════
     RENDER FORM VIEW (PAGE MODE)
     ══════════════════════════════════════════ */
  if (view === "form") {
    return (
      <div className="min-h-screen bg-muted/10 pb-20">
        {/* Sticky Header */}
        <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b shadow-sm mb-8">
          <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={closeForm}
                className="rounded-full hover:bg-muted"
              >
                {isRtl ? (
                  <ArrowRight className="h-5 w-5" />
                ) : (
                  <ArrowLeft className="h-5 w-5" />
                )}
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
              {/* ✅ زر فتح الدليل في صفحة جديدة حتى لا يضيع تعب الإدخال */}
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

        {/* Form Content */}
        <div className="container mx-auto px-4">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div id="field-TitleAr">
                  <label className="block mb-2 text-sm font-semibold">
                    {t("admin.problems.titleAr")}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <Input
                    dir="rtl"
                    value={form.TitleAr}
                    onChange={(e) => {
                      setForm((f) => ({ ...f, TitleAr: e.target.value }));
                      clearError("TitleAr");
                    }}
                    className={cn(
                      "h-12",
                      formErrors.TitleAr &&
                        "border-red-500 focus-visible:ring-red-500",
                    )}
                  />
                  <FieldError id="TitleAr" />
                </div>
                <div id="field-TitleEn">
                  <label className="block mb-2 text-sm font-semibold">
                    {t("admin.problems.titleEn")}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <Input
                    dir="ltr"
                    value={form.TitleEn}
                    onChange={(e) => {
                      setForm((f) => ({ ...f, TitleEn: e.target.value }));
                      clearError("TitleEn");
                    }}
                    className={cn(
                      "h-12",
                      formErrors.TitleEn &&
                        "border-red-500 focus-visible:ring-red-500",
                    )}
                  />
                  <FieldError id="TitleEn" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-muted/20 p-5 rounded-xl border">
                <div id="field-CategoryId">
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
                  >
                    <SelectTrigger
                      className={cn(
                        "h-12 bg-background",
                        formErrors.CategoryId && "border-red-500",
                      )}
                    >
                      <SelectValue placeholder={t("common.select")} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((c) => (
                        <SelectItem key={c.Id} value={c.Id.toString()}>
                          {c.NameAr}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError id="CategoryId" />
                </div>

                <div id="field-StageId">
                  <label className="block mb-2 text-sm font-semibold">
                    {t("admin.problems.stage")}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={form.StageId ? form.StageId.toString() : undefined}
                    onValueChange={(v) => {
                      setForm((f) => ({ ...f, StageId: Number(v) }));
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
                          {s.NameAr}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError id="StageId" />
                </div>

                <div id="field-Points">
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

              <div>
                <label className="block mb-3 text-sm font-semibold">
                  {t("admin.problems.tags")}
                </label>
                <div className="flex flex-wrap gap-2 p-4 border rounded-xl bg-muted/10 min-h-[60px]">
                  {tags?.map((tag) => {
                    const isSelected = form.TagIds?.includes(tag.Id);
                    return (
                      <button
                        key={tag.Id}
                        type="button"
                        className={cn(
                          "px-4 py-2 rounded-lg text-sm border transition-all duration-200 font-medium",
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary shadow-md scale-105"
                            : "bg-background hover:bg-muted border-border",
                        )}
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            TagIds: isSelected
                              ? prev.TagIds?.filter((id) => id !== tag.Id)
                              : [...(prev.TagIds || []), tag.Id],
                          }))
                        }
                      >
                        {tag.Text}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ── SECTION 2: Question & Math Setup ── */}
            <div className="bg-background rounded-2xl border shadow-sm p-6 lg:p-8 space-y-6">
              <div className="flex items-center gap-2 border-b pb-3 mb-6">
                <BookOpen className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-bold">
                  {t("admin.problems.questionDetails")}
                </h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="lg:col-span-2">
                  <label className="block mb-2 text-sm font-semibold">
                    {t("admin.problems.latexCode")}{" "}
                    {t("admin.problems.mainLatexNote")}
                  </label>
                  <TextareaWithToolbar
                    fieldKey="mainLatex"
                    textareaRef={refMainLatex}
                    value={form.LatexCode || ""}
                    onChange={(v) => setForm((f) => ({ ...f, LatexCode: v }))}
                    dir="ltr"
                    rows={4}
                    placeholder="e.g. \int_{0}^{\infty} e^{-x^2} dx"
                  />
                  {form.LatexCode && (
                    <div className="mt-3 p-6 bg-muted/30 rounded-xl border border-dashed border-primary/30 flex flex-col items-center justify-center">
                      <p className="text-sm text-muted-foreground mb-4 w-full text-start font-medium">
                        {t("admin.problems.equationPreview")}
                      </p>
                      <LatexPreview
                        latex={form.LatexCode}
                        block
                        className="text-xl"
                      />
                    </div>
                  )}
                </div>

                <div id="field-QuestionTextAr">
                  <label className="block mb-2 text-sm font-semibold">
                    {t("admin.problems.questionAr")}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    dir="rtl"
                    rows={5}
                    value={form.QuestionTextAr}
                    onChange={(e) => {
                      setForm((f) => ({
                        ...f,
                        QuestionTextAr: e.target.value,
                      }));
                      clearError("QuestionTextAr");
                    }}
                    className={cn(
                      "resize-y text-base p-4",
                      formErrors.QuestionTextAr &&
                        "border-red-500 focus-visible:ring-red-500",
                    )}
                    placeholder={t("admin.problems.questionArPlaceholder")}
                  />
                  <FieldError id="QuestionTextAr" />
                </div>
                <div id="field-QuestionTextEn">
                  <label className="block mb-2 text-sm font-semibold">
                    {t("admin.problems.questionEn")}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    dir="ltr"
                    rows={5}
                    value={form.QuestionTextEn}
                    onChange={(e) => {
                      setForm((f) => ({
                        ...f,
                        QuestionTextEn: e.target.value,
                      }));
                      clearError("QuestionTextEn");
                    }}
                    className={cn(
                      "resize-y text-base p-4",
                      formErrors.QuestionTextEn &&
                        "border-red-500 focus-visible:ring-red-500",
                    )}
                    placeholder={t("admin.problems.questionEnPlaceholder")}
                  />
                  <FieldError id="QuestionTextEn" />
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
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm animate-pulse">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {formErrors.correctAnswer}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {form.Options.map((opt, idx) => (
                  <div
                    key={idx}
                    id={`field-opt_${idx}`}
                    className={cn(
                      "p-6 border-2 rounded-xl flex flex-col gap-5 transition-all duration-300",
                      opt.IsCorrect
                        ? "bg-green-500/5 border-green-500/40 shadow-[0_0_15px_rgba(34,197,94,0.1)]"
                        : formErrors[`opt_${idx}_TextAr`] ||
                            formErrors[`opt_${idx}_TextEn`]
                          ? "bg-red-500/5 border-red-500/40"
                          : "bg-card hover:border-border/80 hover:shadow-sm",
                    )}
                  >
                    <div className="flex items-center justify-between border-b pb-4">
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

                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Input
                          dir="rtl"
                          placeholder={t("admin.problems.optionTextAr")}
                          value={opt.TextAr}
                          onChange={(e) =>
                            updateOption(idx, "TextAr", e.target.value)
                          }
                          className={cn(
                            "h-11",
                            formErrors[`opt_${idx}_TextAr`] && "border-red-500",
                          )}
                        />
                        <FieldError id={`opt_${idx}_TextAr`} />
                      </div>
                      <div>
                        <Input
                          dir="ltr"
                          placeholder={t("admin.problems.optionTextEn")}
                          value={opt.TextEn}
                          onChange={(e) =>
                            updateOption(idx, "TextEn", e.target.value)
                          }
                          className={cn(
                            "h-11",
                            formErrors[`opt_${idx}_TextEn`] && "border-red-500",
                          )}
                        />
                        <FieldError id={`opt_${idx}_TextEn`} />
                      </div>
                    </div>

                    <div className="mt-2">
                      <label className="text-sm font-semibold text-muted-foreground mb-2 block">
                        {t("admin.problems.optionLatexLabel")}
                      </label>
                      <TextareaWithToolbar
                        fieldKey={`opt_${idx}`}
                        textareaRef={
                          refOptLatex[
                            idx
                          ] as React.RefObject<HTMLTextAreaElement | null>
                        }
                        value={opt.LatexCode || ""}
                        onChange={(v) => updateOption(idx, "LatexCode", v)}
                        dir="ltr"
                        rows={2}
                        compact
                        placeholder="\frac{x}{y}"
                      />
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

            {/* ── SECTION 4: Detailed Solutions & Video ── */}
            <div className="bg-background rounded-2xl border shadow-sm p-6 lg:p-8 space-y-6 mb-8">
              <div className="flex items-center gap-2 border-b pb-3 mb-6">
                <Lightbulb className="w-5 h-5 text-green-600" />
                <h3 className="text-xl font-bold">
                  {t("admin.problems.detailedSolutionsSection")}{" "}
                  <span className="text-red-500">*</span>
                </h3>
              </div>

              {/* Youtube URL */}
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

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                </div>
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
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════
     RENDER LIST VIEW (TABLE)
     ══════════════════════════════════════════ */
  return (
    <div className="container mx-auto py-8 space-y-6">
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
          {/* ✅ تمت إضافة زر الدليل هنا */}
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
              value={filters.StageId?.toString() || "all"}
              onValueChange={(v) =>
                setFilters((prev) => ({
                  ...prev,
                  StageId: v === "all" ? undefined : Number(v),
                  Page: 1,
                }))
              }
            >
              <SelectTrigger className="h-11 w-full md:w-[160px] bg-muted/50">
                <SelectValue placeholder={t("admin.problems.stage")} />
              </SelectTrigger>
              <SelectContent>
                {stages?.map((stage) => (
                  <SelectItem key={stage.Id} value={stage.Id.toString()}>
                    {stage.NameAr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.CategoryId?.toString() || "all"}
              onValueChange={(v) =>
                setFilters((prev) => ({
                  ...prev,
                  CategoryId: v === "all" ? undefined : Number(v),
                  Page: 1,
                }))
              }
            >
              <SelectTrigger className="h-11 w-full md:w-[180px] bg-muted/50">
                <SelectValue placeholder={t("admin.problems.category")} />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((cat) => (
                  <SelectItem key={cat.Id} value={cat.Id.toString()}>
                    {cat.NameAr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.TagId?.toString() || "all"}
              onValueChange={(v) =>
                setFilters((prev) => ({
                  ...prev,
                  TagId: v === "all" ? undefined : Number(v),
                  Page: 1,
                }))
              }
            >
              <SelectTrigger className="h-11 w-full md:w-[180px] bg-muted/50">
                <SelectValue placeholder={t("admin.problems.tag")} />
              </SelectTrigger>
              <SelectContent>
                {tags?.map((tag) => (
                  <SelectItem key={tag.Id} value={tag.Id.toString()}>
                    {tag.Text}
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
                    {t("admin.problems.title")}
                  </th>
                  <th className="p-5 font-semibold">
                    {t("admin.problems.category")}
                  </th>
                  <th className="p-5 font-semibold">
                    {t("admin.problems.stage")}
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
                        <p className="text-lg">{t("common.noData")}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  problems.map((p) => {
                    const catName =
                      categories?.find((c) => c.Id === p.CategoryId)?.NameAr ||
                      "-";
                    const stageName = getStageName(p.StageId);
                    return (
                      <tr
                        key={p.Id}
                        className="border-b hover:bg-muted/30 transition-colors"
                      >
                        <td className="p-5 font-mono text-sm text-muted-foreground">
                          #{p.Id}
                        </td>
                        <td className="p-5 text-start max-w-[300px]">
                          <div className="flex flex-col gap-1.5">
                            <span className="font-semibold truncate">
                              {p.TitleAr}
                            </span>
                            <span
                              className="text-xs text-muted-foreground truncate"
                              dir="ltr"
                            >
                              {p.TitleEn}
                            </span>
                          </div>
                        </td>
                        <td className="p-5 text-muted-foreground font-medium">
                          {catName}
                        </td>
                        <td className="p-5">
                          <Badge className="px-3 py-1 bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
                            {stageName}
                          </Badge>
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
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setViewingProblem(p)}
                            className="hover:text-primary hover:bg-primary/10"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openForm(p)}
                            className="hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
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
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            }
                          />
                        </td>
                      </tr>
                    );
                  })
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
                {isRtl ? (
                  <ChevronRight className="h-4 w-4 ml-1" />
                ) : (
                  <ChevronLeft className="h-4 w-4 mr-1" />
                )}
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
                {isRtl ? (
                  <ChevronLeft className="h-4 w-4 mr-1" />
                ) : (
                  <ChevronRight className="h-4 w-4 ml-1" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ══════════════════════════════════════════
          VIEW DIALOG (POPUP ONLY FOR VIEWING)
          ══════════════════════════════════════════ */}
      <Dialog
        open={!!viewingProblem}
        onOpenChange={() => setViewingProblem(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              {viewingProblem?.TitleAr}
              <Badge className="px-2.5 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                {getStageName(viewingProblem?.StageId || 0)}
              </Badge>
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              {viewingProblem?.TitleEn}
            </p>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-sm">
                {
                  categories?.find((c) => c.Id === viewingProblem?.CategoryId)
                    ?.NameAr
                }
              </Badge>
              <Badge variant="outline" className="text-sm">
                {viewingProblem?.Points} {t("admin.problems.points")}
              </Badge>
              {viewingProblem?.TagIds?.map((tagId) => {
                const tag = tags?.find((t) => t.Id === tagId);
                return tag ? (
                  <Badge key={tagId} variant="secondary" className="text-sm">
                    {tag.Text}
                  </Badge>
                ) : null;
              })}
            </div>

            {viewingProblem?.LatexCode && (
              <div className="p-6 bg-muted/30 rounded-xl border border-dashed border-primary/30 text-center shadow-sm">
                <LatexPreview latex={viewingProblem.LatexCode} block />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-primary flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  {t("admin.problems.questionAr")}
                </label>
                <div className="bg-muted/20 p-4 rounded-xl border">
                  <SolutionText
                    text={viewingProblem?.QuestionTextAr || ""}
                    isArabic={true}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-primary flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  {t("admin.problems.questionEn")}
                </label>
                <div className="bg-muted/20 p-4 rounded-xl border" dir="ltr">
                  <SolutionText
                    text={viewingProblem?.QuestionTextEn || ""}
                    isArabic={false}
                  />
                </div>
              </div>
            </div>

            {(viewingProblem as any)?.YoutubeSolutionUrl && (
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
                  href={(viewingProblem as any).YoutubeSolutionUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-blue-600 underline"
                >
                  {t("admin.problems.watchVideo")}
                </a>
              </div>
            )}

            {(viewingProblem?.DetailedSolutionAr ||
              viewingProblem?.DetailedSolutionEn) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {viewingProblem?.DetailedSolutionAr && (
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-green-600 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      {t("admin.problems.detailedSolutionAr")}
                    </label>
                    <div className="bg-green-50/50 dark:bg-green-900/10 p-4 rounded-xl border border-green-200 dark:border-green-800/50">
                      <SolutionText
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
                      <SolutionText
                        text={viewingProblem.DetailedSolutionEn}
                        isArabic={false}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-3">
              <label className="text-sm font-bold text-primary flex items-center gap-2">
                <ListChecks className="h-4 w-4" />
                {t("admin.problems.options")}
              </label>
              <div className="grid gap-3">
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
                      <div className="flex-1 flex flex-col md:flex-row gap-4">
                        <span className="text-base flex-1 font-medium">
                          {opt.TextAr}
                        </span>
                        <span
                          className="text-base text-muted-foreground flex-1"
                          dir="ltr"
                        >
                          {opt.TextEn}
                        </span>
                      </div>
                      {opt.LatexCode && (
                        <div className="shrink-0 bg-background px-4 py-2 rounded-lg shadow-sm border">
                          <LatexPreview
                            latex={opt.LatexCode}
                            className="text-sm"
                          />
                        </div>
                      )}
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