"use client";

import { useState, useCallback } from "react";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/Tooltip";
import { cn } from "@/lib/utils";

/* ────────────────────────────────────────────
   TYPES
   ──────────────────────────────────────────── */

type SymbolItem = {
  label: string;
  code: string;
  ar: string;
  en: string;
};

type Category = {
  id: string;
  ar: string;
  en: string;
  items: SymbolItem[];
};

type LevelData = {
  id: string;
  ar: string;
  en: string;
  categories: Category[];
};

/* ────────────────────────────────────────────
   LATEX MATH LIBRARY
   ──────────────────────────────────────────── */

const LATEX_LIBRARY: LevelData[] = [
  {
    id: "basic",
    ar: "أساسيات",
    en: "Basic",
    categories: [
      {
        id: "arithmetic",
        ar: "العمليات الحسابية",
        en: "Arithmetic",
        items: [
          { label: "+",   code: "+",         ar: "جمع",              en: "Addition" },
          { label: "−",   code: "-",         ar: "طرح",              en: "Subtraction" },
          { label: "×",   code: "\\times",   ar: "ضرب",              en: "Multiplication" },
          { label: "÷",   code: "\\div",     ar: "قسمة",             en: "Division" },
          { label: "=",   code: "=",         ar: "يساوي",            en: "Equals" },
          { label: "≠",   code: "\\neq",     ar: "لا يساوي",         en: "Not equal" },
          { label: "±",   code: "\\pm",      ar: "زائد أو ناقص",     en: "Plus-minus" },
          { label: "∓",   code: "\\mp",      ar: "ناقص أو زائد",     en: "Minus-plus" },
        ],
      },
      {
        id: "compare",
        ar: "المقارنة",
        en: "Comparison",
        items: [
          { label: "<",  code: "<",          ar: "أصغر من",           en: "Less than" },
          { label: ">",  code: ">",          ar: "أكبر من",           en: "Greater than" },
          { label: "≤",  code: "\\leq",      ar: "أصغر أو يساوي",    en: "Less or equal" },
          { label: "≥",  code: "\\geq",      ar: "أكبر أو يساوي",    en: "Greater or equal" },
          { label: "≈",  code: "\\approx",   ar: "تقريباً",           en: "Approximately" },
          { label: "∼",  code: "\\sim",      ar: "يشابه",             en: "Similar to" },
          { label: "≡",  code: "\\equiv",    ar: "مكافئ",             en: "Equivalent" },
          { label: "∝",  code: "\\propto",   ar: "يتناسب مع",        en: "Proportional to" },
        ],
      },
      {
        id: "frac_roots",
        ar: "كسور وجذور",
        en: "Fractions & Roots",
        items: [
          { label: "a/b",  code: "\\frac{a}{b}",    ar: "كسر",               en: "Fraction" },
          { label: "½",    code: "\\frac{1}{2}",    ar: "نصف",               en: "One half" },
          { label: "√",    code: "\\sqrt{x}",       ar: "جذر تربيعي",        en: "Square root" },
          { label: "∛",    code: "\\sqrt[3]{x}",    ar: "جذر تكعيبي",        en: "Cube root" },
          { label: "ⁿ√",   code: "\\sqrt[n]{x}",    ar: "جذر نوني",          en: "N-th root" },
          { label: "xⁿ",   code: "x^{n}",           ar: "أُس",               en: "Power" },
          { label: "x²",   code: "x^{2}",           ar: "تربيع",             en: "Square" },
          { label: "|x|",  code: "|x|",             ar: "قيمة مطلقة",        en: "Absolute value" },
        ],
      },
      {
        id: "constants",
        ar: "ثوابت",
        en: "Constants",
        items: [
          { label: "π",   code: "\\pi",          ar: "باي",               en: "Pi" },
          { label: "e",   code: "e",             ar: "العدد النيبيري",     en: "Euler's number" },
          { label: "∞",   code: "\\infty",       ar: "اللانهاية",         en: "Infinity" },
          { label: "i",   code: "i",             ar: "الوحدة التخيلية",   en: "Imaginary unit" },
          { label: "φ",   code: "\\varphi",      ar: "النسبة الذهبية",    en: "Golden ratio" },
        ],
      },
    ],
  },

  {
    id: "algebra",
    ar: "جبر",
    en: "Algebra",
    categories: [
      {
        id: "poly",
        ar: "كثيرات الحدود",
        en: "Polynomials",
        items: [
          { label: "Δ",      code: "\\Delta",             ar: "المميّز",              en: "Discriminant" },
          { label: "(a+b)²", code: "(a+b)^{2}",           ar: "مربع ثنائي",           en: "Binomial square" },
          { label: "(a+b)³", code: "(a+b)^{3}",           ar: "مكعب ثنائي",           en: "Binomial cube" },
          { label: "C(n,k)", code: "\\binom{n}{k}",       ar: "توافيق",               en: "Combination" },
          { label: "n!",     code: "n!",                  ar: "مضروب",                en: "Factorial" },
          { label: "Pₙ,ₖ",  code: "P(n,k)",              ar: "تبديلات",              en: "Permutation" },
          { label: "Σ",      code: "\\sum_{i=1}^{n}",     ar: "مجموع متسلسلة",        en: "Summation" },
          { label: "∏",      code: "\\prod_{i=1}^{n}",    ar: "جداء",                 en: "Product" },
        ],
      },
      {
        id: "sets",
        ar: "مجموعات",
        en: "Sets",
        items: [
          { label: "∈",  code: "\\in",          ar: "ينتمي إلى",          en: "Element of" },
          { label: "∉",  code: "\\notin",       ar: "لا ينتمي إلى",      en: "Not element of" },
          { label: "∪",  code: "\\cup",         ar: "اتحاد",              en: "Union" },
          { label: "∩",  code: "\\cap",         ar: "تقاطع",              en: "Intersection" },
          { label: "⊂",  code: "\\subset",      ar: "جزء من",             en: "Subset of" },
          { label: "⊆",  code: "\\subseteq",    ar: "جزء من أو يساوي",   en: "Subset or equal" },
          { label: "∅",  code: "\\emptyset",    ar: "مجموعة خالية",       en: "Empty set" },
          { label: "Aᶜ", code: "A^{c}",         ar: "مكمل المجموعة",      en: "Complement" },
          { label: "ℝ",  code: "\\mathbb{R}",   ar: "الأعداد الحقيقية",   en: "Real numbers" },
          { label: "ℤ",  code: "\\mathbb{Z}",   ar: "الأعداد الصحيحة",    en: "Integers" },
          { label: "ℚ",  code: "\\mathbb{Q}",   ar: "الأعداد النسبية",    en: "Rationals" },
          { label: "ℕ",  code: "\\mathbb{N}",   ar: "الأعداد الطبيعية",   en: "Natural numbers" },
          { label: "ℂ",  code: "\\mathbb{C}",   ar: "الأعداد العقدية",    en: "Complex numbers" },
        ],
      },
      {
        id: "functions",
        ar: "دوال",
        en: "Functions",
        items: [
          { label: "f(x)",  code: "f(x)",                ar: "دالة",              en: "Function" },
          { label: "f∘g",   code: "f \\circ g",          ar: "تركيب دالتين",      en: "Composition" },
          { label: "f⁻¹",   code: "f^{-1}(x)",           ar: "دالة عكسية",        en: "Inverse function" },
          { label: "→",     code: "\\rightarrow",        ar: "يؤول إلى",          en: "Maps to" },
          { label: "↦",     code: "\\mapsto",            ar: "تعيين",             en: "Mapsto" },
          { label: "dom",   code: "\\text{dom}(f)",      ar: "مجال الدالة",       en: "Domain" },
          { label: "rng",   code: "\\text{ran}(f)",      ar: "مدى الدالة",        en: "Range" },
        ],
      },
      {
        id: "log_exp",
        ar: "أُسُس ولوغاريتمات",
        en: "Exp & Log",
        items: [
          { label: "aⁿ",    code: "a^{n}",             ar: "أُس",                  en: "Exponent" },
          { label: "eˣ",    code: "e^{x}",             ar: "الدالة الأسية",        en: "Exponential" },
          { label: "log",   code: "\\log_{a} b",       ar: "لوغاريتم",             en: "Logarithm" },
          { label: "ln",    code: "\\ln x",            ar: "لوغاريتم طبيعي",       en: "Natural log" },
          { label: "log₁₀", code: "\\log_{10} x",      ar: "لوغاريتم عشري",        en: "Common log" },
        ],
      },
    ],
  },

  {
    id: "trigonometry",
    ar: "مثلثات",
    en: "Trigonometry",
    categories: [
      {
        id: "basic_trig",
        ar: "الدوال الأساسية",
        en: "Basic Functions",
        items: [
          { label: "sin",  code: "\\sin\\theta",   ar: "جيب",             en: "Sine" },
          { label: "cos",  code: "\\cos\\theta",   ar: "جيب تمام",        en: "Cosine" },
          { label: "tan",  code: "\\tan\\theta",   ar: "ظل",              en: "Tangent" },
          { label: "csc",  code: "\\csc\\theta",   ar: "قاطع التمام",     en: "Cosecant" },
          { label: "sec",  code: "\\sec\\theta",   ar: "قاطع",            en: "Secant" },
          { label: "cot",  code: "\\cot\\theta",   ar: "ظل التمام",       en: "Cotangent" },
        ],
      },
      {
        id: "inv_trig",
        ar: "الدوال العكسية",
        en: "Inverse Functions",
        items: [
          { label: "arcsin",  code: "\\arcsin x",  ar: "جيب عكسي",         en: "Arcsine" },
          { label: "arccos",  code: "\\arccos x",  ar: "جيب تمام عكسي",    en: "Arccosine" },
          { label: "arctan",  code: "\\arctan x",  ar: "ظل عكسي",          en: "Arctangent" },
          { label: "sinh",    code: "\\sinh x",    ar: "جيب زائدي",        en: "Hyperbolic sine" },
          { label: "cosh",    code: "\\cosh x",    ar: "جيب تمام زائدي",   en: "Hyperbolic cosine" },
          { label: "tanh",    code: "\\tanh x",    ar: "ظل زائدي",         en: "Hyperbolic tangent" },
        ],
      },
      {
        id: "angles",
        ar: "الزوايا والرموز",
        en: "Angles & Symbols",
        items: [
          { label: "θ",   code: "\\theta",      ar: "ثيتا",             en: "Theta" },
          { label: "α",   code: "\\alpha",      ar: "ألفا",             en: "Alpha" },
          { label: "β",   code: "\\beta",       ar: "بيتا",             en: "Beta" },
          { label: "γ",   code: "\\gamma",      ar: "غاما",             en: "Gamma" },
          { label: "φ",   code: "\\phi",        ar: "في",               en: "Phi" },
          { label: "ψ",   code: "\\psi",        ar: "سي",               en: "Psi" },
          { label: "°",   code: "^{\\circ}",    ar: "درجة",             en: "Degree" },
          { label: "rad", code: "\\text{rad}",  ar: "راديان",           en: "Radian" },
          { label: "∠",   code: "\\angle",      ar: "زاوية",            en: "Angle" },
        ],
      },
    ],
  },

  {
    id: "calculus",
    ar: "تفاضل وتكامل",
    en: "Calculus",
    categories: [
      {
        id: "limits",
        ar: "النهايات",
        en: "Limits",
        items: [
          { label: "lim",   code: "\\lim_{x \\to a} f(x)",    ar: "نهاية",              en: "Limit" },
          { label: "x→∞",   code: "x \\to \\infty",           ar: "يؤول إلى اللانهاية", en: "Tends to ∞" },
          { label: "x→0⁺",  code: "x \\to 0^{+}",            ar: "نهاية يمينية",       en: "Right-hand limit" },
          { label: "x→0⁻",  code: "x \\to 0^{-}",            ar: "نهاية يسارية",       en: "Left-hand limit" },
        ],
      },
      {
        id: "derivatives",
        ar: "المشتقات",
        en: "Derivatives",
        items: [
          { label: "f'",      code: "f'(x)",                          ar: "المشتقة الأولى",    en: "First derivative" },
          { label: "f''",     code: "f''(x)",                         ar: "المشتقة الثانية",   en: "Second derivative" },
          { label: "f⁽ⁿ⁾",   code: "f^{(n)}(x)",                    ar: "المشتقة النونية",   en: "N-th derivative" },
          { label: "dy/dx",   code: "\\frac{dy}{dx}",                 ar: "تدوين ليبنيز",      en: "Leibniz notation" },
          { label: "d²y/dx²", code: "\\frac{d^{2}y}{dx^{2}}",        ar: "مشتقة ثانية",       en: "Second derivative" },
          { label: "∂f/∂x",   code: "\\frac{\\partial f}{\\partial x}", ar: "مشتقة جزئية",    en: "Partial derivative" },
          { label: "∇",       code: "\\nabla",                        ar: "نابلا / تدرج",      en: "Nabla / Gradient" },
          { label: "Δ",       code: "\\Delta",                        ar: "تغيُّر",            en: "Change" },
        ],
      },
      {
        id: "integrals",
        ar: "التكاملات",
        en: "Integrals",
        items: [
          { label: "∫",    code: "\\int f(x)\\,dx",             ar: "تكامل غير محدد",     en: "Indefinite integral" },
          { label: "∫ₐᵇ",  code: "\\int_{a}^{b} f(x)\\,dx",    ar: "تكامل محدد",         en: "Definite integral" },
          { label: "∬",    code: "\\iint_{R} f\\,dA",           ar: "تكامل مزدوج",        en: "Double integral" },
          { label: "∭",    code: "\\iiint_{V} f\\,dV",          ar: "تكامل ثلاثي",        en: "Triple integral" },
          { label: "∮",    code: "\\oint_{C} f\\,ds",           ar: "تكامل خطي مغلق",     en: "Line integral" },
        ],
      },
      {
        id: "series",
        ar: "المتسلسلات",
        en: "Series",
        items: [
          { label: "Σ∞",   code: "\\sum_{n=0}^{\\infty} a_n",   ar: "مجموع لانهائي",      en: "Infinite series" },
          { label: "aₙ",   code: "a_{n}",                        ar: "الحد العام",          en: "General term" },
          { label: "S∞",   code: "S_{\\infty}",                  ar: "مجموع اللانهاية",     en: "Sum to infinity" },
          { label: "∏",    code: "\\prod_{i=1}^{n} a_i",        ar: "جداء",                en: "Product notation" },
        ],
      },
    ],
  },

  {
    id: "linear_algebra",
    ar: "جبر خطي",
    en: "Linear Algebra",
    categories: [
      {
        id: "matrices",
        ar: "المصفوفات",
        en: "Matrices",
        items: [
          { label: "[2×2]",  code: "\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}",           ar: "مصفوفة 2×2",       en: "2×2 matrix" },
          { label: "[3×3]",  code: "\\begin{pmatrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{pmatrix}", ar: "مصفوفة 3×3", en: "3×3 matrix" },
          { label: "det",    code: "\\det(A)",    ar: "محدد المصفوفة",   en: "Determinant" },
          { label: "A⁻¹",   code: "A^{-1}",     ar: "مصفوفة معكوسة",   en: "Inverse matrix" },
          { label: "Aᵀ",    code: "A^{T}",      ar: "مصفوفة منقولة",   en: "Transpose" },
          { label: "I",     code: "\\mathbf{I}",ar: "مصفوفة الوحدة",   en: "Identity matrix" },
          { label: "rank",  code: "\\text{rank}(A)", ar: "رتبة المصفوفة", en: "Matrix rank" },
          { label: "tr",    code: "\\text{tr}(A)",   ar: "أثر المصفوفة",   en: "Trace" },
        ],
      },
      {
        id: "vectors",
        ar: "المتجهات",
        en: "Vectors",
        items: [
          { label: "v⃗",    code: "\\vec{v}",              ar: "متجه",                 en: "Vector" },
          { label: "‖v‖",   code: "\\|\\vec{v}\\|",        ar: "معيار المتجه",         en: "Vector norm" },
          { label: "v·w",   code: "\\vec{v} \\cdot \\vec{w}", ar: "حاصل الضرب النقطي", en: "Dot product" },
          { label: "v×w",   code: "\\vec{v} \\times \\vec{w}", ar: "الضرب الاتجاهي",  en: "Cross product" },
          { label: "λ",     code: "\\lambda",              ar: "قيمة ذاتية",           en: "Eigenvalue" },
          { label: "⊗",     code: "\\otimes",              ar: "جداء تنسوري",          en: "Tensor product" },
        ],
      },
    ],
  },

  {
    id: "statistics",
    ar: "إحصاء واحتمالات",
    en: "Statistics & Probability",
    categories: [
      {
        id: "stats",
        ar: "الإحصاء",
        en: "Statistics",
        items: [
          { label: "x̄",    code: "\\bar{x}",        ar: "الوسط الحسابي",      en: "Sample mean" },
          { label: "μ",    code: "\\mu",            ar: "الوسط السكاني",       en: "Population mean" },
          { label: "σ",    code: "\\sigma",         ar: "الانحراف المعياري",   en: "Standard deviation" },
          { label: "σ²",   code: "\\sigma^{2}",     ar: "التباين",             en: "Variance" },
          { label: "s²",   code: "s^{2}",           ar: "تباين العينة",        en: "Sample variance" },
          { label: "med",  code: "\\text{med}",     ar: "الوسيط",              en: "Median" },
          { label: "mod",  code: "\\text{mod}",     ar: "المنوال",             en: "Mode" },
          { label: "CV",   code: "CV = \\frac{\\sigma}{\\bar{x}}", ar: "معامل الاختلاف", en: "Coef. of variation" },
        ],
      },
      {
        id: "probability",
        ar: "الاحتمالات",
        en: "Probability",
        items: [
          { label: "P(A)",    code: "P(A)",            ar: "احتمال الحدث",        en: "Probability of A" },
          { label: "P(A|B)",  code: "P(A|B)",          ar: "احتمال شرطي",         en: "Conditional probability" },
          { label: "P(A∩B)",  code: "P(A \\cap B)",    ar: "احتمال التقاطع",      en: "Joint probability" },
          { label: "P(A∪B)",  code: "P(A \\cup B)",    ar: "احتمال الاتحاد",      en: "Union probability" },
          { label: "E(X)",    code: "E(X)",            ar: "القيمة المتوقعة",     en: "Expected value" },
          { label: "Var(X)",  code: "\\text{Var}(X)",  ar: "التباين",             en: "Variance" },
          { label: "~N",      code: "X \\sim N(\\mu, \\sigma^{2})", ar: "توزيع طبيعي", en: "Normal distribution" },
          { label: "~B",      code: "X \\sim B(n,p)",  ar: "توزيع ثنائي الحدين", en: "Binomial distribution" },
        ],
      },
    ],
  },

  {
    id: "geometry",
    ar: "هندسة",
    en: "Geometry",
    categories: [
      {
        id: "shapes",
        ar: "الأشكال والزوايا",
        en: "Shapes & Angles",
        items: [
          { label: "∠",   code: "\\angle",          ar: "زاوية",         en: "Angle" },
          { label: "△",   code: "\\triangle ABC",   ar: "مثلث",          en: "Triangle" },
          { label: "∥",   code: "\\parallel",       ar: "موازٍ",         en: "Parallel" },
          { label: "⊥",   code: "\\perp",           ar: "عمودي",         en: "Perpendicular" },
          { label: "≅",   code: "\\cong",           ar: "متطابق",        en: "Congruent" },
          { label: "∼",   code: "\\sim",            ar: "متشابه",        en: "Similar" },
          { label: "arc", code: "\\overset{\\frown}{AB}", ar: "قوس", en: "Arc" },
        ],
      },
      {
        id: "formulas",
        ar: "المساحات والأحجام",
        en: "Areas & Volumes",
        items: [
          { label: "πr²",    code: "\\pi r^{2}",              ar: "مساحة دائرة",   en: "Circle area" },
          { label: "2πr",    code: "2\\pi r",                  ar: "محيط دائرة",    en: "Circumference" },
          { label: "½bh",    code: "\\frac{1}{2}bh",           ar: "مساحة مثلث",    en: "Triangle area" },
          { label: "4πr²",   code: "4\\pi r^{2}",              ar: "مساحة سطح كرة", en: "Sphere surface" },
          { label: "⁴⁄₃πr³", code: "\\frac{4}{3}\\pi r^{3}",  ar: "حجم كرة",       en: "Sphere volume" },
          { label: "a²+b²",  code: "a^{2}+b^{2}=c^{2}",       ar: "فيثاغورس",      en: "Pythagorean theorem" },
        ],
      },
    ],
  },

  {
    id: "logic",
    ar: "منطق ورياضيات منفصلة",
    en: "Logic & Discrete Math",
    categories: [
      {
        id: "logic_ops",
        ar: "العمليات المنطقية",
        en: "Logical Operations",
        items: [
          { label: "∀",   code: "\\forall",   ar: "لكل",                  en: "For all" },
          { label: "∃",   code: "\\exists",   ar: "يوجد",                 en: "There exists" },
          { label: "¬",   code: "\\neg",      ar: "نفي (NOT)",            en: "Negation" },
          { label: "∧",   code: "\\wedge",    ar: "و (AND)",              en: "Logical AND" },
          { label: "∨",   code: "\\vee",      ar: "أو (OR)",              en: "Logical OR" },
          { label: "⟹",  code: "\\implies",  ar: "يستلزم",               en: "Implies" },
          { label: "⟺",  code: "\\iff",      ar: "إذا وفقط إذا",         en: "If and only if" },
          { label: "⊕",   code: "\\oplus",    ar: "أو الحصري (XOR)",      en: "Exclusive OR" },
        ],
      },
      {
        id: "number_theory",
        ar: "نظرية الأعداد",
        en: "Number Theory",
        items: [
          { label: "mod",   code: "a \\bmod n",        ar: "باقي القسمة",           en: "Modulo" },
          { label: "⌊x⌋",  code: "\\lfloor x \\rfloor", ar: "أكبر صحيح أصغر",    en: "Floor function" },
          { label: "⌈x⌉",  code: "\\lceil x \\rceil",  ar: "أصغر صحيح أكبر",     en: "Ceiling function" },
          { label: "gcd",  code: "\\gcd(a,b)",          ar: "القاسم المشترك الأكبر", en: "Greatest common divisor" },
          { label: "lcm",  code: "\\text{lcm}(a,b)",    ar: "المضاعف المشترك الأصغر", en: "Least common multiple" },
          { label: "a|b",  code: "a \\mid b",           ar: "a يقسم b",            en: "a divides b" },
        ],
      },
    ],
  },
];

