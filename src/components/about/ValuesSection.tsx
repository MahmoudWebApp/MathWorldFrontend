'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Award, Globe, Lightbulb, Users } from 'lucide-react';
import { useInView } from '@/lib/useInView';
import { Card, CardContent } from '@/components/ui/Card';

const icons = [Award, Globe, Lightbulb, Users];

const colorClasses = [
  'from-blue-500/10 to-indigo-500/5 dark:from-blue-500/15 dark:to-indigo-500/5',
  'from-emerald-500/10 to-teal-500/5 dark:from-emerald-500/15 dark:to-teal-500/5',
  'from-amber-500/10 to-orange-500/5 dark:from-amber-500/15 dark:to-orange-500/5',
  'from-rose-500/10 to-pink-500/5 dark:from-rose-500/15 dark:to-pink-500/5',
];

export function ValuesSection() {
  const t = useTranslations('about');
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const { ref: sectionRef, isInView } = useInView(0.1);

  const values = t.raw('values.items') as Array<{ title: string; description: string }>;

  return (
    <section className="relative py-20 lg:py-28 bg-muted/30 overflow-hidden" ref={sectionRef}>
      <div className="absolute bottom-0 left-10 w-64 h-64 bg-primary/[0.02] rounded-full blur-[80px]" />
      
      <div className="container mx-auto lg:px-24 md:px-16 px-4 relative z-10">
        {/* Section Header */}
        <div className={`text-center mb-16 transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-1 w-8 rounded-full bg-primary" />
            <span className="text-sm font-medium text-primary uppercase tracking-wider">
              {t('values.title')}
            </span>
            <div className="h-1 w-8 rounded-full bg-primary" />
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold">{t('values.title')}</h2>
        </div>

        {/* Values Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => {
            const Icon = icons[index];
            return (
              <div
                key={index}
                className={`transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                style={{ transitionDelay: isInView ? `${index * 100}ms` : '0ms' }}
              >
                <Card className="relative overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-500 h-full group hover:-translate-y-1">
                  <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses[index]} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  
                  <CardContent className="relative p-6 lg:p-8 flex flex-col items-center text-center h-full">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/[0.08] dark:bg-primary/[0.12] group-hover:bg-primary/15 dark:group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-500 mb-5">
                      <Icon className="h-7 w-7 text-primary" />
                    </div>
                    
                    <h3 className="font-semibold text-lg mb-3 group-hover:text-primary transition-colors duration-300">
                      {value.title}
                    </h3>
                    
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}