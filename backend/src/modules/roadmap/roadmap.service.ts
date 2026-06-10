import { buildRoadmapPipeline } from "./agent/roadmap.agent";
import { AppError } from "../../middlewares/errorHandler";

const roadmapPipeline = buildRoadmapPipeline();

export const generateRoadmap = async (
  skill: string,
  level: "beginner" | "intermediate" | "advanced",
  targetGoal: string,
) => {
  const result = await roadmapPipeline.invoke({
    skill,
    level,
    targetGoal,
    searchQueries: [],
    rawResources: [],
    rankedResources: [],
    roadmap: null,
  });

  if (!result.roadmap) {
    throw new AppError("Roadmap generation failed", 500);
  }

  return {
    roadmap: result.roadmap,
    resources: result.rankedResources,
  };
};
