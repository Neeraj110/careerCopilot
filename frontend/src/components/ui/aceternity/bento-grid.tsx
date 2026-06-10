"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface BentoGridProps {
  className?: string;
  children: ReactNode;
}

export function BentoGrid({ className, children }: BentoGridProps) {
  return (
    <div
      className={cn(
        "mx-auto grid max-w-7xl grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface BentoGridItemProps {
  className?: string;
  title: string;
  description: string;
  icon: ReactNode;
  header?: ReactNode;
}

export function BentoGridItem({
  className,
  title,
  description,
  icon,
  header,
}: BentoGridItemProps) {
  return (
    <motion.div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-colors hover:border-border-hover hover:bg-card-hover",
        className,
      )}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -2 }}
    >
      {/* Subtle gradient on hover */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

      {header && <div className="mb-4">{header}</div>}

      <div className="relative z-10">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <h3 className="mb-2 font-heading text-lg font-semibold text-foreground">
          {title}
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </motion.div>
  );
}
