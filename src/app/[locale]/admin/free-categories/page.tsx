'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { useSelector } from 'react-redux';
import { useGetAdminStagesQuery } from '@/store/api/stagesApi';
import { useGetStageCategoryAccessQuery, useUpdateStageFreeCategoriesMutation } from '@/store/api/categoriesApi';

function StagePolicy({ stageId, ar }: { stageId: number; ar: boolean }) {
  const { data, isLoading, isError, refetch } = useGetStageCategoryAccessQuery(stageId);
  const [selection, setSelection] = useState<number[] | null>(null);
  const [save, { isLoading: saving, isError: saveError, isSuccess }] = useUpdateStageFreeCategoriesMutation();
  const chosen = selection ?? data?.FreeCategoryIds ?? [];
  const toggle = (id: number) => setSelection(current => {
    const ids = current ?? data?.FreeCategoryIds ?? [];
    return ids.includes(id) ? ids.filter(value => value !== id) : [...ids, id].slice(0, 2);
  });
  const [chosen, setChosen] = useState<number[] | null>(null);
  const [save, { isLoading: saving, isError: saveError, isSuccess }] = useUpdateStageFreeCategoriesMutation();
  const selected = chosen ?? data?.FreeCategoryIds ?? [];
  const toggle = (id: number) => {
    setChosen(previous => {
      const current = previous ?? data?.FreeCategoryIds ?? [];
      if (current.includes(id)) return current.filter(value => value !== id);
      return current.length >= 2 ? current : [...current, id];
    });
  };
  if (isLoading) return <p role="status">{ar ? 'جاري تحميل الفئات…' : 'Loading categories…'}</p>;
  if (isError || !data) return <button type="button" onClick={() => void refetch()} className="underline">{ar ? 'تعذّر التحميل — أعد المحاولة' : 'Failed to load — retry'}</button>;
  return <div className="space-y-3">
    <p className="text-sm text-muted-foreground">{ar ? 'الفئات المجانية حالياً' : 'Currently free categories'}: {data.FreeCategoryCount}</p>
    <div className="grid gap-3 sm:grid-cols-2">
      {data.Categories.map(category => <label key={category.Id} className="flex items-center justify-between rounded-xl border p-4">
        <span className="flex items-center gap-3"><input type="checkbox" checked={chosen.includes(category.Id)} onChange={() => toggle(category.Id)} disabled={saving} />{ar ? category.NameAr : category.NameEn}</span>
        <span className={category.IsFree ? 'text-primary' : 'text-muted-foreground'}>{category.IsFree ? (ar ? 'مجانية' : 'Free') : 'Premium'}</span>
      </label>)}
    </div>
    <div className="flex flex-wrap items-center gap-3">
      <button type="button" disabled={saving || chosen.length !== 2 || selection === null || (chosen.length === data.FreeCategoryIds.length && chosen.every(id => data.FreeCategoryIds.includes(id)))} onClick={async () => {
        try { await save({ stageId, categoryIds: chosen }).unwrap(); setSelection(null); }
        catch { /* Error is shown below; preserve selection for retry. */ }
      }} className="rounded-xl bg-primary px-5 py-2 font-semibold text-primary-foreground disabled:opacity-50">
        {saving ? (ar ? 'جاري الحفظ…' : 'Saving…') : (ar ? 'حفظ الفئتين المجانيتين' : 'Save two free categories')}
      </button>
      <button type="button" disabled={saving || selection === null} onClick={() => setSelection(null)} className="rounded-xl border px-4 py-2">{ar ? 'إلغاء' : 'Cancel'}</button>
    </div>
    {selection && chosen.length !== 2 && <p role="status">{ar ? 'يجب اختيار فئتين بالضبط.' : 'Select exactly two categories.'}</p>}
    {saveError && <p role="alert" className="text-destructive">{ar ? 'فشل الحفظ. أعد المحاولة.' : 'Could not save. Please retry.'}</p>}
    {isSuccess && selection === null && <p role="status" className="text-primary">{ar ? 'تم حفظ الاختيار.' : 'Selection saved.'}</p>}
  </div>;
}

