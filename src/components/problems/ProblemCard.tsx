"use client";

import { Link } from '@/i18n/routing';
import { useTranslations, useLocale } from 'next-intl';
import { CheckCircle, Lock, ChevronRight, GraduationCap, Eye, Star } from 'lucide-react';
import type { ProblemPreview } from '@/store/api/types';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { RichText } from '@/components/ui/RichText';

interface ProblemCardProps {
  problem: ProblemPreview;
}

export function ProblemCard({ problem }: ProblemCardProps) {
  const t = useTranslations();
  const locale = useLocale();
  const isArabic = locale === 'ar';

  const getStageColorClass = (stageId: number | undefined): string => {
    if (stageId === undefined) {
      return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-800';
    }
    const stageColors = [
      'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
      'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800',
      'bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-950/50 dark:text-violet-300 dark:border-violet-800',
      'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
    ];
    return stageColors[stageId % stageColors.length];
  };

  const stageColor = getStageColorClass(problem.StageId);

  return (
    <Link href={`/problems/${problem.Id}`} className="block group outline-none">
      <Card className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:border-primary/40 hover:-translate-y-1">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Left: Title with RichText + Badges */}
            <div className="flex-1 space-y-3 min-w-0">
              <div className="flex items-start gap-3">
                <div className="mt-1 shrink-0">
                  {problem.RequiresLogin ? (
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                  )}
                </div>
                
                {/* Title with LaTeX rendering */}
                <div className="min-w-0 flex-1">
                  <RichText 
                    text={problem.Title} 
                    isArabic={isArabic}
                    className="line-clamp-3 text-lg font-bold group-hover:text-primary transition-colors duration-300"
                  />
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                {problem.StageName && (
                  <Badge variant="secondary" className={`border gap-1.5 ${stageColor}`}>
                    <GraduationCap className="h-3.5 w-3.5" />
                    {problem.StageName}
                  </Badge>
                )}
                {problem.CategoryName && (
                  <Badge variant="outline" className="bg-background/50 backdrop-blur-sm">
                    {problem.CategoryName}
                  </Badge>
                )}
              </div>
            </div>

            {/* Right: Stats + CTA */}
            <div className="flex md:flex-col items-center md:items-end justify-between gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-4 bg-muted/30 rounded-lg px-3 py-2">
                <div className="inline-flex items-center gap-1.5 text-sm">
                  <Eye className="h-4 w-4 text-primary/70" />
                  <span className="font-medium">{problem.ViewsCount}</span>
                </div>

                <div className="w-px h-4 bg-border"></div>

                <div className="inline-flex items-center gap-1.5 text-sm">
                  <Star className="h-4 w-4 text-primary/70" />
                  <span className="font-medium">{problem.Points}</span>
                </div>
              </div>

              <div className="flex items-center gap-1 font-medium group-hover:text-primary transition-colors">
                {t('common.solveNow')}
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}