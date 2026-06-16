import { z } from "zod";

export const uploadResumeSchema = z.object({
  title: z.string().min(1).optional(),
});

export const analyzeResumeSchema = z.object({
  versionId: z.string().uuid(),
  targetRole: z.string().optional(),
});

export const applyRewritesSchema = z.object({
  analysisId: z.string().uuid(),
  rewriteIds: z.array(z.string()).optional(),
});

export const diffSchema = z.object({
  from: z.string().uuid(),
  to: z.string().uuid(),
  mode: z.enum(["words", "lines"]).default("words"),
});
