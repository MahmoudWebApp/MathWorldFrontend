'use client';
import {useState} from 'react';
import {useLocale} from 'next-intl';
import {Link} from '@/i18n/routing';
import {Award,Download} from 'lucide-react';
import {useGetCertificatesQuery,useGetCertificateEligibilityQuery,useIssueCertificateMutation,useDownloadCertificateMutation,useGetLearningJourneyQuery,useGetStudentEntitlementQuery,type CertificateScope,type CertificateRecord} from '@/store/api/usersApi';

export default function CertificatesPage(){
  const ar=useLocale()==='ar';
  const journey=useGetLearningJourneyQuery(undefined,{refetchOnMountOrArgChange:true});
  const plan=useGetStudentEntitlementQuery(undefined,{refetchOnMountOrArgChange:true});
  const active=journey.currentData?.CertificatesEnabled===true;
  const list=useGetCertificatesQuery(undefined,{skip:!active,refetchOnMountOrArgChange:true});
  const j=journey.currentData;
  if(journey.isLoading)return <main className="p-6" role="status">{ar?'جارٍ التحميل…':'Loading…'}</main>;
  return <main className="mx-auto max-w-4xl space-y-5 p-4 sm:p-6">
    <header className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-2xl font-bold">{ar?'شهاداتي التعليمية':'My learning certificates'}</h1><Link className="text-primary" href="/dashboard">{ar?'الرئيسية':'Dashboard'}</Link></header>
    {journey.isError?<button onClick={()=>void journey.refetch()}>{ar?'إعادة المحاولة':'Retry'}</button>:!active?<p>{ar?'الشهادات غير متاحة حالياً.':'Certificates are not available.'}</p>:<>
      {list.isFetching&&!list.currentData?<p role="status">{ar?'جارٍ تحميل الشهادات…':'Loading certificates…'}</p>:list.isError?<button onClick={()=>void list.refetch()}>{ar?'إعادة تحميل الشهادات':'Reload certificates'}</button>:<>
        {list.currentData?.IssuanceEnabled&&plan.currentData?.IsPremium&&j&&<IssuePanel key={j.StageId+':'+(j.TrackId??0)} stageId={j.StageId} trackId={j.TrackId} categories={j.Categories.filter(c=>c.IsLocked===false&&c.TotalProblems>=5)}/>}
        <section className="space-y-3"><h2 className="font-bold">{ar?'الشهادات الصادرة':'Issued certificates'}</h2>{list.currentData?.Items.length?list.currentData.Items.map(c=><CertificateCard key={c.Id} c={c}/>):<p className="rounded-xl border p-4 text-muted-foreground">{ar?'لم تصدر لك شهادات بعد.':'No certificates issued yet.'}</p>}</section>
        <Link href="/verify-certificate" className="text-sm text-primary underline">{ar?'التحقق من شهادة':'Verify a certificate'}</Link>
      </>}
    </>}
  </main>;
}
function IssuePanel({stageId,trackId,categories}:{stageId:number;trackId?:number|null;categories:{CategoryId:number;NameAr:string;NameEn:string}[]}){
  const ar=useLocale()==='ar';const [choice,setChoice]=useState('');
  const [issue,state]=useIssueCertificateMutation();const [notice,setNotice]=useState('');
  const scope:CertificateScope={StageId:stageId,TrackId:trackId,CategoryId:choice==='track'?null:Number(choice)||null};
  const allowed=choice==='track'?!!trackId:categories.some(c=>String(c.CategoryId)===choice);
  const e=useGetCertificateEligibilityQuery(scope,{skip:!allowed,refetchOnMountOrArgChange:true});
  async function create(){if(!e.currentData?.Eligible||state.isLoading||e.isFetching)return;setNotice('');try{await issue(scope).unwrap();setNotice(ar?'تم إصدار الشهادة وحفظها.':'Certificate issued and saved.')}catch{setNotice(ar?'تعذّر الإصدار. تحقق من الشروط مجدداً.':'Issue failed. Check eligibility again.');void e.refetch();}}
  return <section className="rounded-2xl border bg-card p-5 space-y-4">
    <h2 className="font-bold">{ar?'استحقاق شهادة جديدة':'New certificate eligibility'}</h2>
    <p className="text-sm text-muted-foreground">{ar?'أكمل جميع مسائل النطاق المعتمد وأثبت الحل المستقل في كل مهارة.':'Complete every problem in the approved scope and demonstrate independent solving in every skill.'}</p>
    <label className="flex flex-wrap items-center gap-3">{ar?'النطاق':'Scope'}<select className="rounded-xl border bg-background p-2" value={choice} disabled={state.isLoading} onChange={ev=>{setChoice(ev.target.value);setNotice('')}}><option value="">{ar?'اختر':'Choose'}</option>{trackId&&<option value="track">{ar?'الصف أو المساق الكامل':'Entire grade or course'}</option>}{categories.map(c=><option key={c.CategoryId} value={c.CategoryId}>{ar?c.NameAr:c.NameEn}</option>)}</select></label>
    {allowed&&e.isFetching?<p role="status">{ar?'جارٍ التحقق…':'Checking…'}</p>:allowed&&e.isError?<button onClick={()=>void e.refetch()}>{ar?'إعادة التحقق':'Check again'}</button>:allowed&&e.currentData&&<div className="space-y-2">
      <p>{ar?'المسائل المكتملة':'Completed problems'}: {e.currentData.SolvedProblems} / {e.currentData.TotalProblems}</p><p>{ar?'المهارات المستقلة':'Independent skills'}: {e.currentData.IndependentSkills} / {e.currentData.RequiredSkills}</p>
      {!e.currentData.CatalogReady&&<p>{ar?'محتوى هذا النطاق لم يستوف شروط إصدار الشهادة.':'This scope has not met certificate catalog requirements.'}</p>}
      <button disabled={!e.currentData.Eligible||state.isLoading} onClick={()=>void create()} className="rounded-xl bg-primary px-4 py-3 font-bold text-primary-foreground disabled:opacity-50">{ar?'إصدار الشهادة':'Issue certificate'}</button>
    </div>}
    {notice&&<p role="status">{notice}</p>}
  </section>;
}
function CertificateCard({c}:{c:CertificateRecord}){
  const ar=useLocale()==='ar';const [download,state]=useDownloadCertificateMutation();const [error,setError]=useState(false);
  async function save(lang:'ar'|'en'){
    setError(false);try{const blob=await download({Id:c.Id,Lang:lang}).unwrap();
      if(blob.type!=='application/pdf'||(await blob.slice(0,5).text())!=='%PDF-')throw Error('pdf');
      const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='mathworld-certificate-'+lang+'.pdf';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
    }catch{setError(true);}
  }
  return <article className="rounded-2xl border bg-card p-4 space-y-3"><div className="flex items-center gap-3"><Award className="h-7 w-7 shrink-0 text-primary"/><div><h3 className="font-bold">{ar?c.TitleAr:c.TitleEn}</h3><p className="text-sm text-muted-foreground">{c.StudentName} · {new Date(c.IssuedAtUtc).toLocaleDateString(ar?'ar':'en')}</p></div></div>
    <p className="text-sm">{ar?'رمز التحقق':'Verification code'}: <code dir="ltr" className="break-all">{c.VerificationCode}</code></p>
    <div className="flex flex-wrap gap-2">{(['ar','en'] as const).map(lang=><button key={lang} disabled={state.isLoading} onClick={()=>void save(lang)} className="inline-flex items-center gap-2 rounded-xl border px-3 py-2"><Download className="h-4 w-4"/>PDF {lang==='ar'?'العربية':'English'}</button>)}</div>{error&&<p role="alert">{ar?'تعذّر تنزيل الشهادة.':'Certificate download failed.'}</p>}
  </article>;
}
