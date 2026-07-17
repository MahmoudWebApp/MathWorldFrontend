'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useGetCategoriesQuery, type CategoryDto } from '@/store/api/categoriesApi';
import { useGetStagesQuery, type Stage } from '@/store/api/stagesApi';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Calculator,
  ChevronRight,
  Compass,
  Filter,
  FunctionSquare,
  Infinity as InfinityIcon,
  Loader2,
  type LucideIcon,
} from 'lucide-react';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from 'framer-motion';

// ==========================================
// 1. Styles & Assets Arrays
// ==========================================

const categoryStyles = [
  { from: 'from-blue-500', to: 'to-indigo-500', bg: 'bg-blue-500/10', hoverText: 'group-hover:text-blue-500', hoverShadow: 'hover:shadow-blue-500/20', spotlight: 'rgba(59, 130, 246, 0.15)' },
  { from: 'from-emerald-500', to: 'to-teal-500', bg: 'bg-emerald-500/10', hoverText: 'group-hover:text-emerald-500', hoverShadow: 'hover:shadow-emerald-500/20', spotlight: 'rgba(16, 185, 129, 0.15)' },
  { from: 'from-amber-500', to: 'to-orange-500', bg: 'bg-amber-500/10', hoverText: 'group-hover:text-amber-500', hoverShadow: 'hover:shadow-amber-500/20', spotlight: 'rgba(245, 158, 11, 0.15)' },
  { from: 'from-rose-500', to: 'to-pink-500', bg: 'bg-rose-500/10', hoverText: 'group-hover:text-rose-500', hoverShadow: 'hover:shadow-rose-500/20', spotlight: 'rgba(244, 63, 94, 0.15)' },
  { from: 'from-violet-500', to: 'to-purple-500', bg: 'bg-violet-500/10', hoverText: 'group-hover:text-violet-500', hoverShadow: 'hover:shadow-violet-500/20', spotlight: 'rgba(139, 92, 246, 0.15)' },
  { from: 'from-cyan-500', to: 'to-sky-500', bg: 'bg-cyan-500/10', hoverText: 'group-hover:text-cyan-500', hoverShadow: 'hover:shadow-cyan-500/20', spotlight: 'rgba(6, 182, 212, 0.15)' },
  { from: 'from-fuchsia-500', to: 'to-pink-500', bg: 'bg-fuchsia-500/10', hoverText: 'group-hover:text-fuchsia-500', hoverShadow: 'hover:shadow-fuchsia-500/20', spotlight: 'rgba(217, 70, 239, 0.15)' },
  { from: 'from-lime-500', to: 'to-green-500', bg: 'bg-lime-500/10', hoverText: 'group-hover:text-lime-500', hoverShadow: 'hover:shadow-lime-500/20', spotlight: 'rgba(132, 204, 22, 0.15)' },
];

const mathSymbols = [
  { symbol: 'x²', equation: 'ax² + bx + c = 0' },
  { symbol: 'πr²', equation: 'S = πr²' },
  { symbol: '∫', equation: '∫ f(x) dx' },
  { symbol: 'σ', equation: 'μ ± σ' },
  { symbol: 'n!', equation: 'gcd(a, b)' },
  { symbol: 'P(A)', equation: 'nCr × pʳ' },
  { symbol: 'sinθ', equation: 'sin²θ + cos²θ = 1' },
  { symbol: '[A]', equation: 'Ax = λx' },
  { symbol: '∑', equation: 'f(x) = ∑ xᵢ' },
  { symbol: '∂', equation: '∂f/∂x' },
  { symbol: '∇', equation: '∇ × F' },
  { symbol: '∞', equation: 'lim (x→∞)' },
];

const otherStageStyles = [
  { 
    from: 'from-emerald-400', to: 'to-teal-600', 
    bg: 'from-emerald-500/20 to-teal-500/10', 
    iconColor: 'text-emerald-500', hoverText: 'group-hover:text-emerald-500', 
    hoverBg: 'group-hover:bg-emerald-500', spotlight: 'rgba(16, 185, 129, 0.12)', 
    icon: Calculator 
  },
  { 
    from: 'from-blue-400', to: 'to-indigo-600', 
    bg: 'from-blue-500/20 to-indigo-500/10', 
    iconColor: 'text-blue-500', hoverText: 'group-hover:text-blue-500', 
    hoverBg: 'group-hover:bg-blue-500', spotlight: 'rgba(59, 130, 246, 0.12)', 
    icon: Compass 
  },
  { 
    from: 'from-amber-400', to: 'to-orange-600', 
    bg: 'from-amber-500/20 to-orange-500/10', 
    iconColor: 'text-amber-500', hoverText: 'group-hover:text-amber-500', 
    hoverBg: 'group-hover:bg-amber-500', spotlight: 'rgba(245, 158, 11, 0.12)', 
    icon: FunctionSquare 
  },
  { 
    from: 'from-purple-400', to: 'to-fuchsia-600', 
    bg: 'from-purple-500/20 to-fuchsia-500/10', 
    iconColor: 'text-purple-500', hoverText: 'group-hover:text-purple-500', 
    hoverBg: 'group-hover:bg-purple-500', spotlight: 'rgba(168, 85, 247, 0.12)', 
    icon: InfinityIcon 
  },
];

