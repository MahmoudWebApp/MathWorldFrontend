/**
 * Parse dollar-delimited TeX plus \( \) and \[ \] from the API.
 * Both public previews and private learner questions use this parser.
 */
export type MathSegment = { type: 'text' | 'inline' | 'block'; value: string };

const MATH_TOKEN_PATTERN = /(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\$[^\n$]+?\$|\\\([\s\S]+?\\\))/g;

export function parseMathSegments(text: string): MathSegment[] {
  if (!text) return [];

  // Some API imports were escaped twice. Preserve ordinary TeX
  // newlines and single command backslashes.
  const normalized = text.replace(/\\\\(?=[A-Za-z\[\]\(\)])/g, '\\');

  return normalized.split(MATH_TOKEN_PATTERN).filter(Boolean).map((part) => {
    if ((part.startsWith('$$') && part.endsWith('$$')) ||
        (part.startsWith('\\[') && part.endsWith('\\]'))) {
      return { type: 'block' as const, value: part.slice(2, -2).trim() };
    }
    if ((part.startsWith('$') && part.endsWith('$')) ||
        (part.startsWith('\\(') && part.endsWith('\\)'))) {
      const delimiterLength = part.startsWith('\\(') ? 2 : 1;
      return { type: 'inline' as const,
        value: part.slice(delimiterLength, -delimiterLength).trim() };
    }
    return { type: 'text' as const, value: part };
  });
}
