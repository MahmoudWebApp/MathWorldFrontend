'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { ChangePasswordForm } from '@/components/auth/ChangePasswordForm';
import { EmailOutboxPanel } from '@/components/admin/EmailOutboxPanel';
import { getApiErrorMessage } from '@/lib/authSession';
import { useGetAdminBrandQuery, useUpdateBrandMutation, useLazyGetEmailPreviewQuery, type BrandView, type BrandProfile, type PlatformSocialLink } from '@/store/api/platformBrandApi';

const inputClass='w-full rounded-xl border bg-background p-2.5 text-sm';
function BrandEditor({initial,ar}:{initial:BrandView;ar:boolean}) {
  const [profile,setProfile]=useState<BrandProfile>(()=>structuredClone(initial.Profile));
  const [revision,setRevision]=useState(initial.Revision);
  const [save,{isLoading}]=useUpdateBrandMutation();
  const [status,setStatus]=useState('');
  const [error,setError]=useState('');
  const fields:{key:Exclude<keyof BrandProfile,'SocialLinks'>;ar:string;en:string}[]=[
    {key:'NameAr',ar:'الاسم بالعربية',en:'Arabic name'},{key:'NameEn',ar:'الاسم بالإنجليزية',en:'English name'},
    {key:'LogoUrl',ar:'رابط الشعار من الموقع الرسمي',en:'Official-site logo URL'},{key:'SupportEmail',ar:'بريد الدعم المعتمد',en:'Approved support email'},{key:'Phone',ar:'الهاتف',en:'Phone'},
    {key:'ContactAddressAr',ar:'العنوان بالعربية',en:'Arabic address'},{key:'ContactAddressEn',ar:'العنوان بالإنجليزية',en:'English address'},
    {key:'DescriptionAr',ar:'الوصف بالعربية',en:'Arabic description'},{key:'DescriptionEn',ar:'الوصف بالإنجليزية',en:'English description'},
    {key:'HelpUrl',ar:'رابط المساعدة',en:'Help URL'},{key:'PrivacyUrl',ar:'رابط الخصوصية',en:'Privacy URL'},{key:'TermsUrl',ar:'رابط الشروط',en:'Terms URL'},
  ];
  const modify=(index:number,change:Partial<PlatformSocialLink>)=>setProfile(p=>({...p,SocialLinks:p.SocialLinks.map((row,i)=>i===index?{...row,...change}:row)}));
  async function submit(e:React.FormEvent<HTMLFormElement>) {
    e.preventDefault();setError('');setStatus('');
    try {const result=await save({Revision:revision,Profile:profile}).unwrap();setProfile(result.Profile);setRevision(result.Revision);setStatus(ar?'تم حفظ الإعدادات.':'Settings saved.');}
    catch(e){setError(getApiErrorMessage(e,ar?'تعذّر الحفظ.':'Could not save.'));}
  }
  return <form onSubmit={submit} className="space-y-5 rounded-2xl border bg-card p-5">
    <h2 className="text-lg font-bold">{ar?'الهوية وبيانات التواصل':'Brand and contact details'}</h2>
    <label className="block text-sm">{ar?'الموقع الرسمي':'Official website'}<input className={inputClass} readOnly value={initial.WebsiteUrl}/></label>
    <div className="grid gap-3 sm:grid-cols-2">{fields.map(field=><label className="block space-y-1 text-sm" key={field.key}>{ar?field.ar:field.en}<input className={inputClass} value={profile[field.key]??''} onChange={e=>setProfile(p=>({...p,[field.key]:e.target.value}))}/></label>)}</div>
    <h3 className="font-bold">{ar?'روابط التواصل الاجتماعي':'Social links'}</h3>
    {profile.SocialLinks.map((row,i)=><div key={i} className="grid gap-2 rounded-xl border p-3 sm:grid-cols-2">
      {(['Platform','LabelAr','LabelEn','Url'] as const).map((key,k)=><label key={key} className="text-sm">{ar?['المنصة','الاسم بالعربي','الاسم بالإنجليزي','الرابط'][k]:['Platform','Arabic label','English label','URL'][k]}<input className={inputClass} value={row[key]} onChange={e=>modify(i,{[key]:e.target.value})}/></label>)}
      <label className="text-sm">{ar?'الترتيب':'Order'}<input className={inputClass} type="number" min={0} max={1000} value={row.DisplayOrder} onChange={e=>modify(i,{DisplayOrder:Number(e.target.value)})}/></label>
      <div className="flex items-center gap-3"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={row.IsEnabled} onChange={e=>modify(i,{IsEnabled:e.target.checked})}/>{ar?'منشور':'Published'}</label><button type="button" className="text-destructive" onClick={()=>setProfile(p=>({...p,SocialLinks:p.SocialLinks.filter((_,n)=>n!==i)}))}>{ar?'حذف':'Remove'}</button></div>
    </div>)}
    <button type="button" disabled={profile.SocialLinks.length>=20} className="rounded-xl border px-4 py-2 text-sm" onClick={()=>setProfile(p=>({...p,SocialLinks:[...p.SocialLinks,{Platform:'',LabelAr:'',LabelEn:'',Url:'',IsEnabled:false,DisplayOrder:p.SocialLinks.length}]}))}>{ar?'إضافة رابط':'Add link'}</button>
    {status&&<p role="status" className="text-primary">{status}</p>}{error&&<p role="alert" className="text-destructive">{error}</p>}
    <button disabled={isLoading} className="block rounded-xl bg-primary px-4 py-2.5 text-primary-foreground disabled:opacity-60" type="submit">{isLoading?(ar?'جارٍ الحفظ…':'Saving…'):(ar?'حفظ الإعدادات':'Save settings')}</button>
  </form>;
}
function EmailPreview({ar}:{ar:boolean}){
  const [language,setLanguage]=useState(ar?'ar':'en');
  const [template,setTemplate]=useState('password-changed');
  const [load,{data,isFetching,isError}]=useLazyGetEmailPreviewQuery();
  return <section className="space-y-3 rounded-2xl border bg-card p-5">
    <h2 className="text-lg font-bold">{ar?'معاينة قوالب البريد':'Email template preview'}</h2>
    <p className="text-sm text-muted-foreground">{ar?'معاينة فقط، لا يتم إرسال رسائل حقيقية.':'Preview only. No actual email is sent.'}</p>
    <div className="flex flex-wrap gap-2">
      <select aria-label={ar?'القالب':'Template'} value={template} onChange={e=>setTemplate(e.target.value)} className="rounded-xl border bg-background p-2"><option value="supervisor-invite">{ar?'دعوة مشرف':'Supervisor invitation'}</option><option value="password-reset">{ar?'استعادة كلمة المرور':'Password reset'}</option><option value="password-changed">{ar?'تغيير كلمة المرور':'Password changed'}</option><option value="welcome">{ar?'الترحيب':'Welcome'}</option><option value="announcement">{ar?'إشعار إداري':'Announcement'}</option></select>
      <select aria-label={ar?'اللغة':'Language'} value={language} onChange={e=>setLanguage(e.target.value)} className="rounded-xl border bg-background p-2"><option value="ar">العربية</option><option value="en">English</option></select>
      <button type="button" disabled={isFetching} className="rounded-xl bg-primary px-4 py-2 text-primary-foreground" onClick={()=>void load({language,template})}>{ar?'معاينة':'Preview'}</button>
    </div>
    {isError&&<p role="alert">{ar?'تعذّرت المعاينة':'Preview failed'}</p>}
    {data&&!isFetching&&!isError&&<><p className="font-semibold">{data.Subject}</p><iframe title={ar?'معاينة البريد':'Email preview'} sandbox="" srcDoc={data.Html} className="h-[460px] w-full rounded-xl border bg-white"/><details><summary>{ar?'النص البديل':'Plain text'}</summary><pre className="whitespace-pre-wrap break-words text-sm">{data.PlainText}</pre></details></>}
  </section>;
}
export default function AdminSettingsPage(){
  const ar=useLocale()==='ar';
  const admin=useSelector((s:RootState)=>s.auth.user?.Role==='Admin');
  const {data,isLoading,isError,refetch}=useGetAdminBrandQuery(undefined,{skip:!admin});
  if(!admin)return null;
  return <main className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6"><h1 className="text-2xl font-bold">{ar?'إعدادات المنصة':'Platform settings'}</h1><ChangePasswordForm/>{isLoading&&<p role="status">{ar?'جارٍ التحميل…':'Loading…'}</p>}{isError&&<div role="alert">{ar?'تعذّر تحميل الإعدادات.':'Could not load settings.'} <button className="underline" onClick={()=>void refetch()}>{ar?'إعادة المحاولة':'Retry'}</button></div>}{data&&!isError&&<BrandEditor initial={data} ar={ar}/>}<EmailPreview ar={ar}/><EmailOutboxPanel/></main>;
}
