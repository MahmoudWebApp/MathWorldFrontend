'use client';
import {WorkspacePageHeader} from '@/components/ui/WorkspacePageHeader';

import { useState, type FormEvent } from 'react';
import { useLocale } from 'next-intl';
import { BellRing, Send, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { useGetAdminEmailStatusQuery, useSendAdminEmailMutation, useSendAdminNotificationMutation,useSendAdminBroadcastMutation } from '@/store/api/notificationsApi';

export default function AdminNotificationsPage() {
  const ar = useLocale() === 'ar';
  const notify=useToast();
  const [confirmOpen,setConfirmOpen]=useState(false);
  const [audience,setAudience]=useState<'one'|'all'>('one');
  const [broadcast,{isLoading:broadcasting}]=useSendAdminBroadcastMutation();
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
  const { data: emailStatus, isLoading: checkingEmail, isError: emailError, } = useGetAdminEmailStatusQuery();
  const emailReady = emailStatus?.IsConfigured === true;
  const sending = isLoading || sendingEmail || broadcasting;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult('');
    setError('');
    const id = Number(learnerId.trim());
    if ((audience==='one'&&(!/^[0-9]+$/.test(learnerId.trim()) || !Number.isSafeInteger(id) || id <= 0 || id > 2147483647)) ||
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
    setConfirmOpen(true);
  }

  async function confirmSend(){
    if(sending||!confirmOpen)return;
    setConfirmOpen(false);
    const id=Number(learnerId.trim());
    try {
      const payload = {
        learnerId: id,
        TitleAr: titleAr.trim(),
        TitleEn: titleEn.trim(),
        BodyAr: bodyAr.trim(),
        BodyEn: bodyEn.trim(),
        TargetPath: '/dashboard',
      };
      if(audience==='all'){
        const result=await broadcast({TitleAr:payload.TitleAr,TitleEn:payload.TitleEn,BodyAr:payload.BodyAr,BodyEn:payload.BodyEn,TargetPath:payload.TargetPath}).unwrap();
        const message=ar?'تم إرسال الإشعار إلى '+result.Sent+' طالب.':'Notice sent to '+result.Sent+' students.';
        setResult(message);notify(message);
      } else if (channel === 'email') {
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
      if(audience!=='all')notify(ar?'تم قبول طلب الإرسال. راجع حالة التسليم أدناه.':'Send request accepted. Check delivery status below.');
    } catch (e) {
      notify(ar?'تعذّر إرسال الإشعار.':'Could not send the notice.','error');
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
      
      <div className="space-y-2">
        <WorkspacePageHeader title={ar?'الإشعارات':'Notifications'} icon={BellRing}/>
        
      </div>
      <form onSubmit={(event) => void onSubmit(event)}
        className="space-y-5 rounded-2xl border bg-card p-5 sm:p-6">
        <fieldset className="space-y-2"><legend className="font-semibold">{ar?'نطاق الإرسال':'Recipients'}</legend><div className="flex flex-wrap gap-4"><label className="flex items-center gap-2"><input type="radio" checked={audience==='one'} onChange={()=>setAudience('one')}/>{ar?'طالب محدد':'One student'}</label><label className="flex items-center gap-2"><input type="radio" checked={audience==='all'} onChange={()=>{setAudience('all');setChannel('inapp')}}/>{ar?'جميع الطلاب':'All students'}</label></div></fieldset>
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
                disabled={audience==='all'||!emailReady || checkingEmail}
                onChange={() => setChannel('email')} />
              {ar ? 'إشعار مع بريد إلكتروني' : 'Notice with email'}
              {!emailReady && <span className="text-xs text-muted-foreground">
                {checkingEmail ? (ar ? 'جارٍ الفحص' : 'Checking') : emailError || !emailStatus
                    ? (ar ? 'تعذّر التحقق' : 'Unavailable') : (ar ? 'غير مهيّأ' : 'Not configured')}
              </span>}
            </label>
          </div>
        </fieldset>
        {audience==='one'&&<label className="block space-y-2">
          <span className="font-semibold">{ar ? 'رقم الطالب' : 'Learner ID'}</span>
          <input type="text" inputMode="numeric" pattern="[0-9]+" autoComplete="off" required value={learnerId}
            onChange={(e) => setLearnerId(e.target.value)}
            className="w-full rounded-xl border bg-background p-3 outline-none focus:ring-2 focus:ring-primary"
            placeholder={ar ? 'رقم المستخدم في لوحة الأدمن' : 'User ID from admin dashboard'} />
        </label>}
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-2">
            <span className="font-semibold">عنوان الإشعار (عربي)</span>
            <input dir="rtl" required maxLength={audience==='all'?140:160} value={titleAr}
              onChange={e => setTitleAr(e.target.value)}
              className="w-full rounded-xl border bg-background p-3 outline-none focus:ring-2 focus:ring-primary" />
          </label>
          <label className="block space-y-2">
            <span className="font-semibold">Notification title (English)</span>
            <input dir="ltr" required maxLength={audience==='all'?140:160} value={titleEn}
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
        {audience==='one'&&learnerId.trim() && (titleAr.trim() || titleEn.trim()) && (
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
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader className="pe-8">
            <DialogTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-amber-500"/>{ar?'تأكيد الإرسال':'Confirm sending'}</DialogTitle>
            <DialogDescription>{audience==='all'?(ar?'سيصل الإشعار لجميع الطلاب النشطين في الموقع والتطبيق. لا يمكن سحبه بعد الإرسال.':'This notice goes to all active students on web and mobile. It cannot be recalled.'):(ar?`سيُرسل ${channel==='email'?'البريد والإشعار':'الإشعار'} إلى الطالب رقم ${learnerId} فقط. لا يمكن سحبه بعد الإرسال.`:`Send ${channel==='email'?'email and notice':'notice'} to learner #${learnerId} only. This cannot be recalled.`)}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 rounded-xl border bg-muted/40 p-3"><p dir="rtl" className="break-words font-semibold">{titleAr}</p><p dir="ltr" className="break-words font-semibold">{titleEn}</p></div>
          <DialogFooter><Button variant="outline" onClick={()=>setConfirmOpen(false)}>{ar?'إلغاء':'Cancel'}</Button><Button disabled={sending} onClick={()=>void confirmSend()}><Send className="me-2 h-4 w-4"/>{ar?'تأكيد الإرسال':'Confirm send'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
