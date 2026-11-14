'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Bell, CheckCheck, LoaderCircle } from 'lucide-react';
import {
  useGetInboxQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  type InboxNotification,
} from '@/store/api/notificationsApi';

export function NotificationBell({ isAuthenticated }: { isAuthenticated: boolean }) {
  const locale = useLocale();
  const ar = locale === 'ar';
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const { data, isLoading, isError, isFetching, refetch } = useGetInboxQuery(undefined, {
    skip: !isAuthenticated,
    pollingInterval: 60000,
    refetchOnFocus: true,
  });
  const [markRead] = useMarkNotificationReadMutation();
  const [markAll, { isLoading: markingAll }] = useMarkAllNotificationsReadMutation();

  useEffect(() => {
    if (!open) return;
    const onOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onOutside);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('mousedown', onOutside);
      document.removeEventListener('keydown', onEscape);
    };
  }, [open]);

  useEffect(() => {
    if (!isAuthenticated) setOpen(false);
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  const unread = data?.UnreadCount ?? 0;
  const readNotice = async (notice: InboxNotification) => {
    if (!notice.ReadAtUtc) {
      try { await markRead(notice.Id).unwrap(); }
      catch { return; }
    }
    // Only permit same-app absolute paths; do not trust external URLs from API data.
    const path = notice.TargetPath;
    if (path && path.startsWith('/') && !path.startsWith('//') && !path.includes('://') && !path.includes('\\')) {
      setOpen(false);
      window.location.assign(`/${locale}${path}`);
    }
  };

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => { setOpen(!open); if (!open) refetch(); }}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={ar ? 'الإشعارات' : 'Notifications'}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <Bell className="h-5 w-5" aria-hidden="true" />
        {unread > 0 && (
          <span className="absolute end-1.5 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-rose-500" aria-hidden="true" />
        )}
      </button>
      {open && (
        <section
          role="dialog"
          aria-label={ar ? 'مركز الإشعارات' : 'Notification inbox'}
          className="absolute end-0 top-full z-[80] mt-3 w-[min(24rem,calc(100vw-1rem))] overflow-hidden rounded-2xl border border-border bg-popover text-popover-foreground shadow-2xl"
          dir={ar ? 'rtl' : 'ltr'}
        >
          <div className="flex items-center justify-between gap-3 border-b border-border p-4">
            <div>
              <h2 className="font-bold">{ar ? 'الإشعارات' : 'Notifications'}</h2>
              <p className="text-xs text-muted-foreground">{ar ? 'آخر 30 يوماً' : 'Last 30 days'}</p>
            </div>
            {unread > 0 && (
              <button type="button" disabled={markingAll}
                onClick={() => void markAll().unwrap().catch(() => undefined)}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10 disabled:opacity-50"
              >
                <CheckCheck className="h-4 w-4" aria-hidden="true" />
                {ar ? 'قراءة الكل' : 'Mark all read'}
              </button>
            )}
          </div>
          <div className="max-h-[min(60vh,420px)] overflow-y-auto">
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
                {ar ? 'ما عندك إشعارات جديدة خلال آخر 30 يوماً' : 'No notifications in the last 30 days'}
              </div>
            ) : data.Items.map((notice) => (
              <button type="button" key={notice.Id}
                onClick={() => void readNotice(notice)}
                className={`block w-full border-b border-border/60 px-4 py-3 text-start transition-colors last:border-0 hover:bg-muted/60 ${notice.ReadAtUtc ? '' : 'bg-primary/5'}`}
              >
                <span className="flex items-start justify-between gap-2">
                  <span className="text-sm font-semibold">{ar ? notice.TitleAr : notice.TitleEn}</span>
                  {!notice.ReadAtUtc && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden="true" />}
                </span>
                <span className="mt-1 block text-sm text-muted-foreground">{ar ? notice.BodyAr : notice.BodyEn}</span>
                <time className="mt-2 block text-xs text-muted-foreground" dateTime={notice.CreatedAtUtc}>
                  {new Intl.DateTimeFormat(ar ? 'ar' : 'en', { dateStyle: 'medium' }).format(new Date(notice.CreatedAtUtc))}
                </time>
              </button>
            ))}
          </div>
          <div className="border-t border-border p-3 text-center">
            <Link href="/notifications" onClick={() => setOpen(false)}
              className="inline-flex min-h-10 items-center justify-center rounded-xl bg-primary/10 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
              {ar ? 'عرض كل الإشعارات' : 'View all notifications'}
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
