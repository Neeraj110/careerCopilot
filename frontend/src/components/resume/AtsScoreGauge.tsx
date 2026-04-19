"use client";

import { useEffect, useState } from "react";

interface AtsScoreGaugeProps {
  score: number;
  size?: number;
}

export default function AtsScoreGauge({
  score,
  size = 180,
}: AtsScoreGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (animatedScore / 100) * circumference;
  const offset = circumference - progress;

  // Color based on score
  const scoreColor =
    score >= 85 ? "#4edea3" : score >= 70 ? "#ffb95f" : "#ffb4ab";
  const scoreBgColor =
    score >= 85
      ? "rgba(78, 222, 163, 0.1)"
      : score >= 70
        ? "rgba(255, 185, 95, 0.1)"
        : "rgba(255, 180, 171, 0.1)";

  useEffect(() => {
    // Animate the score from 0 to target
    const duration = 1500;
    const steps = 60;
    const increment = score / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= score) {
        setAnimatedScore(score);
        clearInterval(interval);
      } else {
        setAnimatedScore(Math.round(current));
      }
    }, duration / steps);
    return () => clearInterval(interval);
  }, [score]);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="-rotate-90"
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#222a3d"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={scoreColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-300"
          style={{
            filter: `drop-shadow(0 0 8px ${scoreColor}40)`,
          }}
        />
      </svg>
      {/* Center content */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center rounded-full"
        style={{ backgroundColor: scoreBgColor }}
      >
        <span
          className="text-4xl font-headline font-extrabold"
          style={{ color: scoreColor }}
        >
          {animatedScore}
        </span>
        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant mt-1">
          Matchscore
        </span>
      </div>
    </div>
  );
}
