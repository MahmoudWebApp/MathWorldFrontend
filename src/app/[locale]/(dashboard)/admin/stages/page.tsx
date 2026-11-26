"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { DirectionalChevron } from "@/components/ui/DirectionalNavigation";
import { MathWorldLoading } from "@/components/ui/MathWorldLoading";
import {
  useGetAdminStagesQuery,
  useUpdateStageMutation,
  type Stage,
} from "@/store/api/stagesApi";
import { Edit } from "iconsax-reactjs";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/Dialog";
import { WorkspacePageHeader } from "@/components/ui/WorkspacePageHeader";
import { GraduationCap, Layers } from "lucide-react";
import {Tooltip,TooltipTrigger,TooltipContent} from "@/components/ui/Tooltip";
import { getStageAccent } from "@/lib/stageVisuals";
import { StageIconBadge } from "@/components/stages/StageIconBadge";

export default function AdminStagesPage() {
  const t = useTranslations();
  const ar = useLocale() === "ar";
  const { data: stages, isLoading, isError, refetch } = useGetAdminStagesQuery();
  const [updateStage] = useUpdateStageMutation();

  const [formData, setFormData] = useState({
    Id: 0,
    NameAr: "",
    NameEn: "",
    DescriptionAr: "",
    DescriptionEn: "",
    Order: 1,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSaveError("");
    try {
      {
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
      }
      setIsModalOpen(false);
      resetForm();
      setSaved(true);
      refetch();
    } catch (error) {
      console.error("Failed to save stage", error);
      setSaveError(t("common.errorSaving"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const openModal = (stage: Stage) => {
    setFormData({Id:stage.Id,NameAr:stage.NameAr,NameEn:stage.NameEn,DescriptionAr:stage.DescriptionAr??"",DescriptionEn:stage.DescriptionEn??"",Order:stage.Order||1});
    setSaveError("");
    setSaved(false);
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

      <WorkspacePageHeader title={t("admin.stages.title")} icon={GraduationCap}/>

      {saved && <p role="status" className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-300">{ar ? "تم حفظ المرحلة" : "Stage saved"}</p>}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="mw-workspace-table w-full text-center">
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
                    <tr key={stage.Id} className="border-b mw-topic-row" style={{"--stage-accent":getStageAccent(stage)} as import("react").CSSProperties}>
                      <td className="p-4 font-mono text-sm">{stage.Id}</td>
                      <td className="p-4 font-medium">
                        <span className="inline-flex items-center gap-2">
                          <StageIconBadge stage={stage} size="xs" />
                          <Link
                            href={`/admin/learning-tracks?stageId=${stage.Id}`}
                            className="inline-flex items-center gap-1.5 font-bold mw-topic-ink hover:underline"
                          >
                            {stage.NameAr}
                            <DirectionalChevron direction="forward" className="h-4 w-4" />
                          </Link>
                        </span>
                      </td>
                      <td className="p-4 mw-topic-ink">
                        {stage.NameEn}
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mw-topic-action">
                          {stage.Order}
                        </span>
                      </td>
                      <td className="p-4 space-x-2 rtl:space-x-reverse">
                        <Tooltip><TooltipTrigger asChild><Link href={`/admin/learning-tracks?stageId=${stage.Id}`} className="mw-admin-action mw-action-view p-2" aria-label={ar?"عرض الصفوف والمستويات":"View grades and levels"}><Layers className="h-4 w-4" aria-hidden="true"/></Link></TooltipTrigger><TooltipContent>{ar?"عرض الصفوف والمستويات":"View grades and levels"}</TooltipContent></Tooltip>
                        <Tooltip><TooltipTrigger asChild><button type="button" className="mw-admin-action p-2" aria-label={t("common.edit")} onClick={()=>openModal(stage)}><Edit className="h-4 w-4 mw-topic-ink" aria-hidden="true"/></button></TooltipTrigger><TooltipContent>{t("common.edit")}</TooltipContent></Tooltip>


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

      <Dialog open={isModalOpen} onOpenChange={open => { if (!isSubmitting) setIsModalOpen(open); }}>
        <DialogContent className="max-w-3xl flex flex-col overflow-hidden">
          <DialogHeader className="shrink-0 pe-8"><DialogTitle>{t("admin.stages.edit")}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="flex min-h-0 flex-col gap-4">
            <div className="grid min-h-0 gap-4 overflow-y-auto p-1 sm:grid-cols-2">
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
            </div>
            {saveError && <p role="alert" className="text-sm text-destructive">{saveError}</p>}
              <DialogFooter className="shrink-0 border-t pt-3">
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
              </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
