"use client";

import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6", className)}>
      <div>
        <h2 className="font-display text-2xl font-semibold tracking-tight text-ink">
          {title}
        </h2>
        {description && (
          <p className="text-sm text-ink-muted mt-1">{description}</p>
        )}
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  );
}
