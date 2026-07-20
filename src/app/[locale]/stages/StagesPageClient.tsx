'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useGetStagesQuery, type Stage } from '@/store/api/stagesApi';
import {
  AlertCircle,
  ArrowRight,
  Calculator,
  Compass,
  FunctionSquare,
  Infinity as InfinityIcon,
  Loader2,
  type LucideIcon,
} from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from 'framer-motion';

// ==========================================
// Premium 3D Card Component (Spotlight & Depth)
// ==========================================
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
  
  // Normalized mouse coordinates (-0.5 to 0.5) for 3D tilt
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // Mouse coordinates in pixels (for the interactive spotlight effect)
  const mouseXPixel = useMotionValue(0);
  const mouseYPixel = useMotionValue(0);

  // Tilt physics springs for smooth animation
  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  // Map mouse movement to rotation degrees
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [isRtl ? "10deg" : "-10deg", isRtl ? "-10deg" : "10deg"]);

  // Magical spotlight effect that follows the mouse
  const spotlightBackground = useMotionTemplate`
    radial-gradient(350px circle at ${mouseXPixel}px ${mouseYPixel}px, ${colors.spotlight}, transparent 80%)
  `;

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Update pixel coordinates for the spotlight
    mouseXPixel.set(mouseX);
    mouseYPixel.set(mouseY);
    
    // Update normalized coordinates for the 3D tilt
    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  };

  const handleMouseLeave = () => {
    // Reset rotations when mouse leaves
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
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
        {/* Interactive spotlight effect */}
        <motion.div
          className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: spotlightBackground }}
        />

        {/* Top gradient accent line */}
        <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${colors.from} ${colors.to} opacity-80 group-hover:opacity-100 transition-opacity`} />
        
        {/* Decorative watermark background icon */}
        <Icon className="absolute -bottom-6 -right-6 h-32 w-32 text-primary/[0.03] group-hover:text-primary/[0.06] transition-colors duration-500 -rotate-12 pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full" style={{ transformStyle: "preserve-3d" }}>
          
          {/* Floating Icon (Layer 1) */}
          <motion.div 
            style={{ translateZ: 60 }} 
            className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${colors.bg} mb-6 shadow-lg group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500`}
          >
            <Icon className={`h-8 w-8 ${colors.iconColor}`} strokeWidth={1.5} />
          </motion.div>

          {/* Title (Layer 2) - Dynamic hover text color */}
          <motion.h3 
            style={{ translateZ: 40 }} 
            className={`text-2xl font-bold mb-3 text-foreground ${colors.hoverText} transition-colors duration-300`}
          >
            {locale === 'ar' ? stage.NameAr : stage.NameEn}
          </motion.h3>

          {/* Description (Layer 3) */}
          <motion.p 
            style={{ translateZ: 25 }} 
            className="text-sm text-muted-foreground leading-relaxed mb-8"
          >
            {t(`stages.stageDescriptions.${index}`, { defaultValue: '' })}
          </motion.p>

          {/* Magical Explore Button (Layer 4) */}
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

// ==========================================
// Main Page Component
// ==========================================
export default function StagesPageClient() {
  const t = useTranslations();
  const locale = useLocale();
  
  const { data: stages, isLoading, error } = useGetStagesQuery(locale, { refetchOnMountOrArgChange: true });

  // Custom premium styles matching the spotlight effect & hover states
  const stageStyles = [
    { 
      from: 'from-[#53B2D8]', to: 'to-[#3491C3]', 
      bg: 'from-[#53B2D838] to-[#3491C31F]', 
      iconColor: 'text-[#2F88B8]',
      hoverText: 'group-hover:text-[#2F88B8]',
      hoverBg: 'group-hover:bg-[#3491C3]',
      hoverShadow: 'hover:shadow-[#53B2D833]',
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

  // Error State handling
  if (error) {
    return (
      <section className="min-h-[60vh] flex items-center justify-center relative overflow-hidden bg-background">
        <div className="absolute inset-0 math-grid-bg opacity-30" />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center relative z-10 glass p-10 rounded-3xl max-w-md mx-4"
        >
          <div className="flex flex-col items-center gap-5 text-destructive">
            <div className="h-16 w-16 bg-destructive/10 rounded-full flex items-center justify-center mb-2">
              <AlertCircle className="h-8 w-8" />
            </div>
            <p className="text-xl font-bold">{t('common.errorLoadingData')}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 mt-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/25 active:scale-95 transition-all"
            >
              {t('common.retry')}
            </button>
          </div>
        </motion.div>
      </section>
    );
  }

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#F7FBFD] py-12 lg:py-20 dark:bg-background">
      {/* Background Ambience */}
      <div className="absolute inset-0 math-grid-bg opacity-30" />
      <div className="absolute top-0 right-0 h-[500px] w-[500px] rounded-full bg-[#53B2D812] blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 h-[400px] w-[400px] rounded-full bg-[#2F73A30D] blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        
        {/* Header Reveal Animation */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center gap-3 mb-6 px-4 py-2 rounded-full border border-primary/20 bg-primary/5">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-bold text-primary uppercase tracking-widest">
              {t('stages.title')}
            </span>
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
          </div>
          <h1 className="brand-display-title text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 bg-gradient-to-r from-foreground via-foreground to-foreground/60 bg-clip-text text-transparent tracking-tight">
            {t('stages.heading')}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t('stages.subtitle')}
          </p>
        </motion.div>

        {/* Loading State or Cards Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[30vh]">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8 max-w-7xl mx-auto pb-20">
            {stages?.map((stage, index) => {
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
        )}
      </div>
    </section>
  );
}