'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { LockKeyhole, Mail } from 'lucide-react';
import { API_BASE_URL } from '@/store/api/baseQuery';
import { clearAuthSession } from '@/lib/authSession';

const inputClass = 'block w-full rounded-xl border border-brand-primary/20 bg-background p-3';
const buttonClass = 'w-full rounded-xl bg-primary p-3 font-semibold text-primary-foreground disabled:opacity-60';
async function requestRecovery(path: string, body: object, locale: string) {
  // Passwords and bearer recovery secrets never enter Redux, analytics,
  // browser storage or query-string URLs.
  const result = await fetch(API_BASE_URL + '/auth/' + path, {
    method: 'POST', cache: 'no-store', credentials: 'omit', referrerPolicy: 'no-referrer',
    headers: { 'Content-Type': 'application/json', 'Accept-Language': locale },
    body: JSON.stringify(body),
  });
  const payload = await result.json().catch(() => null);
  return { ok: result.ok && payload?.Success === true, data: payload?.Data, status: result.status };
}

export function ForgotPasswordForm() {
  const ar = useLocale() === 'ar';
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState('');
  const pending = useRef(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current) return;
    pending.current = true; setBusy(true); setError('');
    try {
      const result = await requestRecovery('forgot-password', { Email: email.trim() }, ar ? 'ar' : 'en');
      if (result.ok && result.data?.Accepted === true) { setAccepted(true); setEmail(''); }
      else setError(result.status === 429
        ? ar ? 'محاولات كثيرة. حاول بعد دقيقة.' : 'Too many requests. Try again in a minute.'
        : ar ? 'تعذّر إرسال الطلب. حاول مجدداً.' : 'Could not submit the request. Try again.');
    } catch { setError(ar ? 'تعذّر الاتصال بالخادم.' : 'Could not reach the server.'); }
    finally { pending.current = false; setBusy(false); }
  }
  return <main className="brand-hero-bg flex min-h-[70vh] items-center justify-center px-4 py-12">
    <section className="brand-surface math-card w-full max-w-md space-y-5 rounded-3xl p-6 sm:p-8">
      <Mail className="h-8 w-8 text-primary" aria-hidden />
      <h1 className="text-2xl font-bold">{ar ? 'استعادة كلمة المرور' : 'Recover your password'}</h1>
      {accepted ? <p role="status" className="rounded-xl border bg-card p-4 text-sm leading-relaxed">{ar
        ? 'إذا كان الحساب مؤهلاً للاستعادة ستصلك رسالة على بريدك. افحص البريد غير المرغوب أيضاً. إذا كنت تستخدم Google فجرّب تسجيل الدخول به.'
        : 'If the account is eligible for recovery, you will receive an email. Check spam too. If you use Google, try signing in with Google.'}</p> :
        <form onSubmit={submit} className="space-y-4">
          <p className="text-sm text-muted-foreground">{ar ? 'أدخل البريد المرتبط بحسابك المحلي.' : 'Enter the email associated with your local account.'}</p>
          <label className="block space-y-1 text-sm font-medium">{ar ? 'البريد الإلكتروني' : 'Email'}<input className={inputClass} type="email" autoComplete="email" maxLength={254} required value={email} onChange={e=>setEmail(e.target.value)} disabled={busy}/></label>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <button type="submit" disabled={busy} className={buttonClass}>{busy ? (ar?'جارٍ الإرسال…':'Submitting…') : (ar?'طلب رابط الاستعادة':'Request recovery link')}</button>
        </form>}
      <Link href="/login" className="block text-center text-sm font-semibold text-primary hover:underline">{ar ? 'العودة إلى تسجيل الدخول' : 'Back to sign in'}</Link>
    </section>
  </main>;
}

