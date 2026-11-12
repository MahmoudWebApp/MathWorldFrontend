"use client";

import { useLocale, useTranslations } from "next-intl";
import { GraduationCap, Loader2 } from "lucide-react";

import { useGetStagesQuery } from "@/store/api/stagesApi";
import { sortStagesByOrder } from "@/lib/stageVisuals";
import { StagePremiumCard } from "@/components/stages/StagePremiumCard";
import { AccentHeadingText } from "@/components/ui/AccentHeadingText";
import { Button } from "@/components/ui/Button";

/** Stage cards are readable, keyboard accessible, and motion-light. */
export function StagesSection() {
  const t = useTranslations();
  const locale = useLocale();
  const { data: stages, isLoading, isError, refetch } = useGetStagesQuery(locale, {
    refetchOnMountOrArgChange: true,
  });

  if (isLoading) {
    return (
      <section className="flex min-h-72 items-center justify-center py-16" aria-busy="true">
        <Loader2 aria-hidden="true" className="h-8 w-8 animate-spin text-primary" />
        <span className="sr-only">{t("common.loading")}</span>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="py-16 text-center">
        <p className="mb-4 text-muted-foreground">{t("common.errorLoadingData")}</p>
        <Button variant="outline" onClick={() => void refetch()}>{t("common.retry")}</Button>
      </section>
    );
  }

  if (!stages?.length) return null;

  return (
    <section className="bg-background py-16 sm:py-20 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-12">
        <div className="mx-auto mb-11 max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-brand-primary/5 px-4 py-2 text-sm font-bold text-brand-primary-strong dark:text-brand-primary-light">
            <GraduationCap aria-hidden="true" className="h-4 w-4" />
            {t("stages.title")}
          </div>
          <h2 className="brand-display-title mb-4 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            <AccentHeadingText text={t("stages.heading")} />
          </h2>
          <p className="mx-auto max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            {t("stages.subtitle")}
          </p>
        </div>
        <div className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {sortStagesByOrder(stages).map((stage, index) => (
            <StagePremiumCard key={stage.Id} stage={stage} index={index} locale={locale} />
          ))}
        </div>
      </div>
    </section>
  );
}