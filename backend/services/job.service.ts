import { buildMatchingPipeline } from "../agent/matchingPipeline.js";
import { createLLM } from "../libs/ai.js";
import { prisma } from "../libs/prisma.js";
import { sanitizeDisplayText } from "../libs/text.js";
import type { CoverLetterResponse, MatchedJob } from "../types/job.types.js";
import type { Job } from "../generated/prisma/client.js";

// ---------------------------------------------------------------------------
// In-memory cache: avoids re-running the expensive AI pipeline on every
// pagination request.  Cache is keyed by userId and invalidated after 5 min
// OR when the user's resume changes (detected via updatedAt timestamp).
// ---------------------------------------------------------------------------
interface CacheEntry {
  allMatchedJobs: MatchedJob[];
  totalMatches: number;
  resumeUpdatedAt: Date;
  cachedAt: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const matchCache = new Map<string, CacheEntry>();

function sanitizeJob(job: Job): Job {
  return {
    ...job,
    title: sanitizeDisplayText(job.title),
    company: sanitizeDisplayText(job.company),
    location: sanitizeDisplayText(job.location),
    salary: job.salary ? sanitizeDisplayText(job.salary) : job.salary,
    jobType: job.jobType ? sanitizeDisplayText(job.jobType) : job.jobType,
    description: sanitizeDisplayText(job.description),
    skills: job.skills
      .map((skill) => sanitizeDisplayText(skill))
      .filter(Boolean),
  };
}

class JobService {
  private async getLatestOrActiveResume(userId: string) {
    const activeResume = await prisma.resume.findFirst({
      where: { userId, isActive: true },
      orderBy: { updatedAt: "desc" },
    });

    if (activeResume) {
      return activeResume;
    }

    return prisma.resume.findFirst({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });
  }

  async getMatches(
    userId: string,
    page: number = 1,
    limit: number = 5,
  ): Promise<{
    jobs: MatchedJob[];
    totalPages: number;
    page: number;
    totalJobs: number;
  }> {
    const resume = await this.getLatestOrActiveResume(userId);

    if (!resume) {
      throw new Error("Please upload your CV first");
    }

    // Check cache — invalidate if resume changed or TTL expired
    const cached = matchCache.get(userId);
    const now = Date.now();
    const cacheValid =
      cached &&
      cached.resumeUpdatedAt.getTime() === resume.updatedAt.getTime() &&
      now - cached.cachedAt < CACHE_TTL_MS;

    let allMatchedJobs: MatchedJob[];
    let totalMatches: number;

    if (cacheValid) {
      allMatchedJobs = cached!.allMatchedJobs;
      totalMatches = cached!.totalMatches;
    } else {
      // Run the full pipeline — fetch ALL matches (no page/limit here so
      // vectorRerankNode can sort the whole set once)
      const pipeline = buildMatchingPipeline();
      const output = await pipeline.invoke({
        userId,
        resumeSkills: resume.skills,
        resumeText: resume.rawText,
        allJobs: [],
        matchedJobs: [],
        totalMatches: 0,
        page: 1, // always run for first window; pagination below
        limit: 50, // fetch up to 50 for caching, then slice per page
      });

      allMatchedJobs = output.matchedJobs ?? [];
      totalMatches = output.totalMatches || allMatchedJobs.length;

      matchCache.set(userId, {
        allMatchedJobs,
        totalMatches,
        resumeUpdatedAt: resume.updatedAt,
        cachedAt: now,
      });
    }

    // Client-side pagination on cached results
    const skip = (page - 1) * limit;
    const pageJobs = allMatchedJobs.slice(skip, skip + limit).map((match) => ({
      ...match,
      job: sanitizeJob(match.job),
      matchedSkills: match.matchedSkills
        .map((skill) => sanitizeDisplayText(skill))
        .filter(Boolean),
    }));
    const totalPages = Math.max(1, Math.ceil(totalMatches / limit));

    return {
      jobs: pageJobs,
      totalPages,
      page,
      totalJobs: totalMatches,
    };
  }

  async generateCoverLetter(
    userId: string,
    jobId: string,
  ): Promise<CoverLetterResponse> {
    const [resume, job] = await Promise.all([
      this.getLatestOrActiveResume(userId),
      prisma.job.findUnique({ where: { id: jobId } }),
    ]);

    if (!resume) {
      throw new Error("Resume not found");
    }

    if (!job) {
      throw new Error("Job not found");
    }

    const llm = createLLM(0.2);
    const response =
      await llm.invoke(`Write a professional, personalized cover letter for this job application.
Use a confident but not arrogant tone. 3-4 paragraphs.
Candidate skills: ${resume.skills.join(", ")}
Resume summary: ${resume.rawText}
Job title: ${job.title} at ${job.company}
Job description: ${job.description}
Return only the cover letter text, no subject line.`);

    const coverLetter = (
      typeof response.content === "string"
        ? response.content
        : JSON.stringify(response.content)
    ).trim();

    await prisma.jobApplication.upsert({
      where: {
        userId_jobId: {
          userId,
          jobId: job.id,
        },
      },
      create: {
        userId,
        jobId: job.id,
        resumeId: resume.id,
        matchScore: 0,
        coverLetter,
      },
      update: {
        resumeId: resume.id,
        coverLetter,
      },
    });

    return { coverLetter };
  }

