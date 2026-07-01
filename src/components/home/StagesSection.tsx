// File: components/home/StagesSection.tsx
'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useGetStagesQuery } from '@/store/api/stagesApi';
import {  Loader2, ArrowRight } from 'lucide-react';
import { useInView } from '@/lib/useInView';

export function StagesSection() {
  const t = useTranslations();
  const locale = useLocale();
  
  const { data: stages, isLoading } = useGetStagesQuery();
  const { ref, isInView } = useInView(0.1);

  const stageColors = [
    { from: 'from-emerald-500', to: 'to-teal-500', bg: 'bg-emerald-500/10' },
    { from: 'from-blue-500', to: 'to-indigo-500', bg: 'bg-blue-500/10' },
    { from: 'from-amber-500', to: 'to-orange-500', bg: 'bg-amber-500/10' },
    { from: 'from-violet-500', to: 'to-purple-500', bg: 'bg-violet-500/10' },
  ];

  const stageIcons = [
    '📐', '🔢', '📈', '🧮',
  ];

  if (isLoading) {
    return (
      <section className="py-20 lg:py-28 bg-background" ref={ref}>
        <div className="container mx-auto lg:px-24 md:px-16 px-4">
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </section>
    );
  }

  if (!stages || stages.length === 0) {
    return null;
  }

  return (
    <section className="py-20 lg:py-28 bg-background relative overflow-hidden" ref={ref}>
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/[0.02] rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/[0.02] rounded-full blur-[120px]" />

      <div className="container mx-auto lg:px-24 md:px-16 px-4 relative z-10">
        {/* Section header */}
        <div
          className={`text-center mb-14 transition-all duration-700 ${
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="h-1 w-8 rounded-full bg-primary" />
            <span className="text-sm font-medium text-primary uppercase tracking-wider">
              {t('stages.title')}
            </span>
            <div className="h-1 w-8 rounded-full bg-primary" />
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            {t('stages.heading')}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('stages.subtitle')}
          </p>
        </div>

        {/* Stages cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6 max-w-5xl mx-auto">
          {stages.map((stage, index) => {
            const colors = stageColors[index % stageColors.length];
            const icon = stageIcons[index % stageIcons.length];
            
            return (
              <Link
                key={stage.Id}
                href={`/stages/${stage.Id}`}
                className={`group relative overflow-hidden rounded-2xl border bg-card/80 dark:bg-card/40 backdrop-blur-sm p-6 transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 ${
                  isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                {/* Top gradient accent */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colors.from} ${colors.to}`} />

                {/* Icon */}
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${colors.bg} mb-5 group-hover:scale-110 transition-transform duration-500`}>
                  <span className="text-2xl">{icon}</span>
                </div>

                {/* Stage name */}
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors duration-300">
                  {locale === 'ar' ? stage.NameAr : stage.NameEn}
                </h3>

                {/* Description */}
                <p className="text-sm text-muted-foreground mb-4">
                  {t(`stages.stageDescriptions.${index}`, { defaultValue: '' })}
                </p>

                {/* Explore link */}
                <div className="flex items-center gap-1.5 text-sm font-medium text-primary mt-auto">
                  <span>{t('common.explore')}</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}