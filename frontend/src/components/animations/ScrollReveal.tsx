"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  stagger?: number;
  direction?: "up" | "left" | "right";
}

export default function ScrollReveal({
  children,
  className,
  delay = 0,
  stagger = 0,
  direction = "up",
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current || !ref.current) return;
    initialized.current = true;

    async function setup() {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      const el = ref.current;
      if (!el) return;

      const fromVars: Record<string, number | string> = { opacity: 0 };
      if (direction === "up") fromVars.y = 40;
      if (direction === "left") fromVars.x = -40;
      if (direction === "right") fromVars.x = 40;

      const targets = stagger > 0 ? el.children : el;

      gsap.fromTo(targets, fromVars, {
        opacity: 1,
        y: 0,
        x: 0,
        duration: 0.7,
        delay,
        stagger: stagger > 0 ? stagger : undefined,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });
    }

    setup();
  }, [delay, stagger, direction]);

  return (
    <div ref={ref} className={cn("opacity-0", className)}>
      {children}
    </div>
  );
}
