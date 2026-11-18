'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { BookCheck, CheckCheck, ClipboardList, ShieldCheck, XCircle } from 'lucide-react';
import { LatexPreview } from '@/components/ui/LatexPreview';
import { RichText } from '@/components/ui/RichText';
import {
  useGetCurriculumDraftsQuery,
  useGetCurriculumDraftQuery,
  useReviewCurriculumDraftMutation,
  usePublishCurriculumDraftMutation,
  type CurriculumDraftStatus,
} from '@/store/api/curriculumApi';

const STATUSES: CurriculumDraftStatus[] = ['Pending', 'Approved', 'Published', 'Rejected'];

export default function CurriculumReviewPage() {
  const ar = useLocale() === 'ar';
  const [status, setStatus] = useState<CurriculumDraftStatus | ''>('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [publishConfirm, setPublishConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const { currentData: list, isLoading, isFetching: loadingList, isError, refetch: retryList } = useGetCurriculumDraftsQuery({
    page, ...(status ? { status } : {}),
  });
  const { currentData: detail, isFetching: loadingDetail, isError: detailError, refetch: retryDetail } = useGetCurriculumDraftQuery(
    selected ?? 0, { skip: selected == null },
  );
  const [reviewDraft, { isLoading: reviewing }] = useReviewCurriculumDraftMutation();
  const [publishDraft, { isLoading: publishing }] = usePublishCurriculumDraftMutation();

  const choose = (id: number) => {
    setSelected(id);
    setNote('');
    setPublishConfirm('');
    setError('');
    setMessage('');
  };

  const review = async (approve: boolean) => {
    if (selected == null || note.trim().length < 10) {
      setError(ar ? 'أدخل ملاحظة مراجعة لا تقل عن عشرة أحرف.'
        : 'Write a review note of at least ten characters.');
      return;
    }
    setError('');
    setMessage('');
    try {
      await reviewDraft({ id: selected, approve, note: note.trim() }).unwrap();
      setMessage(approve
        ? (ar ? 'تم اعتماد الدفعة، لكنها لم تُنشر بعد.' : 'Batch approved, not published yet.')
        : (ar ? 'تم رفض الدفعة دون نشر.' : 'Batch rejected without publishing.'));
    } catch {
      setError(ar ? 'فشلت المراجعة. قد تكون الدفعة تغيرت أو أصبحت بياناتها غير صالحة.'
        : 'Review failed; the batch or its validity may have changed.');
    }
  };

  const publish = async () => {
    if (selected == null || publishConfirm !== 'PUBLISH') return;
    setMessage('');
    setError('');
    try {
      const result = await publishDraft(selected).unwrap();
      setMessage(ar
        ? `تم نشر ${result.PublishedCount} مسألة بعد الاعتماد.`
        : `Published ${result.PublishedCount} reviewed questions.`);
      setPublishConfirm('');
    } catch {
      setError(ar ? 'لم يتم النشر. قد تكون المسائل مكررة أو تغيرت الفئات. راجع البيانات.'
        : 'Publish failed. Questions may be duplicated or categories changed.');
    }
  };

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <h1 className="flex items-center gap-2 text-3xl font-bold">
            <ClipboardList className="h-7 w-7 text-primary" aria-hidden="true" />
            {ar ? 'مراجعة دفعات المسائل' : 'Curriculum editorial queue'}
          </h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            {ar ? 'المسائل لا تصبح متاحة للطلاب إلا بعد مراجعة موثقة واعتماد ثم نشر بتأكيد مستقل.'
              : 'Questions become visible only after a recorded review, approval and separately confirmed publication.'}
          </p>
        </div>
        <Link href="/admin/problems/import" className="rounded-xl bg-primary px-4 py-2 font-semibold text-primary-foreground">
          {ar ? 'رفع ملف جديد' : 'New CSV draft'}
        </Link>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(280px,1fr)_minmax(0,1.6fr)]">
        <section className="space-y-3 rounded-2xl border bg-card p-4">
          <h2 className="font-bold">{ar ? 'الدفعات المسجلة' : 'Submitted batches'}</h2>
          <label className="block text-sm">
            <span className="sr-only">{ar ? 'حالة الدفعة' : 'Batch status'}</span>
            <select value={status} onChange={e => {setStatus(e.target.value as CurriculumDraftStatus | '');setPage(1);setSelected(null);setError('');setMessage('');}}
              className="w-full rounded-lg border bg-background p-2.5">
              <option value="">{ar ? 'كل الحالات' : 'All statuses'}</option>
              {STATUSES.map(s => <option value={s} key={s}>{s}</option>)}
            </select>
          </label>
          {(isLoading || loadingList) && <p role="status" className="text-sm text-muted-foreground">{ar ? 'جارٍ التحميل…' : 'Loading…'}</p>}
          {isError && <div role="alert" className="space-y-2 rounded-xl border border-destructive/30 p-3 text-sm text-destructive">
            <p>{ar ? 'تعذّر تحميل الدفعات' : 'Failed to load batches'}</p>
            <button type="button" onClick={() => void retryList()} className="rounded-lg border border-current px-3 py-1.5 font-semibold">
              {ar ? 'إعادة المحاولة' : 'Retry'}
            </button>
          </div>}
          {!isLoading && !isError && !list?.Batches.length && (
            <p className="rounded-xl bg-muted/40 p-5 text-center text-sm text-muted-foreground">
              {ar ? 'ما في دفعات مسجلة بهالحالة.' : 'No batches in this status.'}
            </p>
          )}
          <div className="max-h-[32rem] space-y-2 overflow-y-auto" aria-busy={loadingList}>
            {!isError && list?.Batches.map(batch => (
              <button type="button" key={batch.Id} onClick={() => choose(batch.Id)}
                aria-pressed={selected === batch.Id}
                className={`w-full rounded-xl border p-3 text-start transition-colors hover:bg-primary/5 ${selected === batch.Id ? 'border-primary bg-primary/5' : 'border-border'}`}>
                <span className="flex items-center justify-between gap-2">
                  <strong>#{batch.Id}</strong>
                  <span className="text-xs font-semibold text-primary">{batch.Status}</span>
                </span>
                <span className="mt-1 block text-sm">
                  {ar ? 'عدد المسائل:' : 'Questions:'} {batch.ProblemCount}
                </span>
                <time className="text-xs text-muted-foreground" dateTime={batch.SubmittedAtUtc}>
                  {new Intl.DateTimeFormat(ar ? 'ar' : 'en', {dateStyle:'medium'}).format(new Date(batch.SubmittedAtUtc))}
                </time>
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between border-t pt-3 text-sm">
            <button type="button" disabled={loadingList || page <= 1} className="font-semibold text-primary disabled:opacity-40" onClick={() => setPage(p => p - 1)}>
              {ar ? 'السابق' : 'Previous'}
            </button>
            <span>{page} / {Math.max(1,Math.ceil((list?.Total ?? 0)/20))}</span>
            <button type="button" disabled={loadingList || !list || page * 20 >= list.Total} className="font-semibold text-primary disabled:opacity-40" onClick={() => setPage(p => p + 1)}>
              {ar ? 'التالي' : 'Next'}
            </button>
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border bg-card p-4 sm:p-5">
          {selected == null ? (
            <div className="py-20 text-center text-sm text-muted-foreground">
              {ar ? 'اختر دفعة من القائمة لعرض محتواها ومراجعتها.' : 'Select a batch to inspect its questions.'}
            </div>
          ) : loadingDetail && !detail ? (
            <div className="py-20 text-center text-muted-foreground">{ar ? 'جارٍ التحميل…' : 'Loading…'}</div>
          ) : detail ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-bold">
                  {ar ? 'الدفعة' : 'Batch'} #{detail.Id}
                </h2>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">{detail.Status}</span>
              </div>
              <div className="grid grid-cols-1 gap-3 rounded-xl bg-muted/40 p-4 text-sm sm:grid-cols-2">
                <p>{ar ? 'مسائل:' : 'Questions:'} <strong>{detail.ProblemCount}</strong></p>
                <p>{ar ? 'المنشور:' : 'Published:'} <strong>{detail.PublishedCount}</strong></p>
                <p>{ar ? 'المُرسل:' : 'Submitted by:'} #{detail.SubmittedByAdminId}</p>
                <p>{ar ? 'المراجع:' : 'Reviewed by:'} {detail.ReviewedByAdminId == null ? '—' : `#${detail.ReviewedByAdminId}`}</p>
              </div>
              {detail.ReviewNote && (
                <div className="rounded-xl border border-primary/20 p-3 text-sm">
                  <strong>{ar ? 'ملاحظة المراجعة:' : 'Review note:'}</strong>
                  <p className="mt-1 whitespace-pre-wrap">{detail.ReviewNote}</p>
                </div>
              )}
              <div className="max-h-[32rem] space-y-3 overflow-y-auto" aria-label={ar ? 'المسائل داخل الدفعة' : 'Batch questions'}>
                {detail.Problems.map((q, i) => (
                  <details key={`${q.ContentKey}-${i}`} className="rounded-xl border p-3">
                    <summary className="cursor-pointer text-sm font-semibold">
                      <span dir="ltr" className="me-2 text-primary">{q.ContentKey}</span>
                      {ar ? q.QuestionTextAr : q.QuestionTextEn}
                    </summary>
                    <div className="mt-3 space-y-3 text-sm">
                      <div dir="rtl"><strong>AR:</strong><RichText text={q.QuestionTextAr} isArabic className="mt-1 break-words" /></div>
                      <div dir="ltr"><strong>EN:</strong><RichText text={q.QuestionTextEn} className="mt-1 break-words" /></div>
                      <p><strong>StageId:</strong> {q.StageId} · <strong>CategoryId:</strong> {q.CategoryId}</p>
                      <ol className="space-y-1 ps-4">
                        {q.Options.map(o => <li key={o.Order} className={o.IsCorrect ? 'rounded-lg border border-emerald-500/40 bg-emerald-500/5 p-2 font-semibold' : 'rounded-lg border p-2'} dir="ltr">
                          <span className="me-2 text-xs text-muted-foreground">{o.Order}.</span>
                          <LatexPreview latex={o.LatexCode} /> {o.IsCorrect ? <span aria-label={ar ? 'الإجابة الصحيحة' : 'Correct answer'}>✓</span> : null}
                        </li>)}
                      </ol>
                      <div dir="rtl"><strong>الحل:</strong><RichText text={q.DetailedSolutionAr} isArabic className="mt-1 break-words" /></div>
                      <div dir="ltr"><strong>Solution:</strong><RichText text={q.DetailedSolutionEn} className="mt-1 break-words" /></div>
                    </div>
                  </details>
                ))}
              </div>
              {error && <p role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
              {message && <p role="status" className="rounded-xl bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-300">{message}</p>}

              {detail.Status === 'Pending' && (
                <div className="space-y-3 rounded-xl border p-4">
                  <h3 className="font-semibold">{ar ? 'قرار المراجعة' : 'Editorial decision'}</h3>
                  <textarea aria-label={ar ? 'ملاحظة المراجعة' : 'Editorial review note'} value={note} onChange={e=>setNote(e.target.value)} maxLength={1000} rows={3}
                    placeholder={ar ? 'ملاحظة مراجعة مفصّلة (10 أحرف على الأقل)' : 'Detailed review note (minimum 10 characters)'}
                    className="w-full rounded-lg border bg-background p-3 outline-none focus:ring-2 focus:ring-primary" />
                  <div className="flex flex-wrap gap-3">
                    <button type="button" disabled={reviewing || note.trim().length < 10}
                      onClick={() => void review(true)}
                      className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 font-semibold text-white disabled:opacity-40">
                      <CheckCheck className="h-4 w-4" />{ar ? 'اعتماد للمراجعة النهائية' : 'Approve draft'}
                    </button>
                    <button type="button" disabled={reviewing || note.trim().length < 10}
                      onClick={() => void review(false)}
                      className="inline-flex items-center gap-2 rounded-lg border border-destructive px-4 py-2 font-semibold text-destructive disabled:opacity-40">
                      <XCircle className="h-4 w-4" />{ar ? 'رفض الدفعة' : 'Reject batch'}
                    </button>
                  </div>
                </div>
              )}
              {detail.Status === 'Approved' && (
                <div className="space-y-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
                  <h3 className="flex items-center gap-2 font-bold">
                    <ShieldCheck className="h-5 w-5" />{ar ? 'النشر النهائي' : 'Final publication'}
                  </h3>
                  <p className="text-sm">
                    {ar ? 'النشر سيجعل جميع مسائل هذه الدفعة متاحة ضمن فئاتها. تأكد من صحة المحتوى ومن موافقتك قبل المتابعة.'
                      : 'Publishing will add every question to its category. Verify correctness and your approval before proceeding.'}
                  </p>
                  <label className="block space-y-1 text-sm font-semibold">
                    <span>{ar ? 'اكتب PUBLISH لتأكيد النشر' : 'Type PUBLISH to confirm'}</span>
                    <input dir="ltr" autoComplete="off" value={publishConfirm} onChange={e=>setPublishConfirm(e.target.value)}
                      className="w-full rounded-lg border bg-background p-2.5" placeholder="PUBLISH" />
                  </label>
                  <button type="button" disabled={publishing || publishConfirm !== 'PUBLISH'}
                    onClick={() => void publish()}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground disabled:opacity-40">
                    <BookCheck className="h-4 w-4" />{ar ? 'نشر المسائل المعتمدة' : 'Publish approved questions'}
                  </button>
                </div>
              )}
              {detail.Status === 'Published' && (
                <p className="rounded-xl bg-emerald-500/10 p-3 text-sm font-semibold">
                  {ar ? 'تم النشر مسبقاً. لا يمكن نشر الدفعة مرة ثانية.' : 'Published already. This batch cannot be republished.'}
                </p>
              )}
            </>
          ) : (
            <div role="alert" className="space-y-3 py-12 text-center text-destructive">
              <p>{detailError ? (ar ? 'تعذر تحميل تفاصيل الدفعة.' : 'Failed to load batch details.') : (ar ? 'لم تُعثر على الدفعة' : 'Batch not found')}</p>
              <button type="button" onClick={() => void retryDetail()} className="rounded-lg border border-current px-4 py-2 text-sm font-semibold">
                {ar ? 'إعادة المحاولة' : 'Retry'}
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
