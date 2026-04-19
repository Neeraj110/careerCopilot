"use client";

import { useEffect, useRef } from "react";

interface HeroAnimationProps {
  children: React.ReactNode;
}

export default function HeroAnimation({ children }: HeroAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current || !containerRef.current) return;
    initialized.current = true;

    async function animate() {
      const { gsap } = await import("gsap");

      const container = containerRef.current;
      if (!container) return;

      const badge = container.querySelector("[data-hero-badge]");
      const heading = container.querySelector("[data-hero-heading]");
      const subtext = container.querySelector("[data-hero-subtext]");
      const buttons = container.querySelector("[data-hero-buttons]");
      const preview = container.querySelector("[data-hero-preview]");

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        badge,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6 }
      )
        .fromTo(
          heading,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.8 },
          "-=0.3"
        )
        .fromTo(
          subtext,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.6 },
          "-=0.4"
        )
        .fromTo(
          buttons,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5 },
          "-=0.3"
        )
        .fromTo(
          preview,
          { opacity: 0, y: 60, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 1 },
          "-=0.3"
        );
    }

    animate();
  }, []);

  return <div ref={containerRef}>{children}</div>;
}
