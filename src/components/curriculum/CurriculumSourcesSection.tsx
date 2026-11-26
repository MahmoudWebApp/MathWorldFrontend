'use client';

import { useLocale } from 'next-intl';
import { BookOpenCheck, ExternalLink } from 'lucide-react';

/**
 * Reference framework names are identification labels, not institutional logos.
 * Cambridge/OECD marks require appropriate branding authorization.
 * Keep sources verifiable and do not imply affiliation or certification.
 */
const references = [
  {
    label: 'Cambridge',
    fullName: 'Cambridge International',
    shortMark: 'C',
    tint:'from-rose-600 to-red-800',
    href: 'https://www.cambridgeinternational.org/programmes-and-qualifications/maths/',
  },
  {
    label: 'Common Core',
    fullName: 'Common Core State Standards',
    shortMark: 'CC',
    tint:'from-blue-600 to-indigo-800',
    href: 'https://corestandards.org/mathematics-standards/',
  },
  {
    label: 'OECD PISA',
    fullName: 'OECD PISA Mathematics',
    shortMark: 'P',
    tint:'from-teal-600 to-emerald-800',
    href: 'https://www.oecd.org/en/about/programmes/pisa.html',
  },
  {
    label: 'MSC2020',
    fullName: 'Mathematics Subject Classification',
    shortMark: 'Σ',
    tint:'from-violet-600 to-indigo-800',
    href: 'https://mathscinet.ams.org/msc/msc.html',
  },
] as const;

export function CurriculumSourcesSection() {
  const ar = useLocale() === 'ar';

  return (
    <section className="relative border-y border-border/60 bg-card/35 py-14 sm:py-20" aria-labelledby="curriculum-references-title">
      <div className="container mx-auto px-4 sm:px-6 lg:px-12">
        <div className="mx-auto max-w-3xl text-center">
          <BookOpenCheck aria-hidden="true" className="mx-auto mb-4 h-7 w-7 text-primary" />
          <h2 id="curriculum-references-title" className="brand-display-title text-gradient-math text-2xl font-black tracking-tight sm:text-4xl">
            {ar ? 'مراجع تعليم الرياضيات العالمية' : 'Global mathematics references'}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
            {ar
              ? 'ننظّم الفئات والمهارات بتدرّج واضح مسترشدين بأطر تعليمية ورياضية دولية، وننوّع المسائل حسب ما يحتاجه كل موضوع.'
              : 'We organize topics and skills into a clear progression informed by international mathematical and educational frameworks, with varied practice for each topic.'}
          </p>
        </div>

        <div className="mx-auto mt-9 grid max-w-5xl grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {references.map(reference => (
            <a
              key={reference.label}
              href={reference.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={reference.fullName}
              className="math-reference-wave group relative isolate flex min-h-36 flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border border-primary/20 bg-card/85 px-3 py-5 text-center shadow-sm transition-[border-color,transform,box-shadow] motion-safe:hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <span aria-hidden="true" className={"relative z-10 flex h-12 min-w-12 items-center justify-center rounded-xl bg-gradient-to-br px-2 font-serif text-xl font-black tracking-tight text-white shadow-sm "+reference.tint}>
                {reference.shortMark}
              </span>
              <span className="relative z-10 flex items-center gap-1 text-xs font-bold sm:text-sm">
                {reference.label}
                <ExternalLink aria-hidden="true" className="h-3 w-3 text-muted-foreground opacity-70" />
              </span>
              <span className="relative z-10 text-xs leading-5 text-muted-foreground">{reference.fullName}</span>
            </a>
          ))}
        </div>

      </div>
    </section>
  );
}
