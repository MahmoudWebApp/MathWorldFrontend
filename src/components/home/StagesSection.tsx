'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useGetStagesQuery, type Stage } from '@/store/api/stagesApi';
import {
  ArrowRight,
  Calculator,
  Compass,
  FunctionSquare,
  Infinity as InfinityIcon,
  Loader2,
  type LucideIcon,
} from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from 'framer-motion';

interface StageCardStyle {
  from: string;
  to: string;
  bg: string;
  iconColor: string;
  hoverText: string;
  hoverBg: string;
  hoverShadow: string;
  spotlight: string;
}

interface StagePremiumCardProps {
  stage: Stage;
  index: number;
  colors: StageCardStyle;
  icon: LucideIcon;
  locale: string;
}

function StagePremiumCard({ stage, index, colors, icon: Icon, locale }: StagePremiumCardProps) {
  const t = useTranslations();
  const isRtl = locale === 'ar';
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXPixel = useMotionValue(0);
  const mouseYPixel = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [isRtl ? "10deg" : "-10deg", isRtl ? "-10deg" : "10deg"]);

  const spotlightBackground = useMotionTemplate`
    radial-gradient(350px circle at ${mouseXPixel}px ${mouseYPixel}px, ${colors.spotlight}, transparent 80%)
  `;

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    mouseXPixel.set(mouseX);
    mouseYPixel.set(mouseY);
    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.1, type: "spring", bounce: 0.4 }}
      style={{ perspective: 1200 }}
      className="h-full"
    >
      <motion.a
        href={`/stages/${stage.Id}`}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        // Dynamic card shadow matches the stage color
        className={`brand-surface group relative block h-full overflow-hidden rounded-3xl p-6 md:p-8 transition-shadow duration-500 hover:shadow-2xl ${colors.hoverShadow}`}
      >
        <motion.div
          className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: spotlightBackground }}
        />

        <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${colors.from} ${colors.to} opacity-80 group-hover:opacity-100 transition-opacity`} />
        
        <Icon className="absolute -bottom-6 -right-6 h-32 w-32 text-primary/[0.03] group-hover:text-primary/[0.06] transition-colors duration-500 -rotate-12 pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full" style={{ transformStyle: "preserve-3d" }}>
          
          <motion.div 
            style={{ translateZ: 60 }} 
            className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${colors.bg} mb-6 shadow-lg group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500`}
          >
            <Icon className={`h-8 w-8 ${colors.iconColor}`} strokeWidth={1.5} />
          </motion.div>

          {/* Dynamic hover text color matches the stage color */}
          <motion.h3 
            style={{ translateZ: 40 }} 
            className={`text-2xl font-bold mb-3 text-foreground ${colors.hoverText} transition-colors duration-300`}
          >
            {locale === 'ar' ? stage.NameAr : stage.NameEn}
          </motion.h3>

          <motion.p 
            style={{ translateZ: 25 }} 
            className="text-sm text-muted-foreground leading-relaxed mb-8"
          >
            {t(`stages.stageDescriptions.${index}`, { defaultValue: '' })}
          </motion.p>

          <motion.div 
            style={{ translateZ: 50 }} 
            className="mt-auto flex items-center justify-between"
          >
            <span className={`text-sm font-bold tracking-wider uppercase ${colors.iconColor}`}>
              {t('common.explore')}
            </span>
            {/* Dynamic hover background for the arrow button */}
            <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-background/50 border border-primary/10 ${colors.hoverBg} group-hover:border-transparent transition-colors duration-500`}>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-white transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
            </div>
          </motion.div>

        </div>
      </motion.a>
    </motion.div>
  );
}

export function StagesSection() {
  const t = useTranslations();
  const locale = useLocale();
  const { data: stages, isLoading } = useGetStagesQuery(locale, { refetchOnMountOrArgChange: true });

// Custom premium styles matching the spotlight effect & hover states
  const stageStyles = [
    { 
      from: 'from-[#53B2D8]', to: 'to-[#3491C3]', 
      bg: 'from-[#53B2D838] to-[#3491C31F]', 
      iconColor: 'text-[#2F88B8]',
      hoverText: 'group-hover:text-[#2F88B8]',       // Added dynamic hover text
      hoverBg: 'group-hover:bg-[#3491C3]',           // Added dynamic hover bg (for arrow button)
      hoverShadow: 'hover:shadow-[#53B2D833]',      // Added dynamic hover shadow
      spotlight: '#53B2D826', 
      icon: Calculator 
    },
    { 
      from: 'from-[#3491C3]', to: 'to-[#2F73A3]', 
      bg: 'from-[#3491C338] to-[#2F73A31F]', 
      iconColor: 'text-[#2F73A3]',
      hoverText: 'group-hover:text-[#2F73A3]',
      hoverBg: 'group-hover:bg-[#2F73A3]',
      hoverShadow: 'hover:shadow-[#3491C333]',
      spotlight: '#3491C326', 
      icon: Compass 
    },
    { 
      from: 'from-[#4FA6CF]', to: 'to-[#285E88]', 
      bg: 'from-[#4FA6CF38] to-[#285E881F]', 
      iconColor: 'text-[#285E88]',
      hoverText: 'group-hover:text-[#285E88]',
      hoverBg: 'group-hover:bg-[#285E88]',
      hoverShadow: 'hover:shadow-[#2F73A333]',
      spotlight: '#2F73A326', 
      icon: FunctionSquare 
    },
    { 
      from: 'from-[#69889F]', to: 'to-[#213550]', 
      bg: 'from-[#69889F38] to-[#2135501F]', 
      iconColor: 'text-[#365C78]',
      hoverText: 'group-hover:text-[#365C78] dark:group-hover:text-[#8CCDE5]',
      hoverBg: 'group-hover:bg-[#365C78]',
      hoverShadow: 'hover:shadow-[#21355033]',
      spotlight: '#69889F26', 
      icon: InfinityIcon 
    },
  ];

  if (isLoading) {
    return (
      <section className="py-24 lg:py-32 bg-background flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </section>
    );
  }

  if (!stages || stages.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-[#F9FCFE] py-24 lg:py-32 dark:bg-background">
      {/* Ambient glow backgrounds for the entire section */}
      <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-[#53B2D812] blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-[#2F73A30F] blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        
        {/* Section header with premium styling */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center justify-center gap-3 mb-4 px-4 py-2 rounded-full border border-primary/20 bg-primary/5">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-bold text-primary uppercase tracking-widest">
              {t('stages.title')}
            </span>
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
          </div>
          <h2 className="text-4xl lg:text-5xl font-extrabold mb-6 tracking-tight">
            {t('stages.heading')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t('stages.subtitle')}
          </p>
        </motion.div>

        {/* Grid layout for the cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8 max-w-7xl mx-auto">
          {stages.map((stage, index) => {
            const style = stageStyles[index % stageStyles.length];
            return (
              <StagePremiumCard 
                key={stage.Id} 
                stage={stage} 
                index={index} 
                colors={style} 
                icon={style.icon} 
                locale={locale} 
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}