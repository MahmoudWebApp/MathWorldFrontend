'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/Button';
import { ArrowRight, BookOpen, Sparkles } from 'lucide-react';
import { useInView } from '@/lib/useInView';

export function CTASection() {
  const t = useTranslations('about');
  const { ref: sectionRef, isInView } = useInView(0.1);

  return (
    <section className="relative py-20 lg:py-28 overflow-hidden" ref={sectionRef}>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.03] to-primary/[0.05] dark:via-primary/[0.05] dark:to-primary/[0.08]" />
      
      {/* Background Decorations */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/[0.03] rounded-full blur-[120px]" />
      
      <div className="container mx-auto lg:px-24 md:px-16 px-4 relative z-10">
        <div className={`max-w-3xl mx-auto text-center transition-all duration-1000 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 dark:bg-primary/15 text-primary animate-pulse-glow">
              <Sparkles className="h-8 w-8" />
            </div>
          </div>

          <h2 className="text-3xl lg:text-4xl font-bold mb-4">{t('cta.title')}</h2>
          <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
            {t('cta.subtitle')}
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              className="gap-2 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              asChild
            >
              <Link href="/stages">
                <BookOpen className="h-5 w-5" />
                {t('cta.primaryButton')}
              </Link>
            
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              className="gap-2 rounded-xl glass hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              asChild
            >
              <Link href="/register">
                {t('cta.secondaryButton')}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
            </Button>
          </div>

          {/* Decorative Math */}
          <div className="mt-12 font-serif text-2xl text-primary/[0.08] dark:text-primary/[0.12] select-none" dir="ltr">
            ∫∫∫ f(x,y,z) dV = ?
          </div>
        </div>
      </div>
    </section>
  );
}