import type { MetadataRoute } from 'next';
import { getPublicStages, getPublicTracks, SITE_URL } from '@/lib/publicCurriculum';

export const revalidate = 120;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const stages = await getPublicStages();
  const routes = ['/', '/stages', '/premium', '/about'];
  const entries: MetadataRoute.Sitemap = [];
  for (const path of routes) {
    for (const locale of ['ar', 'en'] as const) {
      entries.push({
        url: `${SITE_URL}/${locale}${path === '/' ? '' : path}`,
        changeFrequency: path === '/' ? 'weekly' : 'monthly',
        priority: path === '/' ? 1 : 0.75,
        alternates: { languages: {
          ar: `${SITE_URL}/ar${path === '/' ? '' : path}`,
          en: `${SITE_URL}/en${path === '/' ? '' : path}`,
        } },
      });
    }
  }
  const trackLists=await Promise.all(stages.map(stage=>getPublicTracks(stage.Id)));
  for (const stage of stages) {
    for (const locale of ['ar', 'en'] as const) {
      const path = `/stages/${stage.Id}`;
      entries.push({
        url: `${SITE_URL}/${locale}${path}`,
        changeFrequency: 'weekly',
        priority: 0.8,
        alternates: { languages: {
          ar: `${SITE_URL}/ar${path}`,
          en: `${SITE_URL}/en${path}`,
        } },
      });
    }
  }
  for(const track of trackLists.flat()){
    const path='/stages/'+track.StageId+'/tracks/'+track.Id;
    for(const locale of ['ar','en'] as const)entries.push({url:SITE_URL+'/'+locale+path,changeFrequency:'weekly',priority:0.7,alternates:{languages:{ar:SITE_URL+'/ar'+path,en:SITE_URL+'/en'+path}}});
  }
  return entries;
}
