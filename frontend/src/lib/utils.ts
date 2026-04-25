import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMatchScore(score: number): string {
  return `${Math.round(score)}%`;
}

export function getMatchScoreColor(score: number): string {
  if (score >= 85) return "text-primary";
  if (score >= 70) return "text-secondary";
  return "text-error";
}

export function getMatchScoreBgColor(score: number): string {
  if (score >= 85) return "bg-primary/10";
  if (score >= 70) return "bg-secondary/10";
  return "bg-error/10";
}

export function getStatusColor(status: string): { bg: string; text: string } {
  switch (status.toLowerCase()) {
    case "interviewing":
      return { bg: "bg-primary/10", text: "text-primary" };
    case "reviewing":
      return {
        bg: "bg-surface-container-highest",
        text: "text-on-surface-variant",
      };
    case "application sent":
      return { bg: "bg-tertiary/10", text: "text-tertiary" };
    case "closing soon":
      return { bg: "bg-error/10", text: "text-error" };
    case "offered":
      return { bg: "bg-primary/10", text: "text-primary" };
    case "rejected":
      return { bg: "bg-error/10", text: "text-error" };
    default:
      return {
        bg: "bg-surface-container-highest",
        text: "text-on-surface-variant",
      };
  }
}

export function sanitizeDisplayText(input: string): string {
  if (!input) return "";

  return input
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/(?:^|\s)\.?css-[\w-]+\s*\{[^}]+\}/g, " ")
    .replace(
      /\b(?:inline-size|block-size|margin-inline-start|margin-inline-end|vertical-align|display|webkit|ms-flex|flex)\s*:[^;{}]+;?/gi,
      " ",
    )
    .replace(/\{[^{}]{0,400}\}/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
