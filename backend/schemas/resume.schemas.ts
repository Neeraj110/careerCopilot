import { z } from "zod";
import { jobDescriptionSchema } from "./shared.schemas.js";

export const atsRequestSchema = z.object({
  jobDescription: jobDescriptionSchema,
});

export const alignRequestSchema = z.object({
  jobDescription: jobDescriptionSchema,
});
