"use client";

import { useMemo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import { cn } from "@/lib/utils";

interface LatexPreviewProps {
  latex: string;
  block?: boolean;
  className?: string;
}

export function LatexPreview({
  latex,
  block = false,
  className,
}: LatexPreviewProps) {
  const html = useMemo(() => {
    if (!latex?.trim()) return "";
    try {
      return katex.renderToString(latex, {
        displayMode: block,
        throwOnError: false,
        errorColor: "#ef4444",
        strict: false,
        output: "html",
      });
    } catch (error) {
      console.error("KaTeX rendering error:", error);
      return `<span class="text-xs text-red-500 font-mono">⚠️ خطأ في صيغة LaTeX</span>`;
    }
  }, [latex, block]);

  if (!html) return null;

  const Component = block ? "div" : "span";

  return (
    <Component
      className={cn(
        block ? "my-4 block text-center text-lg" : "inline-block",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: html }}
      dir="ltr"
    />
  );
}
