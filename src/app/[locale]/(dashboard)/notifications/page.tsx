'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { Link } from '@/i18n/routing';
import { BellRing, CheckCheck, ChevronLeft, ChevronRight, LoaderCircle } from 'lucide-react';
import {
  type InboxNotification,
  useGetInboxPageQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} from '@/store/api/notificationsApi';

const PAGE_SIZE = 30;

function safeAppPath(path: string | null): path is string {
  // Do not navigate to third-party URLs or ambiguous encoded/local redirects.
  return !!path && path.startsWith('/') && !path.startsWith('//') &&
    !path.includes('\\') && !path.includes('://') &&
    !/[?#%\x00-\x1f]/.test(path);
}

export default function NotificationsPage() {
  const locale = useLocale();
  const ar = locale === 'ar';
  const role = useSelector((state: RootState) => state.auth.user?.Role);
  const backPath = role === 'Admin' ? '/admin' : '/dashboard';
  const [skip, setSkip] = useState(0);
  const [actionError, setActionError] = useState('');
  const { currentData: inbox, isLoading, isFetching, isError, refetch } =
    useGetInboxPageQuery({ skip, take: PAGE_SIZE }, {
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
    });
  const [markRead, { isLoading: markingRead }] = useMarkNotificationReadMutation();
  const [markAll, { isLoading: markingAll }] = useMarkAllNotificationsReadMutation();

  const openNotice = async (notice: InboxNotification) => {
    if (markingRead) return;
    setActionError('');
    if (!notice.ReadAtUtc) {
      try {
        await markRead(notice.Id).unwrap();
      } catch {
        setActionError(ar ? 'تعذر تعليم الإشعار كمقروء، حاول مجدداً.' : 'Could not mark this notification as read. Try again.');
        return;
      }
    }
    if (safeAppPath(notice.TargetPath)) {
      window.location.assign(`/${locale}${notice.TargetPath}`);
    }
  };

  const markAllRead = async () => {
    setActionError('');
    try {
      await markAll().unwrap();
    } catch {
      setActionError(ar ? 'تعذر تعليم جميع الإشعارات كمقروءة.' : 'Could not mark all notifications as read.');
    }
  };

  const start = Math.min(skip + 1, inbox?.TotalCount ?? 0);
  const end = Math.min(skip + (inbox?.Items.length ?? 0), inbox?.TotalCount ?? 0);

  return (
    <main className="container mx-auto max-w-4xl space-y-6 px-4 py-8">
      <Link href={backPath} className="text-sm font-semibold text-primary hover:underline">
        {ar ? (role === 'Admin' ? 'العودة لإدارة المنصة' : 'العودة للوحة التحكم') : (role === 'Admin' ? 'Back to admin' : 'Back to dashboard')}
      </Link>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="flex items-center gap-3 text-2xl font-bold sm:text-3xl">
            <BellRing className="h-7 w-7 text-primary" aria-hidden="true" />
            {ar ? 'كل الإشعارات' : 'All notifications'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {ar ? 'إشعارات آخر 30 يوماً، من الأحدث إلى الأقدم.' : 'Notifications from the last 30 days, newest first.'}
          </p>
        </div>
        {inbox && inbox.UnreadCount > 0 && (
          <button type="button" disabled={markingAll || isFetching}
            onClick={() => void markAllRead()}
            className="inline-flex items-center gap-2 rounded-xl border border-primary/30 px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary/5 disabled:opacity-50">
            <CheckCheck className="h-4 w-4" aria-hidden="true" />
            {markingAll ? (ar ? 'جارٍ التحديث…' : 'Updating…') : (ar ? 'تعليم الكل كمقروء' : 'Mark all as read')}
          </button>
        )}
      </div>
      {actionError && <p role="alert" className="rounded-xl border border-destructive/30 p-4 text-sm text-destructive">{actionError}</p>}
      <section className="overflow-hidden rounded-2xl border border-border bg-card" aria-label={ar ? 'قائمة الإشعارات' : 'Notifications list'}>
        {isLoading || (isFetching && !inbox) ? (
          <div role="status" className="flex items-center justify-center gap-3 px-4 py-20 text-muted-foreground">
            <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" />
            {ar ? 'جارٍ تحميل الإشعارات…' : 'Loading notifications…'}
          </div>
        ) : isError || !inbox ? (
          <div role="alert" className="space-y-4 px-4 py-16 text-center">
            <p className="text-destructive">{ar ? 'تعذر تحميل الإشعارات.' : 'Could not load notifications.'}</p>
            <button type="button" onClick={() => void refetch()} className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
              {ar ? 'إعادة المحاولة' : 'Retry'}
            </button>
          </div>
        ) : inbox.Items.length === 0 ? (
          <div className="px-4 py-16 text-center text-muted-foreground">
            {ar ? 'لا توجد إشعارات في هذه الصفحة.' : 'No notifications on this page.'}
          </div>
        ) : (
          <div aria-busy={isFetching || markingRead}>
            {inbox.Items.map(notice => (
              <button type="button" key={notice.Id}
                disabled={markingRead}
                onClick={() => void openNotice(notice)}
                className={`block w-full border-b border-border/70 px-4 py-4 text-start transition-colors last:border-0 hover:bg-muted/50 disabled:opacity-60 sm:px-6 ${
                  !notice.ReadAtUtc ? 'bg-primary/5' : ''
                }`}>
                <span className="flex items-start justify-between gap-3">
                  <span className="min-w-0 break-words text-sm font-bold sm:text-base">
                    {ar ? notice.TitleAr : notice.TitleEn}
                  </span>
                  {!notice.ReadAtUtc && <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" aria-label={ar ? 'غير مقروء' : 'Unread'} />}
                </span>
                <span className="mt-2 block whitespace-pre-wrap break-words text-sm leading-relaxed text-muted-foreground">
                  {ar ? notice.BodyAr : notice.BodyEn}
                </span>
                <time className="mt-3 block text-xs text-muted-foreground" dateTime={notice.CreatedAtUtc}>
                  {new Intl.DateTimeFormat(ar ? 'ar' : 'en', { dateStyle: 'medium' }).format(new Date(notice.CreatedAtUtc))}
                </time>
              </button>
            ))}
          </div>
        )}
      </section>
      {inbox && !isError && (
        <nav aria-label={ar ? 'صفحات الإشعارات' : 'Notification pages'}
          className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <p className="text-muted-foreground" aria-live="polite">
            {ar ? `عرض ${start}–${end} من ${inbox.TotalCount} إشعاراً` : `Showing ${start}–${end} of ${inbox.TotalCount} notifications`}
            {' · '}{ar ? `غير مقروء: ${inbox.UnreadCount}` : `Unread: ${inbox.UnreadCount}`}
          </p>
          <div className="flex gap-2">
            <button type="button" disabled={isFetching || skip === 0} onClick={() => setSkip(s => Math.max(0, s - PAGE_SIZE))}
              className="inline-flex items-center gap-1 rounded-xl border border-border px-3 py-2 font-semibold disabled:opacity-40">
              {ar ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              {ar ? 'السابق' : 'Previous'}
            </button>
            <button type="button" disabled={isFetching || !inbox.HasMore || skip + PAGE_SIZE > 10000}
              onClick={() => setSkip(s => s + PAGE_SIZE)}
              className="inline-flex items-center gap-1 rounded-xl border border-border px-3 py-2 font-semibold disabled:opacity-40">
              {ar ? 'التالي' : 'Next'}
              {ar ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          </div>
        </nav>
      )}
      <p className="text-center text-xs text-muted-foreground">
        {ar ? 'نهاية سجل إشعارات آخر 30 يوماً' : '30-day notification history'}
      </p>
    </main>
  );
}
