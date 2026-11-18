'use client';

import { useState, type FormEvent } from 'react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import {
  useCreateAdminPremiumDiscountMutation,
  useDisableAdminPremiumDiscountMutation,
  useGetAdminPremiumDiscountsQuery,
  useUpdateAdminPremiumDiscountSettingsMutation,
  type CreatedPremiumDiscount,
  type AdminPremiumDiscount,
} from '@/store/api/usersApi';

const utcToLocal = (value: string) => {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return '';
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString().slice(0, 16);
};

const localToUtc = (value: string) => {
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toISOString() : null;
};

export default function AdminPremiumDiscountsPage() {
  const ar = useLocale() === 'ar';
  const [page, setPage] = useState(1);
  const [label, setLabel] = useState('');
  const [kind, setKind] = useState<'Percentage' | 'FixedUsd'>('Percentage');
  const [amount, setAmount] = useState('20');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [maxUses, setMaxUses] = useState('');
  const [maxPerStudent, setMaxPerStudent] = useState('1');
  const [created, setCreated] = useState<CreatedPremiumDiscount | null>(null);
  const [disableId, setDisableId] = useState<number | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [editStart, setEditStart] = useState('');
  const [editEnd, setEditEnd] = useState('');
  const [editMaxUses, setEditMaxUses] = useState('');
  const [editPerStudent, setEditPerStudent] = useState('1');
  const [editError, setEditError] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const { data, isLoading, isError, refetch } = useGetAdminPremiumDiscountsQuery(page);
  const [create, { isLoading: creating }] = useCreateAdminPremiumDiscountMutation();
  const [disable, { isLoading: disabling }] = useDisableAdminPremiumDiscountMutation();
  const [updateSettings, { isLoading: savingSettings }] = useUpdateAdminPremiumDiscountSettingsMutation();

  const dateLabel = (value: string) => {
    const date = new Date(value);
    return Number.isFinite(date.getTime())
      ? new Intl.DateTimeFormat(ar ? 'ar' : 'en', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
      : '—';
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setNotice('');
    setCreated(null);
    const starts = localToUtc(start);
    const ends = localToUtc(end);
    const numericAmount = Number(amount);
    const limit = maxUses.trim() ? Number(maxUses) : null;
    const studentLimit = maxPerStudent.trim() ? Number(maxPerStudent) : null;
    if (label.trim().length < 3 || label.trim().length > 80 ||
      !starts || !ends || new Date(ends) <= new Date(starts) ||
      new Date(ends) <= new Date() ||
      !Number.isFinite(numericAmount) || numericAmount <= 0 ||
      !/^\d+(?:\.\d{1,2})?$/.test(amount.trim()) ||
      numericAmount > (kind === 'Percentage' ? 99.99 : 4.99) ||
      (limit !== null && (!Number.isInteger(limit) || limit < 1)) ||
      (studentLimit !== null && (!Number.isInteger(studentLimit) || studentLimit < 1))) {
      setError(ar ? 'تحقق من الاسم، قيمة الخصم، تاريخ البداية والنهاية، وحد الاستخدام.' :
        'Check label, discount amount, start/end dates and usage limit.');
      return;
    }
    try {
      const result = await create({
        Label: label.trim(), DiscountKind: kind, Amount: numericAmount,
        StartsAtUtc: starts, EndsAtUtc: ends,
        MaxRedemptions: limit, MaxRedemptionsPerStudent: studentLimit,
      }).unwrap();
      setCreated(result);
      setPage(1);
      setLabel('');
    } catch {
      setError(ar ? 'تعذّر إنشاء الكود. تحقق من الصلاحيات والبيانات.' :
        'Could not create the code. Check your permissions and input.');
    }
  };

  const openEdit = (code: AdminPremiumDiscount) => {
    setEditId(code.Id);
    setEditStart(utcToLocal(code.StartsAtUtc));
    setEditEnd(utcToLocal(code.EndsAtUtc));
    setEditMaxUses(code.MaxRedemptions?.toString() ?? '');
    setEditPerStudent(code.MaxRedemptionsPerStudent?.toString() ?? '');
    setEditError('');
  };

  const saveEdit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (editId === null) return;
    setEditError('');
    const starts = localToUtc(editStart);
    const ends = localToUtc(editEnd);
    const totalLimit = editMaxUses.trim() ? Number(editMaxUses) : null;
    const perStudentLimit = editPerStudent.trim() ? Number(editPerStudent) : null;
    if (!starts || !ends || new Date(ends) <= new Date(starts) || new Date(ends) <= new Date() ||
      (totalLimit !== null && (!Number.isInteger(totalLimit) || totalLimit < 1)) ||
      (perStudentLimit !== null && (!Number.isInteger(perStudentLimit) || perStudentLimit < 1))) {
      setEditError(ar ? 'تحقق من فترة الصلاحية وحدود الاستخدام.' :
        'Check the validity window and redemption limits.');
      return;
    }
    try {
      await updateSettings({
        Id: editId,
        Settings: {
          StartsAtUtc: starts, EndsAtUtc: ends,
          MaxRedemptions: totalLimit, MaxRedemptionsPerStudent: perStudentLimit,
        },
      }).unwrap();
      setEditId(null);
      setNotice(ar ? 'تم تحديث صلاحية الكود وحدود استخدامه.' : 'Discount validity and usage limits updated.');
    } catch {
      setEditError(ar ? 'تعذّر الحفظ. تأكد من أن الكود نشط وأن الحد ليس أقل من الاستخدامات.' :
        'Could not save. Ensure the code is enabled and limits are not below existing use.');
    }
  };

  const confirmDisable = async () => {
    if (disableId === null) return;
    setError('');
    try {
      await disable(disableId).unwrap();
      setNotice(ar ? 'تم تعطيل الكود.' : 'Discount code disabled.');
    } catch {
      setError(ar ? 'تعذّر تعطيل الكود.' : 'Could not disable the code.');
    } finally {
      setDisableId(null);
    }
  };

  const statusText: Record<string, string> = ar ? {
    Scheduled: 'مجدول', Active: 'فعّال', Expired: 'منتهي',
    Disabled: 'معطّل', Exhausted: 'مستنفد',
  } : {
    Scheduled: 'Scheduled', Active: 'Active', Expired: 'Expired',
    Disabled: 'Disabled', Exhausted: 'Exhausted',
  };

  return (
    <main dir={ar ? 'rtl' : 'ltr'} className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <Link href="/admin" className="text-sm font-semibold text-primary hover:underline">
        {ar ? 'العودة للأدمن' : 'Back to admin'}
      </Link>
      <header className="space-y-2">
        <h1 className="text-3xl font-extrabold">{ar ? 'أكواد خصم Premium' : 'Premium discount codes'}</h1>
        <p className="text-sm leading-7 text-muted-foreground">
          {ar ? 'حدد قيمة الخصم وفترة سريانه وعدد استخداماته. أكواد الخصم لا تفعّل اشتراكاً دون عملية دفع مؤكدة.'
            : 'Set discount value, validity window and usage cap. Discounts never activate Premium without verified checkout.'}
        </p>
        <div><Link href="/admin/premium-checkout" className="inline-block text-sm font-semibold text-primary underline">
          {ar ? 'متابعة طلبات الاشتراك وإحصائيات الدفع' : 'View checkout orders and payment summary'}
        </Link></div>
        <Link href="/admin/premium-codes" className="inline-block text-sm font-semibold text-primary underline">
          {ar ? 'إدارة أكواد الهدايا المنفصلة' : 'Manage separate gift codes'}
        </Link>
      </header>

      <form onSubmit={event => void submit(event)} className="space-y-4 rounded-2xl border bg-card p-5">
        <h2 className="text-lg font-bold">{ar ? 'إنشاء كود خصم' : 'Create a discount'}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1 sm:col-span-2">
            <span className="block text-sm font-semibold">{ar ? 'اسم داخلي' : 'Internal label'}</span>
            <input required minLength={3} maxLength={80} value={label} onChange={e => setLabel(e.target.value)}
              className="w-full rounded-xl border bg-background px-3 py-2" />
          </label>
          <label className="space-y-1">
            <span className="block text-sm font-semibold">{ar ? 'نوع الخصم' : 'Discount type'}</span>
            <select value={kind} onChange={e => { setKind(e.target.value as 'Percentage' | 'FixedUsd'); setAmount(''); }}
              className="w-full rounded-xl border bg-background px-3 py-2">
              <option value="Percentage">{ar ? 'نسبة مئوية (%)' : 'Percentage (%)'}</option>
              <option value="FixedUsd">{ar ? 'مبلغ بالدولار ($)' : 'Fixed USD ($)'}</option>
            </select>
          </label>
          <label className="space-y-1">
            <span className="block text-sm font-semibold">{ar ? 'قيمة الخصم' : 'Discount amount'}</span>
            <input required type="number" min={0} max={kind === 'Percentage' ? 99.99 : 4.99}
              step="0.01" value={amount} onChange={e => setAmount(e.target.value)}
              className="w-full rounded-xl border bg-background px-3 py-2" />
          </label>
          <label className="space-y-1">
            <span className="block text-sm font-semibold">{ar ? 'بداية الصلاحية (توقيت جهازك)' : 'Starts (your local time)'}</span>
            <input required type="datetime-local" value={start} onChange={e => setStart(e.target.value)}
              className="w-full rounded-xl border bg-background px-3 py-2" />
          </label>
          <label className="space-y-1">
            <span className="block text-sm font-semibold">{ar ? 'نهاية الصلاحية (توقيت جهازك)' : 'Ends (your local time)'}</span>
            <input required type="datetime-local" value={end} onChange={e => setEnd(e.target.value)}
              className="w-full rounded-xl border bg-background px-3 py-2" />
          </label>
          <p className="text-xs text-muted-foreground sm:col-span-2">
            {ar ? 'الخصم الكامل (100%) يتم عبر كود هدية Premium المنفصل حالياً، وليس قسيمة شراء.'
              : 'For 100% free Premium access, issue a separate gift code instead of a checkout coupon.'}
          </p>
          <label className="space-y-1 sm:col-span-2">
            <span className="block text-sm font-semibold">
              {ar ? 'عدد الاستخدامات لكل طالب (افتراضياً 1، اتركه فارغاً لغير المحدود)' :
                'Redemptions per student (default 1, empty for unlimited)'}
            </span>
            <input type="number" min={1} step={1} value={maxPerStudent}
              onChange={e => setMaxPerStudent(e.target.value)}
              className="w-full rounded-xl border bg-background px-3 py-2" />
          </label>
          <label className="space-y-1 sm:col-span-2">
            <span className="block text-sm font-semibold">{ar ? 'الحد الأقصى للاستخدامات (اختياري)' : 'Maximum redemptions (optional)'}</span>
            <input type="number" min={1} step={1} value={maxUses} onChange={e => setMaxUses(e.target.value)}
              className="w-full rounded-xl border bg-background px-3 py-2" />
          </label>
        </div>
        <button type="submit" disabled={creating}
          className="rounded-xl bg-primary px-5 py-2.5 font-bold text-primary-foreground disabled:opacity-50">
          {creating ? (ar ? 'جارٍ الإنشاء…' : 'Creating…') : (ar ? 'إنشاء الكود' : 'Create code')}
        </button>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        {notice && <p role="status" className="text-sm text-emerald-700 dark:text-emerald-300">{notice}</p>}
        {created && <div role="status" className="space-y-2 rounded-xl border border-emerald-500/30 p-4">
          <strong>{ar ? 'تم الإنشاء — انسخ الكود الآن، لن يظهر مرة ثانية' : 'Created — copy now; the code is shown only once'}</strong>
          <div className="flex flex-wrap items-center gap-2">
            <code dir="ltr" className="break-all rounded-lg border bg-background p-2">{created.Code}</code>
            <button type="button" className="rounded-lg border px-3 py-2"
              onClick={() => void navigator.clipboard.writeText(created.Code)}>
              {ar ? 'نسخ' : 'Copy'}
            </button>
          </div>
        </div>}
      </form>

      <section className="space-y-3 rounded-2xl border bg-card p-5">
        <h2 className="text-lg font-bold">{ar ? 'الأكواد المسجّلة' : 'Issued discounts'}</h2>
        {isLoading ? <p role="status">{ar ? 'جارٍ التحميل…' : 'Loading…'}</p> :
          isError ? <div role="alert" className="space-y-2">
            <p>{ar ? 'تعذّر تحميل الأكواد.' : 'Could not load discounts.'}</p>
            <button onClick={() => void refetch()} className="font-semibold text-primary underline">
              {ar ? 'إعادة المحاولة' : 'Retry'}
            </button>
          </div> : !data?.Codes.length ? <p className="text-muted-foreground">
            {ar ? 'ما في أكواد خصم بعد.' : 'No discounts yet.'}
          </p> : <div className="space-y-3">
            {data.Codes.map(code => <article key={code.Id} className="flex flex-wrap justify-between gap-3 rounded-xl border p-3">
              <div className="min-w-0 space-y-1">
                <strong>{code.Label}</strong>
                <p className="text-sm">{code.DiscountKind === 'Percentage' ? `${code.Amount}%` : `$${code.Amount.toFixed(2)}`}
                  {' · '}{statusText[code.Status] ?? code.Status}</p>
                <p className="text-xs text-muted-foreground">{dateLabel(code.StartsAtUtc)} — {dateLabel(code.EndsAtUtc)}</p>
                <p className="text-xs text-muted-foreground">
                  {ar ? 'الاستخدامات' : 'Uses'}: {code.RedemptionCount} / {code.MaxRedemptions ?? '∞'}
                  {' · '}{ar ? 'لكل طالب' : 'Per student'}: {code.MaxRedemptionsPerStudent ?? '∞'}
                </p>
              </div>
              {code.Enabled && <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={() => openEdit(code)}
                  className="rounded-lg border px-3 py-2 text-sm text-primary">
                  {ar ? 'تعديل الصلاحية' : 'Edit validity'}
                </button>
                <button type="button" onClick={() => setDisableId(code.Id)}
                  className="rounded-lg border border-destructive/30 px-3 py-2 text-sm text-destructive">
                  {ar ? 'تعطيل' : 'Disable'}
                </button>
              </div>}
            </article>)}
          </div>}
        <div className="flex justify-between border-t pt-3 text-sm">
          <button disabled={page <= 1 || isLoading} onClick={() => setPage(p => p - 1)}
            className="font-semibold text-primary disabled:opacity-40">{ar ? 'السابق' : 'Previous'}</button>
          <span>{page} / {Math.max(1, Math.ceil((data?.Total ?? 0) / 20))}</span>
          <button disabled={!data || isLoading || page * 20 >= data.Total} onClick={() => setPage(p => p + 1)}
            className="font-semibold text-primary disabled:opacity-40">{ar ? 'التالي' : 'Next'}</button>
        </div>
      </section>

      {editId !== null && <div role="dialog" aria-modal="true" aria-labelledby="edit-discount-heading"
        className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4">
        <form onSubmit={event => void saveEdit(event)}
          className="w-full max-w-lg space-y-4 rounded-2xl bg-card p-5 shadow-xl">
          <h2 id="edit-discount-heading" className="text-lg font-bold">
            {ar ? 'تعديل صلاحية الكود' : 'Edit discount validity'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {ar ? 'تغيير الحدود أو التواريخ لا يغيّر قيمة الخصم ولا يمس الطلبات المدفوعة سابقاً.'
              : 'Changing dates or limits does not alter the discount amount or past paid orders.'}
          </p>
          <label className="block space-y-1">
            <span className="text-sm">{ar ? 'بداية الصلاحية (توقيت جهازك)' : 'Start (local time)'}</span>
            <input type="datetime-local" required value={editStart}
              onChange={event => setEditStart(event.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2" />
          </label>
          <label className="block space-y-1">
            <span className="text-sm">{ar ? 'نهاية الصلاحية (توقيت جهازك)' : 'End (local time)'}</span>
            <input type="datetime-local" required value={editEnd}
              onChange={event => setEditEnd(event.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2" />
          </label>
          <label className="block space-y-1">
            <span className="text-sm">{ar ? 'الحد الإجمالي (فارغ = غير محدود)' : 'Total uses (empty = unlimited)'}</span>
            <input type="number" min={1} step={1} value={editMaxUses}
              onChange={event => setEditMaxUses(event.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2" />
          </label>
          <label className="block space-y-1">
            <span className="text-sm">{ar ? 'لكل طالب (فارغ = غير محدود)' : 'Per student (empty = unlimited)'}</span>
            <input type="number" min={1} step={1} value={editPerStudent}
              onChange={event => setEditPerStudent(event.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2" />
          </label>
          {editError && <p role="alert" className="text-sm text-destructive">{editError}</p>}
          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" disabled={savingSettings} onClick={() => setEditId(null)}
              className="rounded-lg border px-3 py-2">{ar ? 'إلغاء' : 'Cancel'}</button>
            <button type="submit" disabled={savingSettings}
              className="rounded-lg bg-primary px-3 py-2 font-semibold text-primary-foreground disabled:opacity-50">
              {savingSettings ? (ar ? 'جارٍ الحفظ…' : 'Saving…') : (ar ? 'حفظ التعديلات' : 'Save changes')}
            </button>
          </div>
        </form>
      </div>}

      {disableId !== null && <div role="dialog" aria-modal="true"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-sm space-y-4 rounded-2xl bg-card p-6">
          <h2 className="text-lg font-bold">{ar ? 'تأكيد تعطيل كود الخصم' : 'Disable this discount?'}</h2>
          <p className="text-sm">{ar ? 'لن يعود الكود قابلاً للاستخدام.' : 'The code will no longer be valid.'}</p>
          <div className="flex justify-end gap-2">
            <button onClick={() => setDisableId(null)} className="rounded-lg border px-3 py-2">
              {ar ? 'إلغاء' : 'Cancel'}
            </button>
            <button disabled={disabling} onClick={() => void confirmDisable()}
              className="rounded-lg bg-destructive px-3 py-2 text-destructive-foreground disabled:opacity-50">
              {ar ? 'تأكيد التعطيل' : 'Confirm disable'}
            </button>
          </div>
        </div>
      </div>}
    </main>
  );
}
