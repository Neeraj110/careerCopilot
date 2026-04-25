import { Router } from "express";
import { authenticateTokens } from "../middlewares/twoTokenAuth.js";
import { aiController } from "../controllers/ai.controller.js";
import type { AuthenticatedRequest } from "../types/auth.types.js";

const router = Router();

router.post("/chat", authenticateTokens, (req: AuthenticatedRequest, res) =>
  aiController.chat(req, res),
);

export default router;
