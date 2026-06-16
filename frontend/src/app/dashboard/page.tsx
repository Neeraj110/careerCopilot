"use client";

import { useRouter } from "next/navigation";
import {
  Gauge,
  Layers,
  Lightbulb,
  KeyRound,
  UploadCloud,
  Sparkles,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { ProfileCard } from "@/components/dashboard/profile-card";
import { VersionStack } from "@/components/dashboard/version-stack";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useDashboardV2 } from "@/hooks/use-dashboard-v2";
import dynamic from "next/dynamic";

const ScoreEvolutionChart = dynamic(
  () => import("@/components/dashboard/score-evolution-chart").then((m) => m.ScoreEvolutionChart),
  { ssr: false, loading: () => <Skeleton className="h-[300px] w-full rounded-3xl" /> }
);

const AtsGauge = dynamic(
  () => import("@/components/dashboard/ats-gauge").then((m) => m.AtsGauge),
  { ssr: false, loading: () => <Skeleton className="h-[300px] w-full rounded-3xl" /> }
);

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const { data, isLoading, error } = useDashboardV2();

  if (isLoading) return <DashboardSkeleton />;

  if (error) {
    return (
      <EmptyState
        icon={Gauge}
        title="Couldn't load your dashboard"
        description={(error as Error).message}
      />
    );
  }

  const { totals, latestResume, scoreSeries, versionStack, kpi, activity } =
    data || {};

  if (!totals?.resumes) {
    return (
      <EmptyState
        icon={UploadCloud}
        title="Welcome — let's roast your resume"
        description="Upload a PDF to get an instant ATS score, fixable issues, your strengths, and AI-rewritten bullets."
        action={
          <Button variant="accent" size="lg" onClick={() => router.push("/dashboard/documents")}>
            Upload your first resume
          </Button>
        }
      />
    );
  }

  const profileStats = [
    { label: "Resumes", value: totals.resumes },
    { label: "Rewrites", value: totals.rewrites },
    { label: "Analyses", value: totals.analyses },
  ];

  const current = kpi?.atsScore?.value;
  const first = scoreSeries?.[0]?.score;
  const evolutionDelta = current != null && first != null ? current - first : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          label="ATS Score"
          value={kpi?.atsScore?.value ?? "—"}
          suffix={kpi?.atsScore?.value != null ? "/ 100" : null}
          delta={kpi?.atsScore?.delta}
          chart="bars"
          data={kpi?.atsScore?.spark || []}
          icon={Gauge}
        />
        <StatCard
          label="Versions"
          value={kpi?.versions?.value ?? totals.resumes}
          chart="line"
          data={kpi?.versions?.spark || []}
          icon={Layers}
        />
        <StatCard
          label="Issues Identified"
          value={kpi?.issuesIdentified?.value ?? "—"}
          delta={kpi?.issuesIdentified?.delta}
          chart="line"
          data={kpi?.issuesIdentified?.spark || []}
          icon={Lightbulb}
        />
        <StatCard
          label="Keywords Matched"
          value={kpi?.keywordsMatched?.value ?? "—"}
          suffix={
            kpi?.keywordsMatched?.total
              ? `/ ${kpi.keywordsMatched.total}`
              : null
          }
          delta={kpi?.keywordsMatched?.delta}
          chart="line"
          data={kpi?.keywordsMatched?.spark || []}
          icon={KeyRound}
          accent
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-6">
          {scoreSeries?.length ? (
            <ScoreEvolutionChart
              data={scoreSeries}
              currentScore={current}
              delta={evolutionDelta}
            />
          ) : (
            <NoAnalysisCard
              onAction={() =>
                latestResume?.id && router.push(`/dashboard/resumes/${latestResume.id}`)
              }
            />
          )}
        </div>
        <div className="lg:col-span-3">
          {current != null ? (
            <AtsGauge score={current} delta={kpi?.atsScore?.delta ?? 0} />
          ) : (
            <Card className="h-full flex items-center justify-center text-center">
              <div className="font-display text-sm font-semibold mb-1">
                No score yet
              </div>
              <div className="text-xs text-ink-muted">
                Run analysis to populate
              </div>
            </Card>
          )}
        </div>
        <div className="lg:col-span-3">
          <ProfileCard user={user} stats={profileStats} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7">
          {versionStack?.length ? (
            <VersionStack
              versions={versionStack}
              resumeId={latestResume?.id}
              resumeTitle={latestResume?.title}
            />
          ) : (
            <Card className="h-full flex items-center justify-center text-center min-h-[200px]">
              <div className="font-display text-sm font-semibold mb-1">
                No versions yet
              </div>
              <div className="text-xs text-ink-muted">
                Versions appear after you analyze and rewrite
              </div>
            </Card>
          )}
        </div>
        <div className="lg:col-span-5">
          {activity?.length ? (
            <ActivityFeed items={activity} />
          ) : (
            <Card className="h-full flex items-center justify-center text-center min-h-[200px]">
              <div className="font-display text-sm font-semibold mb-1">
                Quiet here
              </div>
              <div className="text-xs text-ink-muted">
                Your activity feed lights up after you analyze
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function NoAnalysisCard({ onAction }: { onAction: () => void }) {
  return (
    <Card className="h-full flex flex-col items-center justify-center text-center min-h-[300px]">
      <div className="h-14 w-14 rounded-2xl bg-accent-soft text-accent-strong flex items-center justify-center mb-3">
        <Sparkles size={22} />
      </div>
      <div className="font-display text-base font-semibold tracking-tight">
        Ready when you are
      </div>
      <p className="text-sm text-ink-muted mt-1 max-w-sm">
        You've uploaded a resume — run analysis to see your ATS score, fixable
        issues, and rewrite suggestions.
      </p>
      {onAction && (
        <Button variant="accent" size="md" className="mt-4" onClick={onAction}>
          <Sparkles size={14} /> Analyze now
        </Button>
      )}
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[130px] rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <Skeleton className="lg:col-span-7 h-[300px] rounded-3xl" />
        <Skeleton className="lg:col-span-3 h-[300px] rounded-3xl" />
        <Skeleton className="lg:col-span-2 h-[300px] rounded-3xl" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <Skeleton className="lg:col-span-7 h-[260px] rounded-3xl" />
        <Skeleton className="lg:col-span-3 h-[260px] rounded-3xl" />
        <Skeleton className="lg:col-span-2 h-[260px] rounded-3xl" />
      </div>
    </div>
  );
}
