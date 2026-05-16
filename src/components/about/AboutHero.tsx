'use client';

import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

const floatingSymbols = [
  { symbol: '∑', className: 'top-[10%] left-[5%]', size: 'text-5xl', delay: '0s', duration: '8s' },
  { symbol: 'π', className: 'top-[20%] right-[8%]', size: 'text-6xl', delay: '1s', duration: '9s' },
  { symbol: '∫', className: 'top-[60%] left-[3%]', size: 'text-5xl', delay: '2s', duration: '7s' },
  { symbol: '∞', className: 'bottom-[15%] right-[5%]', size: 'text-4xl', delay: '1.5s', duration: '8s' },
  { symbol: '√', className: 'top-[40%] right-[15%]', size: 'text-3xl', delay: '0.5s', duration: '6s' },
  { symbol: 'Δ', className: 'bottom-[25%] left-[10%]', size: 'text-4xl', delay: '2.5s', duration: '7s' },
];

export function AboutHero() {
  const t = useTranslations('about');
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className={`relative min-h-[70vh] overflow-hidden flex items-center justify-center ${mounted ? 'hero-loaded' : ''}`}>
      {/* Background Layers */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.08] via-primary/[0.03] to-background dark:from-primary/[0.12] dark:via-primary/[0.05] dark:to-background" />
      <div className="absolute inset-0 math-grid-bg opacity-40" />
      
      {/* Floating Math Symbols */}
      {floatingSymbols.map((sym, index) => (
        <div
          key={index}
          className={`absolute ${sym.className} ${sym.size} text-primary/[0.06] dark:text-primary/[0.1] font-serif pointer-events-none select-none hidden lg:block animate-float`}
          style={{
            animationDelay: sym.delay,
            animationDuration: sym.duration,
            willChange: 'transform',
          }}
        >
          {sym.symbol}
        </div>
      ))}

      {/* Glow Orbs */}
      <div className="absolute top-1/3 -left-24 w-72 h-72 bg-primary/10 dark:bg-primary/8 rounded-full blur-[100px] animate-pulse-glow" />
      <div className="absolute bottom-1/3 -right-24 w-64 h-64 bg-primary/8 dark:bg-primary/5 rounded-full blur-[80px] animate-pulse-glow" style={{ animationDelay: '2s' }} />

      {/* Content */}
      <div className="container mx-auto lg:px-24 md:px-16 px-4 relative z-10 pt-24 pb-16">
        <div className="text-center max-w-3xl mx-auto">
          {/* Badge */}
          <div className="hero-anim-down hero-delay-1 inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-medium text-primary mb-8">
            <Sparkles className="h-4 w-4" />
            <span>{t('hero.badge')}</span>
          </div>

          {/* Title */}
          <h1 className="hero-anim hero-delay-2 text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 text-gradient-math leading-tight">
            {t('hero.title')}
          </h1>

          {/* Subtitle */}
          <p className="hero-anim hero-delay-3 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t('hero.subtitle')}
          </p>

          {/* Decorative Line */}
          <div className="hero-anim hero-delay-4 mt-8 flex items-center justify-center gap-4">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary/30" />
            <div className="h-1.5 w-1.5 rounded-full bg-primary/40" />
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary/30" />
          </div>
        </div>
      </div>

      {/* Wave Separator */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden -mb-px">
        <svg className="w-full h-12 md:h-16 text-muted/20 dark:text-muted/10" viewBox="0 0 1440 60" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,30 C360,60 720,0 1080,30 C1260,45 1380,35 1440,30 L1440,60 L0,60 Z" fill="currentColor" />
        </svg>
      </div>
    </section>
  );
}