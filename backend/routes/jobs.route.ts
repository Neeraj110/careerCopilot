import { Router } from "express";
import { authenticateTokens } from "../middlewares/twoTokenAuth.js";
import { jobController } from "../controllers/job.controller.js";
import type { AuthenticatedRequest } from "../types/auth.types.js";

const router = Router();

router.get("/matches", authenticateTokens, (req: AuthenticatedRequest, res) =>
  jobController.matches(req, res),
);
router.post(
  "/cover-letter",
  authenticateTokens,
  (req: AuthenticatedRequest, res) => jobController.coverLetter(req, res),
);

export default router;
