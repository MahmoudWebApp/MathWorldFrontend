"use client";

import { LatexPreview } from "@/components/ui/LatexPreview";
import { cn } from "@/lib/utils";

interface RichTextProps {
  text: string;
  isArabic?: boolean;
  className?: string;
  blockClassName?: string;
  inline?: boolean;
}

// [IMPROVED] Define the Regex outside the component to avoid recreating it on every render (Better Performance)
const LATEX_TOKEN_REGEX = /(\$\$[\s\S]+?\$\$|\$[^\n$]+?\$)/g;

export function RichText({ 
  text, 
  isArabic = false, 
  className,
  blockClassName,
  inline = false 
}: RichTextProps) {
  if (!text) return null;

  const parts = text.split(LATEX_TOKEN_REGEX);

  const Container = inline ? "span" : "div";

  return (
    <Container
      dir={isArabic ? "rtl" : "ltr"}
      className={cn(
        inline 
          ? "text-base" 
          : "prose max-w-none text-base leading-loose dark:prose-invert", 
        isArabic ? "text-right" : "text-left",
        className
      )}
    >
      {parts.map((part, i) => {
        if (part.startsWith("$$") && part.endsWith("$$")) {
          return (
            <LatexPreview 
              key={i} 
              latex={part.slice(2, -2).trim()} 
              block 
              className={blockClassName}
            />
          );
        }
        if (part.startsWith("$") && part.endsWith("$") && part.length > 2) {
          return <LatexPreview key={i} latex={part.slice(1, -1).trim()} />;
        }
        return <span key={i}>{part}</span>;
      })}
    </Container>
  );
}