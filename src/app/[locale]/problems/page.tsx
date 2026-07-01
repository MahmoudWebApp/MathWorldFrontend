import { getTranslations } from 'next-intl/server';
import ProblemsPageClientWrapper from './ProblemsPageClient';

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}) {
  const { locale } = await params;
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