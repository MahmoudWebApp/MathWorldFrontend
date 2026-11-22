'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Shapes, BrainCircuit, FileText, Users, RefreshCw, type LucideIcon } from 'lucide-react';
import { motion, useMotionValueEvent, useReducedMotion, useSpring } from 'framer-motion';

import { useGetStatsQuery } from '@/store/api/statsApi';
import { AccentHeadingText } from '@/components/ui/AccentHeadingText';

function PhysicsCounter({ value, locale }: { value: number; locale: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduceMotion = useReducedMotion();
  const spring = useSpring(0, { mass: 0.9, stiffness: 46, damping: 18 });
  const formatter = useMemo(() => new Intl.NumberFormat(locale), [locale]);

  useMotionValueEvent(spring, 'change', (latest) => {
    if (ref.current) {
      ref.current.textContent = formatter.format(Math.max(0, Math.floor(latest)));
    }
  });

  useEffect(() => {
    if (reduceMotion) {
      // Screen readers and users with reduced-motion preferences should not
      // have to wait for an animated number to become accurate.
      if (ref.current) ref.current.textContent = formatter.format(value);
    } else {
      spring.set(value);
    }
  }, [spring, value, formatter, reduceMotion]);

  return <span ref={ref}>{formatter.format(reduceMotion ? value : 0)}</span>;
}

interface StatItem {
  icon: LucideIcon;
  value?: number;
  labelKey: string;
  mathSymbol: string;
  tone: string;
}

function StatCard({ stat, index, locale }: { stat: StatItem; index: number; locale: string }) {
  const t = useTranslations('about');
  const reduceMotion = useReducedMotion();

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.35, delay: index * 0.06 }}
      whileHover={reduceMotion ? undefined : { y: -3 }}
      className={`impact-stat impact-stat-${stat.tone} group relative min-w-0 overflow-hidden rounded-[1.35rem] p-4 sm:rounded-[1.65rem] sm:p-6`}
    >
      <span className="impact-stat-symbol pointer-events-none absolute -end-1 -top-7 select-none" dir="ltr">
        {stat.mathSymbol}
      </span>

      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="impact-stat-icon flex h-9 w-9 items-center justify-center rounded-xl sm:h-11 sm:w-11 sm:rounded-2xl">
          <stat.icon className="h-5 w-5" strokeWidth={2} />
        </div>
        <span className="impact-live-dot mt-2 h-2 w-2 rounded-full" aria-hidden="true" />
      </div>

      <div className="relative z-10 mt-5 sm:mt-8">
        <div className="impact-number text-2xl font-black tracking-tight sm:text-4xl lg:text-[2.7rem]" dir="ltr">
          {typeof stat.value === 'number' ? <PhysicsCounter value={stat.value} locale={locale} /> : '—'}
        </div>
        <p className="mt-2 break-words text-xs font-bold leading-5 text-white/80 sm:text-base">
          {t(stat.labelKey)}
        </p>
      </div>

      <div className="impact-stat-line absolute inset-x-5 bottom-0 h-px" />
    </motion.article>
  );
}

export function StatsSection() {
  const t = useTranslations('about');
  const locale = useLocale();
  const { data, isFetching, isLoading, isError, refetch } = useGetStatsQuery(undefined, {
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const stats: StatItem[] = [
    {
      icon: Users,
      value: data?.TotalUsers,
      labelKey: 'stats.items.users',
      mathSymbol: '∑',
      tone: 'primary',
    },
    {
      icon: FileText,
      value: data?.TotalProblems,
      labelKey: 'stats.items.problems',
      mathSymbol: 'x²',
      tone: 'secondary',
    },
    {
      icon: Shapes,
      value: data?.TotalCategories,
      labelKey: 'stats.items.categories',
      mathSymbol: '△',
      tone: 'mixed',
    },
    {
      icon: BrainCircuit,
      value: data?.TotalSkills,
      labelKey: 'stats.items.skills',
      mathSymbol: '∑',
      tone: 'pink',
    },
  ];

  return (
    <section className="home-impact-section relative overflow-hidden py-20 lg:py-28">
      <div className="container relative z-10 mx-auto px-4 md:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          className="impact-shell relative mx-auto max-w-7xl overflow-hidden rounded-[2.25rem] px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12"
          aria-busy={isFetching}
        >
          <div className="impact-grid pointer-events-none absolute inset-0" />
          <div className="impact-orb impact-orb-a" />
          <div className="impact-orb impact-orb-b" />

          <svg
            className="impact-wave pointer-events-none absolute inset-x-0 bottom-0 h-[58%] w-full"
            viewBox="0 0 1400 500"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path className="impact-wave-one" d="M-80 310 C180 170 385 415 660 278 C900 158 1110 206 1480 120 L1480 540 L-80 540 Z" />
            <path className="impact-wave-two" d="M-80 390 C160 282 390 465 690 356 C1010 240 1210 370 1480 250 L1480 540 L-80 540 Z" />
          </svg>

          <div className="relative z-10 grid items-center gap-10 lg:grid-cols-[0.82fr_1.45fr] lg:gap-12">
            <div className="max-w-xl text-center lg:text-start">
              <div className="impact-kicker mb-5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-extrabold uppercase tracking-[0.14em] text-white/90">
                <span className={`h-2 w-2 rounded-full ${isFetching ? 'animate-pulse' : ''}`} />
                {t('stats.live')}
              </div>

              <h2 className="brand-display-title text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
                <AccentHeadingText text={t('stats.title')} accentClassName="impact-title-accent" />
              </h2>
              <p className="mx-auto mt-5 max-w-lg text-base leading-8 text-white/70 lg:mx-0 lg:text-lg">
                {t('stats.subtitle')}
              </p>

              <div className="impact-equation mt-8 inline-flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-white/80" dir="ltr">
                <span className="text-white/40">f(progress)</span>
                <span>=</span>
                <span className="text-white">practice × consistency</span>
              </div>
            </div>

            <div aria-live="polite" className="min-w-0">
              {isError ? (
                <div role="alert" className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-2xl border border-white/25 bg-white/10 p-5 text-center text-white">
                  <p className="text-sm font-semibold sm:text-base">
                    {locale === 'ar'
                      ? 'تعذّر تحميل إحصائيات المنصة حالياً. جرّب مرة ثانية.'
                      : 'Platform statistics are temporarily unavailable. Please retry.'}
                  </p>
                  <button type="button" onClick={() => void refetch()}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/15 px-4 py-2 text-sm font-bold transition hover:bg-white/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                    <RefreshCw aria-hidden="true" className="h-4 w-4" />
                    {locale === 'ar' ? 'إعادة المحاولة' : 'Try again'}
                  </button>
                </div>
              ) : isLoading ? (
                <div role="status" aria-label={locale === 'ar' ? 'جارٍ تحميل الإحصائيات' : 'Loading statistics'}
                  className="grid grid-cols-1 gap-3 min-[355px]:grid-cols-2 sm:gap-4">
                  {[0, 1, 2, 3].map(index =>
                    <div key={index} className="h-40 animate-pulse rounded-2xl border border-white/15 bg-white/10 sm:h-48" />)}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 min-[355px]:grid-cols-2 sm:gap-4">
                  {stats.map((stat, index) => (
                    <StatCard key={stat.labelKey} stat={stat} index={index} locale={locale} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
