'use client';

import { useEffect, useState } from 'react';
import {
  useGetStageCategoryAccessQuery,
  useUpdateStageFreeCategoriesMutation,
} from '@/store/api/categoriesApi';

type Props = {
  stageId: number;
  locale: string;
};

/**
 * Admin editor for the two Free categories in one stage.
 * Entitlements are always enforced by the API; these checkboxes are not access control.
 */
export function StageFreeCategoryAccessEditor({ stageId, locale }: Props) {
  const ar = locale === 'ar';
  const { currentData: catalog, isLoading, isFetching, isError, refetch } =
    useGetStageCategoryAccessQuery(stageId, {
      skip: stageId <= 0,
      refetchOnMountOrArgChange: true,
    });
  const [saveSelection, { isLoading: isSaving }] = useUpdateStageFreeCategoriesMutation();
  const [selected, setSelected] = useState<number[]>([]);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  // A stage switch must never carry a previous stage's IDs into a write.
  useEffect(() => {
    setSelected(catalog?.FreeCategoryIds ?? []);
  }, [stageId, catalog]);

  useEffect(() => {
    setError('');
    setStatus('');
  }, [stageId]);

  const choices = catalog?.Categories ?? [];
  const isValid = selected.length === 2 &&
    new Set(selected).size === 2 &&
    selected.every(id => choices.some(c => c.Id === id));
  // The default pair is not pinned yet: allow saving the same two IDs to
  // protect Free entitlements from future editorial reorder operations.
  const unchanged = isValid && catalog?.HasSavedFreeSelection === true &&
    selected.every(id => catalog?.FreeCategoryIds.includes(id));
  const canSubmit = !!catalog && isValid && !unchanged && !isSaving && !isFetching;

  const toggle = (id: number) => {
    if (isSaving || isFetching) return;
    setStatus('');
    setError('');
    setSelected(current => current.includes(id)
      ? current.filter(x => x !== id)
      : current.length < 2 ? [...current, id] : current);
  };

  const save = async () => {
    if (!canSubmit || !catalog) return;
    const selectedNames = choices.filter(item => selected.includes(item.Id))
      .map(item => ar ? item.NameAr : item.NameEn).join('، ');
    const confirmed = window.confirm(ar
      ? `تأكيد استبدال الفئتين المجانيتين لهذه المرحلة بـ: ${selectedNames}؟\nقد تتغير فوراً صلاحية وصول الطلاب Free إلى بعض المسائل بعد نشر التحديث.`
      : `Set the two Free categories for this stage to: ${selectedNames}?\nThis may change learners' access to questions when the update is deployed.`);
    if (!confirmed) return;

    setError('');
    setStatus('');
    try {
      await saveSelection({
        stageId,
        categoryIds: [selected[0], selected[1]],
      }).unwrap();
      setStatus(ar ? 'تم حفظ الفئتين المجانيتين بنجاح.' : 'The two Free categories were saved.');
      void refetch();
    } catch {
      setError(ar
        ? 'تعذّر حفظ الفئتين. راجع الاتصال وصلاحية الأدمن وتطابق الفئات مع المرحلة.'
        : 'Could not save the Free categories. Check admin access, network and category-stage consistency.');
    }
  };

  return (
    <section className="mb-6 rounded-2xl border border-primary/20 bg-card p-4 sm:p-5"
      aria-label={ar ? 'إعداد الفئتين المجانيتين لهذه المرحلة' : 'Stage Free category settings'}>
      <h2 className="text-lg font-bold">
        {ar ? 'الفئتان المجانيتان (Free)' : 'Two Free categories'}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {ar
          ? 'حدد فئتين فقط ضمن هذه المرحلة. الطالب المجاني يحل مسائل الفئتين بلا حد يومي؛ Premium يفتح جميع الفئات. حفظ التغيير يؤثر على الوصول، وليس على سجلات الحل.'
          : 'Select exactly two categories for this stage. Free learners can solve unlimited questions in these categories; Premium unlocks all categories. This changes access, not attempt history.'}
      </p>

      {isLoading ? (
        <p role="status" className="mt-4 text-sm text-muted-foreground">
          {ar ? 'جارٍ تحميل الفئات المتاحة…' : 'Loading stage categories…'}
        </p>
      ) : isError || !catalog ? (
        <div role="alert" className="mt-4 space-y-3 text-sm text-destructive">
          <p>{ar ? 'تعذر تحميل إعدادات Free لهذه المرحلة.' : 'Could not load the Free category settings.'}</p>
          <button type="button" onClick={() => void refetch()}
            className="rounded-lg border border-current px-3 py-2 font-semibold">
            {ar ? 'إعادة المحاولة' : 'Retry'}
          </button>
        </div>
      ) : (
        <>
          {!catalog.HasSavedFreeSelection && choices.length >= 2 && (
            <p className="mt-3 rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
              {ar
                ? 'الاختيار الحالي افتراضي بحسب ترتيب الفئات. يمكنك تثبيت نفس الفئتين بزر الحفظ قبل إعادة ترتيب التصنيفات، حتى لا تتغير صلاحيات Free بالخطأ.'
                : 'The current Free pair is determined by category order. Save the same pair to pin it before reordering categories, so access cannot change accidentally.'}
            </p>
          )}
          {choices.length < 2 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              {ar ? 'أضف فئتين على الأقل لهذه المرحلة قبل ضبط Free.' : 'Add at least two categories to this stage before configuring Free access.'}
            </p>
          ) : (
            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {choices.map(category => {
                const active = selected.includes(category.Id);
                return (
                  <button key={category.Id} type="button" aria-pressed={active}
                    disabled={isSaving || isFetching}
                    onClick={() => toggle(category.Id)}
                    className={`flex min-w-0 items-center gap-3 rounded-xl border px-3 py-3 text-start text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-60 ${
                      active ? 'border-primary bg-primary/10 font-semibold' : 'border-border hover:border-primary/50'
                    }`}>
                    <span aria-hidden="true"
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${
                        active ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/40'
                      }`}>{active ? '✓' : ''}</span>
                    <span className="min-w-0 break-words">{ar ? category.NameAr : category.NameEn}</span>
                  </button>
                );
              })}
            </div>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button type="button" disabled={!canSubmit} onClick={() => void save()}
              className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-40">
              {isSaving ? (ar ? 'جارٍ الحفظ…' : 'Saving…') : (ar ? 'حفظ الفئتين المجانيتين' : 'Save Free categories')}
            </button>
            <span className="text-xs text-muted-foreground">
              {ar ? `المحدد: ${selected.length} من 2` : `Selected: ${selected.length} of 2`}
            </span>
            {unchanged && <span className="text-xs text-muted-foreground">
              {ar ? 'لا توجد تغييرات للحفظ' : 'No changes to save'}
            </span>}
          </div>
          {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
          {status && <p role="status" className="mt-3 text-sm text-primary">{status}</p>}
        </>
      )}
    </section>
  );
}
