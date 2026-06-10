import { Request, Response, NextFunction } from "express";
import * as resumeService from "./resume.service";
import {
  atsCheckSchema,
  jdMatchSchema,
  improveResumeSchema,
} from "./resume.schema";
import { catchAsync } from "../../utils/catchAsync";

export const checkATS = catchAsync(async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { documentId } = atsCheckSchema.parse(req.body);
  const result = await resumeService.checkATS(req.user!.id, documentId);
  res.status(200).json({ status: "success", data: result });
});

export const jdMatch = catchAsync(async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { documentId, jd } = jdMatchSchema.parse(req.body);
  const result = await resumeService.jdMatch(req.user!.id, documentId, jd);
  res.status(200).json({ status: "success", data: result });
});

export const improveResume = catchAsync(async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { documentId, jdText } = improveResumeSchema.parse(req.body);
  const result = await resumeService.improveResume(
    req.user!.id,
    documentId,
    jdText,
  );
  res.status(200).json({ status: "success", data: result });
});
