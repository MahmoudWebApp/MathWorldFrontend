'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import {
  useGetAdminPremiumCheckoutSummaryQuery,
  useGetAdminPremiumCheckoutOrdersQuery,
} from '@/store/api/usersApi';

const filters = ['', 'Pending', 'Paid', 'Failed', 'Cancelled', 'Refunded'];

export default function AdminPremiumCheckoutPage() {
  const ar = useLocale() === 'ar';
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const summary = useGetAdminPremiumCheckoutSummaryQuery();
  const orders = useGetAdminPremiumCheckoutOrdersQuery({ Page: page, Status: status || undefined });
  const counts = summary.data ? [
    { name: ar ? 'مجموع الطلبات' : 'All orders', value: summary.data.TotalOrders },
    { name: ar ? 'طلبات معلّقة' : 'Pending', value: summary.data.Pending },
    { name: ar ? 'مدفوعة' : 'Paid', value: summary.data.Paid },
    { name: ar ? 'ملغاة' : 'Cancelled', value: summary.data.Cancelled },
    { name: ar ? 'مستردة' : 'Refunded', value: summary.data.Refunded },
    { name: ar ? 'معلّقة أكثر من 24 ساعة' : 'Pending over 24h', value: summary.data.PendingOlderThan24Hours },
    { name: ar ? 'المبالغ المدفوعة (USD)' : 'Paid revenue (USD)', value: summary.data.PaidAmountUsd.toFixed(2) },
    { name: ar ? 'الخصومات المستخدمة (USD)' : 'Redeemed discounts (USD)', value: summary.data.RedeemedDiscountUsd.toFixed(2) },
  ] : [];
  const states: Record<string, string> = ar
    ? { Pending: 'بانتظار الدفع', Paid: 'مدفوع', Failed: 'فشل', Cancelled: 'ملغى', Refunded: 'مسترد' }
    : { Pending: 'Pending', Paid: 'Paid', Failed: 'Failed', Cancelled: 'Cancelled', Refunded: 'Refunded' };
  const date = (value: string) => {
    const parsed = new Date(value);
    return Number.isFinite(parsed.getTime())
      ? new Intl.DateTimeFormat(ar ? 'ar' : 'en', { dateStyle: 'medium', timeStyle: 'short' }).format(parsed) : '—';
  };

  return (
    <main dir={ar ? 'rtl' : 'ltr'} className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <Link href="/admin" className="text-sm font-semibold text-primary underline">
        {ar ? 'العودة للأدمن' : 'Back to admin'}
      </Link>
      <header className="space-y-2">
        <h1 className="text-3xl font-extrabold">
          {ar ? 'طلبات اشتراك Premium' : 'Premium checkout orders'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {ar ? 'مراجعة الطلبات والخصومات فقط. لا يمكن تأكيد الدفع أو تفعيل الاشتراك من هنا.'
            : 'Read-only order audit. This page cannot verify payments or activate subscriptions.'}
        </p>
        <Link href="/admin/premium-discounts" className="inline-block text-sm text-primary underline">
          {ar ? 'إدارة أكواد الخصم' : 'Manage discounts'}
        </Link>
      </header>
      <section className="space-y-3">
        <h2 className="text-lg font-bold">{ar ? 'ملخص العمليات' : 'Payment overview'}</h2>
        {summary.isLoading && <p role="status">{ar ? 'جارٍ التحميل…' : 'Loading…'}</p>}
        {summary.isError && <p role="alert" className="text-destructive">
          {ar ? 'تعذّر تحميل الملخص.' : 'Could not load summary.'}
        </p>}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {counts.map(item => (
            <div key={item.name} className="rounded-xl border bg-card p-4">
              <p className="text-sm text-muted-foreground">{item.name}</p>
              <p className="mt-2 text-2xl font-extrabold tabular-nums">{item.value}</p>
            </div>
          ))}
        </div>
        {summary.data?.PaymentAvailable === false && <p className="text-xs text-muted-foreground">
          {ar ? 'الدفع الإلكتروني غير موصول حالياً.' : 'Online payment is not connected yet.'}
        </p>}
      </section>
      <section className="space-y-4 rounded-2xl border bg-card p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold">{ar ? 'سجل الطلبات' : 'Order history'}</h2>
          <button type="button" onClick={() => { void orders.refetch(); void summary.refetch(); }}
            className="rounded-lg border px-3 py-2 text-sm font-semibold text-primary">
            {ar ? 'تحديث' : 'Refresh'}
          </button>
        </div>
        <label className="block space-y-1">
          <span className="text-sm font-semibold">{ar ? 'الحالة' : 'Status'}</span>
          <select value={status} onChange={event => { setStatus(event.target.value); setPage(1); }}
            className="w-full rounded-xl border bg-background px-3 py-2 sm:max-w-xs">
            {filters.map(filter => <option key={filter} value={filter}>
              {filter ? states[filter] : (ar ? 'كل الحالات' : 'All statuses')}
            </option>)}
          </select>
        </label>
        {orders.isLoading ? <p role="status">{ar ? 'جارٍ التحميل…' : 'Loading…'}</p>
          : orders.isError ? <p role="alert" className="text-destructive">
            {ar ? 'تعذّر تحميل الطلبات.' : 'Could not load orders.'}
          </p>
          : !orders.data?.Orders.length ? <p className="text-muted-foreground">
            {ar ? 'ما في طلبات ضمن هالتصفية.' : 'No orders match this filter.'}
          </p> : <div className="space-y-3">
            {orders.data.Orders.map(order => <article key={order.Id}
              className="flex flex-wrap items-start justify-between gap-3 rounded-xl border p-3">
              <div className="min-w-0 space-y-1">
                <p dir="ltr" className="break-all text-sm font-bold">{order.OrderReference}</p>
                <p className="text-xs text-muted-foreground">
                  {ar ? 'الطالب' : 'Student'} #{order.StudentId} · {date(order.CreatedAtUtc)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {ar ? 'كود الخصم' : 'Discount ID'}: {order.DiscountCodeId ?? '—'}
                  {' · '}{ar ? 'الموفر' : 'Savings'}: USD {order.DiscountUsd.toFixed(2)}
                </p>
              </div>
              <div className="text-end">
                <p className="font-extrabold tabular-nums">USD {order.TotalUsd.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">{states[order.Status] ?? order.Status}</p>
              </div>
            </article>)}
          </div>}
        <div className="flex items-center justify-between border-t pt-3 text-sm">
          <button type="button" disabled={page <= 1 || orders.isLoading}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="font-semibold text-primary disabled:opacity-40">
            {ar ? 'السابق' : 'Previous'}
          </button>
          <span>{page} / {Math.max(1, Math.ceil((orders.data?.Total ?? 0) / 20))}</span>
          <button type="button" disabled={!orders.data || orders.isLoading || page * 20 >= orders.data.Total}
            onClick={() => setPage(p => p + 1)}
            className="font-semibold text-primary disabled:opacity-40">
            {ar ? 'التالي' : 'Next'}
          </button>
        </div>
      </section>
    </main>
  );
}
