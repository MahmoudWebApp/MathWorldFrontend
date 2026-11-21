"use client";

import { useTranslations, useLocale } from "next-intl";
import { useSelector } from "react-redux";
import { BookOpen, GraduationCap, Sparkles, Trophy } from "lucide-react";

import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/Button";
import type { RootState } from "@/store";

/** Public landing hero focused on stages and plan discovery, without public search. */
export function HeroSection() {
  const t = useTranslations();
  const isArabic = useLocale() === "ar";
  const { user, token } = useSelector((state: RootState) => state.auth);
  const isAuthenticated = Boolean(user && token);
  const titleWords = t("hero.title").split(" ");


  return (
    <section className="brand-hero-bg relative isolate overflow-hidden px-4 py-16 sm:py-24 lg:py-28">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-brand-primary/20 to-transparent" />
      <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-primary/15 bg-brand-primary/5 px-4 py-2 text-sm font-bold text-brand-primary-strong dark:text-brand-primary-light">
          <Sparkles aria-hidden="true" className="h-4 w-4" />
          {t("hero.tagline")}
        </div>

        <h1 className="brand-display-title mb-4 max-w-4xl text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:mb-5 sm:text-5xl lg:text-6xl">
          {titleWords.map((word, index) => (
            <span key={`${index}-${word}`} className={index === titleWords.length - 1 ? "sr-title-accent" : ""}>
              {index > 0 ? " " : ""}{word}
            </span>
          ))}
        </h1>

        <p className="mb-8 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
          {t("hero.subtitle")}
        </p>

        <div aria-hidden="true" dir="ltr" className="mb-8 flex flex-wrap items-center justify-center gap-3 text-sm font-bold text-brand-primary/70 dark:text-brand-primary-light/80">
          <span className="rounded-xl border border-brand-primary/10 bg-card/75 px-4 py-2">x² + y² = z²</span>
          <span className="rounded-xl border border-brand-secondary/10 bg-card/75 px-4 py-2 text-brand-secondary-strong dark:text-brand-secondary-light">π · r²</span>
          <span className="rounded-xl border border-brand-primary/10 bg-card/75 px-4 py-2">∑ n</span>
        </div>

        <div className="flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
          <Button asChild size="lg" className="w-full gap-2 rounded-2xl sm:w-auto">
            <Link href="/stages">
              <GraduationCap aria-hidden="true" className="h-5 w-5" />
              {t("hero.browseStages")}
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full gap-2 rounded-2xl sm:w-auto">
            <Link href={isAuthenticated && user?.Role === "Student" ? "/dashboard/categories" : isAuthenticated ? "/admin" : "/login"}>
              {isAuthenticated ? <BookOpen aria-hidden="true" className="h-5 w-5" /> : <Trophy aria-hidden="true" className="h-5 w-5" />}
              {isAuthenticated ? t('nav.dashboard') : t('nav.login')}
            </Link>
          </Button>

        </div>
      </div>
    </section>
  );
}