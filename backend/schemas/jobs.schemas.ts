import { z } from "zod";

export const coverLetterSchema = z.object({
  jobId: z.string().trim().min(1, "jobId is required"),
});
