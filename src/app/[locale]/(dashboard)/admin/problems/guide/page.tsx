"use client";

import { useTranslations } from "next-intl";
import {
  BookOpen,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Code,
  Terminal,
  Calculator,
  Lightbulb,
  ListChecks,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

/* ────────────────────────────────────────────
   COMPONENTS
   ──────────────────────────────────────────── */

function RuleBox({
  type,
  title,
  code,
}: {
  type: "correct" | "wrong";
  title: string;
  code: string;
}) {
  const isCorrect = type === "correct";
  return (
    <div
      className={cn(
        "p-4 rounded-xl border-2 flex flex-col gap-2",
        isCorrect
          ? "bg-green-50/50 border-green-200 dark:bg-green-900/10 dark:border-green-800"
          : "bg-red-50/50 border-red-200 dark:bg-red-900/10 dark:border-red-800",
      )}
    >
      <div className="flex items-center gap-2 font-bold text-sm">
        {isCorrect ? (
          <>
            <CheckCircle2 className="w-5 h-5 text-green-600" />{" "}
            <span className="text-green-700 dark:text-green-400">{title}</span>
          </>
        ) : (
          <>
            <XCircle className="w-5 h-5 text-red-600" />{" "}
            <span className="text-red-700 dark:text-red-400">{title}</span>
          </>
        )}
      </div>
      <code
        className="bg-background/80 px-3 py-2 rounded-lg text-sm font-mono border text-foreground"
        dir="ltr"
      >
        {code}
      </code>
    </div>
  );
}

/* ────────────────────────────────────────────
   MAIN PAGE
   ──────────────────────────────────────────── */

export default function DataEntryGuidePage() {
  const t = useTranslations("admin.guide");

  return (
    <div className="container mx-auto py-10 space-y-8 max-w-5xl">
      {/* ── Header ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">{t("title")}</h1>
        </div>
        <p className="text-muted-foreground text-lg leading-relaxed">
          {t("subtitle")}
        </p>
      </div>

      <div className="grid gap-8">
        {/* ── Section 1: Latex Rules ── */}
        <Card className="border-t-4 border-t-primary shadow-md">
          <CardHeader className="bg-muted/20 pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Code className="w-6 h-6 text-primary" />
              {t("latexRules.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-4">
              <h4 className="font-bold flex items-center gap-2">
                <Badge
                  variant="default"
                  className="text-base rounded-full w-8 h-8 flex items-center justify-center p-0"
                >
                  1
                </Badge>
                {t("latexRules.rule1.title")}
              </h4>
              <p className="text-muted-foreground leading-relaxed px-10">
                {t.rich("latexRules.rule1.desc", {
                  strong: (chunks) => (
                    <strong className="text-foreground">{chunks}</strong>
                  ),
                  code: (chunks) => (
                    <code className="bg-muted text-foreground px-1.5 py-0.5 rounded font-mono">
                      {chunks}
                    </code>
                  ),
                })}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-10">
                <RuleBox
                  type="correct"
                  title={t("latexRules.correct")}
                  code="\int_{0}^{1} x^2 dx"
                />
                <RuleBox
                  type="wrong"
                  title={t("latexRules.wrong")}
                  code="$$\int_{0}^{1} x^2 dx$$"
                />
              </div>
            </div>

            <div className="w-full h-px bg-border" />

            <div className="space-y-4">
              <h4 className="font-bold flex items-center gap-2">
                <Badge
                  variant="default"
                  className="text-base rounded-full w-8 h-8 flex items-center justify-center p-0"
                >
                  2
                </Badge>
                {t("latexRules.rule2.title")}
              </h4>
              <p className="text-muted-foreground leading-relaxed px-10">
                {t("latexRules.rule2.desc")}
              </p>
              <ul className="list-disc list-inside text-muted-foreground px-14 space-y-2">
                <li>
                  {t.rich("latexRules.rule2.inline", {
                    code: (chunks) => (
                      <code className="bg-muted text-foreground px-1.5 py-0.5 rounded font-mono">
                        {chunks}
                      </code>
                    ),
                  })}
                </li>
                <li>
                  {t.rich("latexRules.rule2.block", {
                    code: (chunks) => (
                      <code className="bg-muted text-foreground px-1.5 py-0.5 rounded font-mono">
                        {chunks}
                      </code>
                    ),
                  })}
                </li>
              </ul>

              <div className="bg-muted/30 p-5 rounded-xl border mt-4 mx-10">
                <p className="font-bold mb-3 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-blue-500" />{" "}
                  {t("latexRules.exampleTitle")}
                </p>
                <code className="block bg-background p-4 rounded-lg text-sm leading-loose border font-mono whitespace-pre-wrap rtl:text-right ltr:text-left text-foreground">
                  {t("latexRules.exampleCode")}
                </code>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Section 2: Options ── */}
        <Card className="shadow-sm">
          <CardHeader className="bg-muted/20 pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <ListChecks className="w-6 h-6 text-primary" />
              {t("options.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4 text-muted-foreground leading-relaxed">
            <ul className="space-y-3 list-none">
              <li className="flex gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                <span>{t("options.point1")}</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                <span>
                  {t.rich("options.point2", {
                    strong: (chunks) => (
                      <strong className="text-foreground">{chunks}</strong>
                    ),
                    code: (chunks) => (
                      <code className="bg-muted text-foreground px-1.5 py-0.5 rounded font-mono">
                        {chunks}
                      </code>
                    ),
                  })}
                </span>
              </li>
              <li className="flex gap-3 bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-xl border border-yellow-200 dark:border-yellow-800 text-foreground mt-4">
                <AlertTriangle className="w-6 h-6 text-yellow-600 shrink-0" />
                <span>
                  {t.rich("options.warning", {
                    strong: (chunks) => (
                      <strong className="font-bold text-yellow-800 dark:text-yellow-400">
                        {chunks}
                      </strong>
                    ),
                  })}
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* ── Section 3: Detailed Solutions & Video ── */}
        <Card className="shadow-sm">
          <CardHeader className="bg-muted/20 pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Lightbulb className="w-6 h-6 text-primary" />
              {t("solutions.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-5 text-muted-foreground leading-relaxed">
            <p className="text-base font-medium text-foreground">
              {t("solutions.desc")}
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="border p-5 rounded-xl space-y-3 bg-card hover:border-primary/50 transition-colors">
                <h5 className="font-bold text-foreground flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-primary" />{" "}
                  {t("solutions.dashboardTitle")}
                </h5>
                <p className="text-sm">{t("solutions.dashboardDesc")}</p>
              </div>

              <div className="border p-5 rounded-xl space-y-3 bg-card hover:border-red-500/50 transition-colors">
                <h5 className="font-bold text-foreground flex items-center gap-2">
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5 text-red-500"
                  >
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                  {t("solutions.youtubeTitle")}
                </h5>
                <p className="text-sm">
                  {t.rich("solutions.youtubeDesc", {
                    code: (chunks) => (
                      <code
                        className="bg-muted text-foreground px-1.5 py-0.5 rounded font-mono"
                        dir="ltr"
                      >
                        {chunks}
                      </code>
                    ),
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
