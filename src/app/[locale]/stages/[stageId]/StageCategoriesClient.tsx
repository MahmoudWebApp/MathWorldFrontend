'use client';

import { useTranslations, useLocale } from 'next-intl';
import {
  useGetCategoriesQuery,
  useGetStageCategoryAccessQuery,
  useGetStudentSubscriptionQuery,
  type CategoryDto,
} from '@/store/api/categoriesApi';
import { useSelector } from 'react-redux';
import { LockKeyhole } from 'lucide-react';
import { useGetStagesQuery, type Stage } from '@/store/api/stagesApi';
import {
  AlertCircle,
  Filter,
  Loader2,
} from 'lucide-react';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate, useReducedMotion } from 'framer-motion';
import { CATEGORY_BRAND_STYLES, MATH_CARD_SYMBOLS, type CategoryBrandStyle } from '@/lib/brand';
import { getStageVisual, sortStagesByOrder } from '@/lib/stageVisuals';
import { StageIconBadge } from '@/components/stages/StageIconBadge';
import { AccentHeadingText } from '@/components/ui/AccentHeadingText';
import { DirectionalArrow, DirectionalChevron } from '@/components/ui/DirectionalNavigation';

// ==========================================
// 1. Math assets
// ==========================================

type MathSymbol = (typeof MATH_CARD_SYMBOLS)[number];

interface CategoryPremiumCardProps {
  category: CategoryDto;
  index: number;
  math: MathSymbol;
  style: CategoryBrandStyle;
  locale: string;
  stageId: number;
  iconUrl?: string | null;
  locked: boolean;
  freeCategory: boolean;
}

