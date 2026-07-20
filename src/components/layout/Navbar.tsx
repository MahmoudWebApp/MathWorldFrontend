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
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion'; 
import Image from 'next/image'; 
import { 
  SearchNormal1, Sun1, Moon, CloseCircle, User, Logout, ArrowDown2, Element3, ShieldSecurity, 
  ArrowRight
} from 'iconsax-reactjs';
import {
  BookMarked,
  Boxes,
  ChevronDown,
  CircleCheckBig,
  FunctionSquare,
  Heart,
  Info,
  Layers3,
  LogIn,
  Menu,
  NotebookTabs,
  Pi,
  Search,
  Sigma,
  UserPlus,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { authApi } from '@/store/api/authApi';
import { categoriesApi } from '@/store/api/categoriesApi';
import { problemsApi } from '@/store/api/problemsApi';
import { stagesApi } from '@/store/api/stagesApi';
import { statsApi } from '@/store/api/statsApi';
import { usersApi } from '@/store/api/usersApi';
import { clearAuthSession } from '@/lib/authSession';
import { useSearchParams } from 'next/navigation'; 

// Awesome Geometry icons for stages to replace boring numbers
const stageIcons = [Boxes, Sigma, FunctionSquare, Pi];

function NavbarContent() {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams(); 
  const { theme, setTheme } = useTheme();
  const dispatch = useDispatch<AppDispatch>();

  const { user, isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);
  const { data: stages } = useGetStagesQuery();

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

  const handleLogout = () => {
    dispatch(logout());
    clearAuthSession();
    dispatch(authApi.util.resetApiState());
    dispatch(problemsApi.util.resetApiState());
    dispatch(categoriesApi.util.resetApiState());
    dispatch(stagesApi.util.resetApiState());
    dispatch(statsApi.util.resetApiState());
    dispatch(usersApi.util.resetApiState());
    setUserMenuOpen(false);
    router.push('/');
  };

const toggleLocale = () => {
    const newLocale = locale === 'ar' ? 'en' : 'ar';
    
    // 1. تحديث الكوكيز أولاً لتستخدمه الطلبات القادمة
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    
    // 2. تحديث لغة التطبيق في Redux
    dispatch(setLocale(newLocale));
    
    // 3. مسح الكاش بالكامل من RTK Query لضمان عدم عرض أي بيانات عربية قديمة
    // resetApiState() أقوى من invalidateTags لأنها تمسح البيانات من الذاكرة فوراً
    dispatch(problemsApi.util.resetApiState());
    dispatch(categoriesApi.util.resetApiState());
    dispatch(stagesApi.util.resetApiState());
    
    // 4. استخدام راوتر next-intl لتغيير اللغة بسلاسة بدون Refresh عنيف
    const currentQuery = searchParams.toString();
    const querySuffix = currentQuery ? `?${currentQuery}` : '';
    
    router.replace(`${pathname}${querySuffix}`, { locale: newLocale });
    
    router.refresh();
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
      {/* Scroll Progress Bar at the absolute top */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#53B2D8] via-[#3491C3] to-[#213550] z-[60] origin-left"
        style={{ scaleX, transformOrigin: locale === 'ar' ? 'right' : 'left' }} 
      />

      <header className="sticky top-0 z-50 w-full border-b border-[#CFE2EB] bg-background/85 glass supports-[backdrop-filter]:bg-background/55 dark:border-[#29495D]">
        <nav className="container mx-auto px-6 lg:px-12 flex h-16 items-center justify-between gap-4">
          
          {/* Transparent SVG logo stays clear in both light and dark mode. */}
          <Link
            href="/"
            className="group flex shrink-0 items-center"
            aria-label="MathWorld"
          >
            <Image
              src="/mathworld-logo.svg"
              alt="MathWorld Logo"
              width={148}
              height={88}
              className="h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.03] dark:drop-shadow-[0_3px_14px_#53B2D838]"
              priority
            />
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
            
            {/* Awesome Mega Menu for Stages */}
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
                        <ArrowRight className="h-4 w-4 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                      </Link>
                      
                      <div className="grid grid-cols-2 gap-2">
                        {stages.map((stage, i) => {
                          const Icon = stageIcons[i % stageIcons.length];
                          return (
                            <Link key={stage.Id} href={`/stages/${stage.Id}`} className="group flex items-center gap-3 p-3 rounded-xl hover:bg-primary/5 border border-transparent hover:border-primary/10 transition-all">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                                <Icon className="h-5 w-5" />
                              </div>
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
          <div className="flex items-center gap-2">
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

            <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              {mounted ? (theme === 'dark' ? <Sun1 className="h-5 w-5" /> : <Moon className="h-5 w-5" />) : <div className="h-5 w-5" />}
            </Button>

            <Button variant="ghost" size="sm" className="rounded-full font-bold hover:bg-primary/10 hover:text-primary" onClick={toggleLocale}>
              {locale === 'ar' ? 'EN' : 'عربي'}
            </Button>

            {/* Auth Section */}
            {!mounted || isLoading ? (
              <div className="h-9 w-24 rounded-full bg-muted animate-pulse" />
            ) : isAuthenticated && user ? (
              <div className="relative">
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
                        className="absolute end-0 top-full z-20 mt-2 w-56 rounded-2xl border bg-popover/95 backdrop-blur-xl p-2 shadow-xl"
                      >
                        <div className="px-3 py-2.5 text-xs text-muted-foreground border-b mb-2">{user.Email}</div>
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
                        {user.Role === 'Admin' && (
                          <Link href="/admin" className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-xl hover:bg-primary/10 text-primary transition-colors" onClick={() => setUserMenuOpen(false)}>
                            <ShieldSecurity className="h-4 w-4" />{t('nav.admin')}
                          </Link>
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
                <Button className="rounded-full font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/40" asChild><Link href="/register">{t('nav.register')}</Link></Button>
              </div>
            )}

            <Button variant="ghost" size="icon" className="md:hidden rounded-full" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
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
              className="md:hidden border-t bg-background/95 backdrop-blur-xl px-4 py-4 space-y-3 overflow-hidden"
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
              
              <Link href="/stages" className={cn('flex items-center gap-3 px-4 py-3 rounded-xl font-semibold', isStagesActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted')} onClick={() => setMobileMenuOpen(false)}>
                <BookMarked className="h-5 w-5" />
                {t('nav.stages')}
              </Link>

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

                  {user.Role === 'Admin' && (
                    <Link href="/admin" className="flex items-center gap-3 rounded-xl px-4 py-3 font-semibold text-primary hover:bg-primary/10" onClick={() => setMobileMenuOpen(false)}>
                      <ShieldSecurity className="h-5 w-5" />
                      {t('nav.admin')}
                    </Link>
                  )}

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