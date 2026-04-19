"use client";

// ── Minimal Provider: only GSAP ScrollTrigger registration ──
// No Redux store, no context providers needed.

import { useEffect } from "react";

export function GsapProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Register GSAP ScrollTrigger lazily
    async function registerGsap() {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);
    }
    registerGsap();
  }, []);

  return <>{children}</>;
}
