import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{
      userAgent: '*',
      allow: ['/ar', '/en'],
      disallow: [
        '/ar/dashboard', '/en/dashboard',
        '/ar/admin', '/en/admin',
        '/ar/login', '/en/login',
        '/ar/register', '/en/register',
        '/ar/problems', '/en/problems',
        '/ar/learning-stage', '/en/learning-stage',
        '/ar/notifications', '/en/notifications',
        '/ar/premium/report', '/en/premium/report',
        '/ar/journey', '/en/journey',
      ],
    }],
    sitemap: 'https://math-world-frontend.vercel.app/sitemap.xml',
  };
}
