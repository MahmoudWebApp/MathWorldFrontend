'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useGetTagsQuery } from '@/store/api/tagsApi';
import { Hash, Loader2, AlertCircle } from 'lucide-react';
import { useInView } from '@/lib/useInView';

export function TagsSection() {
  const t = useTranslations();
  const { data: tags, isLoading, error } = useGetTagsQuery();
  const { ref: sectionRef, isInView } = useInView(0.05);

  if (error) {
    return (
      <section className="relative py-20 lg:py-28" ref={sectionRef}>
        <div className="container mx-auto lg:px-24 md:px-16 px-4 text-center">
          <div className="flex flex-col items-center gap-4 text-red-500 dark:text-red-400">
            <AlertCircle className="h-12 w-12" />
            <p className="text-lg font-medium">{t('common.error')}</p>
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
    <section className="relative py-20 lg:py-28 overflow-hidden" ref={sectionRef}>
      <svg
        className="absolute top-1/2 left-0 w-full h-32 opacity-[0.03] dark:opacity-[0.05] -translate-y-1/2 pointer-events-none"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0,60 Q180,10 360,60 Q540,110 720,60 Q900,10 1080,60 Q1260,110 1440,60"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
        />
        <path
          d="M0,60 Q180,110 360,60 Q540,10 720,60 Q900,110 1080,60 Q1260,10 1440,60"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
          opacity="0.5"
        />
      </svg>

      <div className="container mx-auto lg:px-24 md:px-16 px-4 relative z-10">
        <div
          className={`text-center mb-12 transition-all duration-700 ${
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="h-1 w-8 rounded-full bg-primary" />
            <span className="text-sm font-medium text-primary uppercase tracking-wider">
              {t('tags.title')}
            </span>
            <div className="h-1 w-8 rounded-full bg-primary" />
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold mb-3">{t('tags.title')}</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">{t('tags.subtitle')}</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-2.5 lg:gap-3 max-w-4xl mx-auto">
            {tags?.map((tag, index) => {
              const sizeClass = index % 5 === 0
                ? 'px-5 py-2.5 text-base'
                : index % 3 === 0
                  ? 'px-4 py-2 text-sm'
                  : 'px-3.5 py-1.5 text-sm';

              return (
                <div
                  key={tag.Id}
                  className={`transition-all duration-500 ${
                    isInView
                      ? 'opacity-100 translate-y-0 scale-100'
                      : 'opacity-0 translate-y-6 scale-90'
                  }`}
                  style={{ transitionDelay: isInView ? `${index * 40}ms` : '0ms' }}
                >
             
                  <Link href={`/problems?tagId=${tag.Id}`} className="block group">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-xl border bg-card/80 dark:bg-card/50 text-foreground/80 backdrop-blur-sm cursor-pointer ${sizeClass} font-medium hover:bg-primary hover:text-primary-foreground hover:border-primary hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 hover:scale-105 active:scale-95 transition-all duration-300`}
                    >
                      <Hash className="h-3.5 w-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
                      <span>{tag.Text}</span>
                      {tag.ProblemsCount !== undefined && (
                        <span className="opacity-40 group-hover:opacity-70 text-xs transition-opacity" dir="ltr">
                          ({tag.ProblemsCount})
                        </span>
                      )}
                    </span>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}