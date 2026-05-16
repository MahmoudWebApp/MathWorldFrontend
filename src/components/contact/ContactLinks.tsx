
'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Mail, Clock, ExternalLink } from 'lucide-react';
import { useInView } from '@/lib/useInView';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const socialLinks = [
  {
    name: 'GitHub',
    href: 'https://github.com',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
      </svg>
    ),
  },
  {
    name: 'Facebook',
    href: 'https://facebook.com',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
  },
  {
    name: 'TikTok',
    href: 'https://tiktok.com',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
      </svg>
    ),
  },
  {
    name: 'YouTube',
    href: 'https://youtube.com',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
  },
  {
    name: 'LinkedIn',
    href: 'https://linkedin.com',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
  },
  {
    name: 'Instagram',
    href: 'https://instagram.com',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
      </svg>
    ),
  },
  {
    name: 'X (Twitter)',
    href: 'https://twitter.com',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  {
    name: 'Snapchat',
    href: 'https://snapchat.com',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.075 1.539 3.118 2.733 5.557.612 1.206.32 2.144-.475 2.537-.782.386-1.716.304-2.464-.298.06 1.003-.293 2.019-.944 2.84-1.193 1.513-3.056 2.156-4.78 2.4.158.134.325.263.495.375.852.546 2.063.99 2.875.469.534-.343.822-1.25 1.189-1.898.201-.357.358-.637.555-.707.598-.215 1.252.411 1.526.92.431.8-.262 1.808-.85 2.383-.846.835-2.193 1.078-3.382 1.078h-.013c-.23 0-.46-.015-.688-.043-.806-.098-1.571-.352-2.28-.688-.59-.28-1.146-.716-1.648-1.238l-.035-.037c-.588-.61-1.036-1.338-1.278-2.09-.27-.842-.267-1.687.009-2.468.156-.438.405-.855.734-1.215-.393.085-.798.128-1.205.115-.92-.03-1.83-.372-2.437-.957-.546-.525-.778-1.208-.672-1.912.115-.763.618-1.453 1.365-1.764.426-.18.895-.195 1.315-.084.169.045.535.208.788.366.152.094.302.19.443.277.253-.213.548-.39.877-.51.99-.36 1.998-.43 2.848-.403z"/>
      </svg>
    ),
  },
];

// ✅ الهوفر الموحد لكل الأيقونات - بلون الموقع Primary
const socialCardHover = `
  group
  flex flex-col items-center gap-3 p-6 rounded-2xl 
  border border-border/50 bg-card/50 
  text-muted-foreground
  hover:scale-105 hover:-translate-y-1 
  hover:shadow-lg hover:shadow-primary/15 
  hover:border-primary/40 
  hover:bg-primary/[0.06] dark:hover:bg-primary/[0.10]
  hover:text-primary
  active:scale-95
  transition-all duration-300 ease-out
`;

export function ContactLinks() {
  const t = useTranslations('contact');
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const { ref: sectionRef, isInView } = useInView(0.1);

  return (
    <section className="relative py-20 lg:py-28 bg-muted/30" ref={sectionRef}>
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/[0.02] rounded-full blur-[100px]" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/[0.02] rounded-full blur-[80px]" />

      <div className="container mx-auto lg:px-24 md:px-16 px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Email Card */}
          <div className={`mb-12 transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-500 group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <CardContent className="relative p-8 lg:p-10 flex flex-col md:flex-row items-center gap-6 text-center md:text-start">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 dark:bg-primary/15 text-primary group-hover:scale-110 transition-transform duration-500">
                  <Mail className="h-8 w-8" />
                </div>
                
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">{t('email.title')}</h2>
                  <p className="text-muted-foreground mb-4">{t('email.description')}</p>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <span className="font-mono text-lg text-primary font-medium">
                      {t('email.address')}
                    </span>
                    <Button 
                      className="gap-2 rounded-xl"
                      asChild
                    >
                      <a href={`mailto:${t('email.address')}`}>
                        {t('email.button')}
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Social Links Grid */}
          <div className={`mb-12 transition-all duration-700 delay-150 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">{t('social.title')}</h2>
              <p className="text-muted-foreground">{t('social.description')}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {socialLinks.map((social, index) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={socialCardHover}
                  style={{
                    transitionDelay: isInView ? `${index * 50}ms` : '0ms',
                  }}
                >
                  <span className="transition-transform duration-300 group-hover:scale-110">
                    {social.icon}
                  </span>
                  <span className="text-sm font-medium transition-colors duration-300 group-hover:text-primary">
                    {social.name}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Response Time */}
          <div className={`transition-all duration-700 delay-300 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <Card className="border-0 shadow-sm bg-gradient-to-br from-primary/[0.03] to-transparent">
              <CardContent className="p-6 flex items-center gap-4 text-center justify-center">
                <Clock className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <h3 className="font-semibold text-sm">{t('response.title')}</h3>
                  <p className="text-sm text-muted-foreground">{t('response.description')}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}