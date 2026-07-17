"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  useGetAdminCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  type CategoryDto,
} from "@/store/api/categoriesApi";
import { useGetAdminStagesQuery } from "@/store/api/stagesApi";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { AlertCircle } from "lucide-react";
// Tooltip components are configured globally.
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/Tooltip";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export default function AdminCategoriesPage() {
  const t = useTranslations();
  const locale = useLocale();
  const { data: categories, isLoading, refetch } = useGetAdminCategoriesQuery();
  const { data: stages } = useGetAdminStagesQuery();

  const [createCategory, { isLoading: isCreating }] =
    useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] =
    useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const [selectedStageId, setSelectedStageId] = useState<number | undefined>(
    undefined,
  );
  const [stageError, setStageError] = useState(false);

  const [formData, setFormData] = useState<{
    Id?: number;
    NameAr: string;
    NameEn: string;
    Order?: number;
    StageId?: number;
    Icon?: File | null;
  }>({ NameAr: "", NameEn: "", Order: 0, StageId: undefined, Icon: null });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Select the first stage after the stage list loads.
  useEffect(() => {
    if (stages && stages.length > 0 && !selectedStageId) {
      setSelectedStageId(stages[0].Id);
    }
  }, [stages, selectedStageId]);

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

  const filteredCategories = selectedStageId
    ? categories?.filter((cat) => cat.StageId === selectedStageId)
    : categories;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedStageId) {
      setStageError(true);
      return;
    }

    try {
      if (isEditing && formData.Id) {
        await updateCategory({
          Id: formData.Id,
          Data: {
            NameAr: formData.NameAr,
            NameEn: formData.NameEn,
            Order: formData.Order,
            StageId: selectedStageId,
            Icon: formData.Icon || undefined,
          },
        }).unwrap();
      } else {
        await createCategory({
          NameAr: formData.NameAr,
          NameEn: formData.NameEn,
          Order: formData.Order,
          StageId: selectedStageId,
          Icon: formData.Icon || undefined,
        }).unwrap();
      }
      handleCloseModal();
      refetch();
    } catch (error) {
      console.error("Failed to save category", error);
      alert(t("common.errorSaving"));
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({
      NameAr: "",
      NameEn: "",
      Order: 0,
      StageId: undefined,
      Icon: null,
    });
    setPreviewUrl(null);
    setStageError(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await deleteCategory(id).unwrap();
      await refetch();
    } catch (error) {
      console.error("Failed to delete category", error);
      alert(t("common.errorDeleting"));
    } finally {
      setDeletingId(null);
    }
  };

  const openEditModal = (category: CategoryDto) => {
    setFormData({
      Id: category.Id,
      NameAr: category.NameAr,
      NameEn: category.NameEn,
      Order: category.Order,
      StageId: category.StageId,
      Icon: null,
    });
    setSelectedStageId(category.StageId);
    setPreviewUrl(category.Icon || null);
    setIsEditing(true);
    setIsModalOpen(true);
    setStageError(false);
  };

  const openCreateModal = () => {
    setFormData({
      NameAr: "",
      NameEn: "",
      Order: 0,
      StageId: undefined,
      Icon: null,
    });
    setPreviewUrl(null);
    setIsEditing(false);
    setIsModalOpen(true);
    setStageError(false);
  };

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
      setFormData((prev) => ({ ...prev, Icon: file }));
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  if (isLoading)
    return (
      <div className="p-8 text-center lg:px-24 md:px-16 px-4">
        {t("common.loading")}
      </div>
    );

  return (
    <div className="container mx-auto py-8 lg:px-24 md:px-16 px-4">
      <Breadcrumbs
        items={[
          { label: t("nav.admin"), href: "/admin" },
          { label: t("admin.categories.title") }, 
        ]}
        className="mb-6"
      />
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            {t("admin.categories.title")}
          </h1>
        </div>
        <Button
          onClick={openCreateModal}
          className="gap-2"
          disabled={!selectedStageId}
        >
          <Add className="h-4 w-4" />
          {t("admin.categories.addNew")}
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Filter className="h-5 w-5" />
              <span className="font-medium">
                {t("admin.categories.filterByStage")}:
              </span>
            </div>
            <Select
              value={selectedStageId?.toString() ?? ""}
              onValueChange={(v) => {
                setSelectedStageId(v === "all" ? undefined : Number(v));
                setStageError(false);
              }}
            >
              <SelectTrigger className="w-[200px] h-11">
                <SelectValue placeholder={t("admin.categories.selectStage")} />
              </SelectTrigger>
              <SelectContent>
                {stages?.map((stage) => (
                  <SelectItem key={stage.Id} value={stage.Id.toString()}>
                    {locale === "ar" ? stage.NameAr : stage.NameEn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {stageError && (
              <div className="flex items-center gap-2 text-red-500 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{t("admin.categories.selectStageRequired")}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-center">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="p-4">{t("admin.categories.icon")}</th>
                  <th className="p-4">{t("admin.categories.nameAr")}</th>
                  <th className="p-4">{t("admin.categories.nameEn")}</th>
                  <th className="p-4">{t("admin.categories.order")}</th>
                  <th className="p-4">{t("common.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories?.map((category) => (
                  <tr
                    key={category.Id}
                    className="border-b hover:bg-muted/20 transition-colors"
                  >
                    <td className="p-4">
                      {/* Render image URLs and text symbols safely. */}
                      {category.Icon ? (
                        isImageUrl(category.Icon) ? (
                          <>
                            {/* A native image is used because icon URLs can be dynamic. */}
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={category.Icon}
                              alt={category.NameAr}
                              className="w-10 h-10 rounded-lg object-cover border mx-auto shadow-sm"
                            />
                          </>
                        ) : (
                          <div className="w-10 h-10 flex items-center justify-center text-2xl mx-auto border rounded-lg bg-primary/10 shadow-sm">
                            {category.Icon}
                          </div>
                        )
                      ) : (
                        <ImageIcon
                          aria-hidden="true"
                          className="h-5 w-5 text-muted-foreground mx-auto"
                        />
                      )}
                    </td>
                    <td className="p-4 font-bold text-start">
                      {category.NameAr}
                    </td>
                    <td
                      className="p-4 text-muted-foreground text-start"
                      dir="ltr"
                    >
                      {category.NameEn}
                    </td>
                    <td className="p-4">
                      <span className="bg-muted px-3 py-1 rounded-full text-sm font-semibold">
                        {category.Order ?? "-"}
                      </span>
                    </td>
                    <td className="p-4 space-x-2 rtl:space-x-reverse whitespace-nowrap">
                      {/* Edit action */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(category)}
                            disabled={isUpdating}
                            className="hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          >
                            <Edit className="h-4 w-4 text-blue-500" />
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
                              description={t("admin.categories.confirmDelete")}
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

                {filteredCategories?.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-8 text-center text-muted-foreground bg-muted/10"
                    >
                      {selectedStageId
                        ? t("admin.categories.noCategoriesForStage")
                        : t("common.noData")}
                    </td>
                  </tr>
                )}
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
            className="bg-background p-6 rounded-2xl w-full max-w-md shadow-2xl border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b">
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
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-700 dark:text-blue-300 font-medium flex items-center gap-2">
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

            <form onSubmit={handleSubmit} className="space-y-5">
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
                      accept="image/*"
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
                    {previewUrl && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-500 w-full hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                        onClick={() => {
                          setPreviewUrl(null);
                          setFormData((prev) => ({ ...prev, Icon: null }));
                          if (fileInputRef.current)
                            fileInputRef.current.value = "";
                        }}
                      >
                        {t("common.remove")}
                      </Button>
                    )}
                  </div>
                </div>
              </div>

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

              <div className="flex justify-end gap-3 pt-6 border-t">
                <Button
                  variant="ghost"
                  type="button"
                  onClick={handleCloseModal}
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
