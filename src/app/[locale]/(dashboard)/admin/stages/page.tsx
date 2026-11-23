"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { DirectionalChevron } from "@/components/ui/DirectionalNavigation";
import { MathWorldLoading } from "@/components/ui/MathWorldLoading";
import {
  useGetAdminStagesQuery,
  useCreateStageMutation,
  useUpdateStageMutation,
  useDeleteStageMutation,
  type Stage,
} from "@/store/api/stagesApi";
import { Add, Edit, Trash, CloseCircle } from "iconsax-reactjs";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PopoverConfirm } from "@/components/ui/PopoverConfirm";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { StageIconBadge } from "@/components/stages/StageIconBadge";

export default function AdminStagesPage() {
  const t = useTranslations();
  const ar = useLocale() === "ar";
  const { data: stages, isLoading, isError, refetch } = useGetAdminStagesQuery();
  const [createStage] = useCreateStageMutation();
  const [updateStage] = useUpdateStageMutation();
  const [deleteStage] = useDeleteStageMutation();

  const [formData, setFormData] = useState({
    Id: 0,
    NameAr: "",
    NameEn: "",
    DescriptionAr: "",
    DescriptionEn: "",
    Order: 1,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isEditing) {
        await updateStage({
          Id: formData.Id,
          Data: {
            NameAr: formData.NameAr,
            NameEn: formData.NameEn,
            DescriptionAr: formData.DescriptionAr,
            DescriptionEn: formData.DescriptionEn,
            Order: formData.Order,
          },
        }).unwrap();
      } else {
        await createStage({
          NameAr: formData.NameAr,
          NameEn: formData.NameEn,
          DescriptionAr: formData.DescriptionAr,
          DescriptionEn: formData.DescriptionEn,
          Order: formData.Order,
        }).unwrap();
      }
      setIsModalOpen(false);
      resetForm();
      refetch();
    } catch (error) {
      console.error("Failed to save stage", error);
      alert(t("common.errorSaving"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await deleteStage(id).unwrap();
      await refetch();
    } catch (error) {
      console.error("Failed to delete stage", error);
      alert(t("common.errorDeleting"));
    } finally {
      setDeletingId(null);
    }
  };

  const openModal = (stage: Stage | null = null) => {
    if (stage) {
      setFormData({
        Id: stage.Id,
        NameAr: stage.NameAr,
        NameEn: stage.NameEn,
        DescriptionAr: stage.DescriptionAr ?? "",
        DescriptionEn: stage.DescriptionEn ?? "",
        Order: stage.Order || 1,
      });
      setIsEditing(true);
    } else {
      resetForm();
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({ Id: 0, NameAr: "", NameEn: "", DescriptionAr: "", DescriptionEn: "", Order: 1 });
  };

  if (isLoading)
    return (
      <div role="status" aria-busy="true" aria-label={t("common.loading")} className="container mx-auto animate-pulse px-4 py-8 md:px-16 lg:px-24">
        <MathWorldLoading compact />
        <div className="mb-6 h-9 w-48 rounded-xl bg-muted/70" />
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }, (_, index) => <div key={index} className="h-56 rounded-2xl border border-border/60 bg-card/70 p-5">
            <div className="h-5 w-1/2 rounded bg-muted/70" />
            <div className="mt-4 h-4 w-3/4 rounded bg-muted/60" />
          </div>)}
        </div>
      </div>
    );

  if (isError || !stages) return (
    <main role="alert" className="mx-auto max-w-2xl px-4 py-12">
      <div className="space-y-4 rounded-2xl border border-destructive/25 bg-card p-6">
        <h1 className="text-xl font-bold">{ar ? "تعذّر تحميل المراحل" : "Could not load stages"}</h1>
        <button type="button" onClick={() => void refetch()}
          className="rounded-xl bg-primary px-5 py-2.5 font-semibold text-primary-foreground">
          {ar ? "إعادة المحاولة" : "Retry"}
        </button>
      </div>
    </main>
  );

  return (
    <div className="container mx-auto lg:px-24 md:px-16 px-4 py-8">
      <Breadcrumbs
        items={[
          { label: t("nav.admin"), href: "/admin" },
          { label: t("admin.stages.title") },
        ]}
        className="mb-6"
      />
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">{t("admin.stages.title")}</h1>
          <p className="text-muted-foreground mt-1">
            {t("admin.stages.subtitle")}
          </p>
        </div>
        <Button onClick={() => openModal()} className="gap-2">
          <Add className="h-4 w-4" />
          {t("admin.stages.addNew")}
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-center">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="p-4">ID</th>
                  <th className="p-4">{t("admin.stages.nameAr")}</th>
                  <th className="p-4">{t("admin.stages.nameEn")}</th>
                  <th className="p-4">{t("admin.stages.order")}</th>
                  <th className="p-4">{t("common.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {stages && stages.length > 0 ? (
                  stages.map((stage) => (
                    <tr key={stage.Id} className="border-b hover:bg-muted/20">
                      <td className="p-4 font-mono text-sm">{stage.Id}</td>
                      <td className="p-4 font-medium">
                        <span className="inline-flex items-center gap-2">
                          <StageIconBadge stage={stage} size="xs" />
                          <Link
                            href={`/admin/categories?stageId=${stage.Id}`}
                            className="inline-flex items-center gap-1.5 font-bold text-primary hover:underline"
                          >
                            {stage.NameAr}
                            <DirectionalChevron direction="forward" className="h-4 w-4" />
                          </Link>
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {stage.NameEn}
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {stage.Order}
                        </span>
                      </td>
                      <td className="p-4 space-x-2 rtl:space-x-reverse">
                        <Link
                          href={`/admin/categories?stageId=${stage.Id}`}
                          className="mb-2 inline-flex items-center gap-1.5 rounded-lg border border-primary/20 px-3 py-2 text-xs font-bold text-primary hover:bg-primary/10 sm:mb-0"
                        >
                          {ar ? "عرض الفئات" : "View categories"}
                          <DirectionalChevron direction="forward" className="h-4 w-4" />
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openModal(stage)}
                        >
                          <Edit className="h-4 w-4 text-primary" />
                        </Button>

                        <PopoverConfirm
                          onConfirm={() => handleDelete(stage.Id)}
                          onCancel={() => setDeletingId(null)}
                          title={t("common.confirmDeleteTitle")}
                          description={t("admin.stages.confirmDelete")}
                          confirmText={t("common.delete")}
                          cancelText={t("common.cancel")}
                          isLoading={deletingId === stage.Id}
                          align="end"
                          side="right"
                          trigger={
                            <Button
                              variant="ghost"
                              size="sm"
                              title={t("common.delete")}
                              className="hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <Trash className="h-4 w-4 text-red-500" />
                            </Button>
                          }
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-8 text-center text-muted-foreground"
                    >
                      {t("admin.stages.noStages")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal for Add/Edit */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-background p-6 rounded-lg w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">
                {isEditing ? t("admin.stages.edit") : t("admin.stages.add")}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsModalOpen(false)}
              >
                <CloseCircle className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium">
                  {t("admin.stages.nameAr")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.NameAr}
                  onChange={(e) =>
                    setFormData({ ...formData, NameAr: e.target.value })
                  }
                  required
                  dir="rtl"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">
                  {t("admin.stages.nameEn")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.NameEn}
                  onChange={(e) =>
                    setFormData({ ...formData, NameEn: e.target.value })
                  }
                  required
                  dir="ltr"
                />
              </div>
              <div>
                <label htmlFor="stage-description-ar" className="block mb-1 text-sm font-medium">
                  {ar ? "وصف المرحلة بالعربي" : "Stage description (Arabic)"}
                </label>
                <textarea id="stage-description-ar" rows={3} maxLength={1500} dir="rtl"
                  className="w-full rounded-md border bg-background p-2"
                  value={formData.DescriptionAr}
                  onChange={e => setFormData({ ...formData, DescriptionAr: e.target.value })} />
              </div>
              <div>
                <label htmlFor="stage-description-en" className="block mb-1 text-sm font-medium">
                  {ar ? "وصف المرحلة بالإنجليزي" : "Stage description (English)"}
                </label>
                <textarea id="stage-description-en" rows={3} maxLength={1500} dir="ltr"
                  className="w-full rounded-md border bg-background p-2"
                  value={formData.DescriptionEn}
                  onChange={e => setFormData({ ...formData, DescriptionEn: e.target.value })} />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">
                  {t("admin.stages.order")}
                </label>
                <input
                  type="number"
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.Order}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      Order: Number(e.target.value) || 1,
                    })
                  }
                  min={1}
                />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                >
                  {t("common.cancel")}
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? t("common.saving") : t("common.save")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
