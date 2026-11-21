import type { Metadata } from 'next';
import { StudentWorkspaceShell } from '@/components/dashboard/StudentWorkspaceShell';

export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default function PrivateWorkspaceLayout({ children }: { children: React.ReactNode }) {
  return <StudentWorkspaceShell>{children}</StudentWorkspaceShell>;
}
