import { redirect, isAppLocale } from '@/i18n/routing';

/** Legacy per-stage Free category customization is retired. */
export default async function LegacyFreeCategoriesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect({ href: '/admin/stages', locale: isAppLocale(locale) ? locale : 'ar' });
}
