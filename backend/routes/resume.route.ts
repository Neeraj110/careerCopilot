import { Router } from "express";
import multer from "multer";
import { authenticateTokens } from "../middlewares/twoTokenAuth.js";
import { resumeController } from "../controllers/resume.controller.js";
import type { AuthenticatedRequest } from "../types/auth.types.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/upload",
  authenticateTokens,
  upload.single("cv"),
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
