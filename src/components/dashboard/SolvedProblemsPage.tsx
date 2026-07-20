'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useGetSolvedProblemsQuery } from '@/store/api/usersApi';
import { ProblemCard } from '@/components/problems/ProblemCard';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AlertCircle, ArrowLeft, ArrowRight, Target } from 'lucide-react';
import { AnimatedCounter } from '@/components/home/AnimatedCounter';
import { useState, useEffect } from 'react';

export function SolvedProblemsPage() {
  const t = useTranslations();
  const locale = useLocale();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: solvedProblems, isLoading, error } = useGetSolvedProblemsQuery(locale, {
    refetchOnMountOrArgChange: true,
  });

  const totalCount = solvedProblems?.length ?? 0;

  if (error) {
    return (
      <div className="container mx-auto lg:px-24 md:px-16 px-4 py-8">
        <div className="flex flex-col items-center gap-4 text-red-500 dark:text-red-400 py-20">
          <AlertCircle className="h-12 w-12" />
          <p className="text-lg font-medium">{t('common.errorLoadingData')}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
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
          href="/dashboard" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          {t('dashboard.user.title')}
        </Link>
        
        <h1 className="text-3xl font-bold mb-2">{t('solved.title')}</h1>
        <p className="text-muted-foreground">{t('solved.subtitle')}</p>
      </div>

      {/* Stats */}
      <Card className="border-0 shadow-sm mb-8">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/20">
            <Target className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <div className="text-3xl font-bold">
              {isLoading ? (
                <span className="inline-block w-16 h-8 bg-muted animate-pulse rounded" />
              ) : mounted ? (
                <AnimatedCounter end={totalCount} duration={1500} />
              ) : (
                totalCount
              )}
            </div>
            <div className="text-sm text-muted-foreground">{t('solved.stats.total')}</div>
          </div>
        </CardContent>
      </Card>

      {/* Problems List */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-32 bg-muted/50 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : solvedProblems && solvedProblems.length > 0 ? (
        <div className="space-y-4">
          {solvedProblems.map((problem) => (
            <ProblemCard key={problem.Id} problem={problem} />
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <Target className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-xl font-semibold mb-2">{t('solved.empty.title')}</h3>
            <p className="text-muted-foreground mb-6">{t('solved.empty.description')}</p>
            <Button asChild>
                <Link href="/stages">
                  {t("hero.browseStages")}
                <ArrowRight className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0 rtl:rotate-180" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}