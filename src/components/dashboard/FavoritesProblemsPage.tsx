'use client';

import { WorkspacePageHeader } from '@/components/ui/WorkspacePageHeader';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useGetFavoritesQuery, useGetLearningStageQuery, useToggleFavoriteMutation } from '@/store/api/usersApi';
import { ProblemCard } from '@/components/problems/ProblemCard';
import { MathWorldLoading } from '@/components/ui/MathWorldLoading';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AlertCircle, Heart, X } from 'lucide-react';
import { DirectionalArrow } from '@/components/ui/DirectionalNavigation';
import { AnimatedCounter } from '@/components/home/AnimatedCounter';
import { useState, useEffect } from 'react';

export function FavoritesProblemsPage() {
  const t = useTranslations();
  const locale = useLocale();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: selectedStage, isLoading: stageLoading, isError: stageError, refetch: retryStage } = useGetLearningStageQuery();
  const stageId = selectedStage?.StageId ?? 0;
  const { data: favorites, isLoading, error, refetch: retryFavorites } = useGetFavoritesQuery(locale, {
    refetchOnMountOrArgChange: 45,
  });
  const [toggleFavorite] = useToggleFavoriteMutation();

  // Favorites remain stored across stage changes; the student only browses
  // items belonging to the currently selected stage.
  const stageFavorites = (favorites ?? []).filter(problem => problem.StageId === stageId);
  const totalCount = stageFavorites.length;

  const handleRemoveFavorite = async (problemId: number) => {
    try {
      await toggleFavorite({
        ProblemId: problemId,
        IsFavorite: false,
      }).unwrap();
    } catch (err) {
      console.error('Failed to remove favorite:', err);
    }
  };

  if (error || stageError || (!isLoading && !favorites)) {
    return (
      <div className="container mx-auto lg:px-24 md:px-16 px-4 py-8">
        <div className="flex flex-col items-center gap-4 text-red-500 dark:text-red-400 py-20">
          <AlertCircle className="h-12 w-12" />
          <p className="text-lg font-medium">{t('common.errorLoadingData')}</p>
          <Button onClick={() => { void retryStage(); void retryFavorites(); }} variant="outline">
            {t('common.retry')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto lg:px-24 md:px-16 px-4 py-8">
      <WorkspacePageHeader title={t('favorites.title')} icon={Heart} iconTone="favorite" count={isLoading || stageLoading ? undefined : mounted ? <AnimatedCounter end={totalCount} duration={700}/> : totalCount} />

      {/* Problems List */}
      {isLoading ? (
        <div className="space-y-4">
          <MathWorldLoading compact />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-32 bg-muted/50 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : stageFavorites.length > 0 ? (
        <div className="space-y-4">
          {stageFavorites.map((problem) => (
            <div key={problem.Id} className="relative group/card">
              <ProblemCard problem={problem} />
              
              {/* Remove Button */}
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 end-4 z-10 opacity-0 group-hover/card:opacity-100 transition-opacity duration-200 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleRemoveFavorite(problem.Id);
                }}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">{t('favorites.remove')}</span>
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-xl font-semibold mb-2">{t('favorites.empty.title')}</h3>
            <p className="text-muted-foreground mb-6">{t('favorites.empty.description')}</p>
            <Button asChild>
              <Link href="/dashboard/categories">
                  {locale === "ar" ? "استكشف الفئات" : "Explore categories"}
                <DirectionalArrow direction="forward" className="ms-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}