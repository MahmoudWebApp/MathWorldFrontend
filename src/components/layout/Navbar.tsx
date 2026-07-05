"use client";

import { useState, useEffect, useRef, Suspense } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { useTheme } from 'next-themes';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { logout } from '@/store/slices/authSlice';
import { setLocale } from '@/store/slices/localeSlice';
import { useGetStagesQuery } from '@/store/api/stagesApi';
import { 
  SearchNormal1, 
  Sun1, 
  Moon, 
  CloseCircle, 
  User, 
  Logout,
  ArrowDown2,
  Element3,
  ShieldSecurity,
} from 'iconsax-reactjs';
import { Menu, Search, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { problemsApi } from '@/store/api/problemsApi';
import { categoriesApi } from '@/store/api/categoriesApi';
import { useSearchParams } from 'next/navigation'; 

function NavbarContent() {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams(); 
  const { theme, setTheme } = useTheme();
  const dispatch = useDispatch();

  const { user, isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);
  const { data: stages } = useGetStagesQuery();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [navSearch, setNavSearch] = useState('');
  const [mounted, setMounted] = useState(false); // [CHANGED] Added mounted flag to prevent hydration mismatch
  const [stagesMenuOpen, setStagesMenuOpen] = useState(false);
  const stagesMenuRef = useRef<HTMLDivElement>(null);
  const stagesMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true); // [CHANGED] Set mounted to true after client-side hydration completes
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
  }, [pathname]);

  const handleLogout = () => {
    dispatch(logout());
    document.cookie = 'token=; path=/; max-age=0';
    document.cookie = 'userRole=; path=/; max-age=0';
    setUserMenuOpen(false);
    router.push('/');
  };

  const toggleLocale = () => {
    const newLocale = locale === 'ar' ? 'en' : 'ar';
    dispatch(setLocale(newLocale));
    dispatch(problemsApi.util.invalidateTags(['Problem', 'Category']));
    dispatch(categoriesApi.util.invalidateTags(['Category']));
    const currentQuery = searchParams.toString();
    const newPath = currentQuery ? `${pathname}?${currentQuery}` : pathname;
    
    router.replace(newPath as any, { locale: newLocale });
  };

  const handleNavSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (navSearch.trim()) {
      router.push(`/problems?q=${encodeURIComponent(navSearch.trim())}`);
      setNavSearch('');
      setShowSearch(false);
    }
  };

  const navLinks = [
    { href: '/', label: t('nav.home') },
  ];

  const isStagesActive = pathname.startsWith('/stages');
  const isAboutActive = pathname.startsWith('/about');

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto px-12 flex h-16 items-center justify-between sm:gap-4 gap-2">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-xl">
            M
          </div>
          <span className="text-xl font-bold">MathWorld</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                pathname === link.href 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              {link.label}
            </Link>
          ))}
          
          {/* Stages Dropdown */}
          <div 
            className="relative"
            ref={stagesMenuRef}
            onMouseEnter={handleStagesMouseEnter}
            onMouseLeave={handleStagesMouseLeave}
          >
            <div className="flex items-center">
              <Link
                href="/stages"
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1',
                  isStagesActive 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
              >
                {t('nav.stages')}
                <ChevronDown className={cn(
                  'h-3.5 w-3.5 transition-transform duration-200',
                  stagesMenuOpen && 'rotate-180'
                )} />
              </Link>
            </div>

            {stagesMenuOpen && stages && stages.length > 0 && (
              <div 
                className="absolute top-full start-0 mt-1 w-56 rounded-xl border bg-popover p-1.5 shadow-lg animate-in fade-in-0 zoom-in-95 duration-200"
                onMouseEnter={handleStagesMouseEnter}
                onMouseLeave={handleStagesMouseLeave}
              >
                <Link
                  href="/stages"
                  className="flex items-center gap-2 px-3 py-2.5 text-sm font-semibold rounded-lg hover:bg-accent text-primary border-b mb-1"
                >
                  {t('stages.allStages')}
                </Link>
                {stages.map((stage) => (
                  <Link
                    key={stage.Id}
                    href={`/stages/${stage.Id}`}
                    className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">
                      {stage.Order}
                    </span>
                    <span>{locale === 'ar' ? stage.NameAr : stage.NameEn}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* About Section */}
          <Link
            href="/about"
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              isAboutActive 
                ? 'bg-primary/10 text-primary' 
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            )}
          >
            {t('nav.about')}
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <div className="hidden md:flex items-center">
            {showSearch ? (
              <form onSubmit={handleNavSearch} className="relative flex items-center animate-in slide-in-from-right-5 duration-200">
                <Search className="absolute start-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  autoFocus
                  type="text"
                  value={navSearch}
                  onChange={(e) => setNavSearch(e.target.value)}
                  placeholder={t('search.placeholder')}
                  className="w-48 ps-8 pe-3 py-1.5 rounded-lg border text-sm bg-background outline-none focus:ring-1 focus:ring-primary transition-all"
                />
                <Button type="button" variant="ghost" size="icon" className="ms-1 h-8 w-8"
                  onClick={() => { setShowSearch(false); setNavSearch(''); }}>
                  <CloseCircle className="h-4 w-4" />
                </Button>
              </form>
            ) : (
              <Button variant="ghost" size="icon" onClick={() => setShowSearch(true)}>
                <SearchNormal1 className="h-5 w-5" />
              </Button>
            )}
          </div>

          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {mounted ? (theme === 'dark' ? <Sun1 className="h-5 w-5" /> : <Moon className="h-5 w-5" />) : <div className="h-5 w-5" />}
          </Button>

          <Button variant="ghost" size="sm" onClick={toggleLocale} className="font-bold">
            {locale === 'ar' ? 'EN' : 'عربي'}
          </Button>

          {/* Auth Section */}
          {/* [CHANGED] Replaced isLoading with !mounted || isLoading so server and client render the same skeleton on first paint */}
          {!mounted || isLoading ? (
            <div className="h-8 w-24 rounded-lg bg-muted animate-pulse" />
          ) : isAuthenticated && user ? (
            <div className="relative">
              <Button variant="ghost" className="flex items-center gap-2" onClick={() => setUserMenuOpen(!userMenuOpen)}>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <span className="hidden sm:inline text-sm font-medium">
                  {user.FullName || user.Email?.split('@')[0] || 'User'}
                </span>
                <ArrowDown2 className="h-4 w-4" />
              </Button>
              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute end-0 top-full z-20 mt-2 w-56 rounded-xl border bg-popover p-1.5 shadow-lg">
                    <div className="px-3 py-2 text-sm text-muted-foreground border-b mb-1">{user.Email}</div>
                    <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-accent" onClick={() => setUserMenuOpen(false)}>
                      <Element3 className="h-4 w-4" />{t('nav.dashboard')}
                    </Link>
                    {user.Role === 'Admin' && (
                      <Link href="/admin" className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-accent text-primary" onClick={() => setUserMenuOpen(false)}>
                        <ShieldSecurity className="h-4 w-4" />{t('nav.admin')}
                      </Link>
                    )}
                    <button onClick={handleLogout} className="flex w-full items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-accent text-destructive">
                      <Logout className="h-4 w-4" />{t('nav.logout')}
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild><Link href="/login">{t('nav.login')}</Link></Button>
              <Button size="sm" asChild><Link href="/register">{t('nav.register')}</Link></Button>
            </div>
          )}

          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <CloseCircle className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background px-4 py-4 space-y-2 max-h-[80vh] overflow-y-auto">
          <form onSubmit={handleNavSearch} className="relative mb-3">
            <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input type="text" value={navSearch} onChange={(e) => setNavSearch(e.target.value)}
              placeholder={t('search.placeholder')}
              className="w-full ps-8 pe-3 py-2 rounded-lg border text-sm bg-background outline-none focus:ring-1 focus:ring-primary" />
          </form>

          {/* Home */}
          <Link href="/" className={cn('block px-4 py-2 rounded-lg text-sm font-medium', pathname === '/' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent')} onClick={() => setMobileMenuOpen(false)}>
            {t('nav.home')}
          </Link>

          {/* Stages */}
          <div className="border-t pt-2 mt-2">
            <Link href="/stages" className={cn('block px-4 py-2 rounded-lg text-sm font-semibold text-primary', isStagesActive && 'bg-primary/10')} onClick={() => setMobileMenuOpen(false)}>
              {t('nav.stages')}
            </Link>
            {stages?.map((stage) => (
              <Link key={stage.Id} href={`/stages/${stage.Id}`} className="block ps-8 pe-4 py-2 rounded-lg text-sm text-muted-foreground hover:bg-accent" onClick={() => setMobileMenuOpen(false)}>
                {locale === 'ar' ? stage.NameAr : stage.NameEn}
              </Link>
            ))}
          </div>

          {/* About */}
          <Link href="/about" className={cn('block px-4 py-2 rounded-lg text-sm font-medium', isAboutActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent')} onClick={() => setMobileMenuOpen(false)}>
            {t('nav.about')}
          </Link>

          {/* Mobile Auth Section */}
          {/* [CHANGED] Replaced isLoading with !mounted || isLoading to match server/client first render */}
          {!mounted || isLoading ? (
            <div className="pt-4 border-t mt-4"><div className="h-8 w-full rounded-lg bg-muted animate-pulse" /></div>
          ) : isAuthenticated && user ? (
            <div className="pt-4 border-t mt-4 space-y-2">
              <div className="px-4 py-2 text-sm text-muted-foreground">{user.FullName || user.Email}</div>
              <Link href="/dashboard" className="block px-4 py-2 text-sm font-medium hover:bg-accent rounded-lg" onClick={() => setMobileMenuOpen(false)}>{t('nav.dashboard')}</Link>
              {user.Role === 'Admin' && (
                <Link href="/admin" className="block px-4 py-2 text-sm font-medium hover:bg-accent rounded-lg text-primary" onClick={() => setMobileMenuOpen(false)}>{t('nav.admin')}</Link>
              )}
              <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm font-medium text-destructive hover:bg-accent rounded-lg">{t('nav.logout')}</button>
            </div>
          ) : (
            <div className="pt-4 border-t mt-4 space-y-2">
              <Button className="w-full" asChild><Link href="/login" onClick={() => setMobileMenuOpen(false)}>{t('nav.login')}</Link></Button>
              <Button variant="outline" className="w-full" asChild><Link href="/register" onClick={() => setMobileMenuOpen(false)}>{t('nav.register')}</Link></Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

export function Navbar() {
  return (
    <Suspense 
      fallback={
        <header className="sticky top-0 z-50 w-full h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" />
      }
    >
      <NavbarContent />
    </Suspense>
  );
}