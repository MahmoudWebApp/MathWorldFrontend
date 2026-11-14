'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import {
  BarChart3, BookOpenText, ChevronDown, FolderTree, LockKeyhole,
  GraduationCap, LayoutDashboard, ShieldCheck, UsersRound, BellRing,
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
    href: '/admin/analytics',
    icon: BarChart3,
    labelAr: 'مركز الإحصائيات',
    labelEn: 'Analytics center',
    descriptionAr: 'نشاط الطلاب وأداء المراحل ونقاط الضعف',
    descriptionEn: 'Student activity, stage trends and weak topics',
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
    labelAr: 'المستويات التعليمية',
    labelEn: 'Stages',
    descriptionAr: 'ابدأ من المستوى ثم ادخل لفئاته',
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
    labelAr: 'الفئات المجانية وPremium',
    labelEn: 'Free & Premium access',
    descriptionAr: 'مراجعة الفئتين المجانيتين لكل مرحلة',
    descriptionEn: 'Review the two free categories per stage',
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

export function AdminNavDropdown() {
  const locale = useLocale();
  const pathname = usePathname();
  const ar = locale === 'ar';
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;

    function onOutsidePress(event: PointerEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('pointerdown', onOutsidePress);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('pointerdown', onOutsidePress);
      document.removeEventListener('keydown', onEscape);
    };
  }, [open]);

  const active = pathname === '/admin' || pathname.startsWith('/admin/');
  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mathworld-admin-navigation"
        onClick={() => setOpen(value => !value)}
        className={cn(
          'flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors',
          active
            ? 'border-primary/30 bg-primary/10 text-primary'
            : 'border-border text-foreground hover:border-primary/30 hover:bg-muted'
        )}
      >
        <ShieldCheck className="h-4 w-4" aria-hidden />
        {ar ? 'إدارة المنصة' : 'Administration'}
        <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} aria-hidden />
      </button>
      {open && (
        <nav
          id="mathworld-admin-navigation"
          aria-label={ar ? 'أقسام إدارة المنصة' : 'Administration sections'}
          className="absolute end-0 top-full z-50 mt-3 max-h-[min(75vh,650px)] w-[min(92vw,380px)] overflow-y-auto rounded-2xl border border-border bg-popover p-2.5 shadow-2xl"
        >
          <div className="px-3 pb-2 pt-1 text-xs font-semibold text-muted-foreground">
            {ar ? 'نظرة عامة' : 'Overview'}
          </div>
          {ADMIN_NAV_ITEMS.filter(item => item.group === 'overview').map(item => (
            <AdminMenuLink key={item.href} item={item} ar={ar} pathname={pathname} close={() => setOpen(false)} />
          ))}
          <div className="mx-2 my-3 border-t border-border" />
          <div className="px-3 pb-2 text-xs font-semibold text-muted-foreground">
            {ar ? 'الإدارات' : 'Management'}
          </div>
          {ADMIN_NAV_ITEMS.filter(item => item.group === 'management').map(item => (
            <AdminMenuLink key={item.href} item={item} ar={ar} pathname={pathname} close={() => setOpen(false)} />
          ))}
          <div className="mx-2 my-3 border-t border-border" />
          <div className="px-3 pb-2 text-xs font-semibold text-muted-foreground">
            {ar ? 'المحتوى التعليمي: مستويات ← فئات ← مسائل' : 'Learning content: Stages → Categories → Problems'}
          </div>
          {ADMIN_NAV_ITEMS.filter(item => item.group === 'content').map(item => (
            <AdminMenuLink key={item.href} item={item} ar={ar} pathname={pathname} close={() => setOpen(false)} />
          ))}
        </nav>
      )}
    </div>
  );
}

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
