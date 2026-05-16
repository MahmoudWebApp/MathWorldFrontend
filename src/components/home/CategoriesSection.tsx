// File: components/home/CategoriesSection.tsx

"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { useGetCategoriesQuery } from "@/store/api/categoriesApi";
import { ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { useInView } from "@/lib/useInView";
import { ArrowLeft } from "iconsax-reactjs";
import { CategoryCard } from "./CategoryCard";

export function CategoriesSection() {
  const t = useTranslations();
  const locale = useLocale();
  const isRtl = locale === "ar";
  const { data: categories, isLoading, error } = useGetCategoriesQuery();
  const { ref: sectionRef, isInView } = useInView(0.05);

  if (error) {
    return (
      <section className="relative py-20 lg:py-28 bg-muted/30" ref={sectionRef}>
        <div className="container lg:px-24 md:px-16 px-4 text-center">
          <div className="flex flex-col items-center gap-4 text-red-500 dark:text-red-400">
            <AlertCircle className="h-12 w-12" />
            <p className="text-lg font-medium">{t("common.errorLoadingData")}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              {t("common.retry")}
            </button>
          </div>
        </div>
      </section>
    );
  }

  const displayedCategories = categories?.slice(0, 8) || [];

  return (
    <section className="relative py-20 lg:py-28 bg-muted/30 overflow-hidden" ref={sectionRef}>
      <div className="absolute top-10 right-10 w-48 h-48 bg-primary/[0.03] rounded-full blur-[60px]" />
      <div className="absolute bottom-10 left-10 w-64 h-64 bg-primary/[0.02] rounded-full blur-[80px]" />

      <div className="container mx-auto lg:px-24 md:px-16 px-4 relative z-10">
        <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-4 transition-all duration-700 ${isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-1 w-8 rounded-full bg-primary" />
              <span className="text-sm font-medium text-primary uppercase tracking-wider">
                {t("categories.title")}
              </span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold">{t("categories.title")}</h2>
            <p className="text-muted-foreground mt-2 max-w-md">{t("categories.subtitle")}</p>
          </div>
          <Link href="/categories" className="flex items-center gap-2 text-sm font-medium text-primary hover:gap-3 transition-all duration-300 group">
            {t("categories.viewAll")}
            {isRtl ? <ArrowLeft className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" /> : <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />}
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
            {displayedCategories.map((category, index) => (
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