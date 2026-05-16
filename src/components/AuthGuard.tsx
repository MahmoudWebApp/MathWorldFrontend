// components/AuthGuard.tsx (ملف جديد)
'use client';

import { useSelector } from 'react-redux';
import { RootState } from '@/store';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoading } = useSelector((state: RootState) => state.auth);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return <>{children}</>;
}