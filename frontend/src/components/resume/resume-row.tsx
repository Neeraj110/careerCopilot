"use client";

import { useRouter } from "next/navigation";
import { FileText, ChevronRight, Trash2, Layers } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { relativeTime } from "@/lib/utils";
import { useDeleteResume } from "@/hooks/use-resumes";

export function ResumeRow({ resume }: { resume: any }) {
  const router = useRouter();
  const del = useDeleteResume();

  async function remove(e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Delete this resume and all its versions?")) return;
    await del.mutateAsync(resume.id);
  }

  return (
    <Card
      onClick={() => router.push(`/dashboard/resumes/${resume.id}`)}
      className="cursor-pointer flex items-center gap-4"
    >
      <div className="h-12 w-12 rounded-2xl bg-accent-soft text-accent-strong flex items-center justify-center shrink-0">
        <FileText size={18} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-display text-base font-semibold truncate">
          {resume.title}
        </div>
        <div className="text-xs text-ink-muted mt-0.5">
          Updated {relativeTime(resume.updatedAt)}
        </div>
      </div>

      <Badge tone="neutral" className="gap-1">
        <Layers size={11} />
        {resume.versionsCount || resume.versionCount || resume.latestVersionNumber || 1} version{(resume.versionsCount || resume.versionCount || resume.latestVersionNumber || 1) > 1 ? "s" : ""}
      </Badge>

      <button
        onClick={remove}
        disabled={del.isPending}
        className="h-9 w-9 rounded-full hover:bg-surface-2 flex items-center justify-center text-ink-muted hover:text-danger transition-colors"
        title="Delete"
      >
        <Trash2 size={15} />
      </button>

      <ChevronRight size={16} className="text-ink-muted" />
    </Card>
  );
}
