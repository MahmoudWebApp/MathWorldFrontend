// File: components/home/StatsSection.tsx
"use client";

import { useTranslations } from 'next-intl';
import { TrendingUp, Target, Clock, Award, Users, FileText, CircleCheckBig, Globe } from 'lucide-react';
import { useGetStatsQuery } from '@/store/api/statsApi';
import { useInView } from '@/lib/useInView';
import { AnimatedCounter } from './AnimatedCounter';

export function StatsSection() {
  const t = useTranslations();
  const { data: stats, isLoading } = useGetStatsQuery();
  const { ref: sectionRef, isInView } = useInView(0.05);

  const statsData = [
    { 
      icon: FileText, 
      value: stats?.TotalProblems || 0, 
      label: t('stats.totalProblems'), 
      suffix: "+",
      mathSymbol: "∫",
      mathBg: 'from-emerald-500/10 to-green-500/5 dark:from-emerald-500/15 dark:to-green-500/5'
    },
    { 
      icon: Users, 
      value: stats?.TotalUsers || 0, 
      label: t('stats.totalUsers'), 
      suffix: "+",
      mathSymbol: "∑",
      mathBg: 'from-blue-500/10 to-cyan-500/5 dark:from-blue-500/15 dark:to-cyan-500/5'
    },
    { 
      icon: CircleCheckBig, 
      value: stats?.TotalSolved || 0, 
      label: t('stats.totalSolved'), 
      suffix: "+",
      mathSymbol: "∞",
      mathBg: 'from-amber-500/10 to-yellow-500/5 dark:from-amber-500/15 dark:to-yellow-500/5'
    },
    { 
      icon: Globe, 
      value: stats?.TotalViews || 0, 
      label: t('stats.totalViews'), 
      suffix: "+",
      mathSymbol: "∂",
      mathBg: 'from-rose-500/10 to-pink-500/5 dark:from-rose-500/15 dark:to-pink-500/5'
    },
  ];

  const features = [
    {
      icon: Target,
      titleKey: 'stats.features.variety.title',
      descKey: 'stats.features.variety.description',
      mathSymbol: '∑',
      mathBg: 'from-blue-500/10 to-cyan-500/5 dark:from-blue-500/15 dark:to-cyan-500/5',
    },
    {
      icon: TrendingUp,
      titleKey: 'stats.features.progress.title',
      descKey: 'stats.features.progress.description',
      mathSymbol: "f'(x)",
      mathBg: 'from-emerald-500/10 to-green-500/5 dark:from-emerald-500/15 dark:to-green-500/5',
    },
    {
      icon: Clock,
      titleKey: 'stats.features.solutions.title',
      descKey: 'stats.features.solutions.description',
      mathSymbol: '∫dt',
      mathBg: 'from-amber-500/10 to-yellow-500/5 dark:from-amber-500/15 dark:to-yellow-500/5',
    },
    {
      icon: Award,
      titleKey: 'stats.features.points.title',
      descKey: 'stats.features.points.description',
      mathSymbol: '🏆',
      mathBg: 'from-violet-500/10 to-purple-500/5 dark:from-violet-500/15 dark:to-purple-500/5',
    },
  ];

  return (
    <section className="relative py-20 lg:py-28 bg-muted/30 overflow-hidden" ref={sectionRef}>
      <div className="absolute inset-0 math-grid-bg opacity-40" />
      <div className="absolute -top-20 left-1/4 w-80 h-80 bg-primary/[0.03] rounded-full blur-[100px]" />
      <div className="absolute -bottom-20 right-1/4 w-80 h-80 bg-primary/[0.03] rounded-full blur-[100px]" />

      <div className="container mx-auto lg:px-24 md:px-16 px-4 relative z-10">
        {/* Stats Numbers */}
        <div
          className={`grid grid-cols-2 sm:grid-cols-4 gap-5 max-w-4xl mx-auto mb-20 transition-all duration-700 ${
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {statsData.map((stat, index) => (
            <div
              key={index}
              className="group relative h-full rounded-2xl border bg-card/80 dark:bg-card/40 backdrop-blur-sm overflow-hidden hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-500"
            >
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.mathBg.replace('/10', '/60').replace('/5', '/30').replace('/15', '/60')}`} />
              <span className="absolute -bottom-4 -end-4 text-8xl font-serif text-primary/[0.04] dark:text-primary/[0.06] group-hover:text-primary/[0.08] transition-colors duration-500 select-none pointer-events-none" dir="ltr">
                {stat.mathSymbol}
              </span>
              <div className="relative p-5 text-center">
                <div className={`flex h-11 w-11 mx-auto items-center justify-center rounded-xl bg-gradient-to-br ${stat.mathBg} mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-gradient-math mb-2">
                  {isLoading ? (
                    <span className="text-muted-foreground">...</span>
                  ) : (
                    <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                  )}
                </div>
                <div className="text-sm font-semibold text-muted-foreground group-hover:text-primary transition-colors duration-300">
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Why MathWorld Section */}
        <div className={`text-center mb-14 transition-all duration-700 ${
          isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="h-1 w-8 rounded-full bg-primary" />
            <span className="text-sm font-medium text-primary uppercase tracking-wider">
              {t('stats.whyMathWorld')}
            </span>
            <div className="h-1 w-8 rounded-full bg-primary" />
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">{t('stats.whyMathWorld')}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t('stats.description')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.titleKey}
              className={`transition-all duration-700 ${
                isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`}
              style={{ transitionDelay: isInView ? `${index * 120}ms` : '0ms' }}
            >
              <div className="group relative h-full rounded-2xl border bg-card/80 dark:bg-card/40 backdrop-blur-sm overflow-hidden hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-500">
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.mathBg.replace('/10', '/60').replace('/5', '/30').replace('/15', '/60')}`} />
                <span className="absolute -bottom-4 -end-4 text-8xl font-serif text-primary/[0.04] dark:text-primary/[0.06] group-hover:text-primary/[0.08] transition-colors duration-500 select-none pointer-events-none" dir="ltr">
                  {feature.mathSymbol}
                </span>
                <div className="relative p-6 lg:p-7">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.mathBg} mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2.5 group-hover:text-primary transition-colors duration-300">
                    {t(feature.titleKey)}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t(feature.descKey)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}