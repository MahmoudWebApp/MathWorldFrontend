"use client";

import { useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { Card, CardContent } from "@/components/ui/Card";
import Image from "next/image";

const mathSymbols = [
  { symbol: "x²", equation: "ax² + bx + c = 0" },
  { symbol: "πr²", equation: "S = πr²" },
  { symbol: "∫", equation: "∫ f(x) dx" },
  { symbol: "σ", equation: "μ ± σ" },
  { symbol: "n!", equation: "gcd(a, b)" },
  { symbol: "P(A)", equation: "nCr × pʳ" },
  { symbol: "sinθ", equation: "sin²θ + cos²θ = 1" },
  { symbol: "[A]", equation: "Ax = λx" },
  { symbol: "∑", equation: "f(x) = ∑ xᵢ" },
  { symbol: "∂", equation: "∂f/∂x" },
  { symbol: "∇", equation: "∇ × F" },
  { symbol: "∞", equation: "lim (x→∞)" },
];

const colorGradients = [
  "from-blue-500/10 to-indigo-500/5 dark:from-blue-500/15 dark:to-indigo-500/5",
  "from-emerald-500/10 to-teal-500/5 dark:from-emerald-500/15 dark:to-teal-500/5",
  "from-amber-500/10 to-orange-500/5 dark:from-amber-500/15 dark:to-orange-500/5",
  "from-rose-500/10 to-pink-500/5 dark:from-rose-500/15 dark:to-pink-500/5",
  "from-violet-500/10 to-purple-500/5 dark:from-violet-500/15 dark:to-purple-500/5",
  "from-cyan-500/10 to-sky-500/5 dark:from-cyan-500/15 dark:to-sky-500/5",
  "from-fuchsia-500/10 to-pink-500/5 dark:from-fuchsia-500/15 dark:to-pink-500/5",
  "from-lime-500/10 to-green-500/5 dark:from-lime-500/15 dark:to-green-500/5",
];

interface CategoryCardProps {
  category: any; // استبدل any بـ Category type عندك إذا موجود
  index: number;
  isInView: boolean;
}

export function CategoryCard({ category, index, isInView }: CategoryCardProps) {
  const locale = useLocale();

  // Random but deterministic assignment based on Category ID
  const math = mathSymbols[category.Id % mathSymbols.length];
  const colorClass = colorGradients[category.Id % colorGradients.length];
  const iconUrl = category.Icon;

  return (
    <div
      className={`transition-all duration-700 ${
        isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
      }`}
      style={{ transitionDelay: isInView ? `${index * 60}ms` : "0ms" }}
    >
      <Link href={`/problems?category=${category.Id}`} className="block group">
        <Card className="relative overflow-hidden border-0 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 cursor-pointer h-full hover:-translate-y-1">
          <div
            className={`absolute inset-0 bg-gradient-to-br ${colorClass} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
          />
          <div className="absolute inset-0 opacity-[0.02] group-hover:opacity-[0.04] transition-opacity duration-500 math-grid-bg" />

          <CardContent className="relative p-5 lg:p-6 flex flex-col items-center text-center gap-3">
            <div className="relative">
              // داخل CategoryCard.tsx، غير جزء الأيقونة إلى:
              <div className="flex h-14 w-14 lg:h-16 lg:w-16 items-center justify-center rounded-2xl bg-primary/[0.08] dark:bg-primary/[0.12] group-hover:bg-primary/10 dark:group-hover:bg-primary/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                {iconUrl ? (
                  iconUrl.startsWith("http") || iconUrl.startsWith("/") ? (
                    <Image
                      src={iconUrl}
                      alt={locale === "ar" ? category.NameAr : category.NameEn}
                      width={32}
                      height={32}
                      className="h-8 w-8 lg:h-9 lg:w-9 object-contain"
                    />
                  ) : (
                    <span className="text-2xl lg:text-3xl">{iconUrl}</span>
                  )
                ) : (
                  <span className="font-serif text-xl lg:text-2xl font-bold text-primary">
                    {math.symbol}
                  </span>
                )}
              </div>
              <div className="absolute -inset-2 rounded-2xl border border-primary/0 group-hover:border-primary/20 transition-all duration-500" />
            </div>

            <div>
              <h3 className="font-semibold group-hover:text-primary transition-colors duration-300 text-sm lg:text-base">
                {locale === "ar" ? category.NameAr : category.NameEn}
              </h3>
            </div>

            <span
              className="font-mono text-[10px] lg:text-xs text-primary/0 group-hover:text-primary/40 transition-all duration-500 -mt-1"
              dir="ltr"
            >
              {math.equation}
            </span>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
