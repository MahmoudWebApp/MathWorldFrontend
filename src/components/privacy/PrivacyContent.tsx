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
  'from-blue-500/10 to-indigo-500/5 dark:from-blue-500/15 dark:to-indigo-500/5',
  'from-emerald-500/10 to-teal-500/5 dark:from-emerald-500/15 dark:to-teal-500/5',
  'from-amber-500/10 to-orange-500/5 dark:from-amber-500/15 dark:to-orange-500/5',
  'from-rose-500/10 to-pink-500/5 dark:from-rose-500/15 dark:to-pink-500/5',
  'from-violet-500/10 to-purple-500/5 dark:from-violet-500/15 dark:to-purple-500/5',
  'from-cyan-500/10 to-sky-500/5 dark:from-cyan-500/15 dark:to-sky-500/5',
  'from-fuchsia-500/10 to-pink-500/5 dark:from-fuchsia-500/15 dark:to-pink-500/5',
  'from-lime-500/10 to-green-500/5 dark:from-lime-500/15 dark:to-green-500/5',
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
    <section className="relative py-16 lg:py-24 bg-muted/30" ref={sectionRef}>
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
                <Card className="relative overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-500 group">
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