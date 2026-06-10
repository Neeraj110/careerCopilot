"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SpotlightProps {
  className?: string;
  fill?: string;
}

export function Spotlight({ className, fill = "white" }: SpotlightProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    setOpacity(1);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      className={cn(
        "pointer-events-auto relative overflow-hidden",
        className,
      )}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px z-0"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${fill}06, transparent 40%)`,
        }}
        animate={{ opacity }}
        transition={{ duration: 0.5 }}
      />
    </div>
  );
}

export function SpotlightBackground({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute -top-20 left-1/3 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-blue-500/5 blur-[100px]" />
      </div>
      {children}
    </div>
  );
}
