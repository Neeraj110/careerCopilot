// roadmap.schema.ts
import { z } from "zod";

export const generateRoadmapSchema = z.object({
  skill: z.string().min(1, "Skill is required"),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  targetGoal: z.string().min(1, "Target goal is required"),
});