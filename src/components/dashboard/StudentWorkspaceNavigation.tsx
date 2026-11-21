'use client';

import { useLocale } from 'next-intl';
import { usePathname, Link } from '@/i18n/routing';
import {
  BookOpen, ChartNoAxesCombined, Heart, House, LockKeyhole,
  Medal, NotebookPen, Settings, Trophy, CheckCheck, Crown
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const STUDENT_NAV_ITEMS = [
  { href: '/dashboard', ar: 'الرئيسية', en: 'Home', icon: House },
  { href: '/dashboard/categories', ar: 'الفئات', en: 'Topics', icon: BookOpen },
  { href: '/dashboard/solved', ar: 'المسائل المحلولة', en: 'Solved problems', icon: CheckCheck },
  { href: '/dashboard/favorites', ar: 'المفضلة', en: 'Favorites', icon: Heart },
  { href: '/dashboard/error-notebook', ar: 'دفتر الأخطاء', en: 'Error notebook', icon: NotebookPen },
  { href: '/dashboard/leaderboard', ar: 'المتفوقون', en: 'Leaderboard', icon: Trophy },
  { href: '/dashboard/achievements', ar: 'الشارات والإنجازات', en: 'Badges', icon: Medal },
  { href: '/dashboard/analytics', ar: 'التقارير والإحصائيات', en: 'Reports & analytics', icon: ChartNoAxesCombined, premium: true },
  { href: '/dashboard/settings', ar: 'الإعدادات', en: 'Settings', icon: Settings },
  { href: '/dashboard/upgrade', ar: 'ترقية الحساب', en: 'Upgrade', icon: Crown },
] as const;

export function StudentWorkspaceNavigation({ onNavigate, isPremium = false }: { onNavigate?: () => void; isPremium?: boolean }) {
  const locale = useLocale();
  const pathname = usePathname();
  return (
    <nav aria-label={locale === 'ar' ? 'قائمة الطالب' : 'Student navigation'} className="space-y-1">
      {STUDENT_NAV_ITEMS.map(item => {
        const active = pathname === item.href ||
          (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'));
        return (
          <Link key={item.href} href={item.href} onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={cn('flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-colors',
              active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground')}>
            <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span className="min-w-0 flex-1">{locale === 'ar' ? item.ar : item.en}</span>
            {'premium' in item && item.premium && !isPremium && <LockKeyhole className="h-4 w-4 shrink-0 text-muted-foreground" aria-label={locale === 'ar' ? 'Premium' : 'Premium'} />}
          </Link>
        );
      })}
    </nav>
  );
}
