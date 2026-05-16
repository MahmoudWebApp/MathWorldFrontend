'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Target, Eye, CheckCircle2 } from 'lucide-react';
import { useInView } from '@/lib/useInView';
import { Card, CardContent } from '@/components/ui/Card';

export function MissionSection() {
  const t = useTranslations('about');
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const { ref: sectionRef, isInView } = useInView(0.1);

  const missionPoints = t.raw('mission.points') as string[];

  return (
    <section className="relative py-20 lg:py-28 overflow-hidden" ref={sectionRef}>
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/[0.02] rounded-full blur-[100px]" />
      
      <div className="container mx-auto lg:px-24 md:px-16 px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Mission Card */}
          <div className={`transition-all duration-1000 ${isInView ? 'opacity-100 translate-x-0' : isRtl ? 'opacity-0 translate-x-12' : 'opacity-0 -translate-x-12'}`}>
            <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-500 bg-gradient-to-br from-card to-card/50">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
              <CardContent className="relative p-8 lg:p-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 dark:bg-primary/15 text-primary">
                    <Target className="h-6 w-6" />
                  </div>
                  <h2 className="text-2xl lg:text-3xl font-bold">{t('mission.title')}</h2>
                </div>
                
                <p className="text-muted-foreground leading-relaxed mb-8 text-lg">
                  {t('mission.description')}
                </p>

                <ul className="space-y-4">
                  {missionPoints.map((point, index) => (
                    <li key={index} className="flex items-start gap-3 group">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0 group-hover:scale-110 transition-transform" />
                      <span className="text-foreground/80 group-hover:text-foreground transition-colors">{point}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Vision Card */}
          <div className={`transition-all duration-1000 delay-200 ${isInView ? 'opacity-100 translate-x-0' : isRtl ? 'opacity-0 -translate-x-12' : 'opacity-0 translate-x-12'}`}>
            <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-500 bg-gradient-to-br from-card to-card/50 h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
              <CardContent className="relative p-8 lg:p-10 flex flex-col justify-center h-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 dark:bg-primary/15 text-primary">
                    <Eye className="h-6 w-6" />
                  </div>
                  <h2 className="text-2xl lg:text-3xl font-bold">{t('vision.title')}</h2>
                </div>
                
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {t('vision.description')}
                </p>

                {/* Decorative Element */}
                <div className="mt-8 p-4 rounded-xl bg-primary/[0.03] dark:bg-primary/[0.05] border border-primary/10">
                  <div className="font-serif text-2xl text-primary/30 dark:text-primary/20 text-center" dir="ltr">
                    lim(x→∞) f(x) = ∞
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}