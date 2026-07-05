"use client"; // Note: Footer is now a Client component for Framer Motion interactions

import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { socialLinks } from './socialLinks';
import { motion } from 'framer-motion';

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
    <footer className="relative overflow-hidden bg-background border-t">
      {/* Top Gradient Border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      
      {/* Background Math Grid with Mask */}
      <div className="absolute inset-0 math-grid-bg opacity-30" style={{ maskImage: 'linear-gradient(to bottom, transparent, black)', WebkitMaskImage: 'linear-gradient(to bottom, transparent, black)' }} />
      
      {/* Glow Orbs */}
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/[0.03] rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/[0.04] rounded-full blur-[80px] pointer-events-none" />

      <div className="relative z-10 container mx-auto px-6 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">
          
          {/* Brand & Description (Takes more space) */}
          <div className="lg:col-span-5">
            <Link href="/" className="flex items-center gap-3 mb-6 group inline-flex">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-bold text-2xl shadow-lg shadow-primary/20 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                M
              </div>
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80">
                MathWorld
              </span>
            </Link>
            <p className="text-base text-muted-foreground leading-relaxed mb-8 max-w-sm">
              {t('footer.description')}
            </p>
            
            {/* Magnetic Social Icons */}
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((social) => (
                <motion.a 
                  key={social.name} 
                  href={social.href} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.15, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex h-11 w-11 items-center justify-center rounded-xl border bg-background/50 backdrop-blur text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary shadow-sm hover:shadow-primary/25 transition-colors duration-300"
                  aria-label={social.name}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-8">
            {footerLinks.map((column, index) => (
              <div key={index}>
                <h3 className="font-bold mb-6 text-sm uppercase tracking-widest text-foreground">{column.title}</h3>
                <ul className="space-y-4">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-sm font-medium text-muted-foreground hover:text-primary flex items-center gap-2 group transition-colors">
                        <span className="h-px w-0 bg-primary group-hover:w-4 transition-all duration-300" />
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Interactive Math Decoration */}
          <div className="lg:col-span-3 hidden lg:flex flex-col justify-center items-end text-right">
            <div className="font-serif select-none" dir="ltr">
              <motion.div 
                whileHover={{ scale: 1.05, textShadow: "0px 0px 15px var(--color-primary)" }}
                className="text-4xl text-foreground/20 hover:text-primary transition-colors cursor-crosshair mb-4"
              >
                e<sup>iπ</sup> + 1 = <motion.span initial={{ opacity: 0.2 }} whileHover={{ opacity: 1, scale: 1.2, display: "inline-block" }}>0</motion.span>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.05, textShadow: "0px 0px 15px var(--color-primary)" }}
                className="text-2xl text-foreground/10 hover:text-primary/70 transition-colors cursor-crosshair"
              >
                ∫<sub>0</sub><sup>∞</sup> e<sup>-x²</sup>dx = √π/2
              </motion.div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm font-medium text-muted-foreground" suppressHydrationWarning>
            {t('footer.copyright', { year: new Date().getFullYear() })}
          </p>
          
          <div className="flex items-center gap-3 text-xs text-muted-foreground/40 font-mono tracking-widest cursor-default">
            <motion.span whileHover={{ color: "var(--color-primary)" }} dir="ltr">π ≈ 3.14159</motion.span>
            <span>•</span>
            <motion.span whileHover={{ color: "var(--color-primary)" }} dir="ltr">e ≈ 2.71828</motion.span>
            <span>•</span>
            <motion.span whileHover={{ color: "var(--color-primary)" }} dir="ltr">φ ≈ 1.61803</motion.span>
          </div>
        </div>
      </div>
    </footer>
  );
}