"use client";

import { usePathname } from "@/i18n/routing";
import { Footer } from "@/components/layout/Footer";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";

/** The public website has a marketing footer; workspaces stay task-focused. */
export function ContextualFooter() {
  const pathname = usePathname();
  const role = useSelector((state: RootState) => state.auth.user?.Role);
  const workspace = ['/dashboard', '/admin', '/supervisor', '/learning-stage', '/journey', '/social-accounts']
    .some(base => pathname === base || pathname.startsWith(base + '/'));
  const learnerFlow = role === 'Student' && (
    pathname === '/notifications' || pathname.startsWith('/problems') || pathname.startsWith('/stages/')
  );
  return workspace || learnerFlow ? null : <Footer />;
}
