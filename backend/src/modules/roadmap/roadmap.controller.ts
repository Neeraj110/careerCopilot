// roadmap.controller.ts
import { Request, Response, NextFunction } from "express";
import * as roadmapService from "./roadmap.service";
import { generateRoadmapSchema } from "./roadmap.schema";
import { catchAsync } from "../../utils/catchAsync";

export const generateRoadmap = catchAsync(async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = (req.user as any).id;
  const { skill, level, targetGoal } = generateRoadmapSchema.parse(req.body);

  const result = await roadmapService.generateRoadmap(
    userId,
    skill,
    level,
    targetGoal
  );

  res.status(200).json({ status: "success", data: result });
});

export const listRoadmaps = catchAsync(async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = (req.user as any).id;
  const result = await roadmapService.listRoadmaps(userId);
  res.status(200).json({ status: "success", data: result });
});

export const getRoadmap = catchAsync(async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = (req.user as any).id;
  const id = req.params.id as string;
  const result = await roadmapService.getRoadmap(userId, id);
  res.status(200).json({ status: "success", data: result });
});