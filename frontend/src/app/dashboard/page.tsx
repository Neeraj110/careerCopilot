"use client";

import {
  Send,
  Zap,
  ArrowRight,
  Target,
  TrendingUp,
  Plus,
  Clock3,
} from "lucide-react";
import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  cn,
  getStatusColor,
  getMatchScoreColor,
  sanitizeDisplayText,
} from "@/lib/utils";
import Skeleton from "@/components/shared/Skeleton";
import { useQuery } from "@tanstack/react-query";
import { getMatchedJobs } from "@/lib/api";
import { useAuthStore } from "@/lib/store/auth";

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  const { data, isLoading: loading, error } = useQuery({
    queryKey: ["matchedJobs", 1, 10],
    queryFn: () => getMatchedJobs(1, 5),
  });

  const jobs = data?.jobs || [] ;
  const loadError = error instanceof Error ? error.message : "";

  const uniqueJobs = useMemo(() => {
    const seen = new Set<string>();

    return jobs.filter(({ job }) => {
      const key = sanitizeDisplayText(
        `${job.company}-${job.title}-${job.location}`,
      ).toLowerCase();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }, [jobs]);

  const formatRelativeTime = (iso?: string) => {
    if (!iso) return "recently";
    const timestamp = new Date(iso).getTime();
    if (Number.isNaN(timestamp)) return "recently";
    const diffMs = Date.now() - timestamp;
    const diffMin = Math.max(1, Math.floor(diffMs / (1000 * 60)));
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHrs = Math.floor(diffMin / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    const diffDays = Math.floor(diffHrs / 24);
    return `${diffDays}d ago`;
  };

  const avgMatchScore = uniqueJobs.length
    ? Math.round(uniqueJobs.reduce((a, b) => a + b.matchScore, 0) / uniqueJobs.length)
    : 0;

  const stats = [
    {
      label: "Matching Applications",
      value: uniqueJobs.length.toString(),
      icon: Send,
      iconBg: "bg-primary/10 text-primary",
    },
    {
      label: "Avg. Match Score",
      value: `${avgMatchScore}%`,
      icon: Zap,
      iconBg: "bg-secondary/10 text-secondary",
    },
    {
      label: "Strong Matches",
      value: uniqueJobs.filter((item) => item.matchScore >= 80).length.toString(),
      icon: Target,
      iconBg: "bg-tertiary/10 text-tertiary",
    },
  ];

  if (loading) {
    return (
      <div className="space-y-8 lg:space-y-10" aria-label="Dashboard loading">
        <div className="space-y-3">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-96 max-w-full" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
          {[...Array(3)].map((_, index) => (
            <div
              key={`stats-skeleton-${index}`}
              className="bg-surface-container rounded-xl p-5 lg:p-6 space-y-4"
            >
              <Skeleton className="h-10 w-10 rounded-xl" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-20" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          <div className="lg:col-span-8 bg-surface-container rounded-xl p-4 lg:p-6 space-y-4">
            <Skeleton className="h-6 w-44" />
            {[...Array(5)].map((_, index) => (
              <div
                key={`table-row-skeleton-${index}`}
                className="grid grid-cols-12 gap-3 items-center"
              >
                <Skeleton className="h-10 col-span-5" />
                <Skeleton className="h-10 col-span-3 hidden sm:block" />
                <Skeleton className="h-10 col-span-3 sm:col-span-2" />
                <Skeleton className="h-10 col-span-4 sm:col-span-2" />
              </div>
            ))}
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="bg-surface-container rounded-xl p-5 lg:p-6 space-y-3">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
            <div className="bg-surface-container rounded-xl p-5 lg:p-6 space-y-3">
              <Skeleton className="h-5 w-28" />
              {[...Array(3)].map((_, index) => (
                <Skeleton key={`bullet-skeleton-${index}`} className="h-4 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const topJob = uniqueJobs[0]?.job;
  const topThree = uniqueJobs.slice(0, 3);

  return (
    <>
      {/* Greeting */}
      <div className="mb-8 lg:mb-10 animate-fade-in">
        <h1 className="font-headline font-extrabold text-3xl lg:text-4xl tracking-tight text-on-surface mb-2">
          Hello, {user?.name || "there"}.
        </h1>
        <p className="font-body text-on-surface-variant max-w-2xl text-sm lg:text-base">
          Here is your AI-powered career intelligence.
        </p>
      </div>

      {/* Bento Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6 mb-8 lg:mb-10">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-surface-container rounded-xl p-5 lg:p-6 flex flex-col justify-between card-hover"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={cn("p-2 rounded-xl", stat.iconBg)}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div>
                <p className="text-on-surface-variant font-label text-sm mb-1">
                  {stat.label}
                </p>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-3xl lg:text-4xl font-headline font-extrabold text-on-surface">
                    {stat.value}
                  </h2>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Content Split: Activity Table + AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-8 space-y-4 lg:space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-headline font-bold text-lg lg:text-xl text-on-surface">
                Recent Activity
              </h3>
              <p className="text-xs text-on-surface-variant mt-1">
                Latest matched roles based on your resume profile.
              </p>
            </div>
            <Link href="/jobs" className="text-primary text-sm font-bold hover:underline">
              View All
            </Link>
          </div>

          {loadError && (
            <div className="rounded-xl bg-error/10 text-error px-4 py-3 text-sm">
              Could not load latest activity: {loadError}
            </div>
          )}

          {uniqueJobs.length === 0 ? (
            <div className="bg-surface-container rounded-xl p-6 lg:p-8 text-center">
              <p className="text-on-surface text-sm lg:text-base font-semibold mb-2">
                No matched jobs yet.
              </p>
              <p className="text-on-surface-variant text-sm mb-5">
                Upload your resume and refine your profile to unlock personalized job matches.
              </p>
              <div className="flex items-center justify-center gap-3">
                <Link
                  href="/resume/upload"
                  className="px-4 py-2 rounded-lg bg-primary/15 text-primary text-sm font-semibold hover:bg-primary/25 transition-colors"
                >
                  Upload Resume
                </Link>
                <Link
                  href="/jobs"
                  className="px-4 py-2 rounded-lg bg-surface-container-high text-on-surface text-sm font-semibold hover:bg-surface-container-highest transition-colors"
                >
                  Browse Jobs
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-surface-container rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-on-surface-variant border-b border-white/5">
                      <th className="px-4 lg:px-6 py-4 font-label text-xs uppercase tracking-widest font-bold">
                        Company
                      </th>
                      <th className="px-4 lg:px-6 py-4 font-label text-xs uppercase tracking-widest font-bold hidden sm:table-cell">
                        Role
                      </th>
                      <th className="px-4 lg:px-6 py-4 font-label text-xs uppercase tracking-widest font-bold">
                        Match
                      </th>
                      <th className="px-4 lg:px-6 py-4 font-label text-xs uppercase tracking-widest font-bold hidden md:table-cell">
                        Updated
                      </th>
                      <th className="px-4 lg:px-6 py-4 font-label text-xs uppercase tracking-widest font-bold">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {uniqueJobs.slice(0, 5).map(({ job, matchScore }) => {
                      const statusColors = getStatusColor("Saved");
                      const scoreInt = Math.round(matchScore);
                      const cleanCompany = sanitizeDisplayText(job.company) || "Unknown Company";
                      const cleanTitle = sanitizeDisplayText(job.title) || "Untitled Role";
                      return (
                        <tr
                          key={job.id}
                          className="hover:bg-surface-container-high transition-colors cursor-pointer"
                          onClick={() => router.push(`/jobs/${job.id}`)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              router.push(`/jobs/${job.id}`);
                            }
                          }}
                          tabIndex={0}
                          role="link"
                          aria-label={`Open details for ${cleanTitle} at ${cleanCompany}`}
                        >
                          <td className="px-4 lg:px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm bg-primary/20 text-primary"
                              >
                                {cleanCompany?.[0]?.toUpperCase() || "J"}
                              </div>
                              <span className="text-on-surface font-medium text-sm">
                                {cleanCompany}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 lg:px-6 py-4 text-on-surface-variant text-sm hidden sm:table-cell">
                            <div className="space-y-0.5">
                              <p>{cleanTitle}</p>
                              <p className="text-xs text-on-surface-variant/70">
                                Recommended for your current resume
                              </p>
                            </div>
                          </td>
                          <td className="px-4 lg:px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-12 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div
                                  className={cn(
                                    "h-full rounded-full",
                                    scoreInt >= 85
                                      ? "bg-primary"
                                      : scoreInt >= 70
                                        ? "bg-secondary"
                                        : "bg-error"
                                  )}
                                  style={{ width: `${scoreInt}%` }}
                                />
                              </div>
                              <span
                                className={cn(
                                  "text-xs font-bold",
                                  getMatchScoreColor(scoreInt)
                                )}
                              >
                                {scoreInt}%
                              </span>
                            </div>
                          </td>
                          <td className="px-4 lg:px-6 py-4 hidden md:table-cell">
                            <span className="text-xs text-on-surface-variant flex items-center gap-1.5">
                              <Clock3 className="w-3.5 h-3.5" />
                              {formatRelativeTime(job.scrapedAt)}
                            </span>
                          </td>
                          <td className="px-4 lg:px-6 py-4">
                            <span
                              className={cn(
                                "px-3 py-1 text-xs font-bold rounded-full",
                                statusColors.bg,
                                statusColors.text
                              )}
                            >
                              Saved
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right utility panel */}
        <div className="lg:col-span-4 space-y-4 lg:space-y-6">
          <div className="bg-surface-container rounded-xl p-5 lg:p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-headline font-bold text-lg text-on-surface">
                Focus Today
              </h3>
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <p className="text-on-surface-variant text-sm leading-relaxed mb-4">
              {topJob
                ? `Your best current match is ${sanitizeDisplayText(topJob.title)} at ${sanitizeDisplayText(topJob.company)}. Tailor your resume and apply while this role is still open.`
                : "Upload and analyze a resume to unlock personalized match recommendations."}
            </p>
            <Link
              href={topJob ? `/chat?jobId=${topJob.id}` : "/chat"}
              className="w-full rounded-lg bg-primary/15 text-primary font-semibold py-2.5 text-sm hover:bg-primary/25 transition-colors flex items-center justify-center gap-2"
            >
              Open AI Suggestions
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-surface-container rounded-xl p-5 lg:p-6">
            <h4 className="font-headline font-bold text-base text-on-surface mb-3">
              Next Steps
            </h4>
            <div className="space-y-2">
              <Link
                href="/resume/analysis"
                className="block rounded-lg bg-surface-container-high px-3 py-2.5 text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-colors"
              >
                Refine resume keywords with ATS analysis
              </Link>
              <Link
                href="/jobs"
                className="block rounded-lg bg-surface-container-high px-3 py-2.5 text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-colors"
              >
                Prioritize top matches ({topThree.filter((j) => j.matchScore >= 80).length} above 80%)
              </Link>
              <Link
                href={topJob ? `/chat?jobId=${topJob.id}` : "/chat"}
                className="block rounded-lg bg-surface-container-high px-3 py-2.5 text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-colors"
              >
                Practice interview Q&A with AI copilot
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Quick Action */}
      <Link
        href="/resume/upload"
        className="fixed bottom-6 right-6 lg:bottom-8 lg:right-8 gradient-primary text-on-primary rounded-full shadow-2xl shadow-primary/40 flex items-center justify-center gap-2 h-12 px-4 group btn-press hover:scale-105 transition-transform z-40"
        aria-label="Upload new resume"
      >
        <Plus className="w-5 h-5 group-hover:rotate-12 transition-transform" />
        <span className="text-sm font-semibold">Upload CV</span>
      </Link>
    </>
  );
}
