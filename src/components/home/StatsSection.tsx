"use client";

import { useTranslations } from 'next-intl';
import { TrendingUp, Target, Clock, Award } from 'lucide-react';
import { useInView } from '@/lib/useInView';

interface Feature {
  icon: React.ElementType;
  titleKey: string;
  descKey: string;
  mathSymbol: string;
  mathBg: string;
}

const features: Feature[] = [
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

export function StatsSection() {
  const t = useTranslations();
  const { ref: sectionRef, isInView } = useInView(0.05);

  return (
    <section className="relative py-20 lg:py-28 bg-muted/30 overflow-hidden" ref={sectionRef}>
      {/* Background decorations */}
      <div className="absolute inset-0 math-grid-bg opacity-40" />
      <div className="absolute -top-20 left-1/4 w-80 h-80 bg-primary/[0.03] rounded-full blur-[100px]" />
      <div className="absolute -bottom-20 right-1/4 w-80 h-80 bg-primary/[0.03] rounded-full blur-[100px]" />

      {/* Floating math symbols decoration */}
      <div className="absolute top-16 left-12 text-6xl font-serif text-primary/[0.04] dark:text-primary/[0.06] animate-float hidden lg:block select-none pointer-events-none">
        √
      </div>
      <div className="absolute bottom-16 right-16 text-5xl font-serif text-primary/[0.04] dark:text-primary/[0.06] animate-float-reverse hidden lg:block select-none pointer-events-none">
        ≈
      </div>
      <div className="absolute top-1/2 right-8 text-4xl font-serif text-primary/[0.04] dark:text-primary/[0.06] animate-float hidden lg:block select-none pointer-events-none" style={{ animationDelay: '2s' }}>
        ≠
      </div>

      <div className="container  mx-auto lg:px-24 md:px-16 px-4 relative z-10">
        {/* Section Header */}
        <div
          className={`text-center mb-14 transition-all duration-700 ${
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
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

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.titleKey}
              className={`transition-all duration-700 ${
                isInView
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-12'
              }`}
              style={{ transitionDelay: isInView ? `${index * 120}ms` : '0ms' }}
            >
              <div className="group relative h-full rounded-2xl border bg-card/80 dark:bg-card/40 backdrop-blur-sm overflow-hidden hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-500">
                {/* Top gradient accent */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.mathBg.replace('/10', '/60').replace('/5', '/30').replace('/15', '/60')}`} />

                {/* Background math symbol */}
                <span className="absolute -bottom-4 -end-4 text-8xl font-serif text-primary/[0.04] dark:text-primary/[0.06] group-hover:text-primary/[0.08] dark:group-hover:text-primary/[0.1] transition-colors duration-500 select-none pointer-events-none" dir="ltr">
                  {feature.mathSymbol}
                </span>

                <div className="relative p-6 lg:p-7">
                  {/* Icon */}
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.mathBg} mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>

                  {/* Content */}
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