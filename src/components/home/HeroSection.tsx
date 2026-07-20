"use client";

import { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { Search, BookOpen, Trophy, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { motion, useMotionValue, useSpring, useTransform, Variants, MotionValue } from "framer-motion";

const mathSymbols = [
  { symbol: "π", top: "10%", left: "5%", factor: 30 },
  { symbol: "Σ", top: "15%", left: "85%", factor: -40 },
  { symbol: "∫", top: "45%", left: "3%", factor: 50 },
  { symbol: "∞", top: "80%", left: "90%", factor: -30 },
  { symbol: "Δ", top: "65%", left: "8%", factor: 45 },
  { symbol: "θ", top: "25%", left: "15%", factor: -25 },
  { symbol: "∂", top: "8%", left: "35%", factor: 35 },
  { symbol: "∇", top: "75%", left: "25%", factor: -50 },
];

function MagneticSymbol({ 
  sym, 
  index, 
  springX, 
  springY, 
  isRtl 
}: { 
  sym: typeof mathSymbols[0], 
  index: number, 
  springX: MotionValue<number>, 
  springY: MotionValue<number>, 
  isRtl: boolean 
}) {
  const moveX = useTransform(springX, (x) => x * sym.factor * (isRtl ? -1 : 1));
  const moveY = useTransform(springY, (y) => y * sym.factor);

  return (
    <motion.div
      className="absolute text-5xl text-primary/[0.07] dark:text-primary/[0.12] font-serif pointer-events-none select-none hidden lg:block z-0"
      style={{ top: sym.top, left: sym.left, x: moveX, y: moveY }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, delay: index * 0.1 }}
    >
      {sym.symbol}
    </motion.div>
  );
}

export function HeroSection() {
  const t = useTranslations();
  const locale = useLocale();
  const isRtl = locale === "ar";
  const router = useRouter();
  
  // 1. All standard Hooks at the top
  const [searchQuery, setSearchQuery] = useState("");
  const [equationIndex, setEquationIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  
  const { user, token } = useSelector((state: RootState) => state.auth);
  
  // 2. Framer Motion Hooks
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  // Transform hooks for the grid lines
  const gridLineY = useTransform(springY, (y) => `calc(${50 + y * 100}% + 0px)`);
  const gridLineX = useTransform(springX, (x) => `calc(${50 + x * 100}% + 0px)`);

  const isAuthenticated = !!token && !!user;
  const equations: string[] = t.raw("hero.equations") || ["E = mc²", "a² + b² = c²", "e^(iπ) + 1 = 0"];
  const CYCLE_DURATION = 4000;

  // 3. Effects
  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setEquationIndex((prev) => (prev + 1) % equations.length);
    }, CYCLE_DURATION);
    return () => clearInterval(interval);
  }, [equations.length]);

  // 4. Handlers
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY, currentTarget } = e;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const x = (clientX - left) / width - 0.5;
    const y = (clientY - top) / height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/problems?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  // 5. Variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.2 },
    },
  };

  const childVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
  };

  // --- CRITICAL FIX: No Early Returns Before This Point ---

  return (
    <section 
      className={`relative min-h-[90vh] overflow-hidden cursor-default transition-opacity duration-500 ${mounted ? "opacity-100" : "opacity-0"}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { mouseX.set(0); mouseY.set(0); }}
    >
      {/* We only render the heavy animations if mounted to avoid hydration errors, 
          but we do it INSIDE the main return block */}
      {mounted && (
        <>
          {/* Dynamic Coordinate Grid */}
          <motion.div 
            className="absolute left-0 right-0 h-[1px] bg-primary/20 pointer-events-none z-0 hidden lg:block"
            style={{ top: gridLineY }}
          />
          <motion.div 
            className="absolute top-0 bottom-0 w-[1px] bg-primary/20 pointer-events-none z-0 hidden lg:block"
            style={{ left: gridLineX }}
          />

          {/* Background Layers */}
          <div className="absolute inset-0 brand-hero-bg -z-20" />
          <div className="absolute inset-0 math-grid-bg opacity-50 dark:opacity-30 -z-10" />

          {/* Magnetic Math Symbols */}
          {mathSymbols.map((sym, index) => (
            <MagneticSymbol 
              key={index} 
              sym={sym} 
              index={index} 
              springX={springX} 
              springY={springY} 
              isRtl={isRtl} 
            />
          ))}

          {/* Glow Orbs */}
          <div className="absolute top-1/4 -left-32 h-96 w-96 rounded-full bg-[#53B2D824] blur-[120px] animate-pulse -z-10 dark:bg-[#53B2D81A]" />
          <div className="absolute bottom-1/4 -right-32 h-80 w-80 rounded-full bg-[#2F73A31F] blur-[100px] animate-pulse -z-10 dark:bg-[#3491C317]" style={{ animationDelay: "2s" }} />

          {/* Main Content */}
          <div className="container mx-auto lg:px-24 md:px-16 px-4 relative z-10 pt-24 pb-20">
            <div className="text-center max-w-4xl mx-auto flex flex-col items-center">
              
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 rounded-full border border-[#C7E1EC] bg-[#FFFFFFCC] px-4 py-2 text-sm font-semibold text-[#2F73A3] shadow-sm backdrop-blur-md mb-8 dark:border-[#3B6278] dark:bg-[#0D2030CC] dark:text-[#78CBE8]"
              >
                <Sparkles className="h-4 w-4" />
                <span>{t("hero.tagline")}</span>
              </motion.div>

              {/* Staggered Title Reveal */}
              <motion.h1 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="brand-display-title text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 text-gradient-math flex flex-wrap justify-center gap-x-4"
              >
                {t("hero.title").split(" ").map((word, i) => (
                  <motion.span key={i} variants={childVariants} className="inline-block">
                    {word}
                  </motion.span>
                ))}
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-lg sm:text-xl text-muted-foreground mb-4 max-w-2xl mx-auto leading-relaxed"
              >
                {t("hero.subtitle")}
              </motion.p>

              {/* Rotating Equation */}
              <div className="h-8 mb-10 flex items-center justify-center overflow-hidden relative w-full" dir="ltr">
                {equations.map((eq, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 20, rotateX: -90 }}
                    animate={{ 
                      opacity: i === equationIndex ? 1 : 0, 
                      y: i === equationIndex ? 0 : -20,
                      rotateX: i === equationIndex ? 0 : 90
                    }}
                    transition={{ duration: 0.6, type: "spring" }}
                    className="absolute font-mono text-xl sm:text-2xl tracking-wider text-primary font-bold"
                  >
                    {eq}
                  </motion.span>
                ))}
              </div>

           {/* Search Box */}
              <motion.form 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                onSubmit={handleSearch} 
                className="w-full max-w-2xl mx-auto mb-12 px-2 sm:px-0"
              >
                <div className="relative group">
                  <div className="absolute -inset-1 rounded-2xl bg-[#53B2D824] blur-xl opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-500" />
                  <div className="brand-surface relative flex items-center overflow-hidden rounded-2xl bg-background/80 backdrop-blur-xl focus-within:border-[#53B2D8] focus-within:ring-4 focus-within:ring-[#53B2D826] transition-all duration-300">
                    <Search className="absolute start-3 sm:start-4 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t("hero.searchPlaceholder")}
                      className="flex-1 bg-transparent ps-10 pe-3 sm:ps-12 sm:pe-4 py-3 sm:py-4 text-sm sm:text-base outline-none placeholder:text-muted-foreground w-full min-w-0"
                    />
                    <Button 
                      type="submit" 
                      size="sm"
                      className="m-1 sm:m-1.5 rounded-xl px-4 sm:px-6 h-9 sm:h-11 shadow-lg whitespace-nowrap text-xs sm:text-base"
                    >
                      {t("hero.searchButton")}
                    </Button>
                  </div>
                </div>
              </motion.form>

              {/* CTA Buttons */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="flex flex-wrap justify-center gap-4 mb-16"
              >
                <Button size="lg" className="gap-2 rounded-xl" asChild>
                  <Link href="/stages">
                    <BookOpen className="h-5 w-5" />
                    {t("hero.browseStages")}
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="gap-2 rounded-xl backdrop-blur-md" asChild>
                  <Link href={isAuthenticated ? "/problems" : "/register"}>
                    <Trophy className="h-5 w-5" />
                    {t("hero.startChallenge")}
                    <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                  </Link>
                </Button>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}