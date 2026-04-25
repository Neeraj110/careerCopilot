import pdfParse from "pdf-parse";
import { buildCVPipeline } from "../agent/cvPipeline.js";
import { createLLM } from "../libs/ai.js";
import { parseJsonFromText } from "../libs/json.js";
import { prisma } from "../libs/prisma.js";
import fs from "node:fs";
import { uploadCvToCloudinary } from "./cvStorage.service.js";
import type {
  ATSAnalysisResult,
  ResumeAlignmentResult,
  UploadCvResponse,
} from "../types/resume.types.js";

class ResumeService {
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

  private async processResumeWithRetry(
    resumeId: string,
    userId: string,
    rawText: string,
    maxTries: number = 3,
  ) {
    const pipeline = buildCVPipeline();

    for (let attempt = 1; attempt <= maxTries; attempt += 1) {
      try {
        await pipeline.invoke({
          resumeId,
          userId,
          rawText,
          skills: [],
          vectorId: "",
        });

        const refreshedResume = await prisma.resume.findUnique({
          where: { id: resumeId },
          select: { vectorId: true },
        });

        if (refreshedResume?.vectorId) {
          return;
        }
      } catch (error) {
        console.warn(
          `CV pipeline failed on attempt ${attempt}/${maxTries} for resume ${resumeId}`,
          error,
        );
      }
    }

    console.warn(
      `Vectorization failed after ${maxTries} attempts for resume ${resumeId}`,
    );
  }

  async uploadCv(
    userId: string,
    file: Express.Multer.File,
  ): Promise<UploadCvResponse> {
    if (file.mimetype !== "application/pdf") {
      throw new Error("Only PDF files are supported");
    }

    if (!file.path) {
      throw new Error("File path is missing. File might not have been saved.");
    }

    const fileBuffer = fs.readFileSync(file.path);
    const parsedPdf = await pdfParse(fileBuffer);
    const rawText = parsedPdf.text?.trim();

    if (!rawText) {
      throw new Error("Unable to extract text from the uploaded PDF");
    }

    // Upload to Cloudinary
    let secureUrl = null;
    try {
      const uploadedCv = await uploadCvToCloudinary(file);
      secureUrl = uploadedCv.secureUrl;
    } catch (err) {
      console.warn(
        "Cloudinary upload failed, but processing resume anyway.",
        err,
      );
    }

    const resume = await prisma.$transaction(async (tx) => {
      await tx.resume.updateMany({
        where: { userId, isActive: true },
        data: { isActive: false },
      });

      return tx.resume.create({
        data: {
          userId,
          fileName: file.originalname,
          fileUrl: secureUrl,
          rawText,
          skills: [],
          vectorId: null,
          isActive: true,
        },
      });
    });

    void this.processResumeWithRetry(resume.id, userId, rawText, 3);

    return {
      message: "CV uploaded successfully",
      resumeId: resume.id,
    };
  }

  async getAtsScore(
    userId: string,
    jobDescription: string,
  ): Promise<ATSAnalysisResult> {
    const resume = await this.getLatestOrActiveResume(userId);

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
    const resume = await this.getLatestOrActiveResume(userId);

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

  async getStatus(userId: string) {
    const resumes = await prisma.resume.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        fileName: true,
        fileUrl: true,
        skills: true,
        vectorId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const activeResume = resumes.find((resume) => resume.isActive) ?? null;

    return {
      hasResume: resumes.length > 0,
      activeResumeId: activeResume?.id ?? null,
      skills: activeResume?.skills ?? [],
      fileName: activeResume?.fileName ?? null,
      fileUrl: activeResume?.fileUrl ?? null,
      hasVector: Boolean(activeResume?.vectorId),
      resumes: resumes.map((resume) => ({
        id: resume.id,
        fileName: resume.fileName,
        fileUrl: resume.fileUrl,
        createdAt: resume.createdAt,
        updatedAt: resume.updatedAt,
        skillsCount: resume.skills.length,
        hasVector: Boolean(resume.vectorId),
        isActive: resume.isActive,
      })),
    };
  }

  async selectActiveResume(userId: string, resumeId: string) {
    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId },
      select: { id: true },
    });

    if (!resume) {
      throw new Error("Resume not found");
    }

    await prisma.$transaction([
      prisma.resume.updateMany({
        where: { userId, isActive: true },
        data: { isActive: false },
      }),
      prisma.resume.update({
        where: { id: resumeId },
        data: { isActive: true },
      }),
    ]);

    return this.getStatus(userId);
  }
}

export const resumeService = new ResumeService();
