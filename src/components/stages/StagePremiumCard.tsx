'use client';

import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion';

import type { Stage } from '@/store/api/stagesApi';
import { getStageVisual } from '@/lib/stageVisuals';
import { StageIconBadge } from '@/components/stages/StageIconBadge';

interface StagePremiumCardProps {
  stage: Stage;
  index: number;
  locale: string;
}

export function StagePremiumCard({
  stage,
  index,
  locale,
}: StagePremiumCardProps) {
  const t = useTranslations();
  const isRtl = locale === 'ar';
  const visual = getStageVisual(stage);
  const colors = visual.style;

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXPixel = useMotionValue(0);
  const mouseYPixel = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['7deg', '-7deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [
    isRtl ? '7deg' : '-7deg',
    isRtl ? '-7deg' : '7deg',
  ]);

  const spotlightBackground = useMotionTemplate`
    radial-gradient(420px circle at ${mouseXPixel}px ${mouseYPixel}px, ${colors.spotlight}, transparent 72%)
  `;

  const handleMouseMove = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    mouseXPixel.set(mouseX);
    mouseYPixel.set(mouseY);
    x.set(mouseX / rect.width - 0.5);
    y.set(mouseY / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 42, scale: 0.94 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.58, delay: index * 0.08, type: 'spring', bounce: 0.26 }}
      style={{ perspective: 1200 }}
      className="h-full"
    >
      <motion.a
        href={`/stages/${stage.Id}`}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className={`stage-premium-card ${visual.toneClass} group relative block h-full overflow-hidden rounded-[2rem] p-6 md:p-8`}
      >
        <motion.div
          className="absolute inset-0 z-[2] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: spotlightBackground }}
        />

        <div className="stage-card-dots pointer-events-none absolute inset-0 z-[1]" />

        <svg
          className="stage-card-wave-svg pointer-events-none absolute inset-0 z-0 h-full w-full"
          viewBox="0 0 500 560"
          fill="none"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            className="stage-wave-soft"
            d="M-40 350 C70 270 138 315 214 360 C304 412 350 248 545 288 L545 590 L-40 590 Z"
          />
          <path
            className="stage-wave-primary"
            d="M-45 410 C66 327 150 386 238 424 C344 469 394 342 545 352 L545 590 L-45 590 Z"
          />
          <path
            className="stage-wave-secondary"
            d="M-55 466 C74 398 164 452 262 482 C359 513 429 432 550 430 L550 590 L-55 590 Z"
          />
          <path
            className="stage-wave-line"
            d="M-10 355 C90 275 150 320 220 360 C315 414 365 252 515 292"
          />
        </svg>

        <span className="stage-card-index pointer-events-none absolute end-6 top-5 z-[3] select-none" dir="ltr">
          {String(stage.Order > 0 ? stage.Order : visual.ordinal).padStart(2, '0')}
        </span>

        <div className="relative z-10 flex h-full min-h-[360px] flex-col" style={{ transformStyle: 'preserve-3d' }}>
          <motion.div
            style={{ translateZ: 58 }}
            className="mb-7 w-fit transition-transform duration-500 group-hover:-rotate-3 group-hover:scale-110"
          >
            <StageIconBadge stage={stage} size="lg" className="stage-card-icon" />
          </motion.div>

          <motion.h3
            style={{ translateZ: 38 }}
            className={`mb-3 text-2xl font-extrabold leading-tight text-foreground transition-colors duration-300 ${colors.hoverText}`}
          >
            {locale === 'ar' ? stage.NameAr : stage.NameEn}
          </motion.h3>

          <motion.p
            style={{ translateZ: 24 }}
            className="max-w-[18rem] text-sm leading-7 text-muted-foreground"
          >
            {t(`stages.stageDescriptions.${index}`, { defaultValue: '' })}
          </motion.p>

          <motion.div
            style={{ translateZ: 48 }}
            className="mt-auto flex items-center justify-between pt-10"
          >
            <span className={`text-sm font-extrabold uppercase tracking-[0.12em] ${colors.iconColor}`}>
              {t('common.explore')}
            </span>
            <div className="stage-card-arrow flex h-11 w-11 items-center justify-center rounded-full">
              <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
            </div>
          </motion.div>
        </div>
      </motion.a>
    </motion.div>
  );
}
