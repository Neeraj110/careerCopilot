import { Request, Response, NextFunction } from "express";
import * as documentService from "./document.service";
import { uploadDocumentSchema, getDocumentParamsSchema } from "./document.schema";
import { AppError } from "../../middlewares/errorHandler";

export const uploadDocument = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
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
      (req as any).user.id,
      title,
      file
    );

    res.status(201).json({
      status: "success",
      message: "Document uploaded. Processing will continue in background.",
      data: document,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserDocuments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const documents = await documentService.getUserDocuments(
      (req as any).user.id
    );
    res.status(200).json({ status: "success", data: documents });
  } catch (error) {
    next(error);
  }
};

export const getDocumentById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = getDocumentParamsSchema.parse(req.params);
    const document = await documentService.getDocumentById(
      (req as any).user.id,
      id
    );
    res.status(200).json({ status: "success", data: document });
  } catch (error) {
    next(error);
  }
};

export const deleteDocument = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = getDocumentParamsSchema.parse(req.params);
    const result = await documentService.deleteDocument(
      (req as any).user.id,
      id
    );
    res.status(200).json({ status: "success", data: result });
  } catch (error) {
    next(error);
  }
};
