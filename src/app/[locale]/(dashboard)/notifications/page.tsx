'use client';
import { WorkspacePageHeader } from '@/components/ui/WorkspacePageHeader';
import { ManagedNotificationList } from '@/components/layout/ManagedNotificationList';
import { useLocale } from 'next-intl';
import { BellRing } from 'lucide-react';

export default function NotificationsPage(){
  const ar=useLocale()==='ar';
  return <main className="container mx-auto max-w-4xl space-y-6 px-4 py-8">
    <WorkspacePageHeader title={ar?'الإشعارات':'Notifications'} icon={BellRing}/>
    <div className="overflow-hidden rounded-2xl border border-border bg-card"><ManagedNotificationList/></div>
    <p className="text-center text-xs text-muted-foreground">{ar?'سجل إشعارات آخر 30 يوماً':'30-day notification history'}</p>
  </main>;
}
