"use client";

import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useUiStore } from "@/lib/store/ui";

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

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
      },
    },
  }));

  const { theme, density, initialize } = useUiStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    html.classList.remove("theme-dark", "theme-light", "density-compact", "density-comfortable", "dark");
    body.classList.remove("theme-dark", "theme-light", "density-compact", "density-comfortable");

    const themeClass = theme === "light" ? "theme-light" : "theme-dark";
    const densityClass = density === "compact" ? "density-compact" : "density-comfortable";

    html.classList.add(themeClass, densityClass);
    body.classList.add(themeClass, densityClass);
    
    if (theme === "dark") {
      html.classList.add("dark");
    }
  }, [theme, density]);

  return (
    <QueryClientProvider client={queryClient}>
      <GsapProvider>
        {children}
      </GsapProvider>
    </QueryClientProvider>
  );
}
