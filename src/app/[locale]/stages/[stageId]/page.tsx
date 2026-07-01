// File: app/[locale]/stages/[stageId]/page.tsx

import { getTranslations } from 'next-intl/server';
import StageCategoriesClient from './StageCategoriesClient';


export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ locale: string; stageId: string }> 
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });
  
  return {
    title: t('stagesTitle'),
    description: t('stagesDescription'),
  };
}

export default async function StagePage({ 
  params 
}: { 
  params: Promise<{ stageId: string }> 
}) {
  const { stageId } = await params;
  
  return <StageCategoriesClient stageId={Number(stageId)} />;
}