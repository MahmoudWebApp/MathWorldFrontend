'use client';

import { useTranslations} from 'next-intl';
import { 
  FileText, 
  Database, 
  Settings, 
  Share2, 
  Lock, 
  Cookie, 
  UserCheck, 
  Mail 
} from 'lucide-react';
import { useInView } from '@/lib/useInView';
import { Card, CardContent } from '@/components/ui/Card';

const sectionIcons = [
  FileText, Database, Settings, Share2, Lock, Cookie, UserCheck, Mail
];

const colorGradients = [
  'from-brand-primary/14 to-brand-secondary/7 dark:from-brand-primary/18 dark:to-brand-secondary/9',
  'from-brand-secondary/14 to-brand-primary/7 dark:from-brand-secondary/18 dark:to-brand-primary/9',
  'from-brand-primary-strong/14 to-brand-primary-light/7 dark:from-brand-primary/18 dark:to-brand-primary-light/9',
  'from-brand-secondary-strong/14 to-brand-secondary-light/7 dark:from-brand-secondary/18 dark:to-brand-secondary-light/9',
  'from-brand-primary-light/14 to-brand-secondary/7 dark:from-brand-primary-light/16 dark:to-brand-secondary/9',
  'from-brand-secondary-light/14 to-brand-primary/7 dark:from-brand-secondary-light/16 dark:to-brand-primary/9',
  'from-brand-primary/12 to-brand-primary-light/7 dark:from-brand-primary/16 dark:to-brand-primary-light/9',
  'from-brand-secondary/12 to-brand-secondary-light/7 dark:from-brand-secondary/16 dark:to-brand-secondary-light/9',
];

export function PrivacyContent() {
  const t = useTranslations('privacy');
  const { ref: sectionRef, isInView } = useInView(0.05);

  const sections = [
    'introduction',
    'information',
    'usage',
    'sharing',
    'security',
    'cookies',
    'rights',
    'contact',
  ] as const;

  return (
    <section className="math-section-bg relative overflow-hidden py-16 lg:py-24" ref={sectionRef}>
      <div className="math-grid-bg pointer-events-none absolute inset-0 opacity-25" />
      <div className="container mx-auto lg:px-24 md:px-16 px-4 relative z-10">
        <div className="max-w-3xl mx-auto space-y-8">
          {sections.map((sectionKey, index) => {
            const Icon = sectionIcons[index];
            const section = t.raw(`sections.${sectionKey}`) as {
              title: string;
              content: string;
              items?: string[];
            };
            
            return (
              <div
                key={sectionKey}
                className={`transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: isInView ? `${index * 100}ms` : '0ms' }}
              >
                <Card className="brand-surface math-card relative overflow-hidden border-0 shadow-sm transition-all duration-500 group hover:shadow-lg">
                  <div className={`absolute inset-0 bg-gradient-to-br ${colorGradients[index]} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  
                  <CardContent className="relative p-6 lg:p-8">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/[0.08] dark:bg-primary/[0.12] text-primary group-hover:scale-110 transition-transform duration-300">
                        <Icon className="h-5 w-5" />
                      </div>
                      
                      <div className="flex-1">
                        <h2 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors duration-300">
                          {section.title}
                        </h2>
                        
                        <p className="text-muted-foreground leading-relaxed mb-4">
                          {section.content}
                        </p>

                        {section.items && (
                          <ul className="space-y-2">
                            {section.items.map((item, itemIndex) => (
                              <li key={itemIndex} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary/60 mt-2 shrink-0" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        )}

                        {sectionKey === 'contact' && (
                          <a 
                            href="mailto:support@mathworld.com"
                            className="inline-flex items-center gap-2 mt-4 text-primary hover:underline font-medium"
                          >
                            <Mail className="h-4 w-4" />
                            support@mathworld.com
                          </a>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}