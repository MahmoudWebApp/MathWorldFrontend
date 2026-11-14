'use client';

import { useState, type FormEvent } from 'react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { BellRing, Send } from 'lucide-react';
import { useSendAdminNotificationMutation } from '@/store/api/notificationsApi';

export default function AdminNotificationsPage() {
  const ar = useLocale() === 'ar';
  const [learnerId, setLearnerId] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [bodyAr, setBodyAr] = useState('');
  const [bodyEn, setBodyEn] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [send, { isLoading }] = useSendAdminNotificationMutation();

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
    const confirmed = window.confirm(ar
      ? `تأكيد إرسال إشعار داخل التطبيق إلى الطالب رقم ${id} فقط؟ لا يمكن سحب الإشعار بعد الإرسال.\n\n${titleAr.trim()}`
      : `Send an in-app notification to learner #${id} only? This action cannot be undone.\n\n${titleEn.trim()}`);
    if (!confirmed) return;
    try {
      const notice = await send({
        learnerId: id,
        TitleAr: titleAr.trim(),
        TitleEn: titleEn.trim(),
        BodyAr: bodyAr.trim(),
        BodyEn: bodyEn.trim(),
        TargetPath: '/dashboard',
      }).unwrap();
      setResult(ar ? `تم إرسال الإشعار رقم ${notice.Id} للطالب ${id}.`
        : `Notice #${notice.Id} sent to learner #${id}.`);
    } catch {
      setError(ar ? 'فشل الإرسال. تحقق من صلاحية الأدمن ورقم الطالب وحالة API.'
        : 'Sending failed. Check admin permissions, learner ID and API availability.');
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
          {ar ? 'رسالة داخل الموقع والتطبيق لطالب محدد، بالعربية والإنجليزية.'
            : 'Send a bilingual in-app notice to one learner.'}
        </p>
        <p className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm">
          {ar ? 'هذه الميزة لا ترسل SMS أو بريد إلكتروني أو إشعارات Push حالياً، ولا تدعم الإرسال الجماعي.'
            : 'This sends in-app messages only. Email, SMS, push and bulk sending are not enabled.'}
        </p>
      </div>
      <form onSubmit={(event) => void onSubmit(event)}
        className="space-y-5 rounded-2xl border bg-card p-5 sm:p-6">
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
        <button disabled={isLoading} type="submit"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground disabled:opacity-50">
          <Send className="h-4 w-4" />
          {isLoading ? (ar ? 'جارٍ الإرسال' : 'Sending') : (ar ? 'مراجعة وإرسال الإشعار' : 'Review and send notification')}
        </button>
      </form>
    </main>
  );
}
