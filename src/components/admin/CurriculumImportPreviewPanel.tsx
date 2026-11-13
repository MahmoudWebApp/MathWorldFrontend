'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { usePreviewCurriculumImportMutation, type ProposedCurriculumProblem, type CurriculumStageCoverage } from '@/store/api/curriculumApi';

export function CurriculumImportPreviewPanel({ stages }: { stages: CurriculumStageCoverage[] }) {
  const ar = useLocale() === 'ar';
  const [source, setSource] = useState('[]');
  const [localError, setLocalError] = useState('');
  const [preview, { data, isLoading, error }] = usePreviewCurriculumImportMutation();

  const loadExample = () => {
    const stage = stages.find(item => item.Categories.length > 0);
    if (!stage) {
      setLocalError(ar ? 'لا توجد مرحلة مع فئة صالحة لإنشاء المثال' : 'No stage with a category available');
      return;
    }
    if (source.trim() !== '[]' && !window.confirm(ar ? 'استبدال المسودة الحالية؟' : 'Replace the current draft?')) return;
    setSource(JSON.stringify([{
      ContentKey: 'sample-arithmetic-01',
      StageId: stage.StageId,
      CategoryId: stage.Categories[0].CategoryId,
      QuestionTextAr: 'احسب: ٧ × ٨ − ٦',
      QuestionTextEn: 'Calculate: 7 × 8 − 6',
      DetailedSolutionAr: 'نضرب أولاً: ٧ × ٨ = ٥٦، ثم نطرح ٦، فيكون الناتج ٥٠.',
      DetailedSolutionEn: 'Multiply first: 7 × 8 = 56, then subtract 6 to get 50.',
      Points: 10,
      Options: [
        { LatexCode: '42', IsCorrect: false, Order: 1 },
        { LatexCode: '48', IsCorrect: false, Order: 2 },
        { LatexCode: '50', IsCorrect: true, Order: 3 },
        { LatexCode: '58', IsCorrect: false, Order: 4 },
      ],
    }], null, 2));
    setLocalError('');
  };

  const submit = async () => {
    setLocalError('');
    let candidate: unknown;
    try { candidate = JSON.parse(source); } catch {
      setLocalError(ar ? 'ملف JSON غير صالح' : 'Invalid JSON'); return;
    }
    if (!Array.isArray(candidate) || candidate.length < 1 || candidate.length > 100 ||
        candidate.some(item => !item || typeof item !== 'object' || Array.isArray(item))) {
      setLocalError(ar ? 'أدخل مصفوفة تحتوي من 1 إلى 100 مسألة' : 'Enter an array of 1–100 problems');
      return;
    }
    try { await preview({ Problems: candidate as ProposedCurriculumProblem[] }).unwrap(); }
    catch { /* Render RTK Query error below. */ }
  };

  return (
    <section className="space-y-3 rounded-xl border bg-card p-5">
      <h2 className="text-lg font-semibold">{ar ? 'فحص دفعة مسائل قبل الاستيراد' : 'Curriculum batch dry-run'}</h2>
      <p className="text-sm text-muted-foreground">
        {ar ? 'ألصق مصفوفة JSON تحتوي معرفات المراحل والفئات الفعلية. الفحص لا يحفظ ولا ينشر أي مسألة.'
          : 'Paste a JSON array using actual stage/category IDs. Preview never saves or publishes problems.'}
      </p>
      <button type="button" onClick={loadExample} className="rounded-lg border px-3 py-2 text-sm">
        {ar ? 'مثال تجريبي بمعرفات حقيقية (دون حفظ)' : 'Sample with real stage/category IDs (not saved)'}
      </button>
      <textarea aria-label={ar ? 'مسائل بصيغة JSON' : 'Problems JSON'} value={source}
        onChange={event => setSource(event.target.value)} rows={9} spellCheck={false}
        className="w-full rounded-lg border bg-transparent p-3 font-mono text-xs" />
      <button type="button" onClick={submit} disabled={isLoading}
        className="rounded-lg bg-emerald-700 px-4 py-2 text-white disabled:opacity-50">
        {isLoading ? '...' : ar ? 'فحص دون حفظ' : 'Validate without saving'}
      </button>
      {localError && <p role="alert" className="text-sm text-red-600">{localError}</p>}
      {error && <p role="alert" className="text-sm text-red-600">{ar ? 'فشل التحقق. راجع الصلاحيات أو البيانات.' : 'Validation failed. Check permissions or payload.'}</p>}
      {data && (
        <div className="space-y-2 text-sm" role="status">
          <p>{ar ? 'صحيحة' : 'Valid'}: {data.ValidCount} · {ar ? 'تحتاج تصحيح' : 'Invalid'}: {data.InvalidCount}</p>
          <p className="font-medium">{ar ? 'معاينة فقط — لم تُنشر أي مسائل' : 'Dry-run only — no problems published'}</p>
          {data.Results.map((item, index) => (
            <div key={index} className="rounded-lg border p-2">
              <strong dir="ltr">{item.ContentKey || `#${index + 1}`}</strong>
              <span className={item.Valid ? 'ms-2 text-emerald-600' : 'ms-2 text-red-600'}>
                {item.Valid ? (ar ? 'صحيحة' : 'Valid') : item.Errors.join(', ')}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
