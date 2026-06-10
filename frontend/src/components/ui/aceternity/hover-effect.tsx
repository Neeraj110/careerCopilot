"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import type { ReactNode } from "react";

interface HoverEffectItem {
  title: string;
  description: string;
  icon: ReactNode;
  link?: string;
}

export function HoverEffect({
  items,
  className,
}: {
  items: HoverEffectItem[];
  className?: string;
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {items.map((item, idx) => (
        <div
          key={idx}
          className="group relative block h-full w-full p-2"
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence>
            {hoveredIndex === idx && (
              <motion.span
                className="absolute inset-0 block h-full w-full rounded-2xl bg-primary/5"
                layoutId="hoverBackground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.15 } }}
                exit={{
                  opacity: 0,
                  transition: { duration: 0.15, delay: 0.1 },
                }}
              />
            )}
          </AnimatePresence>
          <div className="relative z-10 h-full overflow-hidden rounded-xl border border-border bg-card p-6 transition-colors group-hover:border-border-hover">
            <div className="relative z-10">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                {item.icon}
              </div>
              <h4 className="mb-2 font-heading text-lg font-semibold text-foreground">
                {item.title}
              </h4>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
