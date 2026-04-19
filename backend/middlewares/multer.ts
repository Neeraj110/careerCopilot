import fs from "node:fs";
import path from "node:path";
import type { Request } from "express";
import multer from "multer";
import type { FileFilterCallback } from "multer";

const allowedMimeTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const tempUploadDir = path.resolve(process.cwd(), "public", "temp");

const storage = multer.diskStorage({
  destination: (
    _req: Request,
    _file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void,
  ) => {
    fs.mkdirSync(tempUploadDir, { recursive: true });
    cb(null, tempUploadDir);
  },
  filename: (
    _req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void,
  ) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    cb(null, `${uniqueSuffix}-${sanitizedName}`);
  },
});

export const cvUpload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (
    _req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback,
  ) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      cb(new Error("Only PDF, DOC, and DOCX files are allowed"));
      return;
    }

    cb(null, true);
  },
});

export const uploadSingleCv = cvUpload.single("cv");
