'use client';

import { useTranslations, useLocale } from 'next-intl';
import {
  useGetStageCategoryAccessQuery,
  useGetStudentSubscriptionQuery,
  type CategoryDto,
} from '@/store/api/categoriesApi';
import { useSelector } from 'react-redux';
import { useGetStagesQuery, type Stage } from '@/store/api/stagesApi';
import {
  AlertCircle,
  Filter,
  Loader2,
  LockKeyhole,
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
}: CategoryPremiumCardProps) {
  const reduceMotion = useReducedMotion();
  const name = locale === 'ar' ? category.NameAr : category.NameEn;
  const icon = iconUrl?.trim() ?? '';
  const iconIsPath = icon.startsWith('https://') || icon.startsWith('/');
  const iconIsGlyph = icon.length > 0 && [...icon].length <= 4 && !icon.includes('/') && !icon.includes('\\');
  const noPublishedProblems = category.ProblemsCount === 0;
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: reduceMotion ? 0 : 0.35, delay: reduceMotion ? 0 : Math.min(index * 0.04, 0.24) }}
      className="h-full"
    >
      <div
        className={`brand-surface math-card group relative flex min-h-[186px] min-w-0 flex-col justify-between overflow-hidden rounded-3xl p-4 sm:min-h-[220px] sm:p-5 lg:min-h-[245px] lg:p-6 ${style.hoverShadow}`}
      >
        {/* Glow effect that appears on hover */}
        <div
          className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: style.spotlight }}
        />

        <div className="absolute end-5 top-5 z-20 flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold">
          {locked && <LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" />}
          {locked
            ? (locale === 'ar' ? 'مقفلة' : 'Locked')
            : (locale === 'ar' ? 'مفتوحة' : 'Unlocked')}
        </div>
        {/* Header: Icon & Name */}
        <div className="relative z-10 flex min-w-0 flex-col gap-3 sm:gap-4">
          <div className="flex items-center justify-between">
            <div className={`flex h-14 w-14 shrink-0 items-center justify-center sm:h-16 sm:w-16 rounded-2xl border border-border/50 shadow-inner transition-transform duration-500 group-hover:scale-110 ${style.bg}`}>
              {iconIsPath ? (
                <Image src={icon} alt="" width={32} height={32} unoptimized referrerPolicy="no-referrer" className="h-8 w-8 object-contain" />
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
          
          <h3 className={`break-words text-base font-bold leading-snug sm:text-lg lg:text-xl transition-colors ${style.hoverText}`}>
            {name}
          </h3>
        </div>

        {/* Footer: Equation & Subtle decorative element */}
        <div className="relative z-10 mt-auto">
          {noPublishedProblems ? (
            <p className="rounded-lg bg-muted/60 px-3 py-2 text-sm text-muted-foreground">
              {locale === 'ar' ? 'ما في مسائل منشورة لهالفئة بعد' : 'No published questions in this topic yet'}
            </p>
          ) : locked ? (
            <p className="text-sm text-muted-foreground">
              {locale === 'ar' ? 'خارج الفئات المجانية المفتوحة لحسابك' : 'Not part of your currently unlocked topics'}
            </p>
          ) : (
            <Link
              href={`/problems?categoryId=${category.Id}&stageId=${stageId}`}
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              aria-label={locale === 'ar' ? `ابدأ حل مسائل ${name}` : `Start practising ${name}`}
            >
              {category.ProblemsCount == null
                ? (locale === 'ar' ? 'استعرض المسائل' : 'Browse questions')
                : (locale === 'ar' ? 'ابدأ حل المسائل' : 'Start solving')}
            </Link>
          )}
        </div>
      </div>
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
  const reduceMotion = useReducedMotion();
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
    if (reduceMotion) return;
    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: reduceMotion ? 0 : 0.5, delay: reduceMotion ? 0 : index * 0.1, type: "spring" }}
      style={{ perspective: 1000 }}
    >
      <Link
        href={`/stages/${stage.Id}`}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <motion.div
          style={reduceMotion ? undefined : { rotateX, rotateY, transformStyle: "preserve-3d" }}
          className="brand-surface math-card group relative overflow-hidden rounded-2xl p-5 backdrop-blur-md transition-all duration-300 hover:border-brand-secondary/25 hover:shadow-xl"
        >
          <motion.div
            className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{ background: spotlightBackground }}
          />

          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${style.from} ${style.to} opacity-50 group-hover:opacity-100 transition-opacity`} />
          
          <div className="flex items-center gap-4 relative z-10" style={{ transformStyle: "preserve-3d" }}>
            <motion.div
              style={reduceMotion ? undefined : { translateZ: 30 }}
              className="flex-shrink-0 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110"
            >
              <StageIconBadge stage={stage} size="md" />
            </motion.div>

            <motion.div style={reduceMotion ? undefined : { translateZ: 20 }} className="flex-1 min-w-0">
              <h3 className={`font-bold text-base truncate ${style.hoverText} transition-colors`}>
                {stageName}
              </h3>
            </motion.div>

            <motion.div 
              style={reduceMotion ? undefined : { translateZ: 40 }}
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
  const { data: access, isLoading: accessLoading, isError: accessError, refetch: refetchAccess } = useGetStageCategoryAccessQuery(stageId, {
    skip: !Number.isSafeInteger(stageId) || stageId <= 0,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
  const { data: subscription, isLoading: subscriptionLoading, isError: subscriptionError, refetch: refetchSubscription } = useGetStudentSubscriptionQuery(undefined, {
    skip: !authenticated,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
  const isAdmin = useSelector((state: { auth: { isAuthenticated: boolean; user: { Role?: string } | null } }) => state.auth.isAuthenticated && state.auth.user?.Role === "Admin");
  const isPremium = isAdmin || subscription?.IsPremium === true;

  const { data: stages, isLoading: stagesLoading, isError: stagesError,
    refetch: refetchStages } = useGetStagesQuery(locale, { refetchOnMountOrArgChange: true });

  const currentStage = stages?.find(s => s.Id === stageId);
  // Keep category metadata, access and published inventory in the same
  // server-owned snapshot. A second /categories call may be stale or fail.
  const sortedCategories: CategoryDto[] = (access?.Categories ?? [])
    .map(category => ({ ...category, StageId: stageId, ProblemsCount: category.ProblemsCount }))
    .sort((a, b) => (a.Order || 0) - (b.Order || 0) || a.Id - b.Id);
  // Never infer that an absent API response means everything is Premium.
  // Only the server's verified free-category IDs can lock Free content.
  const unlockedCategories = sortedCategories.filter(category =>
    isPremium || access?.FreeCategoryIds.includes(category.Id));
  const lockedCategories = sortedCategories.filter(category =>
    !isPremium && !access?.FreeCategoryIds.includes(category.Id));
  const readyCount = unlockedCategories.filter(category => (category.ProblemsCount ?? 0) > 0).length;
  const unknownCount = unlockedCategories.filter(category => category.ProblemsCount == null).length;
  
  const otherStages = sortStagesByOrder(stages?.filter(s => s.Id !== stageId) || []);
  const isLoading = stagesLoading || accessLoading || (authenticated && subscriptionLoading);

  if (!stagesLoading && stages && !currentStage) {
    return <section className="container mx-auto flex min-h-[50vh] max-w-2xl flex-col items-center justify-center gap-4 px-4 py-16 text-center" role="alert">
      <AlertCircle aria-hidden="true" className="h-10 w-10 text-primary" />
      <h1 className="text-2xl font-extrabold">
        {locale === 'ar' ? 'المرحلة التعليمية غير موجودة' : 'Educational stage not found'}
      </h1>
      <p className="text-sm text-muted-foreground">
        {locale === 'ar'
          ? 'قد يكون الرابط قديماً أو تغيرت المرحلة. اختر مرحلة من القائمة.'
          : 'This stage may have moved or the link may be outdated. Choose another stage.'}
      </p>
      <Link href="/stages" className="rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground">
        {t('stages.backToStages')}
      </Link>
    </section>;
  }

  if (stagesError || accessError || (!accessLoading && !access) ||
      (authenticated && subscriptionError)) {
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
            <p className="text-xl font-bold">
              {locale === 'ar' ? 'تعذّر التحقق من الفئات المتاحة' : 'Could not verify category access'}
            </p>
            <p className="text-sm text-muted-foreground">
              {locale === 'ar'
                ? 'إذا كانت خدمة التطبيق أحدث من الخادم، ما رح نعتبر الفئات مقفلة أو نطلب اشتراك بدون تأكيد صلاحياتها.'
                : 'If the server is older than the app, we will not invent locked topics or require membership without verified access.'}
            </p>
            <button
              type="button" onClick={() => {
                void refetchStages();
                if (Number.isSafeInteger(stageId) && stageId > 0) void refetchAccess();
                if (authenticated) void refetchSubscription();
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

      <div className="container relative z-10 mx-auto min-w-0 px-4 sm:px-6 lg:px-12">
        
        {/* Header Section */}
        <div className="mb-8 text-center md:mb-12 md:text-start">
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
            
            <h1 className="brand-display-title mb-4 break-words text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-6xl">
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

        {!isLoading && access && (
          <div role="status" className="mb-7 rounded-2xl border border-primary/20 bg-primary/5 p-5">
            <h2 className="text-xl font-extrabold text-foreground">
              {isPremium
                ? (locale === 'ar' ? 'كل فئات مرحلتك مفتوحة' : 'All your stage topics are unlocked')
                : (locale === 'ar' ? 'هاي فئاتك المفتوحة، ابدأ من هون' : 'These are your unlocked topics — start here')}
            </h2>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              {isPremium
                ? (locale === 'ar' ? 'اختر فئة فيها مسائل منشورة وابدأ الحل.' : 'Pick a topic with published questions and start.')
                : (locale === 'ar' ? 'عندك فئتان مفتوحتان مجاناً في كل مرحلة، وتقدر تحل كل مسائلها بلا حد. الفئات المقفلة موجودة بقسم منفصل تحت.' : 'You get two unlocked topics in each stage and unlimited practice in those topics. Other locked topics appear separately below.')}
            </p>
            <p className="mt-2 text-sm font-bold text-primary">
              {locale === 'ar'
                ? `${unlockedCategories.length} فئة مفتوحة · ${readyCount} فيها مسائل منشورة`
                : `${unlockedCategories.length} unlocked · ${readyCount} with published questions`}
            </p>
            {unknownCount > 0 && (
              <p className="mt-3 text-sm text-muted-foreground">
                {locale === 'ar'
                  ? 'عدد المسائل غير متاح من هذا الخادم لبعض الفئات. ممكن تستعرضها وتتحقق من وجود محتوى.'
                  : 'The connected server has not returned a problem count for every topic. You can browse those topics to check.'}
              </p>
            )}
            {readyCount === 0 && unknownCount === 0 && (
              <p className="mt-3 text-sm text-muted-foreground">
                {locale === 'ar'
                  ? 'ما في فئات جاهزة للحل حاليًا. جرّب تحديث البيانات أو اختَر مرحلة ثانية.'
                  : 'No topics are ready to practise right now. Refresh or choose another stage.'}
              </p>
            )}
          </div>
        )}

        {/* Show verified playable topics first; no dead-end or repeated Premium prompts. */}
        {isLoading ? (
          <div role="status" aria-live="polite" className="flex min-h-[30vh] flex-col items-center justify-center gap-3">
            <Loader2 aria-hidden="true" className="h-10 w-10 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">{t('common.loading')}</span>
          </div>
        ) : sortedCategories.length === 0 ? (
          <div className="brand-surface math-card rounded-3xl p-6 text-center sm:p-10" role="status">
            <Filter aria-hidden="true" className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
            <h3 className="mb-3 text-xl font-bold">{t('categories.noCategories')}</h3>
            <p className="text-muted-foreground">{t('categories.noCategoriesDesc')}</p>
            <Link href="/stages" className="mt-5 inline-flex min-h-11 items-center rounded-xl border px-4 py-2 font-semibold">
              {t('stages.backToStages')}
            </Link>
          </div>
        ) : (
          <div className="space-y-10">
            <section aria-labelledby="unlocked-topic-heading">
              <h2 id="unlocked-topic-heading" className="mb-2 text-2xl font-extrabold">
                {locale === 'ar' ? '1. ابدأ بالفئات المفتوحة' : '1. Start with your unlocked topics'}
              </h2>
              <p className="mb-5 text-sm text-muted-foreground">
                {locale === 'ar' ? 'كل فئة عليها زر «ابدأ حل المسائل». الفئات اللي ما فيها مسائل منشورة مو قابلة للفتح.' : 'Tap Start solving to practise. Topics with no published questions do not open an empty list.'}
              </p>
              {unlockedCategories.length === 0 ? (
                <p role="status" className="rounded-xl border bg-card p-5 text-sm">
                  {locale === 'ar'
                    ? 'ما في فئات مفتوحة بحسابك بهالمرحلة حالياً. اطلب من الإدارة التحقق من اختيار الفئتين المجانيتين.'
                    : 'No unlocked topics are configured for this stage. Ask an administrator to check the two Free topic selections.'}
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 lg:gap-6">
                  {unlockedCategories.map((category, index) => (
                    <CategoryPremiumCard
                      key={category.Id}
                      category={category}
                      index={index}
                      math={MATH_CARD_SYMBOLS[category.Id % MATH_CARD_SYMBOLS.length]}
                      style={CATEGORY_BRAND_STYLES[category.Id % CATEGORY_BRAND_STYLES.length]}
                      locale={locale}
                      stageId={stageId}
                      iconUrl={category.Icon}
                      locked={false}
                    />
                  ))}
                </div>
              )}
            </section>
            {lockedCategories.length > 0 && (
              <section aria-labelledby="locked-topic-heading" className="border-t border-border/50 pt-8">
                <h2 id="locked-topic-heading" className="mb-2 text-xl font-bold">
                  {locale === 'ar' ? '2. فئات إضافية مقفلة' : '2. Other locked topics'}
                </h2>
                <p className="mb-5 text-sm text-muted-foreground">
                  {locale === 'ar'
                    ? 'هاي الفئات مو ضمن حسابك المجاني. فيك تشوف تفاصيل الاشتراك بمكان واحد.'
                    : 'These topics are not part of your Free account. See membership benefits in one place.'}
                </p>
                <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 lg:gap-6">
                  {lockedCategories.map((category, index) => (
                    <CategoryPremiumCard
                      key={category.Id}
                      category={category}
                      index={index}
                      math={MATH_CARD_SYMBOLS[category.Id % MATH_CARD_SYMBOLS.length]}
                      style={CATEGORY_BRAND_STYLES[category.Id % CATEGORY_BRAND_STYLES.length]}
                      locale={locale}
                      stageId={stageId}
                      iconUrl={category.Icon}
                      locked
                    />
                  ))}
                </div>
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <Link href="/premium" className="inline-flex min-h-11 items-center rounded-xl border border-primary/30 px-4 py-2 text-sm font-semibold text-primary">
                    {locale === 'ar' ? 'تعرّف على مميزات الاشتراك' : 'View membership benefits'}
                  </Link>
                  <Link href="/dashboard/redeem" className="inline-flex min-h-11 items-center rounded-xl border px-4 py-2 text-sm font-semibold">
                    {locale === 'ar' ? 'عندي كود هدية' : 'I have a gift code'}
                  </Link>
                </div>
              </section>
            )}
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
