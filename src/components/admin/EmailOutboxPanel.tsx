'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { useGetEmailOutboxQuery, useQueueTestEmailMutation } from '@/store/api/platformBrandApi';

const states: Record<string, [string,string]> = {
  Pending: ['بانتظار الإرسال','Pending'], Processing: ['قيد المعالجة','Processing'],
  Accepted: ['قبله المزوّد','Provider accepted'], Unknown: ['نتيجة غير مؤكدة','Outcome unknown'],
  Failed: ['فشل','Failed'], Expired: ['منتهي','Expired'], Cancelled: ['ملغى','Cancelled'],
};
const templates: Record<string, [string,string]> = {
  'password-reset': ['استعادة كلمة المرور','Password reset'],
  'password-changed': ['تغيير كلمة المرور','Password changed'],
  test: ['اختبار الإرسال','Test email'],
};
export function EmailOutboxPanel() {
  const ar = useLocale() === 'ar';
  const [language, setLanguage] = useState(ar ? 'ar' : 'en');
  const [message, setMessage] = useState('');
  const [testError, setTestError] = useState('');
  const { data, isFetching, isError, refetch } = useGetEmailOutboxQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const [send, {isLoading}] = useQueueTestEmailMutation();
  const label = (values: [string,string] | undefined, fallback: string) => values?.[ar ? 0 : 1] ?? fallback;
  async function test() {
    setMessage(''); setTestError('');
    try {
      const result = await send({Language: language}).unwrap();
      if (result.Queued) setMessage(ar ? 'أضيفت رسالة الاختبار إلى الطابور. راجع حالتها هنا؛ لم يتم تأكيد وصولها بعد.' : 'Test email queued. Check its status here; delivery is not yet confirmed.');
    } catch (e) {
      const status = (e as {status?: number})?.status;
      setTestError(status === 429 ? (ar?'بلغت حد الاختبار، حاول لاحقاً.':'Test limit reached. Try later.')
        : status === 403 ? (ar?'بريد حسابك غير مسموح له بالاختبار.':'Your account email is not on the test allowlist.')
        : (ar?'إرسال الاختبار غير متاح حالياً.':'Test sending is currently unavailable.'));
    }
  }
  return <section className="space-y-4 rounded-2xl border bg-card p-5">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h2 className="text-lg font-bold">{ar?'حالة خدمة البريد':'Email service status'}</h2>
      <button type="button" disabled={isFetching} className="rounded-lg border px-3 py-2 text-sm" onClick={()=>void refetch()}>{ar?'تحديث':'Refresh'}</button>
    </div>
    {isFetching&&!data&&<p role="status">{ar?'جارٍ التحميل…':'Loading…'}</p>}
    {isError&&<p role="alert" className="text-destructive">{ar?'تعذّر جلب حالة الإرسال.':'Could not load email status.'}</p>}
    {data&&!isError&&<>
      <div className="grid gap-2 sm:grid-cols-2 text-sm">
        <p>{ar?'المزوّد':'Provider'}: Brevo — {data.IsConfigured?(ar?'الإعدادات موجودة':'Configured'):(ar?'غير مهيأ':'Not configured')}</p>
        <p>{ar?'الوضع':'Mode'}: {data.IsTestMode?(ar?'اختبار':'Test'):(ar?'فعلي':'Live')}</p>
        <p>{ar?'عامل الإرسال':'Worker'}: {data.IsWorkerEnabled?(ar?'مفعّل':'Enabled'):(ar?'معطّل':'Disabled')}</p>
        <p>{ar?'استعادة الحساب':'Recovery'}: {data.RecoveryEnabled&&data.IsWorkerEnabled?(ar?'مهيأة':'Configured'):(ar?'غير مفعّلة':'Disabled')}</p>
      </div>
      <div className="rounded-xl border p-3 text-sm">
        <p>{ar?'استهلاك محاولات الإرسال ضمن النافذة الاحتياطية':'Reserved-window sending attempts'}: {data.ReservedAttempts} / {data.AttemptLimit}</p>
        <div className="mt-2 h-2 overflow-hidden rounded bg-muted"><div className="h-full rounded bg-primary" style={{width:Math.min(100,100*data.ReservedAttempts/Math.max(1,data.AttemptLimit))+'%'}}/></div>
      </div>
      <div className="flex flex-wrap gap-2">{data.Counts.map(item=><span className="rounded-lg border px-3 py-1.5 text-sm" key={item.State}>{label(states[item.State],item.State)}: {item.Count}</span>)}</div>
      <div className="space-y-2 rounded-xl border p-3">
        <p className="text-sm text-muted-foreground">{ar?'رسالة اختبار إلى بريد حساب الإدارة فقط، بشرط أن يكون ضمن قائمة الاختبار المسموحة.':'Test email to your own admin account only, provided its email is allowlisted.'}</p>
        <div className="flex flex-wrap gap-2">
          <select aria-label={ar?'لغة رسالة الاختبار':'Test email language'} className="rounded-xl border bg-background p-2" value={language} onChange={e=>setLanguage(e.target.value)}><option value="ar">العربية</option><option value="en">English</option></select>
          <button type="button" disabled={isLoading||!data.IsConfigured||!data.IsTestMode||!data.IsWorkerEnabled} onClick={()=>void test()} className="rounded-xl bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50">{isLoading?(ar?'جارٍ الإضافة…':'Queuing…'):(ar?'إرسال رسالة اختبار':'Queue test email')}</button>
        </div>
        {message&&<p role="status" className="text-sm text-primary">{message}</p>}
        {testError&&<p role="alert" className="text-sm text-destructive">{testError}</p>}
      </div>
      <h3 className="font-semibold">{ar?'آخر الرسائل':'Recent messages'}</h3>
      {data.Items.length===0 ? <p className="text-sm text-muted-foreground">{ar?'لا توجد رسائل بعد.':'No messages yet.'}</p> : <div className="overflow-x-auto">
        <table className="w-full text-start text-sm"><thead><tr className="border-b"><th className="p-2 text-start">{ar?'القالب':'Template'}</th><th className="p-2 text-start">{ar?'الحالة':'Status'}</th><th className="p-2 text-start">{ar?'المحاولات':'Attempts'}</th><th className="p-2 text-start">{ar?'الوقت':'Time'}</th></tr></thead>
        <tbody>{data.Items.map(item=><tr key={item.Id} className="border-b"><td className="p-2">{label(templates[item.TemplateKey],item.TemplateKey)}</td><td className="p-2">{label(states[item.State],item.State)}</td><td className="p-2">{item.Attempts}</td><td className="p-2 whitespace-nowrap">{new Date(item.CreatedAtUtc).toLocaleString(ar?'ar':'en')}</td></tr>)}</tbody></table>
      </div>}
      <p className="text-xs text-muted-foreground">{ar?'قبول المزوّد لا يعني وصول الرسالة إلى صندوق البريد. لا تُعرض عناوين المستلمين أو رموز الاستعادة.':'Provider acceptance does not prove inbox delivery. Recipient addresses and reset tokens are never displayed.'}</p>
    </>}
  </section>;
}
