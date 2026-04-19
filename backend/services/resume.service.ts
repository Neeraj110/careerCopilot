import pdfParse from "pdf-parse";
import { buildCVPipeline } from "../agent/cvPipeline.js";
import { createLLM } from "../libs/ai.js";
import { parseJsonFromText } from "../libs/json.js";
import { prisma } from "../libs/prisma.js";
import type {
  ATSAnalysisResult,
  ResumeAlignmentResult,
  UploadCvResponse,
} from "../types/resume.types.js";

class ResumeService {
  async uploadCv(
    userId: string,
    file: Express.Multer.File,
  ): Promise<UploadCvResponse> {
    if (file.mimetype !== "application/pdf") {
      throw new Error("Only PDF files are supported");
    }

    const parsedPdf = await pdfParse(file.buffer);
    const rawText = parsedPdf.text?.trim();

    if (!rawText) {
      throw new Error("Unable to extract text from the uploaded PDF");
    }

    const resume = await prisma.resume.upsert({
      where: { userId },
      create: {
        userId,
        fileName: file.originalname,
        rawText,
        skills: [],
      },
      update: {
        fileName: file.originalname,
        rawText,
        skills: [],
        vectorId: null,
      },
    });

    const pipeline = buildCVPipeline();
    void pipeline.invoke({
      resumeId: resume.id,
      userId,
      rawText,
      skills: [],
      vectorId: "",
    });

    return {
      message: "CV uploaded successfully",
      resumeId: resume.id,
    };
  }

  async getAtsScore(
    userId: string,
    jobDescription: string,
  ): Promise<ATSAnalysisResult> {
    const resume = await prisma.resume.findUnique({
      where: { userId },
    });

    if (!resume) {
      throw new Error("Resume not found");
    }

    const llm = createLLM(0);
    const response =
      await llm.invoke(`You are an ATS (Applicant Tracking System) expert.
Analyze this resume against the job description.
Return a JSON object with exactly these fields:
{
  score: number (0-100),
  matchedKeywords: string[],
  missingKeywords: string[],
  suggestions: string[]
}
Resume: ${resume.rawText}
Job Description: ${jobDescription}`);

    const content =
      typeof response.content === "string"
        ? response.content
        : JSON.stringify(response.content);

    return parseJsonFromText<ATSAnalysisResult>(content);
  }

  async getAlignment(
    userId: string,
    jobDescription: string,
  ): Promise<ResumeAlignmentResult> {
    const resume = await prisma.resume.findUnique({
      where: { userId },
    });

    if (!resume) {
      throw new Error("Resume not found");
    }

    const llm = createLLM(0);
    const response = await llm.invoke(`You are a professional resume coach.
Compare this resume to the job description and provide specific improvements.
Return a JSON object with:
{
  alignmentScore: number (0-100),
  strongMatches: string[],
  gaps: string[],
  suggestedEdits: Array<{ section: string, original: string, improved: string }>,
  summaryAdvice: string
}
Resume: ${resume.rawText}
Job Description: ${jobDescription}`);

    const content =
      typeof response.content === "string"
        ? response.content
        : JSON.stringify(response.content);

    return parseJsonFromText<ResumeAlignmentResult>(content);
  }
}

export const resumeService = new ResumeService();