interface OtherStagePremiumCardProps {
  stage: Stage;
  index: number;
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
  locked,
  freeCategory,
}: CategoryPremiumCardProps) {
  const reduceMotion = useReducedMotion();
  const name = locale === 'ar' ? category.NameAr : category.NameEn;
  const icon = iconUrl?.trim() ?? '';
  const iconIsPath = icon.startsWith('https://') || icon.startsWith('/');
  const iconIsGlyph = icon.length > 0 && [...icon].length <= 4 && !icon.includes('/') && !icon.includes('\\');
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: reduceMotion ? 0 : 0.35, delay: reduceMotion ? 0 : Math.min(index * 0.04, 0.24) }}
      className="h-full"
    >
      <Link
        href={locked ? '/premium' : `/problems?categoryId=${category.Id}&stageId=${stageId}`}
        aria-label={locked ? (locale === 'ar' ? name + ': فئة Premium مقفلة' : name + ': Premium category, locked') : undefined}
        className={`brand-surface math-card group relative flex min-h-[220px] flex-col justify-between overflow-hidden rounded-3xl p-5 outline-none transition-[border-color,box-shadow] hover:border-primary/40 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:min-h-[245px] sm:p-6 ${style.hoverShadow}`}
      >
        {/* Glow effect that appears on hover */}
        <div
          className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: style.spotlight }}
        />

        {(locked || freeCategory) && (
          <div className="absolute end-5 top-5 z-20 flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold">
            {locked && <LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" />}
            {locked ? "Premium" : (locale === "ar" ? "مجاني" : "Free")}
          </div>
        )}
        {/* Header: Icon & Name */}
        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className={`flex h-14 w-14 shrink-0 items-center justify-center sm:h-16 sm:w-16 rounded-2xl border border-border/50 shadow-inner transition-transform duration-500 group-hover:scale-110 ${style.bg}`}>
              {iconIsPath ? (
                <Image src={icon} alt="" width={32} height={32} className="h-8 w-8 object-contain" />
              ) : iconIsGlyph ? (
                <span aria-hidden="true" className="text-3xl">{icon}</span>
              ) : (
                <span aria-hidden="true" className="font-serif text-2xl font-bold text-primary">{math.symbol}</span>
              )}
            </div>
            {/* Minimal Arrow Button */}
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <DirectionalArrow direction="forward" size={20} />
            </div>
          </div>
          
          <h3 className={`break-words text-lg font-bold leading-snug sm:text-xl transition-colors ${style.hoverText}`}>
            {name}
          </h3>
        </div>

        {/* Footer: Equation & Subtle decorative element */}
        <div className="relative z-10 mt-auto">
          <p className="math-equation-chip inline-block rounded-md px-3 py-1 font-mono text-sm text-muted-foreground">
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
  locale,
}: OtherStagePremiumCardProps) {
  const isRtl = locale === 'ar';
  const stageName = isRtl ? stage.NameAr : stage.NameEn;
  const visual = getStageVisual(stage);
  const style = visual.style;
  
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
          className="brand-surface math-card group relative overflow-hidden rounded-2xl p-5 backdrop-blur-md transition-all duration-300 hover:border-brand-secondary/25 hover:shadow-xl"
        >
          <motion.div
            className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{ background: spotlightBackground }}
          />

          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${style.from} ${style.to} opacity-50 group-hover:opacity-100 transition-opacity`} />
          
          <div className="flex items-center gap-4 relative z-10" style={{ transformStyle: "preserve-3d" }}>
            <motion.div
              style={{ translateZ: 30 }}
              className="flex-shrink-0 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110"
            >
              <StageIconBadge stage={stage} size="md" />
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
              <DirectionalChevron direction="forward" className="h-4 w-4 text-muted-foreground transition-transform group-hover:text-white group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
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
  const authenticated = useSelector((state: { auth: { isAuthenticated: boolean; user: { Role?: string } | null } }) => state.auth.isAuthenticated && state.auth.user?.Role === "Student");
  const { data: access, isLoading: accessLoading, isError: accessError } = useGetStageCategoryAccessQuery(stageId, { skip: !Number.isSafeInteger(stageId) || stageId <= 0 });
  const { data: subscription, isLoading: subscriptionLoading } = useGetStudentSubscriptionQuery(undefined, { skip: !authenticated });
  const isAdmin = useSelector((state: { auth: { isAuthenticated: boolean; user: { Role?: string } | null } }) => state.auth.isAuthenticated && state.auth.user?.Role === "Admin");
  const isPremium = isAdmin || subscription?.IsPremium === true;

  const { data: allCategories, isLoading: categoriesLoading, error: categoriesError } = useGetCategoriesQuery(locale, { refetchOnMountOrArgChange: true });
  const { data: stages, isLoading: stagesLoading } = useGetStagesQuery(locale, { refetchOnMountOrArgChange: true });

  const currentStage = stages?.find(s => s.Id === stageId);
  const stageCategories = allCategories?.filter(cat => cat.StageId === stageId) || [];
  const sortedCategories = [...stageCategories].sort((a, b) => (a.Order || 0) - (b.Order || 0));
  
  const otherStages = sortStagesByOrder(stages?.filter(s => s.Id !== stageId) || []);
  const isLoading = categoriesLoading || stagesLoading || accessLoading || (authenticated && subscriptionLoading);

  if (categoriesError || accessError) {
    return (
      <section className="min-h-[60vh] flex items-center justify-center relative overflow-hidden math-section-bg">
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
    <section className="min-h-screen py-12 lg:py-20 relative overflow-hidden math-section-bg">
      {/* Premium Ambient Background */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-secondary/8 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute inset-0 math-grid-bg opacity-30 pointer-events-none" />

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        
        {/* Header Section */}
        <div className="mb-12 text-center md:text-start">
          <Link
            href="/stages"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-6 group math-equation-chip bg-card/50 backdrop-blur-md px-4 py-2 rounded-full"
          >
            <DirectionalArrow direction="back" className="h-4 w-4 transition-transform group-hover:-translate-x-1 rtl:group-hover:translate-x-1" />
            {t('stages.backToStages')}
          </Link>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:items-start items-center"
          >
            <div className="mb-4 flex items-center gap-3">
              {currentStage && <StageIconBadge stage={currentStage} size="md" />}
              <div className="math-equation-chip flex items-center gap-3 rounded-lg px-3 py-1.5">
                <span className="flex h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                <span className="text-xs font-bold uppercase tracking-widest text-primary">
                  {currentStage ? (locale === 'ar' ? currentStage.NameAr : currentStage.NameEn) : t('stages.title')}
                </span>
              </div>
            </div>
            
            <h1 className="brand-display-title text-foreground text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 tracking-tight">
              <AccentHeadingText
                text={currentStage
                  ? (locale === 'ar' ? currentStage.NameAr : currentStage.NameEn)
                  : t('categories.title')}
              />
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
              {t('categories.stageSubtitle', { 
                stage: currentStage ? (locale === 'ar' ? currentStage.NameAr : currentStage.NameEn) : '',
                defaultValue: t('categories.subtitle')
              })}
            </p>
          </motion.div>
        </div>

        {!isLoading && access && !isPremium && (
          <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
            <LockKeyhole className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            <p className="min-w-0 flex-1 leading-6 text-foreground">
              {locale === 'ar'
                ? 'حساب Free: فئتان مفتوحتان في كل مرحلة، ومسائل بلا حد ضمنهما. بقية الفئات لمشتركي Premium.'
                : 'Free: two categories per stage, with unlimited questions in them. Other categories require Premium.'}
            </p>
            <Link href="/premium" className="font-bold text-primary underline underline-offset-4">
              {locale === 'ar' ? 'مزايا Premium' : 'Premium benefits'}
            </Link>
          </div>
        )}

        {/* Main Categories Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[30vh]">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : sortedCategories.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="brand-surface math-card text-center py-20 rounded-3xl backdrop-blur-md"
          >
            <div className="math-equation-chip mx-auto h-20 w-20 rounded-full flex items-center justify-center mb-6">
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 lg:gap-6">
            {sortedCategories.map((category, index) => {
              const math = MATH_CARD_SYMBOLS[category.Id % MATH_CARD_SYMBOLS.length];
              const style = CATEGORY_BRAND_STYLES[category.Id % CATEGORY_BRAND_STYLES.length];
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
                  freeCategory={access?.FreeCategoryIds.includes(category.Id) === true}
                  locked={!isPremium && !access?.FreeCategoryIds.includes(category.Id)}
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
                <h2 className="text-gradient-math text-2xl md:text-3xl font-bold mb-2">
                  {t('stages.exploreOtherLevels')}
                </h2>
                <p className="text-muted-foreground">
                  {t('stages.exploreOtherLevelsDesc')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {otherStages.map((stage, index) => (
                <OtherStagePremiumCard
                  key={stage.Id}
                  stage={stage}
                  index={index}
                  locale={locale}
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
