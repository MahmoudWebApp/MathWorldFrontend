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
  // Category browsing is a catalog flow; keep the footer on both public and student category pages.
  const catalog = pathname === '/stages' || pathname.startsWith('/stages/') || pathname === '/dashboard/categories' || pathname.startsWith('/dashboard/categories/');
  return !catalog && (workspace || learnerFlow) ? null : <Footer />;
}
