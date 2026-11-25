'use client';

import { useLocale } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import {
  ChartNoAxesCombined, ChevronDown,
  GraduationCap, LayoutDashboard, ShieldCheck, UsersRound, BellRing, Gift, Settings,
} from 'lucide-react';
import { DirectionalChevron } from '@/components/ui/DirectionalNavigation';
import { cn } from '@/lib/utils';

/** Only implemented, reachable admin routes. Do not put planned sections here yet. */
export const ADMIN_NAV_ITEMS = [
  {
    href: '/admin',
    icon: LayoutDashboard,
    labelAr: 'الرئيسية',
    labelEn: 'Overview',
    descriptionAr: 'ملخص إدارة MathWorld',
    descriptionEn: 'MathWorld administration overview',
    group: 'overview',
  },
  {
    href: '/admin/engagement/students',
    icon: UsersRound,
    labelAr: 'متابعة الطلاب وسجلهم',
    labelEn: 'Student monitoring and log',
    descriptionAr: 'التسجيل والدخول والخروج الصريح وتسلسل أحداث الطلاب',
    descriptionEn: 'Registration, sign-ins, explicit sign-outs and events',
    group: 'overview',
  },
  {
    href: '/admin/analytics',
    icon: ChartNoAxesCombined,
    labelAr: 'تقارير التعلّم والتفاعل',
    labelEn: 'Learning and engagement reports',
    descriptionAr: 'المسائل المحلولة والدقة والأخطاء ونشاط المراحل والفئات',
    descriptionEn: 'Solved problems, accuracy, errors and stage activity',
    group: 'overview',
  },
  {
    href: '/admin/users',
    icon: UsersRound,
    labelAr: 'إدارة الطلاب',
    labelEn: 'Learners',
    descriptionAr: 'الطلاب واشتراكاتهم وتقدمهم',
    descriptionEn: 'Learner profiles, subscriptions and progress',
    group: 'management',
  },
  {
    href: '/admin/premium-codes',
    icon: Gift,
    labelAr: 'أكواد Premium',
    labelEn: 'Premium codes',
    descriptionAr: 'أكواد التفعيل المجاني والترويجية',
    descriptionEn: 'Free and introductory Premium activation codes',
    group: 'management',
  },
  {
    href: '/admin/notifications',
    icon: BellRing,
    labelAr: 'إشعارات الطلاب',
    labelEn: 'Student notifications',
    descriptionAr: 'إشعارات الطلاب فقط',
    descriptionEn: 'Learner-only notifications',
    group: 'management',
  },
  {
    href: '/admin/supervisors',
    icon: ShieldCheck,
    labelAr: 'إدارة المشرفين',
    labelEn: 'Supervisors',
    descriptionAr: 'دعوات الحسابات والصلاحيات وحالة التفعيل',
    descriptionEn: 'Account invitations, permissions and activation',
    group: 'management',
  },
  {
    href: '/admin/settings',
    icon: Settings,
    labelAr: 'إعدادات المنصة',
    labelEn: 'Platform settings',
    descriptionAr: 'أمان الحساب والهوية والتواصل وقوالب البريد',
    descriptionEn: 'Account security, branding, contact and email templates',
    group: 'management',
  },
  {
    href: '/admin/learning-tracks',
    icon: GraduationCap,
    labelAr: 'المحتوى التعليمي',
    labelEn: 'Learning content',
    descriptionAr: 'صف أو مساق ثم فئة ثم مسائل',
    descriptionEn: 'Grade or course → topic → problems',
    group: 'content',
  },
] as const;

function AdminMenuLink({
  item, ar, pathname, close,
}: {
  item: (typeof ADMIN_NAV_ITEMS)[number];
  ar: boolean;
  pathname: string;
  close: () => void;
}) {
  const active = item.href === '/admin'
    ? pathname === '/admin'
    : pathname === item.href || pathname.startsWith(item.href + '/') || (item.group==='content'&&/^\/admin\/(editorial|problems|categories|stages)(\/|$)/.test(pathname));
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={close}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'group flex items-center gap-3 rounded-xl px-3 py-3 transition-colors',
        active ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
      )}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{ar ? item.labelAr : item.labelEn}</span>

      </span>
      <DirectionalChevron direction="forward" className="h-4 w-4 shrink-0 text-muted-foreground" />
    </Link>
  );
}

export function AdminNavMobile({ onNavigate }: { onNavigate: () => void }) {
  const ar = useLocale() === 'ar';
  const pathname = usePathname();
  return (
    <details className="group rounded-2xl border border-primary/20 bg-primary/5" open>
      <summary className="flex cursor-pointer list-none items-center gap-3 rounded-xl px-4 py-3 font-bold text-primary [&::-webkit-details-marker]:hidden">
        <ShieldCheck className="h-5 w-5" aria-hidden />
        <span className="flex-1">{ar ? 'إدارة المنصة' : 'Administration'}</span>
        <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden />
      </summary>
      <nav className="space-y-1 border-t border-border/60 p-2" aria-label={ar ? 'أقسام الإدارة' : 'Administration sections'}>
        {ADMIN_NAV_ITEMS.map(item => (
          <AdminMenuLink key={item.href} item={item} ar={ar} pathname={pathname} close={onNavigate} />
        ))}
      </nav>
    </details>
  );
}

/** Desktop administration workspace: a single grouped navigation, using the
 * same collapsible/icon-only language as the student workspace. */
export function AdminWorkspaceNavigation({ collapsed = false }: { collapsed?: boolean }) {
  const ar = useLocale() === 'ar';
  const pathname = usePathname();

  // Choose the most specific route (e.g. /admin/problems/review rather
  // than /admin/problems) to avoid two highlighted links at once.
  const selectedHref = [...ADMIN_NAV_ITEMS]
    .filter(item => pathname === item.href ||
      (item.href !== '/admin' && pathname.startsWith(item.href + '/')) || (item.group==='content'&&/^\/admin\/(editorial|problems|categories|stages)(\/|$)/.test(pathname)))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  const groups = [
    { key: 'overview', ar: 'المتابعة والإحصائيات', en: 'Monitoring & insights' },
    { key: 'management', ar: 'الطلاب والصلاحيات', en: 'Learners & access' },
    { key: 'content', ar: 'المحتوى التعليمي', en: 'Learning content' },
  ] as const;

  return (
    <nav aria-label={ar ? 'قائمة إدارة المنصة' : 'Administration navigation'} className="space-y-5">
      {groups.map(group => (
        <div key={group.key} className="space-y-1">
          <p className={cn(
            'px-3 pb-1 text-xs font-bold text-muted-foreground',
            collapsed && 'sr-only',
          )}>{ar ? group.ar : group.en}</p>
          {ADMIN_NAV_ITEMS.filter(item => item.group === group.key).map(item => {
            const title = ar ? item.labelAr : item.labelEn;
            const active = selectedHref === item.href;
            return (
              <Link key={item.href} href={item.href}
                title={title} aria-label={title} aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start text-sm font-semibold transition-colors',
                  collapsed && 'justify-center px-2',
                  active ? 'bg-primary/10 text-primary' :
                    'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}>
                <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span className={collapsed ? 'sr-only' : 'min-w-0 flex-1'}>
                  {title}
                </span>
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
