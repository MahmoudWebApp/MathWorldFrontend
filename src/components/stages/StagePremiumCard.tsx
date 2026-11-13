"use client";

import { useTranslations } from "next-intl";
import { DirectionalArrow } from "@/components/ui/DirectionalArrow";

import { Link } from "@/i18n/routing";
import type { Stage } from "@/store/api/stagesApi";
import { getStageVisual } from "@/lib/stageVisuals";
import { StageIconBadge } from "@/components/stages/StageIconBadge";

interface StagePremiumCardProps {
  stage: Stage;
  index: number;
  locale: string;
}

/** A calm alternative to the original 3D rotating stage card. */
export function StagePremiumCard({ stage, index, locale }: StagePremiumCardProps) {
  const t = useTranslations();
  const visual = getStageVisual(stage);

  return (
    <Link
      href={`/stages/${stage.Id}`}
      className="group relative flex h-full min-h-[245px] flex-col overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm outline-none transition-[border-color,box-shadow] hover:border-brand-primary/35 hover:shadow-md focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-primary via-brand-primary-light to-brand-secondary" />
      <span aria-hidden="true" dir="ltr" className="absolute end-6 top-6 text-xs font-bold tracking-wider text-muted-foreground/70">
        {String(stage.Order > 0 ? stage.Order : visual.ordinal).padStart(2, "0")}
      </span>
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-primary/8">
        <StageIconBadge stage={stage} size="lg" className="border-0 bg-transparent shadow-none" />
      </div>
      <h3 className="mb-3 text-xl font-extrabold leading-snug text-foreground group-hover:text-brand-primary-strong dark:group-hover:text-brand-primary-light">
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