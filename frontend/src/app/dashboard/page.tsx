"use client";

import {
  Send,
  Zap,
  Hourglass,
  Brain,
  Sparkles,
  CheckCircle,
  Circle,
  Bookmark,
  Plus,
} from "lucide-react";
import { cn, getStatusColor, getMatchScoreColor } from "@/lib/utils";

import { useState, useEffect } from "react";
import { getMatchedJobs, MatchedJob } from "@/lib/api";
import { useAuthStore } from "@/lib/store/auth";

export default function DashboardPage() {
  const [jobs, setJobs] = useState<MatchedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    getMatchedJobs()
      .then((res) => setJobs(res.jobs))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const avgMatchScore = jobs.length 
    ? Math.round((jobs.reduce((a, b) => a + b.matchScore, 0) / jobs.length) * 100)
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
  ];

  if (loading) {
    return <div className="p-8 text-on-surface-variant">Loading dashboard...</div>;
  }

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-8 lg:mb-10">
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-4 lg:space-y-6">
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
                    const scoreInt = Math.round(matchScore * 100);
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
                              {job.company?.[0]?.toUpperCase() || "J"}
                            </div>
                            <span className="text-on-surface font-medium text-sm">
                              {job.company}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-4 text-on-surface-variant text-sm hidden sm:table-cell">
                          {job.title}
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

        {/* AI Copilot Insights removed due to lack of backend support */}
      </div>

      {/* Floating Action Button */}
      <button className="fixed bottom-6 right-6 lg:bottom-8 lg:right-8 w-14 h-14 gradient-primary text-on-primary rounded-full shadow-2xl shadow-primary/40 flex items-center justify-center group btn-press hover:scale-110 transition-transform z-40">
        <Plus className="w-6 h-6 group-hover:rotate-12 transition-transform" />
      </button>
    </>
  );
}
