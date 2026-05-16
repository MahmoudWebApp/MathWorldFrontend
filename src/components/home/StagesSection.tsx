// File: components/home/StagesSection.tsx
'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useGetStagesQuery } from '@/store/api/stagesApi';
import { GraduationCap, Loader2 } from 'lucide-react';
import { ArrowRight2 } from 'iconsax-reactjs';
import { useInView } from '@/lib/useInView';

export function StagesSection() {
  const t = useTranslations();
  const locale = useLocale();
  
  const { data: stagesResponse, isLoading } = useGetStagesQuery();
  const stages = stagesResponse || []; 
  
  const { ref, isInView } = useInView(0.1);

  // Color gradient variants for the cards
  const stageColors = [
    'from-indigo-500 to-blue-500',
    'from-emerald-500 to-teal-500',
    'from-amber-500 to-orange-500',
    'from-rose-500 to-pink-500',
    'from-purple-500 to-violet-500',
  ];

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
              {t('stages.title') || 'Educational Stages'}
            </span>
            <div className="h-1 w-8 rounded-full bg-primary" />
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            {t('stages.heading') || 'Explore by Educational Stage'}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('stages.subtitle') || 'Find problems tailored to your academic level'}
          </p>
        </div>

        {/* Stages grid – Centered using Flexbox instead of Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            {stages.map((stage, index) => {
              const color = stageColors[index % stageColors.length];
              return (
                <Link
                  key={stage.Id}
                  href={`/problems?stageId=${stage.Id}`}
                  className={`w-full sm:w-[calc(50%-1rem)] md:w-[calc(33.333%-1rem)] lg:w-[280px] group relative overflow-hidden rounded-2xl bg-gradient-to-br ${color} p-6 text-white shadow-lg transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 ${
                    isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  {/* Background pattern */}
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE4YzEuNjU2IDAgMy0xLjM0NCAzLTNzLTEuMzQ0LTMtMy0zLTMgMS4zNDQtMyAzIDEuMzQ0IDMgMyAzem0wLTZjMS42NTYgMCAzLTEuMzQ0IDMtM3MtMS4zNDQtMy0zLTMtMyAxLjM0NC0zIDMgMS4zNDQgMyAzIDN6bTAtNmMxLjY1NiAwIDMtMS4zNDQgMy0zcy0xLjM0NC0zLTMtMy0zIDEuMzQ0LTMgMyAxLjM0NCAzIDMgM3oiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20" />

                  {/* Icon */}
                  <div className="relative z-10 mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                    <GraduationCap className="h-6 w-6 text-white" />
                  </div>

                  {/* Stage name (localized) */}
                  <h3 className="relative z-10 text-xl font-bold mb-1">
                    {locale === 'ar' ? stage.NameAr : stage.NameEn}
                  </h3>

                  {/* Explore link */}
                  <div className="relative z-10 flex items-center gap-1 text-sm text-white/80 group-hover:text-white mt-4 transition-colors font-medium">
                    <span>{t('common.explore') || 'Explore problems'}</span>
                    <ArrowRight2 className="h-4 w-4 rtl:rotate-180 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                  </div>

                  {/* Decorative corner */}
                  <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl transition-transform duration-500 group-hover:scale-150" />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}