interface MathSymbol {
  symbol: string;
  equation: string;
}

interface CategoryCardStyle {
  from: string;
  to: string;
  bg: string;
  hoverText: string;
  hoverShadow: string;
  spotlight: string;
}

interface OtherStageStyle {
  from: string;
  to: string;
  bg: string;
  iconColor: string;
  hoverText: string;
  hoverBg: string;
  spotlight: string;
  icon: LucideIcon;
}

interface CategoryPremiumCardProps {
  category: CategoryDto;
  index: number;
  math: MathSymbol;
  style: CategoryCardStyle;
  locale: string;
  stageId: number;
  iconUrl?: string | null;
}

interface OtherStagePremiumCardProps {
  stage: Stage;
  index: number;
  style: OtherStageStyle;
  locale: string;
}

// ==========================================
// 2. Main Category 3D Card
// ==========================================
function CategoryPremiumCard({
  category,
  index,
  math,
  style,
  locale,
  stageId,
  iconUrl,
}: CategoryPremiumCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.05, type: "spring" }}
      className="h-full"
    >
      <Link
        href={`/problems?categoryId=${category.Id}&stageId=${stageId}`}
        className={`group relative flex h-[240px] flex-col justify-between rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-8 shadow-2xl backdrop-blur-2xl transition-all duration-500 hover:-translate-y-2 hover:border-primary/50 ${style.hoverShadow}`}
      >
        {/* Glow effect that appears on hover */}
        <div
          className="absolute inset-0 rounded-[2.5rem] opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: style.spotlight }}
        />

        {/* Header: Icon & Name */}
        <div className="relative z-10 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className={`flex h-16 w-16 items-center justify-center rounded-2xl border border-border/50 shadow-inner transition-transform duration-500 group-hover:scale-110 ${style.bg}`}>
              {iconUrl ? (
                iconUrl.startsWith('http') || iconUrl.startsWith('/') ? (
                  <Image src={iconUrl} alt="icon" width={32} height={32} className="h-8 w-8 object-contain" />
                ) : (
                  <span className="text-3xl">{iconUrl}</span>
                )
              ) : (
                <span className="font-serif text-2xl font-bold text-primary">{math.symbol}</span>
              )}
            </div>
            {/* Minimal Arrow Button */}
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
              <ArrowRight className="h-5 w-5 rtl:rotate-180" />
            </div>
          </div>
          
          <h3 className={`mb-4 text-2xl font-bold leading-tight transition-colors ${style.hoverText}`}>
            {locale === 'ar' ? category.NameAr : category.NameEn}
          </h3>
        </div>

        {/* Footer: Equation & Subtle decorative element */}
        <div className="relative z-10 mt-auto">
          <p className="font-mono text-sm text-muted-foreground bg-black/5 dark:bg-white/5 px-3 py-1 rounded-md inline-block">
            {math.equation}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
