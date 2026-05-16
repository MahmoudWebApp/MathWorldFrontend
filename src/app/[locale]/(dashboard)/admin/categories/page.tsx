"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  useGetAdminCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from "@/store/api/categoriesApi";
import { Add, Edit, Trash, Image, CloseCircle } from "iconsax-reactjs";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PopoverConfirm } from "@/components/ui/PopoverConfirm";

export default function AdminCategoriesPage() {
  const t = useTranslations();
  const { data: categories, isLoading, refetch } = useGetAdminCategoriesQuery();

  const [createCategory, { isLoading: isCreating }] =
    useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] =
    useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const [formData, setFormData] = useState<{
    Id?: number;
    NameAr: string;
    NameEn: string;
    Order?: number;
    Icon?: File | null;
  }>({ NameAr: "", NameEn: "", Order: 0, Icon: null });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && formData.Id) {
        await updateCategory({
          Id: formData.Id,
          Data: {
            NameAr: formData.NameAr,
            NameEn: formData.NameEn,
            Order: formData.Order,
            Icon: formData.Icon || undefined,
          },
        }).unwrap();
      } else {
        await createCategory({
          NameAr: formData.NameAr,
          NameEn: formData.NameEn,
          Order: formData.Order,
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
    setFormData({ NameAr: "", NameEn: "", Order: 0, Icon: null });
    setPreviewUrl(null);
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

  const openEditModal = (category: any) => {
    setFormData({
      Id: category.Id,
      NameAr: category.NameAr,
      NameEn: category.NameEn,
      Order: category.Order,
      Icon: null,
    });
    setPreviewUrl(category.Icon || null);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setFormData({ NameAr: "", NameEn: "", Order: 0, Icon: null });
    setPreviewUrl(null);
    setIsEditing(false);
    setIsModalOpen(true);
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
    return <div className="p-8 text-center">{t("common.loading")}</div>;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            {t("admin.categories.title")}
          </h1>
        </div>
        <Button onClick={openCreateModal} className="gap-2">
          <Add className="h-4 w-4" />
          {t("admin.categories.addNew")}
        </Button>
      </div>

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
                {categories?.map((category) => (
                  <tr
                    key={category.Id}
                    className="border-b hover:bg-muted/20 transition-colors"
                  >
                    <td className="p-4">
                      {category.Icon ? (
                        <img
                          src={category.Icon}
                          alt={category.NameAr}
                          className="w-10 h-10 rounded object-cover border mx-auto"
                        />
                      ) : (
                        <Image className="h-5 w-5 text-muted-foreground mx-auto" />
                      )}
                    </td>
                    <td className="p-4 font-medium">{category.NameAr}</td>
                    <td className="p-4 text-muted-foreground">
                      {category.NameEn}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {category.Order ?? "-"}
                    </td>
                    <td className="p-4 space-x-2 rtl:space-x-reverse whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(category)}
                        disabled={isUpdating}
                        title={t("common.edit")}
                      >
                        <Edit className="h-4 w-4 text-blue-500" />
                      </Button>

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
                            title={t("common.delete")}
                          >
                            <Trash className="h-4 w-4 text-red-500" />
                          </Button>
                        }
                      />
                    </td>
                  </tr>
                ))}

                {categories?.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-8 text-center text-muted-foreground bg-muted/10"
                    >
                      {t("common.noData")}
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={handleCloseModal}
        >
          <div
            className="bg-background p-6 rounded-lg w-full max-w-md shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">
                {isEditing
                  ? t("admin.categories.edit")
                  : t("admin.categories.add")}
              </h2>
              <Button variant="ghost" size="sm" onClick={handleCloseModal}>
                <CloseCircle className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Icon Upload */}
              <div>
                <label className="block mb-1 text-sm font-medium">
                  {t("admin.categories.icon")}
                </label>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-16 h-16 rounded object-cover border"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded border flex items-center justify-center bg-muted">
                        <Image className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-x-2">
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
                      className="w-full sm:w-auto"
                    >
                      {t("admin.categories.uploadIcon")}
                    </Button>
                    {previewUrl && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-500 w-full sm:w-auto justify-start px-0"
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

              {/* NameAr - RTL Input */}
              <div>
                <label className="block mb-1 text-sm font-medium">
                  {t("admin.categories.nameAr")}
                </label>
                <input
                  type="text"
                  dir="rtl"
                  className="w-full p-2 border rounded text-end"
                  value={formData.NameAr}
                  onChange={(e) =>
                    setFormData({ ...formData, NameAr: e.target.value })
                  }
                  required
                />
              </div>

              {/* NameEn - LTR Input */}
              <div>
                <label className="block mb-1 text-sm font-medium">
                  {t("admin.categories.nameEn")}
                </label>
                <input
                  type="text"
                  dir="ltr"
                  className="w-full p-2 border rounded text-start"
                  value={formData.NameEn}
                  onChange={(e) =>
                    setFormData({ ...formData, NameEn: e.target.value })
                  }
                  required
                />
              </div>

              {/* Order */}
              <div>
                <label className="block mb-1 text-sm font-medium">
                  {t("admin.categories.order")}
                </label>
                <input
                  type="number"
                  className="w-full p-2 border rounded"
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

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  type="button"
                  onClick={handleCloseModal}
                >
                  {t("common.cancel")}
                </Button>
                <Button type="submit" disabled={isCreating || isUpdating}>
                  {isCreating || isUpdating
                    ? t("common.saving")
                    : t("common.save")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
