import { getTranslations } from 'next-intl/server';
import ProblemsPageClientWrapper from './ProblemsPageClient';

// Generate metadata with translations based on locale
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}) {
  // Await the params Promise to get the locale
  const { locale } = await params;
  
  // Load translations for the problems namespace
  const t = await getTranslations({ locale, namespace: 'problems' });
  
  return {
    title: t('title') + ' | MathWorld',
    description: t('subtitle'),
  };
}

export default async function ProblemsPage() {
  return (
    <div className="min-h-screen bg-slate-200/50 dark:bg-background">
      <ProblemsPageClientWrapper />
    </div>
  );
}