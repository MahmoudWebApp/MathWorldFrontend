'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { useGetStageCategoryAccessQuery, useGetStudentSubscriptionQuery, type CategoryDto } from '@/store/api/categoriesApi';
import { useGetStagesQuery, type Stage } from '@/store/api/stagesApi';
import { useSearchProblemsQuery } from '@/store/api/problemsApi';
import {
  AlertCircle,
  Filter,
  Loader2,
  LockKeyhole,
} from 'lucide-react';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from 'framer-motion';
import { STAGE_CATEGORY_BRAND_STYLES, MATH_CARD_SYMBOLS, type CategoryBrandStyle } from '@/lib/brand';
import { getStageVisual, getStageAccent, sortStagesByOrder } from '@/lib/stageVisuals';
import { StageIconBadge } from '@/components/stages/StageIconBadge';
import { RichText } from '@/components/ui/RichText';
import { DirectionalArrow, DirectionalChevron } from '@/components/ui/DirectionalNavigation';
import { LockedPremiumDialog } from '@/components/premium/LockedPremiumDialog';

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
  stageAccent: string;
  iconUrl?: string | null;
  locked: boolean;
  empty: boolean;
  publicPreview: boolean;
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
  stageAccent,
  iconUrl,
  locked,
  empty,
  publicPreview,
}: CategoryPremiumCardProps) {
  const categoryName = locale === 'ar' ? category.NameAr : category.NameEn;
  const tip = locale === 'ar' ? 'هذه الفئة لحساب Premium' : 'Available with Premium';
  const body = (
    <div
      className={`brand-surface math-card group relative flex h-full min-h-[205px] flex-col overflow-hidden rounded-2xl border p-4 transition-[box-shadow,border-color] hover:shadow-md sm:p-5 md:min-h-[240px] md:rounded-3xl md:p-6 ${style.hoverShadow}`}
      style={{ borderColor: `${stageAccent}30` }}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-1"
        style={{ backgroundColor: stageAccent }} />
      <div className="relative flex items-start justify-between gap-2">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border sm:h-14 sm:w-14"
          style={{ color: stageAccent, backgroundColor: `${stageAccent}11`, borderColor: `${stageAccent}25` }}>
          {iconUrl && (iconUrl.startsWith('https://') || iconUrl.startsWith('/'))
            ? <Image src={iconUrl} alt="" unoptimized width={34} height={34} className="h-9 w-9 object-contain" />
            : iconUrl && iconUrl.length < 5
              ? <span className="text-2xl">{iconUrl}</span>
              : <span className="font-serif text-xl font-bold">{math.symbol}</span>}
        </div>
        {locked
          ? <LockKeyhole className="h-4 w-4 shrink-0 text-muted-foreground/75" aria-label={tip} />
          : !empty && <DirectionalArrow direction="forward" size={20} className="shrink-0" />}
      </div>
      <h3 className="relative mt-4 line-clamp-3 text-base font-extrabold leading-snug sm:text-lg"
        style={{ color: stageAccent }}>{categoryName}</h3>
      {publicPreview && <p className="relative mt-2 text-sm leading-6 text-muted-foreground">
        {(locale === 'ar' ? category.DescriptionAr : category.DescriptionEn)?.trim()
          || (locale === 'ar' ? `تعرّف إلى محتوى ${categoryName}.` : `Explore the ${categoryName} topic.`)}
      </p>}
      <div className="relative mt-auto flex min-h-9 items-end justify-between gap-2 border-t border-border/60 pt-3 text-xs font-semibold text-muted-foreground sm:text-sm">
        <span>{category.ProblemsCount ?? 0} {locale === 'ar' ? 'مسألة' : 'problems'}</span>
        {!publicPreview && !locked && !empty && <span style={{ color: stageAccent }}>
          {locale === 'ar' ? 'استكشف' : 'Explore'}
        </span>}
      </div>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.24) }} className="h-full">
      {publicPreview ? (
        <div className="h-full" aria-label={categoryName}>{body}</div>
      ) : locked ? (
        <LockedPremiumDialog topicName={categoryName}>
          <button type="button"
            className="block h-full w-full rounded-2xl text-start focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            aria-label={`${categoryName} — ${tip}`}>
            {body}
          </button>
        </LockedPremiumDialog>
      ) : empty ? (
        <div className="h-full opacity-75" aria-label={`${categoryName} — ${locale === 'ar' ? 'لا توجد مسائل' : 'No problems'}`}>{body}</div>
      ) : (
        <Link href={`/problems?categoryId=${category.Id}&stageId=${stageId}`}
          className="block h-full rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          {body}
        </Link>
      )}
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
  serverIntroProvided?: boolean;
}

