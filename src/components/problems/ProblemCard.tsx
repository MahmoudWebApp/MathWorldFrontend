"use client";

import { useTranslations, useLocale } from "next-intl";
import { Calculator, Eye, Star } from "lucide-react";
import { DirectionalArrow } from "@/components/ui/DirectionalNavigation";

import { Link } from "@/i18n/routing";
import type { ProblemPreview } from "@/store/api/types";
import { Badge } from "@/components/ui/Badge";
import { RichText } from "@/components/ui/RichText";
import { StageIconBadge } from "@/components/stages/StageIconBadge";
import { getStageAccent } from "@/lib/stageVisuals";

interface ProblemCardProps {
  problem: ProblemPreview;
}

/** A readable, accessible preview. A green check is never used for unsolved work. */
export function ProblemCard({ problem }: ProblemCardProps) {
  const t = useTranslations();
  const locale = useLocale();
  const stageIdentity = { Id: problem.StageId, Name: problem.StageName };
  const stageAccent = getStageAccent(stageIdentity);

  return (
    <Link
      href={`/problems/${problem.Id}`}
      className="group block rounded-3xl outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <article className="brand-surface rounded-3xl p-5 transition-[border-color,box-shadow] hover:shadow-md sm:p-6" style={{ borderColor: `${stageAccent}30` }}>
        <div className="flex gap-4">
          <div aria-hidden="true" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl" style={{ color: stageAccent, backgroundColor: `${stageAccent}17` }}>
            <Calculator className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <RichText
              text={problem.Title}
              isArabic={locale === "ar"}
              className="text-lg font-bold leading-7 text-foreground transition-colors"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {problem.StageName && (
                <Badge variant="secondary" className="gap-1.5 border bg-background/80 text-foreground" style={{ borderColor: `${stageAccent}34` }}>
                  <StageIconBadge stage={stageIdentity} size="xs" className="border-0 bg-transparent shadow-none" />
                  {problem.StageName}
                </Badge>
              )}
              {problem.CategoryName && (
                <Badge variant="outline" className="border-border bg-background/80 text-muted-foreground">
                  {problem.CategoryName}
                </Badge>
              )}
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><Eye aria-hidden="true" className="h-4 w-4" />{problem.ViewsCount}</span>
                {typeof problem.Points === "number" && (
                  <span className="inline-flex items-center gap-1.5"><Star aria-hidden="true" className="h-4 w-4 text-brand-secondary" />{problem.Points}</span>
                )}
              </div>
              <span className="inline-flex items-center gap-2 text-sm font-bold" style={{ color: stageAccent }}>
                {t("common.solveNow")}
                <DirectionalArrow direction="forward" />
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}