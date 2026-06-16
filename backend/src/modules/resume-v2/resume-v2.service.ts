import { ChatMistralAI } from "@langchain/mistralai";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { z } from "zod";
import * as Diff from "diff";
import { extractText } from "../document/document.service";
import axios from "axios";
import { prisma } from "../../infrastructure/prisma";
import { AppError } from "../../middlewares/errorHandler";
import { config } from "../../config";

const llm = new ChatMistralAI({
  apiKey: config.mistralApiKey,
  model: "mistral-small-latest",
  temperature: 0.3,
  maxRetries: 2,
});

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

  // Since Cloudinary raw files may return 401 due to strict delivery settings,
  // we can reconstruct the text from the Chunks! The AI is robust to chunk overlaps.
  const chunks = await prisma.chunk.findMany({
    where: { documentId },
  });

  if (!chunks.length) throw new AppError("Document has no extracted chunks", 400);

  // Sort chunks by chunkIndex in metadata
  chunks.sort((a, b) => {
    const aMeta = a.metadata as any;
    const bMeta = b.metadata as any;
    return (aMeta?.chunkIndex || 0) - (bMeta?.chunkIndex || 0);
  });

  const rawText = chunks.map(c => c.content).join("\n\n");

  if (!rawText || !rawText.trim()) throw new AppError("Document has no extracted text", 400);

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
    parsed = await structuredLlm.invoke([
      new SystemMessage(
        "You are an expert ATS analyst. Score resumes, find issues, suggest rewrites.",
      ),
      new HumanMessage(prompt),
    ]);
  } catch (error) {
    console.error("AI Analysis Error:", error);
    throw new AppError("Failed to parse AI analysis", 500);
  }

  const analysis = await prisma.analysis.create({
    data: {
      resumeId,
      versionId,
      atsScore: parsed.atsScore ?? 0,
      targetRole: targetRole || null,
      summary: parsed.summary || null,
      model: "mistral-small-latest",
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

  // Parse the new text
  const parsed = await parseResumeWithAI(newText);

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
    include: {
      versions: { orderBy: { createdAt: "asc" } },
      analyses: { orderBy: { createdAt: "asc" } },
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

// ── History ────────────────────────────────────────────────────────────
export const getHistory = async (userId: string) => {
  const [versions, analyses] = await Promise.all([
    prisma.resumeVersion.findMany({
      where: { resume: { userId } },
      include: { resume: { select: { id: true, title: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.analysis.findMany({
      where: { resume: { userId } },
      include: {
        resume: { select: { id: true, title: true } },
        version: { select: { label: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const events: any[] = [];

  for (const v of versions) {
    events.push({
      id: v.id,
      type: v.sourceType === "upload" ? "upload" : "rewrite",
      title:
        v.sourceType === "upload"
          ? `${v.resume.title} uploaded`
          : `${v.label} created (rewrite)`,
      subtitle: v.resume.title,
      label: v.label,
      resumeId: v.resume.id,
      at: v.createdAt,
    });
  }

  for (const a of analyses) {
    events.push({
      id: a.id,
      type: "analyze",
      title: `Analysis complete on ${a.version.label}`,
      subtitle: `ATS score ${a.atsScore} / 100`,
      label: `${a.atsScore} pts`,
      resumeId: a.resume.id,
      at: a.createdAt,
    });
  }

  events.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

  const totals: Record<string, number> = { all: events.length };
  for (const e of events) {
    totals[e.type] = (totals[e.type] || 0) + 1;
  }

  return { events, totals };
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
    name: z.string().optional(),
    title: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    location: z.string().optional(),
    links: z.array(z.object({ label: z.string(), url: z.string() })).optional(),
  }).optional(),
  summary: z.string().optional(),
  experience: z.array(z.object({
    role: z.string().optional(),
    company: z.string().optional(),
    period: z.string().optional(),
    bullets: z.array(z.string()).optional()
  })).optional(),
  education: z.array(z.object({
    degree: z.string().optional(),
    school: z.string().optional(),
    year: z.string().optional()
  })).optional(),
  skills: z.array(z.string()).optional(),
  projects: z.array(z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    tech: z.array(z.string()).optional()
  })).optional(),
  certifications: z.array(z.object({
    name: z.string().optional(),
    year: z.string().optional()
  })).optional(),
  languages: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional()
});

async function parseResumeWithAI(rawText: string) {
  const structuredLlm = llm.withStructuredOutput(ParsedResumeSchema, { name: "parse_resume" });
  
  try {
    return await structuredLlm.invoke([
      new SystemMessage("You parse resume text into structured sections. Extract as much information as possible from the provided text."),
      new HumanMessage(`Parse this resume:\n\n${rawText}`),
    ]);
  } catch (error) {
    console.error("AI Parsing Error:", error);
    return { basics: {}, summary: "", experience: [], education: [], skills: [], projects: [], certifications: [], languages: [], interests: [] };
  }
}
