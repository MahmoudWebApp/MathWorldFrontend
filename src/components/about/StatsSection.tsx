'use client';

import { useTranslations } from 'next-intl';
import { CircleCheckBig, FileText, Globe, Users, type LucideIcon } from 'lucide-react';

import { motion, useSpring, AnimatePresence, useMotionValueEvent } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

// Refactored AnimatedCounter using Framer Motion physics & direct DOM mutation (High Performance)
function PhysicsCounter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const spring = useSpring(0, { mass: 1, stiffness: 40, damping: 15 });

  // Update the DOM node directly on every frame without React re-renders!
  useMotionValueEvent(spring, "change", (latest) => {
    if (ref.current) {
      ref.current.textContent = Math.floor(latest).toLocaleString();
    }
  });

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return (
    <motion.span>
      <span ref={ref}>0</span>
      {suffix}
    </motion.span>
  );
}

interface StatItem {
  icon: LucideIcon;
  value: number;
  suffix: string;
  mathEasterEgg: string;
  labelKey: string;
  mathSymbol: string;
  mathBg: string;
}

// Math Easter Egg Component (Swaps standard number with Math representation on hover)
function StatCard({ stat, index }: { stat: StatItem; index: number }) {
  const t = useTranslations('about');
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative h-full rounded-2xl border bg-card/80 dark:bg-card/40 backdrop-blur-sm overflow-hidden transition-all duration-500 cursor-default"
    >
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.mathBg}`} />
      
      {/* Background math symbol rotates on hover */}
      <motion.span 
        animate={{ rotate: isHovered ? 15 : 0, scale: isHovered ? 1.1 : 1 }}
        className="absolute -bottom-4 -end-4 text-8xl font-serif text-primary/[0.04] dark:text-primary/[0.06] select-none pointer-events-none origin-bottom-right" 
        dir="ltr"
      >
        {stat.mathSymbol}
      </motion.span>

      <div className="relative p-6 lg:p-7 text-center">
        <motion.div 
          animate={{ y: isHovered ? -5 : 0 }}
          className={`flex h-12 w-12 mx-auto items-center justify-center rounded-xl bg-gradient-to-br ${stat.mathBg} mb-5`}
        >
          <stat.icon className="h-6 w-6 text-primary" />
        </motion.div>

        <div className="h-12 flex items-center justify-center text-3xl lg:text-4xl font-bold text-gradient-math mb-2">
          <AnimatePresence mode="wait">
            {!isHovered ? (
              <motion.div
                key="normal"
                initial={{ opacity: 0, rotateX: 90 }}
                animate={{ opacity: 1, rotateX: 0 }}
                exit={{ opacity: 0, rotateX: -90 }}
                transition={{ duration: 0.2 }}
              >
                <PhysicsCounter value={stat.value} suffix={stat.suffix} />
              </motion.div>
            ) : (
              <motion.div
                key="math"
                initial={{ opacity: 0, rotateX: 90 }}
                animate={{ opacity: 1, rotateX: 0 }}
                exit={{ opacity: 0, rotateX: -90 }}
                transition={{ duration: 0.2 }}
                className="font-mono text-2xl tracking-widest text-primary"
                dir="ltr"
              >
                {/* Math Easter Egg Representation */}
                {stat.mathEasterEgg}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <h3 className="text-base font-semibold text-muted-foreground group-hover:text-primary transition-colors duration-300">
          {t(stat.labelKey)}
        </h3>
      </div>
    </motion.div>
  );
}

export function StatsSection() {
  const t = useTranslations('about');
  
  const stats = [
    {
      icon: Users,
      value: 10000,
      suffix: '+',
      mathEasterEgg: '10⁴',
      labelKey: 'stats.items.users',
      mathSymbol: '∑',
      mathBg: 'from-blue-500/20 to-cyan-500/10',
    },
    {
      icon: FileText,
      value: 5000,
      suffix: '+',
      mathEasterEgg: '5 × 10³',
      labelKey: 'stats.items.problems',
      mathSymbol: '∫',
      mathBg: 'from-emerald-500/20 to-green-500/10',
    },
    {
      icon: CircleCheckBig,
      value: 50000,
      suffix: '+',
      mathEasterEgg: '50k',
      labelKey: 'stats.items.solutions',
      mathSymbol: '∞',
      mathBg: 'from-amber-500/20 to-yellow-500/10',
    },
    {
      icon: Globe,
      value: 45,
      suffix: '+',
      mathEasterEgg: '≈ √2025',
      labelKey: 'stats.items.countries',
      mathSymbol: '∂',
      mathBg: 'from-rose-500/20 to-pink-500/10',
    },
  ];

  return (
    <section className="relative py-20 lg:py-28 bg-muted/30 overflow-hidden">
      <div className="absolute inset-0 math-grid-bg opacity-40 -z-10" />
      
      <div className="container mx-auto lg:px-24 md:px-16 px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="h-1 w-8 rounded-full bg-primary" />
            <span className="text-sm font-medium text-primary uppercase tracking-wider">
              {t('stats.subtitle')}
            </span>
            <div className="h-1 w-8 rounded-full bg-primary" />
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">{t('stats.title')}</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
          {stats.map((stat, index) => (
            <StatCard key={stat.labelKey} stat={stat} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}