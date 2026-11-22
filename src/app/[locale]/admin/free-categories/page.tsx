import { redirect } from '@/i18n/navigation';

/** Legacy admin topic selection is retired. Free always opens the first two
 * categories in editorial order within each stage. */
export default function LegacyFreeCategoriesPage() {
  redirect({ href: '/admin/stages', locale: 'ar' });
}
