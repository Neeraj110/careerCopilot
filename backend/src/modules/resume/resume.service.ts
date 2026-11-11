import {
  createGeminiModel,
  recordAiCall,
  withAiRetry,
  isTransientAiError,
  withAiGuardrails,
} from "../../infrastructure/ai";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { z } from "zod";
import { prisma } from "../../infrastructure/prisma";
import { AppError } from "../../middlewares/errorHandler";
import { config } from "../../config";
import { buildImprovementAgent } from "./agent/improvement.agent";

const rawSearchGroundedModel = createGeminiModel(
  config.geminiApiKey,
  config.geminiModel,
);

const atsResultSchema = z.object({
  atsScore: z.number().min(0).max(100),
  role: z.string(),
  missingKeywords: z.array(z.string()).default([]),
  presentKeywords: z.array(z.string()).default([]),
  industryTrends: z.array(z.string()).default([]),
  formattingIssues: z.array(z.string()).default([]),
  improvements: z.array(z.object({
    section: z.string(),
    current: z.string(),
    suggested: z.string(),
    reason: z.string(),
  })).default([]),
  overallFeedback: z.string().default(""),
});

const jdMatchResultSchema = z.object({
  matchScore: z.number().min(0).max(100),
  role: z.string(),
  strengths: z.array(z.string()).default([]),
  missingSkills: z.array(z.string()).default([]),
  partialMatches: z.array(z.object({
    required: z.string(),
    candidate: z.string(),
    gap: z.string(),
  })).default([]),
  recommendations: z.array(z.object({
    skill: z.string(),
    reason: z.string(),
    resource: z.string().default(""),
  })).default([]),
  keywordsMissing: z.array(z.string()).default([]),
  overallFeedback: z.string().default(""),
});

const atsAnalysisModel = rawSearchGroundedModel.withStructuredOutput(
  atsResultSchema,
  { name: "ResumeATSAnalysis" },
);
const jdMatchModel = rawSearchGroundedModel.withStructuredOutput(
  jdMatchResultSchema,
  { name: "ResumeJDMatch" },
);

function getChunkIndex(metadata: unknown): number {
  if (typeof metadata !== "object" || metadata === null) return 0;
  const index = (metadata as Record<string, unknown>).chunkIndex;
  return typeof index === "number" ? index : 0;
}

async function getCompletedResumeText(userId: string, documentId: string) {
  const document = await prisma.document.findFirst({
    where: { id: documentId, userId },
    include: { chunks: true },
  });

  if (!document) throw new AppError("Document not found", 404);
  if (document.status !== "COMPLETED")
    throw new AppError("Document still processing", 400);

  const resumeText = document.chunks
    .sort((a, b) => getChunkIndex(a.metadata) - getChunkIndex(b.metadata)) // Sort chunks by index
    .map((chunk: { content: string }) => chunk.content)
    .join("\n");

  if (resumeText.length > 50_000) {
    throw new AppError("Resume text exceeds the 50,000 character AI analysis limit", 413);
  }

  return resumeText;
}

export const checkATS = async (userId: string, documentId: string) => {
  const resumeText = await getCompletedResumeText(userId, documentId);

  try {
    const response = await withAiRetry(async () => {
      recordAiCall("gemini-resume", "resume.ats-analysis");
      return atsAnalysisModel.invoke([
        new SystemMessage(withAiGuardrails(`
      You are an expert ATS (Applicant Tracking System) analyst with 
      access to real-time industry hiring data via Google Search.
      
      Your job:
      1. Analyze the resume against CURRENT industry standards (search if needed)
      2. Check latest in-demand skills for the candidate's role
      3. Identify missing keywords that modern ATS systems flag
      4. Give actionable improvements based on 2025-2026 hiring trends
      
      Follow the structured output schema.
    `)),
        new HumanMessage(`
      Analyze this resume using current industry standards.
      Search for latest ATS requirements and hiring trends for this role.
      
      RESUME:
      ${resumeText}
    `),
      ]);
    });

    return response;
  } catch (error) {
    if (isTransientAiError(error)) {
      throw new AppError("AI is busy, please retry in a moment", 503);
    }
    if (error instanceof AppError) throw error;
    console.error("ATS Check Error:", error);
    throw new AppError("Failed to parse ATS analysis", 500);
  }
};

export const jdMatch = async (
  userId: string,
  documentId: string,
  jd: string,
) => {
  const resumeText = await getCompletedResumeText(userId, documentId);

  try {
    const response = await withAiRetry(async () => {
      recordAiCall("gemini-resume", "resume.jd-match");
      return jdMatchModel.invoke([
        new SystemMessage(withAiGuardrails(`
      You are an expert recruiter and ATS specialist.
      You compare resumes against job descriptions to find match scores and gaps.
      You have access to Google Search to verify current skill requirements.

      Follow the structured output schema. Score only evidence found in the
      original resume; never infer or invent candidate skills.
    `)),
        new HumanMessage(`
      Compare this resume against the job description below.
      Search for current market relevance of required skills if needed.

      JOB DESCRIPTION:
      ${jd}

      RESUME:
      ${resumeText}
    `),
      ]);
    });

    return response;
  } catch (error) {
    if (isTransientAiError(error)) {
      throw new AppError("AI is busy, please retry in a moment", 503);
    }
    if (error instanceof AppError) throw error;
    console.error("JD Match Error:", error);
    throw new AppError("Failed to parse JD match analysis", 500);
  }
};

export const improveResume = async (
  userId: string,
  documentId: string,
  jdText: string,
) => {
  const resumeText = await getCompletedResumeText(userId, documentId);

  const agent = buildImprovementAgent();

  const response = await agent.invoke({
    resumeText,
    jdText,
  });

  return {
    match: {
      matchScore: response.matchScore,
      role: response.role,
      strengths: response.gaps.present,
      missingSkills: response.gaps.missing,
      partialMatches: response.gaps.partial.map((gap) => ({
        required: gap.requirement,
        candidate: gap.foundAs,
        gap: `The resume only hints at "${gap.requirement}" as "${gap.foundAs}".`,
      })),
      recommendations: [],
      keywordsMissing: response.gaps.missing,
      overallFeedback: response.matchSummary,
    },
    originalBullets: response.parsedBullets,
    improvedBullets: response.improvedBullets,
    validationScore: response.validationScore,
    gaps: response.gaps,
    retryCount: response.retryCount,
  };
};
