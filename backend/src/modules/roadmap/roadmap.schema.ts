// roadmap.schema.ts
import { z } from "zod";

export const generateRoadmapSchema = z.object({
  skill: z.string().trim().min(1, "Skill is required").max(200),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  targetGoal: z.string().trim().min(1, "Target goal is required").max(2_000),
});