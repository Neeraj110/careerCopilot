import { z } from "zod";

export const atsCheckSchema = z.object({
  documentId: z.string().uuid("Invalid document ID"),
});

export const jdMatchSchema = z.object({
  documentId: z.string().uuid("Invalid document ID"),
  jd: z.string().min(1, "Job description is required"),
});

export const improveResumeSchema = z.object({
  documentId: z.string().uuid("Invalid document ID"),
  jdText: z.string().min(1, "Job description text is required"),
});
