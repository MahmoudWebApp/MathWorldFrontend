'use client';

import { useLocale } from 'next-intl';
import { usePathname, Link } from '@/i18n/routing';
import {
  BookOpen, ChartNoAxesCombined, Heart, House, LockKeyhole,
  Medal, NotebookPen, Settings, Trophy, CheckCheck, Crown, CalendarCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { LockedPremiumDialog } from '@/components/premium/LockedPremiumDialog';

export const STUDENT_NAV_ITEMS = [
  { href: '/dashboard', ar: 'الرئيسية', en: 'Home', icon: House },
  { href: '/dashboard/categories', ar: 'الفئات', en: 'Topics', icon: BookOpen },
  { href: '/dashboard/solved', ar: 'المسائل المحلولة', en: 'Solved problems', icon: CheckCheck },
  { href: '/dashboard/favorites', ar: 'المفضلة', en: 'Favorites', icon: Heart },
  { href: '/dashboard/error-notebook', ar: 'دفتر الأخطاء', en: 'Error notebook', icon: NotebookPen },
  { href: '/dashboard/leaderboard', ar: 'المتفوقون', en: 'Leaderboard', icon: Trophy },
  { href: '/dashboard/achievements', ar: 'الشارات والإنجازات', en: 'Badges', icon: Medal },
  { href: '/dashboard/daily-challenge', ar: 'تحدي اليوم', en: 'Daily challenge', icon: CalendarCheck, premium: true },
  { href: '/dashboard/analytics', ar: 'التقارير والإحصائيات', en: 'Reports & analytics', icon: ChartNoAxesCombined, premium: true },
  { href: '/dashboard/settings', ar: 'الإعدادات', en: 'Settings', icon: Settings },
  { href: '/dashboard/upgrade', ar: 'ترقية الحساب', en: 'Upgrade', icon: Crown },
] as const;

export function StudentWorkspaceNavigation({ onNavigate, isPremium = false, collapsed = false }: { onNavigate?: () => void; isPremium?: boolean; collapsed?: boolean }) {
  const locale = useLocale();
  const pathname = usePathname();
  const ar = locale === 'ar';
  return (
    <nav aria-label={ar ? 'قائمة الطالب' : 'Student navigation'} className="space-y-1">
      {STUDENT_NAV_ITEMS.map(item => {
        const active = pathname === item.href ||
          (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'));
        const locked = 'premium' in item && item.premium && !isPremium;
        const classes = cn('flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2 text-start text-sm font-semibold transition-colors',
          collapsed && 'justify-center px-2',
          active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground');
        const title = ar ? item.ar : item.en;
        const content = (
          <>
            <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span className={collapsed ? "sr-only" : "min-w-0 flex-1"}>{title}</span>
            {locked && !collapsed && <LockKeyhole className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />}
          </>
        );
        return locked ? (
          <LockedPremiumDialog key={item.href} featureName={title}>
            <button type="button" className={classes} title={title} aria-label={ar ? `${title} — Premium مقفولة` : `${title} — Premium locked`}>
              {content}
            </button>
          </LockedPremiumDialog>
        ) : (
          <Link key={item.href} href={item.href} onClick={onNavigate} title={title} aria-label={title}
            aria-current={active ? 'page' : undefined} className={classes}>
            {content}
          </Link>
        );
      })}
    </nav>
  );
}
