"use client";

import { useTranslations, useLocale } from "next-intl";
import { Calculator, Eye, Star, CheckCircle2, AlertCircle, CircleDot } from "lucide-react";
import { DirectionalArrow } from "@/components/ui/DirectionalNavigation";

import { Link } from "@/i18n/routing";
import type { ProblemPreview } from "@/store/api/types";
import { Badge } from "@/components/ui/Badge";
import { RichText } from "@/components/ui/RichText";
import { StageIconBadge } from "@/components/stages/StageIconBadge";
import { usePathname } from "@/i18n/routing";
import { getStageAccent } from "@/lib/stageVisuals";

interface ProblemCardProps {
  problem: ProblemPreview;
}

/** A readable, accessible preview. A green check is never used for unsolved work. */
export function ProblemCard({ problem }: ProblemCardProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const inStudentWorkspace = pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  const locale = useLocale();
  const stageIdentity = { Id: problem.StageId, Name: problem.StageName };
  const stageAccent = getStageAccent(stageIdentity);

  return (
    <Link
      href={`${inStudentWorkspace ? "/dashboard" : ""}/problems/${problem.Id}`}
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
              {typeof problem.IsSolved === "boolean" && typeof problem.HasAttempted === "boolean" && (problem.IsSolved === true ? (
                <Badge variant="secondary" className="gap-1 border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {locale === "ar" ? "محلولة" : "Solved"}
                </Badge>
              ) : problem.HasAttempted === true ? (
                <Badge variant="secondary" className="gap-1 border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {locale === "ar" ? "تحتاج مراجعة" : "Needs review"}
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-1 border-amber-400/40 bg-amber-400/10 text-amber-700 dark:text-amber-300">
                  <CircleDot className="h-3.5 w-3.5" />
                  {locale === "ar" ? "جديدة" : "New"}
                </Badge>
              ))}
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
                  <span className="inline-flex items-center gap-1.5"><Star aria-hidden="true" className="h-4 w-4 text-amber-500" />{problem.Points}</span>
                )}
              </div>
              <span className="inline-flex items-center gap-2 text-sm font-bold" style={{ color: stageAccent }}>
                {problem.IsSolved ? (locale === "ar" ? "عرض المسألة" : "View question") :
                  problem.HasAttempted ? (locale === "ar" ? "راجع الخطأ" : "Review mistake") : t("common.solveNow")}
                <DirectionalArrow direction="forward" />
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}