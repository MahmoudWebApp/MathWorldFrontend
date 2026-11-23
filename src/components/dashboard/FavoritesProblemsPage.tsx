'use client';

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
      {/* Header */}
      <div className="mb-8">
        <Link 
          href="/dashboard/categories" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-4"
        >
          <DirectionalArrow direction="back" />
          {t('dashboard.user.title')}
        </Link>
        
        <h1 className="text-3xl font-bold mb-2">{t('favorites.title')}</h1>
        <p className="text-muted-foreground">{t('favorites.subtitle')}</p>
      </div>

      {/* Compact summary: keep number and icon together; no empty full-width card. */}
      <div className="mb-6 flex justify-end">
      <Card className="w-fit min-w-[190px] max-w-full border shadow-sm">
        <CardContent className="flex items-center gap-3 px-5 py-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 dark:bg-red-900/20">
            <Heart className="h-6 w-6 text-red-500 fill-red-500" />
          </div>
          <div>
            <div className="text-xl font-extrabold tabular-nums sm:text-2xl">
              {isLoading || stageLoading ? (
                <span className="inline-block w-16 h-8 bg-muted animate-pulse rounded" />
              ) : mounted ? (
                <AnimatedCounter end={totalCount} duration={1500} />
              ) : (
                totalCount
              )}
            </div>
            <div className="whitespace-nowrap text-xs text-muted-foreground">{t('favorites.stats.total')}</div>
          </div>
        </CardContent>
      </Card>
      </div>

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