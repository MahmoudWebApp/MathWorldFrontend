import { getTranslations } from 'next-intl/server';
import CategoriesPageClient from './CategoriesPageClient';

// Generate metadata with translations based on locale
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}) {
  // Await the params Promise to get the locale
  const { locale } = await params;
  
  // Load translations for the categories namespace
  const t = await getTranslations({ locale, namespace: 'categories' });
  
  return {
    title: t('title') + ' | MathWorld',
    description: t('subtitle'),
  };
}

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-slate-200/50 dark:bg-background">
      <CategoriesPageClient />
    </div>
  );
}