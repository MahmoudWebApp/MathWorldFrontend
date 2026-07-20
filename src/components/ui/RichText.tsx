'use client';

import { LatexPreview } from '@/components/ui/LatexPreview';
import { cn } from '@/lib/utils';

interface RichTextProps {
  text: string;
  isArabic?: boolean;
  className?: string;
  blockClassName?: string;
  inline?: boolean;
}

const LATEX_TOKEN_REGEX = /(\$\$[\s\S]+?\$\$|\$[^\n$]+?\$)/g;

/**
 * Renders mixed text and LaTeX content.
 * Inline math must be wrapped with $...$ and block math with $$...$$.
 */
export function RichText({
  text,
  isArabic = false,
  className,
  blockClassName,
  inline = false,
}: RichTextProps) {
  if (!text) {
    return null;
  }

  const parts = text.split(LATEX_TOKEN_REGEX);
  const Container = inline ? 'span' : 'div';

  // Detect direction from the natural-language part of the content. This keeps
  // English content LTR and Arabic content RTL even while a locale switch is
  // still refreshing localized API data. LaTeX tokens are ignored so an
  // equation that starts with x does not force an Arabic sentence to LTR.
  const plainText = text.replace(LATEX_TOKEN_REGEX, ' ');
  const containsArabic = /[\u0600-\u06FF]/.test(plainText);
  const containsLatin = /[A-Za-z]/.test(plainText);
  const contentIsArabic = containsArabic
    ? true
    : containsLatin
      ? false
      : isArabic;

  return (
    <Container
      dir={contentIsArabic ? 'rtl' : 'ltr'}
      className={cn(
        'whitespace-pre-wrap text-start',
        inline
          ? 'text-base'
          : 'prose max-w-none text-base leading-loose dark:prose-invert',
        className,
      )}
    >
      {parts.map((part, index) => {
        if (part.startsWith('$$') && part.endsWith('$$')) {
          return (
            <LatexPreview
              key={`${index}-${part}`}
              latex={part.slice(2, -2).trim()}
              block
              className={blockClassName}
            />
          );
        }

        if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
          return (
            <LatexPreview
              key={`${index}-${part}`}
              latex={part.slice(1, -1).trim()}
            />
          );
        }

        return <span key={`${index}-${part}`}>{part}</span>;
      })}
    </Container>
  );
}
