// components/ui/Breadcrumbs.tsx
"use client";

import { Link } from "@/i18n/routing";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center text-sm font-medium text-muted-foreground", className)}>
      <ol className="flex items-center space-x-2 rtl:space-x-reverse">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center">
              {item.href ? (
                <Link
                  href={item.href}
                  className="flex items-center gap-1.5 hover:text-primary transition-colors duration-200"
                >
                  {index === 0 && <Home className="h-4 w-4 mb-0.5" />}
                  {item.label}
                </Link>
              ) : (
                <span className="text-foreground font-bold">{item.label}</span>
              )}

              {!isLast && (
                <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground/40 rtl:rotate-180 shrink-0" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}