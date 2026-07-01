// File: app/[locale]/stages/StagesPageClient.tsx

'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useGetStagesQuery } from '@/store/api/stagesApi';
import {  Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { useInView } from '@/lib/useInView';

const stageColors = [
  { from: 'from-emerald-500', to: 'to-teal-500', bg: 'bg-emerald-500/10', icon: '📐' },
  { from: 'from-blue-500', to: 'to-indigo-500', bg: 'bg-blue-500/10', icon: '🔢' },
  { from: 'from-amber-500', to: 'to-orange-500', bg: 'bg-amber-500/10', icon: '📈' },
  { from: 'from-violet-500', to: 'to-purple-500', bg: 'bg-violet-500/10', icon: '🧮' },
];

export default function StagesPageClient() {
  const t = useTranslations();
  const locale = useLocale();
  
  const { data: stages, isLoading, error } = useGetStagesQuery();
  const { ref: sectionRef, isInView } = useInView(0.05);

  if (error) {
    return (
      <section className="min-h-[60vh] flex items-center justify-center" ref={sectionRef}>
        <div className="text-center">
          <div className="flex flex-col items-center gap-4 text-red-500 dark:text-red-400">
            <AlertCircle className="h-12 w-12" />
            <p className="text-lg font-medium">{t('common.errorLoadingData')}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              {t('common.retry')}
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen py-12 lg:py-20 relative overflow-hidden" ref={sectionRef}>
      {/* Background */}
      <div className="absolute inset-0 math-grid-bg opacity-30" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/[0.02] rounded-full blur-[120px]" />

      <div className="container mx-auto lg:px-24 md:px-16 px-4 relative z-10">
        {/* Header */}
        <div className={`text-center mb-14 transition-all duration-700 ${
          isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="h-1 w-8 rounded-full bg-primary" />
            <span className="text-sm font-medium text-primary uppercase tracking-wider">
              {t('stages.title')}
            </span>
            <div className="h-1 w-8 rounded-full bg-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {t('stages.heading')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('stages.subtitle')}
          </p>
        </div>

        {/* Stages Grid */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {stages?.map((stage, index) => {
              const colors = stageColors[index % stageColors.length];
              
              return (
                <Link
                  key={stage.Id}
                  href={`/stages/${stage.Id}`}
                  className={`group relative overflow-hidden rounded-2xl border bg-card/80 dark:bg-card/40 backdrop-blur-sm p-6 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 ${
                    isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  {/* Top gradient accent */}
                  <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${colors.from} ${colors.to}`} />

                  {/* Background pattern */}
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE4YzEuNjU2IDAgMy0xLjM0NCAzLTNzLTEuMzQ0LTMtMy0zLTMgMS4zNDQtMyAzIDEuMzQ0IDMgMyAzem0wIDM2YzEuNjU2IDAgMy0xLjM0NCAzLTNzLTEuMzQ0LTMtMy0zLTMgMS4zNDQtMyAzIDEuMzQ0IDMgMyAzem0wLTE4YzEuNjU2IDAgMy0xLjM0NCAzLTNzLTEuMzQ0LTMtMy0zLTMgMS4zNDQtMyAzIDEuMzQ0IDMgMyAzeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

                  <div className="relative z-10">
                    {/* Icon */}
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${colors.bg} mb-5 group-hover:scale-110 transition-transform duration-500`}>
                      <span className="text-2xl">{colors.icon}</span>
                    </div>

                    {/* Stage Name */}
                    <h2 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors duration-300">
                      {locale === 'ar' ? stage.NameAr : stage.NameEn}
                    </h2>

                    {/* Categories count (optional - if you add this data later) */}
                    <p className="text-sm text-muted-foreground mb-4">
                      {t('stages.stageDescriptions.' + index, { defaultValue: '' })}
                    </p>

                    {/* Explore Link */}
                    <div className="flex items-center gap-1.5 text-sm font-medium text-primary mt-auto">
                      <span>{t('common.explore')}</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
                    </div>
                  </div>

                  {/* Decorative corner */}
                  <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/5 rounded-full blur-2xl transition-transform duration-500 group-hover:scale-150" />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}