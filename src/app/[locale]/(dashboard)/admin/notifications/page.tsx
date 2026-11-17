'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { BellRing, Send, ShieldCheck } from 'lucide-react';

import { Link } from '@/i18n/routing';
import { useGetStagesQuery } from '@/store/api/stagesApi';
import { useSendAnnouncementMutation } from '@/store/api/notificationsApi';
import { getApiErrorMessage } from '@/lib/authSession';

export default function AdminNotificationsPage() {
  const locale = useLocale();
  const ar = locale === 'ar';
  const { data: stages, isLoading: loadingStages, isError: stageError, refetch } =
    useGetStagesQuery(locale);
  const [titleAr, setTitleAr] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [bodyAr, setBodyAr] = useState('');
  const [bodyEn, setBodyEn] = useState('');
  const [stageId, setStageId] = useState('');
  const [actionPath, setActionPath] = useState('');
  const [sentCount, setSentCount] = useState<number | null>(null);
  const [errorText, setErrorText] = useState('');
  const [send, { isLoading: sending }] = useSendAnnouncementMutation();

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorText('');
    setSentCount(null);

    const path = actionPath.trim();
    if (path && (!path.startsWith('/') || path.startsWith('//') ||
      path.includes('\\') || path.includes('\n') || path.includes('\r'))) {
      setErrorText(ar
        ? 'رابط التفاصيل لازم يكون مساراً داخلياً يبدأ بـ /'
        : 'The action must be an internal route starting with /');
      return;
    }
    if (stageId && !stages?.some(stage => stage.Id === Number(stageId))) {
      setErrorText(ar ? 'اختر مرحلة صحيحة.' : 'Choose a valid stage.');
      return;
    }

    if (!window.confirm(ar
      ? stageId ? 'إرسال الإشعار لكل طلاب المرحلة المختارة؟'
        : 'إرسال الإشعار لجميع الطلاب النشطين؟'
      : stageId ? 'Notify all active learners in this stage?'
        : 'Notify all active learners?')) return;

    try {
      const result = await send({
        TitleAr: titleAr.trim(),
        TitleEn: titleEn.trim(),
        BodyAr: bodyAr.trim(),
        BodyEn: bodyEn.trim(),
        StageId: stageId ? Number(stageId) : null,
        ActionPath: path || null,
      }).unwrap();
      setSentCount(result.Sent);
      setTitleAr('');
      setTitleEn('');
      setBodyAr('');
      setBodyEn('');
      setActionPath('');
    } catch (error) {
      setErrorText(getApiErrorMessage(error,
        ar ? 'تعذر إرسال الإشعار.' : 'Could not send the announcement.'));
    }
  };

  return (
    <main className="container mx-auto max-w-3xl space-y-6 px-4 py-8 md:px-8">
      <Link href="/admin" className="text-sm font-semibold text-primary hover:underline">
        {ar ? 'العودة إلى الإدارة' : 'Back to administration'}
      </Link>
      <header>
        <h1 className="flex items-center gap-3 text-2xl font-bold">
          <BellRing className="h-7 w-7 text-primary" aria-hidden="true" />
          {ar ? 'إرسال إشعارات للطلاب' : 'Send learner announcements'}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {ar
            ? 'إشعارات داخل تطبيق MathWorld والموقع. اختر مرحلة واحدة أو كل الطلاب، ثم راجع الرسالة قبل الإرسال.'
            : 'Send in-app notices to MathWorld learners. Target a stage or all active learners and review the message before sending.'}
        </p>
      </header>

      <form onSubmit={submit} className="math-card space-y-5 rounded-2xl border border-border p-5 md:p-7">
        <label className="block space-y-2">
          <span className="text-sm font-bold">{ar ? 'الجهة المستهدفة' : 'Audience'}</span>
          <select value={stageId} onChange={e => setStageId(e.target.value)}
            disabled={loadingStages || stageError || sending}
            className="w-full rounded-xl border border-border bg-card px-4 py-3">
            <option value="">{ar ? 'جميع الطلاب النشطين' : 'All active learners'}</option>
            {(stages ?? []).map(stage => (
              <option value={stage.Id} key={stage.Id}>
                {ar ? stage.NameAr : stage.NameEn}
              </option>
            ))}
          </select>
          {stageError && (
            <button type="button" onClick={() => void refetch()}
              className="text-sm font-semibold text-destructive underline">
              {ar ? 'تعذر تحميل المراحل. إعادة المحاولة' : 'Could not load stages. Retry'}
            </button>
          )}
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            { key: 'TitleAr', label: 'العنوان بالعربية', value: titleAr, onChange: setTitleAr, dir: 'rtl' as const },
            { key: 'TitleEn', label: 'English title', value: titleEn, onChange: setTitleEn, dir: 'ltr' as const },
          ].map(item => (
            <label key={item.key} className="block space-y-2">
              <span className="text-sm font-semibold">{item.label}</span>
              <input required minLength={1} maxLength={140} dir={item.dir}
                value={item.value} onChange={e => item.onChange(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-4 py-3"
                disabled={sending} />
            </label>
          ))}
          {[
            { key: 'BodyAr', label: 'نص الإشعار بالعربية', value: bodyAr, onChange: setBodyAr, dir: 'rtl' as const },
            { key: 'BodyEn', label: 'English notification', value: bodyEn, onChange: setBodyEn, dir: 'ltr' as const },
          ].map(item => (
            <label key={item.key} className="block space-y-2">
              <span className="text-sm font-semibold">{item.label}</span>
              <textarea required minLength={1} maxLength={1000} dir={item.dir} rows={5}
                value={item.value} onChange={e => item.onChange(e.target.value)}
                className="w-full resize-y rounded-xl border border-border bg-card px-4 py-3"
                disabled={sending} />
            </label>
          ))}
        </div>
        <label className="block space-y-2">
          <span className="text-sm font-semibold">
            {ar ? 'رابط داخلي اختياري (مثلاً /stages/1)' : 'Optional internal action (e.g. /stages/1)'}
          </span>
          <input value={actionPath} onChange={e => setActionPath(e.target.value)}
            dir="ltr" maxLength={200} disabled={sending}
            placeholder="/stages/1"
            className="w-full rounded-xl border border-border bg-card px-4 py-3" />
          <p className="text-xs text-muted-foreground">
            {ar ? 'لا تضف روابط مواقع خارجية. الإشعار سيبقى داخل MathWorld.'
              : 'External links are blocked. Notification actions stay inside MathWorld.'}
          </p>
        </label>
        {errorText && <p role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{errorText}</p>}
        {sentCount !== null && <p role="status" className="rounded-xl bg-primary/10 p-3 text-sm font-semibold text-primary">
          {ar ? `تم إرسال الإشعار إلى ${sentCount} طالب.`
            : `Announcement delivered to ${sentCount} learners.`}
        </p>}
        <button type="submit" disabled={sending || loadingStages || stageError}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground disabled:opacity-50">
          <Send className="h-5 w-5" aria-hidden="true" />
          {sending ? ar ? 'جارٍ الإرسال...' : 'Sending...'
            : ar ? 'مراجعة وتأكيد الإرسال' : 'Review and send'}
        </button>
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          {ar ? 'هذه الصفحة للمدير فقط. إرسال الإشعار لا يغيّر بيانات الطالب.'
            : 'Admin-only. Sending a notification does not change learner progress.'}
        </p>
      </form>
    </main>
  );
}
