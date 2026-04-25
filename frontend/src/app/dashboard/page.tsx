"use client";

import {
  Send,
  Zap,
  ArrowRight,
  Target,
  TrendingUp,
  Plus,
} from "lucide-react";
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

  const { data, isLoading: loading } = useQuery({
    queryKey: ['matchedJobs', 1, 5],
    queryFn: () => getMatchedJobs(1, 5),
  });

  const jobs = data?.jobs || [];

  const avgMatchScore = jobs.length
    ? Math.round(jobs.reduce((a, b) => a + b.matchScore, 0) / jobs.length)
    : 0;

  const stats = [
    {
      label: "Matching Applications",
      value: jobs.length.toString(),
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
      value: jobs.filter((item) => item.matchScore >= 80).length.toString(),
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

  const topJob = jobs[0]?.job;

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
            <h3 className="font-headline font-bold text-lg lg:text-xl text-on-surface">
              Recent Activity
            </h3>
            <button className="text-primary text-sm font-bold hover:underline">
              View All
            </button>
          </div>
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
                    <th className="px-4 lg:px-6 py-4 font-label text-xs uppercase tracking-widest font-bold">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {jobs.slice(0, 5).map(({ job, matchScore }) => {
                    const statusColors = getStatusColor("Saved");
                    const scoreInt = Math.round(matchScore);
                    const cleanCompany = sanitizeDisplayText(job.company) || "Unknown Company";
                    const cleanTitle = sanitizeDisplayText(job.title) || "Untitled Role";
                    return (
                      <tr
                        key={job.id}
                        className="hover:bg-surface-container-high transition-colors cursor-pointer"
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
                          {cleanTitle}
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
            <button className="w-full rounded-lg bg-primary/15 text-primary font-semibold py-2.5 text-sm hover:bg-primary/25 transition-colors flex items-center justify-center gap-2">
              Open AI Suggestions
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-surface-container rounded-xl p-5 lg:p-6">
            <h4 className="font-headline font-bold text-base text-on-surface mb-3">
              Next Steps
            </h4>
            <ul className="space-y-2 text-sm text-on-surface-variant">
              <li>Refine resume keywords to match top 3 roles.</li>
              <li>Prioritize jobs above 80% match score first.</li>
              <li>Use chat copilot for interview prep questions.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <button className="fixed bottom-6 right-6 lg:bottom-8 lg:right-8 w-14 h-14 gradient-primary text-on-primary rounded-full shadow-2xl shadow-primary/40 flex items-center justify-center group btn-press hover:scale-110 transition-transform z-40">
        <Plus className="w-6 h-6 group-hover:rotate-12 transition-transform" />
      </button>
    </>
  );
}
