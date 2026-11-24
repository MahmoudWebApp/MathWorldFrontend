'use client';

import { useState, type FormEvent } from 'react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { BellRing, Send } from 'lucide-react';
import { MathWorldLoading } from '@/components/ui/MathWorldLoading';
import { useGetAdminEmailStatusQuery, useSendAdminEmailMutation, useSendAdminNotificationMutation } from '@/store/api/notificationsApi';

export default function AdminNotificationsPage() {
  const ar = useLocale() === 'ar';
  const [learnerId, setLearnerId] = useState('');
  const [channel, setChannel] = useState<'inapp' | 'email'>('inapp');
  const [titleAr, setTitleAr] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [bodyAr, setBodyAr] = useState('');
  const [bodyEn, setBodyEn] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [send, { isLoading }] = useSendAdminNotificationMutation();
  const [sendEmail, { isLoading: sendingEmail }] = useSendAdminEmailMutation();
  const { data: emailStatus, isLoading: checkingEmail, isError: emailError, refetch: retryEmail } = useGetAdminEmailStatusQuery();
  const emailReady = emailStatus?.IsConfigured === true;
  const sending = isLoading || sendingEmail;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult('');
    setError('');
    const id = Number(learnerId.trim());
    if (!/^[0-9]+$/.test(learnerId.trim()) || !Number.isSafeInteger(id) || id <= 0 || id > 2147483647 ||
      !titleAr.trim() || !titleEn.trim() || !bodyAr.trim() || !bodyEn.trim()) {
      setError(ar ? 'أدخل رقم طالب صحيح وكل النصوص بالعربية والإنجليزية.'
        : 'Enter a valid learner ID and both languages.');
      return;
    }
    if (channel === 'email' && !emailReady) {
      setError(ar ? 'البريد الاختياري غير مهيّأ. تحقق من إعدادات Brevo وطابور الإرسال.'
        : 'Optional email is not configured. Check Brevo and the delivery queue.');
      return;
    }
    const confirmed = window.confirm(ar
      ? `تأكيد إرسال ${channel === 'email' ? 'بريد إلكتروني' : 'إشعار داخل التطبيق'} إلى الطالب رقم ${id} فقط؟ لا يمكن سحب الرسالة بعد الإرسال.\n\n${titleAr.trim()}`
      : `Send a ${channel === 'email' ? 'single-student email' : 'single-student in-app notification'} to learner #${id}? This action cannot be undone.\n\n${titleEn.trim()}`);
    if (!confirmed) return;
    try {
      const payload = {
        learnerId: id,
        TitleAr: titleAr.trim(),
        TitleEn: titleEn.trim(),
        BodyAr: bodyAr.trim(),
        BodyEn: bodyEn.trim(),
        TargetPath: '/dashboard',
      };
      if (channel === 'email') {
        const delivery = await sendEmail(payload).unwrap();
        if (delivery.Queued === true) {
          setResult(ar ? `تم إنشاء إشعار للطالب رقم ${id} وإضافة رسالة البريد إلى الطابور. وصولها غير مؤكد بعد.`
            : `Notice created for learner #${id}; email queued. Inbox delivery is not confirmed.`);
        } else if (delivery.EmailSent === true) {
          setResult(ar ? 'قبلت خدمة البريد الطلب؛ الوصول إلى صندوق الوارد غير مؤكد.' : 'The email service accepted the request; inbox delivery is not confirmed.');
        } else throw new Error('EmailNotQueued');
      } else {
        const notice = await send(payload).unwrap();
        setResult(ar ? `تم إنشاء الإشعار رقم ${notice.Id} للطالب ${id}.`
          : `In-app notice #${notice.Id} created for learner #${id}.`);
      }
    } catch (e) {
      if ((e as {data?:{message?:string}})?.data?.message === 'LearnerEmailConsentRequired') {
        setError(ar?'لا يمكن إرسال البريد: يجب أن يكون بريد الطالب مؤكداً وموافقاً على رسائل الإشعارات المهمة.':'Email unavailable: the learner must verify their address and opt into important notices.');
        return;
      }
      setError(ar ? 'فشل الإرسال. تحقق من صلاحياتك ورقم الطالب وإعدادات الخدمة المختارة.'
        : 'Sending failed. Check permissions, learner ID and the selected channel configuration.');
    }
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <Link href="/admin" className="text-sm font-semibold text-primary hover:underline">
        {ar ? 'العودة للأدمن' : 'Back to admin'}
      </Link>
      <div className="space-y-2">
        <h1 className="flex items-center gap-2 text-3xl font-bold">
          <BellRing className="h-7 w-7 text-primary" />
          {ar ? 'إرسال إشعار لطالب' : 'Send a learner notification'}
        </h1>
        <p className="text-muted-foreground">
          {ar ? 'إشعار إلى طالب واحد بالعربية والإنجليزية. البريد يرسل تنبيهاً عاماً لقراءة الإشعار من الحساب، بحسب موافقة الطالب.'
            : 'Create a bilingual notice for one learner. Optional email alerts link to their private inbox and require consent.'}
        </p>
        {checkingEmail ? (
          <MathWorldLoading compact />
        ) : emailError || !emailStatus ? (
          <div role="alert" className="space-y-2 rounded-xl border border-destructive/25 bg-card p-3 text-sm">
            <p>{ar ? 'تعذّر جلب حالة خدمة البريد. لا يمكن افتراض أن البريد غير مهيأ.'
              : 'Email service status could not be verified. No configuration status is assumed.'}</p>
            <button type="button" onClick={() => void retryEmail()}
              className="font-bold text-primary underline">{ar ? 'إعادة المحاولة' : 'Retry'}</button>
          </div>
        ) : (
          <p className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm">
            {ar
              ? (emailReady ? 'طابور البريد مهيأ. الإرسال يخضع لتأكيد البريد وموافقة الطالب. SMS والبريد الجماعي غير مفعّلين.'
                : 'البريد الاختياري يحتاج إعداد Brevo وتفعيل الطابور. الإشعارات داخل التطبيق متاحة؛ SMS والبريد الجماعي غير مفعّلين.')
              : (emailReady ? 'Email queue configured; verified address and learner consent required. SMS and bulk email remain disabled.'
                : 'Configure Brevo and the optional email queue first. In-app notices work; SMS and bulk email remain disabled.')}
          </p>
        )}
      </div>
      <form onSubmit={(event) => void onSubmit(event)}
        className="space-y-5 rounded-2xl border bg-card p-5 sm:p-6">
        <fieldset className="space-y-2">
          <legend className="font-semibold">{ar ? 'طريقة الإرسال' : 'Delivery channel'}</legend>
          <div className="flex flex-wrap gap-4">
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="radio" checked={channel === 'inapp'}
                onChange={() => setChannel('inapp')} />
              {ar ? 'إشعار داخل التطبيق' : 'In-app notice'}
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="radio" checked={channel === 'email'}
                disabled={!emailReady || checkingEmail}
                onChange={() => setChannel('email')} />
              {ar ? 'إشعار مع بريد إلكتروني' : 'Notice with email'}
              {!emailReady && <span className="text-xs text-muted-foreground">
                {checkingEmail ? (ar ? 'جارٍ الفحص' : 'Checking') : emailError || !emailStatus
                    ? (ar ? 'تعذّر التحقق' : 'Unavailable') : (ar ? 'غير مهيّأ' : 'Not configured')}
              </span>}
            </label>
          </div>
        </fieldset>
        <label className="block space-y-2">
          <span className="font-semibold">{ar ? 'رقم الطالب' : 'Learner ID'}</span>
          <input type="text" inputMode="numeric" pattern="[0-9]+" autoComplete="off" required value={learnerId}
            onChange={(e) => setLearnerId(e.target.value)}
            className="w-full rounded-xl border bg-background p-3 outline-none focus:ring-2 focus:ring-primary"
            placeholder={ar ? 'رقم المستخدم في لوحة الأدمن' : 'User ID from admin dashboard'} />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-2">
            <span className="font-semibold">عنوان الإشعار (عربي)</span>
            <input dir="rtl" required maxLength={160} value={titleAr}
              onChange={e => setTitleAr(e.target.value)}
              className="w-full rounded-xl border bg-background p-3 outline-none focus:ring-2 focus:ring-primary" />
          </label>
          <label className="block space-y-2">
            <span className="font-semibold">Notification title (English)</span>
            <input dir="ltr" required maxLength={160} value={titleEn}
              onChange={e => setTitleEn(e.target.value)}
              className="w-full rounded-xl border bg-background p-3 outline-none focus:ring-2 focus:ring-primary" />
          </label>
          <label className="block space-y-2">
            <span className="font-semibold">نص الإشعار (عربي)</span>
            <textarea dir="rtl" required rows={4} maxLength={1000} value={bodyAr}
              onChange={e => setBodyAr(e.target.value)}
              className="w-full resize-y rounded-xl border bg-background p-3 outline-none focus:ring-2 focus:ring-primary" />
          </label>
          <label className="block space-y-2">
            <span className="font-semibold">Notification body (English)</span>
            <textarea dir="ltr" required rows={4} maxLength={1000} value={bodyEn}
              onChange={e => setBodyEn(e.target.value)}
              className="w-full resize-y rounded-xl border bg-background p-3 outline-none focus:ring-2 focus:ring-primary" />
          </label>
        </div>
        {learnerId.trim() && (titleAr.trim() || titleEn.trim()) && (
          <div className="space-y-2 rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm">
            <p className="font-semibold">{ar ? 'معاينة المستلم والعنوان قبل الإرسال' : 'Preview recipient and title before sending'}</p>
            <p dir="ltr">Learner ID: {learnerId}</p>
            {titleAr.trim() && <p dir="rtl">{titleAr.trim()}</p>}
            {titleEn.trim() && <p dir="ltr">{titleEn.trim()}</p>}
          </div>
        )}
        {error && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
        {result && <p role="status" className="rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-300">{result}</p>}
        <button disabled={sending || (channel === 'email' && !emailReady)} type="submit"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground disabled:opacity-50">
          <Send className="h-4 w-4" />
          {sending ? (ar ? 'جارٍ الإرسال' : 'Sending')
            : channel === 'email' ? (ar ? 'مراجعة وإرسال البريد' : 'Review and send email')
              : (ar ? 'مراجعة وإرسال الإشعار' : 'Review and send notification')}
        </button>
      </form>
    </main>
  );
}
