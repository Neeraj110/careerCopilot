import { api } from "../api";
import type { ApiResponse, RoadmapResult, SkillLevel, SavedRoadmap } from "@/types";

export const roadmapApi = {
  generate: (data: {
    skill: string;
    level: SkillLevel;
    targetGoal: string;
  }) => api.post<ApiResponse<RoadmapResult>>("/roadmap/generate", data, { timeout: 180000 }), // 3 min for AI pipeline

  list: () => api.get<ApiResponse<SavedRoadmap[]>>("/roadmap"),

  get: (id: string) => api.get<ApiResponse<RoadmapResult>>(`/roadmap/${id}`),
};
