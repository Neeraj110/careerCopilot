"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function BackgroundBeams({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
    >
      <svg
        className="absolute h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="beam-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(37, 99, 235, 0.05)" />
            <stop offset="50%" stopColor="rgba(37, 99, 235, 0.02)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
        {[...Array(6)].map((_, i) => (
          <motion.line
            key={i}
            x1={`${10 + i * 15}%`}
            y1="-10%"
            x2={`${30 + i * 10}%`}
            y2="110%"
            stroke="url(#beam-gradient)"
            strokeWidth="1"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: 1,
              opacity: [0, 0.3, 0],
            }}
            transition={{
              duration: 4 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.8,
              ease: "easeInOut",
            }}
          />
        ))}
      </svg>
      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />
    </div>
  );
}