// ==========================================
// 3. Other Stages 3D Card
// ==========================================
function OtherStagePremiumCard({
  stage,
  index,
  style,
  locale,
}: OtherStagePremiumCardProps) {
  const isRtl = locale === 'ar';
  const stageName = isRtl ? stage.NameAr : stage.NameEn;
  const Icon = style.icon;
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXPixel = useMotionValue(0);
  const mouseYPixel = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["8deg", "-8deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [isRtl ? "8deg" : "-8deg", isRtl ? "-8deg" : "8deg"]);

  const spotlightBackground = useMotionTemplate`
    radial-gradient(250px circle at ${mouseXPixel}px ${mouseYPixel}px, ${style.spotlight}, transparent 80%)
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
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1, type: "spring" }}
      style={{ perspective: 1000 }}
    >
      <Link
        href={`/stages/${stage.Id}`}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <motion.div
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          className="group relative overflow-hidden rounded-2xl border border-primary/10 bg-card/40 backdrop-blur-md p-5 transition-all duration-300 hover:shadow-xl hover:border-primary/30"
        >
          <motion.div
            className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{ background: spotlightBackground }}
          />

          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${style.from} ${style.to} opacity-50 group-hover:opacity-100 transition-opacity`} />
          
          <div className="flex items-center gap-4 relative z-10" style={{ transformStyle: "preserve-3d" }}>
            <motion.div 
              style={{ translateZ: 30 }}
              className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${style.bg} flex-shrink-0 shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300`}
            >
              <Icon className={`h-6 w-6 ${style.iconColor}`} strokeWidth={2} />
            </motion.div>

            <motion.div style={{ translateZ: 20 }} className="flex-1 min-w-0">
              <h3 className={`font-bold text-base truncate ${style.hoverText} transition-colors`}>
                {stageName}
              </h3>
            </motion.div>

            <motion.div 
              style={{ translateZ: 40 }}
              className={`flex h-9 w-9 items-center justify-center rounded-full bg-background/50 border border-primary/10 ${style.hoverBg} group-hover:border-transparent transition-colors duration-300 flex-shrink-0`}
            >
              <ChevronRight className={`h-4 w-4 text-muted-foreground group-hover:text-white transition-transform ${isRtl ? 'rotate-180 group-hover:-translate-x-0.5' : 'group-hover:translate-x-0.5'}`} />
            </motion.div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

// ==========================================
// 4. Main Page Component
// ==========================================
interface StageCategoriesClientProps {
  stageId: number;
}

export default function StageCategoriesClient({ stageId }: StageCategoriesClientProps) {
  const t = useTranslations();
  const locale = useLocale();

  
  const { data: allCategories, isLoading: categoriesLoading, error: categoriesError } = useGetCategoriesQuery();
  const { data: stages, isLoading: stagesLoading } = useGetStagesQuery();

  const currentStage = stages?.find(s => s.Id === stageId);
  const stageCategories = allCategories?.filter(cat => cat.StageId === stageId) || [];
  const sortedCategories = [...stageCategories].sort((a, b) => (a.Order || 0) - (b.Order || 0));
  
  const otherStages = stages?.filter(s => s.Id !== stageId) || [];
  const isLoading = categoriesLoading || stagesLoading;

  if (categoriesError) {
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
    <section className="min-h-screen py-12 lg:py-20 relative overflow-hidden bg-background">
      {/* Premium Ambient Background */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/[0.03] rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/[0.03] rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute inset-0 math-grid-bg opacity-30 pointer-events-none" />

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        
        {/* Header Section */}
        <div className="mb-12 text-center md:text-start">
          <Link
            href="/stages"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-6 group bg-card/50 backdrop-blur-md px-4 py-2 rounded-full border border-border/50"
          >
            <ArrowLeft className={`h-4 w-4 transition-transform group-hover:-translate-x-1 rtl:rotate-180 rtl:group-hover:translate-x-1`} />
            {t('stages.backToStages')}
          </Link>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:items-start items-center"
          >
            <div className="flex items-center gap-3 mb-3 px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/10">
              <span className="flex h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-bold text-primary uppercase tracking-widest">
                {currentStage ? (locale === 'ar' ? currentStage.NameAr : currentStage.NameEn) : t('stages.title')}
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent tracking-tight">
              {currentStage 
                ? (locale === 'ar' ? currentStage.NameAr : currentStage.NameEn) 
                : t('categories.title')}
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
              {t('categories.stageSubtitle', { 
                stage: currentStage ? (locale === 'ar' ? currentStage.NameAr : currentStage.NameEn) : '',
                defaultValue: t('categories.subtitle')
              })}
            </p>
          </motion.div>
        </div>

        {/* Main Categories Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[30vh]">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : sortedCategories.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 bg-card/30 backdrop-blur-md rounded-3xl border border-border/50"
          >
            <div className="mx-auto h-20 w-20 bg-muted rounded-full flex items-center justify-center mb-6">
              <Filter className="h-10 w-10 text-muted-foreground opacity-50" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3">
              {t('categories.noCategories')}
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {t('categories.noCategoriesDesc')}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-5 lg:gap-8">
            {sortedCategories.map((category, index) => {
              const math = mathSymbols[category.Id % mathSymbols.length];
              const style = categoryStyles[category.Id % categoryStyles.length];
              const iconUrl = category.Icon;

              return (
                <CategoryPremiumCard
                  key={category.Id}
                  category={category}
                  index={index}
                  math={math}
                  style={style}
                  locale={locale}
                  stageId={stageId}
                  iconUrl={iconUrl}
                />
              );
            })}
          </div>
        )}

        {/* Enhanced Other Stages Section */}
        {otherStages.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-24 pt-16 border-t border-border/40"
          >
            <div className="text-center md:text-start mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-2 text-foreground">
                  {t('stages.exploreOtherLevels')}
                </h2>
                <p className="text-muted-foreground">
                  {t('stages.exploreOtherLevelsDesc')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {otherStages.map((stage, index) => {
                const style = otherStageStyles[index % otherStageStyles.length];
                
                return (
                  <OtherStagePremiumCard
                    key={stage.Id}
                    stage={stage}
                    index={index}
                    style={style}
                    locale={locale}
                  />
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}