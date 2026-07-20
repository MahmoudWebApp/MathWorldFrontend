// components/ui/Breadcrumbs.tsx
"use client";

import { Link } from "@/i18n/routing";
import { ChevronRight, Home } from "lucide-react";
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
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "min-w-0 text-sm font-medium text-muted-foreground",
        surface &&
          "overflow-hidden rounded-xl border border-border/80 bg-card/75 px-3 py-2.5 shadow-sm backdrop-blur-sm sm:px-4",
        className,
      )}
    >
      <ol className="flex min-w-0 items-center gap-1 overflow-hidden whitespace-nowrap sm:gap-1.5">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const shouldTruncate = item.truncate || isLast;
          const labelClassName = cn(
            "block min-w-0",
            shouldTruncate &&
              "max-w-[42vw] truncate sm:max-w-[20rem] lg:max-w-[34rem]",
          );

          return (
            <li
              key={`${item.label}-${index}`}
              className={cn(
                "flex min-w-0 items-center",
                isLast && "flex-1 overflow-hidden",
              )}
            >
              {item.href ? (
                <Link
                  href={item.href}
                  className="flex min-w-0 items-center gap-1.5 transition-colors duration-200 hover:text-primary"
                  title={item.label}
                  aria-label={item.label}
                >
                  {index === 0 && <Home className="h-4 w-4 shrink-0" />}
                  <span className={labelClassName}>{item.label}</span>
                </Link>
              ) : (
                <span
                  className={cn(labelClassName, "font-bold text-foreground")}
                  title={item.label}
                  aria-label={item.label}
                >
                  {item.label}
                </span>
              )}

              {!isLast && (
                <ChevronRight className="mx-1 h-4 w-4 shrink-0 text-muted-foreground/45 rtl:rotate-180 sm:mx-1.5" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
