'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { AlertTriangle, ClipboardCheck, FileSpreadsheet, ShieldCheck } from 'lucide-react';
import {
  usePreviewCategoriesImportMutation,
  type CategoryImportPreview,
  type ProposedStageCategory,
} from '@/store/api/curriculumApi';
import { useGetAdminStagesQuery } from '@/store/api/stagesApi';

const HEADERS = [
  'ContentKey', 'StageId', 'Order', 'NameAr', 'NameEn',
  'SuggestedIconKey', 'ReviewStatus', 'NotesAr', 'NotesEn',
] as const;

function parseCsv(source: string): string[][] {
  const text = source.replace(/^\uFEFF/, '');
  const rows: string[][] = [];
  let current = '';
  let row: string[] = [];
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      if (quoted && text[i + 1] === '"') {
        current += '"';
        i++;
      } else if (quoted || current.length === 0) {
        quoted = !quoted;
      } else throw Error('Invalid CSV quoting');
    } else if (char === ',' && !quoted) {
      row.push(current);
      current = '';
    } else if ((char === '\n' || char === '\r') && !quoted) {
      row.push(current);
      if (row.some(x => x.trim())) rows.push(row);
      row = [];
      current = '';
      if (char === '\r' && text[i + 1] === '\n') i++;
    } else {
      current += char;
    }
  }
  if (quoted) throw Error('Unclosed quoted CSV field');
  row.push(current);
  if (row.some(x => x.trim())) rows.push(row);
  return rows;
}

function parseProposal(source: string): ProposedStageCategory[] {
  const rows = parseCsv(source);
  if (!rows.length || rows[0].length !== HEADERS.length ||
      HEADERS.some((name, i) => rows[0][i].trim() !== name)) {
    throw Error('Use the supplied CSV column headers');
  }
  if (rows.length < 2 || rows.length > 51) {
    throw Error('Use between 1 and 50 categories per preview');
  }
  return rows.slice(1).map((values, index) => {
    if (values.length !== HEADERS.length) {
      throw Error(`Row ${index + 2} has ${values.length} columns; expected ${HEADERS.length}`);
    }
    const [ContentKey, stage, order, NameAr, NameEn, SuggestedIconKey,
      ReviewStatus, NotesAr, NotesEn] = values.map(x => x.trim());
    const StageId = Number(stage), Order = Number(order);
    if (!Number.isSafeInteger(StageId) || StageId <= 0 ||
        !Number.isSafeInteger(Order) || Order < 0 || Order > 999) {
      throw Error(`Invalid stage or order at row ${index + 2}`);
    }
    if (ReviewStatus !== 'Proposed') {
      throw Error(`ReviewStatus must be Proposed at row ${index + 2}`);
    }
    return { ContentKey, StageId, Order, NameAr, NameEn,
      SuggestedIconKey, ReviewStatus, NotesAr, NotesEn };
  });
}

