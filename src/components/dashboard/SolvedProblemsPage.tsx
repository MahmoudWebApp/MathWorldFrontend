'use client';

import { WorkspacePageHeader } from '@/components/ui/WorkspacePageHeader';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useGetSolvedProblemsQuery } from '@/store/api/usersApi';
import { MathWorldLoading } from '@/components/ui/MathWorldLoading';
import { ProblemCard } from '@/components/problems/ProblemCard';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AlertCircle, Target } from 'lucide-react';
import { AnimatedCounter } from '@/components/home/AnimatedCounter';
import { DirectionalArrow } from '@/components/ui/DirectionalNavigation';
import { useState, useEffect } from 'react';

export function SolvedProblemsPage() {
  const t = useTranslations();
  const locale = useLocale();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: solvedProblems, isLoading, error, refetch } = useGetSolvedProblemsQuery(locale, {
    refetchOnMountOrArgChange: 45,
  });

  const totalCount = solvedProblems?.length ?? 0;

  if (error || (!isLoading && !solvedProblems)) {
    return (
      <div className="container mx-auto lg:px-24 md:px-16 px-4 py-8">
        <div className="flex flex-col items-center gap-4 text-red-500 dark:text-red-400 py-20">
          <AlertCircle className="h-12 w-12" />
          <p className="text-lg font-medium">{t('common.errorLoadingData')}</p>
          <Button onClick={() => void refetch()} variant="outline">
            {t('common.retry')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto lg:px-24 md:px-16 px-4 py-8">
      <WorkspacePageHeader title={t('solved.title')} icon={Target} count={isLoading ? undefined : mounted ? <AnimatedCounter end={totalCount} duration={700}/> : totalCount} />

      {/* Problems List */}
      {isLoading ? (
        <div className="space-y-4">
          <MathWorldLoading compact />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-32 bg-muted/50 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : solvedProblems && solvedProblems.length > 0 ? (
        <div className="space-y-4">
          {solvedProblems.map((problem) => (
            <ProblemCard key={problem.Id}
              problem={{ ...problem, IsSolved: true, HasAttempted: true }} />
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <Target className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-xl font-semibold mb-2">{t('solved.empty.title')}</h3>
            <p className="text-muted-foreground mb-6">{t('solved.empty.description')}</p>
            <Button asChild>
                <Link href="/dashboard/categories">
                  {locale === "ar" ? "استكشف الفئات" : "Explore categories"}
                <DirectionalArrow direction="forward" className="h-4 w-4 ms-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}