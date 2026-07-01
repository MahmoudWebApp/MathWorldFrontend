// File: app/[locale]/stages/page.tsx

import { getTranslations } from 'next-intl/server';
import StagesPageClient from './StagesPageClient';

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });
  
  return {
    title: t('stagesTitle'),
    description: t('stagesDescription'),
  };
}

export default function StagesPage() {
  return <StagesPageClient />;
}