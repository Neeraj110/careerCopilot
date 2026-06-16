"use client";

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  Sparkles,
  PenLine,
  CheckCircle2,
  FileDown,
} from "lucide-react";
import { relativeTime } from "@/lib/utils";

const ICONS: Record<string, any> = {
  upload: Upload,
  analyze: Sparkles,
  rewrite: PenLine,
  complete: CheckCircle2,
  export: FileDown,
};

const TONES: Record<string, any> = {
  upload: "neutral",
  analyze: "accent",
  rewrite: "warning",
  complete: "success",
  export: "neutral",
};

export function ActivityFeed({ items }: { items: any[] }) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div>
          <CardTitle className="text-base">Activity</CardTitle>
          <CardDescription className="mt-1">
            Recent moves across your resumes
          </CardDescription>
        </div>
        <Badge tone="neutral">{items.length}</Badge>
      </CardHeader>

      <div className="flex-1 space-y-3">
        {items.map((item) => {
          const Icon = ICONS[item.type];
          return (
            <div key={item.id} className="flex items-start gap-3">
              <div className="h-9 w-9 shrink-0 rounded-xl bg-surface-2 flex items-center justify-center text-ink-muted">
                {Icon && <Icon size={15} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-ink truncate">
                  {item.title}
                </div>
                <div className="text-xs text-ink-muted mt-0.5">
                  {item.subtitle}
                </div>
              </div>
              <div className="text-right shrink-0">
                <Badge tone={TONES[item.type] || "neutral"}>{item.label}</Badge>
                <div className="text-[10px] text-ink-muted mt-1">
                  {relativeTime(item.at)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
