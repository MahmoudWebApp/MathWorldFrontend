'use client';
import {MathWorldLoading} from '@/components/ui/MathWorldLoading';
import {Settings,ExternalLink,Trash2,Plus} from 'lucide-react';
import {socialLinks} from '@/components/layout/socialLinks';
import {WorkspacePageHeader} from '@/components/ui/WorkspacePageHeader';

import { Tabs,TabsList,TabsTrigger,TabsContent } from '@/components/ui/Tabs';
import { useState } from 'react';
import { useLocale } from 'next-intl';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { ChangePasswordForm } from '@/components/auth/ChangePasswordForm';
import { EmailOutboxPanel } from '@/components/admin/EmailOutboxPanel';
import { getApiErrorMessage } from '@/lib/authSession';
import { useGetAdminBrandQuery, useUpdateBrandMutation, useLazyGetEmailPreviewQuery,emailTemplateLabels, defaultSocialLinks, type BrandView, type BrandProfile, type PlatformSocialLink } from '@/store/api/platformBrandApi';

const socialNames:Record<string,string>={YouTube:'يوتيوب',TikTok:'تيك توك',Facebook:'فيسبوك',Instagram:'إنستغرام',GitHub:'غيت هب','X (Twitter)':'إكس',LinkedIn:'لينكد إن'};
const inputClass='w-full rounded-xl border bg-background p-2.5 text-sm';
function BrandEditor({initial,ar}:{initial:BrandView;ar:boolean}) {
  const email=useSelector((s:RootState)=>s.auth.user?.Email);
  const [profile,setProfile]=useState<BrandProfile>(()=>structuredClone({...initial.Profile,SupportEmail:initial.Profile.SupportEmail||email||'',DescriptionAr:initial.Profile.DescriptionAr||'منصة عالم الرياضيات التعليمية لتدريب الطلاب وتطوير مهاراتهم في الرياضيات لجميع المراحل الدراسية.',DescriptionEn:initial.Profile.DescriptionEn||'MathWorld is an interactive educational platform for practicing mathematics and building problem-solving skills across all grade levels.',TermsUrl:initial.Profile.TermsUrl||'https://math-world-frontend.vercel.app/ar/terms',SocialLinks:initial.Revision===0&&!initial.Profile.SocialLinks.length?defaultSocialLinks:initial.Profile.SocialLinks}));
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
    <label className="grid gap-2 text-sm">{ar?'الموقع الرسمي':'Official website'}<input className={inputClass} dir="ltr" readOnly value={initial.WebsiteUrl}/></label>
    <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">{fields.map(field=><label className="grid min-w-0 gap-2 text-sm font-medium" key={field.key}>{ar?field.ar:field.en}<input className={inputClass} dir={field.key.endsWith("Url")||field.key==="SupportEmail"||field.key==="Phone"||field.key.endsWith("En")?"ltr":"auto"} placeholder={field.key==='Phone'?(ar?'رقم هاتف الدعم (اختياري)':'Optional support phone'):field.key.startsWith('ContactAddress')?(ar?'عنوان التواصل (اختياري)':'Optional contact address'):undefined} value={profile[field.key]??''} onChange={e=>setProfile(p=>({...p,[field.key]:e.target.value}))}/></label>)}</div>
    <h3 className="font-bold">{ar?'روابط التواصل الاجتماعي':'Social links'}</h3>
    <div className="overflow-x-auto rounded-xl border"><table className="mw-workspace-table min-w-[680px] text-sm">
      <thead><tr>{[ar?'المنصة':'Platform',ar?'الرابط':'Link',ar?'الترتيب':'Order',ar?'منشور':'Published',ar?'حذف':'Remove'].map(label=><th key={label} className="px-3 py-3 text-start">{label}</th>)}</tr></thead>
      <tbody>{profile.SocialLinks.map((row,i)=>{
        const item=socialLinks.find(x=>x.name.toLowerCase()===row.Platform.toLowerCase());
        return <tr key={i} className="border-b">
          <td className="p-2"><div className="flex items-center gap-2"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">{item?.icon??<ExternalLink size={16}/>}</span>
            <select aria-label={ar?'المنصة':'Platform'} className={inputClass} value={item?.name??'__custom'} onChange={e=>{const platform=socialLinks.find(x=>x.name===e.target.value);if(platform)modify(i,{Platform:platform.name,LabelAr:socialNames[platform.name]??platform.name,LabelEn:platform.name,Url:platform.href});else modify(i,{Platform:'',LabelAr:'',LabelEn:'',Url:'',IsEnabled:false});}}>
              {socialLinks.map(x=><option key={x.name} value={x.name}>{x.name}</option>)}<option value="__custom">{ar?'أخرى':'Other'}</option>
            </select></div>
            {!item&&<input aria-label={ar?'اسم المنصة الأخرى':'Other platform name'} placeholder={ar?'اسم المنصة':'Platform name'} className={inputClass+' mt-2'} value={row.Platform} onChange={e=>modify(i,{Platform:e.target.value,LabelAr:e.target.value,LabelEn:e.target.value})}/>}
          </td>
          <td className="p-2"><input aria-label={ar?'الرابط':'URL'} dir="ltr" className={inputClass} value={row.Url} onChange={e=>modify(i,{Url:e.target.value})}/></td>
          <td className="w-24 p-2"><input aria-label={ar?'الترتيب':'Order'} className={inputClass} type="number" min={0} max={1000} value={row.DisplayOrder} onChange={e=>modify(i,{DisplayOrder:Number(e.target.value)})}/></td>
          <td className="p-2 text-center"><input type="checkbox" aria-label={ar?'منشور':'Published'} checked={row.IsEnabled} onChange={e=>modify(i,{IsEnabled:e.target.checked})}/></td>
          <td className="p-2"><button type="button" className="rounded-lg p-2 text-destructive hover:bg-destructive/10" aria-label={ar?'حذف الرابط':'Remove link'} onClick={()=>setProfile(p=>({...p,SocialLinks:p.SocialLinks.filter((_,n)=>n!==i)}))}><Trash2 size={16}/></button></td>
        </tr>;
      })}</tbody>
    </table></div>
    <button type="button" disabled={profile.SocialLinks.length>=20} className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm" onClick={()=>setProfile(p=>({...p,SocialLinks:[...p.SocialLinks,{Platform:'',LabelAr:'',LabelEn:'',Url:'',IsEnabled:false,DisplayOrder:p.SocialLinks.length}]}))}><Plus size={16}/>{ar?'إضافة رابط':'Add link'}</button>
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
      <select aria-label={ar?'القالب':'Template'} value={template} onChange={e=>setTemplate(e.target.value)} className="rounded-xl border bg-background p-2">{Object.entries(emailTemplateLabels).map(([key,labels])=><option key={key} value={key}>{labels[ar?0:1]}</option>)}</select>
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
  return <main className="mx-auto w-full max-w-7xl space-y-4 p-4 sm:p-6"><WorkspacePageHeader title={ar?'إعدادات المنصة':'Platform settings'} icon={Settings}/><Tabs defaultValue="brand" dir={ar?"rtl":"ltr"}><TabsList className="flex h-auto w-fit max-w-full flex-wrap justify-start gap-1"><TabsTrigger value="brand">{ar?"الهوية والتواصل":"Brand and contact"}</TabsTrigger><TabsTrigger value="password">{ar?"كلمة المرور":"Password"}</TabsTrigger><TabsTrigger value="preview">{ar?"قوالب البريد":"Email templates"}</TabsTrigger><TabsTrigger value="outbox">{ar?"إرسال البريد":"Email delivery"}</TabsTrigger></TabsList><TabsContent value="brand">{isLoading&&<MathWorldLoading/>}{isError&&<div role="alert">{ar?'تعذّر تحميل الإعدادات.':'Could not load settings.'} <button className="underline" onClick={()=>void refetch()}>{ar?'إعادة المحاولة':'Retry'}</button></div>}{data&&!isError&&<BrandEditor initial={data} ar={ar}/>}</TabsContent><TabsContent value="password"><ChangePasswordForm/></TabsContent><TabsContent value="preview"><EmailPreview ar={ar}/></TabsContent><TabsContent value="outbox"><EmailOutboxPanel/></TabsContent></Tabs></main>;
}
