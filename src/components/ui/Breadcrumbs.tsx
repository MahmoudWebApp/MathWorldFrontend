// components/ui/Breadcrumbs.tsx
"use client";

import { Link } from "@/i18n/routing";
import { useLocale } from "next-intl";
import { Home } from "lucide-react";
import { DirectionalChevron } from "@/components/ui/DirectionalNavigation";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  truncate?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  surface?: boolean;
}

export function Breadcrumbs({
  items,
  className,
  surface = false,
}: BreadcrumbsProps) {
  const ar=useLocale()==="ar";
  return (
    <nav
      aria-label={ar?"مسار التنقل":"Breadcrumb"}
      className={cn(
        "min-w-0 text-xs font-medium text-muted-foreground sm:text-sm",
        surface &&
          "overflow-hidden rounded-lg border border-border/60 bg-card/60 px-3 py-2",
        className,
      )}
    >
      <ol className="flex w-full min-w-0 items-center gap-1 overflow-hidden whitespace-nowrap sm:gap-1.5">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const shouldTruncate = item.truncate || isLast;
          const labelClassName = cn(
            "block min-w-0 text-start [unicode-bidi:plaintext]",
            shouldTruncate &&
              "max-w-[38vw] truncate sm:max-w-[20rem] lg:max-w-[34rem]",
          );

          return (
            <li
              key={`${item.label}-${index}`}
              className={cn(
                index < items.length - 2 ? "hidden sm:flex" : "flex",
                "min-w-0 items-center",
                isLast ? "flex-1 overflow-hidden" : "max-w-[40vw] shrink-0 overflow-hidden sm:max-w-none",
              )}
            >
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="flex min-w-0 items-center gap-1.5 transition-colors duration-200 hover:text-primary"
                  title={item.label}
                  aria-label={item.label}
                >
                  {index === 0 && <Home className="order-last h-4 w-4 shrink-0" aria-hidden="true" />}
                  <span dir="auto" className={labelClassName}>{item.label}</span>
                </Link>
              ) : (
                <span
                  dir="auto"
                  aria-current={isLast?"page":undefined}
                  className={cn(labelClassName, "font-bold text-foreground")}
                  title={item.label}
                  aria-label={item.label}
                >
                  {item.label}
                </span>
              )}

              {!isLast && (
                <DirectionalChevron direction="forward" className="mx-1 h-4 w-4 shrink-0 text-muted-foreground/45 sm:mx-1.5" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
