// File: app/[locale]/page.tsx
// Next.js 15 - params is a Promise, must use await

import { getTranslations } from 'next-intl/server';
import { HeroSection } from "@/components/home/HeroSection";
import { StagesSection } from '@/components/home/StagesSection';
import { StatsSection } from '@/components/about/StatsSection';


export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });
  
  return {
    title: t('title'),
    description: t('description'), 
  };
}

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <StagesSection />
      <StatsSection />
    </div>
  );
}