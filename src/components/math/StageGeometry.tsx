import type { SVGProps } from 'react';

/** Small, CSS-colored mathematical geometry; no image requests or runtime assets. */
export function StageGeometry({
  variant = 0,
  ...props
}: SVGProps<SVGSVGElement> & { variant?: number }) {
  const index = ((variant % 4) + 4) % 4;
  return (
    <svg viewBox="0 0 144 144" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...props}>
      <circle cx="72" cy="72" r="54" strokeDasharray="3 7" opacity=".6" />
      {index === 0 && <>
        <circle cx="72" cy="72" r="38" />
        <path d="M72 34v76M34 72h76M45 45l54 54M99 45L45 99" opacity=".65" />
        <circle cx="72" cy="72" r="12" />
      </>}
      {index === 1 && <>
        <path d="M72 24 124 116H20Z" />
        <path d="M72 24v92M20 116l75-49" opacity=".65" />
        <circle cx="72" cy="81" r="7" />
      </>}
      {index === 2 && <>
        <rect x="35" y="35" width="74" height="74" rx="12" transform="rotate(12 72 72)" />
        <rect x="49" y="49" width="46" height="46" rx="4" transform="rotate(35 72 72)" />
        <path d="M25 72h94M72 25v94" opacity=".65" />
      </>}
      {index === 3 && <>
        <ellipse cx="72" cy="72" rx="54" ry="22" transform="rotate(-35 72 72)" />
        <ellipse cx="72" cy="72" rx="54" ry="22" transform="rotate(35 72 72)" />
        <circle cx="72" cy="72" r="9" />
      </>}
    </svg>
  );
}
