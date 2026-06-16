import { Request, Response, NextFunction } from "express";
import * as documentService from "./document.service";
import { uploadDocumentSchema, getDocumentParamsSchema } from "./document.schema";
import { AppError } from "../../middlewares/errorHandler";
import { catchAsync } from "../../utils/catchAsync";

export const uploadDocument = catchAsync(async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { title } = uploadDocumentSchema.parse(req.body);
  const file = req.file;

  if (!file) {
    throw new AppError("File is required", 400);
  }

  const allowedMimes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ];

  if (!allowedMimes.includes(file.mimetype)) {
    throw new AppError("Only PDF, DOCX, and TXT files are supported", 400);
  }

  const document = await documentService.uploadDocument(
    (req.user as any).id,
    title,
    file
  );

  res.status(201).json({
    status: "success",
    message: "Document uploaded. Processing will continue in background.",
    data: document,
  });
});

export const getUserDocuments = catchAsync(async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = (req.user as any).id;
  const documents = await documentService.getUserDocuments(
    userId
  );
  res.status(200).json({ status: "success", data: documents });
});

export const getDocumentById = catchAsync(async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = getDocumentParamsSchema.parse(req.params);
  const document = await documentService.getDocumentById(
    (req.user as any).id,
    id
  );
  res.status(200).json({ status: "success", data: document });
});

export const deleteDocument = catchAsync(async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = getDocumentParamsSchema.parse(req.params);
  const result = await documentService.deleteDocument(
    (req.user as any).id,
    id
  );
  res.status(200).json({ status: "success", data: result });
});
