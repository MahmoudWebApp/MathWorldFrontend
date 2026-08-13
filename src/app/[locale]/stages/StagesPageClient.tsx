'use client';

import { useLocale, useTranslations } from 'next-intl';
import {
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { motion } from 'framer-motion';

import { useGetStagesQuery } from '@/store/api/stagesApi';
import { sortStagesByOrder } from '@/lib/stageVisuals';
import { StagePremiumCard } from '@/components/stages/StagePremiumCard';
import { AccentHeadingText } from '@/components/ui/AccentHeadingText';

export default function StagesPageClient() {
  const t = useTranslations();
  const locale = useLocale();
  const { data: stages, isLoading, error } = useGetStagesQuery(locale, {
    refetchOnMountOrArgChange: true,
  });

  if (error) {
    return (
      <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden math-section-bg">
        <div className="math-grid-bg absolute inset-0 opacity-30" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass relative z-10 mx-4 max-w-md rounded-3xl p-10 text-center"
        >
          <div className="flex flex-col items-center gap-5 text-destructive">
            <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-8 w-8" />
            </div>
            <p className="text-xl font-bold">{t('common.errorLoadingData')}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition-all hover:shadow-lg hover:shadow-primary/25 active:scale-95"
            >
              {t('common.retry')}
            </button>
          </div>
        </motion.div>
      </section>
    );
  }

  return (
    <section className="math-section-bg relative min-h-screen overflow-hidden py-12 lg:py-20">
      <div className="math-grid-bg absolute inset-0 opacity-35" />
      <div className="pointer-events-none absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-brand-primary/10 blur-[150px]" />
      <div className="pointer-events-none absolute bottom-1/4 left-0 h-[400px] w-[400px] rounded-full bg-brand-secondary/10 blur-[120px]" />

      <div className="container relative z-10 mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <div className="math-equation-chip mb-6 inline-flex items-center justify-center gap-3 rounded-full px-4 py-2">
            <span className="flex h-2 w-2 rounded-full bg-brand-primary animate-pulse" />
            <span className="text-sm font-bold uppercase tracking-widest text-primary">
              {t('stages.title')}
            </span>
            <span className="flex h-2 w-2 rounded-full bg-brand-secondary animate-pulse" />
          </div>
          <h1 className="brand-display-title text-foreground mb-6 text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl">
            <AccentHeadingText text={t('stages.heading')} />
          </h1>
          <div className="math-divider mx-auto mb-6 w-56" />
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            {t('stages.subtitle')}
          </p>
        </motion.div>

        {isLoading ? (
          <div className="flex min-h-[30vh] items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : (
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 pb-20 md:grid-cols-2 lg:gap-8 xl:grid-cols-4">
            {sortStagesByOrder(stages ?? []).map((stage, index) => {
              return (
                <StagePremiumCard
                  key={stage.Id}
                  stage={stage}
                  index={index}
                  locale={locale}
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
