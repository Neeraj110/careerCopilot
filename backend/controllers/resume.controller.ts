import type { Response } from "express";
import {
  alignRequestSchema,
  atsRequestSchema,
} from "../schemas/resume.schemas.js";
import { resumeService } from "../services/resume.service.js";
import type { AuthenticatedRequest } from "../types/auth.types.js";

class ResumeController {
  async upload(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "PDF file is required" });
      }

      const result = await resumeService.uploadCv(req.user.id, req.file);
      return res.json(result);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to upload CV";
      return res.status(500).json({ message });
    }
  }

  async atsScore(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const parsedBody = atsRequestSchema.safeParse(req.body);
      if (!parsedBody.success) {
        return res.status(400).json({ message: "Invalid request body" });
      }

      const result = await resumeService.getAtsScore(
        req.user.id,
        parsedBody.data.jobDescription,
      );
      return res.json(result);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to generate ATS score";
      return res.status(500).json({ message });
    }
  }

  async align(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const parsedBody = alignRequestSchema.safeParse(req.body);
      if (!parsedBody.success) {
        return res.status(400).json({ message: "Invalid request body" });
      }

      const result = await resumeService.getAlignment(
        req.user.id,
        parsedBody.data.jobDescription,
      );
      return res.json(result);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to align resume";
      return res.status(500).json({ message });
    }
  }
}

export const resumeController = new ResumeController();
