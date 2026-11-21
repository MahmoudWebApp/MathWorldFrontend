'use client';

import { LatexPreview } from '@/components/ui/LatexPreview';
import { parseMathSegments } from '@/lib/mathSegments';
import { cn } from '@/lib/utils';

interface RichTextProps {
  text: string;
  isArabic?: boolean;
  className?: string;
  blockClassName?: string;
  inline?: boolean;
}

/** Render supported TeX delimiters in bilingual text without executing HTML. */
export function RichText({
  text,
  isArabic = false,
  className,
  blockClassName,
  inline = false,
}: RichTextProps) {
  if (!text) return null;

  const parts = parseMathSegments(text);
  const Container = inline ? 'span' : 'div';
  const plainText = parts.filter(part => part.type === 'text')
    .map(part => part.value).join(' ');
  const containsArabic = /[\u0600-\u06FF]/.test(plainText);
  const containsLatin = /[A-Za-z]/.test(plainText);
  const contentIsArabic = containsArabic ? true : containsLatin ? false : isArabic;

  return (
    <Container
      dir={contentIsArabic ? 'rtl' : 'ltr'}
      className={cn(
        'whitespace-pre-wrap text-start',
        inline ? 'text-base' : 'prose max-w-none text-base leading-loose dark:prose-invert',
        className,
      )}
    >
      {parts.map((part, index) => {
        if (part.type === 'block') {
          return <LatexPreview key={index} latex={part.value} block className={blockClassName} />;
        }
        if (part.type === 'inline') {
          return <LatexPreview key={index} latex={part.value} />;
        }
        return <span key={index}>{part.value}</span>;
      })}
    </Container>
  );
}