export function ResetPasswordForm() {
  const ar = useLocale() === 'ar';
  const [ready, setReady] = useState(false);
  const secret = useRef<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [error, setError] = useState('');
  const pending = useRef(false);
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const value = new URLSearchParams(hash.slice(1)).get('token');
      secret.current = value && /^[0-9a-f]{64}$/.test(value) ? value : null;
      // Remove the bearer secret from visible history before any user action.
      window.history.replaceState(window.history.state, '', window.location.pathname);
    }
    setReady(true);
  }, []);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current || !secret.current) return;
    setError('');
    if (password !== confirmation || password.length < 12 || password.trim().length === 0 ||
      /[\u0000-\u001f\u007f-\u009f]/.test(password) || new TextEncoder().encode(password).length > 72) {
      setError(ar ? 'استخدم كلمتين متطابقتين، 12 حرفاً على الأقل و72 بايت كحد أقصى.' : 'Use matching passwords, at least 12 characters and at most 72 UTF-8 bytes.');
      return;
    }
    pending.current = true; setBusy(true);
    try {
      const result = await requestRecovery('reset-password', { Token: secret.current, NewPassword: password, ConfirmPassword: confirmation }, ar?'ar':'en');
      if (result.ok && result.data?.RequiresSignIn === true) {
        secret.current = null; setPassword(''); setConfirmation(''); clearAuthSession(); setSuccess(true);
      } else if (result.status === 400) {
        secret.current = null; setPassword(''); setConfirmation(''); setInvalid(true);
      } else setError(result.status === 429 ? ar?'محاولات كثيرة. حاول بعد دقيقة.':'Too many attempts. Try again in a minute.' : ar?'تعذّر التأكد من النتيجة. حاول مجدداً.':'Could not confirm the result. Try again.');
    } catch { setError(ar?'تعذّر الاتصال. إذا انتهت صلاحية الرابط فاطلب رابطاً جديداً.':'Connection failed. Request a new link if this one has expired.'); }
    finally { pending.current = false; setBusy(false); }
  }
  return <main className="brand-hero-bg flex min-h-[70vh] items-center justify-center px-4 py-12">
    <section className="brand-surface math-card w-full max-w-md space-y-5 rounded-3xl p-6 sm:p-8">
      <LockKeyhole className="h-8 w-8 text-primary" aria-hidden />
      <h1 className="text-2xl font-bold">{ar ? 'تعيين كلمة مرور جديدة' : 'Set a new password'}</h1>
      {!ready ? <p role="status">{ar?'جارٍ التحقق…':'Checking…'}</p> : success ?
        <><p role="status" className="text-sm text-primary">{ar?'تم تغيير كلمة المرور وإبطال الجلسات السابقة.':'Password reset. Previous sessions have been revoked.'}</p>
        <a href={ar?'/ar/login':'/en/login'} className="block text-center font-semibold text-primary underline">{ar?'تسجيل الدخول':'Sign in'}</a></>
        : invalid || !secret.current ? <><p role="alert">{ar?'رابط الاستعادة غير صالح أو منتهي.':'The recovery link is invalid or expired.'}</p><Link href="/forgot-password" className="text-primary underline">{ar?'طلب رابط جديد':'Request a new link'}</Link></>
        : <form onSubmit={submit} className="space-y-4">
          <label className="block space-y-1 text-sm font-medium">{ar?'كلمة المرور الجديدة':'New password'}<input type="password" autoComplete="new-password" className={inputClass} required maxLength={128} value={password} onChange={e=>setPassword(e.target.value)} disabled={busy}/></label>
          <label className="block space-y-1 text-sm font-medium">{ar?'تأكيد كلمة المرور':'Confirm password'}<input type="password" autoComplete="new-password" className={inputClass} required maxLength={128} value={confirmation} onChange={e=>setConfirmation(e.target.value)} disabled={busy}/></label>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <button type="submit" disabled={busy} className={buttonClass}>{busy?(ar?'جارٍ الحفظ…':'Saving…'):(ar?'تعيين كلمة المرور':'Reset password')}</button>
        </form>}
    </section>
  </main>;
}