/* ────────────────────────────────────────────
   COMPONENT
   ──────────────────────────────────────────── */

interface LatexToolbarAdvancedProps {
  /** ref of the textarea to insert code into */
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  className?: string;
  defaultLevelId?: string;
  /** compact mode hides the footer manual-entry button */
  compact?: boolean;
}

export function LatexToolbarAdvanced({
  textareaRef,
  className,
  defaultLevelId = "basic",
  compact = false,
}: LatexToolbarAdvancedProps) {
  const locale = useLocale();
  const isAr = locale === "ar";

  const defaultLevel = LATEX_LIBRARY.find((l) => l.id === defaultLevelId) ?? LATEX_LIBRARY[0];
  const [activeLevel, setActiveLevel] = useState<LevelData>(defaultLevel);
  const [activeCat, setActiveCat] = useState<Category>(defaultLevel.categories[0]);

  const handleLevelChange = (level: LevelData) => {
    setActiveLevel(level);
    setActiveCat(level.categories[0]);
  };

  /* Insert LaTeX code at the textarea cursor position */
  const insertAtCursor = useCallback(
    (code: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const val = textarea.value;
      const newVal = val.substring(0, start) + code + val.substring(end);

      /* Trigger React synthetic onChange */
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        "value"
      )?.set;
      setter?.call(textarea, newVal);
      textarea.dispatchEvent(new Event("input", { bubbles: true }));

      textarea.focus();
      setTimeout(() => {
        /* Place cursor inside {} if present */
        const braceIndex = code.indexOf("{}");
        if (braceIndex !== -1) {
          textarea.setSelectionRange(start + braceIndex + 1, start + braceIndex + 1);
        } else {
          textarea.setSelectionRange(start + code.length, start + code.length);
        }
      }, 0);
    },
    [textareaRef]
  );

  const name = (item: { ar: string; en: string }) => (isAr ? item.ar : item.en);

  return (
    <div
      className={cn(
        "rounded-t-lg border border-b-0 bg-muted/40 p-2 space-y-2",
        className
      )}
    >
      {/* ── Level tabs ── */}
      <div
        className="flex gap-1 border-b border-border/50 pb-2 overflow-x-auto scrollbar-none"
        role="tablist"
        aria-label={isAr ? "المستويات" : "Math levels"}
      >
        {LATEX_LIBRARY.map((level) => (
          <button
            key={level.id}
            type="button"
            role="tab"
            aria-selected={activeLevel.id === level.id}
            onClick={() => handleLevelChange(level)}
            className={cn(
              "px-3 py-1.5 text-xs rounded-md transition-colors whitespace-nowrap font-medium",
              activeLevel.id === level.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {name(level)}
          </button>
        ))}
      </div>

      {/* ── Category tabs ── */}
      <div
        className="flex gap-1 overflow-x-auto scrollbar-none"
        role="tablist"
        aria-label={isAr ? "الفئات" : "Categories"}
      >
        {activeLevel.categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            role="tab"
            aria-selected={activeCat.id === cat.id}
            onClick={() => setActiveCat(cat)}
            className={cn(
              "px-2.5 py-1 text-xs rounded-md transition-colors whitespace-nowrap",
              activeCat.id === cat.id
                ? "bg-secondary text-secondary-foreground font-medium"
                : "text-muted-foreground hover:bg-muted/60"
            )}
          >
            {name(cat)}
          </button>
        ))}
      </div>

      {/* ── Symbol grid ── */}
      <div
        className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-1.5 py-1"
        role="group"
        aria-label={isAr ? "رموز LaTeX" : "LaTeX symbols"}
      >
        {activeCat.items.map((item, idx) => (
          <Tooltip key={idx}>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={cn(
                  "h-8 px-1.5 text-xs font-mono border-dashed",
                  "hover:bg-primary/10 hover:text-primary hover:border-primary/40",
                  "transition-colors"
                )}
                onClick={() => insertAtCursor(item.code)}
                aria-label={name(item)}
              >
                {item.label}
              </Button>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              className="text-xs max-w-[240px]"
              dir={isAr ? "rtl" : "ltr"}
            >
              <p className="font-semibold">{name(item)}</p>
              <p className="text-muted-foreground mt-0.5 font-mono">{item.code}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>

      {/* ── Footer: hint + manual entry ── */}
      {!compact && (
        <div className="flex items-center justify-between pt-1 border-t border-border/40">
          <p className="text-xs text-muted-foreground">
            {isAr ? (
              <>
                استخدم{" "}
                <code className="bg-muted px-1 rounded font-mono">$...$</code>{" "}
                للمعادلات المضمّنة أو{" "}
                <code className="bg-muted px-1 rounded font-mono">$$...$$</code>{" "}
                للمعادلات المستقلة
              </>
            ) : (
              <>
                Wrap with{" "}
                <code className="bg-muted px-1 rounded font-mono">$...$</code>{" "}
                for inline or{" "}
                <code className="bg-muted px-1 rounded font-mono">$$...$$</code>{" "}
                for block math
              </>
            )}
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-xs h-7 gap-1"
            onClick={() => {
              const code = prompt(isAr ? "أدخل كود LaTeX يدوياً:" : "Enter custom LaTeX code:");
              if (code) insertAtCursor(code);
            }}
          >
            ⌨️ {isAr ? "كود مخصص" : "Custom code"}
          </Button>
        </div>
      )}
    </div>
  );
}