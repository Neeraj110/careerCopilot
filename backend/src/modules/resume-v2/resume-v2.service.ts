import axios from "axios";
import {
  createGeminiModel,
  recordAiCall,
  isTransientAiError,
  withAiRetry,
} from "../../infrastructure/ai";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { z } from "zod";
import * as Diff from "diff";
import { prisma } from "../../infrastructure/prisma";
import { AppError } from "../../middlewares/errorHandler";
import { config } from "../../config";
import { generateResumeLatex } from "../../utils/latexGenerator";
import { extractText } from "../document/document.service";

export const llm = createGeminiModel(config.geminiApiKey);

// ── List resumes (shallow) ─────────────────────────────────────────────
export const listResumes = async (userId: string) => {
  const resumes = await prisma.resume.findMany({
    where: { userId },
    include: {
      versions: { select: { id: true, label: true, sourceType: true, createdAt: true } },
      analyses: { select: { id: true, atsScore: true, versionId: true, createdAt: true }, orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
  });

  return resumes.map((r) => ({
    _id: r.id,
    title: r.title,
    versionsCount: r.versions.length,
    latestScore: r.analyses[0]?.atsScore ?? null,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }));
};

// ── Upload & parse resume ──────────────────────────────────────────────
export const createFromDocument = async (userId: string, documentId: string) => {
  const doc = await prisma.document.findFirst({
    where: { id: documentId, userId }
  });

  if (!doc) throw new AppError("Document not found", 404);

  // 1. Try to reconstruct text from Chunks
  let chunks = await prisma.chunk.findMany({
    where: { documentId },
  });

  // If document is processing, wait briefly for chunks to complete
  if (!chunks.length && (doc.status === "PENDING" || doc.status === "PROCESSING")) {
    await new Promise((r) => setTimeout(r, 2000));
    chunks = await prisma.chunk.findMany({
      where: { documentId },
    });
  }

  let rawText = "";

  if (chunks.length > 0) {
    // Sort chunks by chunkIndex in metadata
    chunks.sort((a, b) => {
      const aMeta = a.metadata as any;
      const bMeta = b.metadata as any;
      return (aMeta?.chunkIndex || 0) - (bMeta?.chunkIndex || 0);
    });
    rawText = chunks.map(c => c.content).join("\n\n");
  }

  // 2. Fallback: if no chunks in database, attempt direct text extraction from fileUrl
  if (!rawText.trim() && doc.fileUrl) {
    try {
      const fileRes = await axios.get(doc.fileUrl, { responseType: "arraybuffer" });
      const buffer = Buffer.from(fileRes.data);
      const mimeType =
        doc.type === "PDF"
          ? "application/pdf"
          : doc.type === "DOCX"
          ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          : "text/plain";
      rawText = await extractText(buffer, mimeType);
    } catch (fetchErr) {
      console.warn("Direct file download/extraction fallback failed:", fetchErr);
    }
  }

  if (!rawText || !rawText.trim()) {
    if (doc.status === "PENDING" || doc.status === "PROCESSING") {
      throw new AppError("Document is still being processed. Please wait a moment and try again.", 400);
    }
    throw new AppError("Document has no extracted text. Please re-upload the document.", 400);
  }

  // Parse resume sections with AI
  const parsed = await parseResumeWithAI(rawText);

  const resume = await prisma.resume.create({
    data: {
      userId,
      title: doc.title,
      versions: {
        create: {
          label: "V1",
          sourceType: "upload",
          rawText: rawText,
          parsedSections: parsed as any,
        },
      },
    },
    include: { versions: true },
  });

  // Set currentVersionId
  await prisma.resume.update({
    where: { id: resume.id },
    data: { currentVersionId: resume.versions[0].id },
  });

  return { ...resume, currentVersionId: resume.versions[0].id };
};

// ── Get resume with versions ───────────────────────────────────────────
export const getResume = async (userId: string, resumeId: string) => {
  const resume = await prisma.resume.findFirst({
    where: { id: resumeId, userId },
    include: {
      versions: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!resume) throw new AppError("Resume not found", 404);

  return {
    resume: {
      _id: resume.id,
      title: resume.title,
      currentVersionId: resume.currentVersionId,
      createdAt: resume.createdAt,
      updatedAt: resume.updatedAt,
    },
    versions: resume.versions.map((v) => ({
      _id: v.id,
      label: v.label,
      sourceType: v.sourceType,
      parsedSections: v.parsedSections,
      rawText: v.rawText,
      createdAt: v.createdAt,
    })),
  };
};

// ── Get full version ───────────────────────────────────────────────────
export const getVersion = async (userId: string, resumeId: string, versionId: string) => {
  const resume = await prisma.resume.findFirst({ where: { id: resumeId, userId } });
  if (!resume) throw new AppError("Resume not found", 404);

  const version = await prisma.resumeVersion.findFirst({
    where: { id: versionId, resumeId },
  });
  if (!version) throw new AppError("Version not found", 404);

  return {
    _id: version.id,
    label: version.label,
    sourceType: version.sourceType,
    parsedSections: version.parsedSections,
    rawText: version.rawText,
    createdAt: version.createdAt,
  };
};

// ── Get Diff ───────────────────────────────────────────────────────────
export const getDiff = async (userId: string, resumeId: string, fromId: string, toId: string, mode: "words" | "lines" = "words") => {
  const [fromVersion, toVersion] = await Promise.all([
    prisma.resumeVersion.findFirst({ where: { id: fromId, resumeId, resume: { userId } } }),
    prisma.resumeVersion.findFirst({ where: { id: toId, resumeId, resume: { userId } } })
  ]);

  if (!fromVersion || !toVersion) {
    throw new AppError("One or both versions not found", 404);
  }

  const text1 = fromVersion.rawText || JSON.stringify(fromVersion.parsedSections, null, 2);
  const text2 = toVersion.rawText || JSON.stringify(toVersion.parsedSections, null, 2);

  const parts = mode === "lines" 
    ? Diff.diffLines(text1, text2) 
    : Diff.diffWords(text1, text2);

  let added = 0;
  let removed = 0;

  parts.forEach(part => {
    if (part.added) added += part.value.length;
    if (part.removed) removed += part.value.length;
  });

  return {
    parts,
    stats: { added, removed }
  };
};

// ── Analyze a version ──────────────────────────────────────────────────
export const analyzeVersion = async (
  userId: string,
  resumeId: string,
  versionId: string,
  targetRole?: string,
) => {
  const resume = await prisma.resume.findFirst({ where: { id: resumeId, userId } });
  if (!resume) throw new AppError("Resume not found", 404);

  const version = await prisma.resumeVersion.findFirst({
    where: { id: versionId, resumeId },
  });
  if (!version) throw new AppError("Version not found", 404);

  const resumeText = version.rawText || JSON.stringify(version.parsedSections);

  const AnalysisSchema = z.object({
    atsScore: z.number(),
    summary: z.string(),
    scoreBreakdown: z.object({
      formatting: z.number(),
      keywords: z.number(),
      experience: z.number(),
      skills: z.number(),
      overall: z.number()
    }),
    issues: z.array(z.object({
      title: z.string(),
      description: z.string(),
      severity: z.enum(["low", "medium", "high"]),
      section: z.string()
    })).optional(),
    strengths: z.array(z.object({
      title: z.string(),
      description: z.string()
    })).optional(),
    keywordsPresent: z.array(z.string()).optional(),
    keywordsMissing: z.array(z.string()).optional(),
    bulletRewrites: z.array(z.object({
      id: z.string(),
      original: z.string(),
      rewritten: z.string(),
      section: z.string(),
      reason: z.string()
    })).optional()
  });

  const prompt = `Analyze this resume${targetRole ? ` for the role: ${targetRole}` : ""}.
  
RESUME:
${resumeText}`;

  const structuredLlm = llm.withStructuredOutput(AnalysisSchema, { name: "analyze_resume" });
  let parsed: z.infer<typeof AnalysisSchema>;

  try {
    recordAiCall("gemini-resume", "resume-v2.analyze");
    parsed = await withAiRetry(() =>
      structuredLlm.invoke([
        new SystemMessage(
          "You are an expert ATS analyst. Score resumes, find issues, suggest rewrites.",
        ),
        new HumanMessage(prompt),
      ]),
    );
  } catch (error) {
    console.error("AI Analysis Error:", error);
    if (isTransientAiError(error)) {
      throw new AppError("AI is busy, please retry in a moment", 503);
    }
    throw new AppError("Failed to parse AI analysis", 500);
  }

  const analysis = await prisma.analysis.create({
    data: {
      resumeId,
      versionId,
      atsScore: parsed.atsScore ?? 0,
      targetRole: targetRole || null,
      summary: parsed.summary || null,
      model: config.geminiModel,
      scoreBreakdown: parsed.scoreBreakdown || null,
      issues: parsed.issues || [],
      strengths: parsed.strengths || [],
      keywordsPresent: parsed.keywordsPresent || [],
      keywordsMissing: parsed.keywordsMissing || [],
      bulletRewrites: parsed.bulletRewrites || [],
    },
  });

  return analysis;
};

// ── Get analysis for a version ─────────────────────────────────────────
export const getAnalysisForVersion = async (userId: string, resumeId: string, versionId: string) => {
  const resume = await prisma.resume.findFirst({ where: { id: resumeId, userId } });
  if (!resume) throw new AppError("Resume not found", 404);

  const analysis = await prisma.analysis.findFirst({
    where: { resumeId, versionId },
    orderBy: { createdAt: "desc" },
  });

  if (!analysis) throw new AppError("No analysis for this version", 404);
  return analysis;
};

// ── Apply rewrites → create new version ────────────────────────────────
export const applyRewrites = async (
  userId: string,
  resumeId: string,
  analysisId: string,
  rewriteIds?: string[],
) => {
  const resume = await prisma.resume.findFirst({
    where: { id: resumeId, userId },
    include: { versions: { orderBy: { createdAt: "asc" } } },
  });
  if (!resume) throw new AppError("Resume not found", 404);

  const analysis = await prisma.analysis.findFirst({
    where: { id: analysisId, resumeId },
  });
  if (!analysis) throw new AppError("Analysis not found", 404);

  const sourceVersion = await prisma.resumeVersion.findFirst({
    where: { id: analysis.versionId },
  });
  if (!sourceVersion) throw new AppError("Source version not found", 404);

  // Apply rewrites to the text
  const allRewrites = (analysis.bulletRewrites as any[]) || [];
  const toApply = rewriteIds?.length
    ? allRewrites.filter((r: any) => rewriteIds.includes(r.id))
    : allRewrites;

  let newText = sourceVersion.rawText || "";
  for (const rw of toApply) {
    if (rw.original && rw.rewritten) {
      newText = newText.replace(rw.original, rw.rewritten);
    }
  }

  // Clone source parsedSections to ensure we preserve all skills categories, projects, links, etc.
  const baseSections = (sourceVersion.parsedSections
    ? JSON.parse(JSON.stringify(sourceVersion.parsedSections))
    : {}) as any;

  // Apply rewrites directly onto baseSections (both experience bullets and project bullets)
  for (const rw of toApply) {
    if (!rw.original || !rw.rewritten) continue;
    const orig = rw.original.trim();
    const rew = rw.rewritten.trim();

    // In experience
    if (Array.isArray(baseSections.experience)) {
      for (const exp of baseSections.experience) {
        if (Array.isArray(exp.bullets)) {
          exp.bullets = exp.bullets.map((b: string) => {
            if (b.trim() === orig || b.includes(orig)) {
              return b.replace(orig, rew);
            }
            return b;
          });
        }
      }
    }

    // In projects
    if (Array.isArray(baseSections.projects)) {
      for (const proj of baseSections.projects) {
        if (Array.isArray(proj.bullets)) {
          proj.bullets = proj.bullets.map((b: string) => {
            if (b.trim() === orig || b.includes(orig)) {
              return b.replace(orig, rew);
            }
            return b;
          });
        }
      }
    }

    // In summary
    if (typeof baseSections.summary === "string" && baseSections.summary.includes(orig)) {
      baseSections.summary = baseSections.summary.replace(orig, rew);
    }
  }

  // Also attempt AI parse to capture any new structuring with baseSections preservation
  let parsed = baseSections;
  try {
    const aiParsed = await parseResumeWithAI(newText);
    if (aiParsed) {
      parsed = {
        ...baseSections,
        ...aiParsed,
        basics: { ...(baseSections.basics || {}), ...(aiParsed.basics || {}) },
        skills: aiParsed.skills?.length ? aiParsed.skills : baseSections.skills,
        experience: aiParsed.experience?.length ? aiParsed.experience : baseSections.experience,
        projects: aiParsed.projects?.length ? aiParsed.projects : baseSections.projects,
        education: aiParsed.education?.length ? aiParsed.education : baseSections.education,
      };
    }
  } catch (err) {
    console.warn("AI parsing after rewrites had warning; using high-fidelity preserved sections with updated rewrites:", err);
  }

  const newLabel = `V${resume.versions.length + 1}`;
  const newVersion = await prisma.resumeVersion.create({
    data: {
      resumeId,
      label: newLabel,
      sourceType: "rewrite",
      rawText: newText,
      parsedSections: parsed as any,
    },
  });

  await prisma.resume.update({
    where: { id: resumeId },
    data: { currentVersionId: newVersion.id },
  });

  return { version: newVersion, appliedCount: toApply.length };
};

// ── Get Resume LaTeX (Overleaf Ready) ──────────────────────────────────
export const getResumeLatex = async (userId: string, resumeId: string, versionId: string) => {
  const resume = await prisma.resume.findFirst({ where: { id: resumeId, userId } });
  if (!resume) throw new AppError("Resume not found", 404);

  const version = await prisma.resumeVersion.findFirst({
    where: { id: versionId, resumeId },
  });
  if (!version) throw new AppError("Version not found", 404);

  const latex = generateResumeLatex(version.parsedSections);
  return {
    latex,
    label: version.label,
    title: resume.title,
  };
};

// ── Delete resume ──────────────────────────────────────────────────────
export const deleteResume = async (userId: string, resumeId: string) => {
  const resume = await prisma.resume.findFirst({ where: { id: resumeId, userId } });
  if (!resume) throw new AppError("Resume not found", 404);
  await prisma.resume.delete({ where: { id: resumeId } });
  return { ok: true };
};

// ── Dashboard aggregation ──────────────────────────────────────────────
export const getDashboard = async (userId: string) => {
  const resumes = await prisma.resume.findMany({
    where: { userId },
    select: {
      id: true,
      title: true,
      updatedAt: true,
      versions: {
        select: {
          id: true,
          label: true,
          sourceType: true,
          createdAt: true,
        },
        orderBy: { createdAt: "asc" },
      },
      analyses: {
        select: {
          id: true,
          versionId: true,
          atsScore: true,
          issues: true,
          keywordsPresent: true,
          keywordsMissing: true,
          createdAt: true,
        },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const totalResumes = resumes.length;
  const allVersions = resumes.flatMap((r) => r.versions);
  const allAnalyses = resumes.flatMap((r) => r.analyses);
  const totalRewrites = allVersions.filter((v) => v.sourceType === "rewrite").length;

  const latestAnalysis = allAnalyses.length ? allAnalyses[allAnalyses.length - 1] : null;
  const firstAnalysis = allAnalyses.length ? allAnalyses[0] : null;

  const scoreSeries = allAnalyses.map((a) => ({
    label: allVersions.find((v) => v.id === a.versionId)?.label || "?",
    score: a.atsScore,
  }));

  const latestResume = resumes[0];
  const versionStack = latestResume
    ? latestResume.versions.map((v) => {
        const vAnalysis = latestResume.analyses.find((a) => a.versionId === v.id);
        return {
          id: v.id,
          label: v.label,
          sourceType: v.sourceType,
          score: vAnalysis?.atsScore ?? null,
          createdAt: v.createdAt,
        };
      })
    : [];

  // Count total issues
  const totalIssues = allAnalyses.reduce((sum, a) => sum + ((a.issues as any[])?.length || 0), 0);
  const totalKeywordsMatched = allAnalyses.reduce(
    (sum, a) => sum + ((a.keywordsPresent as any[])?.length || 0),
    0,
  );
  const totalKeywords = totalKeywordsMatched + allAnalyses.reduce(
    (sum, a) => sum + ((a.keywordsMissing as any[])?.length || 0),
    0,
  );

  return {
    totals: { resumes: totalResumes, rewrites: totalRewrites, analyses: allAnalyses.length },
    latestResume: latestResume ? { _id: latestResume.id, title: latestResume.title } : null,
    scoreSeries,
    versionStack,
    kpi: {
      atsScore: {
        value: latestAnalysis?.atsScore ?? null,
        delta: latestAnalysis && firstAnalysis ? latestAnalysis.atsScore - firstAnalysis.atsScore : 0,
        spark: scoreSeries.map((s) => ({ v: s.score })),
      },
      versions: {
        value: allVersions.length,
        spark: allVersions.map((_, i) => ({ v: i + 1 })),
      },
      issuesIdentified: {
        value: totalIssues,
        delta: 0,
        spark: allAnalyses.map((a) => ({ v: (a.issues as any[])?.length || 0 })),
      },
      keywordsMatched: {
        value: totalKeywordsMatched,
        total: totalKeywords,
        delta: 0,
        spark: allAnalyses.map((a) => ({ v: (a.keywordsPresent as any[])?.length || 0 })),
      },
    },
    activity: allAnalyses
      .slice(-10)
      .reverse()
      .map((a) => {
        const ver = allVersions.find((v) => v.id === a.versionId);
        return {
          id: a.id,
          type: "analyze",
          title: `Analysis complete on ${ver?.label || "version"}`,
          subtitle: `ATS score ${a.atsScore} / 100`,
          label: `${a.atsScore} pts`,
          at: a.createdAt,
        };
      }),
  };
};

// ── Insights ───────────────────────────────────────────────────────────
export const getInsights = async (userId: string) => {
  const analyses = await prisma.analysis.findMany({
    where: { resume: { userId } },
    include: { resume: { select: { id: true, title: true } }, version: { select: { label: true } } },
    orderBy: { createdAt: "asc" },
  });

  if (!analyses.length) return { empty: true };

  const scores = analyses.map((a) => a.atsScore);
  const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const bestIdx = scores.indexOf(Math.max(...scores));

  // Top issues
  const issueMap = new Map<string, { title: string; severity: string; count: number }>();
  for (const a of analyses) {
    for (const issue of (a.issues as any[]) || []) {
      const key = issue.title;
      const existing = issueMap.get(key);
      if (existing) existing.count++;
      else issueMap.set(key, { title: issue.title, severity: issue.severity, count: 1 });
    }
  }

  // Top missing keywords
  const kwMap = new Map<string, number>();
  const kwPresentMap = new Map<string, number>();
  for (const a of analyses) {
    for (const kw of (a.keywordsMissing as string[]) || []) {
      kwMap.set(kw, (kwMap.get(kw) || 0) + 1);
    }
    for (const kw of (a.keywordsPresent as string[]) || []) {
      kwPresentMap.set(kw, (kwPresentMap.get(kw) || 0) + 1);
    }
  }

  // Per-resume performance
  const resumeMap = new Map<string, any>();
  for (const a of analyses) {
    const key = a.resumeId;
    if (!resumeMap.has(key)) {
      resumeMap.set(key, {
        resumeId: a.resumeId,
        title: a.resume.title,
        scores: [],
        count: 0,
      });
    }
    const entry = resumeMap.get(key)!;
    entry.scores.push(a.atsScore);
    entry.count++;
  }

  return {
    averageScore: avgScore,
    bestScore: { value: scores[bestIdx], resumeTitle: analyses[bestIdx].resume.title },
    totalAnalyses: analyses.length,
    scoreTrend: analyses.map((a) => ({
      score: a.atsScore,
      at: a.createdAt,
      resumeTitle: a.resume.title,
    })),
    topIssues: Array.from(issueMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 8),
    topMissingKeywords: Array.from(kwMap.entries())
      .map(([keyword, count]) => ({ keyword, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15),
    topPresentKeywords: Array.from(kwPresentMap.entries())
      .map(([keyword, count]) => ({ keyword, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15),
    resumePerformance: Array.from(resumeMap.values()).map((r) => ({
      resumeId: r.resumeId,
      title: r.title,
      latestScore: r.scores[r.scores.length - 1],
      bestScore: Math.max(...r.scores),
      improvement: r.scores[r.scores.length - 1] - r.scores[0],
      analysesCount: r.count,
    })),
  };
};

// ── All versions ───────────────────────────────────────────────────────
export const getAllVersions = async (userId: string) => {
  const versions = await prisma.resumeVersion.findMany({
    where: { resume: { userId } },
    include: {
      resume: { select: { id: true, title: true } },
      analyses: { select: { atsScore: true }, orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  const uploads = versions.filter((v) => v.sourceType === "upload").length;
  const rewrites = versions.filter((v) => v.sourceType === "rewrite").length;

  return {
    totals: { all: versions.length, uploads, rewrites },
    versions: versions.map((v) => ({
      id: v.id,
      label: v.label,
      sourceType: v.sourceType,
      resumeId: v.resume.id,
      resumeTitle: v.resume.title,
      score: v.analyses[0]?.atsScore ?? null,
      createdAt: v.createdAt,
    })),
  };
};

// ── Update profile ─────────────────────────────────────────────────────
export const updateProfile = async (userId: string, data: { name?: string }) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { name: data.name },
    select: { id: true, email: true, name: true },
  });
  return user;
};

// ── Helper: Parse resume text with AI ──────────────────────────────────
const ParsedResumeSchema = z.object({
  basics: z.object({
    name: z.string().optional().describe("Candidate full name"),
    title: z.string().optional().describe("Professional title e.g. Full Stack Developer"),
    email: z.string().optional(),
    phone: z.string().optional(),
    location: z.string().optional().describe("City, Country e.g. Delhi, India"),
    github: z.string().optional().describe("GitHub profile URL or username e.g. github.com/Neeraj110"),
    linkedin: z.string().optional().describe("LinkedIn profile URL or username e.g. linkedin.com/in/neerajgaur12"),
    portfolio: z.string().optional().describe("Portfolio website URL or link label"),
    links: z.array(z.object({ label: z.string(), url: z.string() })).optional(),
  }).optional(),
  summary: z.string().optional().describe("Professional summary paragraph"),
  skills: z.array(z.string()).optional().describe("Technical skills. If the resume categorizes skills (e.g. Frontend, Backend, AI Tools, Tools & Platforms, Languages), format each item as 'Category: skill1, skill2, skill3' to preserve the exact grouping."),
  experience: z.array(z.object({
    role: z.string().optional().describe("Job title or designation"),
    company: z.string().optional().describe("Company or organization name"),
    location: z.string().optional().describe("Company location e.g. New Delhi"),
    period: z.string().optional().describe("Dates worked e.g. August 2025 - February 2026"),
    bullets: z.array(z.string()).optional().describe("Achievement and responsibility bullet points")
  })).optional(),
  projects: z.array(z.object({
    name: z.string().optional().describe("Project name"),
    subtitle: z.string().optional().describe("One-line italic tagline or description of the project"),
    link: z.string().optional().describe("Live demo link, GitHub link or URL"),
    bullets: z.array(z.string()).optional().describe("Key feature or achievement bullet points for the project"),
    tech: z.array(z.string()).optional().describe("Tech stack list e.g. ['Next.js', 'TypeScript', 'Node.js', 'PostgreSQL']")
  })).optional(),
  education: z.array(z.object({
    degree: z.string().optional().describe("Degree or diploma e.g. Bachelor of Computer Applications (BCA)"),
    school: z.string().optional().describe("University, college or school name"),
    location: z.string().optional().describe("Location e.g. Faridabad"),
    year: z.string().optional().describe("Graduation year or date range e.g. 2022 - 2025"),
    score: z.string().optional().describe("CGPA, GPA or percentage e.g. 'CGPA: 7.0' or 'Score: 75%'")
  })).optional(),
  certifications: z.array(z.object({
    name: z.string().optional(),
    year: z.string().optional()
  })).optional(),
  languages: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional()
});

export async function parseResumeWithAI(rawText: string) {
  const structuredLlm = llm.withStructuredOutput(ParsedResumeSchema, { name: "parse_resume" });
  
  try {
    recordAiCall("gemini-resume", "resume-v2.parse");
    return await withAiRetry(() =>
      structuredLlm.invoke([
        new SystemMessage(
          "You are an expert resume parser. Parse resume text into structured sections. " +
          "Extract all information accurately: candidate contact info (including GitHub, LinkedIn, Portfolio), " +
          "categorized skills with 'Category: item1, item2, ...' (e.g. 'Frontend: React.js, Next.js', 'Backend: Node.js, Express.js', 'AI Tools: LangChain, Gemini API', 'Tools & Platforms: Git, Postman'), " +
          "all experience bullet points, all project details (name, subtitle, live link, bullets, and tech stack), and education details (degree, school, year, score/cgpa)."
        ),
        new HumanMessage(`Parse this resume:\n\n${rawText}`),
      ]),
    );
  } catch (error) {
    console.error("AI Parsing Error:", error);
    if (isTransientAiError(error)) {
      throw new AppError("AI is busy, please retry in a moment", 503);
    }
    throw new AppError(
      "Resume text was extracted, but AI parsing failed. Please retry the upload.",
      502,
    );
  }
}