export default function StageCategoriesClient({ stageId, serverIntroProvided = false }: StageCategoriesClientProps) {
  const t = useTranslations();
  const locale = useLocale();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const role = useSelector((state: RootState) =>
    state.auth.isAuthenticated ? state.auth.user?.Role : undefined);
  const isGuest = !isAuthenticated;
  const isAdmin = role === 'Admin';
  const isStudent = role === 'Student';
  const chosenStageId = useSelector((state: RootState) => state.auth.user?.CurrentStageId);
  // Public information remains viewable to logged-in students too.
  // For another stage, render a read-only curriculum guide; never enable solving.
  const publicPreview = isGuest || (isStudent && (chosenStageId == null || stageId !== chosenStageId));
  // The JWT profile can lag behind an admin grant or a 100% code redemption.
  const {
    data: subscription,
    isError: subscriptionError,
    refetch: refetchSubscription,
  } = useGetStudentSubscriptionQuery(undefined, {
    skip: !isStudent,
    refetchOnMountOrArgChange: true,
  });
  const isPremium = isAdmin || (isStudent && subscription?.IsPremium === true);
  // Public sample titles are informational only: no answers or solution previews.
  const { data: stageExamples, isLoading: examplesLoading } = useSearchProblemsQuery(
    { StageId: stageId, Page: 1, PageSize: 4, locale, Engine: 'postgresql' },
    { skip: !publicPreview || stageId <= 0 },
  );

  
  const {
    data: stages,
    isLoading: stagesLoading,
    error: stagesError,
    refetch: refetchStages,
  } = useGetStagesQuery(locale, { refetchOnMountOrArgChange: true });

  const {
    data: stageAccess,
    isLoading: accessLoading,
    isError: accessError,
    refetch: refetchAccess,
  } = useGetStageCategoryAccessQuery(stageId, {
    skip: stageId <= 0,
    refetchOnMountOrArgChange: true,
  });

  const currentStage = stages?.find(s => s.Id === stageId);
  const stageIdentity = currentStage ?? { Id: stageId };
  const stageAccent = getStageAccent(stageIdentity);
  const categoryBrandStyle = STAGE_CATEGORY_BRAND_STYLES[getStageVisual(stageIdentity).index];
  // The stage-scoped server catalog is authoritative for category details,
  // published inventory, order and Free access. Do not depend on a second
  // global /categories request that can fail independently and hide valid data.
  const sortedCategories: CategoryDto[] = (stageAccess?.Categories ?? [])
    .map(category => ({
      ...category,
      StageId: stageId,
    }))
    .sort((a, b) => (a.Order || 0) - (b.Order || 0) || a.Id - b.Id);
  
  const otherStages = publicPreview ? sortStagesByOrder(stages?.filter(s => s.Id !== stageId) || []) : [];
  // The admin may select a different Free pair. Always use the server IDs.
  const freeCategoryIds = new Set(stageAccess?.FreeCategoryIds ?? []);
  // Stage data is usable while a separate entitlement request is pending.
  // Until verified, only the server-designated Free categories open.
  const isLoading = stagesLoading || accessLoading;
  const stageNotFound = !isLoading && !!stages && !currentStage;

  if (stageNotFound) {
    return (
      <section className="math-section-bg flex min-h-[60vh] items-center justify-center px-4">
        <div className="math-card max-w-md rounded-3xl border border-border p-8 text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-primary" aria-hidden="true" />
          <h1 className="mt-4 text-xl font-bold">
            {locale === 'ar' ? 'المرحلة التعليمية غير موجودة' : 'Learning stage not found'}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {locale === 'ar'
              ? 'قد يكون الرابط قديماً أو تغيّرت المرحلة. اختر مرحلتك من القائمة.'
              : 'This link might be outdated. Choose an available stage instead.'}
          </p>
          <Link href="/stages"
            className="mt-5 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground">
            {locale === 'ar' ? 'عرض المراحل المتاحة' : 'Browse available stages'}
          </Link>
        </div>
      </section>
    );
  }

  if (stagesError || accessError) {
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
              onClick={() => {
                void refetchStages();
                if (stageId > 0) void refetchAccess();
                if (isStudent) void refetchSubscription();
              }}
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
            href={publicPreview ? '/stages' : '/dashboard'}
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-6 group math-equation-chip bg-card/50 backdrop-blur-md px-4 py-2 rounded-full"
          >
            <DirectionalArrow direction="back" className="h-4 w-4 transition-transform group-hover:-translate-x-1 rtl:group-hover:translate-x-1" />
            {publicPreview ? t('stages.backToStages') : (locale === 'ar' ? 'لوحة الطالب' : 'My dashboard')}
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
                <span className="flex h-1.5 w-1.5 rounded-full" style={{ backgroundColor: stageAccent }} />
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: stageAccent }}>
                  {currentStage ? (locale === 'ar' ? currentStage.NameAr : currentStage.NameEn) : t('stages.title')}
                </span>
              </div>
            </div>
            
            {!serverIntroProvided && (
              <>
                <h1 className="brand-display-title mb-4 text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl"
                  style={{ color: stageAccent }}>
                  {currentStage ? (locale === 'ar' ? currentStage.NameAr : currentStage.NameEn) : t('categories.title')}
                </h1>
                <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
                  {(locale === 'ar' ? currentStage?.DescriptionAr : currentStage?.DescriptionEn)?.trim()
                    || (locale === 'ar' ? 'تعرّف إلى فئات هذه المرحلة ومسائلها.' : 'Explore this stage and its topics.')}
                </p>
              </>
            )}
          </motion.div>
        </div>

        {isStudent && subscriptionError && (
          <button type="button" onClick={() => void refetchSubscription()}
            className="mb-4 rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground hover:text-foreground">
            {locale === 'ar' ? 'تعذّر تحديث الصلاحيات، إعادة المحاولة' : 'Could not refresh access. Retry'}
          </button>
        )}

        {isStudent && publicPreview && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/15 bg-primary/5 p-4 text-sm">
            <span>{locale === 'ar'
              ? 'هذا عرض تعريفي فقط. لتدرس هذه المرحلة وتحفظ تقدّمك، غيّر مرحلتك من الإعدادات.'
              : 'This is a public preview only. Switch your learning stage to practise and save progress.'}</span>
            <Link href="/learning-stage" className="rounded-lg bg-primary px-4 py-2 font-bold text-primary-foreground">
              {locale === 'ar' ? 'تغيير المرحلة' : 'Change stage'}
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
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button type="button"
                onClick={() => { if (stageId > 0) void refetchAccess(); }}
                className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold">
                {t('common.retry')}
              </button>
              <Link href="/stages"
                className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">
                {locale === 'ar' ? 'العودة للمراحل' : 'Back to stages'}
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 md:gap-5 xl:grid-cols-4 lg:gap-8">
            {sortedCategories.map((category, index) => {
              const math = MATH_CARD_SYMBOLS[category.Id % MATH_CARD_SYMBOLS.length];
              const style = categoryBrandStyle;
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
                  stageAccent={stageAccent}
                  iconUrl={iconUrl}
                  locked={!publicPreview && isAuthenticated && !isPremium && !freeCategoryIds.has(category.Id)}
                  empty={category.ProblemsCount === 0}
                  publicPreview={publicPreview}
                />
              );
            })}
          </div>
        )}

        {/* Public stage guide: categories live on this page, not on separate public category pages. */}
        {publicPreview && (
          <section className="mt-10 space-y-5 rounded-3xl border border-primary/15 bg-card/90 p-5 sm:p-8" aria-label={locale === 'ar' ? 'أمثلة من مسائل المرحلة' : 'Example problem titles'}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-extrabold text-foreground sm:text-2xl">
                  {locale === 'ar' ? 'أمثلة من مسائل هذه المرحلة' : 'Sample questions from this stage'}
                </h2>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  {locale === 'ar' ? 'نعرض عناوين الأسئلة فقط. سجّل حساباً لتبدأ الحل وتحفظ تقدّمك.'
                    : 'Question titles only. Create an account to solve problems and save your progress.'}
                </p>
              </div>
              <Link href="/premium" className="rounded-xl border border-primary/25 px-4 py-2 text-sm font-bold text-primary hover:bg-primary/10">
                {locale === 'ar' ? 'مقارنة Free وPremium' : 'Compare Free and Premium'}
              </Link>
            </div>
            {examplesLoading ? (
              <p role="status" className="text-sm text-muted-foreground">{locale === 'ar' ? 'جارٍ تحميل الأمثلة...' : 'Loading examples...'}</p>
            ) : stageExamples?.Results?.length ? (
              <ol className="grid gap-3 sm:grid-cols-2">
                {stageExamples.Results.slice(0, 4).map(problem => (
                  <li key={problem.Id} className="rounded-2xl border border-border bg-background/70 px-4 py-4 text-sm font-semibold leading-7 text-foreground">
                    <RichText text={problem.Title} isArabic={locale === 'ar'} className="text-sm font-semibold leading-7" />
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-muted-foreground">{locale === 'ar' ? 'تصفّح الفئات أعلاه للتعرّف إلى الموضوعات.' : 'Explore the topics above to learn about this stage.'}</p>
            )}
            <Link href="/register" className="inline-flex min-h-11 items-center rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:opacity-90">
              {locale === 'ar' ? 'ابدأ التعلم مجاناً' : 'Start learning for free'}
            </Link>
          </section>
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
