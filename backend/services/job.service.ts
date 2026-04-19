import { buildMatchingPipeline } from "../agent/matchingPipeline.js";
import { createLLM } from "../libs/ai.js";
import { prisma } from "../libs/prisma.js";
import type { CoverLetterResponse, MatchedJob } from "../types/job.types.js";

class JobService {
  async getMatches(userId: string): Promise<MatchedJob[]> {
    const resume = await prisma.resume.findUnique({
      where: { userId },
    });

    if (!resume) {
      throw new Error("Please upload your CV first");
    }

    const pipeline = buildMatchingPipeline();
    const output = await pipeline.invoke({
      userId,
      resumeSkills: resume.skills,
      resumeText: resume.rawText,
      allJobs: [],
      matchedJobs: [],
    });

    return output.matchedJobs ?? [];
  }

  async generateCoverLetter(
    userId: string,
    jobId: string,
  ): Promise<CoverLetterResponse> {
    const [resume, job] = await Promise.all([
      prisma.resume.findUnique({ where: { userId } }),
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
}

export const jobService = new JobService();
