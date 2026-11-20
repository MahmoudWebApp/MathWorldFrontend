import type { MetadataRoute } from 'next';
import { getPublicStages } from '@/lib/publicCurriculum';

const origin = 'https://math-world-frontend.vercel.app';
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const stages = await getPublicStages();
  const pages = ['', '/stages', '/premium', '/about'];
  const paths = [...pages, ...stages.map(stage => `/stages/${stage.Id}`)];
  return paths.flatMap(path => (['ar', 'en'] as const).map(locale => ({
    url: `${origin}/${locale}${path}`,
    changeFrequency: path.includes('/stages/') ? 'weekly' as const : 'monthly' as const,
    priority: path === '' ? 1 : path === '/premium' ? 0.8 : 0.7,
    alternates: { languages: {
      ar: `${origin}/ar${path}`,
      en: `${origin}/en${path}`,
    } },
  })));
}
