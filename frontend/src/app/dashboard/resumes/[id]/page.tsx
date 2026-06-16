"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Sparkles, ArrowLeft, Loader2, FileText, Download } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AtsGauge } from "@/components/dashboard/ats-gauge";
import { ScoreBreakdown } from "@/components/analysis/score-breakdown";
import { IssuesList } from "@/components/analysis/issues-list";
import { StrengthsList } from "@/components/analysis/strengths-list";
import { KeywordChips } from "@/components/analysis/keyword-chips";
import { BulletRewrites } from "@/components/analysis/bullet-rewrites";
import { VersionSwitcher } from "@/components/resume/version-switcher";
import { DiffView } from "@/components/resume/diff-view";
import { relativeTime } from "@/lib/utils";
import {
  useResume,
  useAnalysisForVersion,
  useAnalyzeResume,
  useApplyRewrites,
} from "@/hooks/use-resumes";

export default function ResumeDetail() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const { data, isLoading, error } = useResume(id);
  const resume = data?.resume;
  const versions = data?.versions || [];

  const [activeVersionId, setActiveVersionId] = useState<string | null>(null);
  
  useEffect(() => {
    if (!activeVersionId && versions.length) {
      setActiveVersionId(resume?.currentVersionId || versions[versions.length - 1].id);
    }
  }, [versions, resume, activeVersionId]);

  const activeVersion = useMemo(
    () => versions.find((v: any) => v.id === activeVersionId),
    [versions, activeVersionId]
  );

  const analysisQuery = useAnalysisForVersion(id, activeVersionId as string);
  const analysis = analysisQuery.data;

  const analyze = useAnalyzeResume(id);
  const applyRewrites = useApplyRewrites(id);
  const [targetRole, setTargetRole] = useState("");
  const [tab, setTab] = useState("score");

  // Compute score delta between the active version and the previous one.
  // Versions store a `score` field from the shallow list; for the detail view
  // we use the analysis atsScore compared to the previous version's score.
  const delta = useMemo(() => {
    if (!analysis || versions.length < 2) return 0;
    const idx = versions.findIndex((v: any) => (v.id ?? v._id) === activeVersionId);
    if (idx <= 0) return 0;
    const prevScore = (versions[idx - 1] as any)?.score ?? null;
    const currentScore = analysis.atsScore ?? null;
    if (prevScore == null || currentScore == null) return 0;
    return currentScore - prevScore;
  }, [analysis, versions, activeVersionId]);

  async function runAnalyze() {
    try {
      if (activeVersionId) {
        await analyze.mutateAsync({
          versionId: activeVersionId,
          targetRole: targetRole.trim() || undefined,
        });
      }
    } catch {
      /* surfaced below */
    }
  }

  async function runApplyRewrites(rewriteIds: string[]) {
    if (!analysis?.id) return;
    try {
      const res = await applyRewrites.mutateAsync({
        analysisId: analysis.id,
        rewriteIds: rewriteIds.length ? rewriteIds : undefined,
      });
      if (res?.version?.id) {
        const newVersionId = res.version.id;
        setActiveVersionId(newVersionId);
        setTab("score");
        // Auto-analyze the new version with the same target role so the user
        // immediately sees whether their rewrites moved the score.
        try {
          await analyze.mutateAsync({
            versionId: newVersionId,
            targetRole: targetRole.trim() || undefined,
          });
        } catch {
          /* surfaced via analyze.error inside the Run analysis card */
        }
      }
    } catch {
      /* surfaced inside the card */
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-1/3 rounded-2xl" />
        <Skeleton className="h-[400px] rounded-3xl" />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={FileText}
        title="Resume not found"
        description={(error as Error).message}
        action={
          <Button variant="outline" onClick={() => router.push("/dashboard/resumes")}>
            Back to resumes
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={resume?.title || "Resume"}
        description={
          resume
            ? `Updated ${relativeTime(resume.updatedAt)} · ${versions.length} version${
                versions.length > 1 ? "s" : ""
              }`
            : ""
        }
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => router.push("/dashboard/resumes")}>
              <ArrowLeft size={14} /> All resumes
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push(`/dashboard/resumes/${id}/export`)}
            >
              <Download size={14} /> Export PDF
            </Button>
          </div>
        }
      />

      <Card>
        <div className="flex flex-wrap items-end gap-4 justify-between">
          <div className="space-y-2">
            <CardTitle className="text-base">Run analysis</CardTitle>
            <CardDescription>
              Score this version with AI and get issues, strengths, and rewrites.
            </CardDescription>
            <VersionSwitcher
              versions={versions}
              activeId={activeVersionId}
              onChange={setActiveVersionId}
            />
          </div>
          <div className="flex items-center gap-3 flex-1 min-w-[280px] max-w-[520px]">
            <Input
              placeholder="Target role (optional, e.g. Senior Frontend Engineer)"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
            />
            <Button
              variant="accent"
              size="lg"
              onClick={runAnalyze}
              disabled={analyze.isPending || !activeVersionId}
              className="shrink-0"
            >
              {analyze.isPending ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Analyzing…
                </>
              ) : (
                <>
                  <Sparkles size={14} /> Analyze
                </>
              )}
            </Button>
          </div>
        </div>
        {analyze.error && (
          <div className="mt-4 text-xs text-danger bg-[#F8E3E0] rounded-xl px-3 py-2">
            {(analyze.error as Error).message}
          </div>
        )}
      </Card>

      {!analysis && !analysisQuery.isLoading && (
        <EmptyState
          icon={Sparkles}
          title="No analysis yet for this version"
          description="Click Analyze above to score this resume version with AI."
        />
      )}

      {analysisQuery.isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Skeleton className="h-[280px] rounded-3xl" />
          <Skeleton className="h-[280px] rounded-3xl lg:col-span-2" />
        </div>
      )}

      {analysis && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-4">
              <AtsGauge score={analysis.atsScore} delta={delta} />
            </div>
            <div className="lg:col-span-5">
              <ScoreBreakdown breakdown={analysis.scoreBreakdown} />
            </div>
            <div className="lg:col-span-3">
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <div>
                    <CardTitle className="text-base">Verdict</CardTitle>
                    <CardDescription className="mt-1">
                      AI overall summary
                    </CardDescription>
                  </div>
                  <Badge tone="accent">{analysis.model}</Badge>
                </CardHeader>
                <p className="text-sm text-ink leading-relaxed">
                  {analysis.summary}
                </p>
              </Card>
            </div>
          </div>

          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="score">Issues</TabsTrigger>
              <TabsTrigger value="strengths">Strengths</TabsTrigger>
              <TabsTrigger value="keywords">Keywords</TabsTrigger>
              <TabsTrigger value="rewrites">Rewrites</TabsTrigger>
              <TabsTrigger value="diff">Diff</TabsTrigger>
            </TabsList>

            <div className="mt-5">
              <TabsContent value="score">
                <IssuesList issues={analysis.issues} />
              </TabsContent>
              <TabsContent value="strengths">
                <StrengthsList strengths={analysis.strengths} />
              </TabsContent>
              <TabsContent value="keywords">
                <KeywordChips
                  present={analysis.keywordsPresent}
                  missing={analysis.keywordsMissing}
                />
              </TabsContent>
              <TabsContent value="rewrites">
                <BulletRewrites
                  rewrites={analysis.bulletRewrites}
                  onApply={runApplyRewrites}
                  isApplying={applyRewrites.isPending}
                  error={applyRewrites.error ? (applyRewrites.error as Error).message : null}
                />
              </TabsContent>
              <TabsContent value="diff">
                <DiffView resumeId={id} versions={versions} />
              </TabsContent>
            </div>
          </Tabs>
        </>
      )}

      {activeVersion && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle className="text-base">Parsed Sections ({activeVersion.label})</CardTitle>
              <CardDescription className="mt-1">
                Quick preview of what we extracted from the PDF
              </CardDescription>
            </div>
          </CardHeader>
          <ParsedSectionsPreview version={activeVersion} />
        </Card>
      )}
    </div>
  );
}

function PreviewLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] uppercase tracking-wide text-ink-muted mb-1.5">
      {children}
    </div>
  );
}

function ParsedSectionsPreview({ version }: { version: any }) {
  const s = version.parsedSections || {};
  const b = s.basics || {};

  return (
    <div className="space-y-4 text-sm">
      {(b.name || b.title || b.email) && (
        <div className="pb-4 border-b border-border">
          {b.name && (
            <div className="font-display text-lg font-semibold tracking-tight text-ink">
              {b.name}
            </div>
          )}
          {b.title && (
            <div className="text-accent-strong text-sm">{b.title}</div>
          )}
          <div className="text-xs text-ink-muted mt-1 flex flex-wrap gap-x-3 gap-y-1">
            {b.email && <span>{b.email}</span>}
            {b.phone && <span>{b.phone}</span>}
            {b.location && <span>{b.location}</span>}
            {(b.links || []).map((l: any, i: number) => (
              <span key={i}>{l.label}</span>
            ))}
          </div>
        </div>
      )}

      {s.summary && (
        <div>
          <PreviewLabel>Summary</PreviewLabel>
          <p className="text-ink leading-relaxed">{s.summary}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {s.experience?.length > 0 && (
          <div>
            <PreviewLabel>Experience ({s.experience.length})</PreviewLabel>
            <ul className="space-y-1.5">
              {s.experience.slice(0, 5).map((e: any, i: number) => (
                <li key={i}>
                  <span className="text-ink font-medium">{e.role}</span>
                  {e.company && (
                    <span className="text-ink-muted"> · {e.company}</span>
                  )}
                  {e.period && (
                    <span className="ml-2 text-[11px] text-ink-muted">
                      {e.period}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
        {s.education?.length > 0 && (
          <div>
            <PreviewLabel>Education ({s.education.length})</PreviewLabel>
            <ul className="space-y-1.5">
              {s.education.map((e: any, i: number) => (
                <li key={i}>
                  <span className="text-ink font-medium">{e.degree}</span>
                  {e.school && (
                    <span className="text-ink-muted"> · {e.school}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {s.skills?.length > 0 && (
        <div>
          <PreviewLabel>Skills ({s.skills.length})</PreviewLabel>
          <div className="flex flex-wrap gap-1.5">
            {s.skills.slice(0, 24).map((sk: any, i: number) => (
              <Badge key={i} tone="accent">{sk}</Badge>
            ))}
          </div>
        </div>
      )}

      {s.projects?.length > 0 && (
        <div>
          <PreviewLabel>Projects ({s.projects.length})</PreviewLabel>
          <ul className="space-y-1.5">
            {s.projects.slice(0, 5).map((p: any, i: number) => (
              <li key={i}>
                <span className="text-ink font-medium">{p.name}</span>
                {p.tech?.length > 0 && (
                  <span className="ml-2 text-[11px] text-accent-strong">
                    {p.tech.join(" · ")}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {s.certifications?.length > 0 && (
          <div>
            <PreviewLabel>Certifications</PreviewLabel>
            <ul className="space-y-1 text-xs text-ink-muted">
              {s.certifications.map((c: any, i: number) => (
                <li key={i}>
                  <span className="text-ink">{c.name}</span>
                  {c.year && <span> · {c.year}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}
        {s.languages?.length > 0 && (
          <div>
            <PreviewLabel>Languages</PreviewLabel>
            <div className="flex flex-wrap gap-1">
              {s.languages.map((l: any, i: number) => (
                <Badge key={i} tone="neutral">{l}</Badge>
              ))}
          </div>
          </div>
        )}
        {s.interests?.length > 0 && (
          <div>
            <PreviewLabel>Interests</PreviewLabel>
            <div className="flex flex-wrap gap-1">
              {s.interests.map((l: any, i: number) => (
                <Badge key={i} tone="neutral">{l}</Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
