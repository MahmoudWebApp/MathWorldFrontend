import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/publicCurriculum';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{
      userAgent: '*',
      allow: '/',
      disallow: [
        '/ar/dashboard/', '/en/dashboard/',
        '/ar/admin/', '/en/admin/',
        '/ar/profile/', '/en/profile/',
        '/ar/notifications/', '/en/notifications/',
        '/ar/learning-stage/', '/en/learning-stage/',
        '/ar/social-accounts/', '/en/social-accounts/',
        '/ar/login', '/en/login', '/ar/register', '/en/register',
        '/ar/forgot-password', '/en/forgot-password', '/ar/reset-password', '/en/reset-password',
        '/ar/verify-email', '/en/verify-email',
        '/ar/verify-certificate', '/en/verify-certificate',
        '/api/',
      ],
    }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
