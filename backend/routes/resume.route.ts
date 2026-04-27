import { Router } from "express";
import { uploadSingleCv } from "../middlewares/multer.js";
import { authenticateTokens } from "../middlewares/twoTokenAuth.js";
import { resumeController } from "../controllers/resume.controller.js";
import type { AuthenticatedRequest } from "../types/auth.types.js";

const router = Router();

router.get("/location", authenticateTokens, (req: AuthenticatedRequest, res) =>
  resumeController.detectLocation(req, res),
);

router.get("/status", authenticateTokens, (req: AuthenticatedRequest, res) =>
  resumeController.status(req, res),
);
router.post("/select", authenticateTokens, (req: AuthenticatedRequest, res) =>
  resumeController.select(req, res),
);
router.post(
  "/upload",
  authenticateTokens,
  uploadSingleCv,
  (req: AuthenticatedRequest, res) => resumeController.upload(req, res),
);
router.post(
  "/ats-score",
  authenticateTokens,
  (req: AuthenticatedRequest, res) => resumeController.atsScore(req, res),
);
router.post("/align", authenticateTokens, (req: AuthenticatedRequest, res) =>
  resumeController.align(req, res),
);

export default router;
