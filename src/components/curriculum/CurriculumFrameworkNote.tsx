'use client';

import { useLocale } from 'next-intl';
import { BookOpenCheck, ChevronDown } from 'lucide-react';

/**
 * MathWorld independently aligns subject organization with published
 * international education frameworks. These are references, not an
 * accreditation or a fixed number of categories/questions.
 */
export function CurriculumFrameworkNote() {
  const ar = useLocale() === 'ar';
  return (
    <details className="group rounded-2xl border border-primary/20 bg-card/90 shadow-sm">
      <summary className="flex cursor-pointer list-none items-start gap-3 p-4 marker:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary [&::-webkit-details-marker]:hidden sm:p-5">
        <BookOpenCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
        <span className="min-w-0 flex-1">
          <strong className="block text-sm font-extrabold sm:text-base">
            {ar ? 'كيف ننظّم رحلتك في الرياضيات؟' : 'How is your mathematics learning organized?'}
          </strong>
          <span className="mt-1 block text-xs leading-6 text-muted-foreground sm:text-sm">
            {ar
              ? 'فئات واضحة بحسب موضوع الرياضيات، ومسائل متنوعة تتدرج مع مهاراتك — بدون عدد ثابت للفئات أو تمارين متكررة بلا فائدة.'
              : 'Clear mathematical topics, varied questions and skill-based progression — not a fixed topic count or repetitive drills.'}
          </span>
        </span>
        <ChevronDown className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden="true" />
      </summary>
      <div className="border-t border-border/70 px-4 pb-5 pt-4 text-sm leading-7 text-muted-foreground sm:px-5">
        <p>
          {ar
            ? 'نسترشد بمناهج Cambridge ومعايير Common Core لتنظيم المهارات المدرسية، وبإطار PISA لتنمية التفكير الرياضي وتطبيقه، وبتصنيف MSC2020 لتحديد التخصصات الجامعية. لكل فئة أهداف متجانسة، وتُحدَّد كمية التدريب بحسب ما يحتاجه الموضوع.'
            : 'We draw on Cambridge curricula and Common Core for school skills, PISA for mathematical reasoning and application, and MSC2020 for university subject areas. Each topic has coherent learning goals; practice volume depends on what those goals require.'}
        </p>
        <p className="mt-2">
          {ar
            ? 'نبيّن تقدمك من محاولاتك وحلولك الفعلية، ونستخدمه لتوجيه التدريب. الاسترشاد بهذه الأطر لا يعني اعتماداً أو شراكة رسمية معها.'
            : 'Your progress comes from your actual attempts and solved work and helps guide practice. Referencing these frameworks does not imply their official endorsement or partnership.'}
        </p>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold">
          <a href="https://www.cambridgeinternational.org/programmes-and-qualifications/maths/" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">Cambridge</a>
          <a href="https://corestandards.org/mathematics-standards/" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">Common Core</a>
          <a href="https://www.oecd.org/en/publications/pisa-2022-assessment-and-analytical-framework_dfe0bf9c-en/full-report/component-3.html" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">OECD PISA</a>
          <a href="https://mathscinet.ams.org/msc/msc.html" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">MSC2020</a>
        </div>
      </div>
    </details>
  );
}
