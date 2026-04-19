import { z } from "zod";

export const emailSchema = z.email("Valid email is required").trim().toLowerCase();
export const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters");
export const jobDescriptionSchema = z
  .string()
  .trim()
  .min(30, "jobDescription is required");
