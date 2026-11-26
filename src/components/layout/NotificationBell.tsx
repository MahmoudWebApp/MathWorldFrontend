'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Bell, ExternalLink, X } from 'lucide-react';
import { useGetInboxQuery } from '@/store/api/notificationsApi';
import { ManagedNotificationList } from './ManagedNotificationList';

export function NotificationBell({ isAuthenticated }: { isAuthenticated: boolean }) {
  const locale = useLocale();
  const ar = locale === 'ar';
  const [portalReady, setPortalReady] = useState(false);
  useEffect(() => setPortalReady(true), []);
  const [open, setOpen] = useState(false);
  const { data, refetch } = useGetInboxQuery(undefined, {
    skip: !isAuthenticated,
    pollingInterval: 60000,
    skipPollingIfUnfocused: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  useEffect(() => {
    if (!open) return;
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !document.querySelector('.mw-dialog-content[data-state="open"]')) setOpen(false);
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
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  const unread = data?.UnreadCount ?? 0;

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => { setOpen(!open); if (!open) void refetch(); }}
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
        <div className="fixed inset-0 z-[55] flex items-end justify-center sm:items-center sm:p-4"
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
          <ManagedNotificationList onNavigate={()=>setOpen(false)} />
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
