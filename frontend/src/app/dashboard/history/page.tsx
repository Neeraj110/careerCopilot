"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  History as HistoryIcon,
  Upload,
  Sparkles,
  PenLine,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { cn, relativeTime } from "@/lib/utils";
import { useHistory } from "@/hooks/use-analytics";

const FILTERS = [
  { key: "all", label: "All", icon: HistoryIcon },
  { key: "upload", label: "Uploads", icon: Upload },
  { key: "analyze", label: "Analyses", icon: Sparkles },
  { key: "rewrite", label: "Rewrites", icon: PenLine },
];

const ICONS: Record<string, any> = {
  upload: Upload,
  analyze: Sparkles,
  rewrite: PenLine,
};

const TONES: Record<string, "neutral" | "accent" | "warning"> = {
  upload: "neutral",
  analyze: "accent",
  rewrite: "warning",
};

function dayKey(date: string) {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (a: Date, b: Date) =>
    a.toDateString() === b.toDateString();

  if (isSameDay(d, today)) return "Today";
  if (isSameDay(d, yesterday)) return "Yesterday";
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: d.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
  });
}

export default function History() {
  const router = useRouter();
  const { data, isLoading, error } = useHistory();
  const [filter, setFilter] = useState("all");

  const events = data?.events || [];
  const totals = data?.totals || { all: 0 };

  const filtered = useMemo(() => {
    if (filter === "all") return events;
    return events.filter((e: any) => e.type === filter);
  }, [events, filter]);

  const grouped = useMemo(() => {
    const groups = new Map();
    for (const e of filtered) {
      const key = dayKey(e.at);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(e);
    }
    return Array.from(groups.entries());
  }, [filtered]);

  if (isLoading) return <HistorySkeleton />;

  if (error) {
    return (
      <EmptyState
        icon={HistoryIcon}
        title="Couldn't load history"
        description={(error as Error).message}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="History"
        description="Everything you've done across your resumes, in time order."
      />

      <div className="flex items-center gap-1 bg-surface border border-border p-1 rounded-2xl sm:rounded-full shadow-card overflow-x-auto no-scrollbar w-full sm:w-fit">
        {FILTERS.map((f) => {
          const Icon = f.icon;
          const count = totals[f.key] ?? events.length;
          const isActive = filter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "h-9 px-3.5 shrink-0 text-xs font-medium rounded-full transition-colors inline-flex items-center gap-1.5",
                isActive
                  ? "bg-ink text-bg"
                  : "text-ink-muted hover:text-ink"
              )}
            >
              <Icon size={13} />
              {f.label}
              <span
                className={cn(
                  "tabular text-[10px] px-1.5 py-0.5 rounded-full",
                  isActive
                    ? "bg-white/15 text-bg"
                    : "bg-surface-2 text-ink-muted"
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {grouped.length === 0 ? (
        <EmptyState
          icon={HistoryIcon}
          title="No activity yet"
          description={
            filter === "all"
              ? "Once you upload, analyze, or rewrite a resume, events show up here."
              : "No events match this filter — try a different one."
          }
        />
      ) : (
        <div className="space-y-7">
          {grouped.map(([day, items]) => (
            <div key={day as string}>
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-xs uppercase tracking-wide font-semibold text-ink-muted">
                  {day as string}
                </h3>
                <div className="flex-1 h-px bg-border" />
                <span className="text-[10px] text-ink-muted tabular">
                  {(items as any[]).length}
                </span>
              </div>
              <Card className="!p-0 overflow-hidden">
                {(items as any[]).map((e: any, idx: number) => {
                  const Icon = ICONS[e.type] || HistoryIcon;
                  return (
                    <button
                      key={e.id}
                      onClick={() =>
                        e.resumeId && router.push(`/dashboard/resumes/${e.resumeId}`)
                      }
                      className={cn(
                        "w-full text-left flex items-start gap-3 px-5 py-3.5 hover:bg-surface-2 transition-colors",
                        idx > 0 && "border-t border-border"
                      )}
                    >
                      <div className="h-9 w-9 shrink-0 rounded-xl bg-surface-2 flex items-center justify-center text-ink-muted">
                        <Icon size={15} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {e.title}
                        </div>
                        <div className="text-xs text-ink-muted mt-0.5">
                          {e.subtitle}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <Badge tone={TONES[e.type] || "neutral"}>{e.label}</Badge>
                        <div className="text-[10px] text-ink-muted mt-1">
                          {relativeTime(e.at)}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function HistorySkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-1/3 rounded-2xl" />
      <Skeleton className="h-11 w-[420px] rounded-full" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-4 w-24 rounded-full" />
          <Skeleton className="h-[240px] rounded-3xl" />
        </div>
      ))}
    </div>
  );
}
