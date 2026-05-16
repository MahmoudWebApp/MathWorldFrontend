"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { Search, BookOpen, Trophy, ArrowRight, Sparkles, Users, FileText, CircleCheckBig, Globe } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AnimatedCounter } from "./AnimatedCounter";
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
  { symbol: "φ", className: "bottom-[32%] right-[11%]", size: "text-5xl", delay: "0.8s", duration: "7.5s", type: "float" },
  { symbol: "α", className: "top-[72%] right-[18%]", size: "text-3xl", delay: "2.5s", duration: "6s", type: "float-reverse" },
  { symbol: "λ", className: "bottom-[8%] left-[16%]", size: "text-4xl", delay: "1.8s", duration: "8s", type: "float" },
  { symbol: "∂", className: "top-[4%] left-[32%]", size: "text-3xl", delay: "0.3s", duration: "9s", type: "float-reverse" },
  { symbol: "∇", className: "bottom-[22%] left-[24%]", size: "text-4xl", delay: "2.2s", duration: "7s", type: "float" },
  { symbol: "ω", className: "top-[52%] right-[22%]", size: "text-3xl", delay: "1s", duration: "6.5s", type: "float-reverse" },
  { symbol: "ε", className: "top-[82%] left-[10%]", size: "text-4xl", delay: "2.8s", duration: "8s", type: "float" },
  { symbol: "β", className: "top-[35%] right-[30%]", size: "text-3xl", delay: "0.6s", duration: "7s", type: "float-reverse" },
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

  const stats = [
    { 
      icon: Users, 
      value: 10000, 
      label: t("hero.stats.students"), 
      suffix: "+",
      mathSymbol: "∑",
      mathBg: "from-blue-500/10 to-cyan-500/5 dark:from-blue-500/15 dark:to-cyan-500/5"
    },
    { 
      icon: FileText, 
      value: 5000, 
      label: t("hero.stats.problems"), 
      suffix: "+",
      mathSymbol: "∫",
      mathBg: "from-emerald-500/10 to-green-500/5 dark:from-emerald-500/15 dark:to-green-500/5"
    },
    { 
      icon: CircleCheckBig, 
      value: 50000, 
      label: t("hero.stats.solutions"), 
      suffix: "+",
      mathSymbol: "∞",
      mathBg: "from-amber-500/10 to-yellow-500/5 dark:from-amber-500/15 dark:to-yellow-500/5"
    },
    { 
      icon: Globe, 
      value: 45, 
      label: t("hero.stats.countries"), 
      suffix: "+",
      mathSymbol: "∂",
      mathBg: "from-rose-500/10 to-pink-500/5 dark:from-rose-500/15 dark:to-pink-500/5"
    },
  ];

  return (
    <section className={`relative min-h-[90vh] overflow-hidden ${mounted ? "hero-loaded" : ""}`}>
      {/* ===== Background Layers ===== */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.12] via-primary/[0.05] to-background dark:from-primary/[0.15] dark:via-primary/[0.08] dark:to-background" />
      <div className="absolute inset-0 math-grid-bg opacity-60" />
      
      {/* Coordinate Axes + Sine Wave */}
      <svg className="absolute bottom-0 left-0 w-72 h-72 opacity-[0.06] dark:opacity-[0.1] hidden lg:block" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <line x1="40" y1="160" x2="40" y2="20" stroke="currentColor" strokeWidth="1" />
        <line x1="40" y1="160" x2="190" y2="160" stroke="currentColor" strokeWidth="1" />
        <polygon points="40,18 36,28 44,28" fill="currentColor" />
        <polygon points="192,160 182,156 182,164" fill="currentColor" />
        <text x="28" y="100" fill="currentColor" fontSize="10" textAnchor="middle" transform="rotate(-90, 28, 100)">y</text>
        <text x="110" y="178" fill="currentColor" fontSize="10" textAnchor="middle">x</text>
        <path d="M 40,160 Q 65,80 90,160 Q 115,240 140,160 Q 165,80 190,160" fill="none" stroke="currentColor" strokeWidth="1.5" className="animate-draw-path" />
        <line x1="90" y1="156" x2="90" y2="164" stroke="currentColor" strokeWidth="0.8" />
        <line x1="140" y1="156" x2="140" y2="164" stroke="currentColor" strokeWidth="0.8" />
        <line x1="36" y1="100" x2="44" y2="100" stroke="currentColor" strokeWidth="0.8" />
      </svg>

      {/* Rotating Hexagon */}
      <svg className="absolute -top-10 -right-10 w-64 h-64 opacity-[0.05] dark:opacity-[0.08] animate-spin-slow hidden lg:block" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <polygon points="100,15 175,55 175,145 100,185 25,145 25,55" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <polygon points="100,40 155,65 155,135 100,160 45,135 45,65" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.5" />
      </svg>

      {/* Circle with Pi */}
      <svg className="absolute top-1/3 left-8 w-40 h-40 opacity-[0.05] dark:opacity-[0.09] animate-float-reverse hidden lg:block" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <circle cx="100" cy="100" r="75" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="100" cy="100" r="55" fill="none" stroke="currentColor" strokeWidth="0.6" strokeDasharray="4 4" />
        <line x1="100" y1="100" x2="175" y2="100" stroke="currentColor" strokeWidth="0.8" strokeDasharray="3 3" />
        <text x="130" y="92" fill="currentColor" fontSize="16" fontWeight="bold" fontFamily="serif">r</text>
        <text x="92" y="105" fill="currentColor" fontSize="14" fontFamily="serif">π</text>
      </svg>

      {/* Pythagorean Triangle */}
      <svg className="absolute bottom-16 right-16 w-36 h-36 opacity-[0.05] dark:opacity-[0.09] animate-float hidden lg:block" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <polygon points="30,170 170,170 170,30" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <polyline points="170,145 145,145 145,170" fill="none" stroke="currentColor" strokeWidth="0.8" />
        <text x="95" y="188" fill="currentColor" fontSize="11" textAnchor="middle" fontFamily="serif">a</text>
        <text x="182" y="105" fill="currentColor" fontSize="11" fontFamily="serif">b</text>
        <text x="80" y="90" fill="currentColor" fontSize="11" fontFamily="serif">c</text>
      </svg>

      {/* Orbiting Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] hidden xl:block">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary/30" />
        <div className="absolute inset-0 border border-primary/[0.04] rounded-full" />
        <div className="absolute -inset-10 border border-primary/[0.03] rounded-full" />
        <div className="absolute -inset-5 border border-primary/[0.03] rounded-full" />
        <div className="absolute inset-0 animate-orbit-1">
          <div className="w-2.5 h-2.5 rounded-full bg-primary/20 shadow-[0_0_8px_oklch(0.55_0.155_260/0.3)]" />
        </div>
        <div className="absolute -inset-10 animate-orbit-2">
          <div className="w-2 h-2 rounded-full bg-primary/15 shadow-[0_0_6px_oklch(0.55_0.155_260/0.2)]" />
        </div>
        <div className="absolute -inset-5 animate-orbit-3">
          <div className="w-1.5 h-1.5 rounded-full bg-primary/25 shadow-[0_0_6px_oklch(0.55_0.155_260/0.25)]" />
        </div>
      </div>

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
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/[0.05] dark:bg-primary/[0.03] rounded-full blur-[80px]" />

      {/* ===== Content ===== */}
      <div className="container mx-auto lg:px-24 md:px-16 px-4 relative z-10 pt-24 pb-20">
        <div className="text-center max-w-4xl mx-auto">
          {/* 1 — Tagline */}
          <div className="hero-anim-down hero-delay-1 inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-medium text-primary mb-8">
            <Sparkles className="h-4 w-4" />
            <span>{t("hero.tagline")}</span>
          </div>

          {/* 2 — Title */}
          <h1 className="hero-anim hero-delay-2 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 text-gradient-math leading-tight">
            {t("hero.title")}
          </h1>

          {/* 3 — Subtitle */}
          <p className="hero-anim hero-delay-3 text-lg sm:text-xl text-muted-foreground mb-4 max-w-2xl mx-auto leading-relaxed">
            {t("hero.subtitle")}
          </p>

          {/* 4 — Rotating Equation */}
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

          {/* 5 — Search Box */}
          <form onSubmit={handleSearch} className="hero-anim hero-delay-5 max-w-2xl mx-auto mb-12">
            <div className="relative group">
              <div className="absolute -inset-1 bg-primary/15 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-500" />
              <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center glass rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary/30 transition-all duration-300">
                <Search className="absolute start-4 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors sm:block hidden" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("hero.searchPlaceholder")}
                  className="flex-1 bg-transparent px-4 sm:px-12 py-4 text-base outline-none placeholder:text-muted-foreground min-h-[56px] sm:min-h-0"
                />
                <Button
                  type="submit"
                  className="m-1.5 rounded-xl px-4 sm:px-6 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow w-fit-content sm:w-auto justify-center"
                >
                  <Search className="h-4 w-4 sm:hidden" />
                  <span className="hidden sm:inline">{t("hero.searchButton")}</span>
                  <span className="sm:hidden">بحث</span>
                </Button>
              </div>
            </div>
          </form>

          {/* 6 — CTA Buttons */}
          <div className="hero-anim hero-delay-6 flex flex-wrap justify-center gap-4 mb-16">
            <Button
              size="lg"
              className="gap-2 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              asChild
            >
              <Link href="/categories">
                <BookOpen className="h-5 w-5" />
                {t("hero.browseCategories")}
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

          {/* 7 — Stats */}
          {/* تم تغيير الشبكة لتستوعب 4 عناصر بشكل متناسق */}
          <div className="hero-anim hero-delay-7 grid grid-cols-2 sm:grid-cols-4 gap-5 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="group relative h-full rounded-2xl border bg-card/80 dark:bg-card/40 backdrop-blur-sm overflow-hidden hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-500"
              >
                {/* Top gradient accent */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.mathBg.replace('/10', '/60').replace('/5', '/30').replace('/15', '/60')}`} />

                {/* Background math symbol */}
                <span className="absolute -bottom-4 -end-4 text-8xl font-serif text-primary/[0.04] dark:text-primary/[0.06] group-hover:text-primary/[0.08] dark:group-hover:text-primary/[0.1] transition-colors duration-500 select-none pointer-events-none" dir="ltr">
                  {stat.mathSymbol}
                </span>

                <div className="relative p-5 text-center">
                  {/* Icon */}
                  <div className={`flex h-11 w-11 mx-auto items-center justify-center rounded-xl bg-gradient-to-br ${stat.mathBg} mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                    <stat.icon className="h-5 w-5 text-primary" />
                  </div>

                  {/* Counter Value */}
                  <div className="text-2xl sm:text-3xl font-bold text-gradient-math mb-2">
                    {mounted ? (
                      <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                    ) : (
                      `${stat.value.toLocaleString()}${stat.suffix}`
                    )}
                  </div>

                  {/* Label */}
                  <div className="text-sm font-semibold text-muted-foreground group-hover:text-primary transition-colors duration-300">
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Wave Separator */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden -mb-px">
        <svg className="w-full h-12 md:h-20 text-muted/30 dark:text-muted/20" viewBox="0 0 1440 80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z" fill="currentColor" />
        </svg>
      </div>
    </section>
  );
}