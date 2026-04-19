"use client";

import { useState } from "react";
import {
  Search,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Sparkles,
  TrendingUp,
  Target,
  SlidersHorizontal,
  ChevronDown,
  MapPin,
  DollarSign,
  Clock,
  X,
} from "lucide-react";
import { cn, getMatchScoreColor, getMatchScoreBgColor } from "@/lib/utils";

// ── Mock data ──
const categories = [
  { label: "Frontend Engineering", count: 14 },
  { label: "Full Stack", count: 9 },
  { label: "Design Engineering", count: 5 },
  { label: "DevOps / SRE", count: 3 },
];

const experienceLevels = ["Junior", "Mid-Level", "Senior", "Staff+"];

const skillChips = [
  "React",
  "TypeScript",
  "Node.js",
  "Python",
  "AWS",
  "GraphQL",
  "Figma",
  "Docker",
];

// Mock lists removed for simplicity...

import { getMatchedJobs, MatchedJob } from "@/lib/api";
import { useEffect } from "react";

export default function JobsPage() {
  const [jobs, setJobs] = useState<MatchedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    "Frontend Engineering",
  ]);
  const [selectedLevel, setSelectedLevel] = useState("Senior");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([
    "React",
    "TypeScript",
  ]);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    getMatchedJobs()
      .then((res) => setJobs(res.jobs))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const toggleCategory = (cat: string) =>
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );

  const toggleSkill = (skill: string) =>
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );

  const toggleSave = (id: string) =>
    setSavedJobs((prev) =>
      prev.includes(id) ? prev.filter((j) => j !== id) : [...prev, id]
    );

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-headline font-extrabold text-3xl lg:text-4xl tracking-tight text-on-surface mb-1">
            Recommended Jobs
          </h1>
          <p className="text-on-surface-variant text-sm">
            {loading ? "Loading matches..." : `${jobs.length} roles matched to your profile`}
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden flex items-center gap-2 px-4 py-2 bg-surface-container-high rounded-xl text-sm font-medium text-on-surface-variant hover:text-white transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          <ChevronDown
            className={cn(
              "w-4 h-4 transition-transform",
              showFilters && "rotate-180"
            )}
          />
        </button>
      </div>

      {/* 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Left: Filters */}
        <aside
          className={cn(
            "lg:col-span-3 space-y-6",
            showFilters ? "block" : "hidden lg:block"
          )}
        >
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
            <input
              type="text"
              placeholder="Search roles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-outline-variant outline-none"
            />
          </div>

          {/* Categories */}
          <div className="bg-surface-container rounded-xl p-5">
            <h4 className="text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-4">
              Role Category
            </h4>
            <div className="space-y-2">
              {categories.map((cat) => (
                <label
                  key={cat.label}
                  onClick={() => toggleCategory(cat.label)}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <div
                    className={cn(
                      "w-4 h-4 rounded border-2 flex items-center justify-center transition-colors",
                      selectedCategories.includes(cat.label)
                        ? "bg-primary border-primary"
                        : "border-outline-variant/40 group-hover:border-primary/50"
                    )}
                  >
                    {selectedCategories.includes(cat.label) && (
                      <svg
                        className="w-2.5 h-2.5 text-on-primary-container"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="3"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-on-surface-variant group-hover:text-on-surface transition-colors flex-1">
                    {cat.label}
                  </span>
                  <span className="text-xs text-outline font-medium">
                    {cat.count}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Experience Level */}
          <div className="bg-surface-container rounded-xl p-5">
            <h4 className="text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-4">
              Experience Level
            </h4>
            <div className="flex flex-wrap gap-2">
              {experienceLevels.map((level) => (
                <button
                  key={level}
                  onClick={() => setSelectedLevel(level)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-bold transition-all btn-press",
                    selectedLevel === level
                      ? "bg-primary text-on-primary-container"
                      : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest hover:text-white"
                  )}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Priority Skills */}
          <div className="bg-surface-container rounded-xl p-5">
            <h4 className="text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-4">
              Priority Skills
            </h4>
            <div className="flex flex-wrap gap-2">
              {skillChips.map((skill) => (
                <button
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-medium transition-all",
                    selectedSkills.includes(skill)
                      ? "bg-primary/15 text-primary border border-primary/20"
                      : "bg-surface-container-high text-on-surface-variant hover:text-white border border-transparent"
                  )}
                >
                  {selectedSkills.includes(skill) && (
                    <X className="w-3 h-3 inline mr-1 -mt-0.5" />
                  )}
                  {skill}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Center: Job List */}
        <div className="lg:col-span-9 space-y-4">
          {error && (
            <div className="p-4 bg-error/10 text-error rounded-xl">
              Failed to load jobs: {error}
            </div>
          )}
          {loading && (
            <div className="text-center py-8 text-on-surface-variant">
              Loading matches...
            </div>
          )}
          {!loading && jobs.length === 0 && !error && (
            <div className="text-center py-8 text-on-surface-variant">
              No jobs found.
            </div>
          )}
          {jobs.map(({ job, matchScore, matchedSkills }) => (
            <div
              key={job.id}
              className="bg-surface-container rounded-xl p-5 card-hover group"
            >
              <div className="flex items-start gap-4">
                {/* Company Logo */}
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 bg-primary/20 text-primary"
                >
                  {job.company?.[0]?.toUpperCase() || "J"}
                </div>

                {/* Main Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-white text-sm group-hover:text-primary transition-colors">
                        {job.title}
                      </h3>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        {job.company}
                      </p>
                    </div>
                    {/* Match score badge */}
                    <div
                      className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0",
                        getMatchScoreBgColor(Math.round(matchScore * 100)),
                        getMatchScoreColor(Math.round(matchScore * 100))
                      )}
                    >
                      {Math.round(matchScore * 100)}% Match
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-on-surface-variant">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {job.location}
                    </span>
                  </div>

                  {/* Skills */}
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    {matchedSkills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] rounded-lg font-bold"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-4">
                    <a
                      href={job.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 gradient-primary text-on-primary-container font-bold text-xs rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-transform flex items-center justify-center gap-1"
                    >
                      Apply Now
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <button
                      onClick={() => toggleSave(job.id)}
                      className={cn(
                        "p-2 rounded-xl transition-colors",
                        savedJobs.includes(job.id)
                          ? "bg-primary/10 text-primary"
                          : "bg-surface-container-high text-on-surface-variant hover:text-white"
                      )}
                    >
                      {savedJobs.includes(job.id) ? (
                        <BookmarkCheck className="w-4 h-4" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>


      </div>
    </div>
  );
}
