// File: app/[locale]/stages/[stageId]/StageCategoriesClient.tsx

'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useGetCategoriesQuery } from '@/store/api/categoriesApi';
import { useGetStagesQuery } from '@/store/api/stagesApi';
import { Loader2, AlertCircle, ArrowLeft, Filter, ChevronRight, ArrowRight } from 'lucide-react';
import { useInView } from '@/lib/useInView';
import { Link } from '@/i18n/routing';
import Image from 'next/image';

// Color gradients and math symbols for category cards
const colorGradients = [
  'from-blue-500/10 to-indigo-500/5 dark:from-blue-500/15 dark:to-indigo-500/5',
  'from-emerald-500/10 to-teal-500/5 dark:from-emerald-500/15 dark:to-teal-500/5',
  'from-amber-500/10 to-orange-500/5 dark:from-amber-500/15 dark:to-orange-500/5',
  'from-rose-500/10 to-pink-500/5 dark:from-rose-500/15 dark:to-pink-500/5',
  'from-violet-500/10 to-purple-500/5 dark:from-violet-500/15 dark:to-purple-500/5',
  'from-cyan-500/10 to-sky-500/5 dark:from-cyan-500/15 dark:to-sky-500/5',
  'from-fuchsia-500/10 to-pink-500/5 dark:from-fuchsia-500/15 dark:to-pink-500/5',
  'from-lime-500/10 to-green-500/5 dark:from-lime-500/15 dark:to-green-500/5',
];

const mathSymbols = [
  { symbol: 'x²', equation: 'ax² + bx + c = 0' },
  { symbol: 'πr²', equation: 'S = πr²' },
  { symbol: '∫', equation: '∫ f(x) dx' },
  { symbol: 'σ', equation: 'μ ± σ' },
  { symbol: 'n!', equation: 'gcd(a, b)' },
  { symbol: 'P(A)', equation: 'nCr × pʳ' },
  { symbol: 'sinθ', equation: 'sin²θ + cos²θ = 1' },
  { symbol: '[A]', equation: 'Ax = λx' },
  { symbol: '∑', equation: 'f(x) = ∑ xᵢ' },
  { symbol: '∂', equation: '∂f/∂x' },
  { symbol: '∇', equation: '∇ × F' },
  { symbol: '∞', equation: 'lim (x→∞)' },
];

// Colors for stage cards (matching StagesPageClient)
const stageCardColors = [
  { from: 'from-emerald-500', to: 'to-teal-500', bg: 'bg-emerald-500/10', icon: '📐' },
  { from: 'from-blue-500', to: 'to-indigo-500', bg: 'bg-blue-500/10', icon: '🔢' },
  { from: 'from-amber-500', to: 'to-orange-500', bg: 'bg-amber-500/10', icon: '📈' },
  { from: 'from-violet-500', to: 'to-purple-500', bg: 'bg-violet-500/10', icon: '🧮' },
];

interface StageCategoriesClientProps {
  stageId: number;
}

