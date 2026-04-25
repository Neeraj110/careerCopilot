import type { Response } from "express";
import { coverLetterSchema } from "../schemas/jobs.schemas.js";
import { jobService } from "../services/job.service.js";
import type { AuthenticatedRequest } from "../types/auth.types.js";

class JobController {
  async matches(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 5;

      const result = await jobService.getMatches(req.user.id, page, limit);
      return res.json(result);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch job matches";
      const statusCode = message === "Please upload your CV first" ? 400 : 500;
      return res.status(statusCode).json({ message });
    }
  }

  async getJobById(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const { id } = req.params;
      if (!id || typeof id !== "string") {
        return res.status(400).json({ message: "Valid Job ID is required" });
      }
      const result = await jobService.getJobById(req.user.id, id);
      return res.json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Job not found";
      const statusCode = message === "Job not found" ? 404 : 500;
      return res.status(statusCode).json({ message });
    }
  }

  async getJobInsights(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const { id } = req.params;
      if (!id || typeof id !== "string") {
        return res.status(400).json({ message: "Valid Job ID is required" });
      }
      const result = await jobService.getJobInsights(req.user.id, id);
      return res.json(result);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to generate insights";
      return res.status(500).json({ message });
    }
  }

  async coverLetter(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const parsedBody = coverLetterSchema.safeParse(req.body);
      if (!parsedBody.success) {
        return res.status(400).json({ message: "Invalid request body" });
      }

      const result = await jobService.generateCoverLetter(
        req.user.id,
        parsedBody.data.jobId,
      );
      return res.json(result);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to generate cover letter";
      return res.status(500).json({ message });
    }
  }
}

export const jobController = new JobController();
