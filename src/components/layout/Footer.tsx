import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { socialLinks } from './socialLinks';

export function Footer() {
  const t = useTranslations();

  const footerLinks = [
    {
      title: t('footer.links'),
      links: [
        { href: '/', label: t('nav.home') },
        { href: '/stages', label: t('nav.stages') },
        { href: '/about', label: t('footer.about') },
      ],
    },
    {
      title: t('footer.support'),
      links: [
        { href: '/contact', label: t('footer.contact') },
        { href: '/privacy', label: t('footer.privacy') },
      ],
    },
  ];

 
  return (
    <footer className="relative overflow-hidden">
      <div className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary/[0.02] rounded-full blur-[80px]" />
      <div className="absolute top-0 right-0 w-48 h-48 bg-primary/[0.02] rounded-full blur-[60px]" />

      <div className="relative bg-muted/30">
        <div className="container mx-auto px-12 py-14">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Brand */}
            <div className="lg:col-span-1">
              <Link href="/" className="flex items-center gap-2.5 mb-5 group">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-lg group-hover:scale-110 transition-transform duration-300">M</div>
                <span className="text-xl font-bold">MathWorld</span>
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">{t('footer.description')}</p>
              <div className="flex flex-wrap gap-2">
                {socialLinks.map((social) => (
                  <a key={social.name} href={social.href} target="_blank" rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-lg border bg-card/50 hover:bg-primary hover:text-primary-foreground hover:border-primary hover:scale-110 active:scale-95 transition-all duration-300"
                    aria-label={social.name}>
                    <span className="group-hover:rotate-6 transition-transform duration-300">{social.icon}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Link Columns */}
            {footerLinks.map((column, index) => (
              <div key={index}>
                <h3 className="font-semibold mb-5 text-sm uppercase tracking-wider">{column.title}</h3>
                <ul className="space-y-3">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground hover:translate-x-1 transition-all duration-300 inline-block">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Math decoration */}
            <div className="hidden lg:flex flex-col justify-between">
              <div className="font-serif text-4xl text-primary/[0.08] dark:text-primary/[0.12] leading-relaxed select-none" dir="ltr">
                <div>e<sup>iπ</sup> + 1 = 0</div>
                <div className="mt-2 text-2xl">∫<sub>0</sub><sup>∞</sup> e<sup>-x²</sup>dx = √π/2</div>
              </div>
              <div className="font-serif text-xs text-muted-foreground/40 mt-4" dir="ltr">— Euler, Gauss</div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* [CHANGED] Added suppressHydrationWarning to prevent mismatch on new Date().getFullYear() between server and client */}
            <p className="text-sm text-muted-foreground" suppressHydrationWarning>
              {t('footer.copyright', { year: new Date().getFullYear() })}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground/50">
              <span className="font-serif" dir="ltr">π ≈ 3.14159265</span>
              <span>•</span>
              <span className="font-serif" dir="ltr">e ≈ 2.71828182</span>
              <span>•</span>
              <span className="font-serif" dir="ltr">φ ≈ 1.61803398</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}