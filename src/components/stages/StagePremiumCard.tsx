"use client";

import { useTranslations } from "next-intl";
import { DirectionalArrow } from "@/components/ui/DirectionalNavigation";

import { Link } from "@/i18n/routing";
import type { Stage } from "@/store/api/stagesApi";
import { getStageVisual } from "@/lib/stageVisuals";
import { StageIconBadge } from "@/components/stages/StageIconBadge";
import { StageGeometry } from "@/components/math/StageGeometry";

interface StagePremiumCardProps {
  stage: Stage;
  index: number;
  locale: string;
}

/** A calm alternative to the original 3D rotating stage card. */
export function StagePremiumCard({ stage, index, locale }: StagePremiumCardProps) {
  const t = useTranslations();
  const visual = getStageVisual(stage);
  const variants = [
    { edge: "border-cyan-500/30 hover:border-cyan-500/55", bg: "from-cyan-500/12 via-card to-card", text: "text-cyan-700 dark:text-cyan-300", bar: "bg-cyan-500" },
    { edge: "border-orange-500/30 hover:border-orange-500/55", bg: "from-orange-500/12 via-card to-card", text: "text-orange-700 dark:text-orange-300", bar: "bg-orange-500" },
    { edge: "border-emerald-500/30 hover:border-emerald-500/55", bg: "from-emerald-500/12 via-card to-card", text: "text-emerald-700 dark:text-emerald-300", bar: "bg-emerald-500" },
    { edge: "border-violet-500/30 hover:border-violet-500/55", bg: "from-violet-500/12 via-card to-card", text: "text-violet-700 dark:text-violet-300", bar: "bg-violet-500" },
  ] as const;
  const tone = variants[visual.index % variants.length];

  return (
    <Link
      href={`/stages/${stage.Id}`}
      className={`group relative flex h-full min-h-[245px] flex-col overflow-hidden rounded-3xl border bg-gradient-to-br p-6 shadow-sm outline-none transition-[border-color,box-shadow,transform] hover:-translate-y-1 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ${tone.edge} ${tone.bg}`}
    >
      <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-1 ${tone.bar}`} />
      <StageGeometry variant={visual.index} className={`pointer-events-none absolute -end-8 top-10 h-40 w-40 opacity-[0.12] transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110 ${tone.text}`} />
      <span aria-hidden="true" dir="ltr" className="absolute end-6 top-6 text-xs font-bold tracking-wider text-muted-foreground/70">
        {String(stage.Order > 0 ? stage.Order : visual.ordinal).padStart(2, "0")}
      </span>
      <div className="relative mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-card/70">
        <StageIconBadge stage={stage} size="lg" className="border-0 bg-transparent shadow-none" />
      </div>
      <h3 className={`relative mb-3 text-xl font-extrabold leading-snug text-foreground group-hover:underline ${tone.text}`}>
        {locale === "ar" ? stage.NameAr : stage.NameEn}
      </h3>
      <p className="mb-6 text-sm leading-7 text-muted-foreground">
        {t(`stages.stageDescriptions.${index}`, { defaultValue: "" })}
      </p>
      <div className="mt-auto flex items-center justify-between gap-3 border-t border-border/70 pt-4 text-sm font-bold text-brand-primary-strong dark:text-brand-primary-light">
        <span>{t("common.explore")}</span>
        <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary transition-colors group-hover:bg-brand-primary group-hover:text-white">
          <DirectionalArrow direction="forward" />
        </span>
      </div>
    </Link>
  );
}