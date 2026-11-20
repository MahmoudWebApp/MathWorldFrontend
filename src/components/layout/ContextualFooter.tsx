"use client";

import { usePathname } from "@/i18n/routing";
import { Footer } from "@/components/layout/Footer";

/** The public website has a marketing footer; workspaces stay task-focused. */
export function ContextualFooter() {
  const pathname = usePathname();
  const workspace = /^\/(dashboard|admin|learning-stage|journey|social-accounts)(\/|$)/.test(pathname);
  return workspace ? null : <Footer />;
}
