
'use client';

import { useTranslations } from 'next-intl';
import { useGetCategoriesQuery } from '@/store/api/categoriesApi';
import { Loader2, AlertCircle } from 'lucide-react';
import { useInView } from '@/lib/useInView';
import { CategoryCard } from '@/components/home/CategoryCard'; 

export default function CategoriesPageClient() {
  const t = useTranslations();
  const { data: categories, isLoading, error } = useGetCategoriesQuery();
  const { ref: sectionRef, isInView } = useInView(0.05);

  if (error) {
    return (
      <section className="py-20" ref={sectionRef}>
        <div className="container mx-auto lg:px-24 md:px-16 px-4 text-center">
          <div className="flex flex-col items-center gap-4 text-red-500 dark:text-red-400">
            <AlertCircle className="h-12 w-12" />
            <p className="text-lg font-medium">{t('common.errorLoadingData')}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              {t('common.retry')}
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 lg:py-20" ref={sectionRef}>
      <div className="container mx-auto lg:px-24 md:px-16 px-4">
        
        <div className="mb-12 text-center md:text-start">
          <h1 className="text-4xl md:text-5xl/[65px] font-extrabold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {t('categories.title')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            {t('categories.subtitle')}
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {categories?.map((category, index) => (
              <CategoryCard 
                key={category.Id} 
                category={category} 
                index={index} 
                isInView={isInView} 
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}