export default function FreeCategoriesAdminPage() {
  const ar = useLocale() === 'ar';
  const admin = useSelector((state: { auth: { isAuthenticated: boolean; user: { Role?: string } | null } }) => state.auth.isAuthenticated && state.auth.user?.Role === 'Admin');
  const { data: stages, isLoading, isError } = useGetAdminStagesQuery(undefined, { skip: !admin });
  const [stageId, setStageId] = useState<number | null>(null);
  const selectedId = stageId && stages?.some(stage => stage.Id === stageId) ? stageId : stages?.[0]?.Id;
  return <main className="container mx-auto max-w-5xl px-4 py-12" dir={ar ? 'rtl' : 'ltr'}>
    <h1 className="mb-3 text-3xl font-bold">{ar ? 'سياسة الفئات المجانية' : 'Free category access policy'}</h1>
    <p className="mb-7 text-muted-foreground">{ar ? 'لكل مرحلة فئتان مجانيتان بلا حد يومي للمسائل.' : 'Each stage includes two free categories with unlimited daily practice.'}</p>
    {!admin && <p role="alert">{ar ? 'هذه الصفحة مخصصة للإدارة.' : 'This page is for administrators.'}</p>}
    {admin && isLoading && <p>{ar ? 'جاري تحميل المراحل…' : 'Loading stages…'}</p>}
    {admin && isError && <p role="alert">{ar ? 'تعذّر تحميل المراحل.' : 'Unable to load stages.'}</p>}
    {admin && stages && stages.length === 0 && <p>{ar ? 'لا توجد مراحل.' : 'No stages available.'}</p>}
    {admin && selectedId && <section className="rounded-2xl border bg-card p-6">
      <label htmlFor="policy-stage" className="mb-2 block font-semibold">{ar ? 'المرحلة التعليمية' : 'Educational stage'}</label>
      <select id="policy-stage" value={selectedId} onChange={event => setStageId(Number(event.target.value))} className="mb-6 w-full rounded-xl border bg-background p-3">
        {stages?.map(stage => <option key={stage.Id} value={stage.Id}>{ar ? stage.NameAr : stage.NameEn}</option>)}
      </select>
      <StagePolicy key={selectedId} stageId={selectedId} ar={ar} />
    </section>}
  </main>;
}    <div className="flex flex-wrap items-center gap-3">
      <button type="button" disabled={saving || selected.length !== 2 || selected.every(id => data.FreeCategoryIds.includes(id))} onClick={async () => {
        try { await save({ stageId, categoryIds: selected }).unwrap(); setChosen(null); await refetch(); } catch { /* show mutation error */ }
      }} className="rounded-xl bg-primary px-5 py-2.5 font-semibold text-primary-foreground disabled:opacity-50">{saving ? (ar ? 'جاري الحفظ…' : 'Saving…') : (ar ? 'حفظ الفئتين المجانيتين' : 'Save two free categories')}</button>
      <button type="button" onClick={() => setChosen(null)} disabled={saving} className="rounded-xl border px-4 py-2.5">{ar ? 'إلغاء التعديل' : 'Reset'}</button>
    </div>
    {selected.length !== 2 && <p role="alert" className="text-sm">{ar ? 'يجب اختيار فئتين بالضبط.' : 'Select exactly two categories.'}</p>}
    {saveError && <p role="alert" className="text-sm text-destructive">{ar ? 'فشل الحفظ. حاول مجدداً.' : 'Saving failed. Please retry.'}</p>}
    {isSuccess && !saveError && <p role="status" className="text-sm text-primary">{ar ? 'تم حفظ سياسة الفئات.' : 'Category access policy saved.'}</p>};
  if (isError || !data) return <button type="button" onClick={() => void refetch()} className="underline">{ar ? 'تعذّر التحميل — أعد المحاولة' : 'Failed to load — retry'}</button>;
  return <div className="space-y-3">
    <p className="text-sm text-muted-foreground">{ar ? 'الفئات المجانية حالياً' : 'Currently free categories'}: {data.FreeCategoryCount}</p>
    <div className="grid gap-3 sm:grid-cols-2">
      {data.Categories.map(category => <label key={category.Id} className="flex items-center justify-between rounded-xl border p-4">
        <span className="flex items-center gap-3"><input type="checkbox" checked={chosen.includes(category.Id)} onChange={() => toggle(category.Id)} disabled={saving} />{ar ? category.NameAr : category.NameEn}</span>
        <span className={category.IsFree ? 'text-primary' : 'text-muted-foreground'}>{category.IsFree ? (ar ? 'مجانية' : 'Free') : 'Premium'}</span>
      </label>)}
    </div>
    <div className="flex flex-wrap items-center gap-3">
      <button type="button" disabled={saving || chosen.length !== 2 || selection === null || (chosen.length === data.FreeCategoryIds.length && chosen.every(id => data.FreeCategoryIds.includes(id)))} onClick={async () => {
        try { await save({ stageId, categoryIds: chosen }).unwrap(); setSelection(null); }
        catch { /* Error is shown below; preserve selection for retry. */ }
      }} className="rounded-xl bg-primary px-5 py-2 font-semibold text-primary-foreground disabled:opacity-50">
        {saving ? (ar ? 'جاري الحفظ…' : 'Saving…') : (ar ? 'حفظ الفئتين المجانيتين' : 'Save two free categories')}
      </button>
      <button type="button" disabled={saving || selection === null} onClick={() => setSelection(null)} className="rounded-xl border px-4 py-2">{ar ? 'إلغاء' : 'Cancel'}</button>
    </div>
    {selection && chosen.length !== 2 && <p role="status">{ar ? 'يجب اختيار فئتين بالضبط.' : 'Select exactly two categories.'}</p>}
    {saveError && <p role="alert" className="text-destructive">{ar ? 'فشل الحفظ. أعد المحاولة.' : 'Could not save. Please retry.'}</p>}
    {isSuccess && selection === null && <p role="status" className="text-primary">{ar ? 'تم حفظ الاختيار.' : 'Selection saved.'}</p>}
  </div>;
}

