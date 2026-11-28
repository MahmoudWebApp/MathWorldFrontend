'use client';

import { WorkspacePageHeader } from '@/components/ui/WorkspacePageHeader';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useGetUserProblemPageQuery, useGetLearningStageQuery } from '@/store/api/usersApi';
import { Pagination } from '@/components/ui/Pagination';
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

  const {data:stage,isLoading:stageLoading,isError:stageError,refetch:reloadStage}=useGetLearningStageQuery();
  const stageId=stage?.StageId??0;
  const [page,setPage]=useState(1);
  useEffect(()=>setPage(1),[stageId,locale]);
  const {currentData:result,isLoading,isFetching,error,refetch}=useGetUserProblemPageQuery({kind:'solved',page,locale,stageId},{skip:stageId<=0,refetchOnMountOrArgChange:45});
  const solvedProblems=result?.Items??[];
  const totalCount=result?.Total??0;
  useEffect(()=>{if(result&&page>Math.max(1,Math.ceil(result.Total/5)))setPage(Math.max(1,Math.ceil(result.Total/5)));},[result,page]);

  if ((error || stageError) && !result) {
    return (
      <div className="container mx-auto lg:px-24 md:px-16 px-4 py-8">
        <div className="flex flex-col items-center gap-4 text-red-500 dark:text-red-400 py-20">
          <AlertCircle className="h-12 w-12" />
          <p className="text-lg font-medium">{t('common.errorLoadingData')}</p>
          <Button onClick={() => {void reloadStage();if(stageId>0)void refetch();}} variant="outline">
            {t('common.retry')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto lg:px-24 md:px-16 px-4 py-8">
      <WorkspacePageHeader title={t('solved.title')} icon={Target} count={isLoading || stageLoading || isFetching ? undefined : mounted ? <AnimatedCounter end={totalCount} duration={700}/> : totalCount} />

      {/* Problems List */}
      {stageLoading || isLoading || (isFetching&&!result) ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl border border-border/50 bg-muted/50 motion-safe:animate-pulse" />
          ))}
        </div>
      ) : solvedProblems && solvedProblems.length > 0 ? (
        <div className="space-y-4">
          {solvedProblems.map((problem) => (
            <ProblemCard key={problem.Id}
              problem={{ ...problem, IsSolved: true, HasAttempted: true }} />
          ))}
          {totalCount>5&&<Pagination page={page} pageSize={5} total={totalCount} onPageChange={setPage} disabled={isFetching}/>}
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