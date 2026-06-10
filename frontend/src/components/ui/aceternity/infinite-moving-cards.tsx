"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

export function InfiniteMovingCards({
  items,
  direction = "left",
  speed = "normal",
  pauseOnHover = true,
  className,
}: {
  items: {
    quote: string;
    name: string;
    title: string;
  }[];
  direction?: "left" | "right";
  speed?: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLUListElement>(null);
  const [start, setStart] = useState(false);

  useEffect(() => {
    if (containerRef.current && scrollerRef.current) {
      const scrollerContent = Array.from(scrollerRef.current.children);

      scrollerContent.forEach((item) => {
        const duplicatedItem = item.cloneNode(true);
        if (scrollerRef.current) {
          scrollerRef.current.appendChild(duplicatedItem);
        }
      });

      const directionValue = direction === "left" ? "forwards" : "reverse";
      containerRef.current.style.setProperty(
        "--animation-direction",
        directionValue,
      );

      const speedValue =
        speed === "fast" ? "20s" : speed === "normal" ? "40s" : "80s";
      containerRef.current.style.setProperty("--animation-duration", speedValue);

      setStart(true);
    }
  }, [direction, speed]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "scroller relative z-20 max-w-7xl overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]",
        className,
      )}
    >
      <ul
        ref={scrollerRef}
        className={cn(
          "flex w-max min-w-full shrink-0 flex-nowrap gap-4 py-4",
          start && "animate-scroll",
          pauseOnHover && "hover:[animation-play-state:paused]",
        )}
        style={
          {
            "--animation-duration": "40s",
            "--animation-direction": "forwards",
            animation: start
              ? "scroll var(--animation-duration) linear infinite var(--animation-direction)"
              : "none",
          } as React.CSSProperties
        }
      >
        {items.map((item, idx) => (
          <li
            className="relative w-[350px] max-w-full shrink-0 rounded-xl border border-border bg-card px-8 py-6 md:w-[450px]"
            key={`${item.name}-${idx}`}
          >
            <blockquote>
              <p className="relative z-20 text-sm leading-relaxed text-muted-foreground">
                &ldquo;{item.quote}&rdquo;
              </p>
              <div className="relative z-20 mt-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {item.name.charAt(0)}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">
                    {item.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {item.title}
                  </span>
                </div>
              </div>
            </blockquote>
          </li>
        ))}
      </ul>
      <style jsx>{`
        @keyframes scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(calc(-50% - 0.5rem));
          }
        }
        .animate-scroll {
          animation: scroll var(--animation-duration) linear infinite
            var(--animation-direction);
        }
      `}</style>
    </div>
  );
}