export default function AdminProposedCategoryImportPage() {
  const ar = useLocale() === 'ar';
  const [filename, setFilename] = useState('');
  const [drafts, setDrafts] = useState<ProposedStageCategory[]>([]);
  const [preview, setPreview] = useState<CategoryImportPreview | null>(null);
  const [error, setError] = useState('');
  const [runPreview, { isLoading }] = usePreviewCategoriesImportMutation();
  const { data: stages } = useGetAdminStagesQuery();

  const downloadTemplate = () => {
    const csv = '\uFEFF' + HEADERS.join(',') + '\r\n';
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mathworld-category-proposal-template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const selectFile = async (file?: File) => {
    setFilename(file?.name ?? '');
    setDrafts([]);
    setPreview(null);
    setError('');
    if (!file) return;
    if (file.size > 512 * 1024) {
      setError(ar ? 'الملف كبير جداً (الحد 512KB).' : 'CSV file exceeds 512KB.');
      return;
    }
    try {
      setDrafts(parseProposal(await file.text()));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid CSV');
    }
  };

  const check = async () => {
    setPreview(null);
    setError('');
    try {
      setPreview(await runPreview({ Categories: drafts }).unwrap());
    } catch {
      setError(ar
        ? 'تعذرت المعاينة. تحقق من حساب الأدمن ومعرفات المراحل.'
        : 'Preview failed. Check your admin account and stage identifiers.');
    }
  };

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <Link href="/admin/categories" className="text-sm font-semibold text-primary hover:underline">
        {ar ? 'الرجوع لإدارة الفئات' : 'Back to categories'}
      </Link>
      <header className="space-y-3">
        <h1 className="text-3xl font-extrabold">
          {ar ? 'معاينة الفئات التعليمية المقترحة' : 'Preview proposed stage categories'}
        </h1>
        <p className="text-muted-foreground">
          {ar
            ? 'استورد قائمة مقترحات الفئات بالعربي والإنجليزي لفحص التكرار والمرحلة والترتيب قبل مراجعة المحتوى.'
            : 'Check proposed bilingual categories, duplicates, stages and display order before editorial approval.'}
        </p>
        <div className="flex items-start gap-2 rounded-xl border border-primary/25 bg-primary/5 p-4 text-sm">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
          <p>{ar
            ? 'المعاينة آمنة ولا تنشر فئات ولا تعدّل الفئات القديمة أو صلاحيات Free. نشر الفئات الجديدة يتم لاحقاً بشكل منفصل بعد اعتماد المنهج والأيقونات.'
            : 'Dry-run only: no category is created, deleted, moved or published. Editorial approval and icon selection are separate steps.'}</p>
        </div>
      </header>
      <section className="space-y-4 rounded-2xl border bg-card p-5">
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={downloadTemplate}
            className="rounded-xl border px-4 py-2.5 text-sm font-semibold hover:bg-muted">
            {ar ? 'تنزيل قالب الفئات' : 'Download category template'}
          </button>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">
            <FileSpreadsheet className="h-4 w-4" aria-hidden="true" />
            {ar ? 'اختيار CSV' : 'Choose CSV'}
            <input type="file" className="sr-only" accept=".csv,text/csv"
              onChange={event => void selectFile(event.target.files?.[0])} />
          </label>
          <span className="text-sm text-muted-foreground">{filename}</span>
        </div>
        <p className="text-xs text-muted-foreground">
          {ar
            ? 'الحقل SuggestedIconKey مجرد اقتراح بصري، وليس مسار صورة محفوظاً في قاعدة البيانات.'
            : 'SuggestedIconKey is a visual suggestion, not a stored image URL.'}
        </p>
        {error && (
          <p role="alert" className="flex items-center gap-2 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4 shrink-0" />{error}
          </p>
        )}
        {drafts.length > 0 && (
          <>
            <p className="text-sm font-semibold">
              {ar ? 'عدد الفئات المقروءة:' : 'Proposed categories:'} {drafts.length}
            </p>
            <div className="max-h-80 overflow-auto rounded-xl border">
              <table className="w-full min-w-[580px] border-collapse text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="p-3 text-start">ContentKey</th>
                    <th className="p-3 text-start">StageId</th>
                    <th className="p-3 text-start">Order</th>
                    <th className="p-3 text-start">{ar ? 'الفئة' : 'Category'}</th>
                  </tr>
                </thead>
                <tbody>
                  {drafts.map((x, i) => (
                    <tr key={`${x.ContentKey}-${i}`} className="border-t">
                      <td className="p-3" dir="ltr">{x.ContentKey}</td>
                      <td className="p-3">{x.StageId}</td>
                      <td className="p-3">{x.Order}</td>
                      <td className="p-3">{ar ? x.NameAr : x.NameEn}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button type="button" disabled={isLoading} onClick={() => void check()}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-semibold text-primary-foreground disabled:opacity-50">
              <ClipboardCheck className="h-5 w-5" aria-hidden="true"/>
              {isLoading ? (ar ? 'جارٍ التحقق…' : 'Checking…')
                : (ar ? 'فحص الفئات دون نشر' : 'Validate without publishing')}
            </button>
          </>
        )}
      </section>
      {preview && (
        <section className="space-y-4 rounded-2xl border bg-card p-5" aria-live="polite">
          <h2 className="text-xl font-bold">{ar ? 'نتائج التحقق' : 'Validation results'}</h2>
          <p>{ar ? 'فئات صالحة:' : 'Valid:'} {preview.ValidCount} / {preview.Total}
            {' · '}{ar ? 'تحتاج تعديلاً:' : 'Invalid:'} {preview.InvalidCount}</p>
          {preview.Results.map((result, i) => (
            <div key={`${result.ContentKey}-${i}`} className="rounded-xl border p-3">
              <span className="flex items-center justify-between gap-2">
                <strong dir="ltr">{result.ContentKey}</strong>
                <span className={result.Valid ? 'text-emerald-600' : 'text-destructive'}>
                  {result.Valid ? (ar ? 'صالح' : 'Valid') : (ar ? 'أخطاء' : 'Errors')}
                </span>
              </span>
              {result.Errors.length > 0 &&
                <p dir="ltr" className="mt-2 text-sm text-destructive">{result.Errors.join(', ')}</p>}
            </div>
          ))}
          <p className="text-sm font-semibold text-muted-foreground">
            {ar
              ? 'حتى لو كانت كل الفئات صالحة، لا تُنشر تلقائياً. أضف الفئات المعتمدة من لوحة إدارة الفئات.'
              : 'Even valid proposals are not published. Create approved categories separately using category management.'}
          </p>
        </section>
      )}
      <section className="rounded-2xl border p-5">
        <h2 className="mb-3 font-semibold">{ar ? 'معرفات المراحل الحالية' : 'Current stage IDs'}</h2>
        <div className="flex flex-wrap gap-2">
          {stages?.map(stage => (
            <span key={stage.Id} className="rounded-xl bg-muted px-3 py-2 text-sm">
              {stage.Id}: {ar ? stage.NameAr : stage.NameEn}
            </span>
          ))}
        </div>
      </section>
    </main>
  );
}
