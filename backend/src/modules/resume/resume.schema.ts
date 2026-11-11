import { z } from "zod";

export const atsCheckSchema = z.object({
  documentId: z.string().uuid("Invalid document ID"),
});

export const jdMatchSchema = z.object({
  documentId: z.string().uuid("Invalid document ID"),
  jd: z.string().trim().min(1, "Job description is required").max(20_000),
});

export const improveResumeSchema = z.object({
  documentId: z.string().uuid("Invalid document ID"),
  jdText: z.string().trim().min(1, "Job description text is required").max(20_000),
});
