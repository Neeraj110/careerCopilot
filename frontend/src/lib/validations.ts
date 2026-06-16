import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email address"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const uploadDocumentSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
});

export const createChatSchema = z.object({
  documentId: z.string().optional(),
  title: z.string().min(1, "Title is required").max(100).optional(),
});

export const sendMessageSchema = z.object({
  message: z.string().min(1, "Message cannot be empty"),
});

export const atsCheckSchema = z.object({
  documentId: z.string().min(1, "Please select a document"),
});

export const jdMatchSchema = z.object({
  documentId: z.string().min(1, "Please select a document"),
  jd: z.string().min(10, "Job description must be at least 10 characters"),
});

export const improveResumeSchema = z.object({
  documentId: z.string().min(1, "Please select a document"),
  jdText: z.string().min(10, "Job description must be at least 10 characters"),
});

export const roadmapSchema = z.object({
  skill: z.string().min(1, "Skill is required"),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  targetGoal: z.string().min(5, "Please describe your goal"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type UploadDocumentFormValues = z.infer<typeof uploadDocumentSchema>;
export type CreateChatFormValues = z.infer<typeof createChatSchema>;
export type SendMessageFormValues = z.infer<typeof sendMessageSchema>;
export type ATSCheckFormValues = z.infer<typeof atsCheckSchema>;
export type JDMatchFormValues = z.infer<typeof jdMatchSchema>;
export type ImproveResumeFormValues = z.infer<typeof improveResumeSchema>;
export type RoadmapFormValues = z.infer<typeof roadmapSchema>;
