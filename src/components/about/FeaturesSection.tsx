'use client';

import { useTranslations } from 'next-intl';
import { Brain, BookOpen, Trophy, Languages } from 'lucide-react';
import { useInView } from '@/lib/useInView';
import { Card, CardContent } from '@/components/ui/Card';

const icons = [Brain, BookOpen, Trophy, Languages];
const gradients = [
  'from-brand-primary/14 to-brand-secondary/7 dark:from-brand-primary/18 dark:to-brand-secondary/9',
  'from-brand-secondary/14 to-brand-primary/7 dark:from-brand-secondary/18 dark:to-brand-primary/9',
  'from-brand-primary-strong/14 to-brand-primary-light/7 dark:from-brand-primary/18 dark:to-brand-primary-light/9',
  'from-brand-secondary-strong/14 to-brand-secondary-light/7 dark:from-brand-secondary/18 dark:to-brand-secondary-light/9',
];

export function FeaturesSection() {
  const t = useTranslations('about');

  const { ref: sectionRef, isInView } = useInView(0.1);

  const features = t.raw('features.items') as Array<{ title: string; description: string }>;

  return (
    <section className="math-section-bg relative overflow-hidden py-20 lg:py-28" ref={sectionRef}>
      <div className="absolute top-10 right-10 w-48 h-48 bg-primary/[0.03] rounded-full blur-[60px]" />
      <div className="absolute bottom-10 left-10 w-64 h-64 bg-primary/[0.02] rounded-full blur-[80px]" />

      <div className="container mx-auto lg:px-24 md:px-16 px-4 relative z-10">
        {/* Section Header */}
        <div className={`text-center mb-16 transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-1 w-8 rounded-full bg-primary" />
            <span className="text-sm font-medium text-primary uppercase tracking-wider">
              {t('features.title')}
            </span>
            <div className="h-1 w-8 rounded-full bg-primary" />
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">{t('features.title')}</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">{t('features.subtitle')}</p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {features.map((feature, index) => {
            const Icon = icons[index];
            return (
              <div
                key={index}
                className={`transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                style={{ transitionDelay: isInView ? `${index * 150}ms` : '0ms' }}
              >
                <Card className="brand-surface math-card relative h-full overflow-hidden border-0 shadow-sm transition-all duration-500 group hover:-translate-y-1 hover:shadow-xl">
                  <div className={`absolute inset-0 bg-gradient-to-br ${gradients[index]} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  
                  <CardContent className="relative p-6 lg:p-8 flex items-start gap-5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/[0.08] dark:bg-primary/[0.12] group-hover:bg-primary/15 dark:group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-500">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors duration-300">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
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