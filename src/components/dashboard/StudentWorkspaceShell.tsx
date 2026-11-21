'use client';

import { usePathname } from '@/i18n/routing';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { useGetStudentSubscriptionQuery } from '@/store/api/categoriesApi';
import { StudentWorkspaceNavigation } from './StudentWorkspaceNavigation';

export function StudentWorkspaceShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStudent = useSelector((state: RootState) => state.auth.isAuthenticated && state.auth.user?.Role === 'Student');
  const learnerRoute = pathname === '/dashboard' || pathname.startsWith('/dashboard/') || pathname === '/learning-stage';
  const { data: subscription } = useGetStudentSubscriptionQuery(undefined, { skip: !isStudent || !learnerRoute });
  if (!isStudent || !learnerRoute) return <>{children}</>;

  return (
    <div className="mx-auto flex w-full max-w-[1600px] items-start">
      <aside className="sticky top-16 hidden h-[calc(100dvh-4rem)] w-64 shrink-0 overflow-y-auto border-e border-border/70 bg-card/55 px-3 py-6 lg:block">
        <StudentWorkspaceNavigation isPremium={subscription?.IsPremium === true} />
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
