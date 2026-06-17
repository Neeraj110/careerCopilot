"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { ArrowLeft, FileText, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { VersionSwitcher } from "@/components/resume/version-switcher";
import { useResume, useFullVersion } from "@/hooks/use-resumes";
import { useAuth } from "@/hooks/use-auth";

// ─── Dynamic imports with ssr: false ─────────────────────────────────────────
// All @react-pdf/renderer code is isolated in pdf-widgets.tsx and loaded only
// in the browser — this is the correct pattern for Turbopack / Next.js 16+.

const PdfDownloadButton = dynamic(
  () => import("@/components/export/pdf-widgets").then((m) => m.PdfDownloadButton),
  {
    ssr: false,
    loading: () => (
      <Button variant="accent" size="md" disabled>
        <Loader2 size={14} className="animate-spin" /> Loading…
      </Button>
    ),
  }
);

const PdfPreview = dynamic(
  () => import("@/components/export/pdf-widgets").then((m) => m.PdfPreview),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[800px] w-full rounded-3xl" />,
  }
);

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ExportPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { user } = useAuth();

  const { data, isLoading, error } = useResume(id);
  const resume = data?.resume;
  const versions = data?.versions || [];

  const [activeVersionId, setActiveVersionId] = useState<string | null>(null);

  useEffect(() => {
    if (!activeVersionId && versions.length) {
      const last = versions[versions.length - 1];
      setActiveVersionId(resume?.currentVersionId ?? last?.id ?? last?._id ?? null);
    }
  }, [versions, resume, activeVersionId]);

  const fullVersion = useFullVersion(id, activeVersionId as string);
  const version = fullVersion.data;
  const isReady = !!version && !fullVersion.isLoading;

  const fileName = useMemo(() => {
    const base = (resume?.title || "resume")
      .replace(/[^a-z0-9\-_ ]/gi, "")
      .trim()
      .replace(/\s+/g, "_");
    return `${base}_${version?.label || "V1"}.pdf`;
  }, [resume?.title, version?.label]);

  // ─── Resume load states ─────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-1/3 rounded-2xl" />
        <Skeleton className="h-[600px] rounded-3xl" />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={FileText}
        title="Couldn't load resume"
        description={(error as Error).message}
        action={
          <Button variant="outline" onClick={() => router.push("/dashboard/resumes")}>
            Back to resumes
          </Button>
        }
      />
    );
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Export — ${resume?.title || "Resume"}`}
        description="Preview a clean ATS-friendly PDF and download when it looks right."
        actions={
          <Button variant="ghost" onClick={() => router.push(`/dashboard/resumes/${id}`)}>
            <ArrowLeft size={14} /> Back to resume
          </Button>
        }
      />

      {/* Controls card */}
      <Card>
        <CardHeader className="flex-wrap">
          <div>
            <CardTitle className="text-base">Version</CardTitle>
            <CardDescription className="mt-1">Choose which version to export</CardDescription>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <VersionSwitcher
              versions={versions}
              activeId={activeVersionId}
              onChange={setActiveVersionId}
            />

            {/* Download button — rendered only when version data is ready */}
            {isReady ? (
              <PdfDownloadButton
                user={user}
                version={version}
                title={resume?.title || "Resume"}
                fileName={fileName}
              />
            ) : (
              <Button variant="accent" size="md" disabled>
                <Loader2 size={14} className="animate-spin" />
                {fullVersion.isLoading ? "Loading version…" : "Select a version"}
              </Button>
            )}
          </div>
        </CardHeader>

        {version?.sourceType === "rewrite" && (
          <div className="flex items-center gap-2 text-xs text-ink-muted mt-2">
            <Badge tone="accent">AI-improved</Badge>
            This version was generated by applying AI rewrites.
          </div>
        )}
      </Card>

      {/* Version fetch states */}
      {fullVersion.isLoading && <Skeleton className="h-[800px] rounded-3xl" />}

      {fullVersion.error && !fullVersion.isLoading && (
        <EmptyState
          icon={FileText}
          title="Couldn't load this version"
          description={(fullVersion.error as Error).message}
        />
      )}

      {/* PDF Preview */}
      {isReady && (
        <>
          <Card className="overflow-hidden p-0 hidden md:block">
            <PdfPreview
              user={user}
              version={version}
              title={resume?.title || "Resume"}
            />
          </Card>
          <Card className="md:hidden flex flex-col items-center justify-center p-8 text-center text-ink-muted">
            <FileText size={40} className="mb-4 opacity-30" strokeWidth={1.5} />
            <p className="text-sm mb-2 font-medium text-ink">Preview not available on mobile</p>
            <p className="text-xs">Please use the Download button above to view your resume.</p>
          </Card>
        </>
      )}
    </div>
  );
}
