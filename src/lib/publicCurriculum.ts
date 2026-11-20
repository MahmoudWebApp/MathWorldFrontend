/** Server-only public catalog read for real SEO text; never use private credentials. */
const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ||
  'https://mathwordbackend.onrender.com/api').replace(/\/$/, '');

export interface PublicStage {
  Id: number;
  NameAr: string;
  NameEn: string;
  DescriptionAr?: string;
  DescriptionEn?: string;
  Order: number;
}
export interface PublicTopic {
  Id: number;
  StageId: number;
  NameAr: string;
  NameEn: string;
  DescriptionAr?: string;
  DescriptionEn?: string;
  Order: number;
}
async function publicCatalog<T>(route: string): Promise<T[]> {
  try {
    const response = await fetch(`${apiBase}/${route}`, {
      next: { revalidate: 120 },
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) return [];
    const payload = await response.json() as { Data?: T[]; Success?: boolean };
    return payload.Success === true && Array.isArray(payload.Data) ? payload.Data : [];
  } catch {
    // Render can be asleep on a free plan. Don't fail the page during an outage.
    return [];
  }
}
export const getPublicStages = () => publicCatalog<PublicStage>('stages');
export const getPublicTopics = () => publicCatalog<PublicTopic>('categories');
