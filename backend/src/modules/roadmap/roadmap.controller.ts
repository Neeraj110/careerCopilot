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
  const { skill, level, targetGoal } = generateRoadmapSchema.parse(req.body);

  const result = await roadmapService.generateRoadmap(
    skill,
    level,
    targetGoal
  );

  res.status(200).json({ status: "success", data: result });
});