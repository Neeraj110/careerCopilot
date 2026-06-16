import { buildRoadmapPipeline } from "./agent/roadmap.agent";
import { AppError } from "../../middlewares/errorHandler";
import { prisma } from "../../infrastructure/prisma";

const roadmapPipeline = buildRoadmapPipeline();

export const generateRoadmap = async (
  userId: string,
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

  const savedRoadmap = await prisma.roadmap.create({
    data: {
      userId,
      title: skill,
      skill,
      level,
      targetGoal,
      roadmap: result.roadmap as any,
      resources: result.rankedResources as any,
    },
  });

  return {
    id: savedRoadmap.id,
    title: savedRoadmap.title,
    skill: savedRoadmap.skill,
    level: savedRoadmap.level,
    targetGoal: savedRoadmap.targetGoal,
    roadmap: savedRoadmap.roadmap,
    resources: savedRoadmap.resources,
    createdAt: savedRoadmap.createdAt,
  };
};

export const listRoadmaps = async (userId: string) => {
  return prisma.roadmap.findMany({
    where: { userId },
    select: {
      id: true,
      title: true,
      skill: true,
      level: true,
      targetGoal: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getRoadmap = async (userId: string, id: string) => {
  const roadmap = await prisma.roadmap.findFirst({
    where: { id, userId },
  });

  if (!roadmap) {
    throw new AppError("Roadmap not found", 404);
  }

  return {
    id: roadmap.id,
    title: roadmap.title,
    skill: roadmap.skill,
    level: roadmap.level,
    targetGoal: roadmap.targetGoal,
    roadmap: roadmap.roadmap,
    resources: roadmap.resources,
    createdAt: roadmap.createdAt,
  };
};
