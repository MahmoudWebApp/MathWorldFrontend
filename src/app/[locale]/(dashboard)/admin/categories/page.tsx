"use client";

import { Suspense, useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/routing";
import { DirectionalChevron } from "@/components/ui/DirectionalNavigation";
import { useTranslations, useLocale } from "next-intl";
import {
  useGetAdminCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  type CategoryDto,
} from "@/store/api/categoriesApi";
import { getStageAccent } from "@/lib/stageVisuals";
import { useGetAdminStagesQuery, useGetAdminTrackQuery } from "@/store/api/stagesApi";
import {
  Add,
  Edit,
  Trash,
  Image as ImageIcon,
  CloseCircle,
  Filter,
} from "iconsax-reactjs";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PopoverConfirm } from "@/components/ui/PopoverConfirm";
import { Shapes } from "lucide-react";
import { WorkspacePageHeader } from "@/components/ui/WorkspacePageHeader";
// Tooltip components are configured globally.
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/Tooltip";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { StageTopicArtwork } from "@/components/stages/StageTopicArtwork";
import { getApiErrorMessage } from "@/lib/authSession";

export default function AdminCategoriesPage() {
  return (
    <Suspense fallback={<div role="status" aria-busy="true" className="animate-pulse grid gap-4 p-8 md:grid-cols-2">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-44 rounded-xl bg-muted/70" />)}</div>}>
      <AdminCategoriesPageContent />
    </Suspense>
  );
}

function AdminCategoriesPageContent() {
  const t = useTranslations();
  const locale = useLocale();
  const searchParams = useSearchParams();
  const trackId=Number(searchParams.get("trackId"));
  const validTrack=Number.isSafeInteger(trackId)&&trackId>0;
  const track=useGetAdminTrackQuery(trackId,{skip:!validTrack});
  const { data: categories, isLoading, isError: categoriesError, refetch } = useGetAdminCategoriesQuery();
  const { data: stages, isLoading: isLoadingStages, isError: stagesError, refetch: refetchStages } = useGetAdminStagesQuery();

  const [createCategory, { isLoading: isCreating }] =
    useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] =
    useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const [selectedStageId, setSelectedStageId] = useState<number | undefined>(
    undefined,
  );

  const [formData, setFormData] = useState<{
    Id?: number;
    NameAr: string;
    NameEn: string;
    DescriptionAr: string;
    DescriptionEn: string;
    Order?: number;
    StageId?: number;
    Icon?: File | null;
  }>({ NameAr: "", NameEn: "", DescriptionAr: "", DescriptionEn: "", Order: 0, StageId: undefined, Icon: null });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [iconError, setIconError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Deep links from Admin > Stages keep the selected educational level.
  // Only allow IDs that actually belong to the loaded admin stage list.
  useEffect(() => {
    if (!stages?.length) return;
    const raw = searchParams.get("stageId");
    const value = raw ? Number(raw) : null;
    const matched = value && Number.isSafeInteger(value)
      ? stages.find(stage => stage.Id === value)
      : undefined;
    if (matched) {
      setSelectedStageId(matched.Id);
    } else {
      setSelectedStageId(undefined);
    }
  }, [stages, searchParams]);

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Detect whether the icon value is an image URL or a text symbol.
  const isImageUrl = (str: string | null) => {
    if (!str) return false;
    return (
      str.startsWith("http") || str.startsWith("blob:") || str.startsWith("/")
    );
  };

  const freeIds=track.currentData?.FreeCategoryIds;
  const free=new Set(freeIds??[]);
  const filteredCategories = selectedStageId
    ? categories?.filter((cat) => cat.StageId === selectedStageId && track.currentData?.CategoryIds.includes(cat.Id))
      .sort((a,b)=>Number(free.has(b.Id))-Number(free.has(a.Id))||a.Order-b.Order||a.Id-b.Id)
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCreating || isUpdating) return;
    setSaveError('');

    if (!selectedStageId) {
        return;
    }

    try {
      if (isEditing && formData.Id) {
        await updateCategory({
          Id: formData.Id,
          Data: {
            NameAr: formData.NameAr,
            NameEn: formData.NameEn,
            DescriptionAr: formData.DescriptionAr,
            DescriptionEn: formData.DescriptionEn,
            Order: formData.Order,
            StageId: selectedStageId,
            Icon: formData.Icon || undefined,
          },
        }).unwrap();
      } else {
        const scope=track.currentData?.Track;
        if(!scope||scope.Id!==trackId||scope.StageId!==selectedStageId)throw new Error('TrackChanged');
        await createCategory({
          NameAr: formData.NameAr,
          NameEn: formData.NameEn,
          DescriptionAr: formData.DescriptionAr,
          DescriptionEn: formData.DescriptionEn,
          Order: formData.Order,
          StageId: selectedStageId,
          TrackId: scope.Id,
          TrackRevision: scope.Revision,
          Icon: formData.Icon || undefined,
        }).unwrap();
      }
      handleCloseModal();
      await Promise.all([refetch(),track.refetch()]);
    } catch (error) {
      setSaveError(getApiErrorMessage(error, t("common.errorSaving")));
    }
  };

  const handleCloseModal = () => {
    if (isCreating || isUpdating) return;
    setIsModalOpen(false);
    setSaveError('');
    setFormData({
      NameAr: "",
      NameEn: "",
      DescriptionAr: "",
      DescriptionEn: "",
      Order: 0,
      StageId: undefined,
      Icon: null,
    });
    setPreviewUrl(null);
    setIconError('');
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDelete = async (id: number) => {
    if (deletingId !== null) return;
    setDeleteError('');
    setDeletingId(id);
    try {
      await deleteCategory(id).unwrap();
      await Promise.all([refetch(),track.refetch()]);
    } catch (error) {
      setDeleteError(getApiErrorMessage(error, t("common.errorDeleting")));
    } finally {
      setDeletingId(null);
    }
  };

  const openEditModal = (category: CategoryDto) => {
    setSaveError('');
    setFormData({
      Id: category.Id,
      NameAr: category.NameAr,
      NameEn: category.NameEn,
      DescriptionAr: category.DescriptionAr ?? "",
      DescriptionEn: category.DescriptionEn ?? "",
      Order: category.Order,
      StageId: category.StageId,
      Icon: null,
    });
    setSelectedStageId(category.StageId);
    setPreviewUrl(category.Icon || null);
    setIconError('');
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setSaveError('');
    setFormData({
      NameAr: "",
      NameEn: "",
      DescriptionAr: "",
      DescriptionEn: "",
      Order: Math.max(0,...(categories??[]).filter(c=>c.StageId===selectedStageId).map(c=>c.Order))+1,
      StageId: undefined,
      Icon: null,
    });
    setPreviewUrl(null);
    setIconError('');
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setIconError('');
    setSaveError('');
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) ||
        file.size > 2 * 1024 * 1024) {
      setIconError(locale === 'ar'
        ? 'اختر صورة PNG أو JPG أو WebP لا تتجاوز 2MB.'
        : 'Choose a PNG, JPG or WebP image up to 2MB.');
      // Do not submit a previously selected upload after an invalid replacement.
      setFormData(prev => ({ ...prev, Icon: null }));
      setPreviewUrl(isEditing ? categories?.find(cat => cat.Id === formData.Id)?.Icon ?? null : null);
      e.target.value = '';
      return;
    }
    setFormData((prev) => ({ ...prev, Icon: file }));
    setPreviewUrl(URL.createObjectURL(file));
  };

  if (isLoading || isLoadingStages || (validTrack&&track.isLoading))
    return (
      <div role="status" aria-busy="true" aria-label={t("common.loading")} className="animate-pulse grid gap-4 px-4 py-8 md:grid-cols-2 md:px-16 lg:px-24">
        {Array.from({ length: 6 }, (_, index) => <div key={index} className="h-44 rounded-xl border border-border/60 bg-card/70" />)}
      </div>
    );

  if (categoriesError || stagesError || track.isError) return (
    <div className="container mx-auto px-4 py-12 text-center" role="alert">
      <p className="mb-4 font-medium text-destructive">
        {locale === "ar" ? "تعذر تحميل المراحل أو الفئات. تحقق من الاتصال ثم حاول مجدداً." : "Could not load stages or categories. Check your connection and try again."}
      </p>
      <Button type="button" variant="outline" onClick={() => { void refetch(); void refetchStages(); if(validTrack)void track.refetch(); }}>
        {locale === "ar" ? "إعادة المحاولة" : "Retry"}
      </Button>
    </div>
  );

  if (!selectedStageId || !validTrack || track.currentData?.Track.StageId!==selectedStageId) {
    return (
      <main className="mx-auto max-w-xl space-y-4 px-4 py-12 text-center">
        <h1 className="text-2xl font-bold">{locale === 'ar' ? 'اختر المرحلة والصف أو المستوى أولاً' : 'Choose a stage and grade or level first'}</h1>
        <p className="text-muted-foreground">{locale === 'ar'
          ? 'لإدارة الفئات، اختر المرحلة ثم الصف أو المستوى المطلوب.'
          : 'To manage topics, choose the stage and then a grade or level.'}</p>
        <Link href="/admin/stages" className="inline-flex min-h-11 items-center rounded-xl bg-primary px-5 py-2 font-bold text-primary-foreground">
          {locale === 'ar' ? 'المراحل التعليمية' : 'Educational stages'}
        </Link>
      </main>
    );
  }

  return (
    <div className="container mx-auto py-8 lg:px-24 md:px-16 px-4">
      <Breadcrumbs
        items={[
          { label: t("nav.admin"), href: "/admin" },
          { label: t("admin.stages.title"), href: "/admin/stages" },
          { label: (locale==="ar"?stages?.find(s=>s.Id===selectedStageId)?.NameAr:stages?.find(s=>s.Id===selectedStageId)?.NameEn)??"", href:"/admin/learning-tracks?stageId="+selectedStageId },
          { label: locale==="ar"?track.currentData.Track.NameAr:track.currentData.Track.NameEn },
          { label: locale==="ar"?"الفئات":"Categories" },
        ]}
        className="mb-6"
      />
      <WorkspacePageHeader title={t("admin.categories.title")} icon={Shapes} actions={<div className="flex flex-wrap items-center gap-2">
        <Link href={"/admin/learning-tracks?stageId="+selectedStageId} className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold"><DirectionalChevron direction="back" className="h-4 w-4"/>{locale==="ar"?"العودة للصفوف والمستويات":"Back to grades and levels"}</Link>
        <Button
          onClick={openCreateModal}
          className="gap-2"
          disabled={!selectedStageId}
        >
          <Add className="h-4 w-4" />
          {locale==="ar"?"إضافة فئة جديدة":"Add category"}
        </Button>
        </div>}/>



      {deleteError && (
        <div role="alert" className="mb-4 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {deleteError}
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="mw-workspace-table w-full min-w-[620px] text-center">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="p-4">{t("admin.categories.icon")}</th>
                  <th className="p-4">{t("admin.categories.nameAr")}</th>
                  <th className="p-4">{t("admin.categories.nameEn")}</th>
                  <th className="p-4">{locale==="ar"?"نوع الوصول":"Access"}</th>
                  <th className="p-4">{t("common.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories?.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                    {locale === "ar" ? "لا توجد فئات مرتبطة بهذا الصف أو المستوى بعد." : "No categories are linked to this grade or level yet."}
                  </td></tr>
                )}
                {filteredCategories?.map((category) => (
                  <tr
                    key={category.Id}
                    className="border-b mw-topic-row transition-colors"
                    style={{ "--stage-accent": getStageAccent({Id:category.StageId}) } as import("react").CSSProperties}
                  >
                    <td className="p-4">
                      {/* Render image URLs and text symbols safely. */}
                      {category.Icon ? (
                        isImageUrl(category.Icon) ? (
                          <StageTopicArtwork src={category.Icon} accent={getStageAccent({Id:category.StageId})} size={40} className="mx-auto rounded-lg"/>
                        ) : (
                          <div className="w-10 h-10 flex items-center justify-center text-2xl mx-auto border rounded-lg mw-topic-action shadow-sm">
                            {category.Icon}
                          </div>
                        )
                      ) : (
                        <ImageIcon
                          aria-hidden="true"
                          className="h-5 w-5 mw-topic-ink mx-auto"
                        />
                      )}
                    </td>
                    <td className="p-4 font-bold text-start">
                      <Link
                        href={`/admin/editorial?stageId=${category.StageId}&trackId=${trackId}&categoryId=${category.Id}`}
                        className="inline-flex items-center gap-1.5 mw-topic-ink hover:underline"
                      >
                        {category.NameAr}
                        <DirectionalChevron direction="forward" className="h-4 w-4" />
                      </Link>
                    </td>
                    <td
                      className="p-4 mw-topic-ink text-start"
                      dir="ltr"
                    >
                      {category.NameEn}
                    </td>
                    <td className="p-4">
                      {freeIds===undefined?<span className="text-xs text-muted-foreground">—</span>:<span className={"rounded-full border px-3 py-1 text-xs font-bold "+(free.has(category.Id)?"border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300":"border-primary/25 bg-primary/10 text-primary")}>{free.has(category.Id)?(locale==="ar"?"مجاني":"Free"):"Premium"}</span>}
                    </td>
                    <td className="p-4 space-x-2 rtl:space-x-reverse whitespace-nowrap">
                      <Link
                        href={`/admin/editorial?stageId=${category.StageId}&trackId=${trackId}&categoryId=${category.Id}`}
                        className="mb-1 inline-flex items-center gap-1 rounded-lg border mw-topic-action px-2.5 py-2 text-xs font-semibold"
                      >
                        {locale === "ar" ? "عرض المسائل" : "View problems"}
                        <DirectionalChevron direction="forward" className="h-4 w-4" />
                      </Link>

                      {/* Edit action */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(category)}
                            disabled={isUpdating}
                            className="hover:text-primary hover:bg-primary/10"
                          >
                            <Edit className="h-4 w-4 text-primary" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          className="shadow-md rounded-lg border-0"
                        >
                          <p>{t("common.edit")}</p>
                        </TooltipContent>
                      </Tooltip>

                      {/* Delete action */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-block">
                            <PopoverConfirm
                              onConfirm={() => handleDelete(category.Id)}
                              title={t("common.confirmDeleteTitle")}
                              description={locale==="ar"?"حذف تعريف الفئة يؤثر على كل الصفوف المرتبطة بها. يمنع الخادم حذف الفئة إذا كانت لها بيانات محمية.":"Deleting this category definition affects all linked grades; protected records prevent deletion."}
                              confirmText={t("common.delete")}
                              cancelText={t("common.cancel")}
                              isLoading={deletingId === category.Id}
                              align="end"
                              side="right"
                              trigger={
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                  <Trash className="h-4 w-4 text-red-500" />
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
                ))}

               </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal for Create/Edit */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={handleCloseModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={isEditing ? t("admin.categories.edit") : t("admin.categories.add")}
            className="brand-surface max-h-[calc(100dvh-2rem)] w-full max-w-3xl flex flex-col overflow-hidden rounded-2xl p-4 shadow-2xl sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-center justify-between mb-4 pb-3 border-b">
              <h2 className="text-xl font-bold">
                {isEditing
                  ? t("admin.categories.edit")
                  : t("admin.categories.add")}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCloseModal}
                className="rounded-full"
              >
                <CloseCircle className="h-5 w-5" />
              </Button>
            </div>

            {selectedStageId && (
              <div className="math-equation-chip mb-4 rounded-xl p-3">
                <p className="text-sm text-primary font-medium flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  {t("admin.categories.addingToStage")}:{" "}
                  <span className="font-bold">
                    {
                      stages?.find((s) => s.Id === selectedStageId)?.[
                        locale === "ar" ? "NameAr" : "NameEn"
                      ]
                    }
                  </span>
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex min-h-0 flex-col">
              <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain pe-1">
              {saveError && (
                <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                  {saveError}
                </p>
              )}
              {!isEditing&&<p className="text-sm text-muted-foreground">{locale==="ar"?"ستُربط الفئة بهذا الصف تلقائياً عند الحفظ، ولن تظهر للطلاب حتى تحتوي على مسائل صالحة.":"The category will be linked to this grade automatically and remain hidden from the grade catalog until it has valid problems."}</p>}
              {/* Icon Upload / Preview */}
              <div>
                <label className="block mb-2 text-sm font-semibold">
                  {t("admin.categories.icon")}
                </label>
                <div className="flex items-center gap-4 bg-muted/30 p-3 rounded-xl border">
                  <div className="relative shrink-0">
                    {/* Icon preview */}
                    {previewUrl ? (
                      isImageUrl(previewUrl) ? (
                        <>
                          {/* Blob previews are not supported by the Next.js image optimizer. */}
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-14 h-14 rounded-lg object-cover border shadow-sm bg-background"
                          />
                        </>
                      ) : (
                        <div className="w-14 h-14 flex items-center justify-center text-3xl border rounded-lg bg-background shadow-sm">
                          {previewUrl}
                        </div>
                      )
                    ) : (
                      <div className="w-14 h-14 rounded-lg border flex items-center justify-center bg-background shadow-sm">
                        <ImageIcon
                          aria-hidden="true"
                          className="h-6 w-6 text-muted-foreground/50"
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleIconChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full bg-background"
                    >
                      {t("admin.categories.uploadIcon")}
                    </Button>
                    {formData.Icon && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-500 w-full hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                        onClick={() => {
                          // Cancelling a new upload must restore the saved icon,
                          // not suggest that the existing image was deleted.
                          const existingIcon = isEditing
                            ? categories?.find((item) => item.Id === formData.Id)?.Icon ?? null
                            : null;
                          setPreviewUrl(existingIcon);
                          setFormData((prev) => ({ ...prev, Icon: null }));
                          setIconError('');
                          if (fileInputRef.current)
                            fileInputRef.current.value = "";
                        }}
                      >
                        {t("common.remove")}
                      </Button>
                    )}
                  </div>
                </div>
                {iconError && <p role="alert" className="mt-2 text-sm text-destructive">{iconError}</p>}
                {isEditing && previewUrl && !formData.Icon && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {locale === 'ar' ? 'الأيقونة الحالية محفوظة؛ لتغييرها ارفع صورة جديدة.' : 'The existing icon is saved. Upload a new image to replace it.'}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block mb-2 text-sm font-semibold">
                  {t("admin.categories.nameAr")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  dir="rtl"
                  className="w-full h-11 px-3 border rounded-xl bg-background focus:ring-2 focus:ring-primary outline-none transition-all"
                  value={formData.NameAr}
                  onChange={(e) =>
                    setFormData({ ...formData, NameAr: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold">
                  {t("admin.categories.nameEn")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  dir="ltr"
                  className="w-full h-11 px-3 border rounded-xl bg-background focus:ring-2 focus:ring-primary outline-none transition-all"
                  value={formData.NameEn}
                  onChange={(e) =>
                    setFormData({ ...formData, NameEn: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label htmlFor="category-description-ar" className="mb-2 block text-sm font-semibold">
                  {locale === 'ar' ? 'وصف الفئة بالعربي' : 'Topic description (Arabic)'}
                </label>
                <textarea id="category-description-ar" rows={3} dir="rtl" maxLength={1500}
                  className="w-full rounded-xl border bg-background px-3 py-2"
                  value={formData.DescriptionAr}
                  onChange={event => setFormData({ ...formData, DescriptionAr: event.target.value })} />
              </div>
              <div>
                <label htmlFor="category-description-en" className="mb-2 block text-sm font-semibold">
                  {locale === 'ar' ? 'وصف الفئة بالإنجليزي' : 'Topic description (English)'}
                </label>
                <textarea id="category-description-en" rows={3} dir="ltr" maxLength={1500}
                  className="w-full rounded-xl border bg-background px-3 py-2"
                  value={formData.DescriptionEn}
                  onChange={event => setFormData({ ...formData, DescriptionEn: event.target.value })} />
              </div>

              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold">
                  {t("admin.categories.order")}
                </label>
                <input
                  type="number"
                  className="w-full h-11 px-3 border rounded-xl bg-background focus:ring-2 focus:ring-primary outline-none transition-all"
                  value={formData.Order ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      Order: e.target.value
                        ? parseInt(e.target.value)
                        : undefined,
                    })
                  }
                  min={0}
                />
              </div>

              </div>
              <div className="mt-4 flex shrink-0 justify-end gap-3 border-t pt-4">
                <Button
                  variant="ghost"
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isCreating || isUpdating}
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="px-8 shadow-md"
                >
                  {isCreating || isUpdating ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    t("common.save")
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
