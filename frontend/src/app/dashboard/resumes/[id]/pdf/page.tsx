"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  FileText,
  Loader2,
  Copy,
  Check,
  FileCode,
  Download,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { VersionSwitcher } from "@/components/resume/version-switcher";
import { useResume, useFullVersion } from "@/hooks/use-resumes";
import { useAuth } from "@/hooks/use-auth";
import { generateResumeLatex } from "@/lib/latex-generator";

// ─── Dynamic imports with ssr: false ─────────────────────────────────────────
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
  const [activeTab, setActiveTab] = useState<string>("overleaf");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!activeVersionId && versions.length) {
      const last = versions[versions.length - 1];
      setActiveVersionId(resume?.currentVersionId ?? last?.id ?? last?._id ?? null);
    }
  }, [versions, resume, activeVersionId]);

  const fullVersion = useFullVersion(id, activeVersionId as string);
  const version = fullVersion.data;
  const isReady = !!version && !fullVersion.isLoading;

  const baseFileName = useMemo(() => {
    const base = (resume?.title || "resume")
      .replace(/[^a-z0-9\-_ ]/gi, "")
      .trim()
      .replace(/\s+/g, "_");
    return `${base}_${version?.label || "V1"}`;
  }, [resume?.title, version?.label]);

  const pdfFileName = `${baseFileName}.pdf`;
  const texFileName = `${baseFileName}.tex`;

  // Generate Overleaf LaTeX code
  const latexCode = useMemo(() => {
    if (!version?.parsedSections) return "";
    return generateResumeLatex(version.parsedSections);
  }, [version?.parsedSections]);

  const handleCopyLatex = async () => {
    if (!latexCode) return;
    try {
      await navigator.clipboard.writeText(latexCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Clipboard copy failed:", err);
    }
  };

  const handleDownloadTex = () => {
    if (!latexCode) return;
    const blob = new Blob([latexCode], { type: "text/x-tex;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = texFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

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
        description="Export as production-grade Overleaf LaTeX code or download standard PDF."
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
            <CardTitle className="text-base">Version & Format</CardTitle>
            <CardDescription className="mt-1">
              Select version and switch between Overleaf LaTeX and PDF preview
            </CardDescription>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <VersionSwitcher
              versions={versions}
              activeId={activeVersionId}
              onChange={setActiveVersionId}
            />

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="overleaf" className="flex items-center gap-1.5">
                  <FileCode size={13} /> Overleaf (LaTeX)
                </TabsTrigger>
                <TabsTrigger value="pdf" className="flex items-center gap-1.5">
                  <FileText size={13} /> PDF Preview
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>

        {version?.sourceType === "rewrite" && (
          <div className="flex items-center gap-2 text-xs text-ink-muted mt-2">
            <Badge tone="accent">AI-improved</Badge>
            This version includes improved bullet points and high-impact phrasing.
          </div>
        )}
      </Card>

      {/* Version fetch states */}
      {fullVersion.isLoading && <Skeleton className="h-[700px] rounded-3xl" />}

      {fullVersion.error && !fullVersion.isLoading && (
        <EmptyState
          icon={FileText}
          title="Couldn't load this version"
          description={(fullVersion.error as Error).message}
        />
      )}

      {/* Active Tab Contents */}
      {isReady && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Overleaf LaTeX Tab */}
          <TabsContent value="overleaf" className="space-y-4">
            <Card className="border-accent/30 bg-accent/5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-medium text-ink text-sm">
                    <Sparkles size={16} className="text-accent" />
                    <span>Jake&apos;s Resume Overleaf Template</span>
                  </div>
                  <p className="text-xs text-ink-muted">
                    Matches your original layout: clean blue titles, centered contact line, categorized skills &amp; project bullets.
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    variant="accent"
                    size="md"
                    onClick={handleCopyLatex}
                    className="flex items-center gap-1.5 font-medium shadow-sm"
                  >
                    {copied ? (
                      <>
                        <Check size={15} className="text-green-300" />
                        <span>Copied for Overleaf!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={15} />
                        <span>Copy for Overleaf</span>
                      </>
                    )}
                  </Button>
                  <Button variant="outline" size="md" onClick={handleDownloadTex}>
                    <Download size={14} /> Download .tex
                  </Button>
                  <a
                    href="https://www.overleaf.com/project"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="ghost" size="md">
                      Overleaf <ExternalLink size={13} className="ml-1" />
                    </Button>
                  </a>
                </div>
              </div>
            </Card>

            {/* Step-by-step Overleaf Guide */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl border border-border bg-surface-1">
                <span className="font-semibold text-ink">1. Copy Code</span>
                <p className="text-ink-muted mt-1">
                  Click the <strong>Copy for Overleaf</strong> button above to copy the generated LaTeX to your clipboard.
                </p>
              </div>
              <div className="p-3 rounded-xl border border-border bg-surface-1">
                <span className="font-semibold text-ink">2. Paste in Overleaf</span>
                <p className="text-ink-muted mt-1">
                  In Overleaf, click <strong>New Project &gt; Blank Project</strong>, open <code>main.tex</code>, and paste.
                </p>
              </div>
              <div className="p-3 rounded-xl border border-border bg-surface-1">
                <span className="font-semibold text-ink">3. Recompile</span>
                <p className="text-ink-muted mt-1">
                  Press <strong>Recompile</strong> (Ctrl + Enter) to instantly generate your pixel-perfect resume!
                </p>
              </div>
            </div>

            {/* LaTeX Code Preview Box */}
            <Card className="overflow-hidden p-0 border border-border">
              <div className="flex items-center justify-between px-4 py-2.5 bg-surface-2 border-b border-border text-xs text-ink-muted font-mono">
                <span className="flex items-center gap-2">
                  <FileCode size={14} className="text-accent" />
                  {texFileName}
                </span>
                <span>{latexCode.split("\n").length} lines</span>
              </div>
              <div className="p-4 bg-surface-1 overflow-x-auto max-h-[550px] font-mono text-xs leading-relaxed text-ink selection:bg-accent/20">
                <pre>{latexCode}</pre>
              </div>
            </Card>
          </TabsContent>

          {/* PDF Preview Tab */}
          <TabsContent value="pdf" className="space-y-4">
            <div className="flex justify-end">
              <PdfDownloadButton
                user={user}
                version={version}
                title={resume?.title || "Resume"}
                fileName={pdfFileName}
              />
            </div>
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
              <p className="text-xs">Please use the Download button above or copy the LaTeX code.</p>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
