"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  useGetAdminTagsQuery,
  useCreateTagMutation,
  useUpdateTagMutation,
  useDeleteTagMutation,
} from "@/store/api/tagsApi";
import { Add, Edit, Trash, CloseCircle } from "iconsax-reactjs";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PopoverConfirm } from "@/components/ui/PopoverConfirm";

export default function AdminTagsPage() {
  const t = useTranslations();
  const { data: tags, isLoading, refetch } = useGetAdminTagsQuery();
  const [createTag] = useCreateTagMutation();
  const [updateTag] = useUpdateTagMutation();
  const [deleteTag] = useDeleteTagMutation();

  const [formData, setFormData] = useState({ id: 0, textAr: "", textEn: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isEditing) {
        await updateTag({
          Id: formData.id,
          Data: {
            TextAr: formData.textAr,
            TextEn: formData.textEn,
          },
        }).unwrap();
      } else {
        await createTag({
          TextAr: formData.textAr,
          TextEn: formData.textEn,
        }).unwrap();
      }
      setIsModalOpen(false);
      resetForm();
      refetch();
    } catch (error) {
      console.error("Failed to save tag", error);
      alert(t("common.errorSaving"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await deleteTag(id).unwrap();
      await refetch();
    } catch (error) {
      console.error("Failed to delete tag", error);
      alert(t("common.errorDeleting"));
    } finally {
      setDeletingId(null);
    }
  };

  const openModal = (tag: any = null) => {
    if (tag) {
      setFormData({
        id: tag.Id,
        textAr: tag.TextAr,
        textEn: tag.TextEn,
      });
      setIsEditing(true);
    } else {
      resetForm();
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({ id: 0, textAr: "", textEn: "" });
  };

  if (isLoading)
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">{t("common.loading")}</div>
      </div>
    );

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">{t("admin.tags.title")}</h1>
        <Button onClick={() => openModal()} className="gap-2">
          <Add className="h-4 w-4" />
          {t("admin.tags.addNew")}
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-center">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="p-4">{t("admin.tags.id")}</th>
                  <th className="p-4">{t("admin.tags.nameAr")}</th>
                  <th className="p-4">{t("admin.tags.nameEn")}</th>
                  <th className="p-4">{t("admin.tags.problemsCount")}</th>
                  <th className="p-4">{t("common.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {tags && tags.length > 0 ? (
                  tags.map((tag) => (
                    <tr key={tag.Id} className="border-b hover:bg-muted/20">
                      <td className="p-4 font-mono text-sm">{tag.Id}</td>
                      <td className="p-4 font-medium">{tag.TextAr}</td>
                      <td className="p-4 text-muted-foreground">
                        {tag.TextEn}
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {tag.ProblemsCount || 0}
                        </span>
                      </td>
                      <td className="p-4 space-x-2 rtl:space-x-reverse">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openModal(tag)}
                        >
                          <Edit className="h-4 w-4 text-blue-500" />
                        </Button>

                        <PopoverConfirm
                          onConfirm={() => handleDelete(tag.Id)}
                          onCancel={() => setDeletingId(null)}
                          title={t("common.confirmDeleteTitle")}
                          description={t("admin.tags.confirmDelete")}
                          confirmText={t("common.delete")}
                          cancelText={t("common.cancel")}
                          isLoading={deletingId === tag.Id}
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
                      {t("admin.tags.noTags")}
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
                {isEditing ? t("admin.tags.edit") : t("admin.tags.add")}
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
                  {t("admin.tags.nameAr")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.textAr}
                  onChange={(e) =>
                    setFormData({ ...formData, textAr: e.target.value })
                  }
                  required
                  dir="rtl"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">
                  {t("admin.tags.nameEn")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.textEn}
                  onChange={(e) =>
                    setFormData({ ...formData, textEn: e.target.value })
                  }
                  required
                  dir="ltr"
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
