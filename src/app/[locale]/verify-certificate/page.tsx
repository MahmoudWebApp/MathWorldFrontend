'use client';
import {useState} from 'react';
import {useLocale} from 'next-intl';
import {API_BASE_URL} from '@/store/api/baseQuery';
import {Link} from '@/i18n/routing';
type Verification={Valid:boolean;TitleAr:string;TitleEn:string;IssuedAtUtc:string;TotalProblems:number;RequiredSkills:number};
export default function VerifyCertificate(){
 const ar=useLocale()==='ar';const [code,setCode]=useState('');const [result,setResult]=useState<Verification|null>(null);const [error,setError]=useState('');const [busy,setBusy]=useState(false);
 async function verify(){if(busy||!(/^[a-f0-9]{32}$/i.test(code.trim())))return;setBusy(true);setResult(null);setError('');try{
  const response=await fetch(API_BASE_URL+'/certificates/verify/'+code.trim().toLowerCase(),{cache:'no-store',credentials:'omit',referrerPolicy:'no-referrer'});
  if(response.status===404){setError(ar?'لم يتم العثور على شهادة بهذا الرمز.':'No certificate found for this code.');return;}
  if(!response.ok)throw Error('request');const data=await response.json() as Verification;if(data.Valid!==true)throw Error('invalid');setResult(data);
 }catch{setError(ar?'تعذّر التحقق. أعد المحاولة.':'Verification unavailable. Try again.')}finally{setBusy(false)}}
 return <main className="mx-auto max-w-xl space-y-5 px-4 py-12"><Link href="/" className="text-primary">MathWorld</Link><h1 className="text-2xl font-bold">{ar?'التحقق من شهادة':'Verify certificate'}</h1><p>{ar?'أدخل رمز التحقق الموجود في الشهادة. لا تعرض صفحة التحقق اسم الطالب حفاظاً على الخصوصية.':'Enter the verification code printed on the certificate. Holder names are not disclosed for privacy.'}</p>
 <form onSubmit={e=>{e.preventDefault();void verify()}} className="space-y-3"><label className="block">{ar?'رمز التحقق':'Verification code'}<input autoComplete="off" dir="ltr" value={code} maxLength={32} disabled={busy} onChange={e=>{setCode(e.target.value);setResult(null);setError('')}} className="mt-1 w-full rounded-xl border bg-background p-3"/></label><button disabled={busy||!(/^[a-f0-9]{32}$/i.test(code.trim()))} className="rounded-xl bg-primary px-4 py-3 font-bold text-primary-foreground disabled:opacity-50">{ar?'تحقق':'Verify'}</button></form>
 {error&&<p role="alert">{error}</p>}{result&&<section className="space-y-2 rounded-xl border p-4" role="status"><h2 className="font-bold text-emerald-600">{ar?'شهادة صادرة عن MathWorld':'Certificate issued by MathWorld'}</h2><p>{ar?result.TitleAr:result.TitleEn}</p><p>{new Date(result.IssuedAtUtc).toLocaleDateString(ar?'ar':'en')}</p><p>{ar?'المسائل / المهارات':'Problems / skills'}: {result.TotalProblems} / {result.RequiredSkills}</p><p className="text-sm">{ar?'الرمز يؤكد وجود شهادة صادرة ولا يثبت هوية حاملها.':'The code confirms issuance, not the holder’s identity.'}</p></section>}</main>;
}
