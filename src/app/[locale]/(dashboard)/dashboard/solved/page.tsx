import { SolvedProblemsPage } from '@/components/dashboard/SolvedProblemsPage';
import { getTranslations } from 'next-intl/server';


export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'solved.metadata' });
  
  return {
    title: t('title'),
    description: t('description'), 
  };
}

export default function SolvedPage() {
  return <SolvedProblemsPage />;
}