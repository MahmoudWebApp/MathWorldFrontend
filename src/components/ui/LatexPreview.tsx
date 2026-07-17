'use client';

import { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { cn } from '@/lib/utils';

interface LatexPreviewProps {
  latex: string;
  block?: boolean;
  className?: string;
}

/** Renders trusted KaTeX output and falls back to the original expression. */
export function LatexPreview({
  latex,
  block = false,
  className,
}: LatexPreviewProps) {
  const normalizedLatex = latex?.trim() || '';

  const html = useMemo(() => {
    if (!normalizedLatex) {
      return null;
    }

    try {
      return katex.renderToString(normalizedLatex, {
        displayMode: block,
        throwOnError: true,
        strict: false,
        output: 'html',
      });
    } catch {
      return null;
    }
  }, [normalizedLatex, block]);

  if (!normalizedLatex) {
    return null;
  }

  const Component = block ? 'div' : 'span';

  if (!html) {
    return (
      <Component
        dir="ltr"
        className={cn(
          block ? 'my-4 block text-center' : 'inline-block',
          'rounded bg-destructive/10 px-1 font-mono text-sm text-destructive',
          className,
        )}
      >
        {normalizedLatex}
      </Component>
    );
  }

  return (
    <Component
      dir="ltr"
      className={cn(
        block ? 'my-4 block overflow-x-auto text-center text-lg' : 'inline-block',
        className,
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
