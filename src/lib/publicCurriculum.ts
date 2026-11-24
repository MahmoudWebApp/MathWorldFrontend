import 'server-only';

// Fetch public curriculum on the server so metadata and stage explanations are
// present in HTML for people and search engines, not only after hydration.
const API = (process.env.NEXT_PUBLIC_API_BASE_URL?.trim()
  || 'https://mathwordbackend.onrender.com/api').replace(/\/$/, '');

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL?.trim()
  || 'https://math-world-frontend.vercel.app').replace(/\/$/, '');

export interface PublicStage {
  Id: number;
  NameAr: string;
  NameEn: string;
  DescriptionAr?: string;
  DescriptionEn?: string;
  Order: number;
}
export interface PublicCategory {
  Id: number;
  StageId: number;
  NameAr: string;
  NameEn: string;
  DescriptionAr?: string;
  DescriptionEn?: string;
  Order: number;
}

async function getPublicList<T>(endpoint: string): Promise<T[]> {
  try {
    const response = await fetch(`${API}/${endpoint}`, {
      headers: { Accept: 'application/json', 'Accept-Language': 'ar' },
      next: { revalidate: 120 },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return [];
    const data: unknown = await response.json();
    if (typeof data !== 'object' || data === null) return [];
    const payload = (data as { Data?: unknown }).Data;
    return Array.isArray(payload) ? payload as T[] : [];
  } catch {
    return [];
  }
}
export const getPublicStages = () => getPublicList<PublicStage>('stages');
export const getPublicCategories = () => getPublicList<PublicCategory>('categories');

export interface PublicStageExample {
  Id: number;
  TitleAr: string;
  TitleEn: string;
  QuestionTextAr: string;
  QuestionTextEn: string;
  CategoryNameAr: string;
  CategoryNameEn: string;
}

// Stage samples expose only the four free-topic questions explicitly
// selected by the API. No answers or solutions are sent to the public site.
export async function getPublicStageExamples(stageId: number): Promise<PublicStageExample[]> {
  if (!Number.isSafeInteger(stageId) || stageId <= 0) return [];
  try {
    const response = await fetch(`${API}/stages/${stageId}/examples`, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 120 },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return [];
    const payload: unknown = await response.json();
    if (!payload || typeof payload !== 'object' || !('Results' in payload)) return [];
    const results = (payload as { Results?: unknown }).Results;
    return Array.isArray(results) ? results as PublicStageExample[] : [];
  } catch {
    return [];
  }
}

export interface PublicTrack {
  Id:number;StageId:number;Code:string;Kind:'grade'|'course';NameAr:string;NameEn:string;
  DescriptionAr:string;DescriptionEn:string;
}
export interface PublicTrackDetail {
  Track:PublicTrack;
  Categories:{Id:number;NameAr:string;NameEn:string;DescriptionAr:string;DescriptionEn:string;IsFree:boolean;ProblemsCount:number}[];
  Skills:{Id:number;CategoryId:number;NameAr:string;NameEn:string;DescriptionAr:string;DescriptionEn:string}[];
  Examples:{Id:number;CategoryId:number;TitleAr:string;TitleEn:string}[];
}
async function getPublicObject(endpoint:string):Promise<unknown>{
  try{
    const response=await fetch(API+'/'+endpoint,{headers:{Accept:'application/json'},next:{revalidate:120},signal:AbortSignal.timeout(8000)});
    if(!response.ok)return null;
    return await response.json();
  }catch{return null;}
}
export async function getPublicTracks(stageId:number):Promise<PublicTrack[]>{
  if(!Number.isSafeInteger(stageId)||stageId<=0)return [];
  const raw=await getPublicObject('stages/'+stageId+'/tracks') as {Enabled?:boolean;Items?:PublicTrack[]}|null;
  if(raw?.Enabled!==true||!Array.isArray(raw.Items))return [];
  return raw.Items.filter(t=>Number.isSafeInteger(t.Id)&&t.Id>0&&t.StageId===stageId);
}
export async function getPublicTrack(stageId:number,id:number):Promise<PublicTrackDetail|null>{
  if(!Number.isSafeInteger(id)||id<=0||!Number.isSafeInteger(stageId)||stageId<=0)return null;
  const raw=await getPublicObject('learning-tracks/'+id) as PublicTrackDetail|null;
  if(raw?.Track?.Id!==id||raw.Track.StageId!==stageId||!Array.isArray(raw.Categories)||!raw.Categories.length||
     !Array.isArray(raw.Skills)||!Array.isArray(raw.Examples))return null;
  return raw;
}
