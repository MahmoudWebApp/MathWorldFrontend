'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

import { useGetStagesQuery } from '@/store/api/stagesApi';
import { sortStagesByOrder } from '@/lib/stageVisuals';
import { StagePremiumCard } from '@/components/stages/StagePremiumCard';
import { AccentHeadingText } from '@/components/ui/AccentHeadingText';

export function StagesSection() {
  const t = useTranslations();
  const locale = useLocale();
  const { data: stages, isLoading } = useGetStagesQuery(locale, {
    refetchOnMountOrArgChange: true,
  });

  if (isLoading) {
    return (
      <section className="home-stages-section flex min-h-[50vh] items-center justify-center py-24 lg:py-32">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </section>
    );
  }

  if (!stages || stages.length === 0) return null;

  return (
    <section className="home-stages-section relative overflow-hidden py-24 lg:py-32">
      <div className="math-grid-bg pointer-events-none absolute inset-0 opacity-25" />
      <div className="home-stages-orb home-stages-orb-a" />
      <div className="home-stages-orb home-stages-orb-b" />

      <svg
        className="pointer-events-none absolute inset-x-0 bottom-0 h-52 w-full opacity-70"
        viewBox="0 0 1440 220"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path className="home-stage-section-wave-a" d="M0 148 C220 75 360 196 590 138 C815 82 990 32 1440 116 L1440 220 L0 220 Z" />
        <path className="home-stage-section-wave-b" d="M0 183 C250 112 390 228 650 165 C890 108 1120 105 1440 160 L1440 220 L0 220 Z" />
      </svg>

      <div className="container relative z-10 mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          className="mb-16 text-center lg:mb-20"
        >
          <div className="math-equation-chip mb-5 inline-flex items-center justify-center gap-3 rounded-full px-4 py-2">
            <span className="flex h-2 w-2 animate-pulse rounded-full bg-brand-primary" />
            <span className="text-sm font-extrabold uppercase tracking-[0.14em] text-primary">
              {t('stages.title')}
            </span>
            <span className="flex h-2 w-2 animate-pulse rounded-full bg-brand-secondary" />
          </div>
          <h2 className="brand-display-title mb-5 text-4xl font-black tracking-tight lg:text-6xl">
            <AccentHeadingText text={t('stages.heading')} />
          </h2>
          <p className="mx-auto max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
            {t('stages.subtitle')}
          </p>
        </motion.div>

        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 md:grid-cols-2 lg:gap-7 xl:grid-cols-4">
          {sortStagesByOrder(stages).map((stage, index) => {
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
      </div>
    </section>
  );
}
