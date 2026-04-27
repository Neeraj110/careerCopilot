"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  getJobById,
  getJobInsights,
} from "@/lib/api";
import Skeleton from "@/components/shared/Skeleton";
import {
  ArrowLeft,
  MapPin,
  DollarSign,
  Clock,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  XCircle,
  Target,
  BookOpen,
  TrendingUp,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  cn,
  getMatchScoreColor,
  sanitizeDisplayText,
} from "@/lib/utils";

function SkillBadge({ skill, variant }: { skill: string; variant: "matched" | "missing" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border",
        variant === "matched"
          ? "bg-primary/10 text-primary border-primary/20"
          : "bg-error/10 text-error border-error/20",
      )}
    >
      {variant === "matched" ? (
        <CheckCircle2 className="w-3 h-3" />
      ) : (
        <XCircle className="w-3 h-3" />
      )}
      {skill}
    </span>
  );
}

function InsightsPanel({ jobId }: { jobId: string }) {
  const [open, setOpen] = useState(false);

  const { data, isPending, mutate } = useMutation({
    mutationFn: () => getJobInsights(jobId),
  });

  const handleOpen = () => {
    setOpen(true);
    if (!data) mutate();
  };

  return (
    <div className="bg-surface-container rounded-xl overflow-hidden">
      <button
        onClick={open ? () => setOpen(false) : handleOpen}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-surface-container-high transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
            <Sparkles className="w-4.5 h-4.5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">AI Career Coach</h3>
            <p className="text-xs text-on-surface-variant">
              How to improve your resume for this role
            </p>
          </div>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-on-surface-variant" />
        ) : (
          <ChevronDown className="w-4 h-4 text-on-surface-variant" />
        )}
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-5 border-t border-white/5 pt-4">
          {isPending && (
            <div className="flex flex-col items-center gap-3 py-8">
              <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
              <p className="text-sm text-on-surface-variant animate-pulse">
                Analyzing your resume against this job…
              </p>
            </div>
          )}

          {data && (
            <>
              {/* Fit Summary */}
              <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-primary uppercase tracking-widest">
                    Overall Fit
                  </span>
                  <span className="text-lg font-headline font-bold text-primary">
                    {data.atsScore}%
                  </span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full transition-all duration-700"
                    style={{ width: `${data.atsScore}%` }}
                  />
                </div>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  {data.fitSummary}
                </p>
              </div>

              {/* Resume Improvements */}
              {data.improvements.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-secondary" />
                    <h4 className="text-sm font-bold text-white">Resume Improvements</h4>
                  </div>
                  <ul className="space-y-2">
                    {data.improvements.map((tip, i) => (
                      <li key={i} className="flex gap-2 text-sm text-on-surface-variant">
                        <span className="text-primary font-bold mt-0.5 flex-shrink-0">→</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Missing Skills */}
              {data.missingSkills.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-error" />
                    <h4 className="text-sm font-bold text-white">Skills to Acquire</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {data.missingSkills.map((s) => (
                      <SkillBadge key={s} skill={s} variant="missing" />
                    ))}
                  </div>
                </div>
              )}

              {/* Study Plan */}
              {data.studyPlan.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="w-4 h-4 text-tertiary" />
                    <h4 className="text-sm font-bold text-white">Study Plan</h4>
                  </div>
                  <ol className="space-y-2">
                    {data.studyPlan.map((step, i) => (
                      <li key={i} className="flex gap-3 text-sm text-on-surface-variant">
                        <span className="w-5 h-5 rounded-full bg-tertiary/15 text-tertiary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data, isLoading, error } = useQuery({
    queryKey: ["job", id],
    queryFn: () => getJobById(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto animate-fade-in">
        <div className="space-y-6">
          <Skeleton className="h-8 w-32" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-5">
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
            <div className="space-y-5 lg:col-span-1">
              <Skeleton className="h-32 w-full rounded-xl" />
              <Skeleton className="h-48 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <p className="text-error text-lg font-medium">Job not found.</p>
        <button
          onClick={() => router.back()}
          className="mt-4 text-sm text-primary hover:underline"
        >
          ← Go back
        </button>
      </div>
    );
  }

  const { job, matchScore, matchedSkills, missingSkills } = data;
  const scoreInt = Math.round(matchScore);
  const cleanTitle = sanitizeDisplayText(job.title) || "Untitled Role";
  const cleanCompany = sanitizeDisplayText(job.company) || "Unknown Company";
  const cleanLocation = sanitizeDisplayText(job.location) || "Location not specified";
  const cleanSalary = sanitizeDisplayText(job.salary || "");
  const cleanJobType = sanitizeDisplayText(job.jobType || "");
  const cleanDescription = sanitizeDisplayText(job.description);

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Back nav */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-on-surface-variant hover:text-white transition-colors mb-6 text-sm group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Jobs
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Main content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Header card */}
          <div className="bg-surface-container rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-bold text-xl flex-shrink-0">
                {cleanCompany?.[0]?.toUpperCase() || "J"}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="font-headline font-extrabold text-2xl text-white leading-tight">
                  {cleanTitle}
                </h1>
                <p className="text-on-surface-variant mt-1 font-medium">{cleanCompany}</p>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-3 text-sm text-on-surface-variant">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    {cleanLocation}
                  </span>
                  {cleanSalary && (
                    <span className="flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5" />
                      {cleanSalary}
                    </span>
                  )}
                  {cleanJobType && (
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {cleanJobType}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-5 pt-5 border-t border-white/5">
              <a
                href={job.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 gradient-primary text-on-primary-container font-bold text-sm px-5 py-2.5 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-transform"
              >
                Apply Now
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Job Description */}
          <div className="bg-surface-container rounded-xl p-6">
            <h2 className="font-headline font-bold text-white text-lg mb-4">
              Job Description
            </h2>
            <div className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-line">
              {cleanDescription}
            </div>
          </div>

          {/* AI Insights */}
          <InsightsPanel jobId={id} />
        </div>

        {/* Right: Match info */}
        <div className="space-y-5">
          {/* Match Score card */}
          <div className="bg-surface-container rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-4 h-4 text-primary" />
              <h3 className="font-bold text-white text-sm">Your Match Score</h3>
            </div>
            <div className="flex items-baseline gap-2 mb-3">
              <span
                className={cn(
                  "text-5xl font-headline font-extrabold",
                  getMatchScoreColor(scoreInt),
                )}
              >
                {scoreInt}
              </span>
              <span className="text-2xl font-headline text-on-surface-variant">%</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-4">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-700",
                  scoreInt >= 85
                    ? "bg-gradient-to-r from-primary to-primary-container"
                    : scoreInt >= 65
                      ? "bg-gradient-to-r from-secondary to-secondary-container"
                      : "bg-gradient-to-r from-error to-error-container",
                )}
                style={{ width: `${scoreInt}%` }}
              />
            </div>
            <div className="text-xs text-on-surface-variant">
              Based on skill overlap and semantic similarity
            </div>
          </div>

          {/* Matched Skills */}
          {matchedSkills.length > 0 && (
            <div className="bg-surface-container rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-white text-sm">
                  Your Matched Skills ({matchedSkills.length})
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {matchedSkills.map((s) => (
                  <SkillBadge key={s} skill={s} variant="matched" />
                ))}
              </div>
            </div>
          )}

          {/* Missing Skills */}
          {missingSkills.length > 0 && (
            <div className="bg-surface-container rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <XCircle className="w-4 h-4 text-error" />
                <h3 className="font-bold text-white text-sm">
                  Skills to Learn ({missingSkills.length})
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {missingSkills.map((s) => (
                  <SkillBadge key={s} skill={s} variant="missing" />
                ))}
              </div>
            </div>
          )}

          {/* All Required Skills */}
          <div className="bg-surface-container rounded-xl p-5">
            <h3 className="font-bold text-white text-sm mb-3">All Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((s) => (
                <span
                  key={s}
                  className="px-2 py-0.5 bg-surface-container-high text-on-surface-variant text-xs rounded-lg"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
