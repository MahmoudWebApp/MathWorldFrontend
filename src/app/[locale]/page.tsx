// File: app/[locale]/page.tsx
// Next.js 15 - params is a Promise, must use await

import { getTranslations } from 'next-intl/server';
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { HeroSection } from "@/components/home/HeroSection";
import { TagsSection } from "@/components/home/TagsSection";
import { StagesSection } from '@/components/home/StagesSection';
import { StatsSection } from '@/components/home/StatsSection';

// Generate metadata with translations based on locale

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}) {
  // Await the params Promise to get the locale
  const { locale } = await params;
  
  // Load translations for the metadata namespace
  const t = await getTranslations({ locale, namespace: 'metadata' });
  
  return {
    title: t('title'),
    description: t('description'), 
  };
}

// Home page component
export default function HomePage() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <CategoriesSection />
      <StagesSection />  
      <TagsSection />

      <StatsSection />
    </div>
  );
}