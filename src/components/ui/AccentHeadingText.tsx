import * as React from 'react';

interface AccentHeadingTextProps {
  text: string;
  accent?: 'first' | 'last';
  accentClassName?: string;
}

export function AccentHeadingText({
  text,
  accent = 'last',
  accentClassName,
}: AccentHeadingTextProps) {
  const words = text.trim().split(/\s+/);
  const accentIndex = accent === 'first' ? 0 : Math.max(0, words.length - 1);
  const activeClassName = ['sr-title-accent', accentClassName].filter(Boolean).join(' ');

  return (
    <>
      {words.map((word, index) => (
        <React.Fragment key={`${word}-${index}`}>
          {index > 0 ? ' ' : null}
          <span className={index === accentIndex ? activeClassName : undefined}>
            {word}
          </span>
        </React.Fragment>
      ))}
    </>
  );
}
