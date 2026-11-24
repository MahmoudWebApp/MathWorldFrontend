import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {Link,isAppLocale} from '@/i18n/routing';
import {getPublicTrack,getPublicStages,SITE_URL} from '@/lib/publicCurriculum';
import {getStageAccent} from '@/lib/stageVisuals';

type Props={params:Promise<{locale:string;stageId:string;trackId:string}>};
export const revalidate=120;
export async function generateMetadata({params}:Props):Promise<Metadata>{
 const {locale,stageId,trackId}=await params;
 const data=await getPublicTrack(Number(stageId),Number(trackId));
 if(!isAppLocale(locale)||!data)return {robots:{index:false,follow:false}};
 const ar=locale==='ar',t=data.Track;
 const title=ar?t.NameAr:t.NameEn;
 const description=(ar?t.DescriptionAr:t.DescriptionEn)?.trim()||(ar?'تعرّف إلى الفئات والمهارات التعليمية في هذا المسار.':'Explore the topics and learning skills in this track.');
 const path='/stages/'+t.StageId+'/tracks/'+t.Id;
 return {title:title+' | MathWorld',description,alternates:{canonical:SITE_URL+'/'+locale+path,languages:{ar:SITE_URL+'/ar'+path,en:SITE_URL+'/en'+path}},openGraph:{title,description,url:SITE_URL+'/'+locale+path,siteName:'MathWorld',type:'website'}};
}
export default async function TrackPage({params}:Props){
 const {locale,stageId,trackId}=await params;
 if(!isAppLocale(locale))notFound();
 const [data,stages]=await Promise.all([getPublicTrack(Number(stageId),Number(trackId)),getPublicStages()]);
 if(!data)notFound();
 const ar=locale==='ar',t=data.Track;
 const stage=stages.find(s=>s.Id===t.StageId);
 const stageName=stage?(ar?stage.NameAr:stage.NameEn):(ar?'المرحلة التعليمية':'Learning stage');
 const title=ar?t.NameAr:t.NameEn;
 const description=ar?t.DescriptionAr:t.DescriptionEn;
 const accent=getStageAccent({Id:t.StageId});
 const path='/stages/'+t.StageId+'/tracks/'+t.Id;
 const breadcrumb=[{name:'MathWorld',url:SITE_URL+'/'+locale},{name:ar?'المراحل':'Stages',url:SITE_URL+'/'+locale+'/stages'},{name:stageName,url:SITE_URL+'/'+locale+'/stages/'+t.StageId},{name:title,url:SITE_URL+'/'+locale+path}];
 const schema={'@context':'https://schema.org','@graph':[{'@type':'BreadcrumbList',itemListElement:breadcrumb.map((b,i)=>({'@type':'ListItem',position:i+1,name:b.name,item:b.url}))},{'@type':'LearningResource',name:title,description,inLanguage:locale,educationalLevel:stageName,url:SITE_URL+'/'+locale+path,provider:{'@type':'EducationalOrganization',name:'MathWorld',url:SITE_URL},hasPart:data.Categories.map(c=>({'@type':'LearningResource',name:ar?c.NameAr:c.NameEn}))}]};
 return <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6">
  <nav aria-label={ar?'مسار التنقل':'Breadcrumb'} className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground"><Link href="/stages">{ar?'المراحل':'Stages'}</Link><span aria-hidden="true">/</span><Link href={'/stages/'+t.StageId}>{stageName}</Link><span aria-hidden="true">/</span><span aria-current="page">{title}</span></nav>
  <header className="space-y-3"><h1 className="text-3xl font-black sm:text-5xl" style={{color:accent}}>{title}</h1>{description&&<p className="max-w-3xl leading-8 text-muted-foreground">{description}</p>}<p className="text-sm">{data.Categories.length} {ar?'فئة':'topics'} · {data.Skills.length} {ar?'مهارة':'skills'} · {data.Categories.reduce((n,c)=>n+c.ProblemsCount,0)} {ar?'مسألة':'problems'}</p></header>
  <section className="space-y-4"><h2 className="text-xl font-bold">{ar?'الفئات والمهارات':'Topics and skills'}</h2><div className="grid gap-4 md:grid-cols-2">{data.Categories.map(c=><article key={c.Id} className="space-y-3 rounded-2xl border bg-card p-5" style={{borderColor:accent+'45'}}><div className="flex flex-wrap justify-between gap-2"><h3 className="font-bold" style={{color:accent}}>{ar?c.NameAr:c.NameEn}</h3><span className="text-sm" style={{color:accent}}>{c.ProblemsCount} {ar?'مسألة':'problems'}</span></div><p className="text-sm text-muted-foreground">{ar?c.DescriptionAr:c.DescriptionEn}</p><details><summary className="cursor-pointer font-medium">{ar?'المهارات التعليمية':'Learning skills'}</summary><ul className="mt-3 list-disc space-y-2 ps-5 text-sm">{data.Skills.filter(s=>s.CategoryId===c.Id).map(s=><li key={s.Id}><span className="font-medium">{ar?s.NameAr:s.NameEn}</span>{(ar?s.DescriptionAr:s.DescriptionEn)&&<p className="text-muted-foreground">{ar?s.DescriptionAr:s.DescriptionEn}</p>}</li>)}</ul></details>{!c.IsFree&&<Link href="/premium" className="text-sm text-primary">{ar?'متاحة ضمن Premium':'Available with Premium'}</Link>}</article>)}</div></section>
  {data.Examples.length>0&&<section className="space-y-3"><h2 className="text-xl font-bold">{ar?'أمثلة من عناوين المسائل':'Example problem titles'}</h2><ul className="list-disc space-y-2 ps-5">{data.Examples.map(p=><li key={p.Id}>{ar?p.TitleAr:p.TitleEn}</li>)}</ul></section>}
  <div className="flex flex-wrap gap-3"><Link href="/login" className="rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground">{ar?'تسجيل الدخول للتدريب':'Sign in to practice'}</Link><Link href="/register" className="rounded-xl border px-5 py-3 font-bold">{ar?'إنشاء حساب':'Create account'}</Link></div>
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema).replace(/</g,'\\u003c')}}/>
 </div>;
}
