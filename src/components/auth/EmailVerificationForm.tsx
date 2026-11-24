'use client';

import {useEffect,useRef,useState} from 'react';
import {useLocale} from 'next-intl';
import {Link} from '@/i18n/routing';
import {MailCheck} from 'lucide-react';
import {API_BASE_URL} from '@/store/api/baseQuery';

export function EmailVerificationForm(){
  const ar=useLocale()==='ar';
  const secret=useRef<string|null>(null);
  const pending=useRef(false);
  const [ready,setReady]=useState(false);
  const [busy,setBusy]=useState(false);
  const [success,setSuccess]=useState(false);
  const [error,setError]=useState('');
  useEffect(()=>{
    const hash=window.location.hash;
    if(hash){
      const token=new URLSearchParams(hash.slice(1)).get('token');
      secret.current=token&&/^[0-9a-f]{64}$/.test(token)?token:null;
      window.history.replaceState(window.history.state,'',window.location.pathname);
    }
    setReady(true);
  },[]);
  async function confirm(){
    if(pending.current||!secret.current)return;
    pending.current=true;setBusy(true);setError('');
    try{
      const response=await fetch(API_BASE_URL+'/auth/email-verification/confirm',{
        method:'POST',cache:'no-store',credentials:'omit',referrerPolicy:'no-referrer',
        headers:{'Content-Type':'application/json','Accept-Language':ar?'ar':'en'},
        body:JSON.stringify({Token:secret.current})
      });
      const data=await response.json().catch(()=>null);
      if(response.ok&&data?.EmailVerified===true){secret.current=null;setSuccess(true);}
      else if(response.status===400){secret.current=null;setError(ar?'الرابط غير صالح أو مستخدم أو منتهي.':'The link is invalid, used or expired.');}
      else setError(response.status===429?(ar?'محاولات كثيرة. حاول لاحقاً.':'Too many attempts. Try later.'):(ar?'تعذّر تأكيد البريد. حاول مجدداً.':'Could not verify email. Try again.'));
    }catch{setError(ar?'تعذّر الاتصال بالخادم.':'Could not reach the server.');}
    finally{pending.current=false;setBusy(false);}
  }
  return <main className="brand-hero-bg flex min-h-[70vh] items-center justify-center px-4 py-12">
    <section className="brand-surface math-card w-full max-w-md space-y-5 rounded-3xl p-6 sm:p-8">
      <MailCheck className="h-8 w-8 text-primary" aria-hidden/>
      <h1 className="text-2xl font-bold">{ar?'تأكيد البريد الإلكتروني':'Verify your email'}</h1>
      {!ready?<p role="status">{ar?'جارٍ التحقق…':'Checking…'}</p>:success?<p role="status">{ar?'تم تأكيد البريد بنجاح. يمكنك تعديل تفضيلات البريد من إعدادات حسابك.':'Your email has been verified. Manage your email preferences in account settings.'}</p>
        :secret.current?<><p>{ar?'اضغط لتأكيد بريد حساب MathWorld. لن تتغير كلمة مرورك ولن يتم تسجيل دخولك تلقائياً.':'Confirm your MathWorld account email. This does not change your password or sign you in.'}</p><button type="button" disabled={busy} onClick={()=>void confirm()} className="w-full rounded-xl bg-primary p-3 text-primary-foreground disabled:opacity-60">{busy?(ar?'جارٍ التأكيد…':'Verifying…'):(ar?'تأكيد البريد':'Verify email')}</button></>
        :!error&&<p role="alert">{ar?'الرابط غير صالح. اطلب رابطاً جديداً من إعدادات الحساب.':'Invalid link. Request a new link from account settings.'}</p>}
      {error&&<p role="alert" className="text-destructive">{error}</p>}
      <Link href="/dashboard/settings" className="block text-center text-primary underline">{ar?'إعدادات الحساب':'Account settings'}</Link>
    </section>
  </main>;
}