  async getJobById(
    userId: string,
    jobId: string,
  ): Promise<{
    job: import("../generated/prisma/client.js").Job;
    matchScore: number;
    matchedSkills: string[];
    missingSkills: string[];
    application: { status: string; matchScore: number } | null;
  }> {
    const [job, resume, application] = await Promise.all([
      prisma.job.findUnique({ where: { id: jobId } }),
      this.getLatestOrActiveResume(userId),
      prisma.jobApplication.findUnique({
        where: { userId_jobId: { userId, jobId } },
        select: { status: true, matchScore: true },
      }),
    ]);

    if (!job) throw new Error("Job not found");

    // Compute match from cached pipeline results if available, else skill-match
    const cached = matchCache.get(userId);
    const cachedMatch = cached?.allMatchedJobs.find((m) => m.job.id === jobId);

    let matchScore = 0;
    let matchedSkills: string[] = [];

    if (cachedMatch) {
      matchScore = cachedMatch.matchScore;
      matchedSkills = cachedMatch.matchedSkills;
    } else if (resume) {
      const resumeSkillSet = new Set(
        resume.skills.map((s) => s.toLowerCase().trim()),
      );
      const jobSkillsLower = job.skills.map((s) => s.toLowerCase().trim());
      matchedSkills = job.skills.filter((s) =>
        resumeSkillSet.has(s.toLowerCase().trim()),
      );
      const denominator = Math.max(jobSkillsLower.length, 1);
      matchScore = (matchedSkills.length / denominator) * 100;
    }

    const matchedSkillsLower = new Set(
      matchedSkills.map((s) => s.toLowerCase()),
    );
    const missingSkills = job.skills.filter(
      (s) => !matchedSkillsLower.has(s.toLowerCase()),
    );

    return {
      job: sanitizeJob(job),
      matchScore: Number(matchScore.toFixed(1)),
      matchedSkills: matchedSkills
        .map((skill) => sanitizeDisplayText(skill))
        .filter(Boolean),
      missingSkills: missingSkills
        .map((skill) => sanitizeDisplayText(skill))
        .filter(Boolean),
      application: application
        ? { status: application.status, matchScore: application.matchScore }
        : null,
    };
  }

  async getJobInsights(
    userId: string,
    jobId: string,
  ): Promise<{
    improvements: string[];
    missingSkills: string[];
    studyPlan: string[];
    fitSummary: string;
    atsScore: number;
  }> {
    const [resume, job] = await Promise.all([
      this.getLatestOrActiveResume(userId),
      prisma.job.findUnique({ where: { id: jobId } }),
    ]);

    if (!resume) throw new Error("Please upload your CV first");
    if (!job) throw new Error("Job not found");

    const llm = createLLM(0.3);
    const response = await llm.invoke(
      `You are an expert career coach and resume optimizer. Analyze this candidate's resume against the target job.

Resume Skills: ${resume.skills.join(", ")}
Resume Text (first 1500 chars): ${resume.rawText.slice(0, 1500)}

Target Job: ${job.title} at ${job.company}
Job Required Skills: ${job.skills.join(", ")}
Job Description (first 1000 chars): ${job.description.slice(0, 1000)}

Return a JSON object with exactly these fields:
{
  "improvements": string[] (3-5 specific resume bullet-point improvements),
  "missingSkills": string[] (skills in the job not found in the resume),
  "studyPlan": string[] (3-4 actionable learning steps for missing skills),
  "fitSummary": string (2-3 sentences: overall fit assessment),
  "atsScore": number (0-100, estimated ATS pass score)
}
Return ONLY the JSON, no markdown, no explanation.`,
    );

    const content =
      typeof response.content === "string"
        ? response.content
        : JSON.stringify(response.content);

    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON in response");
      return JSON.parse(jsonMatch[0]);
    } catch {
      return {
        improvements: [
          "Tailor your resume summary to match this role's requirements.",
        ],
        missingSkills: job.skills.filter(
          (s) =>
            !resume.skills.some((rs) => rs.toLowerCase() === s.toLowerCase()),
        ),
        studyPlan: [
          "Research the required technologies listed in the job description.",
        ],
        fitSummary: "Could not generate a detailed assessment at this time.",
        atsScore: 50,
      };
    }
  }
}

export const jobService = new JobService();
