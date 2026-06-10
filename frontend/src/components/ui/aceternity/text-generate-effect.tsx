"use client";

import { useEffect, useState } from "react";
import { motion, stagger, useAnimate } from "framer-motion";
import { cn } from "@/lib/utils";

export function TextGenerateEffect({
  words,
  className,
  filter = true,
  duration = 0.5,
}: {
  words: string;
  className?: string;
  filter?: boolean;
  duration?: number;
}) {
  const [scope, animate] = useAnimate();
  const wordsArray = words.split(" ");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started) {
      setStarted(true);
      animate(
        "span",
        {
          opacity: 1,
          filter: filter ? "blur(0px)" : "none",
        },
        {
          duration,
          delay: stagger(0.05),
        },
      );
    }
  }, [animate, duration, filter, started]);

  return (
    <div className={cn(className)} ref={scope}>
      {wordsArray.map((word, idx) => (
        <motion.span
          key={word + idx}
          className="inline-block"
          style={{
            filter: filter ? "blur(8px)" : "none",
            opacity: 0,
          }}
        >
          {word}{" "}
        </motion.span>
      ))}
    </div>
  );
}
