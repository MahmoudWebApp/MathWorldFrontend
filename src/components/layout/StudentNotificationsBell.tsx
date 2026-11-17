'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale } from 'next-intl';
import { Bell, CheckCheck, ChevronRight, Loader2 } from 'lucide-react';

import { Link } from '@/i18n/routing';
import {
  useListNotificationsQuery,
  useNotificationUnreadCountQuery,
  useMarkNotificationReadMutation,
} from '@/store/api/notificationsApi';

export function StudentNotificationsBell() {
  const ar = useLocale() === 'ar';
  const [open, setOpen] = useState(false);
  const { data: count, isError: countError } = useNotificationUnreadCountQuery(
    undefined, { pollingInterval: 60000, refetchOnFocus: true },
  );
  const { data, isLoading, isError, refetch } = useListNotificationsQuery(
    { page: 1, pageSize: 20 },
    { skip: !open, refetchOnMountOrArgChange: true },
  );
  const [markRead] = useMarkNotificationReadMutation();
  const recent = useMemo(() => {
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    return (data?.Notifications ?? [])
      .filter(item => new Date(item.CreatedAt).getTime() >= cutoff)
      .slice(0, 8);
  }, [data?.Notifications]);

  useEffect(() => {
    if (!open) return;
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onEscape);
    return () => document.removeEventListener('keydown', onEscape);
  }, [open]);

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={ar ? 'الإشعارات' : 'Notifications'}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen(value => !value)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-foreground hover:bg-primary/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
      >
        <Bell className="h-5 w-5" aria-hidden="true" />
        {(count?.UnreadCount ?? 0) > 0 && (
          <span className="absolute end-1 top-1 h-2.5 w-2.5 rounded-full bg-destructive ring-2 ring-background" />
        )}
        <span className="sr-only">
          {countError
            ? ar ? 'تعذر جلب عدد الإشعارات' : 'Unable to load unread count'
            : ar ? `${count?.UnreadCount ?? 0} إشعار غير مقروء`
              : `${count?.UnreadCount ?? 0} unread notifications`}
        </span>
      </button>

      {open && (
        <>
          <button
            type="button"
            tabIndex={-1}
            aria-label={ar ? 'إغلاق الإشعارات' : 'Close notifications'}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-30 cursor-default"
          />
          <section
            role="dialog"
            aria-label={ar ? 'آخر الإشعارات' : 'Recent notifications'}
            className="absolute end-0 top-full z-40 mt-3 w-[min(90vw,360px)] overflow-hidden rounded-2xl border border-border bg-popover text-popover-foreground shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <strong>{ar ? 'إشعارات آخر 30 يوم' : 'Last 30 days'}</strong>
              <span className="text-xs text-muted-foreground">
                {count?.UnreadCount ?? 0} {ar ? 'غير مقروء' : 'unread'}
              </span>
            </div>
            <div className="max-h-[min(65vh,440px)] overflow-y-auto">
              {isLoading && <p role="status" className="p-5 text-center text-sm text-muted-foreground">
                <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" aria-hidden />
                {ar ? 'جارٍ تحميل الإشعارات...' : 'Loading notifications...'}
              </p>}
              {isError && <div role="alert" className="p-5 text-center text-sm">
                <p>{ar ? 'تعذر تحميل الإشعارات.' : 'Unable to load notifications.'}</p>
                <button type="button" onClick={() => void refetch()}
                  className="mt-2 font-semibold text-primary underline">
                  {ar ? 'إعادة المحاولة' : 'Retry'}
                </button>
              </div>}
              {!isLoading && !isError && recent.map(item => {
                const validPath = item.ActionPath?.startsWith('/') &&
                  !item.ActionPath.startsWith('//');
                return (
                  <div key={item.Id} className={`border-b border-border/50 p-3 ${item.IsRead ? '' : 'bg-primary/5'}`}>
                    <div className="flex items-start gap-2">
                      <span aria-hidden className={`mt-2 h-2 w-2 shrink-0 rounded-full ${item.IsRead ? 'bg-transparent' : 'bg-primary'}`} />
                      <div className="min-w-0 flex-1">
                        <strong className="block text-sm">{item.Title}</strong>
                        <p className="mt-1 whitespace-pre-wrap break-words text-xs text-muted-foreground">{item.Body}</p>
                        <p className="mt-2 text-[11px] text-muted-foreground">
                          {new Intl.DateTimeFormat(ar ? 'ar' : 'en', { dateStyle: 'medium' })
                            .format(new Date(item.CreatedAt))}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-3 text-xs font-semibold text-primary">
                          {!item.IsRead && <button type="button"
                            onClick={() => { void markRead(item.Id); }}>
                            <CheckCheck className="me-1 inline h-3.5 w-3.5" aria-hidden />
                            {ar ? 'تحديد كمقروء' : 'Mark as read'}
                          </button>}
                          {validPath && <Link href={item.ActionPath!}
                            onClick={() => { void markRead(item.Id); setOpen(false); }}>
                            {ar ? 'فتح التفاصيل' : 'View details'}
                          </Link>}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {!isLoading && !isError && (
                <p className="p-4 text-center text-xs text-muted-foreground">
                  {recent.length ? ar ? 'وصلت لنهاية الإشعارات الحديثة' : 'End of recent notifications'
                    : ar ? 'ما عندك إشعارات خلال آخر 30 يوم' : 'No notifications in the last 30 days'}
                </p>
              )}
            </div>
            <Link href="/notifications" onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-1 border-t border-border px-4 py-3 text-sm font-semibold text-primary hover:bg-muted">
              {ar ? 'عرض جميع الإشعارات' : 'View all notifications'}
              <ChevronRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
            </Link>
          </section>
        </>
      )}
    </div>
  );
}
