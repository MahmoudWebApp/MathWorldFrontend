"use client";

import { useState, useEffect, Suspense } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useTheme } from 'next-themes';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { useSelector, useDispatch } from 'react-redux';
import type { AppDispatch, RootState } from '@/store';
import { logout } from '@/store/slices/authSlice';
import { setLocale } from '@/store/slices/localeSlice';
 import { useGetStudentSubscriptionQuery } from '@/store/api/categoriesApi';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion'; 
import { 
  SearchNormal1, CloseCircle, User, Logout, ArrowDown2, Element3,
} from 'iconsax-reactjs';
import {
  BookMarked,
  ChevronDown,
   CircleCheckBig,
  Heart,
  Layers3,
  Menu,
  NotebookTabs,
  Search,
  Sun,
  Moon,
  Monitor,
  Settings2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { BrandLogo } from '@/components/layout/BrandLogo';
import { NotificationBell } from '@/components/layout/NotificationBell';
import { NotificationRealtimeSync } from '@/components/layout/NotificationRealtimeSync';
import { StudentPresenceHeartbeat } from '@/components/layout/StudentPresenceHeartbeat';
import { notificationsApi } from '@/store/api/notificationsApi';
import { ADMIN_NAV_ITEMS, AdminNavMobile } from '@/components/admin/AdminNavigation';
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
  
function NavbarContent() {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams(); 
  const dispatch = useDispatch<AppDispatch>();
  const { theme, resolvedTheme, setTheme } = useTheme();

  const { user, isAuthenticated, isLoading, token } = useSelector((state: RootState) => state.auth);
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
 
  // Scroll Progress Bar
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    setMounted(true);
    dispatch(setLocale(locale));
  }, [dispatch, locale]);

  useEffect(() => {
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

  // The public website and the learner/admin workspaces share this one domain,
  // but expose purpose-built navigation instead of one mixed list of links.
  const adminArea = pathname === '/admin' || pathname.startsWith('/admin/');
  const learnerArea = pathname === '/dashboard' || pathname.startsWith('/dashboard/') ||
    pathname === '/learning-stage' || pathname.startsWith('/journey') ||
    pathname.startsWith('/social-accounts') ||
    (user?.Role === 'Student' && (pathname.startsWith('/problems') || pathname.startsWith('/stages/')));
  const portalArea = adminArea || learnerArea;
  const portalLanding = user?.Role === 'Admin' ? '/admin' : '/dashboard';
  const navItems = adminArea ? [
    { href: '/admin', ar: 'لوحة الإدارة', en: 'Admin home' },
    { href: '/admin/users', ar: 'الطلاب', en: 'Learners' },
    { href: '/admin/stages', ar: 'المراحل', en: 'Stages' },
    { href: '/admin/categories', ar: 'الفئات', en: 'Categories' },
    { href: '/admin/problems', ar: 'المسائل', en: 'Problems' },
  ] : learnerArea ? [
    { href: '/dashboard', ar: 'لوحتي', en: 'My dashboard' },
    { href: user?.CurrentStageId ? `/stages/${user.CurrentStageId}` : '/learning-stage', ar: 'تابع التعلم', en: 'Continue learning' },
    { href: '/dashboard/favorites', ar: 'المفضلة', en: 'Favorites' },
    { href: '/dashboard/analytics', ar: 'تقدّمي', en: 'My progress' },
    { href: '/premium', ar: hasUpgraded ? 'مميزات حسابي' : 'ترقية الحساب', en: hasUpgraded ? 'My benefits' : 'Upgrade' },
  ] : [
    { href: '/', ar: 'الرئيسية', en: 'Home' },
    { href: '/stages', ar: 'المراحل والفئات', en: 'Stages & topics' },
    { href: '/premium', ar: 'Free و Premium', en: 'Free vs Premium' },
    { href: '/about', ar: 'عن المنصة', en: 'About' },
  ];

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
            href={portalArea ? portalLanding : '/'}
            className="group flex shrink-0 items-center rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="MathWorld"
          >
            <BrandLogo compact className="transition-transform duration-300 group-hover:scale-[1.025]" />
          </Link>

          {/* Public, learner and admin have independent menu choices. */}
          <div className="hidden min-w-0 flex-1 items-center justify-center gap-1 lg:flex">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}
                className={cn('whitespace-nowrap rounded-xl px-3 py-2 text-sm font-semibold transition-colors',
                  pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href + '/'))
                    ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground')}>
                {locale === 'ar' ? item.ar : item.en}
              </Link>
            ))}
            {(portalArea || (mounted && isAuthenticated)) && <Link href={portalArea ? '/' : portalLanding}
              className="whitespace-nowrap rounded-xl border border-primary/25 px-3 py-2 text-sm font-bold text-primary hover:bg-primary/10">
              {portalArea ? (locale === 'ar' ? 'الذهاب إلى الموقع' : 'Visit website')
                : (locale === 'ar' ? 'لوحة التحكم' : 'Go to dashboard')}
            </Link>}
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

            <Button variant="ghost" size="sm" aria-label={locale === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'} className="h-9 shrink-0 rounded-full px-2 font-bold hover:bg-primary/10 hover:text-primary sm:px-3" onClick={toggleLocale}>
              {locale === 'ar' ? 'EN' : 'عربي'}
            </Button>

            {/* The device/browser preference is the default; a user may choose
                Light or Dark explicitly, then switch back to System anytime. */}
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-primary/10 sm:h-10 sm:w-10">
              {mounted && resolvedTheme === 'dark'
                ? <Moon aria-hidden="true" className="h-5 w-5 text-foreground" />
                : mounted
                  ? <Sun aria-hidden="true" className="h-5 w-5 text-foreground" />
                  : <Monitor aria-hidden="true" className="h-5 w-5 text-muted-foreground" />}
              <select
                aria-label={locale === 'ar' ? 'مظهر الموقع: تلقائي أو فاتح أو داكن' : 'Site appearance: system, light or dark'}
                title={locale === 'ar' ? 'تغيير مظهر الموقع' : 'Change site appearance'}
                value={mounted ? (theme ?? 'system') : 'system'}
                disabled={!mounted}
                onChange={(event) => setTheme(event.target.value)}
                className="absolute inset-0 h-full w-full cursor-pointer appearance-none rounded-full opacity-0"
              >
                <option value="system">{locale === 'ar' ? 'حسب الجهاز' : 'System'}</option>
                <option value="light">{locale === 'ar' ? 'فاتح' : 'Light'}</option>
                <option value="dark">{locale === 'ar' ? 'داكن' : 'Dark'}</option>
              </select>
            </div>

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
                              {locale === 'ar' ? 'لوحة الإدارة' : 'Admin dashboard'}
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

            <Button variant="ghost" size="icon" aria-label={locale === 'ar' ? (mobileMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة') : (mobileMenuOpen ? 'Close menu' : 'Open menu')} aria-controls="mathworld-mobile-menu" aria-expanded={mobileMenuOpen} className="h-9 w-9 shrink-0 rounded-full lg:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <CloseCircle className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </nav>

        {/* Compact navigation stays within the current public/learner/admin space. */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} id="mathworld-mobile-menu"
              className="max-h-[calc(100dvh-4rem)] space-y-2 overflow-y-auto border-t bg-background/95 px-4 py-4 backdrop-blur-xl lg:hidden">
              <p className="px-3 text-xs font-bold text-muted-foreground">
                {adminArea ? (locale === 'ar' ? 'قائمة الإدارة' : 'Admin menu')
                  : learnerArea ? (locale === 'ar' ? 'قائمة الطالب' : 'Learner menu')
                    : (locale === 'ar' ? 'الموقع العام' : 'Public website')}
              </p>
              {navItems.map(item => (
                <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}
                  className={cn('flex min-h-11 items-center rounded-xl px-4 py-3 text-sm font-semibold',
                    pathname === item.href ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted')}>
                  {locale === 'ar' ? item.ar : item.en}
                </Link>
              ))}
              {adminArea && <AdminNavMobile onNavigate={() => setMobileMenuOpen(false)} />}
              {(portalArea || (mounted && isAuthenticated)) && <Link href={portalArea ? '/' : portalLanding} onClick={() => setMobileMenuOpen(false)}
                className="flex min-h-11 items-center rounded-xl border border-primary/25 px-4 py-3 text-sm font-bold text-primary">
                {portalArea ? (locale === 'ar' ? 'العودة إلى الموقع' : 'Back to website')
                  : (locale === 'ar' ? 'الذهاب إلى لوحة التحكم' : 'Go to dashboard')}
              </Link>}
              {isAuthenticated && user ? (
                <>
                  <div className="mt-2 border-t px-4 py-3 text-xs text-muted-foreground">{user.Email}</div>
                  <button type="button" onClick={() => { setMobileMenuOpen(false); void handleLogout(); }}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 font-semibold text-destructive hover:bg-destructive/10">
                    <Logout className="h-5 w-5" />{t('nav.logout')}
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3 border-t pt-3">
                  <Button variant="outline" asChild><Link href="/login" onClick={() => setMobileMenuOpen(false)}>{t('nav.login')}</Link></Button>
                  <Button asChild><Link href="/register" onClick={() => setMobileMenuOpen(false)}>{t('nav.register')}</Link></Button>
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