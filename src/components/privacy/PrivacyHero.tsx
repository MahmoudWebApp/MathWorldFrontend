'use client';

import { useTranslations } from 'next-intl';
import { Shield, Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';

const floatingSymbols = [
  { symbol: '🔒', className: 'top-[15%] left-[8%]', size: 'text-4xl', delay: '0s', duration: '7s' },
  { symbol: '🛡️', className: 'top-[25%] right-[10%]', size: 'text-3xl', delay: '1s', duration: '8s' },
  { symbol: '🔐', className: 'bottom-[20%] left-[5%]', size: 'text-3xl', delay: '2s', duration: '6s' },
];

export function PrivacyHero() {
  const t = useTranslations('privacy');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className={`relative min-h-[50vh] overflow-hidden flex items-center justify-center ${mounted ? 'hero-loaded' : ''}`}>
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.06] via-primary/[0.02] to-background dark:from-primary/[0.1] dark:via-primary/[0.04] dark:to-background" />
      <div className="absolute inset-0 math-grid-bg opacity-30" />
      
      {/* Floating Symbols */}
      {floatingSymbols.map((sym, index) => (
        <div
          key={index}
          className={`absolute ${sym.className} ${sym.size} opacity-20 pointer-events-none select-none hidden lg:block animate-float`}
          style={{
            animationDelay: sym.delay,
            animationDuration: sym.duration,
          }}
        >
          {sym.symbol}
        </div>
      ))}

      {/* Glow */}
      <div className="absolute top-1/3 -left-20 w-60 h-60 bg-primary/8 rounded-full blur-[80px]" />
      <div className="absolute bottom-1/4 -right-20 w-48 h-48 bg-primary/5 rounded-full blur-[60px]" />

      {/* Content */}
      <div className="container mx-auto lg:px-24 md:px-16 px-4 relative z-10 pt-24 pb-16">
        <div className="text-center max-w-3xl mx-auto">
          <div className="hero-anim-down hero-delay-1 inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-medium text-primary mb-6">
            <Shield className="h-4 w-4" />
            <span>{t('hero.badge')}</span>
          </div>

          <h1 className="brand-display-title hero-anim hero-delay-2 text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 text-gradient-math">
            {t('hero.title')}
          </h1>

          <p className="hero-anim hero-delay-3 text-lg text-muted-foreground max-w-xl mx-auto mb-6">
            {t('hero.subtitle')}
          </p>

          <div className="hero-anim hero-delay-4 inline-flex items-center gap-2 text-sm text-muted-foreground/70">
            <Calendar className="h-4 w-4" />
            <span>{t('hero.lastUpdated')}</span>
          </div>
        </div>
      </div>

      {/* Wave */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden -mb-px">
        <svg className="w-full h-10 md:h-14 text-muted/20 dark:text-muted/10" viewBox="0 0 1440 50" preserveAspectRatio="none">
          <path d="M0,25 C360,50 720,0 1080,25 C1260,37 1380,30 1440,25 L1440,50 L0,50 Z" fill="currentColor" />
        </svg>
      </div>
    </section>
  );
}