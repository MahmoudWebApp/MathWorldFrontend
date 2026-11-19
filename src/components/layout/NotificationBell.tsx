'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Bell, CheckCheck, ExternalLink, LoaderCircle, X } from 'lucide-react';
import {
  useGetInboxQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  type InboxNotification,
} from '@/store/api/notificationsApi';

export function NotificationBell({ isAuthenticated }: { isAuthenticated: boolean }) {
  const locale = useLocale();
  const ar = locale === 'ar';
  const [portalReady, setPortalReady] = useState(false);
  useEffect(() => setPortalReady(true), []);
  const [open, setOpen] = useState(false);
  const [actionError, setActionError] = useState('');
  const [readingId, setReadingId] = useState<number | null>(null);
  const { data, isLoading, isError, isFetching, refetch } = useGetInboxQuery(undefined, {
    skip: !isAuthenticated,
    pollingInterval: 60000,
    skipPollingIfUnfocused: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
  const [markRead] = useMarkNotificationReadMutation();
  const [markAll, { isLoading: markingAll }] = useMarkAllNotificationsReadMutation();

  useEffect(() => {
    if (!open) return;
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    const priorOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onEscape);
    return () => {
      document.body.style.overflow = priorOverflow;
      document.removeEventListener('keydown', onEscape);
    };
  }, [open]);

  useEffect(() => {
    if (!isAuthenticated) {
      setOpen(false);
      setActionError('');
      setReadingId(null);
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  const unread = data?.UnreadCount ?? 0;
  const formatNoticeDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat(ar ? 'ar' : 'en', { dateStyle: 'medium' }).format(date);
  };
  const readNotice = async (notice: InboxNotification) => {
    setActionError('');
    if (readingId !== null) return;
    if (!notice.ReadAtUtc) {
      setReadingId(notice.Id);
      try { await markRead(notice.Id).unwrap(); }
      catch {
        setActionError(ar ? 'تعذّر تعليم الإشعار كمقروء.' : 'Could not mark notification as read.');
        return;
      } finally {
        setReadingId(null);
      }
    }
    // Only permit same-app absolute paths; do not trust external URLs from API data.
    const path = notice.TargetPath;
    if (path && path.startsWith('/') && !path.startsWith('//') && !path.includes('://') && !/[?#%\\\x00-\x1f]/.test(path)) {
      setOpen(false);
      window.location.assign(`/${locale}${path}`);
    }
  };

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => { setOpen(!open); setActionError(''); if (!open) void refetch(); }}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={unread > 0 ? (ar ? `الإشعارات، ${unread} غير مقروءة` : `Notifications, ${unread} unread`) : (ar ? 'الإشعارات' : 'Notifications')}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <Bell className="h-5 w-5" aria-hidden="true" />
        {unread > 0 && (
          <span className="absolute end-1.5 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-rose-500" aria-hidden="true" />
        )}
      </button>
      {open && portalReady && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-end justify-center sm:items-center sm:p-4"
          dir={ar ? 'rtl' : 'ltr'}>
          <button type="button" className="absolute inset-0 cursor-default bg-black/55"
            aria-label={ar ? 'إغلاق الإشعارات' : 'Close notifications'}
            onClick={() => setOpen(false)} />
          <section
            role="dialog"
            aria-modal="true"
            aria-label={ar ? 'مركز الإشعارات' : 'Notification inbox'}
            className="relative z-10 flex max-h-[min(92dvh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-border bg-popover text-popover-foreground shadow-2xl sm:rounded-2xl"
          >
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border p-4">
            <div className="min-w-0">
              <h2 className="font-bold">{ar ? 'الإشعارات' : 'Notifications'}</h2>
              <p className="text-xs text-muted-foreground">{ar ? 'آخر 30 يوماً' : 'Last 30 days'}</p>
            </div>
            <button type="button" onClick={() => setOpen(false)}
              className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label={ar ? 'إغلاق' : 'Close'}><X className="h-5 w-5" /></button>
          </div>
          <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex shrink-0 items-center justify-end gap-2 border-b border-border/50 px-3 py-1.5">
            {unread > 0 && (
              <button type="button" disabled={markingAll}
                onClick={() => {
                  setActionError('');
                  void markAll().unwrap().catch(() =>
                    setActionError(ar ? 'تعذّر تعليم الإشعارات كمقروءة.' : 'Could not mark all notifications as read.')
                  );
                }}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10 disabled:opacity-50"
              >
                <CheckCheck className="h-4 w-4" aria-hidden="true" />
                {ar ? 'قراءة الكل' : 'Mark all read'}
              </button>
            )}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            {isLoading || (isFetching && !data) ? (
              <div className="flex items-center justify-center gap-2 p-8 text-sm text-muted-foreground">
                <LoaderCircle className="h-4 w-4 animate-spin" />
                {ar ? 'جارٍ التحميل' : 'Loading'}
              </div>
            ) : isError ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                <p>{ar ? 'تعذّر تحميل الإشعارات' : 'Could not load notifications'}</p>
                <button type="button" className="mt-2 font-semibold text-primary" onClick={() => refetch()}>
                  {ar ? 'إعادة المحاولة' : 'Try again'}
                </button>
              </div>
            ) : !data?.Items.length ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                {ar ? 'لا توجد إشعارات خلال آخر 30 يوماً' : 'No notifications in the last 30 days'}
              </div>
            ) : data.Items.map((notice) => (
              <button type="button" key={notice.Id}
                disabled={readingId !== null}
                aria-label={`${ar ? notice.TitleAr : notice.TitleEn}${notice.ReadAtUtc ? '' : (ar ? '، غير مقروء' : ', unread')}`}
                onClick={() => void readNotice(notice)}
                className={`block w-full border-b border-border/60 px-4 py-3 text-start transition-colors last:border-0 hover:bg-muted/60 disabled:cursor-wait disabled:opacity-70 ${notice.ReadAtUtc ? '' : 'bg-primary/5'}`}
              >
                <span className="flex items-start justify-between gap-2">
                  <span className="text-sm font-semibold">{ar ? notice.TitleAr : notice.TitleEn}</span>
                  {!notice.ReadAtUtc && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden="true" />}
                </span>
                <span className="mt-1 block text-sm text-muted-foreground">{ar ? notice.BodyAr : notice.BodyEn}</span>
                {formatNoticeDate(notice.CreatedAtUtc) && (
                  <time className="mt-2 block text-xs text-muted-foreground" dateTime={notice.CreatedAtUtc}>
                    {formatNoticeDate(notice.CreatedAtUtc)}
                  </time>
                )}
              </button>
            ))}
          </div>
          {actionError && (
            <p role="alert" className="border-t border-destructive/20 px-4 py-2 text-sm text-destructive">
              {actionError}
            </p>
          )}
          <div className="shrink-0 border-t border-border p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] text-center">
            <Link href="/notifications" onClick={() => setOpen(false)}
              className="inline-flex min-h-10 items-center justify-center rounded-xl bg-primary/10 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
              {ar ? 'عرض كل الإشعارات' : 'View all notifications'}
              <ExternalLink className="ms-2 h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          </div>
          </section>
        </div>,
        document.body,
      )}
    </div>
  );
}
