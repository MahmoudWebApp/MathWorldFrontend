"use client";

import { Link } from '@/i18n/routing';
import { useTranslations, useLocale } from 'next-intl';
import { CheckCircle, Lock, ChevronRight, Eye, Star } from 'lucide-react';
import type { ProblemPreview } from '@/store/api/types';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { RichText } from '@/components/ui/RichText';
import { StageIconBadge } from '@/components/stages/StageIconBadge';
import { getStageVisual } from '@/lib/stageVisuals';

interface ProblemCardProps {
  problem: ProblemPreview;
}

export function ProblemCard({ problem }: ProblemCardProps) {
  const t = useTranslations();
  const locale = useLocale();
  const isArabic = locale === 'ar';

  const stageIdentity = {
    Id: problem.StageId,
    Name: problem.StageName,
  };
  const stageVisual = getStageVisual(stageIdentity);
  const stageColor = `border bg-gradient-to-r ${stageVisual.style.bg} ${stageVisual.style.iconColor}`;

  return (
    <Link href={`/problems/${problem.Id}`} className="block group outline-none">
      <Card className="brand-surface math-card relative overflow-hidden rounded-2xl backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-secondary/30 hover:shadow-[0_20px_52px_rgba(92,36,255,0.13)]">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-brand-primary/0 via-brand-primary/5 to-brand-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

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
                  <Badge variant="secondary" className={`gap-1.5 ${stageColor}`}>
                    <StageIconBadge stage={stageIdentity} size="xs" className="border-0 bg-background/35 shadow-none" />
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
              <div className="flex items-center gap-4 math-equation-chip rounded-lg px-3 py-2">
                <div className="inline-flex items-center gap-1.5 text-sm">
                  <Eye className="h-4 w-4 text-primary/70" />
                  <span className="font-medium">{problem.ViewsCount}</span>
                </div>

                {typeof problem.Points === 'number' && (
                  <>
                    <div className="h-4 w-px bg-border" />
                    <div className="inline-flex items-center gap-1.5 text-sm">
                      <Star className="h-4 w-4 text-primary/70" />
                      <span className="font-medium">{problem.Points}</span>
                    </div>
                  </>
                )}
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