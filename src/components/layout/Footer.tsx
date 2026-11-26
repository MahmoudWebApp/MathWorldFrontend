"use client"; // Note: Footer is now a Client component for Framer Motion interactions

import { Link } from '@/i18n/routing';
import { useTranslations, useLocale } from 'next-intl';
import { ExternalLink } from 'lucide-react';
import { useGetPublicBrandQuery, publishedSocialLinks, defaultSocialLinks } from '@/store/api/platformBrandApi';
import { socialLinks } from './socialLinks';
const socialTints:Record<string,string>={
  youtube:'bg-red-600 text-white',facebook:'bg-blue-600 text-white',instagram:'bg-gradient-to-br from-amber-500 via-pink-600 to-violet-700 text-white',
  tiktok:'bg-neutral-950 text-white',linkedin:'bg-sky-700 text-white',github:'bg-neutral-800 text-white','x (twitter)':'bg-neutral-950 text-white',x:'bg-neutral-950 text-white',twitter:'bg-neutral-950 text-white'
};
import { motion } from 'framer-motion';
import { BrandLogo } from './BrandLogo';

export function Footer() {
  const t = useTranslations();
  const ar = useLocale() === 'ar';
  const { data: brand } = useGetPublicBrandQuery(undefined, { refetchOnMountOrArgChange: 60 });
  const profile = brand?.Profile;
  const published = brand?.Revision===0 && !profile?.SocialLinks.length ? defaultSocialLinks : publishedSocialLinks(profile);

  const footerLinks = [
    {
      title: t('footer.links'),
      links: [
        { href: '/', label: t('nav.home') },
        { href: '/stages', label: t('nav.stages') },
        { href: '/premium', label: t('nav.plans') },
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
    <footer className="relative z-10 overflow-hidden border-t border-brand-primary/10 bg-background/95 dark:border-brand-primary/20">
      {/* Top Gradient Border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brand-primary/55 to-brand-secondary/40" />
      
      {/* Background Math Grid with Mask */}
      <div className="absolute inset-0 math-grid-bg opacity-30" style={{ maskImage: 'linear-gradient(to bottom, transparent, black)', WebkitMaskImage: 'linear-gradient(to bottom, transparent, black)' }} />
      
      {/* Glow Orbs */}
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-primary/[0.05] rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-secondary/[0.05] rounded-full blur-[80px] pointer-events-none" />

      <div className="relative z-10 container mx-auto px-6 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">
          
          {/* Brand & Description (Takes more space) */}
          <div className="lg:col-span-5">
            <Link
              href="/"
              className="group mb-6 inline-flex items-center rounded-[2rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="MathWorld"
            >
              <BrandLogo className="w-[190px] transition-transform duration-300 group-hover:scale-[1.025]" />
            </Link>
            <p className="text-base text-muted-foreground leading-relaxed mb-8 max-w-sm">
              {(ar ? profile?.DescriptionAr : profile?.DescriptionEn) || t('footer.description')}
            </p>
            
            {/* Magnetic Social Icons */}
            {profile?.SupportEmail && <p className="mb-3 break-all text-sm"><a href={`mailto:${profile.SupportEmail}`}>{profile.SupportEmail}</a></p>}
            {profile?.Phone && <p className="mb-3 text-sm" dir="ltr">{profile.Phone}</p>}
            {(ar ? profile?.ContactAddressAr : profile?.ContactAddressEn) && <p className="mb-3 text-sm">{ar ? profile?.ContactAddressAr : profile?.ContactAddressEn}</p>}
            {published.length > 0 && <div className="flex flex-wrap gap-2">
              {published.map((social) => (
                <motion.a 
                  key={social.Platform} 
                  href={social.Url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.06, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="group flex min-h-12 min-w-0 items-center gap-2 rounded-xl border bg-card px-2.5 py-2 text-sm font-semibold text-foreground shadow-sm transition-[box-shadow,border-color] hover:border-primary/40 hover:shadow-md"
                  aria-label={ar ? social.LabelAr : social.LabelEn}
                >
                  <span className={"grid h-8 w-8 shrink-0 place-items-center rounded-lg "+(socialTints[social.Platform.toLowerCase()]??'bg-primary/10 text-primary')}>{socialLinks.find(item => item.name.toLowerCase() === social.Platform.toLowerCase())?.icon ?? <ExternalLink className="h-4 w-4" />}</span><span className="min-w-0 break-words">{ar?social.LabelAr:social.LabelEn}</span>
                </motion.a>
              ))}
            </div>}
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