import { FavoritesProblemsPage } from '@/components/dashboard/FavoritesProblemsPage';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'favorites.metadata' });
  
  return {
    title: t('title'),
    description: t('description'), 
  };
}

export default function FavoritesPage() {
  return <FavoritesProblemsPage />;
}