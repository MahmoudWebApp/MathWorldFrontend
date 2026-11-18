'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { useSelector } from 'react-redux';
import { useGetAdminStagesQuery } from '@/store/api/stagesApi';
import { useGetStageCategoryAccessQuery, useUpdateStageFreeCategoriesMutation } from '@/store/api/categoriesApi';

function StagePolicy({ stageId, ar }: { stageId: number; ar: boolean }) {
  const { data, isLoading, isError, refetch } = useGetStageCategoryAccessQuery(stageId);
  const [selection, setSelection] = useState<number[]>([]);
  const [notice, setNotice] = useState('');
  const [save, { isLoading: saving }] = useUpdateStageFreeCategoriesMutation();

  useEffect(() => {
    setSelection(data?.StageId === stageId ? data.FreeCategoryIds : []);
    setNotice('');
  }, [data, stageId]);

  if (isLoading) return <p role="status">{ar ? 'جاري تحميل الفئات…' : 'Loading categories…'}</p>;
  if (isError || !data) return <button type="button" onClick={() => void refetch()} className="underline">{ar ? 'تعذّر التحميل — أعد المحاولة' : 'Failed to load — retry'}</button>;

  const valid = selection.length === 2 && selection.every(id => data.Categories.some(c => c.Id === id));
  const dirty = valid && [...selection].sort().join(',') !== [...data.FreeCategoryIds].sort().join(',');
  const toggle = (id: number) => {
    setNotice('');
    setSelection(current => current.includes(id)
      ? current.filter(value => value !== id)
      : current.length < 2 ? [...current, id] : current);
  };
  const submit = async () => {
    if (!valid || !dirty || saving) return;
    try {
      await save({ stageId, categoryIds: selection as [number, number] }).unwrap();
      setNotice(ar ? 'تم حفظ الفئتين المجانيتين بنجاح.' : 'Free categories saved successfully.');
      void refetch();
    } catch {
      setNotice(ar ? 'فشل الحفظ. لم تتغير السياسة الحالية.' : 'Save failed. Existing policy remains unchanged.');
    }
  };

  return <div className="space-y-4">
    <p className="text-sm text-muted-foreground">{ar ? 'اختر فئتين فقط. لا يوجد حد يومي للمسائل داخل الفئات المجانية.' : 'Select exactly two categories. Free practice has no daily question limit.'}</p>
    <div className="grid gap-3 sm:grid-cols-2">
      {data.Categories.map(category => <label key={category.Id} className="flex cursor-pointer items-center gap-3 rounded-xl border p-4">
        <input type="checkbox" checked={selection.includes(category.Id)} disabled={saving || (!selection.includes(category.Id) && selection.length >= 2)} onChange={() => toggle(category.Id)} className="h-5 w-5 accent-primary" />
        <span className="flex-1">{ar ? category.NameAr : category.NameEn}</span>
        <span className="text-xs text-muted-foreground">{category.IsFree ? (ar ? 'مجانية حالياً' : 'Currently free') : 'Premium'}</span>
      </label>)}
    </div>
    <div className="flex flex-wrap items-center gap-3">
      <button type="button" disabled={!dirty || saving} onClick={() => void submit()} className="rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50">
        {saving ? (ar ? 'جاري الحفظ…' : 'Saving…') : (ar ? 'حفظ الفئتين المجانيتين' : 'Save free categories')}
      </button>
      <button type="button" disabled={saving || !dirty} onClick={() => setSelection([...data.FreeCategoryIds])} className="rounded-xl border px-5 py-3 disabled:opacity-50">{ar ? 'إلغاء التغييرات' : 'Discard changes'}</button>
    </div>
    {selection.length !== 2 && <p role="status" className="text-sm">{ar ? 'يجب اختيار فئتين بالضبط.' : 'Exactly two categories are required.'}</p>}
    {notice && <p role="status" aria-live="polite">{notice}</p>}
  </div>;
}

export default function FreeCategoriesAdminPage() {
  const ar = useLocale() === 'ar';
  const admin = useSelector((state: { auth: { isAuthenticated: boolean; user: { Role?: string } | null } }) => state.auth.isAuthenticated && state.auth.user?.Role === 'Admin');
  const { data: stages, isLoading, isError, refetch } = useGetAdminStagesQuery(undefined, { skip: !admin });
  const [stageId, setStageId] = useState<number | null>(null);
  const selectedId = stageId && stages?.some(stage => stage.Id === stageId) ? stageId : stages?.[0]?.Id;
  return <main className="container mx-auto max-w-5xl px-4 py-12" dir={ar ? 'rtl' : 'ltr'}>
    <h1 className="mb-3 text-3xl font-bold">{ar ? 'إدارة الفئات المجانية' : 'Manage free categories'}</h1>
    <p className="mb-7 text-muted-foreground">{ar ? 'حدد الفئتين المتاحتين مجاناً لكل مرحلة تعليمية.' : 'Choose the two categories available to Free students in each educational stage.'}</p>
    {!admin && <p role="alert">{ar ? 'هذه الصفحة مخصصة للإدارة.' : 'This page is for administrators.'}</p>}
    {admin && isLoading && <p>{ar ? 'جاري تحميل المراحل…' : 'Loading stages…'}</p>}
    {admin && isError && <button type="button" onClick={() => void refetch()}>{ar ? 'تعذّر تحميل المراحل — أعد المحاولة' : 'Unable to load stages — retry'}</button>}
    {admin && stages?.length === 0 && <p>{ar ? 'لا توجد مراحل.' : 'No stages available.'}</p>}
    {admin && selectedId && <section className="rounded-2xl border bg-card p-6">
      <label htmlFor="policy-stage" className="mb-2 block font-semibold">{ar ? 'المرحلة التعليمية' : 'Educational stage'}</label>
      <select id="policy-stage" value={selectedId} onChange={event => setStageId(Number(event.target.value))} className="mb-6 w-full rounded-xl border bg-background p-3">
        {stages?.map(stage => <option key={stage.Id} value={stage.Id}>{ar ? stage.NameAr : stage.NameEn}</option>)}
      </select>
      <StagePolicy key={selectedId} stageId={selectedId} ar={ar} />
    </section>}
  </main>;
}
