import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/v1`;

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diff = now.getTime() - then.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function getFileIcon(type: string): string {
  switch (type) {
    case "PDF":
      return "📄";
    case "DOCX":
      return "📝";
    case "TXT":
      return "📃";
    default:
      return "📎";
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "COMPLETED":
      return "text-success";
    case "PROCESSING":
      return "text-warning";
    case "PENDING":
      return "text-muted";
    case "FAILED":
      return "text-danger";
    default:
      return "text-muted-foreground";
  }
}

export function relativeTime(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diff = now.getTime() - then.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(timestamp);
}