export default function StageCategoriesClient({ stageId }: StageCategoriesClientProps) {
  const t = useTranslations();
  const locale = useLocale();
  const isRtl = locale === 'ar';
  
  const { data: allCategories, isLoading: categoriesLoading, error: categoriesError } = useGetCategoriesQuery();
  const { data: stages, isLoading: stagesLoading } = useGetStagesQuery();
  const { ref: sectionRef, isInView } = useInView(0.05);

  const currentStage = stages?.find(s => s.Id === stageId);
  const stageCategories = allCategories?.filter(cat => cat.StageId === stageId) || [];
  const sortedCategories = [...stageCategories].sort((a, b) => (a.Order || 0) - (b.Order || 0));
  
  // Filter out current stage for "Other Stages" section
  const otherStages = stages?.filter(s => s.Id !== stageId) || [];

  if (categoriesError) {
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

  const isLoading = categoriesLoading || stagesLoading;

  return (
    <section className="min-h-screen py-12 lg:py-20 relative overflow-hidden" ref={sectionRef}>
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/[0.02] rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/[0.02] rounded-full blur-[120px]" />
      <div className="absolute inset-0 math-grid-bg opacity-30" />

      <div className="container mx-auto lg:px-24 md:px-16 px-4 relative z-10">
        {/* Breadcrumb & Back Button */}
        <div className="mb-8">
          <Link
            href="/stages"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft className={`h-4 w-4 ${isRtl ? 'rotate-180' : ''}`} />
            {t('stages.backToStages')}
          </Link>
          
          <div className={`transition-all duration-700 ${
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-1 w-8 rounded-full bg-primary" />
              <span className="text-sm font-medium text-primary uppercase tracking-wider">
                {currentStage ? (locale === 'ar' ? currentStage.NameAr : currentStage.NameEn) : t('stages.title')}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {currentStage 
                ? (locale === 'ar' ? currentStage.NameAr : currentStage.NameEn) 
                : t('categories.title')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              {t('categories.stageSubtitle', { 
                stage: currentStage ? (locale === 'ar' ? currentStage.NameAr : currentStage.NameEn) : '',
                defaultValue: t('categories.subtitle')
              })}
            </p>
          </div>
        </div>

        {/* Categories Grid */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : sortedCategories.length === 0 ? (
          <div className="text-center py-16">
            <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">
              {t('categories.noCategories')}
            </h3>
            <p className="text-muted-foreground">
              {t('categories.noCategoriesDesc')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {sortedCategories.map((category, index) => {
              const math = mathSymbols[category.Id % mathSymbols.length];
              const colorClass = colorGradients[category.Id % colorGradients.length];
              const iconUrl = category.Icon;

              return (
                <div
                  key={category.Id}
                  className={`transition-all duration-700 ${
                    isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                  }`}
                  style={{ transitionDelay: isInView ? `${index * 60}ms` : '0ms' }}
                >
                  <Link
                    href={`/problems?categoryId=${category.Id}&stageId=${stageId}`}
                    className="block group"
                  >
                    <div className="relative overflow-hidden rounded-2xl border bg-card/80 dark:bg-card/40 backdrop-blur-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 cursor-pointer h-full hover:-translate-y-1">
                      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colorClass.replace('/10', '/60').replace('/5', '/30').replace('/15', '/60')}`} />
                      <div className={`absolute inset-0 bg-gradient-to-br ${colorClass} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                      <div className="relative p-5 lg:p-6 flex flex-col items-center text-center gap-3">
                        {/* Icon - handles both emoji and image URLs */}
                        <div className="flex h-14 w-14 lg:h-16 lg:w-16 items-center justify-center rounded-2xl bg-primary/[0.08] dark:bg-primary/[0.12] group-hover:bg-primary/15 dark:group-hover:bg-primary/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                          {iconUrl ? (
                            iconUrl.startsWith('http') || iconUrl.startsWith('/') ? (
                              <Image
                                src={iconUrl}
                                alt={locale === 'ar' ? category.NameAr : category.NameEn}
                                width={32}
                                height={32}
                                className="h-8 w-8 lg:h-9 lg:w-9 object-contain"
                              />
                            ) : (
                              <span className="text-2xl lg:text-3xl">{iconUrl}</span>
                            )
                          ) : (
                            <span className="font-serif text-xl lg:text-2xl font-bold text-primary">
                              {math.symbol}
                            </span>
                          )}
                        </div>

                        <div className="w-full">
                          <h3 className="font-semibold group-hover:text-primary transition-colors duration-300 text-sm lg:text-base">
                            {locale === 'ar' ? category.NameAr : category.NameEn}
                          </h3>
                        </div>

                        <span
                          className="font-mono text-[10px] lg:text-xs text-primary/0 group-hover:text-primary/40 transition-all duration-500 -mt-1"
                          dir="ltr"
                        >
                          {math.equation}
                        </span>

                        {/* ✅ NEW: Explore Button - Like Stages Page */}
                        <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-primary mt-2 pt-2 border-t border-border/50 w-full">
                          <span>{t('common.explore')}</span>
                          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        {/* ✅ Other Stages Section - Enhanced UX */}
        {otherStages.length > 0 && (
          <div className={`mt-20 pt-12 border-t border-border/50 ${
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`} style={{ transitionDelay: '200ms' }}>
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                {t('stages.exploreOtherLevels')}
              </h2>
              <p className="text-muted-foreground">
                {t('stages.exploreOtherLevelsDesc')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
              {otherStages.map((stage, index) => {
                const colors = stageCardColors[index % stageCardColors.length];
                const stageName = locale === 'ar' ? stage.NameAr : stage.NameEn;
                
                return (
                  <Link
                    key={stage.Id}
                    href={`/stages/${stage.Id}`}
                    className="group relative overflow-hidden rounded-xl border bg-card/60 dark:bg-card/30 backdrop-blur-sm p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/50"
                  >
                    {/* Top accent */}
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colors.from} ${colors.to}`} />

                    <div className="flex items-center gap-3">
                      {/* Icon */}
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${colors.bg} flex-shrink-0`}>
                        <span className="text-lg">{colors.icon}</span>
                      </div>

                      {/* Name */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                          {stageName}
                        </h3>
                      </div>

                      {/* Arrow */}
                      <ChevronRight className={`h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 ${
                        isRtl ? 'rotate-180' : ''
                      }`} />
                    </div>

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-primary/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}