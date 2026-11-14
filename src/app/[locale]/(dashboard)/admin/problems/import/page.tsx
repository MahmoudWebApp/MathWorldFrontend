'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { FileSpreadsheet, FileDown, ShieldCheck, AlertTriangle } from 'lucide-react';
import {
  usePreviewCurriculumImportMutation,
  useSubmitCurriculumDraftMutation,
  type CurriculumImportPreview,
  type ProposedCurriculumProblem,
} from '@/store/api/curriculumApi';
import { useGetAdminStagesQuery } from '@/store/api/stagesApi';
import { useGetAdminCategoriesQuery } from '@/store/api/categoriesApi';
import { curriculumImportError } from '@/lib/curriculum-import-errors';

const COLUMNS = [
  'ContentKey', 'StageId', 'CategoryId', 'QuestionTextAr', 'QuestionTextEn',
  'DetailedSolutionAr', 'DetailedSolutionEn', 'Points',
  'Option1', 'Option2', 'Option3', 'Option4', 'CorrectOption',
] as const;

function parseCsv(source: string): string[][] {
  const text = source.replace(/^\uFEFF/, '');
  const result: string[][] = [];
  let cell = '';
  let row: string[] = [];
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (quoted && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (quoted || cell.length === 0) {
        quoted = !quoted;
      } else {
        throw Error('Invalid CSV quote');
      }
    } else if (c === ',' && !quoted) {
      row.push(cell);
      cell = '';
    } else if ((c === '\n' || c === '\r') && !quoted) {
      row.push(cell);
      if (row.some(value => value.trim())) result.push(row);
      row = [];
      cell = '';
      if (c === '\r' && text[i + 1] === '\n') i++;
    } else {
      cell += c;
    }
  }
  if (quoted) throw Error('Unclosed quoted field');
  row.push(cell);
  if (row.some(value => value.trim())) result.push(row);
  return result;
}

function convertFile(contents: string): ProposedCurriculumProblem[] {
  const rows = parseCsv(contents);
  if (!rows.length || rows[0].length !== COLUMNS.length ||
      COLUMNS.some((name, i) => rows[0][i].trim() !== name)) {
    throw Error('Invalid CSV header. Download and use the provided template.');
  }
  if (rows.length < 2 || rows.length > 101) {
    throw Error('Use between 1 and 100 question rows per preview.');
  }
  return rows.slice(1).map((r, index) => {
    if (r.length !== COLUMNS.length) throw Error(`Invalid column count at row ${index + 2}.`);
    const [ContentKey, StageId, CategoryId, QuestionTextAr, QuestionTextEn,
      DetailedSolutionAr, DetailedSolutionEn, Points, ...options] = r.map(x => x.trim());
    const stage = Number(StageId), category = Number(CategoryId), points = Number(Points);
    const correct = Number(options[4]);
    if (![stage, category, points, correct].every(Number.isSafeInteger) ||
      stage <= 0 || category <= 0 || points <= 0 || correct < 1 || correct > 4) {
      throw Error(`Invalid stage/category/points/correct option at row ${index + 2}.`);
    }
    return {
      ContentKey, StageId: stage, CategoryId: category,
      QuestionTextAr, QuestionTextEn, DetailedSolutionAr, DetailedSolutionEn,
      Points: points,
      Options: options.slice(0, 4).map((LatexCode, i) => ({
        LatexCode, IsCorrect: i + 1 === correct, Order: i + 1,
      })),
    };
  });
}

