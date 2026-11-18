'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { useSelector } from 'react-redux';
import { Bell, CheckCheck, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { Link } from '@/i18n/routing';
import type { RootState } from '@/store';
import {
  useListNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from '@/store/api/notificationsApi';

export default function NotificationsPage() {
  const ar = useLocale() === 'ar';
  const user = useSelector((state: RootState) => state.auth.user);
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching, isError, refetch } = useListNotificationsQuery(
    { page, pageSize: 20, locale: ar ? 'ar' : 'en' },
    { skip: user?.Role !== 'Student', refetchOnMountOrArgChange: true },
  );
  const [markRead] = useMarkNotificationReadMutation();
  const [markAll, { isLoading: markingAll }] = useMarkAllNotificationsReadMutation();

  return (
    <main className="container mx-auto max-w-3xl space-y-6 px-4 py-8 md:px-8">
      <Link href="/dashboard" className="text-sm font-semibold text-primary hover:underline">
        {ar ? 'العودة لرحلتي' : 'Back to my journey'}
      </Link>
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-3 text-2xl font-bold">
          <Bell className="h-7 w-7 text-primary" aria-hidden="true" />
          {ar ? 'إشعاراتي' : 'My notifications'}
        </h1>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => void refetch()} disabled={isFetching || user?.Role !== 'Student'}
            className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm disabled:opacity-50">
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} aria-hidden="true" />
            {ar ? 'تحديث' : 'Refresh'}
          </button>
          <button type="button" onClick={() => void markAll()} disabled={markingAll || !data?.UnreadCount}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">
            <CheckCheck className="h-4 w-4" aria-hidden="true" />
            {ar ? 'تحديد الكل كمقروء' : 'Mark all as read'}
          </button>
        </div>
      </header>

      {user?.Role !== 'Student' ? (
        <section className="math-card rounded-2xl border border-border p-6">
          {ar ? 'سجّل دخولك كطالب لعرض إشعاراتك.' : 'Sign in as a learner to see notifications.'}
        </section>
      ) : (
        <>
          {data && <p className="text-sm text-muted-foreground">
            {ar ? `عدد الإشعارات: ${data.Total}، غير المقروء: ${data.UnreadCount}`
              : `Notifications: ${data.Total}; unread: ${data.UnreadCount}`}
          </p>}
          {isLoading && !data && <p role="status" className="math-card rounded-2xl border border-border p-6 text-center text-muted-foreground">
            {ar ? 'جارٍ تحميل الإشعارات...' : 'Loading notifications...'}
          </p>}
          {isError && <div role="alert" className="math-card rounded-2xl border border-destructive/30 p-5">
            <p>{ar ? 'تعذر تحميل الإشعارات.' : 'Could not load notifications.'}</p>
            <button type="button" onClick={() => void refetch()} className="mt-3 font-semibold text-primary underline">
              {ar ? 'إعادة المحاولة' : 'Retry'}
            </button>
          </div>}
          {data && data.Notifications.length === 0 && <div className="math-card rounded-2xl border border-border p-8 text-center">
            <Bell className="mx-auto mb-3 h-10 w-10 text-primary" aria-hidden />
            <p className="font-semibold">{ar ? 'ما عندك إشعارات حالياً' : 'No notifications yet'}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {ar ? 'رح تظهر إشعاراتك هون لما توصلك أخبار جديدة.' : 'Updates will appear here when available.'}
            </p>
          </div>}
          <div className="space-y-3">
            {data?.Notifications.map(item => {
              const actionPath = item.ActionPath?.startsWith('/') && !item.ActionPath.startsWith('//')
                ? item.ActionPath : null;
              return (
                <article key={item.Id} className={`math-card rounded-2xl border p-5 ${item.IsRead
                  ? 'border-border' : 'border-primary/30 bg-primary/5'}`}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h2 className="font-bold">{item.Title}</h2>
                      <p className="mt-2 whitespace-pre-wrap break-words text-sm text-muted-foreground">{item.Body}</p>
                      <time dateTime={item.CreatedAt} className="mt-3 block text-xs text-muted-foreground">
                        {new Intl.DateTimeFormat(ar ? 'ar' : 'en', {
                          dateStyle: 'medium', timeStyle: 'short',
                        }).format(new Date(item.CreatedAt))}
                      </time>
                    </div>
                    {!item.IsRead && <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                      {ar ? 'جديد' : 'New'}
                    </span>}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold text-primary">
                    {!item.IsRead && <button type="button" onClick={() => void markRead(item.Id)}>
                      {ar ? 'تحديد كمقروء' : 'Mark as read'}
                    </button>}
                    {actionPath && <Link href={actionPath} onClick={() => void markRead(item.Id)}>
                      {ar ? 'فتح التفاصيل' : 'View details'}
                    </Link>}
                  </div>
                </article>
              );
            })}
          </div>
          {data && <nav className="flex items-center justify-center gap-4" aria-label={ar ? 'صفحات الإشعارات' : 'Notification pages'}>
            <button type="button" disabled={page <= 1} onClick={() => setPage(v => Math.max(1, v - 1))}
              className="rounded-xl border border-border px-3 py-2 text-sm disabled:opacity-40">
              <ChevronLeft className="inline h-4 w-4 rtl:rotate-180" aria-hidden="true" />
              {ar ? 'السابق' : 'Previous'}
            </button>
            <span className="text-sm">{page}</span>
            <button type="button" disabled={!data.HasMore} onClick={() => setPage(v => v + 1)}
              className="rounded-xl border border-border px-3 py-2 text-sm disabled:opacity-40">
              {ar ? 'التالي' : 'Next'}
              <ChevronRight className="inline h-4 w-4 rtl:rotate-180" aria-hidden="true" />
            </button>
          </nav>}
        </>
      )}
    </main>
  );
}
