'use client';
import {useState,type FormEvent} from 'react';
import {useLocale} from 'next-intl';
import {useSelector} from 'react-redux';
import type {RootState} from '@/store';
import {Send,MessageCircle} from 'lucide-react';
import {useSendContactMutation} from '@/store/api/notificationsApi';
const field='w-full rounded-xl border bg-background px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary';
const categories=[['complaint','شكوى أو الإبلاغ عن مشكلة','Complaint or problem report'],['suggestion','اقتراح تحسين للمنصة','Improvement suggestion'],['feedback','رأي أو تقييم عام','Feedback'],['inquiry','استفسار عام أو حول الاشتراكات','General or subscription inquiry'],['other','أخرى','Other']] as const;
export function ContactForm(){
 const ar=useLocale()==='ar';
 const user=useSelector((s:RootState)=>s.auth.user);
 const [name,setName]=useState<string|null>(null),[email,setEmail]=useState<string|null>(null);
 const [category,setCategory]=useState(''),[subject,setSubject]=useState(''),[message,setMessage]=useState('');
 const [send,{isLoading}]=useSendContactMutation();
 const [status,setStatus]=useState<'idle'|'sent'|'error'>('idle');
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();if(isLoading)return;setStatus('idle');
  try{const result=await send({Name:(name??user?.FullName??'').trim(),Email:(email??user?.Email??'').trim(),Category:category,Subject:subject.trim(),Message:message.trim()}).unwrap();if(!result.Received)throw Error('ContactFailed');setStatus('sent');setMessage('');setSubject('');setCategory('');}catch{setStatus('error');}
 }
 return <section className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6"><form className="space-y-5 rounded-3xl border bg-card p-5 sm:p-8" onSubmit={submit}>
 <header className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary"><MessageCircle size={22}/></span><div><h2 className="text-xl font-bold">{ar?'أرسل رسالة':'Send a message'}</h2><p className="text-sm text-muted-foreground">{ar?'شاركنا ملاحظاتك أو استفسارك.':'Share your feedback or question.'}</p></div></header>
 <div className="grid gap-4 sm:grid-cols-2"><label className="space-y-2 text-sm font-semibold">{ar?'الاسم الكامل':'Full name'}<input className={field} required minLength={2} maxLength={100} autoComplete="name" value={name??user?.FullName??''} onChange={e=>setName(e.target.value)}/></label><label className="space-y-2 text-sm font-semibold">{ar?'البريد الإلكتروني':'Email'}<input className={field} required type="email" maxLength={254} autoComplete="email" dir="ltr" value={email??user?.Email??''} onChange={e=>setEmail(e.target.value)}/></label></div>
 <label className="block space-y-2 text-sm font-semibold">{ar?'نوع الرسالة':'Message category'}<select className={field} value={category} required onChange={e=>setCategory(e.target.value)}><option value="">{ar?'اختر نوع الرسالة':'Choose category'}</option>{categories.map(c=><option key={c[0]} value={c[0]}>{c[ar?1:2]}</option>)}</select></label>
 <label className="block space-y-2 text-sm font-semibold">{ar?'عنوان الرسالة (اختياري)':'Subject (optional)'}<input className={field} maxLength={100} value={subject} onChange={e=>setSubject(e.target.value)}/></label>
 <label className="block space-y-2 text-sm font-semibold">{ar?'نص الرسالة':'Message'}<textarea className={field} required minLength={10} maxLength={500} rows={5} value={message} onChange={e=>setMessage(e.target.value)}/><span className="block text-end text-xs text-muted-foreground">{message.length}/500</span></label>
 {status==='sent'&&<p role="status" className="rounded-xl bg-emerald-500/10 p-3 text-emerald-700 dark:text-emerald-300">{ar?'وصلت رسالتك إلى صندوق الإدارة. شكراً لتواصلك.':'Your message reached the administration inbox. Thank you.'}</p>}
 {status==='error'&&<p role="alert" className="rounded-xl bg-destructive/10 p-3 text-destructive">{ar?'لم تُرسل الرسالة. تحقق من الحقول وحاول مجدداً لاحقاً.':'Message not sent. Check the fields and try again later.'}</p>}
 <button type="submit" disabled={isLoading} className="sr-wave-button inline-flex items-center gap-2 rounded-xl px-5 py-3 font-bold text-white disabled:opacity-50"><Send size={17}/>{isLoading?(ar?'جارٍ الإرسال…':'Sending…'):(ar?'إرسال الرسالة':'Send message')}</button>
 </form></section>;
}
