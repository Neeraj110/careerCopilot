import { api } from "../api";
import type { ApiResponse, RoadmapResult, SkillLevel } from "@/types";

export const roadmapApi = {
  generate: (data: {
    skill: string;
    level: SkillLevel;
    targetGoal: string;
  }) => api.post<ApiResponse<RoadmapResult>>("/roadmap/generate", data),
};
