"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { Search, BookOpen, Trophy, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ArrowLeft } from "iconsax-reactjs";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

const mathSymbols = [
  { symbol: "π", className: "top-[6%] left-[4%]", size: "text-5xl", delay: "0s", duration: "7s", type: "float" },
  { symbol: "Σ", className: "top-[12%] right-[6%]", size: "text-6xl", delay: "1.2s", duration: "8s", type: "float-reverse" },
  { symbol: "∫", className: "top-[40%] left-[2%]", size: "text-7xl", delay: "0.5s", duration: "9s", type: "float" },
  { symbol: "∞", className: "bottom-[18%] right-[4%]", size: "text-5xl", delay: "2s", duration: "7s", type: "float-reverse" },
  { symbol: "Δ", className: "top-[62%] left-[7%]", size: "text-4xl", delay: "1.5s", duration: "6.5s", type: "float" },
  { symbol: "θ", className: "top-[22%] left-[14%]", size: "text-4xl", delay: "3s", duration: "8s", type: "float-reverse" },
  { symbol: "∂", className: "top-[4%] left-[32%]", size: "text-3xl", delay: "0.3s", duration: "9s", type: "float-reverse" },
  { symbol: "∇", className: "bottom-[22%] left-[24%]", size: "text-4xl", delay: "2.2s", duration: "7s", type: "float" },
];

export function HeroSection() {
  const t = useTranslations();
  const locale = useLocale();
  const isRtl = locale === "ar";
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [equationIndex, setEquationIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const { user, token } = useSelector((state: RootState) => state.auth);
  const isAuthenticated = !!token && !!user;
  const equations: string[] = t.raw("hero.equations");
  const CYCLE_DURATION = 4000;

  useEffect(() => {
    setMounted(true);
  }, []);

  const nextEquation = useCallback(() => {
    setEquationIndex((prev) => (prev + 1) % equations.length);
  }, [equations.length]);

  useEffect(() => {
    const interval = setInterval(nextEquation, CYCLE_DURATION);
    return () => clearInterval(interval);
  }, [nextEquation]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
     router.push(`/problems?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <section className={`relative min-h-[90vh] overflow-hidden ${mounted ? "hero-loaded" : ""}`}>
      {/* Background Layers */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.12] via-primary/[0.05] to-background dark:from-primary/[0.15] dark:via-primary/[0.08] dark:to-background" />
      <div className="absolute inset-0 math-grid-bg opacity-60" />

      {/* Floating Math Symbols */}
      {mathSymbols.map((sym, index) => (
        <div
          key={index}
          className={`absolute ${sym.className} ${sym.size} text-primary/[0.07] dark:text-primary/[0.12] font-serif pointer-events-none select-none hidden lg:block animate-${sym.type}`}
          style={{ animationDelay: sym.delay, animationDuration: sym.duration, willChange: "transform" }}
        >
          {sym.symbol}
        </div>
      ))}

      {/* Glow Orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/15 dark:bg-primary/10 rounded-full blur-[120px] animate-pulse-glow" />
      <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-primary/10 dark:bg-primary/[0.07] rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: "2s" }} />

      {/* Content */}
      <div className="container mx-auto lg:px-24 md:px-16 px-4 relative z-10 pt-24 pb-20">
        <div className="text-center max-w-4xl mx-auto">
          {/* Tagline */}
          <div className="hero-anim-down hero-delay-1 inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-medium text-primary mb-8">
            <Sparkles className="h-4 w-4" />
            <span>{t("hero.tagline")}</span>
          </div>

          {/* Title */}
          <h1 className="hero-anim hero-delay-2 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 text-gradient-math leading-tight">
            {t("hero.title")}
          </h1>

          {/* Subtitle */}
          <p className="hero-anim hero-delay-3 text-lg sm:text-xl text-muted-foreground mb-4 max-w-2xl mx-auto leading-relaxed">
            {t("hero.subtitle")}
          </p>

          {/* Rotating Equation */}
          <div className="hero-anim hero-delay-4 h-8 mb-10 flex items-center justify-center overflow-hidden" dir="ltr">
            {equations.map((eq, i) => (
              <span
                key={i}
                className={`absolute font-mono text-sm sm:text-base tracking-wider transition-all duration-700 ${
                  i === equationIndex ? "opacity-60 text-primary translate-y-0" : "opacity-0 translate-y-3"
                }`}
              >
                {eq}
              </span>
            ))}
          </div>

          {/* Search Box */}
          <form onSubmit={handleSearch} className="hero-anim hero-delay-5 max-w-2xl mx-auto mb-12">
            <div className="relative group">
              <div className="absolute -inset-1 bg-primary/15 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-500" />
              <div className="relative flex items-center glass rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary/30 transition-all duration-300">
                <Search className="absolute start-4 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("hero.searchPlaceholder")}
                  className="flex-1 bg-transparent px-12 py-4 text-base outline-none placeholder:text-muted-foreground"
                />
                <Button
                  type="submit"
                  className="m-1.5 rounded-xl px-6 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow"
                >
                  {t("hero.searchButton")}
                </Button>
              </div>
            </div>
          </form>

          {/* CTA Buttons */}
          <div className="hero-anim hero-delay-6 flex flex-wrap justify-center gap-4 mb-16">
            <Button
              size="lg"
              className="gap-2 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              asChild
            >
              <Link href="/stages">
                <BookOpen className="h-5 w-5" />
                {t("hero.browseStages")}
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="gap-2 rounded-xl glass hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              asChild
            >
              <Link href={isAuthenticated ? "/problems" : "/register"}>
                <Trophy className="h-5 w-5" />
                {t("hero.startChallenge")}
                {isRtl ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}