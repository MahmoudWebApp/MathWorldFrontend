'use client';

import { useLocale } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import {
  ChartNoAxesCombined, History, BookOpenText, ChevronDown, FolderTree, LockKeyhole,
  GraduationCap, LayoutDashboard, ShieldCheck, UsersRound, BellRing, ClipboardList, Gift, TicketPercent,
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
    descriptionAr: 'ملخص سريع وروابط الإدارة',
    descriptionEn: 'Quick summary and management shortcuts',
    group: 'overview',
  },
  {
    href: '/admin/engagement',
    icon: ChartNoAxesCombined,
    labelAr: 'نشاط المراحل التعليمية والفئات',
    labelEn: 'Stages & categories',
    descriptionAr: 'الأكثر حلاً وأفضل طالب بكل مستوى وفئة',
    descriptionEn: 'Active learners, top solvers and category usage',
    group: 'overview',
  },
  {
    href: '/admin/activity',
    icon: UsersRound,
    labelAr: 'دخول ونشاط الطلاب',
    labelEn: 'Learner activity',
    descriptionAr: 'تسجيل الطلاب وآخر دخول وحل حسب المستوى',
    descriptionEn: 'Sign-ups, last sign-ins and last practice',
    group: 'overview',
  },
  {
    href: '/admin/audit',
    icon: History,
    labelAr: 'سجل العمليات',
    labelEn: 'Activity & audit log',
    descriptionAr: 'تتبع ما نفّذه الطلاب والأدمن',
    descriptionEn: 'Record student and administrator commands',
    group: 'overview',
  },
  {
    href: '/admin/users',
    icon: UsersRound,
    labelAr: 'إدارة الطلاب',
    labelEn: 'Students',
    descriptionAr: 'بحث وملفات الطلاب وتقدّمهم ومحاولاتهم',
    descriptionEn: 'Find learners and review progress and attempts',
    group: 'management',
  },
  {
    href: '/admin/premium-codes',
    icon: Gift,
    labelAr: 'أكواد هدية Premium',
    labelEn: 'Premium gift codes',
    descriptionAr: 'إنشاء أكواد هدية Premium لمرة واحدة ومتابعة استخدامها',
    descriptionEn: 'Issue one-time Premium gifts and review redemptions',
    group: 'management',
  },
  {
    href: '/admin/premium-discounts',
    icon: TicketPercent,
    labelAr: 'أكواد خصم Premium',
    labelEn: 'Premium discounts',
    descriptionAr: 'إنشاء خصومات محددة المدة وإدارة صلاحيتها واستخداماتها',
    descriptionEn: 'Schedule checkout discounts and manage validity and usage',
    group: 'management',
  },
  {
    href: '/admin/notifications',
    icon: BellRing,
    labelAr: 'إشعارات الطلاب',
    labelEn: 'Learner notifications',
    descriptionAr: 'إرسال رسالة ثنائية اللغة إلى طالب محدد',
    descriptionEn: 'Send a bilingual in-app notice to one learner',
    group: 'management',
  },
  {
    href: '/admin/stages',
    icon: GraduationCap,
    labelAr: 'المراحل التعليمية',
    labelEn: 'Stages',
    descriptionAr: 'ابدأ من المرحلة التعليمية ثم انتقل إلى فئاتها',
    descriptionEn: 'Manage educational stages and order',
    group: 'content',
  },
  {
    href: '/admin/categories',
    icon: FolderTree,
    labelAr: 'الفئات حسب المستوى',
    labelEn: 'Categories',
    descriptionAr: 'اختر فئة لعرض وإضافة مسائلها',
    descriptionEn: 'Organize topics by stage',
    group: 'content',
  },
  {
    href: '/admin/free-categories',
    icon: LockKeyhole,
    labelAr: 'الفئات المتاحة لحساب Free وPremium',
    labelEn: 'Free & Premium access',
    descriptionAr: 'مراجعة الفئتين المتاحتين لحساب Free في كل مرحلة',
    descriptionEn: 'Review the two free categories per stage',
    group: 'content',
  },
  {
    href: '/admin/problems/review',
    icon: ClipboardList,
    labelAr: 'مراجعة دفعات المسائل',
    labelEn: 'Question review batches',
    descriptionAr: 'مراجعة المسائل الثنائية اللغة واعتمادها قبل النشر',
    descriptionEn: 'Review, approve and safely publish question batches',
    group: 'content',
  },
  {
    href: '/admin/problems',
    icon: BookOpenText,
    labelAr: 'المسائل التعليمية',
    labelEn: 'Problems',
    descriptionAr: 'إضافة وتحرير المسائل في المستوى والفئة المختارين',
    descriptionEn: 'Create, edit and review questions within their stage and category',
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
    : pathname === item.href || pathname.startsWith(item.href + '/');
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
        <span className="mt-0.5 block text-xs text-muted-foreground">
          {ar ? item.descriptionAr : item.descriptionEn}
        </span>
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
      (item.href !== '/admin' && pathname.startsWith(item.href + '/')))
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
