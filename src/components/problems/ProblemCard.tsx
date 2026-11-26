"use client";

import { useTranslations, useLocale } from "next-intl";
import { Calculator, Star, CheckCircle2, AlertCircle, CircleDot } from "lucide-react";
import { DirectionalArrow } from "@/components/ui/DirectionalNavigation";

import { Link } from "@/i18n/routing";
import type { ProblemPreview } from "@/store/api/types";
import { Badge } from "@/components/ui/Badge";
import {ProblemTitle} from '@/components/problems/ProblemTitle';
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
      className="group mx-auto block w-full max-w-5xl rounded-3xl outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <article className="brand-surface mw-topic-surface rounded-3xl p-4 hover:shadow-md sm:p-5"
        style={{ "--stage-accent": stageAccent } as import("react").CSSProperties}>
        <div className="flex flex-row items-start justify-between gap-3 sm:gap-4">
          <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4">
            <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl sm:h-12 sm:w-12"
              style={{ color: stageAccent, backgroundColor: stageAccent + '17' }}>
              <Calculator className="h-6 w-6" />
            </span>
            <div className="min-w-0 flex-1">
              <ProblemTitle text={problem.Title} className="text-base font-bold leading-7 text-foreground transition-colors sm:text-lg"/>
              <div className="mt-3 flex flex-wrap gap-2">
                {typeof problem.IsSolved === "boolean" && typeof problem.HasAttempted === "boolean" &&
                  (problem.IsSolved ? (
                    <Badge variant="secondary" className="gap-1 border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {locale === "ar" ? "محلولة" : "Solved"}
                    </Badge>
                  ) : problem.HasAttempted ? (
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
                  <Badge variant="secondary" className="gap-1.5 border bg-background/80 text-foreground" style={{ borderColor: stageAccent + '34' }}>
                    <StageIconBadge stage={stageIdentity} size="xs" className="border-0 bg-transparent shadow-none" />
                    {problem.StageName}
                  </Badge>
                )}
                {problem.CategoryName && (
                  <Badge variant="outline" className="mw-topic-action">
                    {problem.CategoryName}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-3 pt-0 sm:gap-4">
            {typeof problem.Points === "number" ? (
              <span className="inline-flex items-center gap-1.5 text-sm font-bold text-amber-600 dark:text-amber-300"
                aria-label={(locale === "ar" ? "النقاط: " : "Points: ") + problem.Points}>
                <Star aria-hidden="true" className="h-4 w-4 fill-amber-400/15" />
                <span className="tabular-nums">{problem.Points}</span>
              </span>
            ) : <span aria-hidden="true" />}
            <span className="inline-flex items-center gap-2 whitespace-nowrap text-sm font-bold transition-colors group-hover:underline"
              style={{ color: stageAccent }}>
              {problem.IsSolved ? (locale === "ar" ? "عرض المسألة" : "View question") :
                problem.HasAttempted ? (locale === "ar" ? "راجع الخطأ" : "Review mistake") : t("common.solveNow")}
              <DirectionalArrow direction="forward" className="h-4 w-4" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}