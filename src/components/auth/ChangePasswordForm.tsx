'use client';

import { useRef, useState } from 'react';
import { useLocale } from 'next-intl';
import { useDispatch } from 'react-redux';
import { LockKeyhole } from 'lucide-react';
import { API_BASE_URL } from '@/store/api/baseQuery';
import { clearAuthSession, getClientCookie } from '@/lib/authSession';
import { logout } from '@/store/slices/authSlice';

export function ChangePasswordForm() {
  const ar = useLocale() === 'ar';
  const locale = ar ? 'ar' : 'en';
  const dispatch = useDispatch();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const pending = useRef(false);
  const reset = () => { setCurrent(''); setNext(''); setConfirm(''); };
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current) return;
    setError('');
    if (next !== confirm || next.length < 12 || new TextEncoder().encode(next).length > 72) {
      setError(ar ? 'تأكد من التطابق ومن أن كلمة المرور 12 حرفاً على الأقل وبحد أقصى 72 بايت.' : 'Use matching passwords with at least 12 characters and at most 72 UTF-8 bytes.');
      return;
    }
    const token = getClientCookie('token');
    if (!token) { setError(ar ? 'سجّل الدخول مجدداً.' : 'Please sign in again.'); return; }
    pending.current = true; setBusy(true);
    try {
      // Do not put password fields in Redux actions or caches.
      const response = await fetch(API_BASE_URL + '/auth/change-password', {
        method:'POST', cache:'no-store', credentials:'omit',
        headers:{Authorization:'Bearer '+token,'Content-Type':'application/json','Accept-Language':locale},
        body:JSON.stringify({CurrentPassword:current,NewPassword:next,ConfirmPassword:confirm}),
      });
      if (response.status===401 || response.status===409) {
        reset();
        if (getClientCookie('token')===token) { clearAuthSession(); dispatch(logout()); window.location.replace('/'+locale+'/login'); }
        return;
      }
      const result = await response.json().catch(()=>null);
      if (!response.ok || result?.Success!==true || result?.Data?.RequiresSignIn!==true) {
        setError(typeof result?.Message==='string'?result.Message:ar?'تعذّر تغيير كلمة المرور.':'Could not change the password.');
        return;
      }
      reset();
      if (getClientCookie('token')===token) {
        clearAuthSession(); dispatch(logout()); window.location.replace('/'+locale+'/login?passwordChanged=1');
      }
    } catch { setError(ar?'تعذّر التأكد من نتيجة العملية. تحقق من تسجيل الدخول قبل إعادة المحاولة.':'Could not confirm the result. Check your sign-in before retrying.'); }
    finally { pending.current=false; setBusy(false); }
  }
  const fields = [
    {label:ar?'كلمة المرور الحالية':'Current password', value:current,set:setCurrent,auto:'current-password'},
    {label:ar?'كلمة المرور الجديدة':'New password',value:next,set:setNext,auto:'new-password'},
    {label:ar?'تأكيد كلمة المرور':'Confirm new password',value:confirm,set:setConfirm,auto:'new-password'},
  ];
  return <section className="space-y-4 rounded-2xl border bg-card p-5">
    <h2 className="flex items-center gap-2 text-lg font-bold"><LockKeyhole className="h-5 w-5 text-primary"/>{ar?'تغيير كلمة المرور':'Change password'}</h2>
    <p className="text-sm text-muted-foreground">{ar?'لحسابات كلمة المرور المحلية. يتم تسجيل خروج الأجهزة بعد النجاح. حسابات Google فقط تدير كلمة المرور عبر Google.':'For local passwords. Your devices sign out after success. Google-only accounts manage passwords through Google.'}</p>
    <form onSubmit={submit} className="space-y-3">{fields.map(field=><label key={field.label} className="block space-y-1 text-sm font-medium">{field.label}<input required maxLength={128} type="password" autoComplete={field.auto} value={field.value} disabled={busy} onChange={e=>field.set(e.target.value)} className="block w-full rounded-xl border bg-background p-2.5"/></label>)}
      {error&&<p role="alert" className="text-sm text-destructive">{error}</p>}
      <button disabled={busy} type="submit" className="rounded-xl bg-primary px-4 py-2.5 font-semibold text-primary-foreground disabled:opacity-60">{busy?(ar?'جارٍ الحفظ…':'Saving…'):(ar?'تغيير كلمة المرور':'Change password')}</button>
    </form>
  </section>;
}
