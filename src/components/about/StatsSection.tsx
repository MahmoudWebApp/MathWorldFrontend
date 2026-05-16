'use client';

import { useTranslations } from 'next-intl';
import { Users, FileText, CircleCheckBig, Globe } from 'lucide-react';
import { AnimatedCounter } from '@/components/home/AnimatedCounter';
import { useInView } from '@/lib/useInView';
import { useEffect, useState } from 'react';

interface Stat {
  icon: React.ElementType;
  value: number;
  suffix: string;
  labelKey: string;
  mathSymbol: string;
  mathBg: string;
}

const stats: Stat[] = [
  {
    icon: Users,
    value: 10000,
    suffix: '+',
    labelKey: 'stats.items.users',
    mathSymbol: '∑',
    mathBg: 'from-blue-500/10 to-cyan-500/5 dark:from-blue-500/15 dark:to-cyan-500/5',
  },
  {
    icon: FileText,
    value: 5000,
    suffix: '+',
    labelKey: 'stats.items.problems',
    mathSymbol: '∫',
    mathBg: 'from-emerald-500/10 to-green-500/5 dark:from-emerald-500/15 dark:to-green-500/5',
  },
  {
    icon: CircleCheckBig,
    value: 50000,
    suffix: '+',
    labelKey: 'stats.items.solutions',
    mathSymbol: '∞',
    mathBg: 'from-amber-500/10 to-yellow-500/5 dark:from-amber-500/15 dark:to-yellow-500/5',
  },
  {
    icon: Globe,
    value: 45,
    suffix: '+',
    labelKey: 'stats.items.countries',
    mathSymbol: '∂',
    mathBg: 'from-rose-500/10 to-pink-500/5 dark:from-rose-500/15 dark:to-pink-500/5',
  },
];

export function StatsSection() {
  const t = useTranslations('about');
  const { ref: sectionRef, isInView } = useInView(0.1);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative py-20 lg:py-28 bg-muted/30 overflow-hidden" ref={sectionRef}>
      {/* Background decorations */}
      <div className="absolute inset-0 math-grid-bg opacity-40" />
      <div className="absolute -top-20 left-1/4 w-80 h-80 bg-primary/[0.03] rounded-full blur-[100px]" />
      <div className="absolute -bottom-20 right-1/4 w-80 h-80 bg-primary/[0.03] rounded-full blur-[100px]" />

      {/* Floating math symbols decoration */}
      <div className="absolute top-16 left-12 text-6xl font-serif text-primary/[0.04] dark:text-primary/[0.06] animate-float hidden lg:block select-none pointer-events-none">
        π
      </div>
      <div className="absolute bottom-16 right-16 text-5xl font-serif text-primary/[0.04] dark:text-primary/[0.06] animate-float-reverse hidden lg:block select-none pointer-events-none">
        Δ
      </div>
      <div className="absolute top-1/2 right-8 text-4xl font-serif text-primary/[0.04] dark:text-primary/[0.06] animate-float hidden lg:block select-none pointer-events-none" style={{ animationDelay: '2s' }}>
        θ
      </div>

      <div className="container mx-auto lg:px-24 md:px-16 px-4 relative z-10">
        {/* Section Header */}
        <div
          className={`text-center mb-14 transition-all duration-700 ${
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="h-1 w-8 rounded-full bg-primary" />
            <span className="text-sm font-medium text-primary uppercase tracking-wider">
              {t('stats.subtitle')}
            </span>
            <div className="h-1 w-8 rounded-full bg-primary" />
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">{t('stats.title')}</h2>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
          {stats.map((stat, index) => (
            <div
              key={stat.labelKey}
              className={`transition-all duration-700 ${
                isInView
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-12'
              }`}
              style={{ transitionDelay: isInView ? `${index * 120}ms` : '0ms' }}
            >
              <div className="group relative h-full rounded-2xl border bg-card/80 dark:bg-card/40 backdrop-blur-sm overflow-hidden hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-500">
                {/* Top gradient accent */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.mathBg.replace('/10', '/60').replace('/5', '/30').replace('/15', '/60')}`} />

                {/* Background math symbol */}
                <span className="absolute -bottom-4 -end-4 text-8xl font-serif text-primary/[0.04] dark:text-primary/[0.06] group-hover:text-primary/[0.08] dark:group-hover:text-primary/[0.1] transition-colors duration-500 select-none pointer-events-none" dir="ltr">
                  {stat.mathSymbol}
                </span>

                <div className="relative p-6 lg:p-7 text-center">
                  {/* Icon */}
                  <div className={`flex h-12 w-12 mx-auto items-center justify-center rounded-xl bg-gradient-to-br ${stat.mathBg} mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>

                  {/* Counter Value */}
                  <div className="text-3xl lg:text-4xl font-bold text-gradient-math mb-3">
                    {mounted ? (
                      <AnimatedCounter end={stat.value} suffix={stat.suffix} duration={2500} />
                    ) : (
                      `${stat.value.toLocaleString()}${stat.suffix}`
                    )}
                  </div>

                  {/* Label */}
                  <h3 className="text-base font-semibold text-muted-foreground group-hover:text-primary transition-colors duration-300">
                    {t(stat.labelKey as any)}
                  </h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}