export default function FreeCategoriesAdminPage() {
  const ar = useLocale() === 'ar';
  const admin = useSelector((state: { auth: { isAuthenticated: boolean; user: { Role?: string } | null } }) => state.auth.isAuthenticated && state.auth.user?.Role === 'Admin');
  const { data: stages, isLoading, isError } = useGetAdminStagesQuery(undefined, { skip: !admin });
  const [stageId, setStageId] = useState<number | null>(null);
  const selectedId = stageId && stages?.some(stage => stage.Id === stageId) ? stageId : stages?.[0]?.Id;
  return <main className="container mx-auto max-w-5xl px-4 py-12" dir={ar ? 'rtl' : 'ltr'}>
    <h1 className="mb-3 text-3xl font-bold">{ar ? 'سياسة الفئات المجانية' : 'Free category access policy'}</h1>
    <p className="mb-7 text-muted-foreground">{ar ? 'لكل مرحلة فئتان مجانيتان بلا حد يومي للمسائل.' : 'Each stage includes two free categories with unlimited daily practice.'}</p>
    {!admin && <p role="alert">{ar ? 'هذه الصفحة مخصصة للإدارة.' : 'This page is for administrators.'}</p>}
    {admin && isLoading && <p>{ar ? 'جاري تحميل المراحل…' : 'Loading stages…'}</p>}
    {admin && isError && <p role="alert">{ar ? 'تعذّر تحميل المراحل.' : 'Unable to load stages.'}</p>}
    {admin && stages && stages.length === 0 && <p>{ar ? 'لا توجد مراحل.' : 'No stages available.'}</p>}
    {admin && selectedId && <section className="rounded-2xl border bg-card p-6">
      <label htmlFor="policy-stage" className="mb-2 block font-semibold">{ar ? 'المرحلة التعليمية' : 'Educational stage'}</label>
      <select id="policy-stage" value={selectedId} onChange={event => setStageId(Number(event.target.value))} className="mb-6 w-full rounded-xl border bg-background p-3">
        {stages?.map(stage => <option key={stage.Id} value={stage.Id}>{ar ? stage.NameAr : stage.NameEn}</option>)}
      </select>
      <StagePolicy key={selectedId} stageId={selectedId} ar={ar} />
    </section>}
  </main>;
}
