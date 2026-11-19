"use client";

import { useState, useEffect, useRef, Suspense } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { useTheme } from 'next-themes';
import { useSelector, useDispatch } from 'react-redux';
import type { AppDispatch, RootState } from '@/store';
import { logout } from '@/store/slices/authSlice';
import { setLocale } from '@/store/slices/localeSlice';
import { useGetStagesQuery } from '@/store/api/stagesApi';
import { useGetStudentSubscriptionQuery } from '@/store/api/categoriesApi';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion'; 
import { 
  SearchNormal1, Sun1, Moon, CloseCircle, User, Logout, ArrowDown2, Element3,
} from 'iconsax-reactjs';
import {
  BookMarked,
  ChevronDown,
  CircleCheckBig,
  Heart,
  Info,
  Layers3,
  LogIn,
  Menu,
  NotebookTabs,
  Search,
  Settings2,
  UserPlus,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { BrandLogo } from '@/components/layout/BrandLogo';
import { NotificationBell } from '@/components/layout/NotificationBell';
import { NotificationRealtimeSync } from '@/components/layout/NotificationRealtimeSync';
import { StudentPresenceHeartbeat } from '@/components/layout/StudentPresenceHeartbeat';
import { notificationsApi } from '@/store/api/notificationsApi';
import { ADMIN_NAV_ITEMS, AdminNavMobile } from '@/components/admin/AdminNavigation';
import { DirectionalArrow } from '@/components/ui/DirectionalNavigation';
import { cn } from '@/lib/utils';
import { authApi } from '@/store/api/authApi';
import { categoriesApi } from '@/store/api/categoriesApi';
import { problemsApi } from '@/store/api/problemsApi';
import { stagesApi } from '@/store/api/stagesApi';
import { statsApi } from '@/store/api/statsApi';
import { usersApi } from '@/store/api/usersApi';
import { clearAuthSession } from '@/lib/authSession';
import { API_BASE_URL } from '@/store/api/baseQuery';
import { useSearchParams } from 'next/navigation';
import { StageIconBadge } from '@/components/stages/StageIconBadge';
import { sortStagesByOrder } from '@/lib/stageVisuals';

function NavbarContent() {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams(); 
  const { theme, setTheme } = useTheme();
  const dispatch = useDispatch<AppDispatch>();

  const { user, isAuthenticated, isLoading, token } = useSelector((state: RootState) => state.auth);
  const { data: stages } = useGetStagesQuery(locale, { refetchOnMountOrArgChange: true });
  const orderedStages = sortStagesByOrder(stages ?? []);
  const { data: subscription } = useGetStudentSubscriptionQuery(undefined, {
    skip: !isAuthenticated || user?.Role !== 'Student',
    refetchOnMountOrArgChange: true,
  });
  const hasUpgraded = subscription?.IsPremium === true;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [navSearch, setNavSearch] = useState('');
  const [mounted, setMounted] = useState(false);
  const [stagesMenuOpen, setStagesMenuOpen] = useState(false);
  const stagesMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Scroll Progress Bar
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    setMounted(true);
    dispatch(setLocale(locale));
  }, [dispatch, locale]);

  const handleStagesMouseEnter = () => {
    if (stagesMenuTimeoutRef.current) clearTimeout(stagesMenuTimeoutRef.current);
    setStagesMenuOpen(true);
  };

  const handleStagesMouseLeave = () => {
    stagesMenuTimeoutRef.current = setTimeout(() => setStagesMenuOpen(false), 200);
  };

  useEffect(() => {
    setStagesMenuOpen(false);
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
    setShowSearch(false);
  }, [pathname]);

  const handleLogout = async () => {
    // Explicit sign-out audit is best-effort. Local session removal must
    // always work even if offline or if the server endpoint is not deployed.
    try {
      if (token) {
        const controller = new AbortController();
        const timer = window.setTimeout(() => controller.abort(), 1200);
        try {
          await fetch(`${API_BASE_URL}/users/session/sign-out`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
            signal: controller.signal,
          });
        } finally {
          window.clearTimeout(timer);
        }
      }
    } catch {
      // Closing a browser is never described as a verified server logout.
    }
    dispatch(logout());
    clearAuthSession();
    dispatch(authApi.util.resetApiState());
    dispatch(problemsApi.util.resetApiState());
    dispatch(categoriesApi.util.resetApiState());
    dispatch(stagesApi.util.resetApiState());
    dispatch(statsApi.util.resetApiState());
    dispatch(usersApi.util.resetApiState());
    dispatch(notificationsApi.util.resetApiState());
    setUserMenuOpen(false);
    router.push('/');
  };

  const toggleLocale = () => {
    const newLocale = locale === 'ar' ? 'en' : 'ar';
    
    // FIX: Set the NEXT_LOCALE cookie explicitly BEFORE calling window.location.assign.
    // This ensures that when the page reloads, the new API calls read the correct language cookie immediately.
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    
    dispatch(setLocale(newLocale));

    // Clear localized API responses before loading the other language.
    // This prevents Arabic API data from appearing on English pages and vice versa.
    dispatch(problemsApi.util.resetApiState());
    dispatch(categoriesApi.util.resetApiState());
    dispatch(stagesApi.util.resetApiState());
    dispatch(statsApi.util.resetApiState());
    dispatch(usersApi.util.resetApiState());
    dispatch(notificationsApi.util.resetApiState());

    const currentQuery = searchParams.toString();
    const newPath = currentQuery ? `${pathname}?${currentQuery}` : pathname;
    
    // Hard refresh to the new locale URL
    window.location.assign(`/${newLocale}${newPath}`);
  };

  const handleNavSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (navSearch.trim()) {
      router.push(`/problems?q=${encodeURIComponent(navSearch.trim())}`);
      setNavSearch('');
      setShowSearch(false);
    }
  };

  const isStagesActive = pathname.startsWith('/stages');
  const isAboutActive = pathname.startsWith('/about');

  return (
    <>
      {mounted && isAuthenticated && token && user?.Role === 'Student' &&
        <StudentPresenceHeartbeat token={token} />}
      {mounted && isAuthenticated && token && <NotificationRealtimeSync token={token} />}
      {/* Scroll Progress Bar at the absolute top */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-primary via-brand-primary-light to-brand-secondary z-[60] origin-left shadow-[0_0_18px_rgba(92,36,255,0.38)]"
        style={{ scaleX, transformOrigin: locale === 'ar' ? 'right' : 'left' }} 
      />

      <header className="sticky top-0 z-50 w-full border-b border-brand-primary/10 bg-background/85 glass supports-[backdrop-filter]:bg-background/55 dark:border-brand-primary/20">
        <nav className="container mx-auto flex h-16 min-w-0 items-center justify-between gap-1.5 px-3 sm:gap-3 sm:px-6 lg:px-12">
          
          <Link
            href="/"
            className="group flex shrink-0 items-center rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="MathWorld"
          >
            <BrandLogo compact className="transition-transform duration-300 group-hover:scale-[1.025]" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2 flex-1 justify-center">
            <Link
              href="/"
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300',
                pathname === '/' ? 'bg-primary/10 text-primary shadow-inner' : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
              )}
            >
              {t('nav.home')}
            </Link>
            
            {user?.Role === 'Student' && user.CurrentStageId ? (
              <Link href={`/stages/${user.CurrentStageId}`}
                className={cn('rounded-xl px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted/80',
                  isStagesActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground')}>
                {locale === 'ar' ? 'فئات مرحلتي' : 'My stage topics'}
              </Link>
            ) : (
            <div className="relative" onMouseEnter={handleStagesMouseEnter} onMouseLeave={handleStagesMouseLeave}>
              <Link
                href="/stages"
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-1.5',
                  isStagesActive ? 'bg-primary/10 text-primary shadow-inner' : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
                )}
              >
                {t('nav.stages')}
                <ChevronDown className={cn('h-4 w-4 transition-transform duration-300', stagesMenuOpen && 'rotate-180')} />
              </Link>

           <AnimatePresence>
                {stagesMenuOpen && stages && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="absolute top-full start-1/2 -translate-x-1/2 rtl:translate-x-1/2 mt-3 w-[400px] rounded-2xl border bg-popover/95 backdrop-blur-xl p-3 shadow-2xl overflow-hidden"
                  >
                    {/* Math Grid Background inside dropdown */}
                    <div className="absolute inset-0 math-grid-bg opacity-10 pointer-events-none" />
                    
                    <div className="relative z-10">
                      <Link href="/stages" className="flex items-center justify-between px-4 py-3 bg-muted/50 rounded-xl hover:bg-primary/10 hover:text-primary transition-colors mb-3 group">
                        <span className="font-bold">{t('stages.allStages')}</span>
                        <DirectionalArrow direction="forward" className="h-4 w-4 transition-transform group-hover:scale-110" />
                      </Link>
                      
                      <div className="grid grid-cols-2 gap-2">
                        {orderedStages.map((stage) => {
                          return (
                            <Link key={stage.Id} href={`/stages/${stage.Id}`} className="group flex items-center gap-3 p-3 rounded-xl hover:bg-primary/5 border border-transparent hover:border-primary/10 transition-all">
                              <StageIconBadge
                                stage={stage}
                                size="sm"
                                className="transition-all duration-300 group-hover:scale-110 group-hover:shadow-md"
                              />
                              <span className="text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                                {locale === 'ar' ? stage.NameAr : stage.NameEn}
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            )}
            <Link
              href="/about"
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300',
                isAboutActive ? 'bg-primary/10 text-primary shadow-inner' : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
              )}
            >
              {t('nav.about')}
            </Link>
          </div>

          {/* Actions & Search */}
          <div className="flex min-w-0 shrink-0 items-center gap-1 sm:gap-2">
            <div className="hidden md:flex items-center">
              <AnimatePresence mode="wait">
                {showSearch ? (
                  <motion.form 
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 220, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className="relative flex items-center overflow-hidden mr-2"
                    onSubmit={handleNavSearch}
                  >
                    <Search className="absolute start-3 h-4 w-4 text-primary" />
                    <input
                      autoFocus
                      type="text"
                      value={navSearch}
                      onChange={(e) => setNavSearch(e.target.value)}
                      placeholder={t('search.placeholder')}
                      className="w-full ps-9 pe-8 py-2 rounded-full border border-primary/30 bg-primary/5 text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                    <button type="button" onClick={() => setShowSearch(false)} className="absolute end-2 text-muted-foreground hover:text-foreground">
                      <CloseCircle className="h-4 w-4" />
                    </button>
                  </motion.form>
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary" onClick={() => setShowSearch(true)}>
                      <SearchNormal1 className="h-5 w-5" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Button variant="ghost" size="icon" aria-label={theme === 'dark' ? (locale === 'ar' ? 'الوضع النهاري' : 'Light mode') : (locale === 'ar' ? 'الوضع الليلي' : 'Dark mode')} className="h-9 w-9 shrink-0 rounded-full hover:bg-primary/10 hover:text-primary sm:h-10 sm:w-10" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              {mounted ? (theme === 'dark' ? <Sun1 className="h-5 w-5" /> : <Moon className="h-5 w-5" />) : <div className="h-5 w-5" />}
            </Button>

            <Button variant="ghost" size="sm" aria-label={locale === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'} className="h-9 shrink-0 rounded-full px-2 font-bold hover:bg-primary/10 hover:text-primary sm:px-3" onClick={toggleLocale}>
              {locale === 'ar' ? 'EN' : 'عربي'}
            </Button>

            {mounted && isAuthenticated && <NotificationBell isAuthenticated={isAuthenticated} />}

            {/* Auth Section */}
            {!mounted || isLoading ? (
              <div className="hidden h-9 w-24 animate-pulse rounded-full bg-muted md:block" />
            ) : isAuthenticated && user ? (
              <div className="relative hidden md:block">
                <Button variant="outline" className="flex items-center gap-2 rounded-full border-primary/20 hover:bg-primary/5 hover:border-primary/50" onClick={() => setUserMenuOpen(!userMenuOpen)}>
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20">
                    <User className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="hidden sm:inline text-sm font-semibold">
                    {user.FullName || user.Email?.split('@')[0] || t('nav.user')}
                  </span>
                  <ArrowDown2 className="h-4 w-4 text-muted-foreground" />
                </Button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className={cn("absolute end-0 top-full z-20 mt-2 max-h-[min(75vh,680px)] overflow-y-auto overscroll-contain rounded-2xl border bg-popover/95 backdrop-blur-xl p-2 shadow-xl", user.Role === 'Admin' ? "w-[min(90vw,360px)]" : "w-56")}
                      >
                        <div className="px-3 py-2.5 text-xs text-muted-foreground border-b mb-2">{user.Email}</div>
                        {user.Role === 'Admin' && (
                          <nav aria-label={locale === 'ar' ? 'تنقل الأدمن' : 'Admin navigation'} className="space-y-1">
                            <div className="px-3 pb-1 text-xs font-bold text-muted-foreground">
                              {locale === 'ar' ? 'مراقبة المنصة' : 'Monitor platform'}
                            </div>
                            {ADMIN_NAV_ITEMS.filter(item => item.group === 'overview').map(item => (
                              <Link key={item.href} href={item.href}
                                onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold hover:bg-primary/10 hover:text-primary">
                                <item.icon className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                                {locale === 'ar' ? item.labelAr : item.labelEn}
                              </Link>
                            ))}
                            <div className="mx-2 my-2 border-t" />
                            <details className="group rounded-xl">
                              <summary className="flex cursor-pointer list-none items-center justify-between rounded-xl px-3 py-2.5 text-sm font-bold hover:bg-muted [&::-webkit-details-marker]:hidden">
                                {locale === 'ar' ? 'إدارة الطلاب والاشتراكات' : 'Learners & access'}
                                <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden />
                              </summary>
                              <div className="ps-2">
                            {ADMIN_NAV_ITEMS.filter(item => item.group === 'management').map(item => (
                              <Link key={item.href} href={item.href}
                                onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold hover:bg-primary/10 hover:text-primary">
                                <item.icon className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                                {locale === 'ar' ? item.labelAr : item.labelEn}
                              </Link>
                            ))}
                              </div>
                            </details>
                            <div className="mx-2 my-2 border-t" />
                            <details className="group rounded-xl">
                              <summary className="flex cursor-pointer list-none items-center justify-between rounded-xl px-3 py-2.5 text-sm font-bold hover:bg-muted [&::-webkit-details-marker]:hidden">
                                {locale === 'ar' ? 'إدارة المحتوى التعليمي' : 'Learning content'}
                                <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden />
                              </summary>
                              <div className="ps-2">
                            {ADMIN_NAV_ITEMS.filter(item => item.group === 'content').map(item => (
                              <Link key={item.href} href={item.href}
                                onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold hover:bg-primary/10 hover:text-primary">
                                <item.icon className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                                {locale === 'ar' ? item.labelAr : item.labelEn}
                              </Link>
                            ))}
                              </div>
                            </details>
                            <div className="mx-2 my-2 border-t" />
                          </nav>
                        )}
                        {user.Role !== 'Admin' && (
                          <>

                        <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-xl hover:bg-primary/10 hover:text-primary transition-colors" onClick={() => setUserMenuOpen(false)}>
                          <Element3 className="h-4 w-4" />{t('nav.dashboard')}
                        </Link>
                        <Link href="/dashboard/favorites" className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-xl hover:bg-primary/10 hover:text-primary transition-colors" onClick={() => setUserMenuOpen(false)}>
                          <Heart className="h-4 w-4" />{t('nav.favorites')}
                        </Link>
                        <Link href="/dashboard/solved" className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-xl hover:bg-primary/10 hover:text-primary transition-colors" onClick={() => setUserMenuOpen(false)}>
                          <CircleCheckBig className="h-4 w-4" />{t('nav.solved')}
                        </Link>
                        <Link href="/dashboard/error-notebook" className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-xl hover:bg-primary/10 hover:text-primary transition-colors" onClick={() => setUserMenuOpen(false)}>
                          <NotebookTabs className="h-4 w-4" />{t('nav.errorNotebook')}
                        </Link>
                        {hasUpgraded && <Link href="/daily-challenge" className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-primary/10 hover:text-primary transition-colors" onClick={() => setUserMenuOpen(false)}>
                          <CircleCheckBig className="h-4 w-4" />
                          {locale === 'ar' ? 'تحدي اليوم' : 'Daily challenge'}
                        </Link>}
                        <Link href="/journey" className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-primary/10 hover:text-primary transition-colors" onClick={() => setUserMenuOpen(false)}>
                          <Layers3 className="h-4 w-4" />
                          {locale === 'ar' ? 'رحلتي في الرياضيات' : 'My learning journey'}
                        </Link>
                        <Link href="/premium" className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-primary/10 hover:text-primary transition-colors" onClick={() => setUserMenuOpen(false)}>
                          <BookMarked className="h-4 w-4" />
                          {locale === 'ar' ? 'ترقية الحساب ومميزاته' : 'Account benefits & upgrade'}
                        </Link>
                        <Link href="/dashboard/settings" className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-primary/10 hover:text-primary" onClick={() => setUserMenuOpen(false)}>
                          <Settings2 className="h-4 w-4" />
                          {locale === 'ar' ? 'إعدادات الحساب' : 'Account settings'}
                        </Link>
                        <Link href="/learning-stage"
                          className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-primary/10 hover:text-primary"
                          onClick={() => setUserMenuOpen(false)}>
                          <BookMarked className="h-4 w-4" />
                          {locale === 'ar' ? 'تغيير المرحلة التعليمية' : 'Change learning stage'}
                        </Link>
                          </>
                        )}
                        <button onClick={handleLogout} className="flex w-full items-center gap-2 px-3 py-2.5 mt-1 text-sm font-medium rounded-xl hover:bg-destructive/10 text-destructive transition-colors">
                          <Logout className="h-4 w-4" />{t('nav.logout')}
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Button variant="ghost" className="rounded-full font-semibold" asChild><Link href="/login">{t('nav.login')}</Link></Button>
                <Button className="sr-cta-ring rounded-full px-5 font-semibold" asChild><Link href="/register">{t('nav.register')}</Link></Button>
              </div>
            )}

            <Button variant="ghost" size="icon" aria-label={locale === 'ar' ? (mobileMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة') : (mobileMenuOpen ? 'Close menu' : 'Open menu')} aria-controls="mathworld-mobile-menu" aria-expanded={mobileMenuOpen} className="h-9 w-9 shrink-0 rounded-full md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <CloseCircle className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </nav>

        {/* Mobile Menu with Framer Motion */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              id="mathworld-mobile-menu"
              className="max-h-[calc(100dvh-4rem)] space-y-3 overflow-y-auto overscroll-contain border-t bg-background/95 px-4 py-4 backdrop-blur-xl md:hidden"
            >
              {/* Mobile Search */}
              <form onSubmit={handleNavSearch} className="relative mb-4">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                <input type="text" value={navSearch} onChange={(e) => setNavSearch(e.target.value)}
                  placeholder={t('search.placeholder')}
                  className="w-full ps-10 pe-4 py-3 rounded-xl border-2 border-primary/20 bg-primary/5 text-base outline-none focus:border-primary transition-colors" />
              </form>

              <Link href="/" className={cn('flex items-center gap-3 px-4 py-3 rounded-xl font-semibold', pathname === '/' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted')} onClick={() => setMobileMenuOpen(false)}>
                <Layers3 className="h-5 w-5" />
                {t('nav.home')}
              </Link>
              
              {user?.Role === 'Student' && user.CurrentStageId ? (
                <Link href={`/stages/${user.CurrentStageId}`}
                  className={cn('flex items-center gap-3 rounded-xl px-4 py-3 font-semibold',
                    isStagesActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted')}
                  onClick={() => setMobileMenuOpen(false)}>
                  <BookMarked className="h-5 w-5" />
                  {locale === 'ar' ? 'فئات مرحلتي' : 'My stage topics'}
                </Link>
              ) : (
                <>
              <Link href="/stages" className={cn('flex items-center gap-3 px-4 py-3 rounded-xl font-semibold', isStagesActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted')} onClick={() => setMobileMenuOpen(false)}>
                <BookMarked className="h-5 w-5" />
                {t('nav.stages')}
              </Link>

              {orderedStages.length > 0 && (
                <div className="grid grid-cols-2 gap-2 rounded-2xl border border-border/60 bg-muted/20 p-2">
                  {orderedStages.map((stage) => (
                    <Link
                      key={stage.Id}
                      href={`/stages/${stage.Id}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex min-w-0 items-center gap-2 rounded-xl px-2.5 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-background/80 hover:text-foreground"
                    >
                      <StageIconBadge stage={stage} size="sm" className="h-9 w-9 rounded-lg" />
                      <span className="truncate">{locale === 'ar' ? stage.NameAr : stage.NameEn}</span>
                    </Link>
                  ))}
                </div>
              )}

                </>
              )}
              <Link href="/about" className={cn('flex items-center gap-3 px-4 py-3 rounded-xl font-semibold', isAboutActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted')} onClick={() => setMobileMenuOpen(false)}>
                <Info className="h-5 w-5" />
                {t('nav.about')}
              </Link>

              <div className="my-2 h-px bg-border" />

              {!mounted || isLoading ? (
                <div className="h-24 animate-pulse rounded-xl bg-muted" />
              ) : isAuthenticated && user ? (
                <div className="space-y-2">
                  <div className="rounded-xl border bg-muted/30 px-4 py-3">
                    <p className="truncate text-sm font-semibold">
                      {user.FullName || user.Email?.split('@')[0] || t('nav.user')}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{user.Email}</p>
                  </div>

                  {user.Role !== 'Admin' && (
                    <>

                  <Link href="/dashboard" className="flex items-center gap-3 rounded-xl px-4 py-3 font-semibold text-muted-foreground hover:bg-muted hover:text-foreground" onClick={() => setMobileMenuOpen(false)}>
                    <Element3 className="h-5 w-5" />
                    {t('nav.dashboard')}
                  </Link>
                  <Link href="/dashboard/favorites" className="flex items-center gap-3 rounded-xl px-4 py-3 font-semibold text-muted-foreground hover:bg-muted hover:text-foreground" onClick={() => setMobileMenuOpen(false)}>
                    <Heart className="h-5 w-5" />
                    {t('nav.favorites')}
                  </Link>
                  <Link href="/dashboard/solved" className="flex items-center gap-3 rounded-xl px-4 py-3 font-semibold text-muted-foreground hover:bg-muted hover:text-foreground" onClick={() => setMobileMenuOpen(false)}>
                    <CircleCheckBig className="h-5 w-5" />
                    {t('nav.solved')}
                  </Link>
                  <Link href="/dashboard/error-notebook" className="flex items-center gap-3 rounded-xl px-4 py-3 font-semibold text-muted-foreground hover:bg-muted hover:text-foreground" onClick={() => setMobileMenuOpen(false)}>
                    <NotebookTabs className="h-5 w-5" />
                    {t('nav.errorNotebook')}
                  </Link>
                  <Link href="/dashboard/settings" className="flex items-center gap-3 rounded-xl px-4 py-3 font-semibold text-muted-foreground hover:bg-muted hover:text-foreground" onClick={() => setMobileMenuOpen(false)}>
                    <Settings2 className="h-5 w-5" />
                    {locale === 'ar' ? 'إعدادات الحساب' : 'Account settings'}
                  </Link>
                  <Link href="/learning-stage"
                    className="flex items-center gap-3 rounded-xl px-4 py-3 font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
                    onClick={() => setMobileMenuOpen(false)}>
                    <BookMarked className="h-5 w-5" />
                    {locale === 'ar' ? 'تغيير المرحلة التعليمية' : 'Change learning stage'}
                  </Link>

                    </>
                  )}
                  {user.Role === 'Admin' && <AdminNavMobile onNavigate={() => setMobileMenuOpen(false)} />}

                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 font-semibold text-destructive hover:bg-destructive/10"
                  >
                    <Logout className="h-5 w-5" />
                    {t('nav.logout')}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="gap-2 rounded-xl" asChild>
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                      <LogIn className="h-4 w-4" />
                      {t('nav.login')}
                    </Link>
                  </Button>
                  <Button className="gap-2 rounded-xl" asChild>
                    <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                      <UserPlus className="h-4 w-4" />
                      {t('nav.register')}
                    </Link>
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}

export function Navbar() {
  return (
    <Suspense 
      fallback={<header className="sticky top-0 z-50 w-full h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" />}
    >
      <NavbarContent />
    </Suspense>
  );
}