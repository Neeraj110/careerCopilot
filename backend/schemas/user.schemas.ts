import { z } from "zod";
import { emailSchema, passwordSchema } from "./shared.schemas.js";

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});
