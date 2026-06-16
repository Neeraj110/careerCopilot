import { ChatMistralAI } from "@langchain/mistralai";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { prisma } from "../../infrastructure/prisma";
import { AppError } from "../../middlewares/errorHandler";
import { config } from "../../config";
import { buildImprovementAgent } from "./agent/improvement.agent";

const rawSearchGroundedModel = new ChatMistralAI({
  apiKey: config.mistralApiKey,
  model: "mistral-small-latest",
  temperature: 1,
});

const searchGroundedModel = {
  invoke: (messages: any, options?: any) =>
    rawSearchGroundedModel.invoke(messages, { ...options, response_format: { type: "json_object" } }),
};

export const checkATS = async (userId: string, documentId: string) => {
  const document = await prisma.document.findFirst({
    where: { id: documentId, userId },
    include: {
      chunks: true,
    },
  });

  if (!document) throw new AppError("Document not found", 404);
  if (document.status !== "COMPLETED")
    throw new AppError("Document still processing", 400);

  const resumeText = document.chunks
    .sort(
      (a: { metadata: unknown }, b: { metadata: unknown }) =>
        ((a.metadata as Record<string, any>)?.chunkIndex ?? 0) -
        ((b.metadata as Record<string, any>)?.chunkIndex ?? 0),
    )
    .map((chunk: { content: string }) => chunk.content)
    .join("\n");

  const response = await searchGroundedModel.invoke([
    new SystemMessage(`
      You are an expert ATS (Applicant Tracking System) analyst with 
      access to real-time industry hiring data via Google Search.
      
      Your job:
      1. Analyze the resume against CURRENT industry standards (search if needed)
      2. Check latest in-demand skills for the candidate's role
      3. Identify missing keywords that modern ATS systems flag
      4. Give actionable improvements based on 2025-2026 hiring trends
      
      Always respond in this exact JSON format:
      {
        "atsScore": <number 0-100>,
        "role": "<detected role>",
        "missingKeywords": ["keyword1", "keyword2"],
        "presentKeywords": ["keyword1", "keyword2"],
        "industryTrends": ["trend1", "trend2"],
        "formattingIssues": ["issue1", "issue2"],
        "improvements": [
          {
            "section": "Skills",
            "current": "...",
            "suggested": "...",
            "reason": "..."
          }
        ],
        "overallFeedback": "..."
      }
      
      Return ONLY valid JSON, no markdown, no explanation outside JSON.
    `),
    new HumanMessage(`
      Analyze this resume using current industry standards.
      Search for latest ATS requirements and hiring trends for this role.
      
      RESUME:
      ${resumeText}
    `),
  ]);

  const content =
    typeof response.content === "string"
      ? response.content
      : JSON.stringify(response.content);

  try {
    return JSON.parse(content);
  } catch {
    throw new AppError("Failed to parse ATS analysis", 500);
  }
};

export const jdMatch = async (
  userId: string,
  documentId: string,
  jd: string,
) => {
  // 1. Document + chunks fetch
  const document = await prisma.document.findFirst({
    where: { id: documentId, userId },
    include: { chunks: true },
  });

  if (!document) throw new AppError("Document not found", 404);
  if (document.status !== "COMPLETED")
    throw new AppError("Document still processing", 400);

  // 2. Sort chunks by index and join
  const resumeText = document.chunks
    .sort(
      (a: { metadata: unknown }, b: { metadata: unknown }) =>
        ((a.metadata as Record<string, any>)?.chunkIndex ?? 0) -
        ((b.metadata as Record<string, any>)?.chunkIndex ?? 0),
    )
    .map((chunk: { content: string }) => chunk.content)
    .join("\n");

  // 3. JD Match specific prompt
  const response = await searchGroundedModel.invoke([
    new SystemMessage(`
      You are an expert recruiter and ATS specialist.
      You compare resumes against job descriptions to find match scores and gaps.
      You have access to Google Search to verify current skill requirements.

      Always respond in this exact JSON format, no markdown, no extra text:
      {
        "matchScore": <number 0-100>,
        "role": "<role from JD>",
        "strengths": ["skill1", "skill2"],
        "missingSkills": ["skill1", "skill2"],
        "partialMatches": [
          {
            "required": "AWS",
            "candidate": "basic cloud knowledge",
            "gap": "No hands-on AWS experience"
          }
        ],
        "recommendations": [
          {
            "skill": "GraphQL",
            "reason": "Mentioned 3 times in JD, absent in resume",
            "resource": "how to add GraphQL to resume"
          }
        ],
        "keywordsMissing": ["keyword1", "keyword2"],
        "overallFeedback": "..."
      }
    `),
    new HumanMessage(`
      Compare this resume against the job description below.
      Search for current market relevance of required skills if needed.

      JOB DESCRIPTION:
      ${jd}

      RESUME:
      ${resumeText}
    `),
  ]);

  // 4. Parse response
  const content =
    typeof response.content === "string"
      ? response.content
      : JSON.stringify(response.content);

  try {
    return JSON.parse(content);
  } catch {
    throw new AppError("Failed to parse JD match analysis", 500);
  }
};

export const improveResume = async (
  userId: string,
  documentId: string,
  jdText: string,
) => {
  const document = await prisma.document.findFirst({
    where: { id: documentId, userId },
    include: { chunks: true },
  });

  if (!document) throw new AppError("Document not found", 404);
  if (document.status !== "COMPLETED")
    throw new AppError("Document still processing", 400);

  const resumeText = document.chunks
    .sort(
      (a: { metadata: unknown }, b: { metadata: unknown }) =>
        ((a.metadata as Record<string, any>)?.chunkIndex ?? 0) -
        ((b.metadata as Record<string, any>)?.chunkIndex ?? 0),
    )
    .map((chunk: { content: string }) => chunk.content)
    .join("\n");

  const agent = buildImprovementAgent();

  const response = await agent.invoke({
    resumeText,
    jdText,
  });

  return {
    originalBullets: response.parsedBullets,
    improvedBullets: response.improvedBullets,
    validationScore: response.validationScore,
    gaps: response.gaps,
    retryCount: response.retryCount,
  };
};