export default function CurriculumCsvPreviewPage() {
  const locale = useLocale();
  const ar = locale === 'ar';
  const [name, setName] = useState('');
  const [draft, setDraft] = useState<ProposedCurriculumProblem[]>([]);
  const [parseError, setParseError] = useState('');
  const [preview, setPreview] = useState<CurriculumImportPreview | null>(null);
  const [previewBatch, { isLoading }] = usePreviewCurriculumImportMutation();
  const [submitDraft, { isLoading: isSubmittingDraft }] = useSubmitCurriculumDraftMutation();
  const [savedBatchId, setSavedBatchId] = useState<number | null>(null);
  const { data: stages, isLoading: loadingStages, isError: stagesError, refetch: retryStages } = useGetAdminStagesQuery();
  const { data: categories, isLoading: loadingCategories, isError: categoriesError, refetch: retryCategories } = useGetAdminCategoriesQuery();

  const downloadTemplate = () => {
    const blob = new Blob(['\uFEFF' + COLUMNS.join(',') + '\r\n'], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mathworld-question-template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const chooseFile = async (file?: File) => {
    setName(file?.name ?? '');
    setDraft([]);
    setPreview(null);
    setSavedBatchId(null);
    setParseError('');
    if (!file) return;
    if (file.size > 1024 * 1024) {
      setParseError(ar ? 'الملف أكبر من 1MB' : 'File exceeds 1MB');
      return;
    }
    try {
      setDraft(convertFile(await file.text()));
    } catch (error) {
      setParseError(error instanceof Error ? error.message : 'Invalid CSV');
    }
  };

  const runPreview = async () => {
    setParseError('');
    setPreview(null);
    try {
      setPreview(await previewBatch({ Problems: draft }).unwrap());
    } catch {
      setParseError(ar ? 'تعذّرت المعاينة. تأكد من الدخول كأدمن ومن معرفات المراحل والفئات.'
        : 'Preview failed. Check admin access and stage/category IDs.');
    }
  };

  const saveForReview = async () => {
    setParseError('');
    if (!preview?.CanProceedToEditorialReview || !draft.length) return;
    try {
      const result = await submitDraft({ Problems: draft }).unwrap();
      setSavedBatchId(result.Id);
    } catch {
      setParseError(ar
        ? 'فشل تسجيل الدفعة للمراجعة. تأكد من صلاحية الأدمن وصحة البيانات.'
        : 'Could not submit draft for review. Check admin access and content validity.');
    }
  };

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <Link href="/admin/problems" className="text-sm font-semibold text-primary hover:underline">
        {ar ? 'الرجوع لإدارة المسائل' : 'Back to question management'}
      </Link>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{ar ? 'معاينة استيراد مسائل CSV' : 'Preview CSV question import'}</h1>
        <p className="text-muted-foreground">
          {ar ? 'حضّر مسائل ثنائية اللغة، واكشف الأخطاء والتكرارات قبل إرسالها للمراجعة.'
            : 'Prepare bilingual questions and detect errors or duplicates before editorial review.'}
        </p>
        <p className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm font-medium">
          <ShieldCheck className="me-2 inline h-4 w-4 text-primary" aria-hidden="true" />
          {ar ? 'الفحص الأولي لا يحفظ ولا ينشر. بعد نجاحه يمكنك إرسال دفعة مسودة للمراجعة؛ هذه الخطوة تحفظ المسودة فقط دون إظهار المسائل للطلاب.'
            : 'The initial preview saves and publishes nothing. After it passes, you may submit a draft for editorial review; this saves an unpublished draft only.'}
        </p>
      </div>
      <section className="space-y-4 rounded-2xl border bg-card p-5">
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={downloadTemplate}
            className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-muted">
            <FileDown className="h-4 w-4" />
            {ar ? 'تنزيل قالب CSV' : 'Download CSV template'}
          </button>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary">
            <FileSpreadsheet className="h-4 w-4" />
            {ar ? 'اختيار ملف CSV' : 'Select CSV file'}
            <input className="sr-only" type="file" accept=".csv,text/csv"
              onChange={(event) => void chooseFile(event.target.files?.[0])} />
          </label>
          <span className="text-sm text-muted-foreground">{name || (ar ? 'لم يتم اختيار ملف' : 'No file chosen')}</span>
        </div>
        {parseError && (
          <p role="alert" className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4 shrink-0" />{parseError}
          </p>
        )}
        {draft.length > 0 && (
          <div className="space-y-3">
            <p className="font-semibold">{ar ? 'المسائل المقروءة:' : 'Parsed questions:'} {draft.length}</p>
            <div className="max-h-64 overflow-auto rounded-xl border">
              <table className="w-full min-w-[640px] text-sm" aria-label={ar ? 'ملخص ملف المسائل' : 'Question CSV rows'}>
                <thead className="bg-muted/60">
                  <tr><th className="p-3 text-start">ContentKey</th><th className="p-3 text-start">StageId</th><th className="p-3 text-start">CategoryId</th><th className="p-3 text-start">{ar ? 'السؤال' : 'Question'}</th></tr>
                </thead>
                <tbody>
                  {draft.slice(0, 10).map((item, i) => (
                    <tr key={`${item.ContentKey}-${i}`} className="border-t">
                      <td className="p-3" dir="ltr">{item.ContentKey}</td>
                      <td className="p-3">{item.StageId}</td>
                      <td className="p-3">{item.CategoryId}</td>
                      <td className="p-3">{ar ? item.QuestionTextAr : item.QuestionTextEn}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button type="button" disabled={isLoading} onClick={() => void runPreview()}
              className="rounded-xl bg-primary px-5 py-2.5 font-semibold text-primary-foreground disabled:opacity-50">
              {isLoading ? (ar ? 'جارٍ التحقق…' : 'Validating…') : (ar ? 'معاينة الأخطاء بدون نشر' : 'Validate without publishing')}
            </button>
          </div>
        )}
      </section>
      {preview && (
        <section className="space-y-3 rounded-2xl border bg-card p-5" aria-live="polite">
          <h2 className="text-xl font-bold">{ar ? 'نتيجة المعاينة' : 'Preview results'}</h2>
          <p className="font-medium">
            {ar ? 'الصالح:' : 'Valid:'} {preview.ValidCount} / {preview.Total}
            {' · '}{ar ? 'غير الصالح:' : 'Invalid:'} {preview.InvalidCount}
          </p>
          <div className="max-h-[36rem] space-y-3 overflow-y-auto">
          {preview.Results.map((item, i) => (
            <div key={`${item.ContentKey}-${i}`} className="rounded-xl border p-3">
              <div className="flex items-center justify-between gap-3">
                <strong dir="ltr">{item.ContentKey}</strong>
                <span className={item.Valid ? 'text-emerald-600' : 'text-destructive'}>
                  {item.Valid ? (ar ? 'صالح' : 'Valid') : (ar ? 'أخطاء' : 'Errors')}
                </span>
              </div>
              {item.Errors.length > 0 && <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-destructive">
                {item.Errors.map((code, n) => <li key={`${code}-${n}`}>{curriculumImportError(code, ar)}</li>)}
              </ul>}
            </div>
          ))}
          </div>
          {preview.CanProceedToEditorialReview && savedBatchId == null && (
            <button type="button" disabled={isSubmittingDraft} onClick={() => void saveForReview()}
              className="rounded-xl bg-primary px-5 py-2.5 font-semibold text-primary-foreground disabled:opacity-50">
              {isSubmittingDraft
                ? (ar ? 'جارٍ إرسال الدفعة…' : 'Submitting draft…')
                : (ar ? 'تسجيل الدفعة للمراجعة (بدون نشر)' : 'Submit draft for review (no publish)')}
            </button>
          )}
          {savedBatchId !== null && (
            <div role="status" className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
              <p className="font-semibold">{ar
                ? `تم حفظ الدفعة رقم ${savedBatchId} للمراجعة، بدون نشر أي مسألة.`
                : `Batch #${savedBatchId} saved for review; no questions published.`}</p>
              <Link href="/admin/problems/review" className="mt-2 inline-block font-semibold text-primary hover:underline">
                {ar ? 'فتح قائمة مراجعة الدفعات' : 'Open editorial review queue'}
              </Link>
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            {ar ? 'النشر خطوة منفصلة بعد المراجعة والاعتماد الصريح.'
              : 'Publishing is a separate step after explicit editorial approval.'}
          </p>
        </section>
      )}
      <section className="rounded-2xl border p-5">
        <h2 className="mb-3 font-semibold">{ar ? 'معرفات المراحل والفئات الحالية' : 'Current stage and category IDs'}</h2>
        {(loadingStages || loadingCategories) && <p role="status" className="mb-3 text-sm text-muted-foreground">{ar ? 'جارٍ تحميل المراحل والفئات…' : 'Loading stages and categories…'}</p>}
        {(stagesError || categoriesError) && <div role="alert" className="mb-3 space-y-2 text-sm text-destructive">
          <p>{ar ? 'تعذّر تحميل معرفات المراحل أو الفئات. افحص المعرفات قبل إرسال الدفعة للمراجعة.' : 'Could not load stage/category IDs. Verify identifiers before submitting the batch.'}</p>
          <button type="button" onClick={() => { void retryStages(); void retryCategories(); }} className="rounded-lg border border-current px-3 py-2 font-semibold">{ar ? 'إعادة المحاولة' : 'Retry'}</button>
        </div>}
        <div className="grid gap-3 md:grid-cols-2">
          {stages?.map(stage => (
            <div key={stage.Id} className="rounded-xl bg-muted/40 p-3 text-sm">
              <strong>{ar ? stage.NameAr : stage.NameEn}</strong> <span dir="ltr">(StageId: {stage.Id})</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {categories?.filter(cat => cat.StageId === stage.Id).map(cat => (
                  <span key={cat.Id} className="rounded-lg border bg-background px-2 py-1">
                    {cat.Id} · {ar ? cat.NameAr : cat.NameEn}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
