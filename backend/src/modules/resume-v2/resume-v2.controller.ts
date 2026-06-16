import { Request, Response, NextFunction } from "express";
import * as service from "./resume-v2.service";
import {
  uploadResumeSchema,
  analyzeResumeSchema,
  applyRewritesSchema,
} from "./resume-v2.schema";
import { catchAsync } from "../../utils/catchAsync";

export const list = catchAsync(async (req: Request, res: Response) => {
  const data = await service.listResumes(req.user!.id);
  res.json({ status: "success", data: { resumes: data } });
});

export const createFromDocument = catchAsync(async (req: Request, res: Response) => {
  const { documentId } = req.body;
  if (!documentId) {
    res.status(400).json({ status: "error", message: "documentId is required" });
    return;
  }

  const document = await service.createFromDocument(req.user!.id, documentId);
  res.status(201).json({ status: "success", data: { resume: document } });
});

export const get = catchAsync(async (req: Request, res: Response) => {
  const data = await service.getResume(req.user!.id, req.params.id as string);
  res.json({ status: "success", data });
});

export const getVersion = catchAsync(async (req: Request, res: Response) => {
  const data = await service.getVersion(req.user!.id, req.params.id as string, req.params.vid as string);
  res.json({ status: "success", data: { version: data } });
});

export const analyze = catchAsync(async (req: Request, res: Response) => {
  const { versionId, targetRole } = analyzeResumeSchema.parse(req.body);
  const analysis = await service.analyzeVersion(req.user!.id, req.params.id as string, versionId, targetRole);
  res.json({ status: "success", data: { analysis } });
});

export const analysisForVersion = catchAsync(async (req: Request, res: Response) => {
  const analysis = await service.getAnalysisForVersion(req.user!.id, req.params.id as string, req.params.vid as string);
  res.json({ status: "success", data: { analysis } });
});

export const rewrite = catchAsync(async (req: Request, res: Response) => {
  const { analysisId, rewriteIds } = applyRewritesSchema.parse(req.body);
  const data = await service.applyRewrites(req.user!.id, req.params.id as string, analysisId, rewriteIds);
  res.json({ status: "success", data });
});

export const remove = catchAsync(async (req: Request, res: Response) => {
  await service.deleteResume(req.user!.id, req.params.id as string);
  res.json({ status: "success", message: "Resume deleted" });
});

export const dashboard = catchAsync(async (req: Request, res: Response) => {
  const data = await service.getDashboard(req.user!.id);
  res.json({ status: "success", data });
});

export const insights = catchAsync(async (req: Request, res: Response) => {
  const data = await service.getInsights(req.user!.id);
  res.json({ status: "success", data });
});

export const allVersions = catchAsync(async (req: Request, res: Response) => {
  const data = await service.getAllVersions(req.user!.id);
  res.json({ status: "success", data });
});

export const history = catchAsync(async (req: Request, res: Response) => {
  const data = await service.getHistory(req.user!.id);
  res.json({ status: "success", data });
});

export const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const user = await service.updateProfile(req.user!.id, req.body);
  res.json({ status: "success", data: { user } });
});

export const diff = catchAsync(async (req: Request, res: Response) => {
  const { from, to, mode } = req.query;
  if (!from || !to) {
    res.status(400).json({ status: "error", message: "from and to version IDs are required" });
    return;
  }
  
  const data = await service.getDiff(req.user!.id, req.params.id as string, from as string, to as string, (mode as "words" | "lines") || "words");
  res.json({ status: "success", data });
});
