"use client";

import { motion } from "framer-motion";

export function OrbitalBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-background">
      {/* Subtle Gradient Meshes */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] opacity-50 mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[150px] opacity-40 mix-blend-screen pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-[100px] opacity-30 mix-blend-screen pointer-events-none" />

      {/* Orbital Rings - highly transparent for dashboard */}
      <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[1200px] aspect-square pointer-events-none opacity-[0.15]">
        <div className="absolute inset-0 m-auto w-[35%] h-[35%] rounded-full border border-blue-500/30" />
        <div className="absolute inset-0 m-auto w-[55%] h-[55%] rounded-full border border-purple-500/20" />
        <div className="absolute inset-0 m-auto w-[75%] h-[75%] rounded-full border border-indigo-500/10" />
        <div className="absolute inset-0 m-auto w-[95%] h-[95%] rounded-full border border-white/5" />
      </div>

      {/* Subtle floating particles/stars could go here if needed, but keeping it clean for dashboard readability */}
    </div>
  );
}
