"use client";

import { useTranslations } from "next-intl";
import { DirectionalArrow } from "@/components/ui/DirectionalNavigation";
import { LockKeyhole } from "lucide-react";

import { Link } from "@/i18n/routing";
import type { Stage } from "@/store/api/stagesApi";
import { getStageVisual, getStageAccent } from "@/lib/stageVisuals";
import { StageIconBadge } from "@/components/stages/StageIconBadge";
import { StageGeometry } from "@/components/math/StageGeometry";

interface StagePremiumCardProps {
  stage: Stage;
  index: number;
  locale: string;
  locked?: boolean;
}

/** A calm alternative to the original 3D rotating stage card. */
export function StagePremiumCard({ stage, index, locale, locked = false }: StagePremiumCardProps) {
  const t = useTranslations();
  const visual = getStageVisual(stage);
  const accent = getStageAccent(stage);
  const variants = [
    { edge: "border-cyan-500/30 hover:border-cyan-500/55", bg: "from-cyan-500/12 via-card to-card", text: "text-cyan-700 dark:text-cyan-300", bar: "bg-cyan-500" },
    { edge: "border-orange-500/30 hover:border-orange-500/55", bg: "from-orange-500/12 via-card to-card", text: "text-orange-700 dark:text-orange-300", bar: "bg-orange-500" },
    { edge: "border-emerald-500/30 hover:border-emerald-500/55", bg: "from-emerald-500/12 via-card to-card", text: "text-emerald-700 dark:text-emerald-300", bar: "bg-emerald-500" },
    { edge: "border-violet-500/30 hover:border-violet-500/55", bg: "from-violet-500/12 via-card to-card", text: "text-violet-700 dark:text-violet-300", bar: "bg-violet-500" },
  ] as const;
  const tone = variants[visual.index % variants.length];

  return (
    <Link
      href={locked ? "/learning-stage" : `/stages/${stage.Id}`}
      className={`group relative flex h-full min-h-[245px] flex-col overflow-hidden rounded-3xl border bg-gradient-to-br p-6 shadow-sm outline-none transition-[border-color,box-shadow,transform] hover:-translate-y-1 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ${tone.edge} ${tone.bg}`}
    >
      <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-1 ${tone.bar}`} />
      {locked && <LockKeyhole aria-hidden="true" className="absolute end-5 top-5 h-5 w-5 text-muted-foreground" />}
      <StageGeometry variant={visual.index} className={`pointer-events-none absolute -end-8 top-10 h-40 w-40 opacity-[0.12] transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110 ${tone.text}`} />
      <span aria-hidden="true" dir="ltr" className="absolute end-6 top-6 text-xs font-bold tracking-wider text-muted-foreground/70">
        {String(stage.Order > 0 ? stage.Order : visual.ordinal).padStart(2, "0")}
      </span>
      <div className="relative mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-card/70">
        <StageIconBadge stage={stage} size="lg" className="border-0 bg-transparent shadow-none" />
      </div>
      <h3 className="relative mb-3 text-xl font-extrabold leading-snug group-hover:underline"
        style={{ color: accent }}>
        {locale === "ar" ? stage.NameAr : stage.NameEn}
      </h3>
      <p className="mb-6 text-sm leading-7 text-muted-foreground">
        {(locale === 'ar' ? stage.DescriptionAr : stage.DescriptionEn)?.trim()
          || (locale === 'ar' ? 'استكشف هذه المرحلة وفئاتها ومسائلها التعليمية.' : 'Explore the learning stage, topics and practice questions.')}
      </p>
      <div className="mt-auto flex items-center justify-between gap-3 border-t border-border/70 pt-4 text-sm font-bold"
        style={{ color: accent }}>
        <span>{t("common.explore")}</span>
        <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-xl transition-colors group-hover:text-white"
          style={{ backgroundColor: `${accent}15`, color: accent }}>
          <DirectionalArrow direction="forward" />
        </span>
      </div>
    </Link>
  );
}