'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { CircleCheckBig, Eye, FileText, Users, type LucideIcon } from 'lucide-react';
import { motion, useMotionValueEvent, useSpring } from 'framer-motion';

import { useGetStatsQuery } from '@/store/api/statsApi';
import { AccentHeadingText } from '@/components/ui/AccentHeadingText';

function PhysicsCounter({ value, locale }: { value: number; locale: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const spring = useSpring(0, { mass: 0.9, stiffness: 46, damping: 18 });
  const formatter = useMemo(() => new Intl.NumberFormat(locale), [locale]);

  useMotionValueEvent(spring, 'change', (latest) => {
    if (ref.current) {
      ref.current.textContent = formatter.format(Math.max(0, Math.floor(latest)));
    }
  });

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <span ref={ref}>{formatter.format(0)}</span>;
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

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.48, delay: index * 0.08 }}
      whileHover={{ y: -6, scale: 1.015 }}
      className={`impact-stat impact-stat-${stat.tone} group relative overflow-hidden rounded-[1.65rem] p-5 sm:p-6`}
    >
      <span className="impact-stat-symbol pointer-events-none absolute -end-1 -top-7 select-none" dir="ltr">
        {stat.mathSymbol}
      </span>

      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="impact-stat-icon flex h-11 w-11 items-center justify-center rounded-2xl">
          <stat.icon className="h-5 w-5" strokeWidth={2} />
        </div>
        <span className="impact-live-dot mt-2 h-2 w-2 rounded-full" aria-hidden="true" />
      </div>

      <div className="relative z-10 mt-8">
        <div className="impact-number text-3xl font-black tracking-tight sm:text-4xl lg:text-[2.7rem]" dir="ltr">
          {typeof stat.value === 'number' ? <PhysicsCounter value={stat.value} locale={locale} /> : '—'}
        </div>
        <p className="mt-2 text-sm font-bold text-white/70 sm:text-base">
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
  const { data, isFetching } = useGetStatsQuery();

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
      icon: CircleCheckBig,
      value: data?.TotalSolved,
      labelKey: 'stats.items.solutions',
      mathSymbol: '✓',
      tone: 'mixed',
    },
    {
      icon: Eye,
      value: data?.TotalViews,
      labelKey: 'stats.items.views',
      mathSymbol: '∞',
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

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {stats.map((stat, index) => (
                <StatCard key={stat.labelKey} stat={stat} index={index} locale={locale} />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
